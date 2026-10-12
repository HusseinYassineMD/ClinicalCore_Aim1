#!/usr/bin/env python3
"""Aggregate GeneScreen REDCap registry export for dashboard YTD recruitment."""

from __future__ import annotations

import csv
import json
from collections import Counter
from datetime import datetime
from pathlib import Path

from redcap_csv_utils import parse_timestamp

ROOT = Path(__file__).resolve().parent.parent
REDCAP_DIR = ROOT / "data" / "redcap"
OUTPUT = ROOT / "src/data/geneScreenYtd.json"
PKG_PATH = ROOT / "src/data/rpprDataPackage.json"


def load_reporting_window() -> tuple[datetime, datetime, str]:
    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    ytd = pkg["reportingPeriodSummary"]
    start = datetime.fromisoformat(ytd["startDate"])
    end = datetime.fromisoformat(f"{ytd['endDate']}T23:59:59")
    return start, end, ytd["label"]


def latest_genescreen_csv() -> Path:
    matches = sorted(REDCAP_DIR.glob("USCGeneScreenRegistr*.csv"))
    if not matches:
        raise FileNotFoundError(f"No GeneScreen CSV in {REDCAP_DIR}")
    return max(matches, key=lambda p: p.stat().st_mtime)


def in_window(ts: datetime | None, start: datetime, end: datetime) -> bool:
    if ts is None:
        return False
    return start <= ts <= end


def is_complete(row: dict[str, str]) -> bool:
    return (row.get("Complete?") or "").strip() == "Complete"


def ethnicity_bucket(label: str) -> str:
    text = (label or "").strip().lower()
    if not text:
        return "Unknown"
    if "hispanic" in text or "latino" in text:
        return "Hispanic"
    if "black" in text or "african american" in text:
        return "Black"
    if "asian" in text and "white" not in text and "hispanic" not in text:
        return "Asian"
    if text == "white" or (text.startswith("white") and "," not in text):
        return "White"
    if "white" in text and "hispanic" not in text and "black" not in text and "asian" not in text:
        return "White"
    return "Other"


def apoe4_carrier(genotype: str) -> bool:
    g = (genotype or "").lower()
    return "ε4" in g or "e4" in g or "/4" in g or "4/" in g


def chart_rows(counter: Counter[str], order: list[str]) -> list[dict[str, int | str]]:
    return [{"label": label, "count": counter.get(label, 0)} for label in order if counter.get(label, 0)]


def main() -> None:
    start, end, label = load_reporting_window()
    source = latest_genescreen_csv()
    with source.open(newline="", encoding="utf-8-sig") as handle:
        rows = [r for r in csv.DictReader(handle) if is_complete(r)]

    consent_ytd = [
        r
        for r in rows
        if in_window(parse_timestamp(r.get("Consent Date")), start, end)
    ]
    membership_ytd = [
        r
        for r in rows
        if in_window(parse_timestamp(r.get("Membership Timestamp")), start, end)
    ]

    eth = Counter(ethnicity_bucket(r.get("Ethnicity/Race", "")) for r in consent_ytd)
    sex = Counter((r.get("Sex ") or r.get("Sex") or "").strip() or "Unknown" for r in consent_ytd)
    carriers = sum(1 for r in consent_ytd if apoe4_carrier(r.get("Genotype", "")))
    non_carriers = len(consent_ytd) - carriers

    sex_all = Counter(
        (r.get("Sex ") or r.get("Sex") or "").strip() or "Unknown" for r in rows
    )
    apoe4_all = sum(1 for r in rows if apoe4_carrier(r.get("Genotype", "")))

    payload = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "reportingPeriodLabel": label,
        "startDate": start.date().isoformat(),
        "endDate": end.date().isoformat(),
        "sourceFile": source.name,
        "newMembersByConsentDate": len(consent_ytd),
        "onlineEnrollmentsByMembershipTimestamp": len(membership_ytd),
        "ethnicity": chart_rows(
            eth,
            ["Hispanic", "White", "Black", "Asian", "Other"],
        ),
        "gender": chart_rows(sex, ["Male", "Female"]),
        "apoe4": [
            {"label": "APOE4 carrier", "count": carriers},
            {"label": "Non-carrier", "count": non_carriers},
        ],
        "registrySnapshot": {
            "membersComplete": len(rows),
            "males": sex_all.get("Male", 0),
            "females": sex_all.get("Female", 0),
            "apoe4Carriers": apoe4_all,
            "note": "All Complete? records in source CSV (cumulative REDCap export, not RPPR 668).",
        },
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    print(
        f"  Registry complete n={len(rows)} · consent YTD n={len(consent_ytd)} · "
        f"membership YTD n={len(membership_ytd)} · {source.name}",
    )


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build NIH Inclusion Enrollment–style ethnicity-first tables from GeneScreen REDCap.

GeneScreen REDCap stores a combined Ethnicity/Race multi-select using NACC/NIH category
names (Hispanic or Latino, White, Asian, Black or African American, American Indian or
Alaska Native, Native Hawaiian or Other Pacific Islander, Other). This script maps those
tokens onto ethnicity-first NIH Inclusion Enrollment cells for dashboard reporting.

No live REDCap API is used — only the labeled CSV export in data/redcap/.
"""

from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REDCAP_DIR = ROOT / "data" / "redcap"
PKG_PATH = ROOT / "src/data/rpprDataPackage.json"
OUTPUT = ROOT / "src/data/geneScreenInclusionEnrollment.json"

RACE_ORDER = [
    "American Indian/Alaska Native",
    "Asian",
    "Native Hawaiian or Other Pacific Islander",
    "Black or African American",
    "White",
    "More than One Race",
    "Unknown or Not Reported",
]
ETHNICITY_ORDER = [
    "Not Hispanic or Latino",
    "Hispanic or Latino",
    "Unknown/Not Reported Ethnicity",
]
SEX_ORDER = ["Female", "Male", "Unknown/Not Reported"]

TOKEN_TO_RACE = {
    "american indian or alaska native": "American Indian/Alaska Native",
    "asian": "Asian",
    "native hawaiian or other pacific islander": "Native Hawaiian or Other Pacific Islander",
    "black or african american": "Black or African American",
    "white": "White",
}


def load_reporting_window() -> tuple[date, date, str]:
    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    ytd = pkg["reportingPeriodSummary"]
    return (
        date.fromisoformat(ytd["startDate"]),
        date.fromisoformat(ytd["endDate"]),
        ytd["label"],
    )


def latest_genescreen_csv() -> Path:
    matches = sorted(REDCAP_DIR.glob("USCGeneScreenRegistr*.csv"))
    if not matches:
        raise FileNotFoundError(f"No GeneScreen CSV in {REDCAP_DIR}")
    return max(matches, key=lambda p: p.stat().st_mtime)


def parse_timestamp(value: str | None) -> datetime | None:
    text = (value or "").strip()
    if not text:
        return None
    for fmt, n in (
        ("%Y-%m-%d %H:%M:%S", 19),
        ("%Y-%m-%d %H:%M", 16),
        ("%Y-%m-%d", 10),
    ):
        try:
            return datetime.strptime(text[:n], fmt)
        except ValueError:
            continue
    return None


def empty_cells() -> dict:
    return {
        race: {
            eth: {sex: 0 for sex in SEX_ORDER} for eth in ETHNICITY_ORDER
        }
        for race in RACE_ORDER
    }


def parse_tokens(raw: str) -> list[str]:
    return [part.strip() for part in (raw or "").split(",") if part.strip()]


def is_hispanic_token(token: str) -> bool:
    lower = token.lower()
    return lower == "hispanic or latino" or (
        "hispanic" in lower and "latino" in lower
    )


def classify_row(row: dict[str, str]) -> tuple[str, str, str]:
    raw = (row.get("Ethnicity/Race") or "").strip()
    tokens = parse_tokens(raw)
    lower_tokens = [token.lower() for token in tokens]

    if not tokens:
        ethnicity = "Unknown/Not Reported Ethnicity"
    elif any(is_hispanic_token(token) for token in tokens):
        ethnicity = "Hispanic or Latino"
    else:
        ethnicity = "Not Hispanic or Latino"

    races: list[str] = []
    for token in lower_tokens:
        if is_hispanic_token(token):
            continue
        if token == "other":
            continue
        mapped = TOKEN_TO_RACE.get(token)
        if mapped and mapped not in races:
            races.append(mapped)

    if len(races) > 1:
        race = "More than One Race"
    elif len(races) == 1:
        race = races[0]
    else:
        race = "Unknown or Not Reported"

    sex_raw = (row.get("Sex ") or row.get("Sex") or "").strip()
    if sex_raw == "Female":
        sex = "Female"
    elif sex_raw == "Male":
        sex = "Male"
    else:
        sex = "Unknown/Not Reported"

    return ethnicity, race, sex


def build_table(rows: list[dict[str, str]]) -> dict:
    cells = empty_cells()
    raw_values = Counter(
        (row.get("Ethnicity/Race") or "").strip() or "(blank)" for row in rows
    )
    for row in rows:
        ethnicity, race, sex = classify_row(row)
        cells[race][ethnicity][sex] += 1

    total = sum(
        cells[race][ethnicity][sex]
        for race in RACE_ORDER
        for ethnicity in ETHNICITY_ORDER
        for sex in SEX_ORDER
    )
    return {
        "total": total,
        "cells": cells,
        "rawEthnicityRaceValues": [
            {"label": label, "count": count}
            for label, count in raw_values.most_common()
        ],
    }


def main() -> None:
    start, end, label = load_reporting_window()
    source = latest_genescreen_csv()
    with source.open(newline="", encoding="utf-8-sig") as handle:
        all_rows = list(csv.DictReader(handle))
    complete = [
        row for row in all_rows if (row.get("Complete?") or "").strip() == "Complete"
    ]
    consent_ytd = [
        row
        for row in complete
        if (ts := parse_timestamp(row.get("Consent Date"))) is not None
        and start <= ts.date() <= end
    ]

    cumulative = build_table(complete)
    ytd = build_table(consent_ytd)

    payload = {
        "meta": {
            "program": "GeneScreen registry · USC GeneScreen REDCap",
            "title": "GeneScreen Inclusion Enrollment (ethnicity first)",
            "sourceFile": source.name,
            "sourcePath": f"data/redcap/{source.name}",
            "naccNamingNote": (
                "REDCap field Ethnicity/Race uses NACC/NIH category names "
                "(Hispanic or Latino, White, Asian, Black or African American, "
                "American Indian or Alaska Native, Native Hawaiian or Other Pacific "
                "Islander, Other). Hispanic or Latino is treated as ethnicity; remaining "
                "tokens map to NIH race rows; multiple race tokens → More than One Race; "
                "Hispanic-only or Other-only with no NIH race → Unknown or Not Reported race."
            ),
            "accessNote": (
                "No live REDCap API access in this workspace. Tables are built from the "
                "labeled CSV export in data/redcap/. Drop a newer USCGeneScreenRegistr*.csv "
                "and re-run npm run sync:redcap to refresh."
            ),
            "reportingPeriodLabel": label,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "exportStopsBeforeEacLock": end.isoformat() > "2026-10-07",
        },
        "raceCategories": RACE_ORDER,
        "ethnicityCategories": ETHNICITY_ORDER,
        "sexCategories": SEX_ORDER,
        "cumulativeComplete": {
            "label": "Cumulative Complete? members",
            "asOfDate": "2026-10-07",
            "provenance": "span",
            "definition": "All Complete? records in the GeneScreen REDCap export.",
            **cumulative,
        },
        "consentYtd": {
            "label": f"Consent date in {label}",
            "asOfDate": end.isoformat(),
            "provenance": "span",
            "definition": (
                "Complete? members with Consent Date in the dashboard YTD window. "
                "Export stops October 7, 2026 (before the October 16 EAC lock)."
            ),
            **ytd,
        },
    }

    assert cumulative["total"] == len(complete)
    assert ytd["total"] == len(consent_ytd)

    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} · complete {cumulative['total']} · "
        f"consent YTD {ytd['total']} · {source.name}"
    )


if __name__ == "__main__":
    main()

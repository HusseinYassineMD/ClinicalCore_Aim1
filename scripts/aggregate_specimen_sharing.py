#!/usr/bin/env python3
"""Aggregate REDCap specimen request CSV exports for the dashboard."""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Callable

from redcap_csv_utils import parse_timestamp, read_redcap_csv

ROOT = Path(__file__).resolve().parent.parent
REDCAP_DIR = ROOT / "data" / "redcap"
OUTPUT = ROOT / "src/data/redcapSpecimenSharing.json"
PKG_PATH = ROOT / "src/data/rpprDataPackage.json"

GRANT_YEAR_START = datetime(2025, 7, 1)
GRANT_YEAR_END = datetime(2026, 6, 30, 23, 59, 59)

INT_EXT_LABELS = {
    "1": "Internal",
    "2": "External",
}

PLASMA_FIELDS = ("plasma_nci_req", "plasma_mci_req", "plasma_ad_req")
PLASMA_LABELS = {
    "plasma_nci_req": "NCI",
    "plasma_mci_req": "MCI",
    "plasma_ad_req": "AD",
}


def load_reporting_window() -> tuple[datetime, datetime, str]:
    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    ytd = pkg["reportingPeriodSummary"]
    start = datetime.fromisoformat(ytd["startDate"])
    end = datetime.fromisoformat(f"{ytd['endDate']}T23:59:59")
    return start, end, ytd["label"]


REPORTING_START, REPORTING_END, REPORTING_LABEL = load_reporting_window()


def in_reporting_period(ts: datetime | None) -> bool:
    if ts is None:
        return False
    return REPORTING_START <= ts <= REPORTING_END


def in_grant_year(ts: datetime | None) -> bool:
    if ts is None:
        return False
    return GRANT_YEAR_START <= ts <= GRANT_YEAR_END


def is_fulfilled(row: dict[str, str]) -> bool:
    if row.get("request_status") == "4":
        return True
    if row.get("tracking_complete") == "2":
        return True
    if row.get("trackingComplete") == "Complete":
        return True
    if row.get("closed_date") or row.get("sent_date"):
        return True
    return False


def plasma_aliquots(row: dict[str, str]) -> int:
    return sum(int(row.get(field) or 0) for field in PLASMA_FIELDS)


def received_rows(
    rows: list[dict[str, str]], period_filter: Callable[[datetime | None], bool]
) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    for row in rows:
        if row.get("request_complete") != "2":
            continue
        ts = parse_timestamp(row.get("request_timestamp"))
        if period_filter(ts):
            result.append(row)
    return result


def plasma_summary(rows: list[dict[str, str]]) -> dict:
    plasma_rows = [row for row in rows if plasma_aliquots(row) > 0]
    return {
        "requestsWithPlasma": len(plasma_rows),
        "requestsFulfilled": sum(1 for row in plasma_rows if is_fulfilled(row)),
        "aliquotsRequested": sum(plasma_aliquots(row) for row in rows),
        "byDiagnosis": [
            {
                "label": PLASMA_LABELS[field],
                "count": sum(int(row.get(field) or 0) for row in rows),
            }
            for field in PLASMA_FIELDS
        ],
    }


def aggregate_biofluids(rows: list[dict[str, str]], period_filter: Callable) -> dict:
    period_rows = received_rows(rows, period_filter)
    fulfilled_count = sum(1 for row in period_rows if is_fulfilled(row))

    requestor_counts = Counter(
        INT_EXT_LABELS.get(row.get("int_ext", ""), "Unknown")
        for row in period_rows
    )
    requestor_types = [
        {"label": label, "count": count}
        for label, count in sorted(requestor_counts.items())
        if count > 0 and label != "Unknown"
    ]

    return {
        "requestsReceived": len(period_rows),
        "requestsFulfilled": fulfilled_count,
        "requestorTypes": requestor_types,
        "plasma": plasma_summary(period_rows),
    }


def aggregate_neurobank(rows: list[dict[str, str]], period_filter: Callable) -> dict:
    period_rows = received_rows(rows, period_filter)
    fulfilled_count = sum(1 for row in period_rows if is_fulfilled(row))

    requestor_counts = Counter(
        INT_EXT_LABELS.get(row.get("int_ext", ""), "Unknown")
        for row in period_rows
    )
    requestor_types = [
        {"label": label, "count": count}
        for label, count in sorted(requestor_counts.items())
        if count > 0 and label != "Unknown"
    ]

    return {
        "requestsReceived": len(period_rows),
        "requestsFulfilled": fulfilled_count,
        "requestorTypes": requestor_types,
    }


def latest_csv(*patterns: str) -> Path:
    matches: list[Path] = []
    for pattern in patterns:
        matches.extend(REDCAP_DIR.glob(pattern))
    if not matches:
        raise FileNotFoundError(f"No CSV files matching {patterns} in {REDCAP_DIR}")
    return max(matches, key=lambda p: p.stat().st_mtime)


def main() -> None:
    bio_csv = latest_csv("USCADRCBiofluidReque*.csv")
    neuro_csv = latest_csv("USCADRCNeurobankRequ*.csv")
    bio_rows = read_redcap_csv(bio_csv)
    neuro_rows = read_redcap_csv(neuro_csv)

    payload = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "reportingPeriodLabel": REPORTING_LABEL,
        "grantYearLabel": "7/1/2025 – 6/30/2026",
        "sources": {
            "biofluids": bio_csv.name,
            "neurobank": neuro_csv.name,
        },
        "biofluids": {
            "reportingPeriod": aggregate_biofluids(bio_rows, in_reporting_period),
            "grantYear": aggregate_biofluids(bio_rows, in_grant_year),
        },
        "neurobank": {
            "reportingPeriod": aggregate_neurobank(neuro_rows, in_reporting_period),
            "grantYear": aggregate_neurobank(neuro_rows, in_grant_year),
        },
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")

    for window, key in [
        ("Reporting period", "reportingPeriod"),
        ("Grant year", "grantYear"),
    ]:
        bio = payload["biofluids"][key]
        plasma = bio["plasma"]
        neuro = payload["neurobank"][key]
        print(
            f"\n{window}:",
            f"Biofluids {bio['requestsReceived']} received / {bio['requestsFulfilled']} fulfilled;",
            f"Plasma {plasma['requestsWithPlasma']} reqs / {plasma['aliquotsRequested']} aliquots;",
            f"Neurobank {neuro['requestsReceived']} received / {neuro['requestsFulfilled']} fulfilled",
        )


if __name__ == "__main__":
    main()

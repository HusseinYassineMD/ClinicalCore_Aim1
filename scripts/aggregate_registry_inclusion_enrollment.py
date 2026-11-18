#!/usr/bin/env python3
"""Ethnicity-first NIH Inclusion-style tables for the EAC YTD window only.

Exactly three cohorts (1/1/2026 – 10/16/2026):
  1. UDS — unique participants with a UDS visit in the window
  2. GeneScreen — Complete? members with Consent Date in the window
  3. BRS autopsy — Xinhui person list as of 10/16/2026 (N=225)
"""

from __future__ import annotations

import csv
import json
from datetime import date, datetime, timezone
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parent.parent
UDS_LONG_PATH = (
    ROOT
    / "data"
    / "rppr-data-package"
    / "USC ADRC UDS Harmonized"
    / "UDS_longitudinal_harmonized.csv"
)
SUBJECT_PATH = (
    ROOT
    / "data"
    / "JamesDataPacket-November-6"
    / "USC ADRC UDS Harmonized"
    / "ADRC_subject_current_harmonized.csv"
)
GENESCREEN_DIR = ROOT / "data" / "redcap"
BRS_LIST = (
    ROOT
    / "data"
    / "reference"
    / "xinhui-wang-2026-11-13"
    / "MAP BRS UDS list (N=225, active+min.cont as of 2026-1016) v2026-1113.xlsx"
)
PKG_PATH = ROOT / "src/data/rpprDataPackage.json"
OUTPUT = ROOT / "src/data/registryInclusionEnrollment.json"

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

NIH_RACES = {
    "american indian or alaska native": "American Indian/Alaska Native",
    "asian": "Asian",
    "native hawaiian or other pacific islander": "Native Hawaiian or Other Pacific Islander",
    "native hawaiian or pacific islander": "Native Hawaiian or Other Pacific Islander",
    "black or african american": "Black or African American",
    "white": "White",
}

GS_TOKEN_TO_RACE = dict(NIH_RACES)


def empty_cells() -> dict:
    return {
        race: {eth: {sex: 0 for sex in SEX_ORDER} for eth in ETHNICITY_ORDER}
        for race in RACE_ORDER
    }


def load_window() -> tuple[date, date, str]:
    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    ytd = pkg["reportingPeriodSummary"]
    return (
        date.fromisoformat(ytd["startDate"]),
        date.fromisoformat(ytd["endDate"]),
        ytd["label"],
    )


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


def sex_from_james(row: dict[str, str]) -> str:
    raw = (row.get("der_current_sex") or row.get("sex") or row.get("birthsex") or "").strip()
    if raw in {"1", "Male", "male", "M"}:
        return "Male"
    if raw in {"2", "Female", "female", "F"}:
        return "Female"
    return "Unknown/Not Reported"


def sex_from_brs_code(value) -> str:
    try:
        code = int(value)
    except (TypeError, ValueError):
        return "Unknown/Not Reported"
    if code == 1:
        return "Male"
    if code == 2:
        return "Female"
    return "Unknown/Not Reported"


def ethnicity_from_james(row: dict[str, str]) -> str:
    flag = (row.get("der_current_re_hispanic_latino") or "").strip().upper()
    if flag == "TRUE":
        return "Hispanic or Latino"
    if flag == "FALSE":
        return "Not Hispanic or Latino"
    summary = (row.get("der_current_race_ethnicity_summary") or "").lower()
    if "hispanic" in summary or "latino" in summary:
        return "Hispanic or Latino"
    if not (row.get("der_current_race_ethnicity_summary") or "").strip():
        return "Unknown/Not Reported Ethnicity"
    return "Not Hispanic or Latino"


def race_parts(summary: str) -> list[str]:
    parts = [part.strip() for part in (summary or "").split(";") if part.strip()]
    races: list[str] = []
    for part in parts:
        lower = part.lower()
        if lower in {
            "hispanic or latino",
            "don't know",
            "dont know",
            "other race (legacy category)",
            "unknown",
        }:
            continue
        mapped = NIH_RACES.get(lower)
        if mapped and mapped not in races:
            races.append(mapped)
        elif "pacific" in lower or "hawaiian" in lower:
            if "Native Hawaiian or Other Pacific Islander" not in races:
                races.append("Native Hawaiian or Other Pacific Islander")
        elif "american indian" in lower or "alaska" in lower:
            if "American Indian/Alaska Native" not in races:
                races.append("American Indian/Alaska Native")
        elif "black" in lower or "african" in lower:
            if "Black or African American" not in races:
                races.append("Black or African American")
        elif lower == "white":
            if "White" not in races:
                races.append("White")
        elif lower == "asian":
            if "Asian" not in races:
                races.append("Asian")
    return races


def race_from_james(row: dict[str, str]) -> str:
    summary = (row.get("der_current_race_ethnicity_summary") or "").strip()
    more = (row.get("der_usc_more_than_one_race") or "").strip().upper()
    parts = race_parts(summary)
    if more == "TRUE" or len(parts) > 1:
        return "More than One Race"
    if len(parts) == 1:
        return parts[0]
    return "Unknown or Not Reported"


def classify_james(row: dict[str, str], sex_override: str | None = None) -> tuple[str, str, str]:
    return (
        ethnicity_from_james(row),
        race_from_james(row),
        sex_override or sex_from_james(row),
    )


def is_hispanic_token(token: str) -> bool:
    lower = token.lower()
    return lower == "hispanic or latino" or (
        "hispanic" in lower and "latino" in lower
    )


def classify_genescreen(row: dict[str, str]) -> tuple[str, str, str]:
    raw = (row.get("Ethnicity/Race") or "").strip()
    tokens = [part.strip() for part in raw.split(",") if part.strip()]
    if not tokens:
        ethnicity = "Unknown/Not Reported Ethnicity"
    elif any(is_hispanic_token(token) for token in tokens):
        ethnicity = "Hispanic or Latino"
    else:
        ethnicity = "Not Hispanic or Latino"

    races: list[str] = []
    for token in tokens:
        lower = token.lower()
        if is_hispanic_token(token) or lower == "other":
            continue
        mapped = GS_TOKEN_TO_RACE.get(lower)
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


def build_cells(rows: list[tuple[str, str, str]]) -> dict:
    cells = empty_cells()
    for ethnicity, race, sex in rows:
        cells[race][ethnicity][sex] += 1
    total = sum(
        cells[race][ethnicity][sex]
        for race in RACE_ORDER
        for ethnicity in ETHNICITY_ORDER
        for sex in SEX_ORDER
    )
    return {"total": total, "cells": cells}


def ethnicity_totals(cells: dict) -> dict[str, int]:
    return {
        eth: sum(cells[race][eth][sex] for race in RACE_ORDER for sex in SEX_ORDER)
        for eth in ETHNICITY_ORDER
    }


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def subject_indexes(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    by: dict[str, dict[str, str]] = {}
    for row in rows:
        for key in ("ptid", "naccid"):
            value = (row.get(key) or "").strip()
            if not value:
                continue
            by[value] = row
            stripped = value.lstrip("0") or "0"
            by[stripped] = row
    return by


def visit_participant_id(row: dict[str, str]) -> str:
    return (
        (row.get("naccid") or "").strip()
        or (row.get("adcid") or "").strip()
        or (row.get("ptid") or "").strip()
        or (row.get("uds_id") or "").strip()
    )


def latest_genescreen_csv() -> Path:
    matches = sorted(GENESCREEN_DIR.glob("USCGeneScreenRegistr*.csv"))
    if not matches:
        raise FileNotFoundError(f"No GeneScreen CSV in {GENESCREEN_DIR}")
    return max(matches, key=lambda path: path.stat().st_mtime)


def read_brs_list() -> list[dict]:
    wb = load_workbook(BRS_LIST, data_only=True)
    ws = wb["data"]
    rows: list[dict] = []
    for r in range(2, ws.max_row + 1):
        uds_id = ws.cell(r, 1).value
        if uds_id is None:
            continue
        rows.append(
            {
                "uds_id": str(uds_id).strip(),
                "sex": ws.cell(r, 3).value,
            }
        )
    return rows


def lookup_subject(
    by_id: dict[str, dict[str, str]], key: str
) -> dict[str, str] | None:
    if not key:
        return None
    return by_id.get(key) or by_id.get(key.lstrip("0") or "0")


def main() -> None:
    start, end, label = load_window()
    subjects = read_csv(SUBJECT_PATH)
    by_id = subject_indexes(subjects)

    # 1) UDS — unique participants with a visit in the YTD window
    uds_long = read_csv(UDS_LONG_PATH)
    ytd_ids: set[str] = set()
    for row in uds_long:
        ts = parse_timestamp(row.get("visit_date") or row.get("visitdate"))
        if ts is None or not (start <= ts.date() <= end):
            continue
        pid = visit_participant_id(row)
        if pid:
            ytd_ids.add(pid)

    uds_rows: list[tuple[str, str, str]] = []
    uds_missing = 0
    for pid in sorted(ytd_ids):
        subject = lookup_subject(by_id, pid)
        if subject is None:
            uds_missing += 1
            continue
        uds_rows.append(classify_james(subject))
    uds_table = build_cells(uds_rows)

    # 2) GeneScreen — Consent Date in the YTD window
    gs_path = latest_genescreen_csv()
    gs_all = read_csv(gs_path)
    gs_ytd = [
        row
        for row in gs_all
        if (row.get("Complete?") or "").strip() == "Complete"
        and (ts := parse_timestamp(row.get("Consent Date"))) is not None
        and start <= ts.date() <= end
    ]
    gs_table = build_cells([classify_genescreen(row) for row in gs_ytd])

    # 3) BRS autopsy — enrollment as of window end (Xinhui N=225 list)
    brs_list = read_brs_list()
    brs_rows: list[tuple[str, str, str]] = []
    brs_missing = 0
    for person in brs_list:
        subject = lookup_subject(by_id, person["uds_id"])
        if subject is None:
            brs_missing += 1
            continue
        brs_rows.append(
            classify_james(subject, sex_override=sex_from_brs_code(person["sex"]))
        )
    brs_table = build_cells(brs_rows)

    assert uds_table["total"] == len(uds_rows) == 310
    assert gs_table["total"] == len(gs_ytd) == 55
    assert brs_table["total"] == len(brs_rows) == 225
    assert uds_missing == 0
    assert brs_missing == 0

    payload = {
        "meta": {
            "title": "Registry Inclusion Enrollment (ethnicity first)",
            "layoutNote": (
                "NIH-style ethnicity-first layout for the dashboard reporting window only: "
                "UDS visits, GeneScreen consents, and BRS autopsy enrollment."
            ),
            "reportingPeriodLabel": label,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "lastUpdated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "raceCategories": RACE_ORDER,
            "ethnicityCategories": ETHNICITY_ORDER,
            "sexCategories": SEX_ORDER,
        },
        "udsYtd": {
            "label": "UDS · participants with a visit",
            "program": "Clinical Core · UDS",
            "asOfDate": end.isoformat(),
            "provenance": "ytd",
            "source": (
                "James Wang · UDS_longitudinal_harmonized.csv visit_date in window · "
                "race/ethnicity/sex from ADRC_subject_current_harmonized"
            ),
            "definition": (
                f"Unique participants with a UDS visit in {label}."
            ),
            "ethnicityTotals": ethnicity_totals(uds_table["cells"]),
            **uds_table,
        },
        "geneScreenYtd": {
            "label": "GeneScreen · new consents",
            "program": "GeneScreen registry",
            "asOfDate": end.isoformat(),
            "provenance": "span",
            "source": f"USC GeneScreen REDCap · {gs_path.name} · Consent Date",
            "definition": (
                f"Complete? members with Consent Date in {label}. "
                "Export stops October 7, 2026."
            ),
            "ethnicityTotals": ethnicity_totals(gs_table["cells"]),
            **gs_table,
        },
        "brsAutopsy": {
            "label": "BRS autopsy · enrollment",
            "program": "Brain Research Study (autopsy)",
            "asOfDate": end.isoformat(),
            "provenance": "ytd",
            "source": (
                "Xinhui Wang · MAP BRS UDS list N=225 as of 2026-10-16 · sex from person list · "
                "race/ethnicity from James ADRC_subject_current_harmonized"
            ),
            "definition": (
                f"BRS autopsy enrollment as of {end.isoformat()} (active + minimal contact)."
            ),
            "ethnicityTotals": ethnicity_totals(brs_table["cells"]),
            **brs_table,
        },
    }

    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} · "
        f"UDS {uds_table['total']} · GS {gs_table['total']} · BRS {brs_table['total']}"
    )


if __name__ == "__main__":
    main()

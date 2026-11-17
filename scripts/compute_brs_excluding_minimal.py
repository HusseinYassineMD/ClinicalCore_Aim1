#!/usr/bin/env python3
"""Split Xinhui's BRS N=225 person list into minimal-contact vs excluding-minimal."""

from __future__ import annotations

import csv
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from openpyxl import load_workbook  # noqa: E402

PERSON_LIST = (
    ROOT
    / "data"
    / "reference"
    / "xinhui-wang-2026-11-13"
    / "MAP BRS UDS list (N=225, active+min.cont as of 2026-1016) v2026-1113.xlsx"
)
SUBJECT_PATH = (
    ROOT
    / "data"
    / "JamesDataPacket-November-6"
    / "USC ADRC UDS Harmonized"
    / "ADRC_subject_current_harmonized.csv"
)
OUTPUT = ROOT / "src" / "data" / "brsEnrollmentCohorts.json"

RACE_LABELS = {
    1: "Hispanic",
    2: "non-Hispanic White",
    3: "African American",
    4: "Asian",
    5: "Others",
    99: "Unknown",
}
SEX_LABELS = {1: "Male", 2: "Female"}
RACE_ORDER = [
    "Hispanic",
    "non-Hispanic White",
    "African American",
    "Asian",
    "Others",
    "Unknown",
]
SEX_ORDER = ["Male", "Female"]
APOE_ORDER = ["Yes", "No", "No genotype"]


def read_person_list() -> list[dict]:
    wb = load_workbook(PERSON_LIST, data_only=True)
    ws = wb["data"]
    rows: list[dict] = []
    for r in range(2, ws.max_row + 1):
        uds_id = ws.cell(r, 1).value
        if uds_id is None:
            continue
        rows.append(
            {
                "uds_id": str(uds_id).strip(),
                "apoe_comb": ws.cell(r, 2).value,
                "sex": ws.cell(r, 3).value,
                "race_ethnicity": ws.cell(r, 4).value,
                "APOE4": ws.cell(r, 5).value,
            }
        )
    return rows


def subject_index() -> dict[str, dict[str, str]]:
    with SUBJECT_PATH.open(newline="", encoding="utf-8-sig") as handle:
        by: dict[str, dict[str, str]] = {}
        for row in csv.DictReader(handle):
            for key in ("ptid", "naccid"):
                value = (row.get(key) or "").strip()
                if value:
                    by[value] = row
        return by


def summarize(rows: list[dict]) -> dict:
    race = Counter(
        RACE_LABELS.get(row["race_ethnicity"], f"code:{row['race_ethnicity']}")
        for row in rows
    )
    sex = Counter(
        SEX_LABELS.get(row["sex"], f"code:{row['sex']}") for row in rows
    )
    apoe: Counter[str] = Counter()
    for row in rows:
        value = row["APOE4"]
        if value is None or value == "":
            apoe["No genotype"] += 1
        elif int(value) == 1:
            apoe["Yes"] += 1
        elif int(value) == 0:
            apoe["No"] += 1
        else:
            apoe[f"other:{value}"] += 1

    return {
        "n": len(rows),
        "male": sex.get("Male", 0),
        "female": sex.get("Female", 0),
        "byRaceEthnicity": [
            {"label": label, "count": race[label]}
            for label in RACE_ORDER
            if race.get(label)
        ],
        "bySex": [
            {"label": label, "count": sex[label]}
            for label in SEX_ORDER
            if sex.get(label)
        ],
        "byApoe4": [
            {"label": label, "count": apoe[label]}
            for label in APOE_ORDER
            if apoe.get(label)
        ],
    }


def main() -> None:
    people = read_person_list()
    subjects = subject_index()

    status_counts: Counter[str] = Counter()
    minimal: list[dict] = []
    excluding: list[dict] = []
    for row in people:
        subject = subjects.get(row["uds_id"])
        status = (
            (subject.get("der_status_adrc") if subject else "") or ""
        ).strip() or "(missing)"
        status_counts[status] += 1
        if status == "Minimal contact":
            minimal.append(row)
        else:
            excluding.append(row)

    all_summary = summarize(people)
    excluding_summary = summarize(excluding)
    minimal_summary = summarize(minimal)

    if all_summary["n"] != 225:
        raise SystemExit(f"Expected 225 person-list rows, got {all_summary['n']}")
    if excluding_summary["n"] + minimal_summary["n"] != 225:
        raise SystemExit("Minimal + excluding must equal 225")
    if excluding_summary["n"] >= 225:
        raise SystemExit("Excluding minimal must be less than 225")

    payload = {
        "meta": {
            "personListFile": str(PERSON_LIST.relative_to(ROOT)),
            "subjectFile": str(SUBJECT_PATH.relative_to(ROOT)),
            "asOfDate": "2026-10-16",
            "receivedDate": "2026-11-13",
            "definition": (
                "Xinhui Wang person list N=225 is labeled active+min.cont. "
                "Minimal contact is der_status_adrc = Minimal contact on "
                "ADRC_subject_current_harmonized.csv (James Nov 6). "
                "Excluding minimal contact is everyone else on that list."
            ),
            "syncedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "statusBreakdown": dict(status_counts),
        },
        "allEnrollment": {
            **all_summary,
            "label": "Current enrollment",
            "definition": "Xinhui Wang BRS person list · active + minimal contact · N=225",
        },
        "excludingMinimalContact": {
            **excluding_summary,
            "label": "Excluding minimal contact",
            "definition": (
                "BRS person-list rows whose current ADRC status is not Minimal contact. "
                f"N={excluding_summary['n']} of 225."
            ),
        },
        "minimalContactOnly": {
            **minimal_summary,
            "label": "Minimal contact only",
            "definition": (
                "BRS person-list rows with der_status_adrc = Minimal contact. "
                f"N={minimal_summary['n']} of 225."
            ),
        },
    }

    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    print(
        f"all {all_summary['n']} · excluding minimal {excluding_summary['n']} · "
        f"minimal only {minimal_summary['n']}"
    )
    print("status", dict(status_counts))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Spanish primary-language splits for ADRC UDS year-to-date activity cards."""

from __future__ import annotations

import csv
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from reporting_window import EAC_YTD_AS_OF, EAC_YTD_END_DATE, EAC_YTD_LABEL  # noqa: E402

LONG_PATH = (
    ROOT
    / "data"
    / "JamesDataPacket-November-6"
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
OUTPUT = ROOT / "src" / "data" / "adrcYtdSpanishUds.json"


def parse_row_date(raw: str | None) -> date | None:
    value = (raw or "").strip()
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(value[:10] if fmt == "%Y-%m-%d" else value, fmt).date()
        except ValueError:
            continue
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def visit_participant_id(row: dict[str, str]) -> str:
    return (
        row.get("naccid")
        or row.get("adcid")
        or row.get("ptid")
        or row.get("uds_id")
        or ""
    ).strip()


def is_spanish_primary(
    row: dict[str, str],
    subjects: dict[str, dict[str, str]],
) -> bool:
    """Diversity classification: primary language Spanish."""
    subject = subjects.get(visit_participant_id(row))
    if subject:
        latest = (subject.get("der_latest_primary_language") or "").strip().lower()
        if latest == "spanish":
            return True
    if str(row.get("predomlan") or "").strip() == "2":
        return True
    if str(row.get("primlang") or "").strip() == "2":
        return True
    if (row.get("der_primary_language") or "").strip().lower() == "spanish":
        return True
    return False


def main() -> None:
    start = date(EAC_YTD_AS_OF.year, 1, 1)
    end = EAC_YTD_AS_OF.date()

    with LONG_PATH.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    with SUBJECT_PATH.open(newline="", encoding="utf-8-sig") as handle:
        subjects = {
            (row.get("naccid") or "").strip(): row
            for row in csv.DictReader(handle)
            if (row.get("naccid") or "").strip()
        }

    period = []
    for row in rows:
        visit_day = parse_row_date(row.get("visit_date") or row.get("visitdate"))
        if visit_day and start <= visit_day <= end:
            period.append(row)

    initial = [r for r in period if (r.get("packet") or "").strip() == "I"]
    follow_ups = [r for r in period if (r.get("packet") or "").strip() != "I"]
    in_person = [
        r for r in follow_ups if str(r.get("modea1") or "").strip() == "1"
    ]
    remote = [
        r for r in follow_ups if str(r.get("modea1") or "").strip() in {"2", "3"}
    ]

    payload = {
        "meta": {
            "sourceLongitudinal": str(LONG_PATH.relative_to(ROOT)),
            "sourceSubjects": str(SUBJECT_PATH.relative_to(ROOT)),
            "periodLabel": EAC_YTD_LABEL,
            "startDate": start.isoformat(),
            "endDate": EAC_YTD_END_DATE,
            "definition": (
                "Spanish-enrolled = primary language Spanish for diversity "
                "classification: ADRC_subject_current_harmonized."
                "der_latest_primary_language = Spanish, else visit predomlan/"
                "primlang = 2 or der_primary_language = Spanish. Same visit "
                "rules as the UDS year-to-date cards (packet / modea1)."
            ),
            "syncedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
        "all": {
            "newInitialEvaluations": len(initial),
            "followUpInPerson": len(in_person),
            "followUpRemote": len(remote),
        },
        "spanishPrimaryLanguage": {
            "newInitialEvaluations": sum(
                1 for r in initial if is_spanish_primary(r, subjects)
            ),
            "followUpInPerson": sum(
                1 for r in in_person if is_spanish_primary(r, subjects)
            ),
            "followUpRemote": sum(
                1 for r in remote if is_spanish_primary(r, subjects)
            ),
        },
    }

    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    spanish = payload["spanishPrimaryLanguage"]
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    print(
        "Spanish primary · "
        f"initial {spanish['newInitialEvaluations']} · "
        f"in-person {spanish['followUpInPerson']} · "
        f"remote {spanish['followUpRemote']}"
    )


if __name__ == "__main__":
    main()

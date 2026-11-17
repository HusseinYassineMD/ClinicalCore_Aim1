#!/usr/bin/env python3
"""Aggregate USC SCAN Participant Tracking REDCap export for Imaging · USC Scan Progress."""

from __future__ import annotations

import csv
import json
import re
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REDCAP_DIR = ROOT / "data" / "redcap"
OUTPUT = ROOT / "src/data/uscScanProgress.json"
PKG_PATH = ROOT / "src/data/rpprDataPackage.json"

MODALITIES = (
    {
        "key": "mri",
        "label": "MRI",
        "status": "Baseline MRI Scan Status",
        "date": "Baseline MRI Scan Date",
        "notes": "Baseline MRI Notes",
    },
    {
        "key": "amyloidPet",
        "label": "Amyloid PET",
        "status": "Baseline Amyloid PET Scan Status",
        "date": "Baseline Amyloid PET Scan Date",
        "notes": "Baseline Amyloid PET Notes",
    },
    {
        "key": "tauPet",
        "label": "Tau PET",
        "status": "Baseline Tau PET Scan Status",
        "date": "Baseline Tau PET Scan Date",
        "notes": "Baseline Tau PET Notes",
    },
)

MONTHS = {
    "january": 1,
    "jan": 1,
    "february": 2,
    "feb": 2,
    "march": 3,
    "mar": 3,
    "april": 4,
    "apr": 4,
    "may": 5,
    "june": 6,
    "jun": 6,
    "july": 7,
    "jul": 7,
    "august": 8,
    "aug": 8,
    "september": 9,
    "sep": 9,
    "october": 10,
    "oct": 10,
    "november": 11,
    "nov": 11,
    "december": 12,
    "dec": 12,
}


def load_reporting_window() -> tuple[date, date, str]:
    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    ytd = pkg["reportingPeriodSummary"]
    start = date.fromisoformat(ytd["startDate"])
    end = date.fromisoformat(ytd["endDate"])
    return start, end, ytd["label"]


def latest_usc_scan_csv() -> Path:
    matches = sorted(REDCAP_DIR.glob("USCSCANParticipantTr*.csv"))
    if not matches:
        raise FileNotFoundError(f"No USC SCAN Participant Tracking CSV in {REDCAP_DIR}")
    return max(matches, key=lambda p: p.stat().st_mtime)


def parse_date(value: str | None) -> date | None:
    text = (value or "").strip()
    if not text:
        return None
    for fmt, n in (("%Y-%m-%d", 10), ("%m/%d/%Y", 10), ("%Y/%m/%d", 10)):
        try:
            return datetime.strptime(text[:n], fmt).date()
        except ValueError:
            continue
    return None


def parse_note_date(notes: str | None) -> date | None:
    """Recover clinical scan dates written into REDCap notes when the date field is blank."""
    text = (notes or "").strip()
    if not text:
        return None

    m = re.search(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b", text)
    if m:
        month, day, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if year < 100:
            year += 2000
        try:
            return date(year, month, day)
        except ValueError:
            pass

    m = re.search(
        r"\b("
        + "|".join(MONTHS)
        + r")\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b",
        text,
        re.I,
    )
    if m:
        month = MONTHS[m.group(1).lower()]
        day = int(m.group(2))
        year = int(m.group(3))
        try:
            return date(year, month, day)
        except ValueError:
            pass

    m = re.search(
        r"\bin\s+(" + "|".join(MONTHS) + r")\s+(\d{4})\b",
        text,
        re.I,
    )
    if m:
        month = MONTHS[m.group(1).lower()]
        year = int(m.group(2))
        return date(year, month, 1)

    return None


def in_window(d: date | None, start: date, end: date) -> bool:
    return d is not None and start <= d <= end


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def modality_count(
    rows: list[dict[str, str]],
    modality: dict[str, str],
    start: date,
    end: date,
) -> dict:
    counted: list[dict] = []
    excluded: list[dict] = []

    for row in rows:
        status = (row.get(modality["status"]) or "").strip()
        if status != "Complete":
            continue

        uds = (row.get("UDS ID") or "").strip()
        field_date = parse_date(row.get(modality["date"]))
        notes = row.get(modality["notes"]) or ""
        note_date = parse_note_date(notes) if field_date is None else None
        effective = field_date or note_date
        date_source = (
            "scan_date"
            if field_date is not None
            else ("notes" if note_date is not None else None)
        )

        entry = {
            "udsId": uds,
            "status": status,
            "scanDate": field_date.isoformat() if field_date else None,
            "noteDate": note_date.isoformat() if note_date else None,
            "effectiveDate": effective.isoformat() if effective else None,
            "dateSource": date_source,
            "notes": notes.strip() or None,
        }

        if in_window(effective, start, end):
            counted.append(entry)
        else:
            reason = (
                "missing_date"
                if effective is None
                else ("before_window" if effective < start else "after_window")
            )
            excluded.append({**entry, "excludeReason": reason})

    return {
        "participantsCompleteInWindow": len(counted),
        "completeStatusTotal": len(counted) + len(excluded),
        "counted": counted,
        "excluded": excluded,
    }


def main() -> None:
    start, end, label = load_reporting_window()
    source = latest_usc_scan_csv()
    rows = read_rows(source)

    enrolled = [
        {
            "udsId": (r.get("UDS ID") or "").strip(),
            "consentDate": (r.get("USC SCAN consent date") or "").strip() or None,
            "enrollmentStatus": (r.get("Enrollment Status") or "").strip() or None,
        }
        for r in rows
        if (r.get("Enrollment Status") or "").strip() == "Enrolled"
    ]
    consented_in_window = [
        e
        for e in enrolled
        if in_window(parse_date(e.get("consentDate")), start, end)
    ]

    modalities = {
        m["key"]: {
            "label": m["label"],
            **modality_count(rows, m, start, end),
        }
        for m in MODALITIES
    }

    payload = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "reportingPeriodLabel": label,
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "sourceFile": source.name,
        "sourceLabel": "USC SCAN Participant Tracking REDCap",
        "receivedDate": "2026-11-17",
        "definition": (
            "Unique enrolled Baseline rows with Baseline <modality> Scan Status = Complete "
            "and an effective scan date in the dashboard YTD window. Effective date is the "
            "Baseline <modality> Scan Date when present; otherwise a date recovered from "
            "Baseline <modality> Notes (clinical / outside-Keck completions)."
        ),
        "enrolledParticipants": len(enrolled),
        "consentedInWindow": len(consented_in_window),
        "mri": modalities["mri"]["participantsCompleteInWindow"],
        "amyloidPet": modalities["amyloidPet"]["participantsCompleteInWindow"],
        "tauPet": modalities["tauPet"]["participantsCompleteInWindow"],
        "modalities": modalities,
        "enrolled": enrolled,
    }

    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} · enrolled {payload['enrolledParticipants']} · "
        f"MRI {payload['mri']} · Amyloid {payload['amyloidPet']} · Tau {payload['tauPet']} · "
        f"window {label} · {source.name}"
    )


if __name__ == "__main__":
    main()

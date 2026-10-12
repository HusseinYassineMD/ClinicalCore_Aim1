#!/usr/bin/env python3
"""Sync REC scholars, faculty, and training-program CSVs → recRoster.json."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path

from project_paths import ROOT, SRC_DATA

REC_DIR = ROOT / "data" / "reference" / "rec"
OUTPUT = SRC_DATA / "recRoster.json"

SCHOLARS = REC_DIR / "scholars-trainees.csv"
FACULTY = REC_DIR / "faculty.csv"
PROGRAMS = REC_DIR / "training-programs.csv"
ATTENDANCE = REC_DIR / "meeting-attendance.csv"
OUTPUT_ATTENDANCE = SRC_DATA / "recMeetingAttendance.json"


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise FileNotFoundError(path)
    with path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return [{k: (v or "").strip() for k, v in row.items()} for row in rows]


def yn(value: str) -> bool:
    return value.strip().lower() in ("yes", "y", "true", "1")


def aggregate_scholars(rows: list[dict[str, str]]) -> dict:
    current = [r for r in rows if r.get("current_or_past", "").lower() == "current"]
    past = [r for r in rows if r.get("current_or_past", "").lower() == "past"]
    scholars = [r for r in rows if r.get("scholar_or_trainee", "").lower() == "scholar"]
    trainees = [r for r in rows if r.get("scholar_or_trainee", "").lower() == "trainee"]
    return {
        "title": "Table 1a. Summary table of REC scholars and trainees",
        "rows": [
            {
                "id": r.get("id"),
                "name": f"{r.get('last_name', '')}, {r.get('first_name', '')}".strip(", "),
                "currentOrPast": r.get("current_or_past"),
                "scholarOrTrainee": r.get("scholar_or_trainee"),
                "trainingLevel": r.get("training_level"),
                "researchArea": r.get("research_area"),
                "progress": r.get("progress"),
                "adrcAffiliated": yn(r.get("adrc_affiliated", "")),
                "adrdField": yn(r.get("adrd_field", "")),
                "notes": r.get("notes") or None,
            }
            for r in rows
        ],
        "summary": {
            "total": len(rows),
            "current": len(current),
            "past": len(past),
            "currentScholars": len(
                [r for r in current if r.get("scholar_or_trainee", "").lower() == "scholar"]
            ),
            "currentTrainees": len(
                [r for r in current if r.get("scholar_or_trainee", "").lower() == "trainee"]
            ),
            "allAdrcAffiliated": all(yn(r.get("adrc_affiliated", "")) for r in rows),
            "allAdrdField": all(yn(r.get("adrd_field", "")) for r in rows),
        },
    }


def aggregate_faculty(rows: list[dict[str, str]]) -> dict:
    exec_count = sum(1 for r in rows if yn(r.get("executive_committee", "")))
    return {
        "title": "Participating REC faculty",
        "footnote": "* Members of the executive committee",
        "rows": [
            {
                "id": r.get("id"),
                "lastName": r.get("last_name"),
                "firstName": r.get("first_name"),
                "title": r.get("title"),
                "institutionDepartment": r.get("institution_department"),
                "theme": r.get("theme"),
                "researchArea": r.get("research_area"),
                "executiveCommittee": yn(r.get("executive_committee", "")),
            }
            for r in rows
        ],
        "summary": {
            "total": len(rows),
            "executiveCommittee": exec_count,
        },
    }


def aggregate_attendance(rows: list[dict[str, str]]) -> dict:
    sessions = []
    for r in rows:
        date = r.get("session_date", "").strip()
        raw = r.get("attendees", "").strip()
        if not date or not raw:
            continue
        try:
            attendees = int(raw)
        except ValueError as exc:
            raise ValueError(f"Invalid attendees for {date}: {raw!r}") from exc
        sessions.append(
            {
                "sessionDate": date,
                "attendees": attendees,
                "reportedBy": r.get("reported_by") or None,
                "reportedAt": r.get("reported_at") or None,
            }
        )
    sessions.sort(key=lambda s: s["sessionDate"])
    total = sum(s["attendees"] for s in sessions)
    count = len(sessions)
    return {
        "sessions": sessions,
        "summary": {
            "sessionCount": count,
            "totalAttendees": total,
            "avgAttendees": round(total / count, 2) if count else 0,
        },
    }


def aggregate_programs(rows: list[dict[str, str]]) -> dict:
    return {
        "title": "USC training programs that include ADRD and minority scholars",
        "rows": [
            {
                "id": r.get("id"),
                "program": r.get("program"),
                "traineesPerYear": r.get("trainees_per_year"),
                "minorityResearchers": r.get("minority_researchers"),
                "focus": r.get("focus"),
                "preceptor": r.get("preceptor"),
                "notes": r.get("notes") or None,
            }
            for r in rows
        ],
        "summary": {
            "totalPrograms": len(rows),
        },
    }


def main() -> None:
    scholars_rows = read_csv(SCHOLARS)
    faculty_rows = read_csv(FACULTY)
    program_rows = read_csv(PROGRAMS)
    attendance_rows = read_csv(ATTENDANCE) if ATTENDANCE.is_file() else []

    payload = {
        "meta": {
            "sourceRoot": "data/reference/rec/",
            "sources": {
                "scholarsTrainees": str(SCHOLARS.relative_to(ROOT)),
                "faculty": str(FACULTY.relative_to(ROOT)),
                "trainingPrograms": str(PROGRAMS.relative_to(ROOT)),
                "meetingAttendance": str(ATTENDANCE.relative_to(ROOT)),
            },
            "syncedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "maintenance": "Edit CSV files under data/reference/rec/ then run: npm run sync:rec",
        },
        "scholarsTrainees": aggregate_scholars(scholars_rows),
        "faculty": aggregate_faculty(faculty_rows),
        "trainingPrograms": aggregate_programs(program_rows),
    }

    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")

    attendance_payload = {
        "meta": {
            "sourceRoot": "data/reference/rec/",
            "sourceCsv": str(ATTENDANCE.relative_to(ROOT)),
            "syncedAt": payload["meta"]["syncedAt"],
            "maintenance": "Edit meeting-attendance.csv then run: npm run sync:rec",
        },
        **aggregate_attendance(attendance_rows),
    }
    OUTPUT_ATTENDANCE.write_text(
        json.dumps(attendance_payload, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Wrote {OUTPUT_ATTENDANCE.relative_to(ROOT)}")
    print(
        f"  Meeting attendance: {attendance_payload['summary']['sessionCount']} sessions · "
        f"avg {attendance_payload['summary']['avgAttendees']} · "
        f"total {attendance_payload['summary']['totalAttendees']}"
    )
    print(
        f"  Scholars/trainees: {payload['scholarsTrainees']['summary']['total']} "
        f"({payload['scholarsTrainees']['summary']['current']} current)"
    )
    print(f"  Faculty: {payload['faculty']['summary']['total']}")
    print(f"  Training programs: {payload['trainingPrograms']['summary']['totalPrograms']}")


if __name__ == "__main__":
    main()

"""Read REDCap CSV exports (raw field names or DATA_LABELS with duplicate headers)."""

from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path

INT_EXT_TEXT = {
    "internal": "1",
    "external": "2",
}

PLASMA_LABEL_TO_FIELD = {
    "Plasma, NCI": "plasma_nci_req",
    "Plasma, MCI": "plasma_mci_req",
    "Plasma, AD": "plasma_ad_req",
}


def parse_timestamp(value: str | None) -> datetime | None:
    if not value or value.strip() == "[not completed]":
        return None
    value = value.strip()
    for fmt, n in (
        ("%Y-%m-%d %H:%M:%S", 19),
        ("%Y-%m-%d %H:%M", 16),
        ("%Y-%m-%d", 10),
    ):
        try:
            return datetime.strptime(value[:n], fmt)
        except ValueError:
            continue
    return None


def _survey_complete(raw: str) -> bool:
    return raw.strip() == "Complete"


def normalize_specimen_row(raw: dict[str, str]) -> dict[str, str]:
    """Map DATA_LABELS / SubmittedRequests columns onto aggregate_specimen_sharing field names."""
    if "request_timestamp" in raw and "request_complete" in raw:
        return raw

    row: dict[str, str] = dict(raw)
    ts = raw.get("Survey Timestamp") or raw.get("request_timestamp")
    if ts:
        row["request_timestamp"] = ts

    survey_complete = raw.get("survey_complete") or raw.get("surveyComplete")
    if survey_complete is None and "Complete?" in raw:
        survey_complete = raw.get("Complete?")
    if _survey_complete(survey_complete or ""):
        row["request_complete"] = "2"

    int_ext = raw.get("int_ext") or raw.get(
        "Is this request internal or external to USC?",
    )
    if int_ext:
        mapped = INT_EXT_TEXT.get(int_ext.strip().lower())
        row["int_ext"] = mapped or int_ext

    for label, field in PLASMA_LABEL_TO_FIELD.items():
        if label in raw and raw[label]:
            row[field] = raw[label]

    closed = raw.get("Request Closed") or raw.get("closed_date")
    sent = raw.get("Specimens Sent") or raw.get("sent_date")
    if closed:
        row["closed_date"] = closed
    if sent:
        row["sent_date"] = sent
    if raw.get("tracking_complete"):
        row["tracking_complete"] = raw["tracking_complete"]
    elif raw.get("trackingComplete") == "Complete":
        row["tracking_complete"] = "2"

    return row


def read_redcap_csv(path: Path) -> list[dict[str, str]]:
    """Dict rows; duplicate headers become surveyComplete / trackingComplete when applicable."""
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.reader(handle)
        header = next(reader)
        complete_indices = [i for i, name in enumerate(header) if name == "Complete?"]
        fieldnames: list[str] = []
        complete_seen = 0
        for i, name in enumerate(header):
            if name == "Complete?" and len(complete_indices) > 1:
                complete_seen += 1
                if complete_seen == 1:
                    fieldnames.append("surveyComplete")
                else:
                    fieldnames.append("trackingComplete")
            else:
                fieldnames.append(name)

        rows: list[dict[str, str]] = []
        for line in reader:
            if len(line) < len(fieldnames):
                line = line + [""] * (len(fieldnames) - len(line))
            raw = dict(zip(fieldnames, line))
            rows.append(normalize_specimen_row(raw))
        return rows

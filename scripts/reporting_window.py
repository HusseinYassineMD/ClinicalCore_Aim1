"""Shared calendar year-to-date window for dashboard aggregates."""

from __future__ import annotations

from datetime import date, datetime

# EAC-aligned RPPR lock (Dr. Chui · Clinical Core / dashboard YTD).
EAC_YTD_AS_OF = datetime(2026, 10, 13)
EAC_YTD_END_DATE = EAC_YTD_AS_OF.date().isoformat()
EAC_YTD_LABEL = "1/1/2026 – 10/13/2026"


def ytd_datetime_bounds(as_of: datetime | None = None) -> tuple[datetime, datetime, str]:
    anchor = as_of or EAC_YTD_AS_OF
    start = datetime(anchor.year, 1, 1)
    end = datetime(anchor.year, anchor.month, anchor.day, 23, 59, 59)
    if as_of is None and anchor.date() == EAC_YTD_AS_OF.date():
        return start, end, EAC_YTD_LABEL
    label = f"{start.month}/{start.day}/{start.year} – {end.month}/{end.day}/{end.year}"
    return start, end, label


def ytd_date_bounds(as_of: datetime | None = None) -> tuple[date, date, str]:
    start_dt, end_dt, label = ytd_datetime_bounds(as_of)
    return start_dt.date(), end_dt.date(), label

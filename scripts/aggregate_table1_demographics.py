#!/usr/bin/env python3
"""Compute RPPR Table 1-style demographics from NACC UDS export (Jul–Dec visits)."""

from __future__ import annotations

import csv
import json
import statistics
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path

from reporting_window import ytd_date_bounds

ROOT = Path(__file__).resolve().parents[1]
UDS_DATA = ROOT / "data" / "uds_data" / "uds_data.csv"
ATN_UDS = ROOT / "data" / "ATN UDS.csv"
OUTPUT = ROOT / "src" / "data" / "table1Demographics.uds.json"
PERIOD_START, PERIOD_END, REPORTING_PERIOD = ytd_date_bounds()


def parse_num(value: str | None) -> float | None:
    if value is None or value.strip() in ("", "."):
        return None
    try:
        return float(value)
    except ValueError:
        return None


def is_yes(value: str | None) -> bool:
    return str(value or "").strip() in ("1", "1.0")


def visit_in_period(row: dict[str, str]) -> bool:
    year_raw = row.get("visityr") or row.get("visityr.x")
    month_raw = row.get("visitmo") or row.get("visitmo.x")
    day_raw = row.get("visitday") or row.get("visitday.x")
    if not year_raw:
        return False
    try:
        year = int(float(year_raw))
    except ValueError:
        return False
    if day_raw and month_raw:
        try:
            visit = date(year, int(float(month_raw)), int(float(day_raw)))
            return PERIOD_START <= visit <= PERIOD_END
        except ValueError:
            pass
    if month_raw:
        try:
            month = int(float(month_raw))
            visit = date(year, month, 15)
            return PERIOD_START <= visit <= PERIOD_END
        except ValueError:
            pass
    return False


def visit_sort_key(row: dict[str, str]) -> tuple[int, int, int]:
    year = int(float(row.get("visityr") or row.get("visityr.x") or 0))
    month = int(float(row.get("visitmo") or row.get("visitmo.x") or 0))
    day = int(float(row.get("visitday") or row.get("visitday.x") or 0))
    return year, month, day


def age_at_visit(row: dict[str, str]) -> float | None:
    birth_year = row.get("birthyr")
    visit_year = row.get("visityr") or row.get("visityr.x")
    birth_month = row.get("birthmo")
    visit_month = row.get("visitmo") or row.get("visitmo.x")
    if not birth_year or not visit_year:
        return None
    try:
        age = int(float(visit_year)) - int(float(birth_year))
        if birth_month and visit_month and int(float(visit_month)) < int(float(birth_month)):
            age -= 1
        return float(age)
    except ValueError:
        return None


def race_group(row: dict[str, str]) -> str:
    if is_yes(row.get("hispanic")) or is_yes(row.get("ethispanic")):
        return "hispanic"
    if is_yes(row.get("raceblack")):
        return "black"
    if is_yes(row.get("raceasian")):
        return "asian"
    if is_yes(row.get("racewhite")):
        return "white"
    race_code = row.get("race")
    mapping = {"1": "white", "2": "black", "3": "hispanic", "5": "asian"}
    return mapping.get(race_code or "", "other")


def cdr_bucket(row: dict[str, str]) -> str | None:
    global_cdr = parse_num(row.get("cdrglob"))
    if global_cdr is None:
        return None
    if global_cdr == 0:
        return "cdr0"
    if global_cdr == 0.5:
        return "cdr05"
    if global_cdr > 0.5:
        return "cdrOver1"
    return None


def apoe4_carrier(genotype: str) -> bool:
    g = genotype.lower().replace(" ", "")
    return "e4" in g


def load_apoe() -> dict[str, str]:
    apoe_by_id: dict[str, str] = {}
    if not ATN_UDS.exists():
        return apoe_by_id
    with ATN_UDS.open(newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            uid = row.get("uds_id", "")
            genotype = row.get("apoe")
            if uid and genotype:
                apoe_by_id[uid] = genotype
    return apoe_by_id


def load_period_cohort() -> list[dict[str, str]]:
    latest_by_participant: dict[str, dict[str, str]] = {}
    with UDS_DATA.open(newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            if not visit_in_period(row):
                continue
            participant_id = row.get("NACCID") or row.get("ptid")
            if not participant_id:
                continue
            existing = latest_by_participant.get(participant_id)
            if existing is None or visit_sort_key(row) >= visit_sort_key(existing):
                latest_by_participant[participant_id] = row
    return list(latest_by_participant.values())


def format_age_mean_sd(ages: list[float]) -> str:
    if not ages:
        return "—"
    if len(ages) == 1:
        return f"{ages[0]:.1f} (—)"
    return f"{statistics.mean(ages):.1f} ({statistics.pstdev(ages):.1f})"


def format_education_median_iqr(values: list[float]) -> str:
    if not values:
        return "—"
    ordered = sorted(values)
    median = ordered[len(ordered) // 2]
    q1 = ordered[len(ordered) // 4]
    q3 = ordered[(3 * len(ordered)) // 4]
    return f"{int(round(median))} ({int(round(q1))}, {int(round(q3))})"


def summarize_group(rows: list[dict[str, str]], apoe_by_id: dict[str, str]) -> dict:
    n = len(rows)
    ages = [age for row in rows if (age := age_at_visit(row)) is not None]
    education = [
        value for row in rows if (value := parse_num(row.get("educ"))) is not None
    ]
    male_count = sum(
        1
        for row in rows
        if str(row.get("sex", "")).lower().startswith("m") or row.get("sex") == "1"
    )
    moca_count = sum(
        1 for row in rows if parse_num(row.get("mocatots")) is not None
    )
    apoe4_count = 0
    for row in rows:
        participant_id = str(row.get("NACCID") or row.get("ptid"))
        if apoe4_carrier(apoe_by_id.get(participant_id, "")):
            apoe4_count += 1

    return {
        "n": n,
        "ageMeanSD": format_age_mean_sd(ages),
        "eduMedianIQR": format_education_median_iqr(education),
        "malePercent": round(100 * male_count / n) if n else 0,
        "mocaN": moca_count,
        "cdr0": sum(1 for row in rows if cdr_bucket(row) == "cdr0"),
        "cdr05": sum(1 for row in rows if cdr_bucket(row) == "cdr05"),
        "cdrOver1": sum(1 for row in rows if cdr_bucket(row) == "cdrOver1"),
        "apoeE4N": apoe4_count,
        "followUpMeanSD": "—",
    }


def build_table(cohort: list[dict[str, str]], apoe_by_id: dict[str, str]) -> dict:
    groups = {
        "overall": cohort,
        "hispanic": [row for row in cohort if race_group(row) == "hispanic"],
        "white": [row for row in cohort if race_group(row) == "white"],
        "black": [row for row in cohort if race_group(row) == "black"],
        "asian": [row for row in cohort if race_group(row) == "asian"],
    }
    return {name: summarize_group(rows, apoe_by_id) for name, rows in groups.items()}


def main() -> None:
    cohort = load_period_cohort()
    apoe_by_id = load_apoe()
    table = build_table(cohort, apoe_by_id)
    race_counts = Counter(race_group(row) for row in cohort)

    payload = {
        "meta": {
            "source": str(UDS_DATA.relative_to(ROOT)),
            "atnSource": str(ATN_UDS.relative_to(ROOT)) if ATN_UDS.exists() else None,
            "reportingPeriod": REPORTING_PERIOD,
            "cohortDefinition": (
                f"Unique participants with UDS visit in {REPORTING_PERIOD} "
                "(latest visit in period used per participant)"
            ),
            "extractedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "participantCount": len(cohort),
            "raceBreakdown": dict(race_counts),
            "note": (
                "Table 1-style summary from local UDS export, filtered to the same "
                "year-to-date window as the Metrics dashboard and Data Package."
            ),
        },
        **table,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} (N={len(cohort)})")
    print("Race breakdown:", dict(race_counts))


if __name__ == "__main__":
    main()

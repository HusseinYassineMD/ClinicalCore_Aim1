#!/usr/bin/env python3
"""Verify RPPR data package JSON captures all quantifiable CSV columns."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PKG = ROOT / "data" / "rppr-data-package"
JSON_PATH = ROOT / "src" / "data" / "rpprDataPackage.json"


def latest_brs_cohort_csv() -> Path:
    candidates = sorted(PKG.glob("MAPDatabase-BRSCohort_DATA_*.csv"))
    if not candidates:
        raise FileNotFoundError(f"No MAPDatabase-BRSCohort_DATA_*.csv under {PKG}")
    return candidates[-1]

# Keep in sync with aggregate_rppr_data_package.py
ID_COLUMNS = {
    "naccid",
    "ptid",
    "uds_id",
    "map_subject_id",
    "brs_id",
    "initialsmlst",
    "initials",
}
DATE_LIKE_COLUMNS = {
    "visit_date",
    "collection_date",
    "analysis_date",
    "der_first_uds_visit_date",
    "der_latest_uds_visit_date",
    "autopsy_consent_date",
    "date_of_death",
    "date_of_termination",
    "autopsy_performed_date",
    "map_subject_dob",
    "first_collection_date",
    "latest_collection_date",
    "batch_return_date",
    "batch_return_dates",
}
LONGITUDINAL_META_COLUMNS = {
    "source_generation",
    "adcid",
    "visitnum",
    "packet",
    "formver",
    "modcomm",
    "module",
    "visitdate",
}


def read_csv(path: Path) -> tuple[list[str], int]:
    with path.open(encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        columns = reader.fieldnames or []
        row_count = sum(1 for _ in reader)
    return columns, row_count


def covered_columns(summary: dict) -> set[str]:
    covered = set()
    covered.update(summary.get("fieldBreakdowns", {}))
    covered.update(summary.get("numericSummaries", {}))
    covered.update(summary.get("fieldPresence", {}))
    return covered


def validate_summary(name: str, columns: list[str], summary: dict, *, allowed: set[str] | None = None) -> list[str]:
    errors: list[str] = []
    expected = set(columns) - ID_COLUMNS - DATE_LIKE_COLUMNS
    if allowed is not None:
        expected = expected & allowed

    covered = covered_columns(summary)
    missing = sorted(expected - covered)
    if missing:
        errors.append(f"{name}: missing coverage for {len(missing)} column(s): {', '.join(missing[:12])}")
        if len(missing) > 12:
            errors[-1] += f" … +{len(missing) - 12} more"

    for field, breakdown in summary.get("fieldBreakdowns", {}).items():
        if field in {"biomarkers_available", "source_families", "batch_return_numbers", "source_files"}:
            continue
        total = sum(breakdown.values())
        row_total = summary.get("totalRecords") or summary.get("totalSubjects") or summary.get(
            "totalVisitRecords"
        ) or summary.get("totalRows") or summary.get("totalMeasurements") or summary.get("totalSourceRows")
        if row_total and total != row_total:
            errors.append(
                f"{name}.{field}: breakdown total {total} != row total {row_total}"
            )
    return errors


def main() -> int:
    if not JSON_PATH.exists():
        print(f"Missing aggregated JSON: {JSON_PATH}", file=sys.stderr)
        return 1

    payload = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    pipelines = {p["id"]: p for p in payload["pipelines"]}
    errors: list[str] = []

    checks = [
        (
            "uds subjects",
            PKG / "USC ADRC UDS Harmonized/ADRC_subject_current_harmonized.csv",
            pipelines["uds-harmonization"]["summary"]["subjects"],
            None,
        ),
        (
            "uds longitudinal",
            PKG / "USC ADRC UDS Harmonized/UDS_longitudinal_harmonized.csv",
            pipelines["uds-harmonization"]["summary"]["longitudinal"],
            LONGITUDINAL_META_COLUMNS,
        ),
        (
            "milestones",
            PKG / "USC ADRC UDS Harmonized/Milestones_history_harmonized.csv",
            pipelines["uds-harmonization"]["summary"]["milestones"],
            None,
        ),
        (
            "biomarker subjects",
            PKG / "USC ADRC Integrated Biomarker Availability/Integrated_Biomarker_Subject_Summary_v1.0.5.csv",
            pipelines["integrated-biomarkers"]["summary"]["subjects"],
            None,
        ),
        (
            "biomarker availability",
            PKG / "USC ADRC Integrated Biomarker Availability/Integrated_Biomarker_Availability_v1.0.5.csv",
            pipelines["integrated-biomarkers"]["summary"]["availability"],
            None,
        ),
        (
            "biomarker long",
            PKG / "USC ADRC Integrated Biomarker Availability/Integrated_Biomarkers_Long_v1.0.5.csv",
            pipelines["integrated-biomarkers"]["summary"]["longFormat"],
            None,
        ),
        (
            "source catalog",
            PKG / "USC ADRC Integrated Biomarker Availability/Integrated_Biomarker_Source_Catalog_v1.0.5.csv",
            pipelines["integrated-biomarkers"]["summary"]["sourceCatalog"],
            None,
        ),
        (
            "brs",
            latest_brs_cohort_csv(),
            pipelines["map-redcap"]["summary"]["brsCohort"],
            None,
        ),
        (
            "apoe",
            PKG / "MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv",
            pipelines["map-redcap"]["summary"]["apoeGenotype"],
            None,
        ),
    ]

    print("Data package coverage validation\n")
    for name, path, summary, allowed in checks:
        columns, row_count = read_csv(path)
        json_rows = (
            summary.get("totalRecords")
            or summary.get("totalSubjects")
            or summary.get("totalVisitRecords")
            or summary.get("totalRows")
            or summary.get("totalMeasurements")
            or summary.get("totalSourceRows")
        )
        covered = covered_columns(summary)
        expected = set(columns) - ID_COLUMNS - DATE_LIKE_COLUMNS
        if allowed is not None:
            expected = expected & allowed

        print(f"✓ {name}")
        print(f"  rows: csv={row_count:,} json={json_rows:,}")
        print(f"  columns: {len(columns)} total · {len(expected)} quantifiable · {len(covered)} covered")
        errors.extend(validate_summary(name, columns, summary, allowed=allowed))

    if errors:
        print("\nIssues:")
        for err in errors:
            print(f"  ✗ {err}")
        return 1

    print("\nAll quantifiable columns are covered in rpprDataPackage.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

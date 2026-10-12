#!/usr/bin/env python3
"""Build registry data manifest — auto-discovers all ATN, BRS, UDS, REDCap files."""

from __future__ import annotations

import csv
import json
import re
import subprocess
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src" / "data" / "registryManifest.json"


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "dataset"


def ensure_xlsx_csv(xlsx_path: Path) -> Path:
    csv_path = xlsx_path.with_suffix(".csv")
    if csv_path.exists() and csv_path.stat().st_mtime >= xlsx_path.stat().st_mtime:
        return csv_path
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["npx", "--yes", "xlsx-cli", str(xlsx_path)],
        capture_output=True,
        text=True,
        cwd=ROOT,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Failed to convert {xlsx_path.name}: {result.stderr}")
    csv_path.write_text(result.stdout, encoding="utf-8")
    return csv_path


def read_csv_rows(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        columns = reader.fieldnames or []
        rows = list(reader)
    return columns, rows


def summarize_atn(rows: list[dict[str, str]]) -> dict:
    return {
        "uniqueParticipants": len({r.get("uds_id", "") for r in rows if r.get("uds_id")}),
        "byDiagnosis": dict(Counter(r.get("diagnosis") or "(blank)" for r in rows).most_common(12)),
        "bySex": dict(Counter(r.get("sex") or "(blank)" for r in rows)),
        "byInBrs": dict(Counter(r.get("in_BRS") or "(blank)" for r in rows)),
        "topDataTypes": dict(
            Counter(r.get("data_type") for r in rows if r.get("data_type")).most_common(15)
        ),
        "hasBiomarkerFlags": {
            "has_BIOMK": sum(1 for r in rows if r.get("has_BIOMK") == "Yes"),
            "has_NCRAD": sum(1 for r in rows if r.get("has_NCRAD") == "Yes"),
            "has_C2N": sum(1 for r in rows if r.get("has_C2N") == "Yes"),
            "has_IDA": sum(1 for r in rows if r.get("has_IDA") == "Yes"),
        },
    }


def summarize_brs_cohort(rows: list[dict[str, str]]) -> dict:
    return {
        "uniqueUdsIds": len({r.get("uds_id", "") for r in rows if r.get("uds_id")}),
        "byStatus": dict(Counter(r.get("subject_brs_status") or "(blank)" for r in rows)),
        "autopsiesPerformed": sum(1 for r in rows if r.get("autopsy_performed_date")),
        "withConsentDate": sum(1 for r in rows if r.get("autopsy_consent_date")),
        "deceased": sum(1 for r in rows if r.get("date_of_death")),
    }


def summarize_brs_m1(rows: list[dict[str, str]]) -> dict:
    return {
        "uniqueParticipants": len({r.get("ptid", "") for r in rows if r.get("ptid")}),
        "withAutopsyFlag": sum(1 for r in rows if r.get("autopsy") == "1"),
        "deceased": sum(1 for r in rows if r.get("deceased") == "1"),
        "withConsent": sum(1 for r in rows if r.get("aconsent") == "1"),
        "byVisit": dict(Counter(r.get("visitnum") or "(blank)" for r in rows).most_common(10)),
    }


def summarize_uds(rows: list[dict[str, str]]) -> dict:
    forms_key = "formid.x" if rows and "formid.x" in rows[0] else "formid"
    ptid_key = "ptid"
    return {
        "uniqueParticipants": len({r.get(ptid_key, "") for r in rows if r.get(ptid_key)}),
        "topForms": dict(Counter(r.get(forms_key) or "(blank)" for r in rows).most_common(12)),
        "visitYears": dict(
            Counter(r.get("visityr.x") or r.get("visityr") or "(blank)" for r in rows).most_common(8)
        ),
    }


def summarize_uds_harmonized(rows: list[dict[str, str]]) -> dict:
    return {
        "uniqueParticipants": len(rows),
        "presumedActive": sum(
            1 for r in rows if "Presumed active" in (r.get("der_status_adrc") or "")
        ),
        "discontinued": sum(1 for r in rows if r.get("der_status_adrc") == "Discontinued"),
        "byStatusRedcap": dict(
            Counter(r.get("der_status_adrc") or "(blank)" for r in rows).most_common(8)
        ),
    }


def summarize_biomarker_package(rows: list[dict[str, str]]) -> dict:
    def flag(field: str) -> int:
        return sum(1 for r in rows if (r.get(field) or "").upper() == "TRUE")

    return {
        "uniqueParticipants": len(rows),
        "hasPlasma": flag("has_plasma"),
        "hasCsf": flag("has_csf"),
        "hasNcrad": flag("has_ncrad"),
        "hasBiomarkerFlags": {
            "has_A": flag("has_A"),
            "has_T": flag("has_T"),
            "has_N": flag("has_N"),
        },
    }


def summarize_apoe_package(rows: list[dict[str, str]]) -> dict:
    return {
        "uniqueParticipants": len(rows),
        "byGenotype": dict(Counter(r.get("apoe_comb") or "(blank)" for r in rows).most_common(8)),
    }


def summarize_redcap(rows: list[dict[str, str]]) -> dict:
    status_key = next((k for k in ("request_status", "status") if rows and k in rows[0]), None)
    return {
        "totalRecords": len(rows),
        "byStatus": dict(Counter(r.get(status_key) or "(blank)" for r in rows).most_common(12))
        if status_key
        else {},
    }


def pick_summarizer(category: str, label: str, columns: list[str]) -> str:
    if category == "ATN":
        return "atn"
    if "subject_brs_status" in columns:
        return "brs-cohort"
    if "apoe_comb" in columns:
        return "apoe-package"
    if "n_biospecimen_records" in columns or "has_buffy_coat" in columns:
        return "biomarker-package"
    if "biospecimen_record_id" in columns:
        return "biomarker-package"
    if "has_any_biomarker" in columns:
        return "biomarker-package"
    if "der_status_adrc" in columns:
        return "uds-harmonized"
    if category == "BRS":
        return "brs-m1"
    if category == "REDCap":
        return "redcap"
    return "uds"


def summarize(category: str, label: str, columns: list[str], rows: list[dict[str, str]]) -> dict:
    kind = pick_summarizer(category, label, columns)
    if kind == "atn":
        return summarize_atn(rows)
    if kind == "brs-cohort":
        return summarize_brs_cohort(rows)
    if kind == "brs-m1":
        return summarize_brs_m1(rows)
    if kind == "redcap":
        return summarize_redcap(rows)
    if kind == "uds-harmonized":
        return summarize_uds_harmonized(rows)
    if kind == "biomarker-package":
        return summarize_biomarker_package(rows)
    if kind == "apoe-package":
        return summarize_apoe_package(rows)
    return summarize_uds(rows)


def discover_files() -> list[dict]:
    """Find every CSV/XLSX under data/ (excluding generated m1.csv when m1.xlsx exists)."""
    specs: list[dict] = []
    seen_csv: set[Path] = set()

    def add(category: str, label: str, path: Path, description: str, original: Path | None = None):
        rel = path.relative_to(ROOT)
        orig_rel = str(original.relative_to(ROOT)) if original else str(rel)
        specs.append(
            {
                "id": slugify(f"{category}-{path.stem}"),
                "category": category,
                "label": label,
                "description": description,
                "path": path,
                "sourceFile": orig_rel,
                "dataFile": str(rel),
            }
        )
        seen_csv.add(path.resolve())

    # ATN — CSV files directly in data/
    for csv_path in sorted((ROOT / "data").glob("*.csv")):
        add(
            "ATN",
            csv_path.stem,
            csv_path,
            "ATN registry export linked to UDS participants.",
        )

    # BRS — brs_data folder
    brs_dir = ROOT / "data" / "brs_data"
    if brs_dir.exists():
        xlsx_files = {p.stem: p for p in brs_dir.glob("*.xlsx")}
        for csv_path in sorted(brs_dir.glob("*.csv")):
            if csv_path.stem in xlsx_files:
                continue  # skip generated CSV; xlsx handled below
            add(
                "BRS",
                csv_path.stem,
                csv_path,
                "BRS cohort / autopsy registry export.",
            )
        for xlsx_path in sorted(xlsx_files.values()):
            csv_path = ensure_xlsx_csv(xlsx_path)
            add(
                "BRS",
                xlsx_path.stem.upper() if xlsx_path.stem == "m1" else xlsx_path.stem,
                csv_path,
                f"BRS export from {xlsx_path.name} (all sheets/rows converted to CSV).",
                original=xlsx_path,
            )

    # UDS — uds_data folder
    uds_dir = ROOT / "data" / "uds_data"
    if uds_dir.exists():
        for csv_path in sorted(uds_dir.glob("*.csv")):
            add(
                "UDS",
                csv_path.stem.replace("_", " ").title(),
                csv_path,
                "NACC UDS participant export.",
            )

    # RPPR data package — harmonized UDS, biomarkers, MAP exports, James supplements
    pkg_dir = ROOT / "data" / "rppr-data-package"
    if pkg_dir.exists():
        brs_candidates = sorted(pkg_dir.glob("MAPDatabase-BRSCohort_DATA_*.csv"))
        brs_latest = brs_candidates[-1] if brs_candidates else None
        pkg_files: list[tuple[str, str, Path, str]] = [
            (
                "Package",
                "MAP APOE Genotype",
                pkg_dir / "MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv",
                "REDCap MAP APOE genotype export.",
            ),
            (
                "Package",
                "UDS Subject Current",
                pkg_dir / "USC ADRC UDS Harmonized" / "ADRC_subject_current_harmonized.csv",
                "Harmonized current UDS subject summary.",
            ),
            (
                "Package",
                "UDS Longitudinal",
                pkg_dir / "USC ADRC UDS Harmonized" / "UDS_longitudinal_harmonized.csv",
                "Harmonized UDS visit rows.",
            ),
            (
                "Package",
                "Biomarker Subject Summary",
                pkg_dir
                / "USC ADRC Integrated Biomarker Availability"
                / "Integrated_Biomarker_Subject_Summary_v1.0.5.csv",
                "Integrated biomarker availability by subject.",
            ),
            (
                "Package",
                "Biomarkers Long",
                pkg_dir
                / "USC ADRC Integrated Biomarker Availability"
                / "Integrated_Biomarkers_Long_v1.0.5.csv",
                "Integrated biomarker measurements (assay availability).",
            ),
        ]
        if brs_latest:
            pkg_files.insert(
                0,
                (
                    "Package",
                    "MAP BRS Cohort",
                    brs_latest,
                    "REDCap MAP BRS cohort export (latest dated export in package).",
                ),
            )
        map_dict = sorted(pkg_dir.glob("MAPDatabase_DataDictionary_*.csv"))
        if map_dict:
            pkg_files.append(
                (
                    "Package",
                    "MAP Data Dictionary",
                    map_dict[-1],
                    "REDCap MAP field definitions (James supplement).",
                )
            )
        bio_dir = pkg_dir / "USC ADRC Biospecimen Availability"
        for name, label, desc in (
            (
                "USC_ADRC_Biospecimen_Availability_Long_v1.0.1.csv",
                "Biospecimen Availability Long",
                "Specimen collection inventory (plasma, serum, buffy, CSF).",
            ),
            (
                "USC_ADRC_Biospecimen_Subject_Summary_v1.0.1.csv",
                "Biospecimen Subject Summary",
                "Participant-level biospecimen flags and spans.",
            ),
        ):
            path = bio_dir / name
            if path.exists():
                pkg_files.append(("Package", label, path, desc))
        for category, label, path, description in pkg_files:
            if path.exists():
                add(category, label, path, description)

    return specs


def build_manifest_entry(spec: dict) -> dict:
    path: Path = spec["path"]
    columns, rows = read_csv_rows(path)
    file_stat = path.stat()

    return {
        "id": spec["id"],
        "category": spec["category"],
        "label": spec["label"],
        "description": spec["description"],
        "sourceFile": spec["sourceFile"],
        "dataFile": spec["dataFile"],
        "rowCount": len(rows),
        "columnCount": len(columns),
        "fileSizeMb": round(file_stat.st_size / (1024 * 1024), 2),
        "fileModified": datetime.fromtimestamp(file_stat.st_mtime).strftime("%Y-%m-%d"),
        "summary": summarize(spec["category"], spec["label"], columns, rows),
    }


def main() -> None:
    discovered = discover_files()
    datasets = [build_manifest_entry(spec) for spec in discovered]
    order = ["ATN", "BRS", "UDS", "Package", "REDCap"]
    categories = sorted(
        {d["category"] for d in datasets},
        key=lambda c: order.index(c) if c in order else 99,
    )

    total_rows = sum(d["rowCount"] for d in datasets)
    total_columns_max = max(d["columnCount"] for d in datasets) if datasets else 0

    payload = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "categories": categories,
        "complete": True,
        "inventoryNote": "Summaries only — aggregated counts from confidential source files. Raw row data is not exposed in the dashboard.",
        "fileInventory": [d["sourceFile"] for d in datasets],
        "totals": {
            "datasets": len(datasets),
            "rows": total_rows,
            "maxColumns": total_columns_max,
        },
        "datasets": datasets,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    print(f"  {len(datasets)} datasets, {total_rows:,} total rows")
    for ds in datasets:
        print(f"  [{ds['category']}] {ds['label']}: {ds['rowCount']:,} rows × {ds['columnCount']} cols ← {ds['sourceFile']}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Aggregate USC ADRC RPPR data package into dashboard JSON."""

from __future__ import annotations

import csv
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from reporting_window import EAC_YTD_AS_OF

ROOT = Path(__file__).resolve().parent.parent
PKG = ROOT / "data" / "rppr-data-package"
OUTPUT = ROOT / "src" / "data" / "rpprDataPackage.json"
META_OUTPUT = ROOT / "src" / "data" / "rpprDataPackageMeta.json"

BRS_STATUS_LABELS = {
    "1": "Active / enrolled",
    "3": "Deceased",
    "4": "Terminated",
    "6": "Other",
    "7": "Other",
    "": "Unknown",
}

REPORTING_PERIOD_LABEL = ""
REPORTING_PERIOD_START = datetime(2026, 1, 1)
REPORTING_PERIOD_END = datetime(2026, 1, 1, 23, 59, 59)
PACKAGE_RECEIVED_AT = "2026-09-16"
# James email supplements (BRS export, MAP dictionary, biospecimen availability).
SUPPLEMENT_RECEIVED_AT = "2026-10-09"
# Dashboard YTD end date — EAC-locked with Dr. Chui (see reporting_window.py).
DASHBOARD_YTD_AS_OF = EAC_YTD_AS_OF

BIOSPECIMEN_LONG_FILE = "USC_ADRC_Biospecimen_Availability_Long_v1.0.1.csv"
BIOSPECIMEN_SUMMARY_FILE = "USC_ADRC_Biospecimen_Subject_Summary_v1.0.1.csv"
BIOSPECIMEN_COMPONENTS = ("plasma", "serum", "buffy_coat", "csf")


def init_reporting_period_window(*, as_of: datetime | None = None) -> None:
    """Year-to-date window: Jan 1 through as_of (default: today, local date)."""
    global REPORTING_PERIOD_LABEL, REPORTING_PERIOD_START, REPORTING_PERIOD_END
    anchor = (as_of or datetime.now()).date()
    REPORTING_PERIOD_START = datetime(anchor.year, 1, 1)
    REPORTING_PERIOD_END = datetime(
        anchor.year, anchor.month, anchor.day, 23, 59, 59
    )
    REPORTING_PERIOD_LABEL = (
        f"1/1/{anchor.year} – {anchor.month}/{anchor.day}/{anchor.year}"
    )

FILE_DESCRIPTIONS: dict[str, str] = {
    "ADRC_subject_current_harmonized.csv": (
        "One row per participant with derived current status, demographics, "
        "latest cognitive/diagnostic fields, and Milestones-derived enrollment state."
    ),
    "UDS_longitudinal_harmonized.csv": (
        "Long-format harmonized UDS visits across NACC generations (V1–V4); "
        "wide table with all harmonized form variables per visit."
    ),
    "Milestones_history_harmonized.csv": (
        "Longitudinal Milestones events per participant (enrollment status changes, "
        "discontinuation, death, autopsy flags)."
    ),
    "milestones-v3-ded-07142026.csv": "NACC Milestones v3 data dictionary (field definitions).",
    "uds-v4-fvp-ded-08122026.csv": "NACC UDS v4 FVP form data dictionary.",
    "uds-v4-ivp-ded-08122026.csv": "NACC UDS v4 IVP form data dictionary.",
    "Integrated_Biomarker_Availability_v1.0.5.csv": (
        "Subject × collection × biomarker availability matrix (has_measurement flags)."
    ),
    "Integrated_Biomarker_Subject_Summary_v1.0.5.csv": (
        "One row per subject with plasma/CSF/NCRAD/C2N and ATN coverage flags."
    ),
    "Integrated_Biomarkers_Long_v1.0.5.csv": (
        "Long-format harmonized biomarker measurements with source provenance."
    ),
    "Integrated_Biomarker_Source_Catalog_v1.0.5.csv": (
        "Catalog of integrated source datasets, protocols, and measurement counts."
    ),
    "Integrated_Biomarker_Data_Dictionary_v1.0.5.csv": (
        "Field definitions for integrated biomarker deliverables."
    ),
    "MAPDatabase-BRSCohort_DATA_2026-09-16_1445.csv": (
        "REDCap MAP BRS cohort export — enrollment, consent, autopsy linkage (8-xxxx IDs)."
    ),
    BIOSPECIMEN_LONG_FILE: (
        "Long-format biospecimen collections (plasma, serum, buffy coat, CSF) with "
        "collection dates and aliquot counts — inventory pipeline, not assay results."
    ),
    BIOSPECIMEN_SUMMARY_FILE: (
        "One row per participant with biospecimen component flags and collection spans."
    ),
    "USC_ADRC_Biospecimen_Data_Dictionary_v1.0.1.csv": (
        "Field definitions for USC ADRC Biospecimen Availability deliverables."
    ),
    "MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv": (
        "REDCap MAP APOE genotype records with source attribution."
    ),
    "USC_ADRC_Harmonized_UDS_Collaborator_Report_v1.1.0.html": (
        "Collaborator-facing UDS harmonization report (QC, coverage, methodology)."
    ),
    "Integrated_Biomarker_Availability_Report_v1.0.5.html": (
        "Integrated biomarker availability report with coverage summaries."
    ),
    "USC_ADRC_Integrated_Imaging_Availability_v1.5.2.csv": (
        "Comprehensive master integrated imaging availability file."
    ),
    "USC_ADRC_Imaging_Availability_Subject_Level_v1.5.2.csv": (
        "Participant-level imaging availability flags (MRI, amyloid PET, tau PET, etc.)."
    ),
    "USC_ADRC_Imaging_Availability_Longitudinal_v1.5.2.csv": (
        "Subject × study_date × modality rows for dated imaging visits."
    ),
    "USC_ADRC_Imaging_Availability_Study_Subject_Level_v1.5.2.csv": (
        "Study-specific subject counts — do not sum across studies."
    ),
    "USC_ADRC_Imaging_Availability_Study_Summary_v1.5.2.csv": (
        "Study-level imaging availability summaries."
    ),
    "USC_ADRC_Imaging_Availability_Data_Dictionary_v1.5.2.csv": (
        "Field definitions for integrated imaging deliverables."
    ),
}

IMAGING_PACKAGE_VERSION = "v1.5.2"

MAX_COLUMN_PREVIEW = 40
MAX_BREAKDOWN_CATEGORIES = 250
MAX_BREAKDOWN_WITH_OTHER = 120

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

LIST_VALUE_COLUMNS = {
    "biomarkers_available",
    "source_families",
    "batch_return_numbers",
    "source_files",
}

LONGITUDINAL_META_COLUMNS = [
    "source_generation",
    "adcid",
    "visitnum",
    "packet",
    "formver",
    "modcomm",
    "module",
    "visitdate",
]


def latest_brs_cohort_csv() -> Path:
    candidates = sorted(PKG.glob("MAPDatabase-BRSCohort_DATA_*.csv"))
    if not candidates:
        raise FileNotFoundError(f"No MAPDatabase-BRSCohort_DATA_*.csv under {PKG}")
    return candidates[-1]


def latest_map_data_dictionary_csv() -> Path | None:
    candidates = sorted(PKG.glob("MAPDatabase_DataDictionary_*.csv"))
    return candidates[-1] if candidates else None


def biospecimen_row_in_period(row: dict[str, str]) -> bool:
    return row_in_reporting_period(row, "collection_date") or row_in_reporting_period(
        row, "specimen_date"
    )


def summarize_biospecimen_component_rows(rows: list[dict[str, str]], *, period_only: bool) -> dict:
    by_component: dict[str, dict[str, int]] = {}
    for component in BIOSPECIMEN_COMPONENTS:
        comp_rows = [
            r
            for r in rows
            if (r.get("component") or "").strip() == component
            and (biospecimen_row_in_period(r) if period_only else True)
        ]
        subjects = {r.get("uds_id") for r in comp_rows if r.get("uds_id")}
        aliquots = 0
        for row in comp_rows:
            try:
                aliquots += int(float(row.get("aliquot_count") or 0))
            except ValueError:
                continue
        by_component[component] = {
            "participants": len(subjects),
            "aliquots": aliquots,
            "collectionRows": len(comp_rows),
        }
    return by_component


def build_biospecimen_reporting_period(rows: list[dict[str, str]]) -> dict:
    ytd = summarize_biospecimen_component_rows(rows, period_only=True)
    cumulative = summarize_biospecimen_component_rows(rows, period_only=False)
    return {
        "sourceFile": BIOSPECIMEN_LONG_FILE,
        "supplementReceivedAt": SUPPLEMENT_RECEIVED_AT,
        "dateFields": ["collection_date", "specimen_date"],
        "byComponentYtd": ytd,
        "byComponentCumulative": cumulative,
        "definitions": {
            "participants": "Unique uds_id with ≥1 collection row dated in reporting period",
            "aliquots": "Sum of aliquot_count on in-period collection rows",
            "note": (
                "Specimen inventory pipeline — separate from Integrated_Biomarkers_Long "
                "assay availability."
            ),
        },
    }


def write_brs_recruitment_constants(*, brs_path: Path, brs_rows: list[dict[str, str]]) -> None:
    active = [
        r for r in brs_rows if (r.get("subject_brs_status") or "").strip() == "1"
    ]
    hispanic = sum(1 for r in active if (r.get("subject_basic_hispanic") or "") == "1")
    non_hispanic = sum(1 for r in active if (r.get("subject_basic_hispanic") or "") == "0")
    unknown_hispanic = len(active) - hispanic - non_hispanic
    male = sum(1 for r in active if (r.get("map_subject_gender") or "") == "1")
    female = sum(1 for r in active if (r.get("map_subject_gender") or "") == "2")
    out_path = ROOT / "src" / "data" / "recruitmentChartConstants.ts"
    content = f"""/** MAP BRS REDCap · subject_brs_status = 1 (Active) · auto-generated from {brs_path.name}. */
export const BRS_ACTIVE_COHORT = {{
  exportFile: "{brs_path.name}",
  activeRows: {len(active)},
  rpprHeadlineEnrolled: 231,
  hispanicLatino: [
    {{ label: "Hispanic", count: {hispanic} }},
    {{ label: "Non-Hispanic", count: {non_hispanic} }},
    {{ label: "Unknown", count: {unknown_hispanic} }},
  ],
  sex: [
    {{ label: "Male", count: {male} }},
    {{ label: "Female", count: {female} }},
  ],
}} as const;

/**
 * Legacy RPPR registry APOE layout (previously shown for BRS cumulative pie).
 * Dashboard red = not in harmonized export / unverified placeholder.
 */
export const BRS_LEGACY_APOE_PIE = [
  {{ label: "E3/E3", count: 72 }},
  {{ label: "E3/E4", count: 61 }},
  {{ label: "Other", count: 98 }},
] as const;

/** GeneScreen YTD ethnicity rows at 0 until export is wired. */
export const GENESCREEN_YTD_LEGACY_ETHNICITY = [
  {{ label: "Hispanic", count: 0 }},
  {{ label: "White", count: 0 }},
  {{ label: "Black", count: 0 }},
  {{ label: "Asian", count: 0 }},
] as const;

export const LEGACY_RED_CHART_CAPTION =
  "Legacy / not in harmonized export · red = unverified placeholder";

/** RPPR Table 1 race/ethnicity row Ns (overall cohort N=573). */
export const TABLE1_ETHNICITY_BARS = [
  {{ label: "Hispanic", count: 192 }},
  {{ label: "White", count: 242 }},
  {{ label: "Black", count: 36 }},
  {{ label: "Asian", count: 65 }},
] as const;
"""
    out_path.write_text(content, encoding="utf-8")


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        columns = reader.fieldnames or []
        return columns, list(reader)


def parse_row_date(value: str | None) -> datetime | None:
    if not value or not str(value).strip():
        return None
    text = str(value).strip()[:10]
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None


def max_row_date(rows: list[dict[str, str]], date_fields: list[str]) -> str | None:
    latest: datetime | None = None
    for row in rows:
        for field in date_fields:
            parsed = parse_row_date(row.get(field))
            if parsed and (latest is None or parsed > latest):
                latest = parsed
    return latest.strftime("%Y-%m-%d") if latest else None


def row_in_reporting_period(row: dict[str, str], date_field: str) -> bool:
    parsed = parse_row_date(row.get(date_field))
    if not parsed:
        return False
    return REPORTING_PERIOD_START <= parsed <= REPORTING_PERIOD_END


def visit_participant_id(row: dict[str, str]) -> str:
    return (
        row.get("naccid")
        or row.get("adcid")
        or row.get("ptid")
        or row.get("uds_id")
        or ""
    )


REFERSC_LABELS: dict[str, str] = {
    "1": "Self-referral",
    "2": "Non-professional contact",
    "3": "Prior ADRC participant",
    "4": "ADRC clinician / staff",
    "5": "Non-ADRC healthcare professional",
    "6": "Other research study staff",
    "8": "Other referral source",
    "9": "Unknown referral source",
}


def race_chart_label(summary: str | None) -> str:
    """Dashboard ethnicity bars — harmonized subject race/ethnicity summary."""
    text = (summary or "").strip()
    if not text:
        return "Unknown / not reported"
    if text == "White":
        return "White"
    if text == "Hispanic or Latino":
        return "Hispanic"
    if text == "Asian":
        return "Asian"
    if "Black" in text or "African American" in text:
        return "Black"
    return text


def format_apoe_genotype_label(comb: str) -> str:
    alleles: list[str] = []
    for part in comb.split("/"):
        token = part.strip().lower().lstrip("e")
        if token.isdigit():
            alleles.append(f"E{token}")
    return "/".join(alleles) if alleles else comb.strip()


def counter_to_chart_items(counter: Counter, *, sort: str = "count") -> list[dict]:
    pairs = [(label, count) for label, count in counter.items() if count > 0]
    if sort == "label":
        pairs.sort(key=lambda x: x[0].lower())
    else:
        pairs.sort(key=lambda x: (-x[1], x[0].lower()))
    return [{"label": label, "count": count} for label, count in pairs]


def build_new_initial_evaluation_breakdown(
    initial_visits: list[dict[str, str]],
    *,
    subject_by_naccid: dict[str, dict[str, str]],
    apoe_by_visit_ptid: dict[str, str],
) -> dict:
    """Demographics for packet=I visits in the reporting window (same n as newInitialEvaluations)."""
    race = Counter()
    apoe = Counter()
    referral = Counter()

    for visit in initial_visits:
        naccid = (visit.get("naccid") or "").strip()
        subject = subject_by_naccid.get(naccid, {})
        race[race_chart_label(subject.get("der_current_race_ethnicity_summary"))] += 1

        ptid = (visit.get("ptid") or subject.get("ptid") or "").strip()
        comb = apoe_by_visit_ptid.get(ptid)
        if comb:
            apoe[format_apoe_genotype_label(comb)] += 1
        else:
            apoe["Genotype not in MAP APOE export"] += 1

        ref_code = (visit.get("refersc") or "").strip()
        referral[REFERSC_LABELS.get(ref_code, f"refersc={ref_code or 'blank'}")] += 1

    return {
        "byRaceEthnicity": counter_to_chart_items(race),
        "byApoeGenotype": counter_to_chart_items(apoe),
        "byReferralSource": counter_to_chart_items(referral),
        "sources": {
            "raceEthnicity": (
                "ADRC_subject_current_harmonized.csv · der_current_race_ethnicity_summary "
                "joined on naccid"
            ),
            "apoeGenotype": (
                "MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv · apoe_comb "
                "joined on visit ptid = uds_id"
            ),
            "referralSource": (
                "UDS_longitudinal_harmonized.csv · refersc (NACC Form A1 principal referral source)"
            ),
        },
    }


def collapse_race_ethnicity(label: str | None) -> str:
    text = (label or "").strip()
    if not text:
        return "Unknown / blank"
    lower = text.lower()
    if "hispanic" in lower or "latino" in lower:
        return "Hispanic or Latino"
    if "black" in lower or "african american" in lower:
        return "Black or African American"
    if "asian" in lower:
        return "Asian"
    if "american indian" in lower or "alaska native" in lower:
        return "American Indian or Alaska Native"
    if "native hawaiian" in lower or "pacific islander" in lower:
        return "Native Hawaiian or Pacific Islander"
    if text == "White":
        return "White (non-Hispanic)"
    if "white" in lower:
        return "Multiracial / other (includes White)"
    if "don't know" in lower or "unknown" in lower:
        return "Unknown / not reported"
    return "Other / multiracial"


def build_reporting_period_summary(
    *,
    uds_long_rows: list[dict[str, str]],
    uds_subject_rows: list[dict[str, str]],
    apoe_rows: list[dict[str, str]],
    bio_long_rows: list[dict[str, str]],
    brs_rows: list[dict[str, str]],
    brs_source_file: str,
    biospecimen_long_rows: list[dict[str, str]] | None = None,
) -> dict:
    period_visits = [
        r
        for r in uds_long_rows
        if row_in_reporting_period(r, "visit_date")
        or row_in_reporting_period(r, "visitdate")
    ]

    initial_visits = [r for r in period_visits if (r.get("packet") or "").strip() == "I"]
    follow_up_visits = [r for r in period_visits if (r.get("packet") or "").strip() != "I"]

    subject_by_naccid = {
        (r.get("naccid") or "").strip(): r
        for r in uds_subject_rows
        if (r.get("naccid") or "").strip()
    }
    apoe_by_visit_ptid = {
        (r.get("uds_id") or "").strip(): (r.get("apoe_comb") or "").strip()
        for r in apoe_rows
        if (r.get("uds_id") or "").strip() and (r.get("apoe_comb") or "").strip()
    }
    new_initial_breakdown = build_new_initial_evaluation_breakdown(
        initial_visits,
        subject_by_naccid=subject_by_naccid,
        apoe_by_visit_ptid=apoe_by_visit_ptid,
    )
    in_person_follow_up = [
        r for r in follow_up_visits if str(r.get("modea1") or "").strip() == "1"
    ]
    remote_follow_up = [
        r for r in follow_up_visits if str(r.get("modea1") or "").strip() in {"2", "3"}
    ]

    period_bio = [r for r in bio_long_rows if row_in_reporting_period(r, "collection_date")]
    bio_subjects = {r.get("uds_id") for r in period_bio if r.get("uds_id")}
    plasma_rows = [r for r in period_bio if (r.get("specimen_type") or "").lower() == "plasma"]
    csf_rows = [r for r in period_bio if (r.get("specimen_type") or "").lower() == "csf"]
    plasma_subjects = {r.get("uds_id") for r in plasma_rows if r.get("uds_id")}
    csf_subjects = {r.get("uds_id") for r in csf_rows if r.get("uds_id")}

    brs_consents = [
        r for r in brs_rows if row_in_reporting_period(r, "autopsy_consent_date")
    ]
    brs_autopsies = [
        r for r in brs_rows if row_in_reporting_period(r, "autopsy_performed_date")
    ]
    brs_terminations_ytd = [
        r for r in brs_rows if row_in_reporting_period(r, "date_of_termination")
    ]
    brs_active_enrolled = sum(
        1 for r in brs_rows if (r.get("subject_brs_status") or "").strip() == "1"
    )
    brs_with_autopsy_number = sum(
        1 for r in brs_rows if (r.get("autopsy_number") or "").strip()
    )
    brs_cumulative_autopsies_flagged = sum(
        1 for r in brs_rows if (r.get("autopsy_performed") or "").strip() == "1"
    )

    ncrad_by_label = Counter(
        (r.get("biomarker") or "").strip()
        for r in plasma_rows
        if (r.get("biomarker") or "").strip()
    )
    ncrad_plasma_measurements = {
        "ab40": ncrad_by_label.get("ABeta40", 0),
        "ab42": ncrad_by_label.get("ABeta42", 0),
        "gfap": ncrad_by_label.get("GFAP", 0),
        "nfl": ncrad_by_label.get("NFL", 0),
        "ptau217": ncrad_by_label.get("Ptau217", 0) or ncrad_by_label.get("PTAU217", 0),
    }

    data_coverage = {
        "packageReceivedAt": PACKAGE_RECEIVED_AT,
        "udsLatestVisitDate": max_row_date(uds_long_rows, ["visit_date", "visitdate"]),
        "biomarkerLatestCollectionDate": max_row_date(bio_long_rows, ["collection_date"]),
        "brsLatestActivityDate": max_row_date(
            brs_rows,
            [
                "autopsy_consent_date",
                "autopsy_performed_date",
                "date_of_death",
                "date_of_termination",
            ],
        ),
    }

    result: dict = {
        "label": REPORTING_PERIOD_LABEL,
        "startDate": REPORTING_PERIOD_START.strftime("%Y-%m-%d"),
        "endDate": REPORTING_PERIOD_END.strftime("%Y-%m-%d"),
        "periodKind": "year_to_date",
        "packageReceivedAt": PACKAGE_RECEIVED_AT,
        "supplementReceivedAt": SUPPLEMENT_RECEIVED_AT,
        "note": (
            f"Year-to-date counts from row-level dates in the package CSVs (received "
            f"{PACKAGE_RECEIVED_AT}; BRS & biospecimen supplements {SUPPLEMENT_RECEIVED_AT}). "
            f"The export is a snapshot — activity after delivery is not in these files."
        ),
        "dataCoverage": data_coverage,
        "udsClinical": {
            "sourceFile": "UDS_longitudinal_harmonized.csv",
            "dateFields": ["visit_date", "visitdate"],
            "newInitialEvaluations": len(initial_visits),
            "followUpInPerson": len(in_person_follow_up),
            "followUpRemote": len(remote_follow_up),
            "totalVisitRecords": len(period_visits),
            "uniqueParticipantsWithVisit": len(
                {visit_participant_id(r) for r in period_visits if visit_participant_id(r)}
            ),
            "definitions": {
                "newInitialEvaluations": "Visit records with packet=I and visit_date in period",
                "followUpInPerson": "Non-initial visit records with modea1=1 (in person)",
                "followUpRemote": "Non-initial visit records with modea1=2 or 3 (telephone/video)",
            },
            "newInitialEvaluationBreakdown": new_initial_breakdown,
        },
        "biomarkers": {
            "sourceFile": "Integrated_Biomarkers_Long_v1.0.5.csv",
            "dateField": "collection_date",
            "subjectsWithCollection": len(bio_subjects),
            "subjectsWithPlasmaCollection": len(plasma_subjects),
            "subjectsWithCsfCollection": len(csf_subjects),
            "measurementRows": len(period_bio),
            "plasmaMeasurementRows": len(plasma_rows),
            "csfMeasurementRows": len(csf_rows),
            "ncradPlasmaMeasurements": ncrad_plasma_measurements,
            "definitions": {
                "subjectsWithCollection": "Unique uds_id with any collection_date in period",
                "subjectsWithPlasmaCollection": "Unique uds_id with plasma collection_date in period",
                "ncradPlasmaMeasurements": (
                    "Plasma measurement rows in period from Integrated_Biomarkers_Long "
                    "by biomarker label (NCRAD panel)"
                ),
            },
        },
        "brsAutopsy": {
            "sourceFile": brs_source_file,
            "supplementReceivedAt": SUPPLEMENT_RECEIVED_AT,
            "newAutopsyConsents": len(brs_consents),
            "autopsiesPerformed": len(brs_autopsies),
            "activeEnrolled": brs_active_enrolled,
            "withdrawalsYtd": len(brs_terminations_ytd),
            "withAutopsyCaseNumber": brs_with_autopsy_number,
            "cumulativeAutopsiesFlagged": brs_cumulative_autopsies_flagged,
            "definitions": {
                "newAutopsyConsents": "Rows with autopsy_consent_date in period",
                "autopsiesPerformed": "Rows with autopsy_performed_date in period",
                "activeEnrolled": (
                    "Rows with subject_brs_status=1 (Active) in export snapshot — "
                    "confirm RPPR cumulative enrollment definition with Neuropath Core"
                ),
                "withdrawalsYtd": "Rows with date_of_termination in reporting period",
                "withAutopsyCaseNumber": "Rows with non-blank autopsy_number",
                "cumulativeAutopsiesFlagged": "Rows with autopsy_performed=1 (all time in export)",
            },
        },
    }
    if biospecimen_long_rows:
        result["biospecimenInventory"] = build_biospecimen_reporting_period(
            biospecimen_long_rows
        )
    return result


def _nacc_registry_verified(row: dict[str, str]) -> bool:
    return (row.get("nacc_registry_verified") or "").strip().upper() == "TRUE"


def _imaging_modality_flags(row: dict[str, str]) -> tuple[bool, bool, bool]:
    """Return (mri_family, amyloid_pet, tau_pet) for a longitudinal row."""
    mod = (row.get("detailed_modality") or "").strip()
    grp = (row.get("analysis_modality_group") or "").strip()
    mri = grp == "MRI" or mod in {"MRI", "DTI", "fMRI"}
    amyloid = mod == "Amyloid PET"
    tau = mod == "Tau PET"
    return mri, amyloid, tau


def build_imaging_reporting_period(
    *,
    imaging_long_rows: list[dict[str, str]],
    imaging_study_subject_rows: list[dict[str, str]],
) -> dict:
    study_subjects: dict[str, set[str]] = {}
    for row in imaging_study_subject_rows:
        study = (row.get("study") or "").strip()
        subject_key = (row.get("subject_key") or "").strip()
        if not study or not subject_key or not _nacc_registry_verified(row):
            continue
        study_subjects.setdefault(study, set()).add(subject_key)

    def study_counts(study_label: str) -> dict:
        members = study_subjects.get(study_label, set())
        mri_participants: set[str] = set()
        amyloid_participants: set[str] = set()
        tau_participants: set[str] = set()
        for row in imaging_long_rows:
            subject_key = (row.get("subject_key") or "").strip()
            if subject_key not in members:
                continue
            if not _nacc_registry_verified(row):
                continue
            if not row_in_reporting_period(row, "study_date"):
                continue
            mri, amyloid, tau = _imaging_modality_flags(row)
            if mri:
                mri_participants.add(subject_key)
            if amyloid:
                amyloid_participants.add(subject_key)
            if tau:
                tau_participants.add(subject_key)
        return {
            "studyLabel": study_label,
            "participantsWithMri": len(mri_participants),
            "participantsWithAmyloidPet": len(amyloid_participants),
            "participantsWithTauPet": len(tau_participants),
            "definitions": {
                "participantsWithMri": (
                    "Unique subject_key with ≥1 MRI-family row (MRI/DTI/fMRI), "
                    "study_date in period, nacc_registry_verified=TRUE on study row and visit row"
                ),
                "participantsWithAmyloidPet": (
                    "Unique subject_key with ≥1 verified Amyloid PET row dated in period"
                ),
                "participantsWithTauPet": (
                    "Unique subject_key with ≥1 verified Tau PET row dated in period"
                ),
            },
        }

    return {
        "packageVersion": IMAGING_PACKAGE_VERSION,
        "identityFilter": "nacc_registry_verified",
        "sourceFiles": {
            "longitudinal": "USC_ADRC_Imaging_Availability_Longitudinal_v1.5.2.csv",
            "studySubjectLevel": (
                "USC_ADRC_Imaging_Availability_Study_Subject_Level_v1.5.2.csv"
            ),
        },
        "dateField": "study_date",
        "scanStudy": study_counts("SCAN"),
        "claritiStudy": study_counts("CLARiTI"),
        "note": (
            "Study-specific participant counts for the reporting period. Only subjects "
            "with nacc_registry_verified=TRUE (official USC NACC identifier registry) on "
            "both the study-subject row and each counted longitudinal row. Do not sum "
            "SCAN and CLARiTI."
        ),
        "dataCoverage": {
            "imagingLatestStudyDate": max_row_date(imaging_long_rows, ["study_date"]),
        },
    }


INTEGRATED_IMAGING_STUDY_FOCUS = ("SCAN", "CLARiTI", "USC ADRC")


def _csv_int(row: dict[str, str], key: str) -> int:
    raw = (row.get(key) or "").strip().replace(",", "")
    if not raw:
        return 0
    try:
        return int(float(raw))
    except ValueError:
        return 0


def build_imaging_integrated_study_summary(
    study_summary_rows: list[dict[str, str]],
) -> dict:
    """James USC ADRC Integrated Imaging Availability · Study_Summary file."""
    studies = []
    for row in study_summary_rows:
        study = (row.get("study") or "").strip()
        if study not in INTEGRATED_IMAGING_STUDY_FOCUS:
            continue
        studies.append(
            {
                "study": study,
                "uniqueSubjects": _csv_int(row, "unique_subjects"),
                "naccRegistryVerifiedSubjects": _csv_int(
                    row, "nacc_registry_verified_subjects"
                ),
                "subjectsWithMri": _csv_int(row, "subjects_with_mri"),
                "subjectsWithAmyloidPet": _csv_int(row, "subjects_with_amyloid_pet"),
                "subjectsWithTauPet": _csv_int(row, "subjects_with_tau_pet"),
            }
        )
    order = {name: i for i, name in enumerate(INTEGRATED_IMAGING_STUDY_FOCUS)}
    studies.sort(key=lambda s: order.get(s["study"], 99))
    return {
        "packageVersion": IMAGING_PACKAGE_VERSION,
        "sourceFile": "USC_ADRC_Imaging_Availability_Study_Summary_v1.5.2.csv",
        "note": (
            "Study-level integrated availability from James Integrated Imaging v1.5.2. "
            "nacc_registry_verified_subjects = identity QC in the official NACC registry. "
            "Modality subject counts are package-wide (not calendar YTD). "
            "YTD SCAN/CLARITi participant progress is in imaging.scanStudy / claritiStudy."
        ),
        "studies": studies,
    }


def build_imaging_ytd_integrated_study_summary(
    *,
    imaging_long_rows: list[dict[str, str]],
    imaging_study_subject_rows: list[dict[str, str]],
) -> dict:
    """Calendar YTD rollups by study — same James longitudinal + study-subject files."""
    study_subjects: dict[str, set[str]] = {}
    for row in imaging_study_subject_rows:
        study = (row.get("study") or "").strip()
        subject_key = (row.get("subject_key") or "").strip()
        if not study or not subject_key or not _nacc_registry_verified(row):
            continue
        study_subjects.setdefault(study, set()).add(subject_key)

    studies = []
    for study_label in INTEGRATED_IMAGING_STUDY_FOCUS:
        members = study_subjects.get(study_label, set())
        mri_participants: set[str] = set()
        amyloid_participants: set[str] = set()
        tau_participants: set[str] = set()
        active_nacc: set[str] = set()

        for row in imaging_long_rows:
            subject_key = (row.get("subject_key") or "").strip()
            if subject_key not in members or not _nacc_registry_verified(row):
                continue
            if not row_in_reporting_period(row, "study_date"):
                continue
            active_nacc.add(subject_key)
            mri, amyloid, tau = _imaging_modality_flags(row)
            if mri:
                mri_participants.add(subject_key)
            if amyloid:
                amyloid_participants.add(subject_key)
            if tau:
                tau_participants.add(subject_key)

        studies.append(
            {
                "study": study_label,
                "uniqueSubjects": len(active_nacc),
                "naccRegistryVerifiedSubjects": len(active_nacc),
                "subjectsWithMri": len(mri_participants),
                "subjectsWithAmyloidPet": len(amyloid_participants),
                "subjectsWithTauPet": len(tau_participants),
            }
        )

    return {
        "packageVersion": IMAGING_PACKAGE_VERSION,
        "sourceFiles": {
            "longitudinal": "USC_ADRC_Imaging_Availability_Longitudinal_v1.5.2.csv",
            "studySubjectLevel": (
                "USC_ADRC_Imaging_Availability_Study_Subject_Level_v1.5.2.csv"
            ),
        },
        "dateField": "study_date",
        "note": (
            "Calendar YTD counts from James Integrated Imaging longitudinal rows "
            "(nacc_registry_verified=TRUE, study_date in reporting window). "
            "Replaces RPPR-only interpretation for progress within the window."
        ),
        "studies": studies,
    }


def _count_period_rows(
    rows: list[dict[str, str]], date_field: str
) -> tuple[int, int]:
    matching = [r for r in rows if row_in_reporting_period(r, date_field)]
    participants = {visit_participant_id(r) for r in matching if visit_participant_id(r)}
    return len(matching), len(participants)


def _subject_collection_touches_period(row: dict[str, str]) -> bool:
    first = parse_row_date(row.get("first_collection_date"))
    latest = parse_row_date(row.get("latest_collection_date"))
    if first and REPORTING_PERIOD_START <= first <= REPORTING_PERIOD_END:
        return True
    if latest and REPORTING_PERIOD_START <= latest <= REPORTING_PERIOD_END:
        return True
    if first and latest and first <= REPORTING_PERIOD_START and latest >= REPORTING_PERIOD_END:
        return True
    return False


def build_reporting_period_additional(
    *,
    uds_subject_rows: list[dict[str, str]],
    milestones_rows: list[dict[str, str]],
    brs_rows: list[dict[str, str]],
    brs_source_file: str,
    bio_avail_rows: list[dict[str, str]],
    bio_summary_rows: list[dict[str, str]],
    biospecimen_long_rows: list[dict[str, str]] | None = None,
) -> dict:
    milestone_visit_rows, milestone_visit_participants = _count_period_rows(
        milestones_rows, "visit_date"
    )
    milestone_death_rows, milestone_death_participants = _count_period_rows(
        milestones_rows, "der_death_date"
    )
    milestone_disc_rows, milestone_disc_participants = _count_period_rows(
        milestones_rows, "der_discontinuation_date"
    )
    milestone_status_rows, milestone_status_participants = _count_period_rows(
        milestones_rows, "der_status_change_date"
    )

    brs_deaths, _ = _count_period_rows(brs_rows, "date_of_death")
    brs_terminations, _ = _count_period_rows(brs_rows, "date_of_termination")

    subj_first_visit, _ = _count_period_rows(
        uds_subject_rows, "der_first_uds_visit_date"
    )
    subj_latest_visit, _ = _count_period_rows(
        uds_subject_rows, "der_latest_uds_visit_date"
    )
    subj_death, _ = _count_period_rows(uds_subject_rows, "der_status_death_date")
    subj_disc, _ = _count_period_rows(
        uds_subject_rows, "der_status_latest_discontinuation_date"
    )
    subj_milestone, _ = _count_period_rows(
        uds_subject_rows, "der_status_latest_milestone_date"
    )

    avail_rows, avail_subjects = _count_period_rows(bio_avail_rows, "collection_date")
    summary_first, _ = _count_period_rows(bio_summary_rows, "first_collection_date")
    summary_latest, _ = _count_period_rows(bio_summary_rows, "latest_collection_date")
    summary_span = sum(1 for r in bio_summary_rows if _subject_collection_touches_period(r))

    domains: list[dict] = [
            {
                "id": "milestones",
                "title": "Milestones history",
                "sourceFile": "Milestones_history_harmonized.csv",
                "dateHint": "Enrollment status, death, and discontinuation events",
                "metrics": [
                    {
                        "label": "Milestone visit records (visit_date)",
                        "value": milestone_visit_rows,
                        "participants": milestone_visit_participants,
                    },
                    {
                        "label": "Death records (der_death_date)",
                        "value": milestone_death_rows,
                        "participants": milestone_death_participants,
                    },
                    {
                        "label": "Discontinuation records (der_discontinuation_date)",
                        "value": milestone_disc_rows,
                        "participants": milestone_disc_participants,
                    },
                    {
                        "label": "Status change records (der_status_change_date)",
                        "value": milestone_status_rows,
                        "participants": milestone_status_participants,
                    },
                ],
                "footnote": (
                    "Milestone rows are event history — one participant may have "
                    "multiple records in the period."
                ),
            },
            {
                "id": "brs-dates",
                "title": "BRS cohort — other dated events",
                "sourceFile": brs_source_file,
                "dateHint": "Death and termination dates (consent/autopsy counts are in the section above)",
                "metrics": [
                    {"label": "Deaths (date_of_death)", "value": brs_deaths},
                    {"label": "Terminations (date_of_termination)", "value": brs_terminations},
                ],
            },
            {
                "id": "uds-subjects",
                "title": "UDS current subject file — derived status dates",
                "sourceFile": "ADRC_subject_current_harmonized.csv",
                "dateHint": "One row per subject; dates reflect derived latest/first status",
                "metrics": [
                    {
                        "label": "Subjects with first UDS visit in period",
                        "value": subj_first_visit,
                    },
                    {
                        "label": "Subjects whose latest UDS visit falls in period",
                        "value": subj_latest_visit,
                    },
                    {
                        "label": "Subjects with derived death date in period",
                        "value": subj_death,
                    },
                    {
                        "label": "Subjects with derived discontinuation date in period",
                        "value": subj_disc,
                    },
                    {
                        "label": "Subjects with latest milestone date in period",
                        "value": subj_milestone,
                    },
                ],
                "footnote": (
                    "Subject-level dates differ from longitudinal visit row counts — "
                    "e.g. latest visit date tags subjects active in period, not visit volume."
                ),
            },
            {
                "id": "biomarker-availability",
                "title": "Biomarker availability matrix",
                "sourceFile": "Integrated_Biomarker_Availability_v1.0.5.csv",
                "dateHint": "Subject × biomarker rows filtered on collection_date",
                "metrics": [
                    {
                        "label": "Availability rows with collection in period",
                        "value": avail_rows,
                        "participants": avail_subjects,
                    },
                ],
                "footnote": (
                    "Row count is matrix slots (subject × biomarker), not unique draws. "
                    "Long-format measurement counts are in the section above."
                ),
            },
            {
                "id": "biomarker-subject-summary",
                "title": "Biomarker subject summary",
                "sourceFile": "Integrated_Biomarker_Subject_Summary_v1.0.5.csv",
                "dateHint": "Subject-level first and latest collection dates",
                "metrics": [
                    {
                        "label": "Subjects with first collection in period",
                        "value": summary_first,
                    },
                    {
                        "label": "Subjects with latest collection in period",
                        "value": summary_latest,
                    },
                    {
                        "label": "Subjects with collection span touching period",
                        "value": summary_span,
                    },
                ],
                "footnote": (
                    "Span touching period includes subjects whose first/latest collection "
                    "range overlaps the year-to-date window."
                ),
            },
            {
                "id": "apoe-genotype",
                "title": "MAP APOE genotype export",
                "sourceFile": "MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv",
                "dateHint": "No event or collection dates in this export",
                "metrics": [],
                "footnote": (
                    "2,173 genotype rows with source attribution — not period-filterable "
                    "until a dated field is added to the REDCap export."
                ),
            },
    ]
    if biospecimen_long_rows:
        bio_ytd = build_biospecimen_reporting_period(biospecimen_long_rows)
        component_labels = {
            "plasma": "Plasma",
            "serum": "Serum",
            "buffy_coat": "Buffy coat",
            "csf": "CSF",
        }
        bio_metrics: list[dict] = []
        for key, label in component_labels.items():
            stats = bio_ytd["byComponentYtd"].get(key) or {}
            bio_metrics.append(
                {
                    "label": f"{label} collections (participants)",
                    "value": stats.get("participants", 0),
                }
            )
            bio_metrics.append(
                {
                    "label": f"{label} collections (aliquots)",
                    "value": stats.get("aliquots", 0),
                }
            )
        domains.insert(
            2,
            {
                "id": "biospecimen-inventory",
                "title": "Biospecimen availability — collection inventory",
                "sourceFile": BIOSPECIMEN_LONG_FILE,
                "dateHint": "collection_date / specimen_date in YTD window",
                "metrics": bio_metrics,
                "footnote": (
                    "James Oct 2026 supplement — inventory pipeline, not Integrated_Biomarkers_Long."
                ),
            },
        )

    return {
        "label": REPORTING_PERIOD_LABEL,
        "startDate": REPORTING_PERIOD_START.strftime("%Y-%m-%d"),
        "endDate": REPORTING_PERIOD_END.strftime("%Y-%m-%d"),
        "periodKind": "year_to_date",
        "packageReceivedAt": PACKAGE_RECEIVED_AT,
        "supplementReceivedAt": SUPPLEMENT_RECEIVED_AT,
        "note": (
            "Additional row-level date fields from other package CSVs, filtered to the "
            "same year-to-date window as the section above."
        ),
        "dataCoverage": {
            "packageReceivedAt": PACKAGE_RECEIVED_AT,
            "milestonesLatestVisitDate": max_row_date(
                milestones_rows, ["visit_date"]
            ),
        },
        "domains": domains,
    }


def counter_dict(counter: Counter, limit: int | None = None) -> dict[str, int]:
    items = counter.most_common(limit) if limit else counter.most_common()
    return {str(k): v for k, v in items}


def _merge_labeled_counter(counter: Counter, labels: dict[str, str]) -> Counter:
    merged: Counter = Counter()
    for key, count in counter.items():
        label = labels.get(str(key), str(key) or "Unknown")
        merged[label] += count
    return merged


def _blank_label(value: str | None) -> str:
    if value is None or str(value).strip() == "":
        return "(blank)"
    return str(value)


def _split_list_values(value: str | None, *, delimiter: str = ";") -> list[str]:
    if not value or not str(value).strip():
        return []
    return [part.strip() for part in str(value).split(delimiter) if part.strip()]


def _counter_for_column(rows: list[dict[str, str]], column: str) -> Counter:
    if column in LIST_VALUE_COLUMNS:
        counter: Counter = Counter()
        for row in rows:
            tokens = _split_list_values(row.get(column))
            if not tokens:
                counter["(blank)"] += 1
            else:
                for token in tokens:
                    counter[token] += 1
        return counter

    return Counter(_blank_label(row.get(column)) for row in rows)


def _numeric_stats(values: list[float]) -> dict[str, float | int]:
    if not values:
        return {"count": 0}
    return {
        "count": len(values),
        "min": round(min(values), 4),
        "max": round(max(values), 4),
        "mean": round(sum(values) / len(values), 4),
        "sum": round(sum(values), 4),
    }


def _breakdown_from_counter(counter: Counter) -> dict[str, int]:
    if len(counter) <= MAX_BREAKDOWN_CATEGORIES:
        return counter_dict(counter)

    top = counter.most_common(MAX_BREAKDOWN_WITH_OTHER)
    rest = counter.most_common()[MAX_BREAKDOWN_WITH_OTHER:]
    breakdown = {str(k): v for k, v in top}
    if rest:
        breakdown[f"Other ({len(rest)} categories)"] = sum(v for _, v in rest)
    return breakdown


def build_field_coverage(
    rows: list[dict[str, str]],
    *,
    include_columns: list[str] | None = None,
    exclude_columns: set[str] | None = None,
) -> dict:
    if not rows:
        return {"fieldBreakdowns": {}, "numericSummaries": {}, "fieldPresence": {}}

    columns = include_columns or list(rows[0].keys())
    exclude = exclude_columns or set()
    field_breakdowns: dict[str, dict[str, int]] = {}
    numeric_summaries: dict[str, dict[str, float | int]] = {}
    field_presence: dict[str, dict[str, int]] = {}

    for column in columns:
        if column in exclude or column in ID_COLUMNS:
            continue

        if column in DATE_LIKE_COLUMNS:
            non_blank = sum(1 for row in rows if _blank_label(row.get(column)) != "(blank)")
            field_presence[column] = {
                "nonBlank": non_blank,
                "blank": len(rows) - non_blank,
            }
            continue

        counter = _counter_for_column(rows, column)
        if column in LIST_VALUE_COLUMNS:
            field_breakdowns[column] = counter_dict(counter)
            field_presence[column] = {
                "nonBlank": sum(1 for row in rows if _split_list_values(row.get(column))),
                "blank": sum(1 for row in rows if not _split_list_values(row.get(column))),
                "tokenTotal": sum(counter.values()),
            }
            continue

        values = [row.get(column) or "" for row in rows]
        unique = len(set(_blank_label(v) for v in values))
        numeric_values: list[float] = []
        for value in values:
            if not value or not str(value).strip():
                continue
            try:
                numeric_values.append(float(value))
            except ValueError:
                numeric_values = []
                break

        if numeric_values and len(numeric_values) >= max(1, int(len(values) * 0.5)):
            if unique <= MAX_BREAKDOWN_CATEGORIES:
                field_breakdowns[column] = _breakdown_from_counter(counter)
            else:
                numeric_summaries[column] = _numeric_stats(numeric_values)
            continue

        if unique <= MAX_BREAKDOWN_CATEGORIES:
            field_breakdowns[column] = _breakdown_from_counter(counter)
        else:
            non_blank = sum(1 for value in values if _blank_label(value) != "(blank)")
            field_presence[column] = {
                "nonBlank": non_blank,
                "blank": len(rows) - non_blank,
                "uniqueValues": unique,
            }

    return {
        "fieldBreakdowns": field_breakdowns,
        "numericSummaries": numeric_summaries,
        "fieldPresence": field_presence,
    }


def attach_field_coverage(summary: dict, rows: list[dict[str, str]], **kwargs) -> dict:
    coverage = build_field_coverage(rows, **kwargs)
    summary.update(coverage)
    return summary


def file_meta(path: Path, *, relative_to_pkg: bool = False) -> dict:
    stat = path.stat()
    columns, _ = read_csv(path) if path.suffix.lower() == ".csv" else ([], [])
    column_preview = columns
    column_truncated = False
    if len(columns) > MAX_COLUMN_PREVIEW:
        column_preview = columns[:MAX_COLUMN_PREVIEW]
        column_truncated = True

    meta: dict = {
        "path": str(path.relative_to(ROOT)),
        "fileName": path.name,
        "rowCount": 0,
        "columnCount": len(columns),
        "fileSizeMb": round(stat.st_size / (1024 * 1024), 2),
        "fileModified": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d"),
        "description": FILE_DESCRIPTIONS.get(path.name, ""),
        "fileType": path.suffix.lower().lstrip(".") or "file",
    }

    if path.suffix.lower() == ".csv":
        meta["rowCount"] = max(sum(1 for _ in path.open(encoding="utf-8-sig")) - 1, 0)
        if columns:
            meta["columns"] = column_preview
            meta["columnTruncated"] = column_truncated

    if relative_to_pkg:
        try:
            meta["relativeDir"] = str(path.parent.relative_to(PKG))
        except ValueError:
            pass

    return meta


def summarize_brs(rows: list[dict[str, str]]) -> dict:
    status = Counter(r.get("subject_brs_status") or "" for r in rows)
    summary = {
        "totalRecords": len(rows),
        "activeEnrolled": status.get("1", 0),
        "deceased": status.get("3", 0),
        "terminated": status.get("4", 0),
        "withAutopsyConsent": sum(1 for r in rows if r.get("autopsy_consent_date")),
        "autopsiesPerformed": sum(1 for r in rows if r.get("autopsy_performed_date")),
        "byStatus": counter_dict(
            _merge_labeled_counter(status, BRS_STATUS_LABELS)
        ),
        "byGender": counter_dict(
            Counter(
                {"1": "Male", "2": "Female"}.get(r.get("map_subject_gender", ""), "Unknown")
                for r in rows
            )
        ),
        "hispanic": sum(1 for r in rows if r.get("subject_basic_hispanic") == "1"),
        "nonHispanic": sum(1 for r in rows if r.get("subject_basic_hispanic") == "0"),
        "withDateOfDeath": sum(1 for r in rows if r.get("date_of_death")),
        "withDateOfTermination": sum(1 for r in rows if r.get("date_of_termination")),
        "withAutopsyCaseNumber": sum(1 for r in rows if (r.get("autopsy_number") or "").strip()),
        "autopsyConsentFlagged": sum(
            1 for r in rows if (r.get("autopsy_consent") or "").strip() == "1"
        ),
        "autopsyPerformedFlagged": sum(
            1 for r in rows if (r.get("autopsy_performed") or "").strip() == "1"
        ),
        "autopsyFailureFlagged": sum(
            1 for r in rows if (r.get("autopsy_failure") or "").strip() not in ("", "97")
        ),
        "byEyeDonation": counter_dict(Counter(_blank_label(r.get("eye_donation")) for r in rows)),
        "byAutopsyConsentDiagnosis": counter_dict(
            Counter(_blank_label(r.get("autopsy_consent_diagnosis")) for r in rows)
        ),
        "byAutopsyFinalDiagnosis": counter_dict(
            Counter(_blank_label(r.get("autopsy_final_diagnosis")) for r in rows)
        ),
        "raceEthnicityNote": (
            "This REDCap export includes gender and subject_basic_hispanic only — not full "
            "race/ethnicity categories. See UDS harmonized subject file "
            "(der_current_race_ethnicity_summary) for complete race/ethnicity."
        ),
        "reportingPeriod": {
            "label": REPORTING_PERIOD_LABEL,
            "newAutopsyConsents": sum(
                1 for r in rows if row_in_reporting_period(r, "autopsy_consent_date")
            ),
            "autopsiesPerformed": sum(
                1 for r in rows if row_in_reporting_period(r, "autopsy_performed_date")
            ),
            "deathsInPeriod": sum(
                1 for r in rows if row_in_reporting_period(r, "date_of_death")
            ),
        },
    }
    return attach_field_coverage(summary, rows)


def summarize_apoe(rows: list[dict[str, str]]) -> dict:
    combos = Counter(r.get("apoe_comb") or "(blank)" for r in rows)
    summary = {
        "totalRecords": len(rows),
        "byGenotype": counter_dict(combos),
        "e4Carrier": sum(
            1 for r in rows if "e4" in (r.get("apoe_comb") or "").lower()
        ),
        "bySource": counter_dict(
            Counter(r.get("apoe_comb_source") or "(blank)" for r in rows)
        ),
        "byConsistent": counter_dict(Counter(_blank_label(r.get("apoe_consistent")) for r in rows)),
        "byApoeNacc": counter_dict(Counter(_blank_label(r.get("apoe_nacc")) for r in rows)),
        "byApoeVcs": counter_dict(Counter(_blank_label(r.get("apoe_vcs")) for r in rows)),
        "byApoeHmri": counter_dict(Counter(_blank_label(r.get("apoe_hmri")) for r in rows)),
        "byApoeC2n": counter_dict(Counter(_blank_label(r.get("apoe_c2n")) for r in rows)),
        "byApoeMarkvcid": counter_dict(Counter(_blank_label(r.get("apoe_markvcid")) for r in rows)),
        "byApoeDvr": counter_dict(Counter(_blank_label(r.get("apoe_dvr")) for r in rows)),
        "byApoeGenescreen": counter_dict(Counter(_blank_label(r.get("apoe_genescreen")) for r in rows)),
        "byApoeNpLog": counter_dict(Counter(_blank_label(r.get("apoe_np_log")) for r in rows)),
    }
    return attach_field_coverage(summary, rows)


def summarize_uds_subjects(rows: list[dict[str, str]]) -> dict:
    summary = {
        "totalSubjects": len(rows),
        "byAdrcStatus": counter_dict(
            Counter(r.get("der_status_adrc") or "(blank)" for r in rows)
        ),
        "presumedActive": sum(
            1 for r in rows if "Presumed active" in (r.get("der_status_adrc") or "")
        ),
        "presumedActiveFlag": sum(
            1 for r in rows if (r.get("der_status_presumed_active") or "").upper() == "TRUE"
        ),
        "discontinued": sum(1 for r in rows if r.get("der_status_adrc") == "Discontinued"),
        "deceased": sum(1 for r in rows if r.get("der_status_adrc") == "Deceased"),
        "withAutopsyConsent": sum(
            1
            for r in rows
            if r.get("der_status_autopsy_consent") not in (
                None,
                "",
                "Unknown / not established from available Milestones",
                "Not established - no Milestones record",
            )
            and "No" not in (r.get("der_status_autopsy_consent") or "")
        ),
        "byAutopsyConsent": counter_dict(
            Counter(r.get("der_status_autopsy_consent") or "(blank)" for r in rows)
        ),
        "byRaceEthnicity": counter_dict(
            Counter(r.get("der_current_race_ethnicity_summary") or "(blank)" for r in rows)
        ),
        "byRaceEthnicityBroad": counter_dict(
            Counter(
                collapse_race_ethnicity(r.get("der_current_race_ethnicity_summary"))
                for r in rows
            )
        ),
        "byHispanicLatinoFlag": counter_dict(
            Counter(_blank_label(r.get("der_current_re_hispanic_latino")) for r in rows)
        ),
        "raceEthnicityNote": (
            "Full harmonized race/ethnicity from der_current_race_ethnicity_summary "
            f"({sum(1 for r in rows if (r.get('der_current_race_ethnicity_summary') or '').strip())} "
            "of "
            f"{len(rows)} subjects populated). BRS REDCap export has gender and Hispanic flag only."
        ),
        "byCognitiveDx": counter_dict(
            Counter(r.get("der_latest_cognitive_dx") or "(blank)" for r in rows)
        ),
        "byCdrGlobal": counter_dict(
            Counter(r.get("der_latest_cdr_global") or "(blank)" for r in rows)
        ),
        "byAdStatus": counter_dict(
            Counter(r.get("der_latest_ad_status") or "(blank)" for r in rows)
        ),
        "byPrimaryLanguage": counter_dict(
            Counter(r.get("der_latest_primary_language") or "(blank)" for r in rows)
        ),
        "byLatestUdsGeneration": counter_dict(
            Counter(r.get("der_latest_uds_generation") or "(blank)" for r in rows)
        ),
        "avgUdsVisits": round(
            sum(int(r.get("der_n_uds_visits") or 0) for r in rows) / len(rows), 1
        )
        if rows
        else 0,
        "totalUdsVisits": sum(int(r.get("der_n_uds_visits") or 0) for r in rows),
        "byMilestoneRecordCount": counter_dict(
            Counter(r.get("der_status_n_milestone_records") or "(blank)" for r in rows)
        ),
    }
    return attach_field_coverage(summary, rows)


def summarize_uds_longitudinal(rows: list[dict[str, str]]) -> dict:
    id_field = "ptid" if rows and rows[0].get("ptid") else "naccid"
    summary = {
        "totalVisitRecords": len(rows),
        "uniqueParticipants": len({r.get(id_field) for r in rows if r.get(id_field)}),
        "byVisitNumber": counter_dict(
            Counter(r.get("visitnum") or "(blank)" for r in rows)
        ),
        "byPacket": counter_dict(Counter(r.get("packet") or "(blank)" for r in rows)),
        "bySourceGeneration": counter_dict(
            Counter(r.get("source_generation") or "(blank)" for r in rows)
        ),
        "byFormVersion": counter_dict(Counter(_blank_label(r.get("formver")) for r in rows)),
        "byModule": counter_dict(Counter(_blank_label(r.get("module")) for r in rows)),
        "byModcomm": counter_dict(Counter(_blank_label(r.get("modcomm")) for r in rows)),
    }
    return attach_field_coverage(
        summary,
        rows,
        include_columns=LONGITUDINAL_META_COLUMNS,
    )


def summarize_milestones(rows: list[dict[str, str]]) -> dict:
    summary = {
        "totalRecords": len(rows),
        "uniqueParticipants": len(
            {r.get("ptid") or r.get("naccid") for r in rows if r.get("ptid") or r.get("naccid")}
        ),
        "byMilestoneEvent": counter_dict(
            Counter(r.get("der_milestone_event") or "(blank)" for r in rows)
        ),
        "deceasedFlag": counter_dict(Counter(r.get("deceased") or "(blank)" for r in rows)),
        "autopsyFlag": counter_dict(Counter(r.get("autopsy") or "(blank)" for r in rows)),
        "byProtocolLabel": counter_dict(
            Counter(_blank_label(r.get("der_protocol_label")) for r in rows)
        ),
        "byAutopsyConsentLabel": counter_dict(
            Counter(_blank_label(r.get("der_autopsy_consent_label")) for r in rows)
        ),
    }
    return attach_field_coverage(summary, rows)


def summarize_biospecimen_subjects(rows: list[dict[str, str]]) -> dict:
    def flag(field: str) -> int:
        return sum(1 for r in rows if (r.get(field) or "").upper() == "TRUE")

    return {
        "uniqueParticipants": len(rows),
        "hasPlasma": flag("has_plasma"),
        "hasBuffyCoat": flag("has_buffy_coat"),
        "hasSerum": flag("has_serum"),
        "hasCsf": flag("has_csf"),
    }


def summarize_biomarker_subjects(rows: list[dict[str, str]]) -> dict:
    def flag(field: str) -> int:
        return sum(1 for r in rows if (r.get(field) or "").upper() == "TRUE")

    summary = {
        "totalSubjects": len(rows),
        "hasAnyBiomarker": flag("has_any_biomarker"),
        "hasPlasma": flag("has_plasma"),
        "hasCsf": flag("has_csf"),
        "hasNcrad": flag("has_ncrad"),
        "hasC2n": flag("has_c2n"),
        "hasVcsRedcap": flag("has_vcs_redcap"),
        "hasLegacyCsf": flag("has_legacy_csf"),
        "hasA": flag("has_A"),
        "hasT": flag("has_T"),
        "hasN": flag("has_N"),
        "hasV": flag("has_V"),
        "atnComplete": sum(
            1
            for r in rows
            if (r.get("has_A") or "").upper() == "TRUE"
            and (r.get("has_T") or "").upper() == "TRUE"
            and (r.get("has_N") or "").upper() == "TRUE"
        ),
        "byBiomarkersAvailable": counter_dict(
            _counter_for_column(rows, "biomarkers_available")
        ),
        "bySourceFamilies": counter_dict(_counter_for_column(rows, "source_families")),
        "coverageFlags": {
            "Any biomarker": flag("has_any_biomarker"),
            "Plasma": flag("has_plasma"),
            "CSF": flag("has_csf"),
            "NCRAD": flag("has_ncrad"),
            "C2N": flag("has_c2n"),
            "VCS REDCap": flag("has_vcs_redcap"),
            "Legacy CSF": flag("has_legacy_csf"),
            "A (amyloid)": flag("has_A"),
            "T (tau)": flag("has_T"),
            "N (neurodegeneration)": flag("has_N"),
            "V (vascular)": flag("has_V"),
            "ATN complete": sum(
                1
                for r in rows
                if (r.get("has_A") or "").upper() == "TRUE"
                and (r.get("has_T") or "").upper() == "TRUE"
                and (r.get("has_N") or "").upper() == "TRUE"
            ),
        },
    }
    return attach_field_coverage(summary, rows)


def summarize_biomarker_availability(rows: list[dict[str, str]]) -> dict:
    summary = {
        "totalRows": len(rows),
        "uniqueSubjects": len({r.get("uds_id") for r in rows if r.get("uds_id")}),
        "withMeasurement": sum(
            1 for r in rows if (r.get("has_measurement") or "").upper() == "TRUE"
        ),
        "bySpecimenType": counter_dict(
            Counter(r.get("specimen_type") or "(blank)" for r in rows)
        ),
        "bySourceFamily": counter_dict(
            Counter(r.get("source_family") or "(blank)" for r in rows)
        ),
        "bySourceDataset": counter_dict(
            Counter(_blank_label(r.get("source_dataset")) for r in rows)
        ),
        "byAtnvDomain": counter_dict(
            Counter(r.get("atnv_domain") or "(blank)" for r in rows)
        ),
        "byBiomarker": counter_dict(Counter(r.get("biomarker") or "(blank)" for r in rows)),
        "topBiomarkers": counter_dict(
            Counter(r.get("biomarker") or "(blank)" for r in rows)
        ),
        "byProtocolId": counter_dict(Counter(_blank_label(r.get("protocol_id")) for r in rows)),
        "byBiomarkerUnit": counter_dict(
            Counter(_blank_label(r.get("biomarker_unit")) for r in rows)
        ),
        "byAnyQcReview": counter_dict(Counter(_blank_label(r.get("any_qc_review")) for r in rows)),
        "byHasMeasurement": counter_dict(
            Counter(_blank_label(r.get("has_measurement")) for r in rows)
        ),
    }
    return attach_field_coverage(summary, rows)


def summarize_biomarker_long(rows: list[dict[str, str]]) -> dict:
    summary = {
        "totalMeasurements": len(rows),
        "uniqueSubjects": len({r.get("uds_id") for r in rows if r.get("uds_id")}),
        "bySpecimenType": counter_dict(
            Counter(r.get("specimen_type") or "(blank)" for r in rows)
        ),
        "bySourceFamily": counter_dict(
            Counter(r.get("source_family") or "(blank)" for r in rows)
        ),
        "bySourceDataset": counter_dict(
            Counter(_blank_label(r.get("source_dataset")) for r in rows)
        ),
        "byAtnvDomain": counter_dict(
            Counter(r.get("atnv_domain") or "(blank)" for r in rows)
        ),
        "byBiomarker": counter_dict(Counter(r.get("biomarker") or "(blank)" for r in rows)),
        "topBiomarkers": counter_dict(
            Counter(r.get("biomarker") or "(blank)" for r in rows)
        ),
        "byAssayMethod": counter_dict(Counter(_blank_label(r.get("assay_method")) for r in rows)),
        "byAssayPlatform": counter_dict(Counter(_blank_label(r.get("assay_platform")) for r in rows)),
        "byQcStatus": counter_dict(Counter(_blank_label(r.get("qc_status")) for r in rows)),
    }
    return attach_field_coverage(summary, rows)


def summarize_source_catalog(rows: list[dict[str, str]]) -> dict:
    summary = {
        "totalSourceRows": len(rows),
        "totalMeasurementsCataloged": sum(int(r.get("n_measurements") or 0) for r in rows),
        "totalSubjectSlots": sum(int(r.get("n_subjects") or 0) for r in rows),
        "bySourceFamily": counter_dict(
            Counter(r.get("source_family") or "(blank)" for r in rows)
        ),
        "bySpecimenType": counter_dict(
            Counter(r.get("specimen_type") or "(blank)" for r in rows)
        ),
        "byAtnvDomain": counter_dict(
            Counter(r.get("atnv_domain") or "(blank)" for r in rows)
        ),
        "entries": [
            {
                "sourceFamily": r.get("source_family") or "",
                "sourceDataset": r.get("source_dataset") or "",
                "specimenType": r.get("specimen_type") or "",
                "biomarker": r.get("biomarker") or "",
                "atnvDomain": r.get("atnv_domain") or "",
                "nMeasurements": int(r.get("n_measurements") or 0),
                "nSubjects": int(r.get("n_subjects") or 0),
                "firstCollectionDate": r.get("first_collection_date") or "",
                "latestCollectionDate": r.get("latest_collection_date") or "",
            }
            for r in rows
        ],
    }
    return attach_field_coverage(summary, rows)


def read_data_dictionary(path: Path) -> list[dict[str, str]]:
    _, rows = read_csv(path)
    return [
        {"variable": r.get("variable") or "", "description": r.get("description") or ""}
        for r in rows
        if r.get("variable")
    ]


def read_map_redcap_data_dictionary(path: Path) -> list[dict[str, str]]:
    _, rows = read_csv(path)
    entries: list[dict[str, str]] = []
    for row in rows:
        variable = (
            row.get("Variable / Field Name")
            or row.get("Variable/Field Name")
            or row.get("variable")
            or ""
        ).strip()
        if not variable:
            continue
        entries.append(
            {
                "variable": variable,
                "form": (row.get("Form Name") or "").strip(),
                "description": (row.get("Field Label") or row.get("description") or "").strip(),
            }
        )
    return entries


def write_james_supplements_manifest(
    *,
    brs_path: Path,
    map_dict_path: Path | None,
    biospecimen_dir: Path,
    reporting_period_summary: dict,
) -> None:
    files: list[dict[str, str]] = [
        {
            "role": "brsCohort",
            "path": str(brs_path.relative_to(ROOT)),
        },
    ]
    if map_dict_path and map_dict_path.is_file():
        files.append(
            {
                "role": "mapDataDictionary",
                "path": str(map_dict_path.relative_to(ROOT)),
            }
        )
    if biospecimen_dir.is_dir():
        for path in sorted(biospecimen_dir.glob("*")):
            if path.is_file():
                files.append(
                    {
                        "role": "biospecimenAvailability",
                        "path": str(path.relative_to(ROOT)),
                    }
                )
    manifest = {
        "supplementReceivedAt": SUPPLEMENT_RECEIVED_AT,
        "dashboardUse": (
            "James Wang email Oct 8–9 2026: BRS export, MAP dictionary, biospecimen "
            "inventory package — aggregated into rpprDataPackage.json and dashboard wiring."
        ),
        "files": files,
        "metricsWired": {
            "brsAutopsy": reporting_period_summary.get("brsAutopsy"),
            "biospecimenInventory": reporting_period_summary.get("biospecimenInventory"),
        },
    }
    out = ROOT / "src" / "data" / "jamesSupplementsManifest.json"
    out.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def list_package_files() -> list[dict]:
    files: list[dict] = []
    for path in sorted(PKG.rglob("*")):
        if not path.is_file():
            continue
        meta = file_meta(path, relative_to_pkg=True)
        files.append(meta)
    return files


def main() -> None:
    if not PKG.exists():
        raise SystemExit(f"Data package not found: {PKG}")

    init_reporting_period_window(as_of=DASHBOARD_YTD_AS_OF)

    brs_path = latest_brs_cohort_csv()
    map_dict_path = latest_map_data_dictionary_csv()
    apoe_path = PKG / "MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv"
    biospecimen_dir = PKG / "USC ADRC Biospecimen Availability"
    biospecimen_long_path = biospecimen_dir / BIOSPECIMEN_LONG_FILE
    biospecimen_summary_path = biospecimen_dir / BIOSPECIMEN_SUMMARY_FILE
    biospecimen_dict_path = biospecimen_dir / "USC_ADRC_Biospecimen_Data_Dictionary_v1.0.1.csv"
    biospecimen_report = biospecimen_dir / "USC_ADRC_Biospecimen_Report_v1.0.1.html"
    uds_dir = PKG / "USC ADRC UDS Harmonized"
    uds_subject_path = uds_dir / "ADRC_subject_current_harmonized.csv"
    uds_long_path = uds_dir / "UDS_longitudinal_harmonized.csv"
    milestones_path = uds_dir / "Milestones_history_harmonized.csv"
    uds_report = uds_dir / "USC_ADRC_Harmonized_UDS_Collaborator_Report_v1.1.0.html"
    bio_dir = PKG / "USC ADRC Integrated Biomarker Availability"
    bio_summary_path = bio_dir / "Integrated_Biomarker_Subject_Summary_v1.0.5.csv"
    bio_avail_path = bio_dir / "Integrated_Biomarker_Availability_v1.0.5.csv"
    bio_long_path = bio_dir / "Integrated_Biomarkers_Long_v1.0.5.csv"
    bio_catalog_path = bio_dir / "Integrated_Biomarker_Source_Catalog_v1.0.5.csv"
    bio_dict_path = bio_dir / "Integrated_Biomarker_Data_Dictionary_v1.0.5.csv"
    bio_report = bio_dir / "Integrated_Biomarker_Availability_Report_v1.0.5.html"
    imaging_dir = PKG / "USC ADRC Integrated Imaging Availability"
    imaging_long_path = imaging_dir / "USC_ADRC_Imaging_Availability_Longitudinal_v1.5.2.csv"
    imaging_study_subject_path = (
        imaging_dir / "USC_ADRC_Imaging_Availability_Study_Subject_Level_v1.5.2.csv"
    )
    imaging_master_path = imaging_dir / "USC_ADRC_Integrated_Imaging_Availability_v1.5.2.csv"
    imaging_subject_path = imaging_dir / "USC_ADRC_Imaging_Availability_Subject_Level_v1.5.2.csv"
    imaging_study_summary_path = (
        imaging_dir / "USC_ADRC_Imaging_Availability_Study_Summary_v1.5.2.csv"
    )
    imaging_dict_path = imaging_dir / "USC_ADRC_Imaging_Availability_Data_Dictionary_v1.5.2.csv"
    imaging_report = (
        ROOT
        / "public"
        / "data-package"
        / "reports"
        / "USC_ADRC_Imaging_Availability_Report_v1.5.2.html"
    )

    _, brs_rows = read_csv(brs_path)
    write_brs_recruitment_constants(brs_path=brs_path, brs_rows=brs_rows)
    map_data_dictionary: list[dict[str, str]] = []
    if map_dict_path and map_dict_path.is_file():
        map_data_dictionary = read_map_redcap_data_dictionary(map_dict_path)
    _, apoe_rows = read_csv(apoe_path)
    biospecimen_long_rows: list[dict[str, str]] = []
    biospecimen_summary_rows: list[dict[str, str]] = []
    biospecimen_dictionary: list[dict[str, str]] = []
    if biospecimen_long_path.exists():
        _, biospecimen_long_rows = read_csv(biospecimen_long_path)
        _, biospecimen_summary_rows = read_csv(biospecimen_summary_path)
        if biospecimen_dict_path.exists():
            _, bio_spec_dict_rows = read_csv(biospecimen_dict_path)
            biospecimen_dictionary = [
                {
                    "variable": r.get("field") or r.get("variable") or "",
                    "description": r.get("definition") or r.get("description") or "",
                }
                for r in bio_spec_dict_rows
                if (r.get("field") or r.get("variable"))
            ]
    _, uds_rows = read_csv(uds_subject_path)
    _, uds_long_rows = read_csv(uds_long_path)
    _, milestones_rows = read_csv(milestones_path)
    _, bio_rows = read_csv(bio_summary_path)
    _, bio_avail_rows = read_csv(bio_avail_path)
    _, bio_long_rows = read_csv(bio_long_path)
    _, bio_catalog_rows = read_csv(bio_catalog_path)
    bio_dictionary = read_data_dictionary(bio_dict_path)

    imaging_long_rows: list[dict[str, str]] = []
    imaging_study_subject_rows: list[dict[str, str]] = []
    imaging_master_rows: list[dict[str, str]] = []
    imaging_subject_rows: list[dict[str, str]] = []
    imaging_study_summary_rows: list[dict[str, str]] = []
    imaging_dictionary: list[dict[str, str]] = []
    if imaging_long_path.exists():
        _, imaging_long_rows = read_csv(imaging_long_path)
        _, imaging_study_subject_rows = read_csv(imaging_study_subject_path)
        _, imaging_master_rows = read_csv(imaging_master_path)
        _, imaging_subject_rows = read_csv(imaging_subject_path)
        _, imaging_study_summary_rows = read_csv(imaging_study_summary_path)
        _, imaging_dict_rows = read_csv(imaging_dict_path)
        imaging_dictionary = [
            {
                "variable": r.get("field") or "",
                "description": r.get("definition") or "",
            }
            for r in imaging_dict_rows
            if r.get("field")
        ]

    all_files = list_package_files()
    csv_files = [f for f in all_files if f["fileType"] == "csv"]
    html_files = [f for f in all_files if f["fileType"] == "html"]

    reporting_period_summary = build_reporting_period_summary(
        uds_long_rows=uds_long_rows,
        uds_subject_rows=uds_rows,
        apoe_rows=apoe_rows,
        bio_long_rows=bio_long_rows,
        brs_rows=brs_rows,
        brs_source_file=brs_path.name,
        biospecimen_long_rows=biospecimen_long_rows or None,
    )
    if imaging_long_rows and imaging_study_subject_rows:
        reporting_period_summary["imaging"] = build_imaging_reporting_period(
            imaging_long_rows=imaging_long_rows,
            imaging_study_subject_rows=imaging_study_subject_rows,
        )
        reporting_period_summary["imagingYtdIntegratedStudySummary"] = (
            build_imaging_ytd_integrated_study_summary(
                imaging_long_rows=imaging_long_rows,
                imaging_study_subject_rows=imaging_study_subject_rows,
            )
        )
    if imaging_study_summary_rows:
        reporting_period_summary["imagingIntegratedStudySummary"] = (
            build_imaging_integrated_study_summary(imaging_study_summary_rows)
        )
    reporting_period_additional = build_reporting_period_additional(
        uds_subject_rows=uds_rows,
        milestones_rows=milestones_rows,
        brs_rows=brs_rows,
        brs_source_file=brs_path.name,
        bio_avail_rows=bio_avail_rows,
        bio_summary_rows=bio_rows,
        biospecimen_long_rows=biospecimen_long_rows or None,
    )

    payload = {
        "packageLabel": "USC ADRC RPPR Data Package",
        "receivedAt": "2026-09-16",
        "supplementReceivedAt": SUPPLEMENT_RECEIVED_AT,
        "lastAggregated": datetime.now(timezone.utc).isoformat(),
        "reportingPeriodSummary": reporting_period_summary,
        "reportingPeriodAdditional": reporting_period_additional,
        "note": (
            "Integrated imaging availability v1.5.2 is included when CSVs are present under "
            "USC ADRC Integrated Imaging Availability. BRS IDs use 8-xxxx format — open "
            "CSVs via import, not double-click in Excel."
        ),
        "inventory": {
            "totalFiles": len(all_files),
            "csvFiles": len(csv_files),
            "htmlReports": len(html_files),
            "totalCsvRows": sum(f["rowCount"] for f in csv_files),
            "totalSizeMb": round(sum(f["fileSizeMb"] for f in all_files), 2),
            "files": all_files,
        },
        "pipelines": [
            {
                "id": "uds-harmonization",
                "title": "UDS Harmonization",
                "description": (
                    "Harmonizes current and legacy UDS data plus Milestones; "
                    "includes collaborator report, longitudinal tables, and NACC data dictionaries."
                ),
                "status": "available",
                "reportPath": "/data-package/reports/USC_ADRC_Harmonized_UDS_Collaborator_Report_v1.1.0.html",
                "summary": {
                    "subjects": summarize_uds_subjects(uds_rows),
                    "longitudinal": summarize_uds_longitudinal(uds_long_rows),
                    "milestones": summarize_milestones(milestones_rows),
                },
                "files": [
                    file_meta(uds_subject_path, relative_to_pkg=True),
                    file_meta(uds_long_path, relative_to_pkg=True),
                    file_meta(milestones_path, relative_to_pkg=True),
                    file_meta(uds_report, relative_to_pkg=True),
                    *[
                        file_meta(p, relative_to_pkg=True)
                        for p in sorted((uds_dir / "NACC Data Dictionaries").glob("*.csv"))
                    ],
                ],
                "dashboardLinks": ["Recruitment · USC ADRC UDS", "Demographics"],
            },
            {
                "id": "integrated-biomarkers",
                "title": "Integrated Biomarkers",
                "description": (
                    "Harmonizes latest NCRAD releases and legacy biomarker sources; "
                    "includes availability matrix, subject summary, source catalog, and report."
                ),
                "status": "available",
                "reportPath": "/data-package/reports/Integrated_Biomarker_Availability_Report_v1.0.5.html",
                "summary": {
                    "subjects": summarize_biomarker_subjects(bio_rows),
                    "availability": summarize_biomarker_availability(bio_avail_rows),
                    "longFormat": summarize_biomarker_long(bio_long_rows),
                    "sourceCatalog": summarize_source_catalog(bio_catalog_rows),
                    "dataDictionary": bio_dictionary,
                },
                "files": [
                    file_meta(p, relative_to_pkg=True)
                    for p in sorted(bio_dir.glob("*"))
                    if p.is_file()
                ],
                "dashboardLinks": ["Biomarkers", "Biofluid Collection"],
            },
            {
                "id": "map-redcap",
                "title": "MAP Database · BRS & APOE",
                "description": (
                    "REDCap MAP exports for BRS cohort linkage and APOE genotype reporting."
                ),
                "status": "available",
                "reportPath": None,
                "summary": {
                    "brsCohort": summarize_brs(brs_rows),
                    "apoeGenotype": summarize_apoe(apoe_rows),
                    "mapDataDictionary": {
                        "sourceFile": map_dict_path.name if map_dict_path else None,
                        "entryCount": len(map_data_dictionary),
                        "entries": map_data_dictionary[:120],
                        "entriesTruncated": len(map_data_dictionary) > 120,
                        "brsFieldVariables": [
                            e["variable"]
                            for e in map_data_dictionary
                            if e["variable"]
                            in {
                                "subject_brs_status",
                                "autopsy_number",
                                "autopsy_consent",
                                "autopsy_performed",
                                "autopsy_failure",
                                "autopsy_consent_date",
                                "autopsy_performed_date",
                                "autopsy_report_date",
                                "date_of_death",
                                "date_of_termination",
                            }
                        ],
                    },
                },
                "files": [
                    file_meta(brs_path, relative_to_pkg=True),
                    file_meta(apoe_path, relative_to_pkg=True),
                    *(
                        [file_meta(map_dict_path, relative_to_pkg=True)]
                        if map_dict_path and map_dict_path.is_file()
                        else []
                    ),
                ],
                "dashboardLinks": ["Recruitment · Autopsy Program", "Neuropathology"],
            },
            *(
                [
                    {
                        "id": "biospecimen-availability",
                        "title": "Biospecimen Availability",
                        "description": (
                            "Specimen collection inventory (plasma, serum, buffy coat, CSF) "
                            "with collection dates and aliquot counts — supplement to integrated "
                            "biomarker assay availability."
                        ),
                        "status": "available",
                        "reportPath": None,
                        "summary": {
                            "reportingPeriod": reporting_period_summary.get(
                                "biospecimenInventory"
                            ),
                            "subjects": summarize_biospecimen_subjects(
                                biospecimen_summary_rows
                            ),
                            "dataDictionary": biospecimen_dictionary,
                        },
                        "files": [
                            file_meta(p, relative_to_pkg=True)
                            for p in sorted(biospecimen_dir.glob("*"))
                            if p.is_file()
                        ],
                        "dashboardLinks": ["Biomarkers · Biofluid Collection"],
                    }
                ]
                if biospecimen_long_rows
                else []
            ),
            {
                "id": "integrated-imaging",
                "title": "Integrated Imaging Availability",
                "description": (
                    "Harmonized MRI/PET availability across USC ADRC imaging sources and "
                    "linked studies (SCAN, CLARiTI, etc.)."
                ),
                "status": "available" if imaging_long_rows else "pending",
                "reportPath": (
                    "/data-package/reports/USC_ADRC_Imaging_Availability_Report_v1.5.2.html"
                    if imaging_report.exists()
                    else None
                ),
                "summary": {
                    "reportingPeriod": reporting_period_summary.get("imaging"),
                    "studySummaryRows": len(imaging_study_summary_rows),
                    "longitudinalRows": len(imaging_long_rows),
                    "masterRows": len(imaging_master_rows),
                    "subjectLevelRows": len(imaging_subject_rows),
                    "dataDictionary": imaging_dictionary,
                },
                "files": [
                    file_meta(p, relative_to_pkg=True)
                    for p in sorted(imaging_dir.glob("*"))
                    if p.is_file()
                ]
                if imaging_dir.exists()
                else [],
                "dashboardLinks": ["Imaging · SCAN Progress", "Imaging · CLARITi Progress"],
            },
        ],
        "totals": {
            "files": len(all_files),
            "csvFiles": len(csv_files),
            "htmlReports": len(html_files),
            "udsSubjects": len(uds_rows),
            "udsVisitRecords": len(uds_long_rows),
            "milestoneRecords": len(milestones_rows),
            "brsRecords": len(brs_rows),
            "apoeRecords": len(apoe_rows),
            "biomarkerSubjects": len(bio_rows),
            "biomarkerMeasurements": len(bio_long_rows),
            "totalCsvRows": sum(f["rowCount"] for f in csv_files),
        },
    }

    write_james_supplements_manifest(
        brs_path=brs_path,
        map_dict_path=map_dict_path,
        biospecimen_dir=biospecimen_dir,
        reporting_period_summary=reporting_period_summary,
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    META_OUTPUT.write_text(
        json.dumps(
            {
                "lastAggregated": payload["lastAggregated"],
                "receivedAt": payload["receivedAt"],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    print(f"Wrote {META_OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

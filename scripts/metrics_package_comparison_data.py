"""Shared comparison rows for Metrics Dashboard vs RPPR Data Package documents."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ComparisonRow:
    category: str
    element: str
    description: str
    metrics: str  # Yes | No | Partial
    data_package: str  # Yes | No | Partial | Pending
    notes: str


def build_comparison_rows(totals: dict, rppr: dict) -> list[ComparisonRow]:
    rec = rppr.get("recruitment", {})
    gs = rppr.get("geneScreen", {})
    ore = rppr.get("oreOutreach", {})
    clin = rppr.get("clinicalAssessments", {})
    img = rppr.get("imagingQc", {})
    ida = rppr.get("idaImagingUpload", {})
    targets = rppr.get("scanTargets", {})

    return [
        ComparisonRow(
            "Recruitment & enrollment",
            "ADRC total participants",
            "Count of participants in the RPPR reporting cohort (Clinical Core Table 1).",
            "Yes",
            "Yes",
            f"Metrics shows {rec.get('adrcTotalParticipants', 573)} (RPPR Table 1). "
            f"Package has {totals.get('udsSubjects', 0):,} harmonized subjects (full research cohort).",
        ),
        ComparisonRow(
            "Recruitment & enrollment",
            "New ADRC initial evaluations (Jul-Dec 2025)",
            "Participants with a new initial UDS evaluation in the reporting period.",
            "Yes",
            "No",
            f"{rec.get('adrcNewThisPeriod', 6)} on Metrics dashboard. Not isolated as a period slice in package CSVs.",
        ),
        ComparisonRow(
            "Recruitment & enrollment",
            "GeneScreen registry",
            "Online registry membership totals and new enrollments.",
            "Yes",
            "No",
            f"{gs.get('membersEnrolled', '?')} members; +{gs.get('membersAdded', '?')} this period on Metrics. Not in Sep 16 package.",
        ),
        ComparisonRow(
            "Recruitment & enrollment",
            "5-year grant enrollment targets",
            "Renewal application goals (e.g. GeneScreen 1,500, autopsy pool 350).",
            "Yes",
            "No",
            "Illustrative plan targets on Metrics. Not measured outcomes or package data.",
        ),
        ComparisonRow(
            "Demographics & clinical",
            "Demographics Table 1 (N=573)",
            "RPPR-formatted demographic and clinical characteristics table for the reporting cohort.",
            "Yes",
            "No",
            "Full formatted table on Metrics. Package has underlying subject fields but not this RPPR layout.",
        ),
        ComparisonRow(
            "Demographics & clinical",
            "Cognitive diagnosis distribution",
            "Breakdown of latest cognitive diagnosis (dementia, MCI, unimpaired, etc.).",
            "Yes",
            "Yes",
            "Summary chart on Metrics. Full field coverage (der_latest_cognitive_dx) in package explorer.",
        ),
        ComparisonRow(
            "Demographics & clinical",
            "Race / ethnicity summary",
            "Harmonized race and ethnicity categories for current subjects.",
            "Yes",
            "Yes",
            "Table on Metrics. Same summary field for all subjects in package CSV.",
        ),
        ComparisonRow(
            "Demographics & clinical",
            "CDR global score",
            "Clinical Dementia Rating global score distribution.",
            "Yes",
            "Yes",
            "Pie chart on Metrics. Full breakdown in package field coverage.",
        ),
        ComparisonRow(
            "Demographics & clinical",
            "AD status, language, UDS generation",
            "Latest Alzheimer's disease status, primary language, and UDS form generation.",
            "Yes",
            "Yes",
            "Curated charts on Metrics. All corresponding der_* columns in package.",
        ),
        ComparisonRow(
            "Demographics & clinical",
            "Clinical assessments this period",
            "In-person follow-ups, remote follow-ups, and initial assessments Jul-Dec 2025.",
            "Yes",
            "No",
            f"{clin.get('followUpInPerson', '?')} in-person / {clin.get('followUpRemote', '?')} remote / "
            f"{clin.get('initialAssessments', '?')} initial on Metrics (RPPR).",
        ),
        ComparisonRow(
            "Neuropathology & autopsy",
            "BRS autopsy program (period narrative)",
            "New consents, autopsies performed, deaths, and cumulative rates from RPPR.",
            "Yes",
            "Partial",
            "Neuropathology section on Metrics. Package has "
            f"{totals.get('brsRecords', 0):,} BRS REDCap rows (row-level export).",
        ),
        ComparisonRow(
            "Neuropathology & autopsy",
            "MAP BRS cohort REDCap export",
            "Enrollment status, consent dates, autopsy linkage, demographics per BRS record.",
            "No",
            "Yes",
            f"{totals.get('brsRecords', 0):,} records in package. Open via import (8-xxxx IDs).",
        ),
        ComparisonRow(
            "Neuropathology & autopsy",
            "MAP APOE genotype export",
            "APOE genotype and source attribution per subject.",
            "Partial",
            "Yes",
            f">500 genotyping on Metrics (RPPR text). {totals.get('apoeRecords', 0):,} rows in package CSV.",
        ),
        ComparisonRow(
            "Outreach & engagement",
            "ORE community events & attendees",
            "Community outreach events and total attendees Jul-Dec 2025.",
            "Yes",
            "No",
            f"{ore.get('communityEvents', '?')} events, {ore.get('eventAttendees', '?'):,} attendees on Metrics (RPPR Table E1/E2).",
        ),
        ComparisonRow(
            "Outreach & engagement",
            "ORE groups contacted / collaborating",
            "Community groups engaged for outreach.",
            "Yes",
            "No",
            f"{ore.get('communityGroupsContacted', '?')} contacted, {ore.get('groupsCollaborating', '?')} collaborating on Metrics.",
        ),
        ComparisonRow(
            "Outreach & engagement",
            "REC speaker series",
            "Research education center speaker events and Zoom attendance.",
            "Yes",
            "No",
            "On Metrics dashboard only (speakers tracking file).",
        ),
        ComparisonRow(
            "Outreach & engagement",
            "Brain Health 4 Me engagement",
            "Community program engagement metric.",
            "No",
            "No",
            "Shown as TBD on Metrics. Not in RPPR or Sep 16 package.",
        ),
        ComparisonRow(
            "Biomarkers & samples",
            "Biofluid collection this period",
            "Plasma, serum, WBC, and CSF collection counts Jul-Dec 2025.",
            "Yes",
            "No",
            "From Biomarker Core workbook and RPPR on Metrics. Period operational counts.",
        ),
        ComparisonRow(
            "Biomarkers & samples",
            "NCRAD samples & results",
            "PBMC, buffy coat, plasma shipped and biomarker results returned.",
            "Yes",
            "No",
            "Operational counts on Metrics from RPPR Clinical Core B2.",
        ),
        ComparisonRow(
            "Biomarkers & samples",
            "Biomarker research & genotyping summary",
            "CSF analyzed, collaboration samples, APOE genotyping summary.",
            "Yes",
            "No",
            "RPPR/workbook narrative on Metrics.",
        ),
        ComparisonRow(
            "Biomarkers & samples",
            "Clinical lab tests (A1c, lipid, creatinine, BP)",
            "Counts of routine clinical laboratory tests.",
            "Partial",
            "No",
            "Placeholder values on Metrics. Not reported in RPPR or package.",
        ),
        ComparisonRow(
            "Biomarkers & samples",
            "Integrated biomarker subject summary",
            "Subject-level summary of biomarker availability across domains.",
            "No",
            "Yes",
            f"{totals.get('biomarkerSubjects', 0):,} subjects in package CSV.",
        ),
        ComparisonRow(
            "Biomarkers & samples",
            "Long-format biomarker measurements",
            "One row per biomarker measurement with source and specimen metadata.",
            "No",
            "Yes",
            f"{totals.get('biomarkerMeasurements', 0):,} measurement rows in package.",
        ),
        ComparisonRow(
            "Biomarkers & samples",
            "Biomarker availability matrix",
            "Which biomarkers are available per subject.",
            "No",
            "Yes",
            "Integrated_Biomarker_Availability CSV in package only.",
        ),
        ComparisonRow(
            "Biomarkers & samples",
            "Biomarker source catalog & data dictionary",
            "Source families, datasets, and field definitions for biomarker data.",
            "No",
            "Yes",
            "Package deliverables only.",
        ),
        ComparisonRow(
            "Imaging",
            "SCAN / CLARITi grant targets",
            "Grant budget targets for structural and CLARITi scans.",
            "Yes",
            "No",
            f"Targets {targets.get('scanTarget', '?')} / {targets.get('claritiTarget', '?')} on Metrics.",
        ),
        ComparisonRow(
            "Imaging",
            "Completed MRI / Amyloid / Tau PET counts",
            "Scans completed in the reporting period.",
            "Partial",
            "No",
            "Placeholder bars on Metrics until imaging export is wired. Not real counts yet.",
        ),
        ComparisonRow(
            "Imaging",
            "Imaging QC passed (amyloid, tau, MRI)",
            "Quality-controlled imaging datasets passed QC.",
            "Yes",
            "No",
            f"Amyloid {img.get('amyloidPetQc', '?')}, tau {img.get('tauPetQc', '?')}, MRI "
            f"{img.get('structuralMriQc', '?')} on Metrics (RPPR).",
        ),
        ComparisonRow(
            "Imaging",
            "IDA imaging uploads",
            "MR and PET scans uploaded to IDA Jul-Dec 2025.",
            "Yes",
            "No",
            f"{ida.get('mrScans', '?'):,} MR / {ida.get('petScans', '?'):,} PET uploads on Metrics.",
        ),
        ComparisonRow(
            "Imaging",
            "Integrated imaging availability matrix",
            "Subject-level MRI/PET availability for collaborators.",
            "No",
            "Pending",
            "Not included in Sep 16 delivery. Expected in a future package release.",
        ),
        ComparisonRow(
            "Specimen sharing",
            "RedCap biofluid requests",
            "External requests for biofluid specimens Jul-Dec 2025.",
            "Yes",
            "No",
            "RedCap export on Metrics. Not duplicated in Sep 16 package.",
        ),
        ComparisonRow(
            "Specimen sharing",
            "RedCap neurobank (tissue) requests",
            "External tissue requests received and fulfilled Jul-Dec 2025.",
            "Yes",
            "No",
            "RedCap export on Metrics. Not duplicated in Sep 16 package.",
        ),
        ComparisonRow(
            "UDS research files",
            "Harmonized current subject file",
            "One row per subject with latest harmonized UDS-derived fields.",
            "Partial",
            "Yes",
            f"Summary charts on Metrics. Full {totals.get('udsSubjects', 0):,}-row CSV in package.",
        ),
        ComparisonRow(
            "UDS research files",
            "Longitudinal UDS visit file",
            "All harmonized UDS visit records across generations.",
            "No",
            "Yes",
            f"{totals.get('udsVisitRecords', 0):,} visit rows in package.",
        ),
        ComparisonRow(
            "UDS research files",
            "Milestones history file",
            "Harmonized milestone and status history records.",
            "No",
            "Yes",
            f"{totals.get('milestoneRecords', 0):,} records in package.",
        ),
        ComparisonRow(
            "UDS research files",
            "Per-column field coverage explorer",
            "Interactive breakdown of every quantifiable column in package CSVs.",
            "No",
            "Yes",
            "Available on website /data-package only.",
        ),
        ComparisonRow(
            "Reference & documentation",
            "UDS harmonization collaborator report (HTML)",
            "QC, methodology, and coverage report for harmonized UDS.",
            "No",
            "Yes",
            "HTML report bundled in package.",
        ),
        ComparisonRow(
            "Reference & documentation",
            "NACC data dictionaries",
            "Official NACC UDS and Milestones data dictionaries.",
            "No",
            "Yes",
            "PDF and CSV dictionaries in package.",
        ),
    ]


def difference_type(row: ComparisonRow) -> str:
    """Short label for differences-only documents."""
    if row.metrics == "Yes" and row.data_package == "Yes":
        return "Scope differs"
    label = availability_label(row.metrics, row.data_package)
    mapping = {
        "Metrics only": "Metrics only",
        "Metrics only (partial)": "Metrics only",
        "Data package only": "Data package only",
        "Not yet available": "Pending delivery",
        "Neither": "Missing both",
        "See notes": "See notes",
    }
    return mapping.get(label, label)


def filter_difference_rows(rows: list[ComparisonRow]) -> list[ComparisonRow]:
    """Gaps, single-side items, pending/missing — excludes pure overlaps."""
    kept: list[ComparisonRow] = []
    for row in rows:
        if row.metrics == "Yes" and row.data_package == "Yes":
            if row.element == "ADRC total participants":
                kept.append(row)
            continue
        if _is_overlap_row(row):
            continue
        kept.append(row)
    return kept


def _is_overlap_row(row: ComparisonRow) -> bool:
    """True when both sides carry related content (not a one-sided gap)."""
    if row.element == "ADRC total participants":
        return False
    m = row.metrics
    p = row.data_package
    return m in {"Yes", "Partial"} and p in {"Yes", "Partial"}


def filter_overlap_rows(rows: list[ComparisonRow]) -> list[ComparisonRow]:
    """Items that appear in both Metrics and Data Package (related content on each side)."""
    return [row for row in rows if _is_overlap_row(row)]


def synced_summary(row: ComparisonRow) -> str:
    """How the same data appears on Metrics vs Data Package (synced across both)."""
    if row.metrics == "Yes" and row.data_package == "Yes":
        return "Synced - summary on Metrics, full field in package"
    if row.metrics == "Yes" and row.data_package == "Partial":
        return "Synced - Metrics narrative, package row-level export"
    if row.metrics == "Partial" and row.data_package == "Yes":
        return "Synced - Metrics charts, package full CSV"
    return "Synced - see detail"


def availability_label(metrics: str, data_package: str) -> str:
    m = metrics.lower()
    p = data_package.lower()
    if m == "yes" and p == "yes":
        return "Both (see notes for scope)"
    if m in {"yes", "partial"} and p in {"no", "pending"}:
        return "Metrics only"
    if m in {"no", "partial"} and p == "yes":
        return "Data package only"
    if m == "no" and p == "pending":
        return "Not yet available"
    if m == "partial" and p == "no":
        return "Metrics only (partial)"
    if m == "no" and p == "no":
        return "Neither"
    return "See notes"

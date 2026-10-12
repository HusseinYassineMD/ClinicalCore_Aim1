#!/usr/bin/env python3
"""Plain-language PDF: every dashboard number, source file, and count method."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "reports"
OUTPUT = OUTPUT_DIR / "USC_ADRC_Dashboard_Metric_Provenance.pdf"
OUTPUT_CSV = OUTPUT_DIR / "USC_ADRC_Dashboard_Metric_Provenance.csv"

# Matches dashboard SitePeriodStrip + data-sources page (black / green / red).
LINEAGE_LEGEND = [
    (
        "black",
        "James & Xinhui Wang · Harmonized RPPR data package",
        "Direct row or participant counts from CSVs in data/rppr-data-package/ "
        "(calendar YTD window in rpprDataPackage.json).",
    ),
    (
        "black",
        "Derived from harmonized package (not hand-entered)",
        "Computed by scripts/aggregate_rppr_data_package.py (and validate_dashboard.py) "
        "from Xinhui Wang Data Core CSVs — not typed as literals in the UI.",
    ),
    (
        "green",
        "Last RPPR reporting period (workbook / PDF — not James YTD slice)",
        "Clinical Core Table 1, Core Metrics workbooks, RPPR PDF -> rpprMetrics.json / "
        "table1Demographics.json. Green on dashboard.",
    ),
    (
        "black",
        "USC RedCap CSV (YTD — separate from James package folder)",
        "data/redcap/*.csv re-aggregated to redcapSpecimenSharing.json for the same YTD window.",
    ),
    (
        "red",
        "Not in export / placeholder / TBD",
        "Shown on dashboard but not sourced from harmonized CSV or RPPR extract yet.",
    ),
]

PDF_FILL = {
    "black": (230, 230, 230),
    "green": (198, 246, 213),
    "red": (254, 202, 202),
}
PDF_INK = {
    "black": (10, 10, 10),
    "green": (21, 128, 61),
    "red": (185, 28, 28),
}
PDF_SWATCH = {
    "black": (10, 10, 10),
    "green": (22, 163, 74),
    "red": (220, 38, 38),
}

TABLE_COL_LABELS = [
    "Color",
    "Section",
    "Metric",
    "Value",
    "How counted",
    "Source",
    "Data lineage",
    "Notes",
]
# Must sum to 1.0 — fits printable width (pdf.epw), Notes column fully on page.
TABLE_COL_RATIOS = [0.08, 0.10, 0.16, 0.07, 0.11, 0.15, 0.16, 0.17]

UNICODE_REPLACEMENTS = {
    "\u2013": "-",
    "\u2014": "-",
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u00b7": " - ",
    "\u2192": "->",
}


def ascii_safe(text: str) -> str:
    for src, dst in UNICODE_REPLACEMENTS.items():
        text = text.replace(src, dst)
    return text.encode("ascii", "replace").decode("ascii")


def load(name: str) -> dict:
    return json.loads((ROOT / "src" / "data" / name).read_text(encoding="utf-8"))


def row(
    section: str,
    metric: str,
    value: str,
    method: str,
    source: str,
    notes: str = "",
    *,
    dashboard_color: str = "",
    data_lineage: str = "",
) -> dict[str, str]:
    return {
        "section": section,
        "metric": metric,
        "value": value,
        "method": method,
        "source": source,
        "notes": notes,
        "dashboard_color": dashboard_color,
        "data_lineage": data_lineage,
    }


def classify_row(r: dict[str, str]) -> tuple[str, str]:
    """Assign dashboard color + plain-language lineage when not set explicitly."""
    if r.get("dashboard_color") and r.get("data_lineage"):
        return r["dashboard_color"], r["data_lineage"]

    src = r["source"].lower()
    notes = (r.get("notes") or "").lower()
    method = r["method"].lower()
    section = r["section"].lower()
    value = (r.get("value") or "").lower()

    if (
        src in ("n/a", "")
        or "pending" in src
        or "tbd" in value
        or "red/tbd" in notes
        or "placeholder" in method
        or "not in harmonized" in method
        or "not reported" in method
    ):
        return "red", LINEAGE_LEGEND[4][1]

    if "data/redcap" in src:
        return "black", LINEAGE_LEGEND[3][1]

    if "newinitialevaluationbreakdown" in src.replace("_", "").replace(" ", ""):
        return "black", LINEAGE_LEGEND[1][1]

    if "derived" in method or "derived ratio" in method:
        if "rpprmetrics" in src.replace(" ", "") or "table 1" in src:
            return "green", LINEAGE_LEGEND[2][1]
        return "black", LINEAGE_LEGEND[1][1]

    if (
        "rpprmetrics" in src.replace(" ", "")
        or ".xlsx" in src
        or "workbook" in src
        or "rppr pdf" in src
        or "table 1" in src
        or "clinical core" in src
        or "core metrics" in src
        or "ore core" in src
        or "imaging core" in src
        or "biomarker core" in src
        or "renewal application" in src
        or "grant" in method
    ):
        if " ytd" in section or section.endswith("- ytd") or "black on" in notes:
            pass
        elif "not calendar" in notes or "not ytd" in notes or "green" in notes:
            return "green", LINEAGE_LEGEND[2][1]
        elif "rppr period" in notes or "cumulative rppr" in method:
            return "green", LINEAGE_LEGEND[2][1]
        else:
            return "green", LINEAGE_LEGEND[2][1]

    if (
        "data/rppr-data-package" in src
        or "rpprdatapackage.json" in src.replace("_", "").replace(" ", "")
        or src.endswith(".csv")
        or "harmonized" in method
    ):
        return "black", LINEAGE_LEGEND[0][1]

    if "reportingperiodsummary" in src.replace("_", "").replace(" ", ""):
        return "black", LINEAGE_LEGEND[0][1]

    return "green", LINEAGE_LEGEND[2][1]


def enrich_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for r in rows:
        color, lineage = classify_row(r)
        out.append(
            {
                **r,
                "dashboard_color": color,
                "data_lineage": lineage,
            }
        )
    return out


def write_csv(rows: list[dict[str, str]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "dashboard_color",
        "data_lineage",
        "section",
        "metric",
        "value",
        "method",
        "source",
        "notes",
    ]
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in fieldnames})


def build_rows() -> list[dict[str, str]]:
    pkg = load("rpprDataPackage.json")
    rppr = load("rpprMetrics.json")
    redcap = load("redcapSpecimenSharing.json")
    gene_ytd = load("geneScreenYtd.json")
    t1 = load("table1Demographics.json")
    brs_dc = load("brsRpprTableDataCore2026.json")

    ytd = pkg["reportingPeriodSummary"]
    period = ytd.get("label", "YTD")
    uds = ytd["udsClinical"]
    bio = ytd["biomarkers"]
    biospecimen = ytd.get("biospecimenInventory") or {}
    bio_ytd = biospecimen.get("byComponentYtd") or {}
    bio_cum = biospecimen.get("byComponentCumulative") or {}
    brs = ytd["brsAutopsy"]
    imaging = ytd.get("imaging") or {}
    scan = imaging.get("scanStudy") or {}
    clariti = imaging.get("claritiStudy") or {}
    ncrad = bio.get("ncradPlasmaMeasurements") or {}

    deaths_ytd = None
    for domain in pkg.get("reportingPeriodAdditional", {}).get("domains") or []:
        if domain.get("id") == "brs-dates":
            for m in domain.get("metrics") or []:
                if str(m.get("label", "")).startswith("Deaths"):
                    deaths_ytd = m.get("value")

    rppr_period = rppr.get("meta", {}).get("reportingPeriod", "RPPR period")
    rows: list[dict[str, str]] = []

    uds_file = f"data/rppr-data-package/.../{uds['sourceFile']}"
    bio_file = f"data/rppr-data-package/.../{bio['sourceFile']}"
    brs_file = f"data/rppr-data-package/{brs['sourceFile']}"
    img_long = (
        imaging.get("sourceFiles", {}).get("longitudinal")
        or "USC_ADRC_Imaging_Availability_Longitudinal_v1.5.2.csv"
    )

    # --- Reporting window ---
    rows.append(
        row(
            "Window",
            "Dashboard reporting period",
            period,
            "Fixed calendar window",
            "rpprDataPackage.json reportingPeriodSummary",
            f"startDate {ytd.get('startDate')} endDate {ytd.get('endDate')}",
        )
    )

    # --- ADRC / UDS ---
    ytd_part = uds.get("uniqueParticipantsWithVisit", uds["totalVisitRecords"])
    rows.append(
        row(
            "Recruitment - ADRC",
            "Participants with >=1 UDS visit (headline)",
            str(ytd_part),
            "Unique participants (distinct IDs with visit in window)",
            uds_file,
            f"visit_date in {period}; field visit_date / visitdate",
        )
    )
    rows.append(
        row(
            "Recruitment - ADRC",
            "In-person follow-up visit rows",
            str(uds["followUpInPerson"]),
            "Direct row count (non-initial, in-person mode)",
            uds_file,
            "packet != I; modea1=1; visit_date in period",
        )
    )
    rows.append(
        row(
            "Recruitment - ADRC",
            "Remote follow-up visit rows",
            str(uds["followUpRemote"]),
            "Direct row count (non-initial, phone/video)",
            uds_file,
            "modea1=2 or 3; visit_date in period",
        )
    )
    rows.append(
        row(
            "Recruitment - ADRC",
            "New initial evaluations",
            str(uds["newInitialEvaluations"]),
            "Direct row count (initial packets)",
            uds_file,
            "packet=I; visit_date in period",
        )
    )
    rows.append(
        row(
            "Recruitment - ADRC",
            "Visit rows sum check",
            f"{uds['followUpInPerson']}+{uds['followUpRemote']}+{uds['newInitialEvaluations']}={uds['totalVisitRecords']}",
            "Row sum (same participant may have multiple rows)",
            uds_file,
            "Equals totalVisitRecords in package",
        )
    )
    breakdown = uds.get("newInitialEvaluationBreakdown") or {}
    eth = breakdown.get("byRaceEthnicity") or []
    eth_summary = ", ".join(f"{r['label']} {r['count']}" for r in eth[:6]) if eth else "—"
    rows.append(
        row(
            "Recruitment - ADRC",
            "YTD new-eval breakdown (ethnicity / APOE / NACC refersc)",
            eth_summary or str(uds["newInitialEvaluations"]),
            "James harmonized data package YTD",
            "rpprDataPackage.json · newInitialEvaluationBreakdown",
            "UDS initial visits + subject race + MAP APOE + Form A1 refersc",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[1][1],
        )
    )
    rows.append(
        row(
            "Demographics - Table 1",
            "Cohort N (overall)",
            str(t1["overall"]["n"]).split("(")[0].strip(),
            "Cumulative registry snapshot (RPPR Table 1)",
            "2. Clinical Core Metrics_Y7.xlsx -> table1Demographics.json",
            "Not filtered to calendar YTD; green on dashboard",
            dashboard_color="green",
            data_lineage=LINEAGE_LEGEND[2][1],
        )
    )

    # --- GeneScreen / BRS totals ---
    gs_snap = gene_ytd["registrySnapshot"]
    rows.append(
        row(
            "Recruitment - GeneScreen",
            "Total members on registry (dashboard headline)",
            str(gs_snap["membersComplete"]),
            "RedCap: all Complete? rows in export",
            f"data/redcap/{gene_ytd['sourceFile']} -> geneScreenYtd.json",
            f"Black on dashboard; RPPR cited {rppr['geneScreen']['membersEnrolled']}",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        )
    )
    rows.append(
        row(
            "Recruitment - GeneScreen",
            "Male / Female / APOE4 carriers (registry snapshot)",
            f"{gs_snap['males']} / {gs_snap['females']} / {gs_snap['apoe4Carriers']}",
            "RedCap: Sex + Genotype on Complete? rows",
            f"data/redcap/{gene_ytd['sourceFile']} -> geneScreenYtd.json",
            "Black on dashboard headline",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        )
    )
    rows.append(
        row(
            "Recruitment - GeneScreen",
            "Total members (last RPPR reference only)",
            str(rppr["geneScreen"]["membersEnrolled"]),
            "Cumulative RPPR narrative count",
            "RPPR11382447 PDF -> rpprMetrics.json",
            f"Not used for dashboard headline after Oct 2026 REDCap export",
            dashboard_color="green",
            data_lineage=LINEAGE_LEGEND[2][1],
        )
    )
    rows.append(
        row(
            "Recruitment - GeneScreen",
            "New members YTD (consent date)",
            str(gene_ytd["newMembersByConsentDate"]),
            "REDCap GeneScreen registry · Consent Date in window",
            f"data/redcap/{gene_ytd['sourceFile']} -> geneScreenYtd.json",
            f"Black · {gene_ytd['reportingPeriodLabel']}",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[1][1],
        )
    )
    rows.append(
        row(
            "Recruitment - GeneScreen",
            "Online enrollments YTD (membership timestamp)",
            str(gene_ytd["onlineEnrollmentsByMembershipTimestamp"]),
            "REDCap GeneScreen registry · Membership Timestamp in window",
            f"data/redcap/{gene_ytd['sourceFile']} -> geneScreenYtd.json",
            "Black on dashboard period activities",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[1][1],
        )
    )
    dc_current = next(
        (r for r in brs_dc.get("rows") or [] if r.get("id") == "currentEnrollment"),
        {},
    )
    dc_new = next(
        (r for r in brs_dc.get("rows") or [] if r.get("id") == "newEnrolled"),
        {},
    )
    rows.append(
        row(
            "Recruitment - BRS",
            "Enrolled in autopsy program (dashboard headline)",
            str(dc_current.get("participants", "?")),
            "Data Core BRS RPPR Table 1 · current enrollment",
            "src/data/brsRpprTableDataCore2026.json",
            brs_dc.get("meta", {}).get("windowLabel", ""),
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[1][1],
        )
    )
    rows.append(
        row(
            "Recruitment - BRS",
            "Last RPPR PDF enrolled (reference only)",
            str(rppr["recruitment"]["brsTotalEnrolled"]),
            "Jul–Dec 2025 RPPR narrative",
            "rpprMetrics.json",
            "Not dashboard BRS headline after Data Core table",
            dashboard_color="green",
            data_lineage=LINEAGE_LEGEND[2][1],
        )
    )
    rows.append(
        row(
            "Recruitment - BRS",
            "New autopsy consents (Data Core RPPR window)",
            str(dc_new.get("participants", "?")),
            "autopsy_consent_date in Data Core window",
            "src/data/brsRpprTableDataCore2026.json",
            brs_dc.get("meta", {}).get("windowLabel", ""),
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[1][1],
        )
    )
    rows.append(
        row(
            "Recruitment - BRS",
            "James MAP new consents (EAC dashboard YTD window)",
            str(brs["newAutopsyConsents"]),
            "Direct row count (consent date in window)",
            brs_file,
            f"autopsy_consent_date in {period} · cross-check only",
        )
    )
    rows.append(
        row(
            "Recruitment - BRS",
            "YTD consent chart demographics",
            f"n={dc_new.get('participants', brs['newAutopsyConsents'])}, breakdown empty",
            "Count only; no demographic export",
            brs_file,
            "Red/TBD on dashboard",
        )
    )
    rows.append(
        row(
            "Recruitment - BRS",
            "Active BRS snapshot (subject_brs_status=1)",
            str(brs.get("activeEnrolled", "?")),
            "Export snapshot — confirm RPPR cumulative definition",
            brs_file,
            "James Oct 9 supplement; MAP data dictionary defines status=1 Active",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[1][1],
        )
    )
    if brs.get("withAutopsyCaseNumber") is not None:
        rows.append(
            row(
                "Neuropathology - MAP export",
                "Autopsy case numbers / autopsy_performed=1 (export-wide)",
                f"{brs.get('withAutopsyCaseNumber')} / {brs.get('cumulativeAutopsiesFlagged')}",
                "Row counts in latest MAP BRS cohort CSV",
                brs_file,
                "Not calendar YTD; data-package MAP pipeline summary",
                dashboard_color="black",
                data_lineage=LINEAGE_LEGEND[1][1],
            )
        )

    dc_meta = brs_dc.get("meta") or {}
    for dc_row in brs_dc.get("rows") or []:
        pct = dc_row.get("percentOfEnrollment")
        pct_str = f"{pct:.2f}%" if pct is not None else "—"
        rows.append(
            row(
                "Neuropathology - BRS RPPR Table 1 (Data Core)",
                dc_row.get("label", "?"),
                f"{dc_row.get('participants')} · {pct_str} · F{dc_row.get('female')} M{dc_row.get('male')}",
                "Xinhui Wang QC · MAP 10/7/2026 + harmonized UDS/milestones",
                "src/data/brsRpprTableDataCore2026.json",
                dc_meta.get("windowLabel", ""),
                dashboard_color="black",
                data_lineage=LINEAGE_LEGEND[1][1],
            )
        )

    # --- ORE ---
    oo = rppr["oreOutreach"]
    rows.append(
        row(
            "ORE Outreach",
            "Community events / attendees / groups contacted",
            f"{oo['communityEvents']} / {oo['eventAttendees']} / {oo['communityGroupsContacted']}",
            "Cumulative RPPR tables E1/E2",
            "5. ORE Core Metrics.xlsx -> rpprMetrics.json",
            f"RPPR period {rppr_period}; green on dashboard",
        )
    )
    rows.append(
        row(
            "ORE Outreach",
            "New online enrollments (card)",
            str(oo["newOnlineEnrollments"]),
            "Cumulative RPPR narrative",
            "rpprMetrics.json",
            "Not calendar GeneScreen YTD",
        )
    )
    rows.append(
        row(
            "ORE Outreach",
            "Brain Health 4 Me engaged",
            "TBD",
            "Not reported in sources",
            "N/A",
            "Red on dashboard",
        )
    )

    # --- Imaging YTD ---
    rows.append(
        row(
            "Imaging - YTD",
            "SCAN MRI / Amyloid PET / Tau PET participants",
            f"{scan.get('participantsWithMri', 0)} / {scan.get('participantsWithAmyloidPet', 0)} / {scan.get('participantsWithTauPet', 0)}",
            "Unique subject_key per modality in window",
            f"data/rppr-data-package/.../{img_long}",
            f"study_date in {period}; nacc_registry_verified=TRUE",
        )
    )
    rows.append(
        row(
            "Imaging - YTD",
            "CLARiTI MRI / Amyloid PET / Tau PET participants",
            f"{clariti.get('participantsWithMri', 0)} / {clariti.get('participantsWithAmyloidPet', 0)} / {clariti.get('participantsWithTauPet', 0)}",
            "Unique subject_key per modality in window",
            f"data/rppr-data-package/.../{img_long}",
            "Do not sum SCAN and CLARiTI",
        )
    )
    rows.append(
        row(
            "Imaging - targets",
            "SCAN / CLARiTI budget targets",
            f"{rppr['scanTargets']['scanTarget']} / {rppr['scanTargets']['claritiTarget']}",
            "Grant budget justification",
            "RPPR PDF",
            "Green target denominators",
        )
    )
    integrated = ytd.get("imagingIntegratedStudySummary") or {}
    for study_row in integrated.get("studies") or []:
        name = study_row.get("study", "?")
        nacc = study_row.get("naccRegistryVerifiedSubjects")
        rows.append(
            row(
                "Imaging - Study_Summary snapshot",
                f"{name} NACC verified subjects",
                str(nacc),
                "Package-wide study summary (not calendar YTD filter)",
                f"data/rppr-data-package/.../{integrated.get('sourceFile', 'Study_Summary CSV')}",
                "Green table on dashboard",
            )
        )
    rows.append(
        row(
            "Imaging - RPPR QC",
            "Amyloid PET / Tau PET / Structural MRI QC",
            f"{rppr['imagingQc']['amyloidPetQc']} / {rppr['imagingQc']['tauPetQc']} / {rppr['imagingQc']['structuralMriQc']}",
            "Cumulative RPPR Imaging Core B2",
            "8. Imaging Core Metrics.xlsx -> rpprMetrics.json",
            "Green; not imaging CSV YTD",
        )
    )
    rows.append(
        row(
            "Imaging - IDA uploads",
            "MR scans / MR participants / PET scans / PET participants",
            f"{rppr['idaImagingUpload']['mrScans']} / {rppr['idaImagingUpload']['mrParticipants']} / {rppr['idaImagingUpload']['petScans']} / {rppr['idaImagingUpload']['petParticipants']}",
            "Cumulative RPPR Data Core B2",
            "rpprMetrics.json idaImagingUpload",
            "Green",
        )
    )

    # --- Biomarkers ---
    bio_spec_file = (
        f"data/rppr-data-package/USC ADRC Biospecimen Availability/{biospecimen.get('sourceFile', 'USC_ADRC_Biospecimen_Availability_Long_v1.0.1.csv')}"
        if biospecimen
        else bio_file
    )
    plasma_inv = bio_ytd.get("plasma") or {}
    rows.append(
        row(
            "Biomarkers - biofluid inventory YTD",
            "Plasma participants / aliquots (dashboard biofluid table)",
            f"{plasma_inv.get('participants', bio['subjectsWithPlasmaCollection'])} / {plasma_inv.get('aliquots', bio['plasmaMeasurementRows'])}",
            "Biospecimen availability long file · collection_date in window",
            bio_spec_file,
            "James Oct 9 supplement — inventory, not assay rows",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[1][1],
        )
    )
    for comp_key, comp_label in [
        ("serum", "Serum"),
        ("buffy_coat", "Buffy coat"),
        ("csf", "CSF"),
    ]:
        comp = bio_ytd.get(comp_key) or {}
        rows.append(
            row(
                "Biomarkers - biofluid inventory YTD",
                f"{comp_label} participants / aliquots",
                f"{comp.get('participants', 0)} / {comp.get('aliquots', 0)}",
                "Sum aliquot_count · unique uds_id in period",
                bio_spec_file,
                "Dashboard Biofluid Collection table (black)",
                dashboard_color="black",
                data_lineage=LINEAGE_LEGEND[1][1],
            )
        )
    rows.append(
        row(
            "Biomarkers - assay YTD",
            "Plasma collection participants (integrated biomarker long)",
            str(bio["subjectsWithPlasmaCollection"]),
            "Unique uds_id with plasma collection in window",
            bio_file,
            "NCRAD cards use this file — separate from inventory aliquots",
        )
    )
    rows.append(
        row(
            "Biomarkers - assay YTD",
            "Plasma measurement rows",
            str(bio["plasmaMeasurementRows"]),
            "Direct row count (long format)",
            bio_file,
            "Integrated_Biomarkers_Long",
        )
    )
    for key, label in [
        ("ab40", "NCRAD A-beta40 plasma rows"),
        ("ab42", "NCRAD A-beta42 plasma rows"),
        ("gfap", "NCRAD GFAP plasma rows"),
        ("nfl", "NCRAD NfL plasma rows"),
        ("ptau217", "NCRAD ptau217 plasma rows"),
    ]:
        if key in ncrad:
            rows.append(
                row(
                    "Biomarkers - YTD NCRAD",
                    label,
                    str(ncrad[key]),
                    "Direct measurement rows in window",
                    bio_file,
                    "Plasma biomarker label filter in package aggregate",
                )
            )
    samp = rppr["samples"]
    buffy_ytd = (bio_ytd.get("buffy_coat") or {}).get("aliquots", "?")
    buffy_cum = (bio_cum.get("buffy_coat") or {}).get("aliquots", "?")
    rows.append(
        row(
            "Biomarkers - inventory",
            "PBMC / buffy coat / 126-plasma (dashboard sample cards)",
            f"PBMC {samp['pbmc']} (green) · buffy YTD {buffy_ytd} (black) · 126-plasma {samp['plasma126']} (green)",
            "Mixed: RPPR cumulative + James biospecimen YTD aliquots",
            f"{bio_spec_file} + rpprMetrics.json",
            f"Cumulative buffy inventory in package: {buffy_cum} aliquots",
        )
    )
    if bio_cum:
        rows.append(
            row(
                "Biomarkers - biospecimen cumulative",
                "Plasma / serum / buffy / CSF participants (all dates in export)",
                " / ".join(
                    str((bio_cum.get(k) or {}).get("participants", 0))
                    for k in ("plasma", "serum", "buffy_coat", "csf")
                ),
                "Full export snapshot — data-package biospecimen pipeline",
                bio_spec_file,
                "In rpprDataPackage.json byComponentCumulative",
                dashboard_color="black",
                data_lineage=LINEAGE_LEGEND[1][1],
            )
        )
    rows.append(
        row(
            "Biomarkers - research",
            "CSF analyzed / collaboration samples / APOE genotyping display",
            f"{rppr['biomarkerResearch']['csfSamplesAnalyzed']} / {rppr['biomarkerResearch']['collaborationSamples']} / {rppr['biomarkerResearch']['apoeGenotypingDisplay']}",
            "Cumulative RPPR Biomarker Core",
            "rpprMetrics.json biomarkerResearch",
            "Green",
        )
    )
    rows.append(
        row(
            "Biomarkers - clinical labs",
            "A1c / lipid / creatinine / BP counts",
            "Not shown (em dash)",
            "Not in harmonized export",
            "N/A",
            "Red/TBD on dashboard",
        )
    )

    # --- Neuropath ---
    rows.append(
        row(
            "Neuropathology - YTD",
            "Newly consented / autopsies performed",
            f"{brs['newAutopsyConsents']} / {brs['autopsiesPerformed']}",
            "Direct row count by consent / performed date",
            brs_file,
            f"Dates in {period}",
        )
    )
    rows.append(
        row(
            "Neuropathology",
            "Cohort deaths YTD",
            str(deaths_ytd if deaths_ytd is not None else "?"),
            "Direct row count (date_of_death in window)",
            brs_file,
            "Package reportingPeriodAdditional brs-dates",
        )
    )
    enrolled = rppr["neuropath"]["enrolledInAutopsyProgram"]
    adrc_n = rppr["recruitment"]["adrcTotalParticipants"]
    pct = round(1000 * enrolled / adrc_n) / 10 if adrc_n else 0
    rows.append(
        row(
            "Neuropathology",
            "Autopsy enrollment rate",
            f"{enrolled}/{adrc_n} ({pct}%)",
            "Derived ratio (cumulative counts)",
            "rpprMetrics neuropath + Table 1 N",
            "Green; RPPR enrolled / Table 1 cohort",
        )
    )

    # --- Specimen sharing ---
    bf = redcap["biofluids"]["reportingPeriod"]
    nb = redcap["neurobank"]["reportingPeriod"]
    rows.append(
        row(
            "Specimen sharing - YTD",
            "Biofluid requests received",
            str(bf["requestsReceived"]),
            "RedCap: completed requests in reporting period",
            f"data/redcap/{redcap['sources']['biofluids']}",
            "request_complete=2; request_timestamp in window",
        )
    )
    rows.append(
        row(
            "Specimen sharing - YTD",
            "Neurobank requests received / fulfilled",
            f"{nb['requestsReceived']} / {nb['requestsFulfilled']}",
            "RedCap: completed requests; fulfilled by status rules",
            f"data/redcap/{redcap['sources']['neurobank']}",
            period,
        )
    )
    rows.append(
        row(
            "Specimen sharing - YTD",
            "Plasma requests / aliquots requested",
            f"{bf['plasma']['requestsWithPlasma']} / {bf['plasma']['aliquotsRequested']}",
            "Sum of plasma request rows; sum of aliquot fields",
            f"data/redcap/{redcap['sources']['biofluids']}",
            "plasma_nci_req + plasma_mci_req + plasma_ad_req",
        )
    )

    # --- Clinical assessments (same as UDS) ---
    ca = rppr.get("clinicalAssessments", {})
    rows.append(
        row(
            "Clinical assessments",
            "Dashboard in-person / remote / initial",
            f"{uds['followUpInPerson']} / {uds['followUpRemote']} / {uds['newInitialEvaluations']}",
            "Same as UDS YTD (harmonized export)",
            uds_file,
            "Black on dashboard",
        )
    )
    rows.append(
        row(
            "Clinical assessments",
            "rpprMetrics.json clinicalAssessments (legacy RPPR)",
            f"{ca.get('followUpInPerson')} / {ca.get('followUpRemote')} / {ca.get('initialAssessments')}",
            "Cumulative RPPR extract (not used for YTD cards)",
            "rpprMetrics.json",
            f"RPPR {rppr_period}; do not confuse with YTD",
        )
    )

    # --- Grant plan charts ---
    rows.append(
        row(
            "Grant plan charts",
            "ADRC / GeneScreen / BRS renewal targets",
            "52 evals/yr; 1500 GS; 350 BRS pool etc.",
            "Grant application targets (not actuals)",
            "ADRC Renewal application Jun 2024",
            "Purple/plan styling in chart toggles",
        )
    )

    return rows


def build_adrienne_redcap_rows() -> list[dict[str, str]]:
    """Metrics on the dashboard sourced only from Adrienne's three Oct 2026 REDCap exports."""
    redcap = load("redcapSpecimenSharing.json")
    gene_ytd = load("geneScreenYtd.json")
    period = gene_ytd["reportingPeriodLabel"]
    snap = gene_ytd["registrySnapshot"]
    bf = redcap["biofluids"]["reportingPeriod"]
    nb = redcap["neurobank"]["reportingPeriod"]
    gs_file = gene_ytd["sourceFile"]
    bio_file = redcap["sources"]["biofluids"]
    neuro_file = redcap["sources"]["neurobank"]

    rows: list[dict[str, str]] = [
        row(
            "Adrienne REDCap · Biofluid",
            "Requests received (YTD)",
            str(bf["requestsReceived"]),
            "Survey Complete + timestamp in window",
            f"data/redcap/{bio_file}",
            f"Window {period}; fulfilled {bf['requestsFulfilled']}",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        ),
        row(
            "Adrienne REDCap · Biofluid",
            "Plasma requests / aliquots requested",
            f"{bf['plasma']['requestsWithPlasma']} / {bf['plasma']['aliquotsRequested']}",
            "Sum plasma NCI+MCI+AD fields on period requests",
            f"data/redcap/{bio_file}",
            period,
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        ),
        row(
            "Adrienne REDCap · Neurobank",
            "Requests received / fulfilled (YTD)",
            f"{nb['requestsReceived']} / {nb['requestsFulfilled']}",
            "Survey Complete + timestamp; fulfilled if sent/closed",
            f"data/redcap/{neuro_file}",
            period,
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        ),
        row(
            "Adrienne REDCap · GeneScreen",
            "Registry total (Complete?)",
            str(snap["membersComplete"]),
            "Count Complete? rows in export",
            f"data/redcap/{gs_file}",
            "Cumulative snapshot in export (not calendar YTD)",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        ),
        row(
            "Adrienne REDCap · GeneScreen",
            "Male / Female / APOE4 carriers",
            f"{snap['males']} / {snap['females']} / {snap['apoe4Carriers']}",
            "Sex column; genotype contains e4",
            f"data/redcap/{gs_file}",
            "Registry snapshot",
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        ),
        row(
            "Adrienne REDCap · GeneScreen",
            "New members (consent date in YTD)",
            str(gene_ytd["newMembersByConsentDate"]),
            "Complete? + Consent Date in window",
            f"data/redcap/{gs_file}",
            period,
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        ),
        row(
            "Adrienne REDCap · GeneScreen",
            "Online enrollments (membership timestamp YTD)",
            str(gene_ytd["onlineEnrollmentsByMembershipTimestamp"]),
            "Complete? + Membership Timestamp in window",
            f"data/redcap/{gs_file}",
            period,
            dashboard_color="black",
            data_lineage=LINEAGE_LEGEND[3][1],
        ),
    ]
    for item in gene_ytd["ethnicity"]:
        rows.append(
            row(
                "Adrienne REDCap · GeneScreen YTD charts",
                f"Ethnicity · {item['label']}",
                str(item["count"]),
                "Consent-date YTD cohort",
                f"data/redcap/{gs_file}",
                f"Sums to {gene_ytd['newMembersByConsentDate']}",
                dashboard_color="black",
                data_lineage=LINEAGE_LEGEND[3][1],
            )
        )
    for item in gene_ytd["gender"]:
        rows.append(
            row(
                "Adrienne REDCap · GeneScreen YTD charts",
                f"Gender · {item['label']}",
                str(item["count"]),
                "Consent-date YTD cohort",
                f"data/redcap/{gs_file}",
                period,
                dashboard_color="black",
                data_lineage=LINEAGE_LEGEND[3][1],
            )
        )
    for item in gene_ytd["apoe4"]:
        rows.append(
            row(
                "Adrienne REDCap · GeneScreen YTD charts",
                item["label"],
                str(item["count"]),
                "Consent-date YTD cohort · Genotype",
                f"data/redcap/{gs_file}",
                period,
                dashboard_color="black",
                data_lineage=LINEAGE_LEGEND[3][1],
            )
        )
    return rows


class ProvenancePdf:
    def __init__(self) -> None:
        from fpdf import FPDF

        self.pdf = FPDF(orientation="L", unit="mm", format="Letter")
        self.pdf.set_auto_page_break(auto=True, margin=14)
        self.pdf.set_margins(14, 14, 14)
        self.width = 279.4 - 28

    def add_page(self) -> None:
        self.pdf.add_page()

    def t(self, text: str) -> str:
        return ascii_safe(str(text))

    def cover(self, period: str) -> None:
        self.add_page()
        self.pdf.set_font("Helvetica", "B", 20)
        self.pdf.set_text_color(26, 39, 68)
        self.pdf.multi_cell(self.width, 10, self.t("USC ADRC Dashboard - Metric Provenance"))
        self.pdf.ln(4)
        self.pdf.set_font("Helvetica", "", 12)
        self.pdf.set_text_color(40, 40, 40)
        self.pdf.multi_cell(
            self.width,
            6,
            self.t(
                f"Reporting window: {period}. "
                "Each row lists the dashboard value, how it was counted, and the file or workbook it came from."
            ),
        )
        self.pdf.ln(3)
        self.pdf.set_font("Helvetica", "B", 11)
        self.pdf.multi_cell(self.width, 5.5, self.t("Color-coded data lineage (matches dashboard)"))
        self.pdf.set_font("Helvetica", "", 9.5)
        swatch_w = 6
        for color, title, detail in LINEAGE_LEGEND:
            fill = PDF_FILL[color]
            y0 = self.pdf.get_y()
            self.pdf.set_fill_color(*PDF_SWATCH[color])
            self.pdf.rect(self.pdf.l_margin, y0 + 0.5, swatch_w, 5, style="F")
            self.pdf.set_fill_color(*fill)
            self.pdf.set_text_color(*PDF_INK[color])
            self.pdf.set_font("Helvetica", "B", 10)
            label = f"  {color.upper()} — {title}"
            self.pdf.set_x(self.pdf.l_margin + swatch_w)
            self.pdf.multi_cell(self.width - swatch_w, 5.5, self.t(label), fill=True)
            self.pdf.set_font("Helvetica", "", 9)
            self.pdf.set_text_color(60, 60, 60)
            self.pdf.multi_cell(self.width, 4.5, self.t(f"      {detail}"))
            self.pdf.ln(1)
        self.pdf.ln(2)
        self.pdf.set_font("Helvetica", "B", 11)
        self.pdf.multi_cell(self.width, 5.5, self.t("How to read the Method column"))
        self.pdf.set_font("Helvetica", "", 10)
        methods = [
            "YTD unique participants - distinct IDs with activity dated in the reporting window.",
            "YTD direct row count - count CSV rows matching date and field rules (may exceed unique people).",
            "RedCap aggregate - filter completed requests by request_timestamp in window.",
            "Cumulative RPPR - from RPPR PDF / Core Metrics Excel via rpprMetrics.json (not calendar YTD).",
            "Package snapshot - full export totals without calendar YTD filter (imaging Study_Summary).",
            "Placeholder / TBD - shown on dashboard but not from a row-level export yet.",
            "Derived ratio - calculated from two sourced counts (e.g. enrollment rate).",
            "Grant target - renewal budget figure, not an observed count.",
        ]
        for m in methods:
            self.pdf.multi_cell(self.width, 5, self.t(f"  - {m}"))
        self.pdf.ln(2)
        self.pdf.set_font("Helvetica", "", 9)
        self.pdf.multi_cell(
            self.width,
            5,
            self.t(
                f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}. "
                "Data owners: James Wang & Xinhui Wang. Contact: xinhuiwa@usc.edu."
            ),
        )

    def table(self, rows: list[dict[str, str]], *, plain: bool = False) -> None:
        col_widths = [self.pdf.epw * r for r in TABLE_COL_RATIOS]
        line_h = 3.5
        pad = 0.8
        bottom = self.pdf.h - self.pdf.b_margin

        self.add_page()
        if not plain:
            self.pdf.set_font("Helvetica", "B", 14)
            self.pdf.set_text_color(26, 39, 68)
            self.pdf.cell(
                self.pdf.epw,
                8,
                self.t("USC ADRC Dashboard - Metric Provenance (detail table)"),
            )
            self.pdf.ln(6)
            self.pdf.set_font("Helvetica", "", 9)
            self.pdf.set_text_color(60, 60, 60)
            self.pdf.multi_cell(
                self.pdf.epw,
                4.5,
                self.t(
                    "Color column matches dashboard: BLACK = harmonized YTD / derived; "
                    "GREEN = last RPPR workbook; RED = placeholder. "
                    "All columns fit page width (Notes is last column)."
                ),
            )
            self.pdf.ln(4)

        def draw_header() -> None:
            x0 = self.pdf.l_margin
            y0 = self.pdf.get_y()
            h = 7
            x = x0
            self.pdf.set_font("Helvetica", "B", 7)
            self.pdf.set_fill_color(26, 39, 68)
            self.pdf.set_text_color(255, 255, 255)
            for label, w in zip(TABLE_COL_LABELS, col_widths, strict=True):
                self.pdf.rect(x, y0, w, h, style="DF")
                self.pdf.set_xy(x + pad, y0 + 1.5)
                self.pdf.cell(w - 2 * pad, 4, self.t(label), align="L")
                x += w
            self.pdf.set_y(y0 + h)

        def wrap_lines(text: str, w: float, bold: bool = False) -> list[str]:
            self.pdf.set_font("Helvetica", "B" if bold else "", 6.5)
            return self.pdf.multi_cell(
                w - 2 * pad,
                line_h,
                self.t(text),
                dry_run=True,
                output="LINES",
            )

        def row_height(cells: list[str], color_key: str) -> float:
            max_lines = 1
            for i, text in enumerate(cells):
                bold = i == 0
                max_lines = max(max_lines, len(wrap_lines(text, col_widths[i], bold=bold)))
            return max(max_lines * line_h + 2 * pad, 8 if color_key else 7)

        def draw_color_cell(x: float, y: float, w: float, h: float, color_key: str) -> None:
            fill = PDF_FILL.get(color_key, (255, 255, 255))
            self.pdf.set_fill_color(*fill)
            self.pdf.rect(x, y, w, h, style="DF")
            sw = min(4.5, w * 0.35)
            self.pdf.set_fill_color(*PDF_SWATCH.get(color_key, (100, 100, 100)))
            self.pdf.rect(x + pad, y + h / 2 - 2, sw, 4, style="F")
            self.pdf.set_font("Helvetica", "B", 8)
            self.pdf.set_text_color(*PDF_INK.get(color_key, (30, 30, 30)))
            self.pdf.set_xy(x + pad + sw + 1, y + h / 2 - 2.5)
            self.pdf.cell(w - 2 * pad - sw - 1, 5, self.t(color_key.upper()), align="L")

        draw_header()

        for r in rows:
            color_key = r.get("dashboard_color", "green")
            cells = [
                color_key.upper(),
                r["section"],
                r["metric"],
                r["value"],
                r["method"],
                r["source"],
                r.get("data_lineage", ""),
                r.get("notes", ""),
            ]
            rh = row_height(cells, color_key)
            if self.pdf.get_y() + rh > bottom:
                self.add_page()
                draw_header()

            y0 = self.pdf.get_y()
            x0 = self.pdf.l_margin
            x = x0
            row_fill = PDF_FILL.get(color_key, (255, 255, 255))

            for i, (text, w) in enumerate(zip(cells, col_widths, strict=True)):
                if i == 0:
                    draw_color_cell(x, y0, w, rh, color_key)
                else:
                    self.pdf.set_fill_color(*row_fill)
                    self.pdf.rect(x, y0, w, rh, style="DF")
                    self.pdf.set_xy(x + pad, y0 + pad)
                    self.pdf.set_font("Helvetica", "", 6.5)
                    self.pdf.set_text_color(30, 30, 30)
                    self.pdf.multi_cell(w - 2 * pad, line_h, self.t(text))
                x += w

            self.pdf.set_y(y0 + rh)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.pdf.output(str(path))


ADRIENNE_PDF = OUTPUT_DIR / "USC_ADRC_Adrienne_RedCap_Dashboard_Table.pdf"
ADRIENNE_CSV = OUTPUT_DIR / "USC_ADRC_Adrienne_RedCap_Dashboard_Table.csv"


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Generate dashboard metric provenance PDF/CSV")
    parser.add_argument(
        "--adrienne-table-only",
        action="store_true",
        help="Three Oct 2026 REDCap exports only; PDF is color table with no cover or intro text",
    )
    args = parser.parse_args()

    if args.adrienne_table_only:
        rows = enrich_rows(build_adrienne_redcap_rows())
        write_csv(rows, ADRIENNE_CSV)
        doc = ProvenancePdf()
        doc.table(rows, plain=True)
        doc.save(ADRIENNE_PDF)
        public = ROOT / "public" / "reports"
        public.mkdir(parents=True, exist_ok=True)
        import shutil

        shutil.copy(ADRIENNE_PDF, public / ADRIENNE_PDF.name)
        shutil.copy(ADRIENNE_CSV, public / ADRIENNE_CSV.name)
        print(f"Wrote {ADRIENNE_PDF} ({len(rows)} metrics)")
        print(f"Wrote {ADRIENNE_CSV}")
        return 0

    pkg = load("rpprDataPackage.json")
    period = pkg["reportingPeriodSummary"].get("label", "YTD")
    rows = enrich_rows(build_rows())
    write_csv(rows, OUTPUT_CSV)
    doc = ProvenancePdf()
    doc.table(rows)
    doc.save(OUTPUT)
    print(f"Wrote {OUTPUT} ({len(rows)} metrics)")
    print(f"Wrote {OUTPUT_CSV}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

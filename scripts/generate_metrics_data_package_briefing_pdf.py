#!/usr/bin/env python3
"""Generate a plain-language PDF for presenting Metrics vs Data Package vs gaps."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE_JSON = ROOT / "src" / "data" / "rpprDataPackage.json"
RPPR_METRICS_JSON = ROOT / "src" / "data" / "rpprMetrics.json"
PACKAGE_META = ROOT / "src" / "data" / "rpprDataPackageMeta.json"
OUTPUT_DIR = ROOT / "reports"
OUTPUT_PDF = OUTPUT_DIR / "USC_ADRC_Metrics_and_Data_Package_Briefing.pdf"

UNICODE_REPLACEMENTS = {
    "\u2013": "-",
    "\u2014": "-",
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u00b7": "-",
    "\u2192": "->",
    "\u2026": "...",
}


def ascii_safe(text: str) -> str:
    for src, dst in UNICODE_REPLACEMENTS.items():
        text = text.replace(src, dst)
    return text.encode("ascii", "replace").decode("ascii")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


class BriefingPdf:
    def __init__(self) -> None:
        from fpdf import FPDF

        self.pdf = FPDF(orientation="P", unit="mm", format="Letter")
        self.pdf.set_auto_page_break(auto=True, margin=18)
        self.pdf.set_margins(18, 18, 18)
        self.width = 177.9

    def add_page(self) -> None:
        self.pdf.add_page()

    def _t(self, text: str) -> str:
        return ascii_safe(text)

    def h1(self, text: str) -> None:
        self.pdf.set_font("Helvetica", "B", 17)
        self.pdf.set_text_color(26, 39, 68)
        self.pdf.multi_cell(self.width, 8, self._t(text))
        self.pdf.ln(2)

    def h2(self, text: str) -> None:
        self.pdf.set_font("Helvetica", "B", 13)
        self.pdf.set_text_color(26, 39, 68)
        self.pdf.multi_cell(self.width, 7, self._t(text))
        self.pdf.ln(1)

    def h3(self, text: str) -> None:
        self.pdf.set_font("Helvetica", "B", 11)
        self.pdf.set_text_color(60, 60, 80)
        self.pdf.multi_cell(self.width, 6, self._t(text))
        self.pdf.ln(1)

    def body(self, text: str) -> None:
        self.pdf.set_font("Helvetica", "", 10.5)
        self.pdf.set_text_color(30, 30, 30)
        self.pdf.multi_cell(self.width, 5.5, self._t(text))
        self.pdf.ln(1.5)

    def bullet(self, text: str) -> None:
        self.pdf.set_font("Helvetica", "", 10.5)
        self.pdf.set_text_color(30, 30, 30)
        self.pdf.multi_cell(self.width, 5.5, self._t(f"  -  {text}"))

    def callout(self, text: str) -> None:
        self.pdf.set_font("Helvetica", "B", 10.5)
        self.pdf.set_text_color(26, 39, 68)
        self.pdf.multi_cell(self.width, 5.5, self._t(text))
        self.pdf.ln(1)

    def spacer(self, mm: float = 3) -> None:
        self.pdf.ln(mm)

    def qa(self, question: str, answer: str) -> None:
        self.h3(question)
        self.body(answer)

    def comparison_table(self, rows: list[tuple[str, str, str, str]]) -> None:
        """Topic | Metrics | Data Package | Notes"""
        cols = [("Topic", 40), ("Metrics", 28), ("Data Package", 28), ("Notes", 81)]
        self.pdf.set_font("Helvetica", "B", 8)
        self.pdf.set_fill_color(230, 228, 240)
        self.pdf.set_text_color(26, 39, 68)
        for label, w in cols:
            self.pdf.cell(w, 7, self._t(label), border=1, fill=True)
        self.pdf.ln()
        for topic, metrics, package, notes in rows:
            x0 = self.pdf.get_x()
            y0 = self.pdf.get_y()
            line_h = 4
            texts = [topic, metrics, package, notes]
            widths = [40, 28, 28, 81]
            wrapped = []
            for text, w in zip(texts, widths, strict=True):
                self.pdf.set_font("Helvetica", "", 8)
                wrapped.append(
                    self.pdf.multi_cell(w, line_h, self._t(text), border=0, dry_run=True, output="LINES")
                )
            row_h = max(max(len(lines), 1) * line_h for lines in wrapped)
            row_h = max(row_h, 6)
            if y0 + row_h > 258:
                self.add_page()
                x0 = self.pdf.get_x()
                y0 = self.pdf.get_y()
            x = x0
            for text, w in zip(texts, widths, strict=True):
                self.pdf.set_xy(x, y0)
                self.pdf.set_font("Helvetica", "", 8)
                self.pdf.set_text_color(30, 30, 30)
                self.pdf.multi_cell(w, line_h, self._t(text), border=1)
                x += w
            self.pdf.set_xy(x0, y0 + row_h)
        self.spacer(2)

    def pros_cons_block(self, title: str, pros: list[str], cons: list[str]) -> None:
        self.h3(title)
        self.callout("Pros")
        for item in pros:
            self.bullet(item)
        self.spacer(1)
        self.callout("Cons")
        for item in cons:
            self.bullet(item)
        self.spacer(2)

    def two_col_table(self, rows: list[tuple[str, str, str]]) -> None:
        """Header: Item | Metrics dashboard | Data package"""
        cols = [("Item", 52), ("On Metrics dashboard", 62), ("In Data Package", 63)]
        self.pdf.set_font("Helvetica", "B", 9)
        self.pdf.set_fill_color(230, 228, 240)
        self.pdf.set_text_color(26, 39, 68)
        for label, w in cols:
            self.pdf.cell(w, 7, self._t(label), border=1, fill=True)
        self.pdf.ln()
        for item, metrics, package in rows:
            x0 = self.pdf.get_x()
            y0 = self.pdf.get_y()
            line_h = 4.5
            texts = [item, metrics, package]
            widths = [52, 62, 63]
            wrapped = []
            for text, w in zip(texts, widths, strict=True):
                self.pdf.set_font("Helvetica", "", 9)
                wrapped.append(
                    self.pdf.multi_cell(w, line_h, self._t(text), border=0, dry_run=True, output="LINES")
                )
            row_h = max(max(len(lines), 1) * line_h for lines in wrapped)
            row_h = max(row_h, 7)
            if y0 + row_h > 258:
                self.add_page()
                x0 = self.pdf.get_x()
                y0 = self.pdf.get_y()
            x = x0
            for text, w in zip(texts, widths, strict=True):
                self.pdf.set_xy(x, y0)
                self.pdf.set_font("Helvetica", "", 9)
                self.pdf.set_text_color(30, 30, 30)
                self.pdf.multi_cell(w, line_h, self._t(text), border=1)
                x += w
            self.pdf.set_xy(x0, y0 + row_h)
        self.spacer(2)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.pdf.output(str(path))


def metrics_dashboard_sections(rppr: dict) -> list[tuple[str, list[str]]]:
    rec = rppr.get("recruitment", {})
    gs = rppr.get("geneScreen", {})
    ore = rppr.get("oreOutreach", {})
    clin = rppr.get("clinicalAssessments", {})
    np = rppr.get("neuropath", {})
    samples = rppr.get("samples", {})
    ncrad = rppr.get("ncradBiomarkers", {})
    bio = rppr.get("biofluidCollection", {})
    research = rppr.get("biomarkerResearch", {})
    img_qc = rppr.get("imagingQc", {})
    ida = rppr.get("idaImagingUpload", {})
    targets = rppr.get("scanTargets", {})

    return [
        (
            "Recruitment",
            [
                f"ADRC: {rec.get('adrcTotalParticipants', '?')} total participants in the reporting cohort; "
                f"{rec.get('adrcNewThisPeriod', '?')} new initial evaluations Jul-Dec 2025.",
                f"GeneScreen registry: {gs.get('membersEnrolled', '?')} total members; "
                f"+{gs.get('membersAdded', '?')} added this period ({gs.get('males', '?')} male / "
                f"{gs.get('females', '?')} female; {gs.get('apoe4Carriers', '?')} APOE4 carriers).",
                f"BRS autopsy program: {rec.get('brsTotalEnrolled', '?')} enrolled; "
                f"{rec.get('brsNewThisPeriod', '?')} new consents this period.",
                "Demographics Table 1 for the full ADRC cohort (N=573): age, sex, race/ethnicity, "
                "education, CDR, diagnosis, etc.",
                "Some small charts for NEW participants this period (ethnicity, APOE, referral source) "
                "are shown on screen but are placeholders - RPPR only gives the count (6), not a breakdown.",
            ],
        ),
        (
            "Neuropathology",
            [
                f"{np.get('brsNewlyConsented', '?')} newly consented to autopsy this period.",
                f"{np.get('autopsiesPerformed', '?')} autopsies performed this period; "
                f"{np.get('cohortDeaths', '?')} deaths in cohort.",
                f"Cumulative: {np.get('cumulativeAutopsies', '?')} autopsies / "
                f"{np.get('cumulativeDeaths', '?')} deaths ({np.get('cumulativePercent', '?')}% rate).",
                f"{np.get('enrolledInAutopsyProgram', '?')} currently enrolled in the autopsy program.",
            ],
        ),
        (
            "Specimen sharing (RedCap)",
            [
                "Biofluid request tracking: how many outside requests for plasma, CSF, etc. Jul-Dec 2025.",
                "Neurobank (tissue) request tracking: requests received and fulfilled Jul-Dec 2025.",
                "These come from RedCap exports, not from the Sep 16 data package.",
            ],
        ),
        (
            "ORE outreach",
            [
                f"{ore.get('communityEvents', '?')} community outreach events; "
                f"{ore.get('eventAttendees', '?'):,} total attendees.",
                f"{ore.get('communityGroupsContacted', '?')} groups contacted; "
                f"{ore.get('groupsCollaborating', '?')} collaborating.",
                f"{ore.get('newOnlineEnrollments', '?')} new online enrollments.",
                "Brain Health 4 Me engagement is shown as TBD - not in RPPR.",
            ],
        ),
        (
            "Biomarkers",
            [
                f"Clinical assessments this period: {clin.get('followUpInPerson', '?')} in-person follow-ups, "
                f"{clin.get('followUpRemote', '?')} remote, {clin.get('initialAssessments', '?')} initial.",
                f"Samples sent to NCRAD: PBMC {samples.get('pbmc', '?')}, buffy coat "
                f"{samples.get('buffyCoat', '?')}, 126mL plasma {samples.get('plasma126', '?')}.",
                f"NCRAD results returned: Ab40 {ncrad.get('ab40', '?')}, Ab42 {ncrad.get('ab42', '?')}, "
                f"GFAP {ncrad.get('gfap', '?')}, NFL {ncrad.get('nfl', '?')}, pTau217 {ncrad.get('ptau217', '?')}.",
                f"Biofluid collection: plasma {bio.get('plasmaParticipants', '?')} participants "
                f"({bio.get('plasmaAliquots', '?')} aliquots), CSF {bio.get('csfParticipants', '?')} "
                f"participants ({bio.get('csfAliquots', '?')} aliquots).",
                f"Research samples: {research.get('csfSamplesAnalyzed', '?')} CSF analyzed; "
                f"APOE genotyping {research.get('apoeGenotypingDisplay', '?')}; "
                f"{research.get('collaborationSamples', '?')} collaboration samples.",
                "Clinical lab test counts (A1c, lipid panel, creatinine, blood pressure) on the dashboard "
                "are placeholders - RPPR mentions budget for some tests but not actual counts.",
            ],
        ),
        (
            "REC speaker series",
            [
                "Speaker series events: completed vs scheduled sessions and Zoom attendance.",
                "Comes from a separate speakers JSON file, not the Sep 16 data package.",
            ],
        ),
        (
            "Imaging",
            [
                f"Grant targets: SCAN {targets.get('scanTarget', '?')} scans, CLARITi "
                f"{targets.get('claritiTarget', '?')} scans (from RPPR / budget).",
                "Completed MRI / Amyloid PET / Tau PET counts on the dashboard are PLACEHOLDERS "
                "(red bars) - we do not yet have a clean export for those completion counts.",
                f"Imaging QC passed: amyloid PET {img_qc.get('amyloidPetQc', '?')}, tau PET "
                f"{img_qc.get('tauPetQc', '?')}, structural MRI {img_qc.get('structuralMriQc', '?')}.",
                f"IDA uploads Jul-Dec 2025: {ida.get('mrScans', '?'):,} MR scans "
                f"({ida.get('mrParticipants', '?'):,} participants), {ida.get('petScans', '?'):,} PET scans "
                f"({ida.get('petParticipants', '?'):,} participants).",
            ],
        ),
    ]


def data_package_sections(package: dict) -> list[tuple[str, list[str]]]:
    totals = package.get("totals") or {}
    return [
        (
            "What the data package is",
            [
                f"Delivered September 16, 2026. {totals.get('files', '?')} files "
                f"({totals.get('csvFiles', '?')} CSV spreadsheets, {totals.get('htmlReports', '?')} HTML reports).",
                "Purpose: give collaborators downloadable research datasets with harmonized UDS, "
                "biomarker availability, and MAP REDCap extracts.",
                "Explore interactively on the website under Data Package (/data-package).",
            ],
        ),
        (
            "UDS Harmonization (available)",
            [
                f"{totals.get('udsSubjects', 0):,} current subjects - one row per person with latest "
                "diagnosis, CDR, race/ethnicity, language, milestone status, etc.",
                f"{totals.get('udsVisitRecords', 0):,} longitudinal visit records - every UDS visit row harmonized.",
                f"{totals.get('milestoneRecords', 0):,} milestone history records.",
                "Includes HTML collaborator report and NACC data dictionaries.",
                "The website shows a breakdown for every quantifiable column in these files.",
            ],
        ),
        (
            "Integrated Biomarkers (available)",
            [
                f"{totals.get('biomarkerSubjects', 0):,} subjects with biomarker summary.",
                f"{totals.get('biomarkerMeasurements', 0):,} long-format measurement rows.",
                "Availability matrix (which biomarkers each subject has), source catalog, and data dictionary.",
            ],
        ),
        (
            "MAP Database - BRS and APOE (available)",
            [
                f"{totals.get('brsRecords', 0):,} BRS cohort records (enrollment, consent, autopsy linkage).",
                f"{totals.get('apoeRecords', 0):,} APOE genotype records with source attribution.",
                "Note: BRS IDs use 8-xxxx format - open CSVs via import, not double-click in Excel.",
            ],
        ),
        (
            "Integrated Imaging (NOT in this delivery)",
            [
                "MRI/PET availability matrix was not included September 16.",
                "Expected later: subject-level MRI/PET summary, availability matrix, source catalog, report.",
                "Until then, use Imaging QC and IDA upload numbers on the Metrics dashboard (from RPPR).",
            ],
        ),
    ]


def placeholder_on_dashboard() -> list[str]:
    return [
        "ADRC new-participant charts (ethnicity, APOE, recruitment source) for the 6 new evals - "
        "RPPR gives the count only, not who they are.",
        "Completed MRI / Amyloid PET / Tau PET scan counts - waiting for imaging export; targets (24/36) are real.",
        "Clinical lab test counts (A1c, lipid, creatinine, blood pressure) - not reported in RPPR.",
        "Brain Health 4 Me engagement - not in RPPR.",
        "Some GeneScreen period charts use estimated ethnicity/APOE splits (RPPR has totals, not period breakdown).",
        "5-year plan bar charts (enrollment targets) - grant application goals, not measured outcomes.",
    ]


def not_available_yet() -> list[str]:
    return [
        "Integrated Imaging Availability pipeline (MRI/PET matrix) - pending delivery after Sep 16.",
        "Real completed scan counts on the dashboard (until imaging data is wired in).",
        "ADRC new-participant breakdown charts (until RedCap/UDS export for those 6 evals).",
    ]


YES = "Yes"
NO = "No"
PARTIAL = "Partial"
PENDING = "Pending"


def full_comparison(totals: dict, rppr: dict) -> list[tuple[str, str, str, str]]:
    rec = rppr.get("recruitment", {})
    return [
        (
            "ADRC participant count",
            YES,
            YES,
            f"Metrics: {rec.get('adrcTotalParticipants', 573)} (RPPR Table 1). "
            f"Package: {totals.get('udsSubjects', 0):,} harmonized subjects. Different scope.",
        ),
        (
            "New ADRC evals this period",
            YES,
            NO,
            f"{rec.get('adrcNewThisPeriod', 6)} on dashboard. Package has full cohort, not a Jul-Dec slice.",
        ),
        (
            "Demographics Table 1 (N=573)",
            YES,
            NO,
            "Full table on Metrics. Package has subject file but not this RPPR table layout.",
        ),
        (
            "GeneScreen registry",
            YES,
            NO,
            "668 members, +19 period on Metrics. Not in Sep 16 package.",
        ),
        (
            "BRS enrollment (period story)",
            YES,
            PARTIAL,
            f"Metrics: RPPR neuropath narrative. Package: {totals.get('brsRecords', 0):,} REDCap rows.",
        ),
        (
            "ORE outreach events & attendees",
            YES,
            NO,
            "128 events, 8,243 attendees on Metrics. Not in data package.",
        ),
        (
            "REC speaker series",
            YES,
            NO,
            "On Metrics only (speakers JSON).",
        ),
        (
            "Specimen sharing (RedCap)",
            YES,
            NO,
            "Biofluid and neurobank requests Jul-Dec 2025. RedCap export, not in package.",
        ),
        (
            "Clinical assessments this period",
            YES,
            NO,
            "128 in-person / 7 remote / 6 initial on Metrics. RPPR period counts.",
        ),
        (
            "Biofluid collection this period",
            YES,
            NO,
            "Plasma, CSF, serum counts from RPPR/workbook on Metrics.",
        ),
        (
            "NCRAD sample & result counts",
            YES,
            NO,
            "PBMC, buffy, plasma, Ab42, GFAP, etc. on Metrics. Period operational counts.",
        ),
        (
            "Integrated biomarker availability",
            NO,
            YES,
            f"{totals.get('biomarkerSubjects', 0):,} subjects, "
            f"{totals.get('biomarkerMeasurements', 0):,} measurements in package CSVs.",
        ),
        (
            "Biomarker source catalog & dictionary",
            NO,
            YES,
            "In package only.",
        ),
        (
            "Harmonized UDS subject file",
            PARTIAL,
            YES,
            "Summary charts on Metrics. Full {0:,}-row CSV and field coverage in package.".format(
                totals.get("udsSubjects", 0)
            ),
        ),
        (
            "Longitudinal UDS visits",
            NO,
            YES,
            f"{totals.get('udsVisitRecords', 0):,} visit rows in package only.",
        ),
        (
            "Milestones history",
            NO,
            YES,
            f"{totals.get('milestoneRecords', 0):,} records in package only.",
        ),
        (
            "Cognitive dx / CDR / race charts",
            YES,
            YES,
            "Highlights on Metrics. Every field for every subject in package explorer.",
        ),
        (
            "APOE genotype records",
            PARTIAL,
            YES,
            f">500 wording on Metrics. {totals.get('apoeRecords', 0):,} rows in package CSV.",
        ),
        (
            "Imaging QC (amyloid/tau/MRI)",
            YES,
            NO,
            "114 / 75 / 917 on Metrics from RPPR. Not in package.",
        ),
        (
            "IDA imaging uploads",
            YES,
            NO,
            "2,618 MR / 1,068 PET on Metrics. Operational upload counts.",
        ),
        (
            "Integrated imaging availability",
            NO,
            PENDING,
            "Not in Sep 16 package. Expected in future delivery.",
        ),
        (
            "Completed scan counts (MRI/PET)",
            PARTIAL,
            NO,
            "Placeholder bars on Metrics. Real counts not wired yet.",
        ),
        (
            "5-year grant plan targets",
            YES,
            NO,
            "Renewal application goals on Metrics. Not research data.",
        ),
        (
            "NACC data dictionaries",
            NO,
            YES,
            "Bundled with UDS harmonization in package.",
        ),
        (
            "Per-column field breakdowns",
            NO,
            YES,
            "Interactive coverage on /data-package for every CSV column.",
        ),
        (
            "Clinical lab test counts (A1c, lipid, etc.)",
            PARTIAL,
            NO,
            "Placeholder on Metrics. Not in RPPR or package.",
        ),
    ]


def metrics_only_list(totals: dict, rppr: dict) -> list[str]:
    """Concrete list: present in Metrics section 2, absent from Data Package section 3."""
    rec = rppr.get("recruitment", {})
    ore = rppr.get("oreOutreach", {})
    return [
        f"RPPR reporting-period story (Jul-Dec 2025) - not a filter in the package CSVs",
        f"Demographics Table 1 (N={rec.get('adrcTotalParticipants', 573)}) as formatted for the grant",
        f"GeneScreen registry ({rppr.get('geneScreen', {}).get('membersEnrolled', '?')} members, "
        f"+{rppr.get('geneScreen', {}).get('membersAdded', '?')} this period)",
        f"ORE outreach ({ore.get('communityEvents', '?')} events, {ore.get('eventAttendees', '?'):,} attendees)",
        "REC speaker series (completed/scheduled sessions, Zoom attendance)",
        "RedCap specimen sharing - biofluid and neurobank request tracking",
        "NCRAD shipping and results counts for this period",
        "Biofluid collection totals for this period (plasma aliquots, CSF, etc.)",
        "Imaging QC passed counts and IDA upload totals",
        "SCAN/CLARITi grant targets (24 / 36)",
        "5-year renewal plan targets (GeneScreen 1,500, autopsy pool 350, etc.)",
        "Brain Health 4 Me engagement (TBD on dashboard)",
    ]


def package_only_list(totals: dict) -> list[str]:
    """Present in Data Package, not on Metrics dashboard."""
    return [
        f"Full harmonized subject CSV ({totals.get('udsSubjects', 0):,} rows - all current subjects)",
        f"Longitudinal UDS file ({totals.get('udsVisitRecords', 0):,} visit records)",
        f"Milestones history ({totals.get('milestoneRecords', 0):,} records)",
        f"Integrated biomarker subject summary ({totals.get('biomarkerSubjects', 0):,} subjects)",
        f"Long-format biomarker measurements ({totals.get('biomarkerMeasurements', 0):,} rows)",
        "Biomarker availability matrix and source catalog",
        "Biomarker data dictionary CSV",
        f"MAP BRS cohort REDCap export ({totals.get('brsRecords', 0):,} records)",
        f"MAP APOE genotype REDCap export ({totals.get('apoeRecords', 0):,} records)",
        "NACC UDS and Milestones data dictionaries (PDF + CSV)",
        "UDS harmonization collaborator HTML report",
        "Complete field coverage explorer (every quantifiable column charted)",
    ]


def in_both_list(totals: dict) -> list[str]:
    return [
        "Cognitive diagnosis distribution (dashboard chart + der_latest_cognitive_dx in package)",
        "Race/ethnicity summary (dashboard table + der_current_race_ethnicity_summary in package)",
        "CDR global (dashboard pie + der_latest_cdr_global in package)",
        "AD status, primary language, UDS generation (dashboard + matching package fields)",
        "BRS/APOE topic (dashboard neuropath/RPPR narrative + REDCap CSVs in package)",
        "Biomarker topic (dashboard = period ops; package = integrated availability dataset)",
    ]


def metrics_pros_cons() -> tuple[list[str], list[str]]:
    pros = [
        "Built for grant reporting - answers 'what did we do Jul-Dec 2025?'",
        "Numbers trace to RPPR, core workbooks, and RedCap where noted",
        "One screen for leadership: recruitment, outreach, samples, imaging ops",
        "Includes operational data the package does not carry (ORE, specimen requests, REC)",
        "Table 1 demographics ready for RPPR-style presentation",
    ]
    cons = [
        "Not the full research cohort (573 vs 2,373 subjects - different purpose)",
        "Some charts are placeholders - do not cite scan completion or new-participant breakdowns",
        "No downloadable row-level UDS for all subjects",
        "Jul-Dec 2025 focus - not a complete historical archive",
        "Imaging availability matrix not here (pending separate delivery)",
    ]
    return pros, cons


def package_pros_cons(totals: dict) -> tuple[list[str], list[str]]:
    pros = [
        f"Full collaborator-ready datasets ({totals.get('files', 19)} files, "
        f"{totals.get('totalCsvRows', 0):,} CSV rows)",
        f"Complete harmonized UDS cohort ({totals.get('udsSubjects', 0):,} subjects, "
        f"{totals.get('udsVisitRecords', 0):,} visits)",
        "Every quantifiable column has a breakdown in the explorer - auditable coverage",
        "Integrated biomarker availability across subjects and measurements",
        "REDCap BRS and APOE exports with source attribution for sharing",
        "NACC dictionaries and collaborator report included",
    ]
    cons = [
        "Not a grant period summary - do not use for 'what happened Jul-Dec 2025' alone",
        "No ORE outreach, GeneScreen registry, REC, or RedCap specimen request data",
        "Integrated imaging (MRI/PET matrix) not delivered Sep 16",
        "Large and technical - requires CSV literacy; BRS IDs need import not Excel double-click",
        "Overlap with dashboard highlights can look redundant unless you explain different scope",
    ]
    return pros, cons


def overlap_explained(totals: dict) -> list[tuple[str, str, str]]:
    return [
        (
            "Number of ADRC subjects",
            "573 in Table 1 (reporting-period cohort for the grant)",
            f"{totals.get('udsSubjects', 0):,} in package. Not an error: 573 is RPPR Table 1; "
            f"{totals.get('udsSubjects', 0):,} is the full research file.",
        ),
        (
            "Cognitive diagnosis / CDR / race",
            "Summary charts in Demographics section",
            "Same fields for every subject in field coverage. Dashboard = highlights; package = all rows.",
        ),
        (
            "BRS / autopsy",
            "Neuropathology section (this period + cumulative)",
            f"{totals.get('brsRecords', 0):,} BRS REDCap rows. Dashboard = RPPR story; package = raw export.",
        ),
        (
            "APOE genotyping",
            ">500 on dashboard (RPPR wording)",
            f"{totals.get('apoeRecords', 0):,} genotype records - one row per person in the CSV.",
        ),
        (
            "Biomarkers",
            "Period collection and NCRAD counts (RPPR)",
            f"{totals.get('biomarkerMeasurements', 0):,} measurement rows in integrated availability file.",
        ),
        (
            "Imaging",
            "QC counts and IDA uploads (RPPR)",
            "Availability matrix not delivered yet - coming in a future drop.",
        ),
    ]


def talking_points(totals: dict) -> list[tuple[str, str]]:
    return [
        (
            "What is the Metrics dashboard?",
            "Our grant reporting view for Jul-Dec 2025. It answers: how many participants, visits, "
            "samples, events, and uploads did we have in this reporting period?",
        ),
        (
            "What is the Data Package?",
            f"The Sep 16 collaborator delivery: downloadable research files with {totals.get('udsSubjects', 0):,} "
            "harmonized subjects, biomarker availability, and REDCap extracts. It is for sharing data, "
            "not for the RPPR period summary.",
        ),
        (
            "Why is ADRC 573 on the dashboard but 2,373 in the package?",
            "573 is RPPR Table 1 for the grant report. 2,373 is the full harmonized subject file for research. "
            "Both are correct for their purpose.",
        ),
        (
            "What is missing from the Sep 16 package?",
            "Integrated imaging availability (MRI/PET matrix). Everything else in the four pipelines is available.",
        ),
        (
            "What on the dashboard should I not cite as real data?",
            "Red placeholder bars for completed scans, ADRC new-participant breakdown charts, clinical lab counts, "
            "and 5-year plan targets. Say 'pending' or 'grant target' for those.",
        ),
        (
            "Where do specimen sharing numbers come from?",
            "RedCap exports for Jul-Dec 2025. They are on the Metrics dashboard only, not in the Sep 16 package.",
        ),
    ]


def main() -> int:
    try:
        from fpdf import FPDF  # noqa: F401
    except ImportError:
        print("Install fpdf2: .venv-pdf/bin/pip install fpdf2", file=sys.stderr)
        return 1

    if not PACKAGE_JSON.exists():
        print(f"Missing {PACKAGE_JSON}. Run: npm run sync:package", file=sys.stderr)
        return 1

    package = load_json(PACKAGE_JSON)
    rppr = load_json(RPPR_METRICS_JSON) if RPPR_METRICS_JSON.exists() else {}
    meta = load_json(PACKAGE_META) if PACKAGE_META.exists() else {}
    totals = package.get("totals") or {}
    period = rppr.get("meta", {}).get("reportingPeriod", "Jul-Dec 2025")

    doc = BriefingPdf()
    generated = datetime.now(timezone.utc).strftime("%B %d, %Y")

    # ---- Cover ----
    doc.add_page()
    doc.h1("USC ADRC Clinical Core")
    doc.spacer(1)
    doc.pdf.set_font("Helvetica", "", 13)
    doc.pdf.set_text_color(60, 60, 80)
    doc.pdf.multi_cell(doc.width, 7, doc._t("Plain guide: Metrics Dashboard vs Data Package"))
    doc.spacer(5)
    doc.body(f"Reporting period for Metrics dashboard: {period}")
    doc.body(f"Data package received: {package.get('receivedAt') or meta.get('receivedAt', 'Sep 16, 2026')}")
    doc.body(f"Prepared: {generated}")
    doc.spacer(4)
    doc.callout("Read this before you present.")
    doc.body(
        "You have two different tools on the website. This guide includes: (1) what each contains, "
        "(2) a side-by-side comparison table, (3) three lists of Metrics-only / Package-only / Both, "
        "(4) pros and cons for each, and (5) what is still missing."
    )

    # ---- Section 1: Two tools ----
    doc.add_page()
    doc.h2("1. Two tools - what each one is for")
    doc.spacer(1)
    doc.h3("Metrics Dashboard (main page)")
    doc.body(
        "Answers: What did the Clinical Core accomplish between July and December 2025? "
        "These numbers come from the RPPR grant report, core workbooks, and RedCap exports. "
        "Use this when discussing grant progress, recruitment this period, samples collected, "
        "outreach events, imaging QC, and specimen requests."
    )
    doc.h3("Data Package page (/data-package)")
    doc.body(
        "Answers: What research files did we deliver to collaborators on September 16? "
        "These are large CSV datasets - harmonized UDS, biomarker availability, BRS and APOE from REDCap. "
        "Use this when discussing what data can be shared, cohort size for research, and field-level coverage."
    )
    doc.spacer(2)
    doc.callout("Key idea: Metrics = this reporting period. Data package = research files for sharing.")
    doc.body(
        f"That is why you see 573 ADRC participants on the Metrics dashboard but "
        f"{totals.get('udsSubjects', 0):,} subjects in the data package. They measure different things."
    )

    # ---- Section 2: What's on Metrics ----
    doc.add_page()
    doc.h2("2. What is on the Metrics Dashboard")
    doc.body("Everything listed below is on the main dashboard today.")
    doc.spacer(1)
    for title, items in metrics_dashboard_sections(rppr):
        doc.h3(title)
        for item in items:
            doc.bullet(item)
        doc.spacer(1)

    # ---- Section 3: What's in Data Package ----
    doc.add_page()
    doc.h2("3. What is in the Data Package")
    doc.body("Everything listed below is in the September 16 delivery (or noted as pending).")
    doc.spacer(1)
    for title, items in data_package_sections(package):
        doc.h3(title)
        for item in items:
            doc.bullet(item)
        doc.spacer(1)

    # ---- Section 4: Side-by-side comparison ----
    doc.add_page()
    doc.h2("4. Side-by-side comparison (read this for presenting)")
    doc.body(
        "Use Yes / No / Partial / Pending. 'Partial' means a related summary exists but not "
        "the full form. This is the main table for 'what is in one place but not the other.'"
    )
    doc.spacer(1)
    doc.comparison_table(full_comparison(totals, rppr))

    # ---- Section 5: Three lists ----
    doc.add_page()
    doc.h2("5. Three clear lists")
    doc.h3("A. In Metrics Dashboard but NOT in Data Package")
    doc.body("Section 2 has these. Section 3 does not.")
    for item in metrics_only_list(totals, rppr):
        doc.bullet(item)
    doc.spacer(2)
    doc.h3("B. In Data Package but NOT on Metrics Dashboard")
    doc.body("Section 3 has these. Section 2 does not.")
    for item in package_only_list(totals):
        doc.bullet(item)
    doc.spacer(2)
    doc.h3("C. In BOTH (but often different numbers or depth)")
    doc.body("Same topic appears in both - explain scope, do not treat as duplicate error.")
    for item in in_both_list(totals):
        doc.bullet(item)

    # ---- Section 6: Pros and cons ----
    doc.add_page()
    doc.h2("6. Pros and cons - which tool when?")
    doc.body(
        "Use Metrics for grant meetings and period progress. Use Data Package for collaborator "
        "sharing and research cohort questions."
    )
    doc.spacer(1)
    m_pros, m_cons = metrics_pros_cons()
    p_pros, p_cons = package_pros_cons(totals)
    doc.pros_cons_block("Metrics Dashboard (Section 2)", m_pros, m_cons)
    doc.pros_cons_block("Data Package (Section 3)", p_pros, p_cons)

    # ---- Section 7: Placeholders ----
    doc.add_page()
    doc.h2("7. Shown on the dashboard but NOT real data yet")
    doc.body(
        "These appear on screen but you should NOT cite them as measured outcomes. "
        "Say 'placeholder' or 'pending data' if asked."
    )
    doc.spacer(1)
    for item in placeholder_on_dashboard():
        doc.bullet(item)

    # ---- Section 8: Missing ----
    doc.spacer(3)
    doc.h2("8. Not available anywhere yet")
    doc.spacer(1)
    for item in not_available_yet():
        doc.bullet(item)

    # ---- Section 9: Overlap table ----
    doc.add_page()
    doc.h2("9. Same topic, two places - why the numbers differ")
    doc.body("This table helps when someone sees two different numbers and thinks there is an error.")
    doc.spacer(1)
    doc.two_col_table(
        [(a, b, c) for a, b, c in overlap_explained(totals)]
    )

    # ---- Section 10: Q&A ----
    doc.add_page()
    doc.h2("10. Questions you may get - suggested answers")
    doc.spacer(1)
    for question, answer in talking_points(totals):
        doc.qa(question, answer)
        doc.spacer(2)

    # ---- File list (simple) ----
    doc.add_page()
    doc.h2("Appendix: Files in the September 16 package")
    doc.body("Quick list of deliverable filenames.")
    doc.spacer(1)
    for f in package.get("inventory", {}).get("files", []):
        name = f.get("fileName", "")
        rows = f.get("rowCount") or 0
        ftype = f.get("fileType", "")
        if rows:
            doc.bullet(f"{name} ({rows:,} rows, {ftype})")
        else:
            doc.bullet(f"{name} ({ftype})")

    doc.save(OUTPUT_PDF)
    print(f"Wrote {OUTPUT_PDF}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

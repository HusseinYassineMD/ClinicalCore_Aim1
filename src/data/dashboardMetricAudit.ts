import { siteReportingWindow } from "@/data/siteReporting";
import {
  DATA_OWNERS_DISPLAY,
  PENDING_IN_HARMONIZED_EXPORT,
} from "@/data/dataProvenance";
import { VALIDATED_CHECK_COUNT } from "@/data/dashboardConstants";

export type MetricTier = "verified" | "estimated" | "plan" | "mock" | "tbd";

export interface MetricAuditRow {
  section: string;
  metric: string;
  value: string;
  tier: MetricTier;
  source: string;
  notes?: string;
}

export const TIER_LABELS: Record<
  MetricTier,
  { label: string; description: string; className: string }
> = {
  verified: {
    label: "Verified",
    description: "Matches RPPR, workbook, or local CSV export",
    className: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  estimated: {
    label: "Estimated",
    description: "Derived by applying known ratios — not participant-level export",
    className: "bg-sky-50 text-sky-900 border-sky-200",
  },
  plan: {
    label: "Grant plan",
    description: "5-year renewal application target — not cumulative actuals",
    className: "bg-violet-50 text-violet-900 border-violet-200",
  },
  mock: {
    label: "Placeholder",
    description: "Invented or dummy — do not cite in reports",
    className: "bg-amber-50 text-amber-900 border-amber-200",
  },
  tbd: {
    label: "TBD",
    description: "Not yet wired to a source file",
    className: "bg-red-50 text-red-800 border-red-200",
  },
};

/** Metric-by-metric audit for the main dashboard (year-to-date from siteReporting unless noted). */
export const DASHBOARD_METRIC_AUDIT: MetricAuditRow[] = [
  // Recruitment — headline totals
  {
    section: "Recruitment · ADRC",
    metric: "Participants with UDS visit · year to date",
    value: "222",
    tier: "verified",
    source: "USC ADRC harmonized export · UDS_longitudinal_harmonized.csv · visit_date",
    notes: siteReportingWindow.label,
  },
  {
    section: "Recruitment · ADRC",
    metric: "Cumulative cohort (Table 1 · demographics only)",
    value: "573",
    tier: "verified",
    source: "RPPR11382447 Clinical Core B2 (p.341) · table1Demographics.json",
    notes: "Green on demographics table — not the YTD registry card headline.",
  },
  {
    section: "Recruitment · ADRC",
    metric: "Year to date · in-person / remote / initial",
    value: "181 / 17 / 24",
    tier: "verified",
    source: "USC ADRC harmonized export · UDS_longitudinal_harmonized.csv · visit_date",
    notes: siteReportingWindow.label,
  },
  {
    section: "Recruitment · ADRC",
    metric: "Charts · year to date (ethnicity, APOE, NACC referral)",
    value: "White 15 · Hispanic 6 · Asian 2 · MENA 1",
    tier: "verified",
    source:
      "rpprDataPackage.json · newInitialEvaluationBreakdown · subject + UDS + MAP APOE",
    notes: "Referral = NACC Form A1 refersc (not GeneScreen/ORE/SPARK labels). APOE: 8 genotyped in MAP export, 16 not linked.",
  },
  {
    section: "Recruitment · ADRC",
    metric: "Charts · 5-yr plan · ethnicity",
    value: "192 / 242 / 36 / 65",
    tier: "verified",
    source: "RPPR Table 1 · full clinical core (N=573)",
  },
  {
    section: "Recruitment · ADRC",
    metric: "Charts · 5-yr plan · APOE & source",
    value: "260 new (52/yr)",
    tier: "plan",
    source: "ADRC Renewal application (Jun 2024) · C.2.1",
    notes: "Modeled splits from enrichment targets — illustrative.",
  },
  {
    section: "Recruitment · GeneScreen",
    metric: "Total members · M / F · APOE4",
    value: "668 · 201 M / 467 F · 188 APOE4",
    tier: "verified",
    source: "RPPR ORE / GeneScreen narrative",
  },
  {
    section: "Recruitment · GeneScreen",
    metric: "New members · year to date",
    value: "55 (consent date)",
    tier: "verified",
    source: "USC GeneScreen REDCap · geneScreenYtd.json",
    notes: "1/1/2026 – 10/13/2026 · EAC lock · Complete records · black on dashboard.",
  },
  {
    section: "Recruitment · GeneScreen",
    metric: "Online enrollments · year to date",
    value: "87 (membership timestamp)",
    tier: "verified",
    source: "USC GeneScreen REDCap · geneScreenYtd.json",
    notes: "Membership Timestamp in YTD window; black period activity.",
  },
  {
    section: "Recruitment · GeneScreen",
    metric: "Charts · year to date (ethnicity, APOE, gender)",
    value: "n=55 · REDCap-derived",
    tier: "verified",
    source: "geneScreenYtd.json",
    notes: "Headline registry totals (668) stay green; YTD charts black from export.",
  },
  {
    section: "Recruitment · GeneScreen",
    metric: "Charts · 5-yr plan",
    value: "1,500 goal",
    tier: "plan",
    source: "Renewal application · ORE Aim 1",
  },
  {
    section: "Recruitment · BRS",
    metric: "Total enrolled / new consents · year to date",
    value: "231 (green) / 4 (black)",
    tier: "verified",
    source: "RPPR Neuropath B2 (231) · MAPDatabase-BRSCohort harmonized export (4 consents YTD)",
    notes: siteReportingWindow.label,
  },
  {
    section: "Recruitment · BRS",
    metric: "Charts · year to date (ethnicity, sex, APOE)",
    value: "n=4 · breakdown TBD (red)",
    tier: "tbd",
    source: "Harmonized export has consent count only — no YTD demographic breakdown yet",
  },
  {
    section: "Recruitment · BRS",
    metric: "Charts · 5-yr autopsy pool",
    value: "350 target",
    tier: "plan",
    source: "Renewal application · Clinical Core C.2.1",
  },
  // ORE
  {
    section: "ORE Outreach",
    metric: "Events / attendees / groups",
    value: "128 / 8,243 / 155",
    tier: "verified",
    source: "RPPR Table E1 / E2",
  },
  {
    section: "ORE Outreach",
    metric: "Brain Health 4 Me engaged",
    value: "TBD",
    tier: "tbd",
    source: "Not in RPPR",
  },
  // Imaging
  {
    section: "Imaging",
    metric: "SCAN / CLARITi targets",
    value: "24 / 36",
    tier: "verified",
    source: "RPPR · grant budget justification",
  },
  {
    section: "Imaging",
    metric: "SCAN YTD · MRI / Amyloid PET / Tau PET participants",
    value: "11 / 0 / 0",
    tier: "verified",
    source: "USC_ADRC_Imaging_Availability · study_date in period · nacc_registry_verified",
    notes: siteReportingWindow.label,
  },
  {
    section: "Imaging",
    metric: "CLARiTI YTD · MRI / Amyloid PET / Tau PET participants",
    value: "8 / 9 / 9",
    tier: "verified",
    source: "USC_ADRC_Imaging_Availability v1.5.2 · same rules as SCAN",
    notes: "Do not sum SCAN and CLARiTI.",
  },
  {
    section: "Imaging",
    metric: "YTD participants table + SCAN/CLARiTI cards (black)",
    value: "SCAN 11/0/0 · CLARiTI 8/9/9",
    tier: "verified",
    source: "rpprDataPackage.json · imaging · study_date in reporting window",
    notes: siteReportingWindow.label,
  },
  {
    section: "Imaging",
    metric: "Study_Summary snapshot table (green · not YTD)",
    value: "SCAN 58 · CLARiTI 11 · USC ADRC 103 NACC verified",
    tier: "verified",
    source: "USC_ADRC_Imaging_Availability_Study_Summary_v1.5.2.csv · package-wide counts",
  },
  {
    section: "Imaging",
    metric: "QC & IDA upload counts",
    value: "114 / 75 / 917 · 2,618 MR",
    tier: "verified",
    source: "RPPR Imaging & Data Core B2",
  },
  // Biomarkers
  {
    section: "Biomarkers",
    metric: "Biofluid inventory YTD (James biospecimen package)",
    value: "Plasma 183 / 2371 aliquots · Serum 32 / 746 · Buffy 183 / 392 · CSF 0 / 0",
    tier: "verified",
    source:
      "USC_ADRC_Biospecimen_Availability_Long_v1.0.1.csv · collection_date · rpprDataPackage.json biospecimenInventory",
    notes: siteReportingWindow.label,
  },
  {
    section: "Biomarkers",
    metric: "NCRAD plasma assay YTD · sample cards (mixed provenance)",
    value: "Aβ40/42 98 · GFAP/NfL/ptau217 194 · buffy YTD 392 aliquots (black) · PBMC/126-plasma green RPPR",
    tier: "verified",
    source:
      "Integrated_Biomarkers_Long (NCRAD) · biospecimen long (buffy YTD) · rpprMetrics samples (PBMC/126)",
  },
  {
    section: "Biomarkers",
    metric: "Clinical lab (A1C, lipid, creatinine, BP)",
    value: "— / — / — / —",
    tier: "tbd",
    source: "Not in harmonized Data Core export for this window",
    notes: "Dashboard shows em dash with red styling until wired.",
  },
  {
    section: "Biomarkers",
    metric: "CSF / collab / APOE genotyping",
    value: "450 / 115 / display string",
    tier: "verified",
    source: "Biomarker Core workbook · RPPR",
  },
  // Neuropath & specimens
  {
    section: "Neuropathology · BRS RPPR",
    metric: "Data Core Table 1 · 01/01/26 – 10/13/26 (EAC lock)",
    value: "New 5 · withdrawal 1 · current 226 · died w/ autopsy 7 · w/o 1",
    tier: "verified",
    source: "brsRpprTableDataCore2026.json · Xinhui Wang · MAP pull 2026-10-07",
    notes: "Percent column uses N=226 denominator; excludes MAP-active without finalized UDS.",
  },
  {
    section: "Neuropathology",
    metric: "Enrollment rate (Data Core enrolled ÷ Table 1 N)",
    value: "226 / 573 (39.4%)",
    tier: "verified",
    source: "brsRpprTableDataCore2026.json + table1Demographics.json",
  },
  {
    section: "Neuropathology",
    metric: "James MAP raw cross-check (EAC YTD window)",
    value: "4 consents · 5 autopsy dates · 8 deaths · status=1 n=231",
    tier: "verified",
    source: "rpprDataPackage.json brsAutopsy · not RPPR Table 1 denominator",
  },
  {
    section: "Specimen sharing",
    metric: "RedCap biofluid / neurobank requests · year to date",
    value: "7 / 34",
    tier: "verified",
    source: "RedCap CSV exports · reportingPeriod bucket",
    notes: siteReportingWindow.label,
  },
  {
    section: "Specimen sharing · Biofluids",
    metric: "Plasma requests · year to date",
    value: "8 requests · 590 aliquots",
    tier: "verified",
    source: "USCADRCBiofluidReque_DATA_2026-08-11_1336.csv · reportingPeriod",
  },
  {
    section: "Specimen sharing · Neurobank",
    metric: "Requests · year to date",
    value: "34 received · 6 fulfilled",
    tier: "verified",
    source: "USCADRCNeurobankRequ RedCap export · redcapSpecimenSharing.json",
  },
  // Demographics
  {
    section: "Demographics · Table 1",
    metric: "Full table (N=573)",
    value: "All rows",
    tier: "verified",
    source: "Clinical Core RPPR workbook Table 1",
  },
];

export const AUDIT_SUMMARY = {
  reportingPeriod: siteReportingWindow.label,
  validatedChecks: VALIDATED_CHECK_COUNT,
  dataOwner: DATA_OWNERS_DISPLAY,
  contactEmail: "xinhuiwa@usc.edu",
  primarySources: [
    "RPPR11382447.FINAL.1.30.26 NO BUDGET(1).pdf",
    "2. Clinical Core Metrics_Y7.xlsx",
    "6. Biomarker Core Metrics.xlsx",
    "ADRC Renewal application (Jun 2024) — plan targets only",
    "data/rppr-data-package/ · UDS Harmonization & Integrated Biomarkers & Imaging",
    "James Oct 9: MAPDatabase-BRSCohort_DATA_2026-10-09_1005.csv",
    "James Oct 9: MAPDatabase_DataDictionary_2026-10-09.csv",
    "James Oct 9: USC ADRC Biospecimen Availability v1.0.1 (long + subject summary + dictionary)",
    "data/rppr-data-package/MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv",
    "src/data/jamesSupplementsManifest.json · src/data/rpprDataPackage.json",
    "RedCap specimen sharing CSVs",
  ],
};

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
    value: "310",
    tier: "verified",
    source: "USC ADRC harmonized export · UDS_longitudinal_harmonized.csv · visit_date",
    notes: `${siteReportingWindow.label}. Last visit October 12, 2026. Zero visits after October 16. 40 initial + 247 in person + 23 remote.`,
  },
  {
    section: "Recruitment · ADRC",
    metric: "Active with UDS",
    value: "585",
    tier: "verified",
    source:
      "Xinhui Wang · RPPR tables to Aishwarya 2026-1110.xlsx · ADRC_active_all by race · as of 2026-10-16 · received 2026-11-10",
    notes: "Black. This is the Table 1 N. James's count of a UDS visit since 7/1/2025 is 543, a different count.",
  },
  {
    section: "Recruitment · ADRC",
    metric: "USC ADRC cumulative",
    value: "2390",
    tier: "verified",
    source: "UDS_longitudinal_harmonized.csv · all participants",
    notes: "Pink. September 9, 2005 through October 12, 2026. The file does not run through October 16.",
  },
  {
    section: "Recruitment · ADRC",
    metric: "Old RPPR Table 1 cohort",
    value: "573",
    tier: "verified",
    source: "RPPR11382447 Clinical Core B2 · table1Demographics.json",
    notes: "Green. Not the dashboard Table 1. The September 17 snapshot (N=569) is also not this table.",
  },
  {
    section: "Recruitment · ADRC",
    metric: "Year to date · in-person / remote / initial",
    value: "247 / 23 / 40",
    tier: "verified",
    source: "USC ADRC harmonized export · UDS_longitudinal_harmonized.csv · visit_date",
    notes: siteReportingWindow.label,
  },
  {
    section: "Recruitment · ADRC",
    metric: "Charts · year to date (ethnicity, APOE, NACC referral)",
    value: "White 24 · Asian 8 · Hispanic 7 · Middle Eastern or North African 1",
    tier: "verified",
    source:
      "rpprDataPackage.json · newInitialEvaluationBreakdown · subject + UDS + MAP APOE",
    notes: "These four bars sum to the 40 new evaluations. APOE: E3/E3 3, E3/E4 3, E3/E2 2, E4/E4 1, genotype not in the MAP export 31.",
  },
  {
    section: "Recruitment · ADRC",
    metric: "Charts · 5-yr plan · ethnicity",
    value: "192 / 242 / 36 / 65",
    tier: "verified",
    source: "Old RPPR Table 1 · N=573. Not rendered on the current metrics page.",
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
    value: "739 · 220 M / 519 F · 229 APOE4",
    tier: "verified",
    source: "USCGeneScreenRegistr-USCGeneScreenRegistr_DATA_LABELS_2026-10-07_0842.csv · Complete? records",
    notes: "Pink. The file stops October 7, 2026. The old RPPR number was 668.",
  },
  {
    section: "Recruitment · GeneScreen",
    metric: "New members · year to date",
    value: "55 (consent date)",
    tier: "verified",
    source: "USC GeneScreen REDCap · geneScreenYtd.json",
    notes: `${siteReportingWindow.label} · pink. The REDCap file stops October 7, before October 16.`,
  },
  {
    section: "Recruitment · GeneScreen",
    metric: "Online enrollments · year to date",
    value: "88 (membership timestamp)",
    tier: "verified",
    source: "USC GeneScreen REDCap · geneScreenYtd.json",
    notes: "Pink. Membership timestamp in the window. The file stops October 7.",
  },
  {
    section: "Recruitment · GeneScreen",
    metric: "Charts · year to date (ethnicity, APOE, gender)",
    value: "n=55 · REDCap-derived",
    tier: "verified",
    source: "geneScreenYtd.json",
    notes: "Pink. Ethnicity 14 + 33 + 5 + 2 + 1 = 55. The old RPPR total of 668 is a different count.",
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
    value: "225 enrolled · 5 new",
    tier: "verified",
    source:
      "Xinhui Wang · RPPR tables to Aishwarya 2026-1110.xlsx · BRS Table · as of 2026-10-16 · received 2026-11-10",
    notes: "James MAP Active 231 is a different count.",
  },
  {
    section: "Recruitment · BRS",
    metric: "Charts · race/ethnicity, sex, APOE4",
    value: "sex Male 82 / Female 143 of 225 · race/ethnicity Hispanic 39, non-Hispanic White 143, African American 10, Asian 16, Others 17 · APOE4 Yes 71 / No 139 / no genotype 15",
    tier: "verified",
    source:
      "Xinhui Wang · MAP BRS UDS list (N=225, active+min.cont as of 2026-1016).xlsx · sex, race_ethnicity, APOE4 · as of 2026-10-16",
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
    metric: "SCAN / CLARiTI targets",
    value: "24 / 36",
    tier: "verified",
    source: "RPPR · grant budget justification",
  },
  {
    section: "Imaging",
    metric: "SCAN YTD · MRI / Amyloid PET / Tau PET participants",
    value: "16 / 1 / 2",
    tier: "verified",
    source: "USC_ADRC_Imaging_Availability · study_date in period · nacc_registry_verified",
    notes: siteReportingWindow.label,
  },
  {
    section: "Imaging",
    metric: "CLARiTI YTD · MRI / Amyloid PET / Tau PET participants",
    value: "11 / 19 / 18",
    tier: "verified",
    source: "USC_ADRC_Imaging_Availability v1.5.4 · same rules as SCAN",
    notes: "Do not sum SCAN and CLARiTI.",
  },
  {
    section: "Imaging",
    metric: "YTD participants table + SCAN/CLARiTI cards (black)",
    value: "SCAN 16/1/2 · CLARiTI 11/19/18",
    tier: "verified",
    source: "rpprDataPackage.json · imaging · study_date in reporting window",
    notes: siteReportingWindow.label,
  },
  {
    section: "Imaging",
    metric: "Study_Summary snapshot table (green · not YTD)",
    value: "SCAN 62 · CLARiTI 21 · USC ADRC 104 NACC verified",
    tier: "verified",
    source: "USC_ADRC_Imaging_Availability_Study_Summary_v1.5.4.csv · package-wide counts",
  },
  {
    section: "Imaging",
    metric: "Imaging QC lists",
    value: "Amyloid 19 · tau 18 · structural MRI 38 sessions / 966 series · through 2026-10-16",
    tier: "verified",
    source:
      "v1.5.4 · CLARiTI_PET_QC_Listi_1793921811152.csv · CLARiTI_MRI_QC_Listi_1793921830826.csv · scan_mri_dashboard_usc_2026-11-05",
    notes:
      "Old RPPR sentence is a different count: 114 amyloid, 75 tau, 917 structural MRI, 14 new raw PET datasets. No new-raw-PET variable.",
  },
  {
    section: "Imaging",
    metric: "IDA image IDs",
    value: "MR 10,259 participants / 143,034 image IDs · PET 6,775 / 13,573 · through 2026-10-16",
    tier: "verified",
    source:
      "USC_ADRC_Integrated_Imaging_Availability_v1.5.4.csv · image_id · idaSearch_11_05_2026.csv and idaSearch_9_10_2026_SCAN.csv · study_date on or before 2026-10-16",
    notes:
      "Old RPPR upload sentence is a different count: 2,489 MR participants, 2,618 MR scans, 1,073 PET participants, 1,068 PET scans.",
  },
  // Biomarkers
  {
    section: "Biomarkers",
    metric: "Biofluid Collection · samples / tubes",
    value: "Plasma 203 / 2,427 · Buffy coat 203 / 404 · Serum 32 / 721 · CSF 0 / 0",
    tier: "verified",
    source:
      "data/reference/biomarker-core/Biomarker Core Sample Processing January-October 2026.xlsx · Abhay Sagare, USC ADRC Biomarker Core",
    notes: "Black for January through September 2026. October is pink: plasma 6 samples and 71 tubes, buffy coat 6 and 12, serum 0 and 0. The full workbook is 209 / 2,498 plasma, and that is not the black total. CSF is 0 / 0 because the workbook has no CSF rows.",
  },
  {
    section: "Biomarkers",
    metric: "NCRAD plasma assay rows",
    value: "Aβ40 148 · Aβ42 148 · GFAP 294 · NfL 294 · ptau217 296",
    tier: "verified",
    source:
      "data/JamesDataPacket-November-5/Integrated_Biomarkers_Long_v1.1.2.csv · James Wang · received November 5, 2026",
    notes:
      "Black. James Wang, November 5. Collections January 6, 2026 – August 27, 2026, inside the January 1 – October 16 window. No collection is dated January 1–5. The earlier James file is included.",
  },
  {
    section: "Biomarkers",
    metric: "PBMC samples",
    value: "331",
    tier: "verified",
    source: "Last RPPR inventory count. Not in REDCap, BST, or JamesDataPacket November 5.",
    notes: "Green. Stopped for now.",
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
    metric: "Data Core Table 1 · 01/01/26 – 10/16/26 (EAC lock)",
    value: "New 5 · withdrawal 1 · current 225 · died w/ autopsy 7 · w/o 1",
    tier: "verified",
    source:
      "brsRpprTableDataCore2026.json · Xinhui Wang · BRS Table · as of 2026-10-16 · received 2026-11-10",
    notes: "Percent column uses N=225. Female 143, male 82. James MAP Active 231 is a different count.",
  },
  {
    section: "Neuropathology",
    metric: "Enrollment rate (Data Core enrolled ÷ Table 1 N)",
    value: "225 / 585 (38.5%)",
    tier: "verified",
    source:
      "Xinhui Wang BRS current enrollment 225 ÷ Xinhui Wang active ADRC table 585 · both as of 2026-10-16",
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
    value: "8 / 36",
    tier: "verified",
    source: "REDCap Submitted Requests · pull 2026-11-06 · reportingPeriod",
    notes: siteReportingWindow.label,
  },
  {
    section: "Specimen sharing · Biofluids",
    metric: "Plasma requests · year to date",
    value: "8 requests · 590 aliquots",
    tier: "verified",
    source: "USCADRCBiofluidReque-SubmittedRequests_DATA_LABELS_2026-11-06_1127.csv · reportingPeriod",
  },
  {
    section: "Specimen sharing · Neurobank",
    metric: "Requests · year to date",
    value: "36 received",
    notes: "Fulfilled boxes are not on the page. Tissue fulfilled 6. Biofluid fulfilled 0. Plasma fulfilled 0.",
    tier: "verified",
    source: "USCADRCNeurobankRequ-SubmittedRequests_DATA_LABELS_2026-11-06_1127.csv · redcapSpecimenSharing.json",
  },
  // Demographics
  {
    section: "Demographics · Table 1",
    metric: "Full table (N=585)",
    value: "All 60 cells",
    tier: "verified",
    source:
      "Xinhui Wang · RPPR tables to Aishwarya 2026-1110.xlsx · ADRC_active_all by race · as of 2026-10-16",
    notes: "Black. Race 158+217+58+93+59=585. CDR 296+251+38=585. Male 212. Female on the chart is 585 minus 212 = 373. MoCA N=541. APOE N=474. APOE4 allele 176 (37.1%). The old RPPR table (N=573) is not this table.",
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
    "James Nov 6: data/MAPDataPacket-November-6/MAPDatabase-BRSCohort_DATA_LABELS_2026-11-06_1248.csv",
    "James Nov 6: data/MAPDataPacket-November-6/MAPDatabase-APOEGenotype_DATA_LABELS_2026-11-06_1248.csv",
    "James Oct 9: MAPDatabase-BRSCohort_DATA_2026-10-09_1005.csv",
    "James Oct 9: MAPDatabase_DataDictionary_2026-10-09.csv",
    "James Oct 9: USC ADRC Biospecimen Availability v1.0.1 (long + subject summary + dictionary)",
    "data/rppr-data-package/MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv",
    "src/data/jamesSupplementsManifest.json · src/data/rpprDataPackage.json",
    "RedCap specimen sharing CSVs",
  ],
};

/** MAP BRS REDCap · subject_brs_status = 1 (Active) · auto-generated from MAPDatabase-BRSCohort_DATA_2026-10-09_1005.csv. */
export const BRS_ACTIVE_COHORT = {
  exportFile: "MAPDatabase-BRSCohort_DATA_2026-10-09_1005.csv",
  activeRows: 231,
  rpprHeadlineEnrolled: 231,
  hispanicLatino: [
    { label: "Hispanic", count: 51 },
    { label: "Non-Hispanic", count: 178 },
    { label: "Unknown", count: 2 },
  ],
  sex: [
    { label: "Male", count: 85 },
    { label: "Female", count: 146 },
  ],
} as const;

/**
 * Legacy RPPR registry APOE layout (previously shown for BRS cumulative pie).
 * Dashboard red = not in harmonized export / unverified placeholder.
 */
export const BRS_LEGACY_APOE_PIE = [
  { label: "E3/E3", count: 72 },
  { label: "E3/E4", count: 61 },
  { label: "Other", count: 98 },
] as const;

/** BRS column · labels only — counts show TBD (unknown provenance, count 0). */
export const BRS_TBD_ETHNICITY = [
  { label: "Hispanic", count: 0 },
  { label: "Non-Hispanic", count: 0 },
  { label: "Unknown", count: 0 },
] as const;

export const BRS_TBD_SEX = [
  { label: "Male", count: 0 },
  { label: "Female", count: 0 },
] as const;

export const BRS_TBD_APOE = [
  { label: "APOE4 carrier", count: 0 },
  { label: "Non-carrier", count: 0 },
] as const;

/** GeneScreen YTD ethnicity rows at 0 until export is wired. */
export const GENESCREEN_YTD_LEGACY_ETHNICITY = [
  { label: "Hispanic", count: 0 },
  { label: "White", count: 0 },
  { label: "Black", count: 0 },
  { label: "Asian", count: 0 },
] as const;

export const LEGACY_RED_CHART_CAPTION =
  "Legacy / not in harmonized export · red = unverified placeholder";

/** RPPR Table 1 race/ethnicity row Ns (overall cohort N=573). */
export const TABLE1_ETHNICITY_BARS = [
  { label: "Hispanic", count: 192 },
  { label: "White", count: 242 },
  { label: "Black", count: 36 },
  { label: "Asian", count: 65 },
] as const;

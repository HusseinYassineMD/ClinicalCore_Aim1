/**
 * Xinhui Wang person list, 225 unique UDS IDs, as of 2026-10-16.
 * MAP BRS UDS list (N=225, active+min.cont as of 2026-1016).xlsx · sheet code book.
 * race_ethnicity: 1=Hispanic, 2=non-Hispanic White, 3=African American, 4=Asian, 5=Others, 99=Unknown.
 * sex: 1=Male, 2=Female.
 * APOE4: 1=Yes, 0=No. Blank rows also have no apoe_comb.
 */
export const BRS_ACTIVE_COHORT = {
  exportFile:
    "MAP BRS UDS list (N=225, active+min.cont as of 2026-1016).xlsx",
  activeRows: 225,
  rpprHeadlineEnrolled: 225,
  hispanicLatino: [
    { label: "Hispanic", count: 39 },
    { label: "non-Hispanic White", count: 143 },
    { label: "African American", count: 10 },
    { label: "Asian", count: 16 },
    { label: "Others", count: 17 },
  ],
  sex: [
    { label: "Male", count: 82 },
    { label: "Female", count: 143 },
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

/**
 * APOE4 flag on Xinhui's 225-person list.
 * Carrier = 1 (71). Non-carrier = 0 (139). Blank genotype = 15.
 * Genotypes among the 210 with a value: e3/e4 55, e4/e4 10, e4/e2 6,
 * e3/e3 120, e3/e2 17, e2/e2 2.
 */
export const BRS_ACTIVE_APOE = [
  { label: "Yes", count: 71 },
  { label: "No", count: 139 },
  { label: "No genotype", count: 15 },
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

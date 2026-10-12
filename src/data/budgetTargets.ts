/**
 * Denominator / goal values from the grant budget justification.
 * Dashboard period is calendar year to date (Jan 1 → today); annual targets shown as full-year goals.
 */
export const BUDGET_TARGETS = {
  /** ADRC new clinical evaluations per year (Renewal C.2.1) */
  adrcNewEvalsPerYear: 52,
  /** BRS new autopsy consents per year (Renewal C.2.1) */
  brsNewConsentsPerYear: 26,
  /** GeneScreen recruitment and genotyping */
  geneScreenRecruitmentPerYear: 300,
  /** Legacy half-year GeneScreen goal (superseded by YTD narrative on dashboard) */
  geneScreenRecruitmentReportingPeriod: 60,
  /** Community Advisory Board meetings (Table E2 / ORE) */
  communityAdvisoryBoardMeetingsPerYear: 3,
  /** CAB chair planning meetings with ADRC team */
  cabPlanningMeetingsPerYear: 3,
  /** CAB meeting participants budgeted per meeting */
  cabParticipantsPerMeeting: 6,
  /** Brain Health 4 Me participant incentives cohort */
  brainHealth4MeSubjects: 50,
  /** BH4M incentive data points per subject (baseline, T1, T2, T3) */
  brainHealth4MeDataPointsPerSubject: 4,
} as const;

/** Prorate an annual budget target to a 6-month RPPR window (legacy helpers). */
export function proratedReportingPeriodTarget(annualTarget: number): number {
  return Math.round(annualTarget / 2);
}

export function reportingPeriodTargetNote(annualTarget: number): string {
  const prorated = proratedReportingPeriodTarget(annualTarget);
  return `Budget: ${annualTarget}/year · ${prorated} for a 6-month RPPR window`;
}

import { packageYtd, siteReportingWindow } from "@/data/siteReporting";
import visitCohort from "@/data/adrcYtdVisitCohortBreakdown.json";
import type { DataProvenance } from "@/types/aim1";

const breakdown = packageYtd?.udsClinical.newInitialEvaluationBreakdown;
const visitBreakdown = visitCohort;

export const APOE_NOT_IN_EXPORT_LABEL = "Genotype not in MAP APOE export";

export type AdrcBreakdownChartItem = {
  label: string;
  count: number;
  provenance: DataProvenance;
};

export const adrcYtdInitialN =
  packageYtd?.udsClinical.newInitialEvaluations ?? 40;
export const adrcYtdVisitN = visitBreakdown.participantCount;

export const adrcYtdBreakdownCaption = `Source: James Wang · UDS_longitudinal_harmonized.csv. Through: October 12, 2026. New initial evaluations only (packet I). n=${adrcYtdInitialN}. This is not the ${adrcYtdVisitN} participants with any UDS visit. ${siteReportingWindow.label}.`;

export const adrcYtdVisitCaption = `Source: James Wang · UDS_longitudinal_harmonized.csv. Through: October 12, 2026. Every participant with a UDS visit in this window, including follow-ups. n=${adrcYtdVisitN}. This is not the ${adrcYtdInitialN} new initial evaluations. ${visitBreakdown.raceNote}`;

function withYtd(rows: { label: string; count: number }[]): AdrcBreakdownChartItem[] {
  return rows.map((row) => ({ ...row, provenance: "ytd" as const }));
}

export function adrcYtdEthnicityItems(): AdrcBreakdownChartItem[] {
  if (!breakdown?.byRaceEthnicity?.length) return [];
  return withYtd(breakdown.byRaceEthnicity);
}

export function adrcYtdApoeItems(): AdrcBreakdownChartItem[] {
  if (!breakdown?.byApoeGenotype?.length) return [];
  return breakdown.byApoeGenotype.map((row) => ({
    ...row,
    provenance:
      row.label === APOE_NOT_IN_EXPORT_LABEL
        ? ("unknown" as const)
        : ("ytd" as const),
  }));
}

export function adrcYtdReferralItems(): AdrcBreakdownChartItem[] {
  if (!breakdown?.byReferralSource?.length) return [];
  return withYtd(breakdown.byReferralSource);
}

export function adrcYtdEthnicityChartProvenance(): DataProvenance {
  return adrcYtdEthnicityItems().length > 0 ? "ytd" : "unknown";
}

export function adrcYtdApoeChartProvenance(): DataProvenance {
  const items = adrcYtdApoeItems();
  if (items.length === 0) return "unknown";
  if (items.some((i) => i.provenance === "unknown")) return "unknown";
  return "ytd";
}

export function adrcYtdReferralChartProvenance(): DataProvenance {
  return adrcYtdReferralItems().length > 0 ? "ytd" : "unknown";
}

export function adrcYtdHasPackageBreakdown(): boolean {
  return adrcYtdEthnicityItems().length > 0;
}

function withVisit(rows: { label: string; count: number }[]): AdrcBreakdownChartItem[] {
  return rows.map((row) => ({ ...row, provenance: "ytd" as const }));
}

export function adrcYtdVisitEthnicityItems(): AdrcBreakdownChartItem[] {
  return withVisit(visitBreakdown.byRaceEthnicity);
}

export function adrcYtdVisitApoeItems(): AdrcBreakdownChartItem[] {
  return visitBreakdown.byApoeGenotype.map((row) => ({
    ...row,
    provenance:
      row.label === APOE_NOT_IN_EXPORT_LABEL
        ? ("unknown" as const)
        : ("ytd" as const),
  }));
}

export function adrcYtdVisitReferralItems(): AdrcBreakdownChartItem[] {
  return withVisit(visitBreakdown.byReferralSource);
}

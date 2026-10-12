import { packageYtd, siteReportingWindow } from "@/data/siteReporting";
import type { DataProvenance } from "@/types/aim1";

const breakdown = packageYtd?.udsClinical.newInitialEvaluationBreakdown;

export const APOE_NOT_IN_EXPORT_LABEL = "Genotype not in MAP APOE export";

export type AdrcBreakdownChartItem = {
  label: string;
  count: number;
  provenance: DataProvenance;
};

export const adrcYtdBreakdownCaption = `YTD new initial evals · ${siteReportingWindow.label}`;

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

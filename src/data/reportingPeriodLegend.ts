import rpprMetrics from "@/data/rpprMetrics.json";
import { siteReportingWindow } from "@/data/siteReporting";

/** Last formal RPPR reporting period (PDF extract → rpprMetrics.json). */
export const lastRpprReportingPeriod = rpprMetrics.meta.reportingPeriod;

export const METRIC_COLOR_LEGEND = {
  ytd: `Black · Jan 1 – date (${siteReportingWindow.label}) · James harmonized data package`,
  prior: `Green · last RPPR reporting period (${lastRpprReportingPeriod})`,
  unknown: "Red · no data available",
} as const;

export function priorPeriodCaption(suffix?: string): string {
  const base = `last RPPR period · ${lastRpprReportingPeriod}`;
  return suffix ? `${base} · ${suffix}` : base;
}

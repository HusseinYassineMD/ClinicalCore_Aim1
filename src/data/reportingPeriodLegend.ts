import rpprMetrics from "@/data/rpprMetrics.json";
import { siteReportingWindow } from "@/data/siteReporting";

/** Last formal RPPR reporting period (PDF extract → rpprMetrics.json). */
export const lastRpprReportingPeriod = rpprMetrics.meta.reportingPeriod;

export const METRIC_COLOR_LEGEND = {
  ytd: `Black · through October 16 (${siteReportingWindow.label})`,
  prior: `Green · old RPPR (${lastRpprReportingPeriod})`,
  span: "Pink · latest data packet, but it does not run through October 16",
  unknown: "Red · we don't know",
} as const;

export function priorPeriodCaption(suffix?: string): string {
  const base = `last RPPR period · ${lastRpprReportingPeriod}`;
  return suffix ? `${base} · ${suffix}` : base;
}

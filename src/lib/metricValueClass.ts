import type { DataProvenance } from "@/types/aim1";

/** Map legacy provenance strings from older data files. */
export function normalizeProvenance(
  kind: DataProvenance | "real" | "mock" | "mixed" | undefined,
): DataProvenance {
  if (kind === "ytd" || kind === "prior" || kind === "unknown") return kind;
  if (kind === "real") return "ytd";
  if (kind === "mock") return "unknown";
  return "unknown";
}

function isUnknownValue(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (value === "—" || value === "-") return true;
  return false;
}

/** Placeholder / missing numeric slots still render as red zero on charts. */
export function isMissingChartCount(
  value: string | number | null | undefined,
): boolean {
  if (value === null || value === undefined) return true;
  if (value === "—" || value === "-") return true;
  return false;
}

/**
 * Black (ytd) = Jan 1 – date · harmonized data package + RedCap YTD.
 * Green (prior) = Last RPPR reporting period (rpprMetrics / Table 1 workbook).
 * Red (unknown) = No data / placeholder (text, bars, labels — not pie slice fill).
 */
export function metricValueClass(
  kind: DataProvenance | "real" | "mock" | undefined = "ytd",
  value?: string | number | null,
): string {
  const normalized = normalizeProvenance(kind);
  if (value !== undefined && isMissingChartCount(value)) {
    return "metric-value-unknown";
  }
  if (normalized === "prior") return "metric-value-prior";
  if (normalized === "unknown") return "metric-value-unknown";
  return "metric-value-ytd";
}

export const METRIC_CHART_COLORS = {
  ytd: "#0a0a0a",
  prior: "#15803d",
  unknown: "#dc2626",
} as const;

/** Pie rings only: muted slate for no-data / TBD slices (distinct from black/green/red counts). */
const PIE_UNKNOWN_PALETTE = [
  "#94a3b8",
  "#cbd5e1",
  "#64748b",
  "#a8b4c4",
] as const;

const BAR_UNKNOWN_PALETTE = [
  "#dc2626",
  "#ef4444",
  "#b91c1c",
  "#f87171",
] as const;

const BAR_PALETTES: Record<DataProvenance, readonly string[]> = {
  ytd: ["#0a0a0a", "#262626", "#404040", "#525252"],
  prior: ["#15803d", "#16a34a", "#059669", "#047857"],
  unknown: BAR_UNKNOWN_PALETTE,
};

/** SVG fill for bar labels and non-pie chart text (matches metricValueClass). */
export function metricChartLabelFill(
  kind: DataProvenance | "real" | "mock" | undefined = "ytd",
  value?: string | number | null,
): string {
  const normalized = normalizeProvenance(kind);
  if (value !== undefined && isMissingChartCount(value)) {
    return METRIC_CHART_COLORS.unknown;
  }
  if (normalized === "prior") return METRIC_CHART_COLORS.prior;
  if (normalized === "unknown") return METRIC_CHART_COLORS.unknown;
  return METRIC_CHART_COLORS.ytd;
}

/** Bar/pie top labels: verified counts vs red TBD when unknown or unsourced. */
export function chartCountDisplay(
  kind: DataProvenance | "real" | "mock" | undefined,
  value?: string | number | null,
): { text: string; fill: string } {
  if (isMissingChartCount(value)) {
    return { text: "TBD", fill: METRIC_CHART_COLORS.unknown };
  }
  return {
    text: String(value),
    fill: metricChartLabelFill(kind, value),
  };
}

export function chartHeadlineCount(
  kind: DataProvenance | "real" | "mock" | undefined,
  n: number | null | undefined,
): { text: string; className: string } {
  if (normalizeProvenance(kind) === "unknown" || isUnknownValue(n)) {
    return { text: "TBD", className: "metric-value-unknown" };
  }
  return {
    text: `n=${n}`,
    className: metricValueClass(kind, n),
  };
}

/** Bar segment colors aligned with black / green / red legend. */
export function chartBarFill(
  provenance: DataProvenance | "real" | "mock" | undefined,
  index: number,
): string {
  const k = normalizeProvenance(provenance);
  const palette = BAR_PALETTES[k];
  return palette[index % palette.length];
}

/** Pie slice fill when chart provenance is unknown / no-data (slate, not red). */
export function chartPieFill(
  provenance: DataProvenance | "real" | "mock" | undefined,
  index: number,
): string {
  const k = normalizeProvenance(provenance);
  if (k === "unknown") {
    return PIE_UNKNOWN_PALETTE[index % PIE_UNKNOWN_PALETTE.length];
  }
  return chartBarFill(provenance, index);
}

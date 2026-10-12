export const PACKAGE_CHART_COLORS = [
  "#5b4b8a",
  "#4a90c4",
  "#3d8b8b",
  "#8b7cb8",
  "#2d3a6e",
  "#6b9fd4",
  "#7a6ba8",
  "#4db6ac",
  "#9575cd",
  "#5c6bc0",
  "#7986cb",
  "#26a69a",
];

export interface ChartDatum {
  name: string;
  fullName: string;
  value: number;
}

/** Shorter display labels for long ADRC / demographic category strings. */
const CATEGORY_SHORT_LABELS: Record<string, string> = {
  "Presumed active - no Milestones record; UDS within 24 months":
    "Presumed active · UDS within 24 mo",
  "Status review - no Milestones record; last UDS more than 24 months ago or visit date unresolved":
    "Status review · last UDS >24 mo",
  "Annual in-person UDS follow-up": "Annual in-person UDS",
  "Annual UDS follow-up by telephone": "Annual UDS · telephone",
  "Cognitively impaired, not MCI/dementia": "Impaired · not MCI/dementia",
  "Unknown / not established from available Milestones": "Autopsy consent unknown",
  "Not established - no Milestones record": "Autopsy consent · no Milestones",
};

export function formatCategoryLabel(label: string): string {
  return CATEGORY_SHORT_LABELS[label] ?? label;
}

export function truncateLabel(label: string, max = 42): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max - 1)}…`;
}

export function recordToChartData(
  data: Record<string, number>,
  maxItems?: number,
  sortBy: "value" | "valueAsc" | "label" = "value",
): ChartDatum[] {
  const sorted = Object.entries(data)
    .filter(([, value]) => value > 0)
    .sort((a, b) => {
      if (sortBy === "label") {
        const na = parseInt(a[0], 10);
        const nb = parseInt(b[0], 10);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        return a[0].localeCompare(b[0]);
      }
      if (sortBy === "valueAsc") return a[1] - b[1];
      return b[1] - a[1];
    });

  const slice = maxItems ? sorted.slice(0, maxItems) : sorted;
  const rest = maxItems ? sorted.slice(maxItems) : [];

  const items: ChartDatum[] = slice.map(([fullName, value]) => ({
    fullName,
    name: truncateLabel(formatCategoryLabel(fullName)),
    value,
  }));

  if (rest.length > 0) {
    items.push({
      fullName: `Other (${rest.length} categories)`,
      name: "Other",
      value: rest.reduce((sum, [, v]) => sum + v, 0),
    });
  }

  return items;
}

export function totalFromRecord(data: Record<string, number>): number {
  return Object.values(data).reduce((sum, n) => sum + n, 0);
}

export function percent(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

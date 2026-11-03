import spanCounts from "@/data/recruitmentSpanCounts.json";
import type {
  DataProvenance,
  RegistryChartSlot,
  RegistryColumn,
} from "@/types/aim1";

export type RecruitmentPhase = "cumulative" | "grant" | "ytd";

type SpanItem = { label: string; count: number; available: boolean };
type SpanChart = {
  title: string;
  type: "bar" | "pie";
  n: number;
  nAvailable: boolean;
  nCaption: string;
  items: SpanItem[];
};
type SpanColumn = {
  title: string;
  total: number;
  totalAvailable: boolean;
  headerNote: string;
  banner: string;
  footnote?: string;
  gender?: { male: number; female: number; available: boolean };
  activities: { label: string; count: number; available: boolean }[];
  charts: SpanChart[];
};

const SPAN = spanCounts as {
  cumulative: Record<"adrc" | "genescreen" | "brs", SpanColumn>;
  grant: Record<"adrc" | "genescreen" | "brs", SpanColumn>;
};

function provenanceFor(available: boolean): DataProvenance {
  return available ? "span" : "unknown";
}

/** Year to date is the current column. The other two phases swap in file counts. */
export function columnForPhase(
  column: RegistryColumn,
  phase: RecruitmentPhase,
): RegistryColumn {
  if (phase === "ytd") return column;
  const span = SPAN[phase][column.id];
  const charts = span.charts.map((chart) => {
    const nProvenance = provenanceFor(chart.nAvailable);
    return {
      title: chart.title,
      type: chart.type,
      n: chart.n,
      nCaption: chart.nCaption,
      provenance: nProvenance,
      nProvenance,
      chartProvenance: nProvenance,
      items: chart.items.map((item) => ({
        label: item.label,
        count: item.count,
        provenance: provenanceFor(item.available),
      })),
    };
  }) as [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot];

  const available = span.totalAvailable;
  return {
    ...column,
    title: span.title,
    total: span.total,
    totalsProvenance: provenanceFor(available),
    newThisPeriod: span.activities.at(-1)?.count ?? span.total,
    periodActivities: span.activities.map((item) => ({
      label: item.label,
      count: item.count,
      provenance: provenanceFor(item.available),
    })),
    periodTarget: undefined,
    periodTargetNote: span.footnote,
    periodBanner: span.banner,
    headerNote: span.headerNote,
    gender:
      available && span.gender && span.gender.available
        ? { male: span.gender.male, female: span.gender.female }
        : undefined,
    apoeGenotypes: available ? column.apoeGenotypes : [],
    catchmentDemos: available ? column.catchmentDemos : [],
    bySource: available ? column.bySource : [],
    chartsProvenance: available ? "span" : "unknown",
    chartSlots: charts,
  };
}

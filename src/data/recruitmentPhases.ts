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

type PhaseColumns = Record<"adrc" | "genescreen" | "brs", SpanColumn> & {
  adrcAlive: SpanColumn;
};

const SPAN = spanCounts as {
  cumulative: PhaseColumns;
  grant: PhaseColumns;
  ytd: { adrcAlive: SpanColumn };
};

function provenanceFor(available: boolean): DataProvenance {
  return available ? "span" : "unknown";
}

function applySpan(column: RegistryColumn, span: SpanColumn): RegistryColumn {
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

export type UdsPeriodBox = {
  id: "grant" | "ytd";
  label: string;
  detail: string;
  total: number;
  provenance: DataProvenance;
};

/** Active and year to date, shown together in the UDS header. */
export function udsPeriodBoxes(alive: boolean, ytdTotal: number): UdsPeriodBox[] {
  const active = alive ? SPAN.grant.adrcAlive : SPAN.grant.adrc;
  return [
    {
      id: "grant",
      label: "Active with UDS",
      detail: alive ? "since 7/1/2025 · alive" : "since 7/1/2025",
      total: active.total,
      provenance: "span",
    },
    {
      id: "ytd",
      label: "Year to date",
      detail: alive ? "alive" : "through last visit",
      total: alive ? SPAN.ytd.adrcAlive.total : ytdTotal,
      provenance: alive ? "span" : "prior",
    },
  ];
}

/** Year to date is the current column. The other two phases swap in file counts. */
export function columnForPhase(
  column: RegistryColumn,
  phase: RecruitmentPhase,
  alive = false,
): RegistryColumn {
  if (alive && column.id === "adrc") {
    return applySpan(column, SPAN[phase].adrcAlive);
  }
  if (phase === "ytd") return column;
  return applySpan(column, SPAN[phase][column.id]);
}

import spanCounts from "@/data/recruitmentSpanCounts.json";
import activePlusMinimal from "@/data/adrcActivePlusMinimal.json";
import minimalContact from "@/data/adrcMinimalContact.json";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";
import { udsLatestVisitDate } from "@/data/siteReporting";
import { formatScopeDate } from "@/lib/formatScopeDate";
import { parseLeadingCount } from "@/lib/table1Parse";
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

const udsThrough = formatScopeDate(udsLatestVisitDate);

const ACTIVE_ADRC_SOURCE =
  "Xinhui Wang · RPPR tables to Aishwarya 2026-1110.xlsx · sheet ADRC_active_all by race";

/** Active ADRC participants (UDS data) as of October 16, 2026. Not the since-7/1/2025 visit count. */
function activeAdrcColumn(column: RegistryColumn): RegistryColumn {
  const n = table1HarmonizedActiveSnapshot.meta.participantCount;
  const male = parseLeadingCount(table1HarmonizedActiveSnapshot.overall.male);
  const female = n - male;
  const apoeCarriers = parseLeadingCount(
    table1HarmonizedActiveSnapshot.overall.apoeE4Percent,
  );
  const mocaN = table1HarmonizedActiveSnapshot.meta.mocaN;
  const apoeN = table1HarmonizedActiveSnapshot.meta.apoeN;
  const ytd = "ytd" as const;
  const caption = `Source: ${ACTIVE_ADRC_SOURCE}. Through: October 16, 2026. Black · active ADRC participants (UDS data).`;
  const race = [
    ["Hispanic", table1HarmonizedActiveSnapshot.hispanic.n],
    ["White", table1HarmonizedActiveSnapshot.white.n],
    ["Black", table1HarmonizedActiveSnapshot.black.n],
    ["Asian", table1HarmonizedActiveSnapshot.asian.n],
    ["Other/unknown", table1HarmonizedActiveSnapshot.otherUnknown.n],
  ] as const;

  return {
    ...column,
    title: "Active ADRC participants (UDS)",
    total: n,
    totalsProvenance: ytd,
    chartsProvenance: ytd,
    newThisPeriod: n,
    periodTarget: undefined,
    periodBanner: "Active ADRC participants (UDS)",
    periodTargetNote: `MoCA N is participants with a MoCA score: ${mocaN} of ${n} active participants. APOE N is participants with an APOE genotype: ${apoeN} of ${n}. APOE4 allele is participants with at least one ε4 allele: ${apoeCarriers} of ${apoeN} with a genotype.`,
    headerNote: caption,
    gender: undefined,
    periodActivities: [
      {
        label: "MoCA N",
        definition: "Participants with a MoCA score",
        count: mocaN,
        denominator: n,
        denominatorLabel: `of ${n} active participants`,
        provenance: ytd,
      },
      {
        label: "APOE N",
        definition: "Participants with an APOE genotype",
        count: apoeN,
        denominator: n,
        denominatorLabel: `of ${n} active participants`,
        provenance: ytd,
      },
      {
        label: "APOE4 allele",
        definition: "Participants with at least one ε4 allele",
        count: apoeCarriers,
        denominator: apoeN,
        denominatorLabel: `of ${apoeN} with a genotype`,
        provenance: ytd,
      },
    ],
    chartSlots: [
      {
        title: "Race/ethnicity",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: caption,
        items: race.map(([label, raw]) => ({
          label,
          count: parseLeadingCount(raw),
          provenance: ytd,
        })),
      },
      {
        title: "Sex",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: `${caption} Male ${male} is the cell on the sheet. Female ${female} is ${n} minus that male count.`,
        items: [
          { label: "Male", count: male, provenance: ytd },
          { label: "Female", count: female, provenance: ytd },
        ],
      },
      {
        title: "CDR global",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: caption,
        items: [
          {
            label: "CDR = 0",
            count: parseLeadingCount(table1HarmonizedActiveSnapshot.overall.cdr0),
            provenance: ytd,
          },
          {
            label: "CDR = 0.5",
            count: parseLeadingCount(table1HarmonizedActiveSnapshot.overall.cdr05),
            provenance: ytd,
          },
          {
            label: "CDR >= 1",
            count: parseLeadingCount(
              table1HarmonizedActiveSnapshot.overall.cdrGe1,
            ),
            provenance: ytd,
          },
        ],
      },
    ],
  };
}

/** Minimal contact is a separate status. Same neighboring cards as Active with UDS, for these 540 people only. */
export function minimalContactColumn(column: RegistryColumn): RegistryColumn {
  const n = minimalContact.count;
  const ytd = "ytd" as const;
  const caption = `Source: ${minimalContact.source}. Through: October 16, 2026. These ${n} people are not in the ${minimalContact.activeWithUdsCount}. ${minimalContact.raceNote}`;
  const items = (
    rows: { label: string; count: number }[],
  ): RegistryChartSlot["items"] =>
    rows.map((row) => ({ label: row.label, count: row.count, provenance: ytd }));

  return {
    ...column,
    title: "Minimal contact",
    total: n,
    totalsProvenance: ytd,
    chartsProvenance: ytd,
    newThisPeriod: n,
    periodTarget: undefined,
    periodBanner: "Minimal contact",
    periodTargetNote: minimalContact.footnote,
    headerNote: caption,
    gender: undefined,
    periodActivities: [
      {
        label: "MoCA N",
        definition: "Latest UDS visit has a MoCA total",
        count: minimalContact.mocaN,
        denominator: n,
        denominatorLabel: `of ${n} minimal-contact participants`,
        provenance: ytd,
      },
      {
        label: "APOE N",
        definition: "Participants with an APOE genotype",
        count: minimalContact.apoeN,
        denominator: n,
        denominatorLabel: `of ${n} minimal-contact participants`,
        provenance: ytd,
      },
      {
        label: "APOE4 allele",
        definition: "Participants with at least one ε4 allele",
        count: minimalContact.apoeE4,
        denominator: minimalContact.apoeN,
        denominatorLabel: `of ${minimalContact.apoeN} with a genotype`,
        provenance: ytd,
      },
    ],
    chartSlots: [
      {
        title: "Race/ethnicity",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: caption,
        items: items(minimalContact.byRaceEthnicity),
      },
      {
        title: "Sex",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: `${caption} Male ${minimalContact.male} and female ${minimalContact.female} are the current sex on the subject file.`,
        items: items(minimalContact.bySex),
      },
      {
        title: "CDR global",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: `${caption} CDR is the latest UDS visit.`,
        items: items(minimalContact.byCdr),
      },
    ],
  };
}

/** Active statuses plus minimal contact. Same neighboring cards, for these 1,125 people. */
export function activePlusMinimalColumn(column: RegistryColumn): RegistryColumn {
  const n = activePlusMinimal.count;
  const ytd = "ytd" as const;
  const caption = `Source: ${activePlusMinimal.source}. Through: October 16, 2026. ${activePlusMinimal.activeWithUdsCount} active statuses plus ${activePlusMinimal.minimalContactCount} minimal contact. Overlap is 0. ${activePlusMinimal.raceNote}`;
  const items = (
    rows: { label: string; count: number }[],
  ): RegistryChartSlot["items"] =>
    rows.map((row) => ({ label: row.label, count: row.count, provenance: ytd }));

  return {
    ...column,
    title: activePlusMinimal.label,
    total: n,
    totalsProvenance: ytd,
    chartsProvenance: ytd,
    newThisPeriod: n,
    periodTarget: undefined,
    periodBanner: "Active + minimal contact",
    periodTargetNote: activePlusMinimal.footnote,
    headerNote: caption,
    gender: undefined,
    periodActivities: [
      {
        label: "MoCA N",
        definition: "Latest UDS visit has a MoCA total",
        count: activePlusMinimal.mocaN,
        denominator: n,
        denominatorLabel: `of ${n} active plus minimal contact`,
        provenance: ytd,
      },
      {
        label: "APOE N",
        definition: "Participants with an APOE genotype",
        count: activePlusMinimal.apoeN,
        denominator: n,
        denominatorLabel: `of ${n} active plus minimal contact`,
        provenance: ytd,
      },
      {
        label: "APOE4 allele",
        definition: "Participants with at least one ε4 allele",
        count: activePlusMinimal.apoeE4,
        denominator: activePlusMinimal.apoeN,
        denominatorLabel: `of ${activePlusMinimal.apoeN} with a genotype`,
        provenance: ytd,
      },
    ],
    chartSlots: [
      {
        title: "Race/ethnicity",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: caption,
        items: items(activePlusMinimal.byRaceEthnicity),
      },
      {
        title: "Sex",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: `${caption} Male ${activePlusMinimal.male}, female ${activePlusMinimal.female}, unknown ${activePlusMinimal.unknownSex}.`,
        items: items(activePlusMinimal.bySex),
      },
      {
        title: "CDR global",
        type: "bar",
        provenance: ytd,
        nProvenance: ytd,
        chartProvenance: ytd,
        n,
        nCaption: `${caption} CDR is the latest UDS visit.`,
        items: items(activePlusMinimal.byCdr),
      },
    ],
  };
}

/** Active and year to date, shown together in the UDS header. */
export function udsPeriodBoxes(alive: boolean, ytdTotal: number): UdsPeriodBox[] {
  return [
    {
      id: "grant",
      label: "Active with UDS",
      detail: "as of Oct 16, 2026",
      total: table1HarmonizedActiveSnapshot.meta.participantCount,
      provenance: "ytd",
    },
    {
      id: "ytd",
      label: "Year to date",
      detail: alive ? `alive · through ${udsThrough}` : `through ${udsThrough}`,
      total: alive ? SPAN.ytd.adrcAlive.total : ytdTotal,
      provenance: alive ? "span" : "ytd",
    },
  ];
}

/**
 * Cumulative: UDS is all-time, and GeneScreen and autopsy are red TBD.
 * Active: only UDS changes. GeneScreen and autopsy stay on year to date.
 */
export function columnForPhase(
  column: RegistryColumn,
  phase: RecruitmentPhase,
  alive = false,
): RegistryColumn {
  if (column.id === "genescreen" || column.id === "brs") {
    if (phase === "cumulative") return applySpan(column, SPAN.cumulative[column.id]);
    return column;
  }
  if (phase === "grant") return activeAdrcColumn(column);
  if (alive) return applySpan(column, SPAN[phase].adrcAlive);
  if (phase === "ytd") return column;
  return applySpan(column, SPAN[phase].adrc);
}

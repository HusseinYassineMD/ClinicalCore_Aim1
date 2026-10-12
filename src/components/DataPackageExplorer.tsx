"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import {
  BreakdownPanelHeader,
  breakdownPanelShell,
  breakdownPanelShellCompact,
  breakdownPanelShellFit,
  type PanelAccent,
} from "@/components/DataPackageCharts";
import { PACKAGE_CHART_COLORS } from "@/lib/dataPackageChartUtils";
import type { BreakdownViewProps } from "@/components/DataPackageCharts";
import { formatCategoryLabel } from "@/lib/dataPackageChartUtils";
import type {
  DataPackageDictionaryEntry,
  DataPackageFileMeta,
  DataPackagePipeline,
  FieldCoverageSummary,
  NumericFieldSummary,
  ReportingPeriodAdditionalDomain,
  ReportingPeriodAdditionalSummary,
  ReportingPeriodDataCoverage,
  ReportingPeriodSummary,
  RpprDataPackage,
  SourceCatalogEntry,
} from "@/types/dataPackage";
import { formatLastUpdated } from "@/lib/formatLastUpdated";

const chartLoadingShell = (
  <div className={breakdownPanelShell}>
    <div className="px-5 py-4 border-b border-cpbh-mist shrink-0">
      <div className="h-5 w-44 rounded bg-cpbh-mist/50 animate-pulse" />
      <div className="mt-2 h-4 w-24 rounded bg-cpbh-mist/30 animate-pulse" />
    </div>
    <div className="flex min-h-[440px] items-center justify-center p-4 text-sm text-cpbh-navy/40">
      Loading chart…
    </div>
  </div>
);

const BreakdownView = dynamic<BreakdownViewProps>(
  () =>
    import("@/components/DataPackageCharts").then((mod) => mod.BreakdownView),
  {
    ssr: false,
    loading: () => chartLoadingShell,
  },
);

type PackageScatterChartProps = {
  title: string;
  data: Record<string, number>;
  xAxisLabel: string;
  accent?: PanelAccent;
  sortBy?: "value" | "label";
  tickFormatter?: (value: number) => string;
};

const PackageScatterChart = dynamic<PackageScatterChartProps>(
  () =>
    import("@/components/DataPackageCharts").then((mod) => mod.PackageScatterChart),
  {
    ssr: false,
    loading: () => chartLoadingShell,
  },
);

function fmtNum(value: number | undefined | null): string | number {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString();
}

/** Above this category count, use a bar chart instead of a scrollable list/table. */
const SCROLL_THRESHOLD = 6;

function normalizePackageData(data: RpprDataPackage): RpprDataPackage {
  const totals = data.totals ?? ({} as RpprDataPackage["totals"]);
  return {
    ...data,
    note: data.note ?? "",
    pipelines: data.pipelines ?? [],
    inventory: data.inventory ?? {
      totalFiles: 0,
      csvFiles: 0,
      htmlReports: 0,
      totalCsvRows: 0,
      totalSizeMb: 0,
      files: [],
    },
    totals: {
      files: totals.files ?? 0,
      csvFiles: totals.csvFiles ?? 0,
      htmlReports: totals.htmlReports ?? 0,
      udsSubjects: totals.udsSubjects ?? 0,
      udsVisitRecords: totals.udsVisitRecords ?? 0,
      milestoneRecords: totals.milestoneRecords ?? 0,
      brsRecords: totals.brsRecords ?? 0,
      apoeRecords: totals.apoeRecords ?? 0,
      biomarkerSubjects: totals.biomarkerSubjects ?? 0,
      biomarkerMeasurements: totals.biomarkerMeasurements ?? 0,
      totalCsvRows: totals.totalCsvRows ?? 0,
    },
  };
}

function asRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, number>;
}

function formatFieldName(field: string): string {
  return field
    .replace(/^der_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function asFieldCoverage(value: unknown): FieldCoverageSummary {
  if (!value || typeof value !== "object") return {};
  return value as FieldCoverageSummary;
}

function FieldPresenceTable({
  title,
  data,
}: {
  title: string;
  data: Record<string, { nonBlank: number; blank: number; uniqueValues?: number; tokenTotal?: number }>;
}) {
  const rows = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  if (rows.length === 0) return null;

  if (rows.length > SCROLL_THRESHOLD) {
    const barData = Object.fromEntries(
      rows.map(([field, stats]) => [formatFieldName(field), stats.nonBlank]),
    );
    return (
      <BreakdownView
        title={`${title} (non-blank counts)`}
        data={barData}
        mode="bar"
        accent="sky"
      />
    );
  }

  return (
    <div className={breakdownPanelShellCompact}>
      <BreakdownPanelHeader title={title} subtitle={`${rows.length} fields`} accent="sky" />
      <div className="rounded-b-xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist">
                Field
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Non-blank
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Blank
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([field, stats], i) => (
              <tr key={field} className={i % 2 === 1 ? "bg-cpbh-mist/30" : ""}>
                <td className="px-4 py-2.5 text-cpbh-navy/85">{formatFieldName(field)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                  {stats.nonBlank.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-cpbh-navy/55">
                  {stats.blank.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-cpbh-navy/55">
                  {stats.uniqueValues != null
                    ? `${stats.uniqueValues.toLocaleString()} unique`
                    : stats.tokenTotal != null
                      ? `${stats.tokenTotal.toLocaleString()} tokens`
                      : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NumericSummaryTable({
  title,
  data,
}: {
  title: string;
  data: Record<string, NumericFieldSummary>;
}) {
  const rows = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  if (rows.length === 0) return null;

  if (rows.length > SCROLL_THRESHOLD) {
    const barData = Object.fromEntries(
      rows.map(([field, stats]) => [formatFieldName(field), stats.count]),
    );
    return (
      <BreakdownView
        title={`${title} (record counts)`}
        data={barData}
        mode="bar"
        accent="teal"
      />
    );
  }

  return (
    <div className={breakdownPanelShellCompact}>
      <BreakdownPanelHeader title={title} subtitle={`${rows.length} numeric fields`} accent="teal" />
      <div className="rounded-b-xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist">
                Field
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Count
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Min
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Mean
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Max
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Sum
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([field, stats], i) => (
              <tr key={field} className={i % 2 === 1 ? "bg-cpbh-mist/30" : ""}>
                <td className="px-4 py-2.5 text-cpbh-navy/85">{formatFieldName(field)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                  {stats.count.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{stats.min ?? "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{stats.mean ?? "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{stats.max ?? "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{stats.sum ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SCATTER_FIELD_ORDER = [
  "birthyr",
  "birthmo",
  "der_age_at_latest_uds_visit_approx",
] as const;

const SCATTER_FIELD_CONFIG: Record<
  (typeof SCATTER_FIELD_ORDER)[number],
  {
    title: string;
    xAxisLabel: string;
    tickFormatter?: (value: number) => string;
  }
> = {
  birthmo: {
    title: "Birth month",
    xAxisLabel: "Month",
    tickFormatter: (value) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months[Math.round(value) - 1] ?? String(value);
    },
  },
  birthyr: {
    title: "Birth year",
    xAxisLabel: "Birth year",
  },
  der_age_at_latest_uds_visit_approx: {
    title: "Age at latest UDS visit",
    xAxisLabel: "Age (years)",
  },
};

function FieldCoveragePanel({
  summary,
  title,
}: {
  summary: Record<string, unknown>;
  title: string;
}) {
  const coverage = asFieldCoverage(summary);
  const breakdownFields = Object.keys(coverage.fieldBreakdowns ?? {}).sort();
  const numericFields = Object.keys(coverage.numericSummaries ?? {});
  const presenceFields = Object.keys(coverage.fieldPresence ?? {});
  const totalFields = breakdownFields.length + numericFields.length + presenceFields.length;

  if (totalFields === 0) return null;

  const scatterFields = SCATTER_FIELD_ORDER.filter((field) =>
    breakdownFields.includes(field),
  );
  const scatterFieldSet = new Set<string>(scatterFields);
  const otherBreakdownFields = breakdownFields.filter((field) => !scatterFieldSet.has(field));

  const items: BreakdownItem[] = otherBreakdownFields.map((field) => ({
    key: field,
    title: formatFieldName(field),
    data: coverage.fieldBreakdowns![field],
    chart: "auto",
  }));

  return (
    <ExpandableSection
      title={title}
      subtitle="Complete coverage — every quantifiable column from the source file"
      badge={`${totalFields} fields`}
    >
      {scatterFields.length > 0 && (
        <div className="mb-6 grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {scatterFields.map((field, index) => {
            const config = SCATTER_FIELD_CONFIG[field];
            return (
              <div
                key={field}
                className="flex h-full min-h-[440px] w-full flex-col"
              >
                <PackageScatterChart
                  title={config.title}
                  data={coverage.fieldBreakdowns![field]}
                  xAxisLabel={config.xAxisLabel}
                  tickFormatter={config.tickFormatter}
                  accent={PANEL_ACCENTS[index % PANEL_ACCENTS.length]}
                />
              </div>
            );
          })}
        </div>
      )}
      <BreakdownGrid items={items} groupByPanelSize />
      {coverage.numericSummaries && (
        <NumericSummaryTable title="Numeric field summaries" data={coverage.numericSummaries} />
      )}
      {coverage.fieldPresence && (
        <FieldPresenceTable title="Date / high-cardinality field presence" data={coverage.fieldPresence} />
      )}
    </ExpandableSection>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-cpbh-navy">{title}</h3>
      {subtitle && <p className="text-sm text-cpbh-navy/55 mt-1">{subtitle}</p>}
    </div>
  );
}

function PipelineHighlight({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      {title && <SectionHeading title={title} subtitle={subtitle} />}
      {children}
    </section>
  );
}

function ExpandableSection({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-xl border border-cpbh-mist bg-cpbh-mist/10 overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-cpbh-mist/25"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-cpbh-navy">{title}</h3>
            {badge && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cpbh-navy/55 border border-cpbh-mist">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-cpbh-navy/55">{subtitle}</p>
          )}
        </div>
        <span
          className={`shrink-0 text-cpbh-navy/40 text-xs transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-cpbh-mist/80 bg-white px-5 py-5">
          {children}
        </div>
      )}
    </section>
  );
}

function MetricGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
      {children}
    </div>
  );
}

type BreakdownItem = {
  key: string;
  title: string;
  data: Record<string, number>;
  chart?: "pie" | "bar" | "table" | "auto";
  sortBy?: "value" | "label";
  fullWidth?: boolean;
  categoryColumnLabel?: string;
};

function sortBreakdownRows(
  rows: [string, number][],
  sortBy: "value" | "label" = "value",
): [string, number][] {
  if (sortBy === "label") {
    return [...rows].sort((a, b) => {
      const na = parseInt(a[0], 10);
      const nb = parseInt(b[0], 10);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a[0].localeCompare(b[0]);
    });
  }
  return [...rows].sort((a, b) => b[1] - a[1]);
}

function categoryCount(data: Record<string, number>): number {
  return Object.entries(data).filter(([, value]) => value > 0).length;
}

function hasLongCategoryLabels(data: Record<string, number>): boolean {
  const labels = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([label]) => formatCategoryLabel(label));

  if (labels.length === 0) return false;
  const avgLength = labels.reduce((sum, label) => sum + label.length, 0) / labels.length;
  return labels.some((label) => label.length > 22) || avgLength > 16;
}

function resolveBreakdownChartMode(item: BreakdownItem): "pie" | "bar" | "table" {
  const count = categoryCount(item.data);
  if (item.chart === "table") return "table";
  if (item.chart === "bar") return "bar";
  if (hasLongCategoryLabels(item.data)) return "table";
  if (item.chart === "pie") {
    return count > SCROLL_THRESHOLD ? "bar" : "pie";
  }
  if (count > SCROLL_THRESHOLD) return "bar";
  return "table";
}

type BreakdownPanelSize = "compact" | "standard";

function estimateBreakdownPanelSize(item: BreakdownItem): BreakdownPanelSize {
  const mode = resolveBreakdownChartMode(item);
  if (mode === "bar" || mode === "pie") return "standard";
  const count = categoryCount(item.data);
  if (count > SCROLL_THRESHOLD || hasLongCategoryLabels(item.data)) {
    return "standard";
  }
  return "compact";
}

function groupBreakdownItemsBySize(items: BreakdownItem[]): {
  compact: BreakdownItem[];
  standard: BreakdownItem[];
} {
  const compact: BreakdownItem[] = [];
  const standard: BreakdownItem[] = [];

  for (const item of items) {
    if (estimateBreakdownPanelSize(item) === "compact") {
      compact.push(item);
    } else {
      standard.push(item);
    }
  }

  return { compact, standard };
}

/** Only items explicitly marked fullWidth span both columns — everything else pairs side by side. */
function shouldSpanFullWidth(item: BreakdownItem): boolean {
  return Boolean(item.fullWidth);
}

const PANEL_ACCENTS: PanelAccent[] = ["purple", "teal", "sky", "navy"];

/** Matches one column in a 2-col grid with gap-6 (1.5rem). */
const GRID_HALF_WIDTH_CLASS = "w-full lg:w-[calc(50%-0.75rem)]";

function renderBreakdownPanel(
  item: BreakdownItem,
  accent: PanelAccent,
) {
  const mode = resolveBreakdownChartMode(item);

  if (mode === "pie" || mode === "bar") {
    return (
      <div className="h-full w-full">
        <BreakdownView
          title={item.title}
          data={item.data}
          mode={mode}
          sortBy={item.sortBy}
          maxItems={999}
          fullWidth={Boolean(item.fullWidth)}
          accent={accent}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <CountBreakdownTable
        title={item.title}
        data={item.data}
        accent={accent}
        sortBy={item.sortBy}
        categoryColumnLabel={item.categoryColumnLabel}
      />
    </div>
  );
}

function BreakdownPanelSlot({
  spanFull,
  isOrphan,
  isSingle,
  sizeTier = "standard",
  children,
}: {
  spanFull: boolean;
  isOrphan?: boolean;
  isSingle?: boolean;
  sizeTier?: BreakdownPanelSize;
  children: ReactNode;
}) {
  const isCompact = sizeTier === "compact";
  if (isSingle) {
    return (
      <div className="flex w-full justify-center">
        <div
          className={`h-full w-full ${
            spanFull ? "max-w-none" : `${GRID_HALF_WIDTH_CLASS} max-w-[540px]`
          }`}
        >
          {children}
        </div>
      </div>
    );
  }

  if (spanFull) {
    return (
      <div className="h-full w-full lg:col-span-2">
        <div className="mx-auto h-full w-full">{children}</div>
      </div>
    );
  }

  if (isOrphan) {
    return (
      <div className="flex h-full w-full justify-center lg:col-span-2">
        <div className={`h-full ${GRID_HALF_WIDTH_CLASS}`}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full flex-col ${
        isCompact ? "h-auto min-h-0" : "h-full min-h-[440px]"
      }`}
    >
      <div className={isCompact ? "w-full" : "h-full w-full flex-1"}>{children}</div>
    </div>
  );
}

function BreakdownGridRows({
  items,
  sizeTier = "standard",
}: {
  items: BreakdownItem[];
  sizeTier?: BreakdownPanelSize;
}) {
  const visible = items.filter((item) => Object.keys(item.data).length > 0);
  if (visible.length === 0) return null;

  const isCompact = sizeTier === "compact";

  if (visible.length === 1) {
    const item = visible[0];
    return (
      <BreakdownPanelSlot
        spanFull={shouldSpanFullWidth(item)}
        isSingle
        sizeTier={sizeTier}
      >
        {renderBreakdownPanel(item, PANEL_ACCENTS[0])}
      </BreakdownPanelSlot>
    );
  }

  const halfWidthItems = visible.filter((item) => !shouldSpanFullWidth(item));
  const orphanKey =
    halfWidthItems.length % 2 === 1
      ? halfWidthItems[halfWidthItems.length - 1]?.key
      : null;

  return (
    <div
      className={`grid w-full grid-cols-1 gap-6 lg:grid-cols-2 ${
        isCompact ? "items-start" : "items-stretch"
      }`}
    >
      {visible.map((item, index) => {
        const spanFull = shouldSpanFullWidth(item);
        const isOrphan = !spanFull && item.key === orphanKey;
        const accent = PANEL_ACCENTS[index % PANEL_ACCENTS.length];

        return (
          <BreakdownPanelSlot
            key={item.key}
            spanFull={spanFull}
            isOrphan={isOrphan}
            sizeTier={sizeTier}
          >
            {renderBreakdownPanel(item, accent)}
          </BreakdownPanelSlot>
        );
      })}
    </div>
  );
}

function BreakdownGrid({
  items,
  groupByPanelSize = false,
}: {
  items: BreakdownItem[];
  groupByPanelSize?: boolean;
}) {
  const visible = items.filter((item) => Object.keys(item.data).length > 0);
  if (visible.length === 0) return null;

  if (!groupByPanelSize) {
    return <BreakdownGridRows items={visible} sizeTier="standard" />;
  }

  const { compact, standard } = groupBreakdownItemsBySize(visible);

  return (
    <div className="space-y-8">
      {compact.length > 0 && (
        <BreakdownGridRows items={compact} sizeTier="compact" />
      )}
      {standard.length > 0 && (
        <BreakdownGridRows items={standard} sizeTier="standard" />
      )}
    </div>
  );
}

function CountBreakdownTable({
  title,
  data,
  accent = "purple",
  sortBy = "value",
  categoryColumnLabel = "Category",
}: {
  title: string;
  data: Record<string, number>;
  accent?: PanelAccent;
  sortBy?: "value" | "label";
  categoryColumnLabel?: string;
}) {
  const rows = sortBreakdownRows(
    Object.entries(data).filter(([, count]) => count > 0),
    sortBy,
  );
  const total = rows.reduce((sum, [, count]) => sum + count, 0);

  if (rows.length === 0) return null;

  const useTableLayout =
    rows.length > SCROLL_THRESHOLD || hasLongCategoryLabels(data);

  if (useTableLayout) {
    return (
      <div className={`${breakdownPanelShellFit} w-full`}>
        <BreakdownPanelHeader
          title={title}
          subtitle={`n = ${total.toLocaleString()}`}
          accent={accent}
        />
        <div className="min-h-0 flex-1 overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-cpbh-mist bg-cpbh-mist/45">
                <th className="px-5 py-3 text-left text-sm font-semibold text-cpbh-navy">
                  {categoryColumnLabel}
                </th>
                <th className="w-28 px-5 py-3 text-right text-sm font-semibold text-cpbh-navy">
                  Count
                </th>
                <th className="w-24 px-5 py-3 text-right text-sm font-semibold text-cpbh-navy">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, count], i) => {
                const displayLabel = formatCategoryLabel(label);
                return (
                  <tr
                    key={label}
                    className={i % 2 === 1 ? "bg-cpbh-mist/25" : "bg-white"}
                  >
                    <td
                      className="px-5 py-3 leading-snug text-cpbh-navy/90"
                      title={label !== displayLabel ? label : undefined}
                    >
                      {displayLabel}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-cpbh-navy">
                      {count.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-cpbh-navy/55">
                      {total > 0 ? `${Math.round((count / total) * 100)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`${breakdownPanelShellFit} w-full`}>
      <BreakdownPanelHeader
        title={title}
        subtitle={`n = ${total.toLocaleString()}`}
        accent={accent}
      />
      <div className="px-4 py-4">
        <ul className="space-y-2">
          {rows.map(([label, count], i) => {
            const displayLabel = formatCategoryLabel(label);
            const share = total > 0 ? (count / total) * 100 : 0;
            const color = PACKAGE_CHART_COLORS[i % PACKAGE_CHART_COLORS.length];

            return (
              <li
                key={label}
                className="flex min-h-[3.25rem] flex-col justify-center rounded-xl border border-cpbh-mist/60 bg-gradient-to-r from-cpbh-mist/20 to-white px-3.5 py-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="truncate text-base font-medium text-cpbh-navy/90"
                      title={label !== displayLabel ? label : displayLabel}
                    >
                      {displayLabel}
                    </span>
                  </div>
                  <div className="flex w-[5rem] shrink-0 flex-col items-end leading-tight">
                    <span className="text-base font-semibold tabular-nums text-cpbh-navy">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-sm tabular-nums text-cpbh-purple/65">
                      {total > 0 ? `${Math.round(share)}%` : "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cpbh-mist/50">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(share, share > 0 ? 2 : 0)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DataDictionaryTable({ entries }: { entries: DataPackageDictionaryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="overflow-x-auto max-h-[420px] rounded-lg border border-cpbh-mist">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist w-[28%]">
                Variable
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.variable} className={i % 2 === 1 ? "table-row-alt" : ""}>
                <td className="table-cell font-mono text-xs font-medium">{entry.variable}</td>
                <td className="table-cell text-cpbh-navy/75">{entry.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

function FileInventoryTable({ files }: { files: DataPackageFileMeta[] }) {
  if (files.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-cpbh-mist">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist">
                File
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Rows
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Columns
              </th>
              <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                Size (MB)
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, i) => (
              <tr key={file.path} className={i % 2 === 1 ? "table-row-alt" : ""}>
                <td className="table-cell">
                  <p className="font-medium text-cpbh-navy">{file.fileName}</p>
                  {file.relativeDir && (
                    <p className="text-xs text-cpbh-navy/45 mt-0.5">{file.relativeDir}</p>
                  )}
                  {file.description && (
                    <p className="text-xs text-cpbh-navy/60 mt-1 max-w-xl">{file.description}</p>
                  )}
                </td>
                <td className="table-cell text-right tabular-nums">
                  {file.rowCount > 0 ? file.rowCount.toLocaleString() : "—"}
                </td>
                <td className="table-cell text-right tabular-nums">
                  {file.columnCount > 0 ? file.columnCount.toLocaleString() : "—"}
                </td>
                <td className="table-cell text-right tabular-nums">{file.fileSizeMb}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

function SourceCatalogByBiomarker({ entries }: { entries: SourceCatalogEntry[] }) {
  if (entries.length === 0) return null;

  const byBiomarker = entries.reduce<Record<string, SourceCatalogEntry[]>>((acc, entry) => {
    const key = entry.biomarker || "Unknown";
    acc[key] = acc[key] ?? [];
    acc[key].push(entry);
    return acc;
  }, {});

  const biomarkers = Object.keys(byBiomarker).sort((a, b) => {
    const totalA = byBiomarker[a].reduce((s, e) => s + e.nMeasurements, 0);
    const totalB = byBiomarker[b].reduce((s, e) => s + e.nMeasurements, 0);
    return totalB - totalA;
  });

  return (
    <div className="space-y-3">
      {biomarkers.map((biomarker) => {
        const rows = byBiomarker[biomarker];
        const atn = rows[0]?.atnvDomain ?? "";
        const totalMeas = rows.reduce((s, e) => s + e.nMeasurements, 0);

        return (
          <ExpandableSection
            key={biomarker}
            title={biomarker}
            subtitle={`${totalMeas.toLocaleString()} measurements · ${rows.length} source${
              rows.length === 1 ? "" : "s"
            }${atn ? ` · ATN ${atn}` : ""}`}
          >
            <div className="overflow-x-auto rounded-lg border border-cpbh-mist">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist">
                      Source
                    </th>
                    <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist">
                      Dataset
                    </th>
                    <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist">
                      Specimen
                    </th>
                    <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                      Measurements
                    </th>
                    <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-right border-b border-cpbh-mist">
                      Subjects
                    </th>
                    <th className="bg-cpbh-mist/60 text-cpbh-navy text-xs font-semibold px-4 py-2.5 text-left border-b border-cpbh-mist">
                      Collection dates
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry, i) => (
                    <tr
                      key={`${entry.sourceFamily}-${entry.sourceDataset}-${i}`}
                      className={i % 2 === 1 ? "table-row-alt" : ""}
                    >
                      <td className="table-cell font-medium">{entry.sourceFamily}</td>
                      <td className="table-cell text-cpbh-navy/75">{entry.sourceDataset}</td>
                      <td className="table-cell">{entry.specimenType}</td>
                      <td className="table-cell text-right tabular-nums font-medium">
                        {entry.nMeasurements.toLocaleString()}
                      </td>
                      <td className="table-cell text-right tabular-nums">
                        {entry.nSubjects.toLocaleString()}
                      </td>
                      <td className="table-cell text-cpbh-navy/60 whitespace-nowrap text-xs">
                        {entry.firstCollectionDate || "—"}
                        {entry.latestCollectionDate ? ` → ${entry.latestCollectionDate}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ExpandableSection>
        );
      })}
    </div>
  );
}

type PeriodMetricRow = {
  label: string;
  value: number;
};

function PeriodMetricsTable({
  metrics,
  footnote,
}: {
  metrics: PeriodMetricRow[];
  footnote?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-cpbh-mist bg-white">
      <table className="w-full text-sm min-w-[360px]">
        <thead>
          <tr className="border-b border-cpbh-mist bg-cpbh-mist/35 text-left">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cpbh-navy/55">
              Metric
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cpbh-navy/55 w-32 text-right">
              Count
            </th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, index) => (
              <tr
                key={metric.label}
                className={index % 2 === 1 ? "bg-cpbh-mist/15" : "bg-white"}
              >
                <td className="px-4 py-3.5 text-cpbh-navy leading-snug">{metric.label}</td>
                <td className="px-4 py-3.5 text-right font-display text-2xl font-semibold tabular-nums text-cpbh-navy">
                  {metric.value.toLocaleString()}
                </td>
              </tr>
          ))}
        </tbody>
      </table>
      {footnote && (
        <p className="border-t border-cpbh-mist bg-cpbh-mist/20 px-4 py-3 text-xs leading-relaxed text-cpbh-navy/60">
          {footnote}
        </p>
      )}
    </div>
  );
}

function ReportingPeriodDomain({
  title,
  sourceFile,
  dateHint,
  metrics,
  footnote,
}: {
  title: string;
  sourceFile: string;
  dateHint: string;
  metrics: PeriodMetricRow[];
  footnote?: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">{title}</h3>
        <p className="mt-1 text-sm text-cpbh-navy/60">
          <span className="font-medium text-cpbh-navy/75">Source:</span>{" "}
          <code className="rounded bg-cpbh-mist/60 px-1.5 py-0.5 text-xs">{sourceFile}</code>
          <span className="mx-2 text-cpbh-navy/30">·</span>
          {dateHint}
        </p>
      </div>
      <PeriodMetricsTable metrics={metrics} footnote={footnote} />
    </div>
  );
}

function AdditionalPeriodMetricsTable({
  domain,
}: {
  domain: ReportingPeriodAdditionalDomain;
}) {
  if (domain.metrics.length === 0) {
    return (
      <div className="rounded-xl border border-cpbh-mist bg-cpbh-mist/15 px-4 py-4">
        <p className="text-sm text-cpbh-navy/65">{domain.footnote}</p>
      </div>
    );
  }

  const showParticipants = domain.metrics.some((metric) => metric.participants != null);

  return (
    <div className="overflow-x-auto rounded-xl border border-cpbh-mist bg-white">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-cpbh-mist bg-cpbh-mist/35 text-left">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cpbh-navy/55">
              Metric
            </th>
            <th className="w-36 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-cpbh-navy/55">
              Rows in period
            </th>
            {showParticipants && (
              <th className="w-40 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-cpbh-navy/55">
                Unique participants
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {domain.metrics.map((metric, index) => (
            <tr
              key={metric.label}
              className={index % 2 === 1 ? "bg-cpbh-mist/15" : "bg-white"}
            >
              <td className="px-4 py-3.5 leading-snug text-cpbh-navy">{metric.label}</td>
              <td className="px-4 py-3.5 text-right font-display text-2xl font-semibold tabular-nums text-cpbh-navy">
                {metric.value.toLocaleString()}
              </td>
              {showParticipants && (
                <td className="px-4 py-3.5 text-right tabular-nums text-cpbh-navy/70">
                  {metric.participants != null ? metric.participants.toLocaleString() : "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {domain.footnote && (
        <p className="border-t border-cpbh-mist bg-cpbh-mist/20 px-4 py-3 text-xs leading-relaxed text-cpbh-navy/60">
          {domain.footnote}
        </p>
      )}
    </div>
  );
}

function ReportingPeriodAdditionalSection({
  summary,
}: {
  summary: ReportingPeriodAdditionalSummary;
}) {
  return (
    <section className="dashboard-card space-y-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-cpbh-purple text-sm font-medium uppercase tracking-wide">
          Additional dated activity
        </p>
        <h2 className="font-display text-2xl font-semibold text-cpbh-navy">
          Other year-to-date counts from package CSVs
        </h2>
        <p className="text-sm leading-relaxed text-cpbh-navy/65">{summary.note}</p>
        <p className="text-xs text-cpbh-navy/45">
          Period {summary.label} ({summary.startDate} through {summary.endDate})
        </p>
      </div>

      {summary.domains.map((domain) => (
        <div key={domain.id} className="space-y-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-cpbh-navy">
              {domain.title}
            </h3>
            <p className="mt-1 text-sm text-cpbh-navy/60">
              <span className="font-medium text-cpbh-navy/75">Source:</span>{" "}
              <code className="rounded bg-cpbh-mist/60 px-1.5 py-0.5 text-xs">
                {domain.sourceFile}
              </code>
              <span className="mx-2 text-cpbh-navy/30">·</span>
              {domain.dateHint}
            </p>
          </div>
          <AdditionalPeriodMetricsTable domain={domain} />
        </div>
      ))}
    </section>
  );
}

function DataCoverageCallout({
  coverage,
  filterEndDate,
}: {
  coverage: ReportingPeriodDataCoverage;
  filterEndDate: string;
}) {
  const lines = [
    coverage.packageReceivedAt && `Package received ${coverage.packageReceivedAt}`,
    coverage.udsLatestVisitDate && `Latest UDS visit_date in file: ${coverage.udsLatestVisitDate}`,
    coverage.biomarkerLatestCollectionDate &&
      `Latest biomarker collection_date in file: ${coverage.biomarkerLatestCollectionDate}`,
    coverage.brsLatestActivityDate &&
      `Latest BRS consent/autopsy/death date in file: ${coverage.brsLatestActivityDate}`,
    coverage.milestonesLatestVisitDate &&
      `Latest Milestones visit_date in file: ${coverage.milestonesLatestVisitDate}`,
  ].filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium mb-1">Data freshness (Sep 16 export snapshot)</p>
      <ul className="list-disc list-inside space-y-0.5 text-xs leading-relaxed text-amber-900/90">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-900/80">
        Filter window ends {filterEndDate}, but latest row dates in the CSVs may be earlier. Compare
        to CC only with matching dates and cohort rules.
      </p>
    </div>
  );
}

function ReportingPeriodSummarySection({ summary }: { summary: ReportingPeriodSummary }) {
  const uds = summary.udsClinical;
  const bio = summary.biomarkers;
  const brs = summary.brsAutopsy;
  const imaging = summary.imaging;

  return (
    <section className="dashboard-card space-y-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-cpbh-purple text-sm font-medium uppercase tracking-wide">
          Year to date (package row dates)
        </p>
        <h2 className="font-display text-2xl font-semibold text-cpbh-navy">
          {summary.label} · harmonized package CSVs
        </h2>
        <p className="text-sm leading-relaxed text-cpbh-navy/65">{summary.note}</p>
        <p className="text-xs text-cpbh-navy/45">
          Filter window: {summary.startDate} through {summary.endDate} · aligned with site
          header
        </p>
      </div>

      {summary.dataCoverage && (
        <DataCoverageCallout coverage={summary.dataCoverage} filterEndDate={summary.endDate} />
      )}

      <ReportingPeriodDomain
        title="UDS clinical visits"
        sourceFile={uds.sourceFile}
        dateHint={`Date fields: ${uds.dateFields.join(", ")}`}
        metrics={[
          {
            label: "New initial evaluations (packet = I)",
            value: uds.newInitialEvaluations,
          },
          {
            label: "In-person follow-ups (modea1 = 1)",
            value: uds.followUpInPerson,
          },
          {
            label: "Remote follow-ups (modea1 = 2 or 3)",
            value: uds.followUpRemote,
          },
          {
            label: "Unique participants with a visit row in period",
            value: uds.uniqueParticipantsWithVisit,
          },
        ]}
        footnote={`${uds.totalVisitRecords.toLocaleString()} visit rows in window (${uds.newInitialEvaluations + uds.followUpInPerson + uds.followUpRemote} = initial + in-person + remote). Harmonized UDS visit_date rules — same counts shown on the Metrics dashboard for year to date.`}
      />

      <ReportingPeriodDomain
        title="Biomarker collections"
        sourceFile={bio.sourceFile}
        dateHint={`Filtered on ${bio.dateField}`}
        metrics={[
          {
            label: "Subjects with any specimen collection",
            value: bio.subjectsWithCollection,
          },
          {
            label: "Subjects with plasma collection",
            value: bio.subjectsWithPlasmaCollection,
          },
          {
            label: "Plasma measurement rows",
            value: bio.plasmaMeasurementRows,
          },
          {
            label: "CSF measurement rows",
            value: bio.csfMeasurementRows,
          },
        ]}
        footnote="Subject counts use unique uds_id. Measurement rows may include multiple draws per subject."
      />

      <ReportingPeriodDomain
        title="BRS autopsy (REDCap)"
        sourceFile={brs.sourceFile}
        dateHint="Consent and autopsy dates from BRS cohort export (951 rows — not RPPR 231 enrollment total)"
        metrics={[
          {
            label: "New autopsy consents in period",
            value: brs.newAutopsyConsents,
          },
          {
            label: "Autopsies performed in period",
            value: brs.autopsiesPerformed,
          },
        ]}
      />

      {imaging && (
        <>
          <ReportingPeriodDomain
            title={`Imaging · ${imaging.scanStudy.studyLabel} study`}
            sourceFile={imaging.sourceFiles.longitudinal}
            dateHint={`Study membership from ${imaging.sourceFiles.studySubjectLevel} · filtered on ${imaging.dateField}`}
            metrics={[
              {
                label: "Participants with MRI-family imaging",
                value: imaging.scanStudy.participantsWithMri,
              },
              {
                label: "Participants with Amyloid PET",
                value: imaging.scanStudy.participantsWithAmyloidPet,
              },
              {
                label: "Participants with Tau PET",
                value: imaging.scanStudy.participantsWithTauPet,
              },
            ]}
            footnote={imaging.note}
          />
          <ReportingPeriodDomain
            title={`Imaging · ${imaging.claritiStudy.studyLabel} study`}
            sourceFile={imaging.sourceFiles.longitudinal}
            dateHint={`Same longitudinal file · CLARiTI study-specific subjects`}
            metrics={[
              {
                label: "Participants with MRI-family imaging",
                value: imaging.claritiStudy.participantsWithMri,
              },
              {
                label: "Participants with Amyloid PET",
                value: imaging.claritiStudy.participantsWithAmyloidPet,
              },
              {
                label: "Participants with Tau PET",
                value: imaging.claritiStudy.participantsWithTauPet,
              },
            ]}
          />
        </>
      )}
    </section>
  );
}

function UdsPipelineDetail({ summary }: { summary: Record<string, unknown> }) {
  const subjects = summary.subjects as Record<string, unknown> | undefined;
  const longitudinal = summary.longitudinal as Record<string, unknown> | undefined;
  const milestones = summary.milestones as Record<string, unknown> | undefined;

  if (!subjects) return null;

  return (
    <div className="space-y-6">
      <PipelineHighlight
        title="At a glance"
        subtitle="Current subject cohort — enrollment and cognitive profile"
      >
        <MetricGrid>
          <MetricCard label="Subjects" value={fmtNum(subjects.totalSubjects as number)} accent="purple" />
          <MetricCard label="Presumed active" value={fmtNum(subjects.presumedActive as number)} accent="teal" />
          <MetricCard label="Discontinued" value={fmtNum(subjects.discontinued as number)} accent="navy" />
          <MetricCard label="Autopsy consent" value={fmtNum(subjects.withAutopsyConsent as number)} accent="sky" />
        </MetricGrid>
        <BreakdownGrid
          items={[
            { key: "adrc", title: "ADRC enrollment status", data: asRecord(subjects.byAdrcStatus) },
            { key: "cog", title: "Cognitive diagnosis", data: asRecord(subjects.byCognitiveDx), chart: "pie" },
          ]}
        />
      </PipelineHighlight>

      <ExpandableSection
        title="Demographics & clinical detail"
        subtitle="Race/ethnicity, CDR, AD status, language, and related breakdowns"
        badge="Full detail"
      >
        {typeof subjects.raceEthnicityNote === "string" && (
          <p className="text-sm text-cpbh-navy/65 mb-4 max-w-3xl">{subjects.raceEthnicityNote}</p>
        )}
        <BreakdownGrid
          items={[
            {
              key: "race-broad",
              title: "Race / ethnicity (broad groups)",
              data: asRecord(subjects.byRaceEthnicityBroad),
              chart: "pie",
              fullWidth: true,
            },
            {
              key: "hispanic-flag",
              title: "Hispanic / Latino flag",
              data: asRecord(subjects.byHispanicLatinoFlag),
              chart: "pie",
            },
            {
              key: "race",
              title: "Race / ethnicity (full harmonized labels)",
              data: asRecord(subjects.byRaceEthnicity),
              chart: "table",
              fullWidth: true,
            },
            { key: "autopsy", title: "Autopsy consent status", data: asRecord(subjects.byAutopsyConsent) },
            { key: "cdr", title: "CDR global", data: asRecord(subjects.byCdrGlobal), chart: "pie" },
            { key: "ad", title: "Alzheimer's disease status", data: asRecord(subjects.byAdStatus) },
            { key: "lang", title: "Primary language", data: asRecord(subjects.byPrimaryLanguage) },
            { key: "gen", title: "Latest UDS generation", data: asRecord(subjects.byLatestUdsGeneration) },
            { key: "mrec", title: "Milestone records per subject", data: asRecord(subjects.byMilestoneRecordCount), sortBy: "label" },
          ]}
        />
        <MetricGrid>
          <MetricCard label="Deceased" value={fmtNum(subjects.deceased as number)} accent="navy" />
          <MetricCard label="Presumed active flag" value={fmtNum(subjects.presumedActiveFlag as number)} accent="teal" />
          <MetricCard label="Avg UDS visits" value={fmtNum(subjects.avgUdsVisits as number)} accent="purple" />
          <MetricCard label="Total UDS visits" value={fmtNum(subjects.totalUdsVisits as number)} accent="purple" />
        </MetricGrid>
      </ExpandableSection>

      {longitudinal && (
        <ExpandableSection
          title="Longitudinal UDS visits"
          subtitle={`${fmtNum(longitudinal.totalVisitRecords as number)} visit records across ${fmtNum(longitudinal.uniqueParticipants as number)} participants`}
        >
          <BreakdownGrid
            items={[
              {
                key: "visits",
                title: "Visits by visit number",
                data: asRecord(longitudinal.byVisitNumber),
                chart: "table",
                sortBy: "label",
                fullWidth: true,
                categoryColumnLabel: "Visit number",
              },
              { key: "packet", title: "Visits by packet", data: asRecord(longitudinal.byPacket) },
              { key: "source", title: "Visits by source generation", data: asRecord(longitudinal.bySourceGeneration) },
            ]}
          />
        </ExpandableSection>
      )}

      {milestones && (
        <ExpandableSection
          title="Milestones history"
          subtitle={`${fmtNum(milestones.totalRecords as number)} records · ${fmtNum(milestones.uniqueParticipants as number)} participants`}
        >
          <BreakdownGrid
            items={[
              { key: "events", title: "Milestone events", data: asRecord(milestones.byMilestoneEvent) },
              { key: "deceased", title: "Deceased flag", data: asRecord(milestones.deceasedFlag) },
              { key: "autopsy", title: "Autopsy flag", data: asRecord(milestones.autopsyFlag) },
              { key: "protocol", title: "Protocol label", data: asRecord(milestones.byProtocolLabel) },
              { key: "aconsent", title: "Autopsy consent label", data: asRecord(milestones.byAutopsyConsentLabel) },
            ]}
          />
        </ExpandableSection>
      )}

      <FieldCoveragePanel summary={subjects} title="UDS subjects — complete field coverage" />
      {longitudinal && (
        <FieldCoveragePanel summary={longitudinal} title="Longitudinal visits — complete field coverage" />
      )}
      {milestones && (
        <FieldCoveragePanel summary={milestones} title="Milestones — complete field coverage" />
      )}
    </div>
  );
}

function BiomarkerPipelineDetail({ summary }: { summary: Record<string, unknown> }) {
  const subjects = summary.subjects as Record<string, unknown> | undefined;
  const availability = summary.availability as Record<string, unknown> | undefined;
  const longFormat = summary.longFormat as Record<string, unknown> | undefined;
  const sourceCatalog = summary.sourceCatalog as Record<string, unknown> | undefined;
  const dataDictionary = summary.dataDictionary as DataPackageDictionaryEntry[] | undefined;

  if (!subjects) return null;

  return (
    <div className="space-y-6">
      <PipelineHighlight
        title="At a glance"
        subtitle="Subject coverage and specimen availability"
      >
        <MetricGrid>
          <MetricCard label="Subjects" value={fmtNum(subjects.totalSubjects as number)} accent="teal" />
          <MetricCard label="Plasma" value={fmtNum(subjects.hasPlasma as number)} accent="teal" />
          <MetricCard label="CSF" value={fmtNum(subjects.hasCsf as number)} accent="sky" />
          <MetricCard label="ATN complete" value={fmtNum(subjects.atnComplete as number)} accent="purple" />
        </MetricGrid>
        <BreakdownGrid
          items={[
            ...(availability
              ? [
                  {
                    key: "spec",
                    title: "Specimen type",
                    data: asRecord(availability.bySpecimenType),
                    chart: "pie" as const,
                  },
                  { key: "bio", title: "Top biomarkers", data: asRecord(availability.topBiomarkers) },
                ]
              : []),
            {
              key: "btokens",
              title: "Biomarkers available (subject tokens)",
              data: asRecord(subjects.byBiomarkersAvailable),
            },
            {
              key: "bsfam",
              title: "Source families (subject tokens)",
              data: asRecord(subjects.bySourceFamilies),
            },
          ]}
        />
      </PipelineHighlight>

      <ExpandableSection
        title="Coverage & availability detail"
        subtitle="ATN flags, source families, and full biomarker availability"
        badge="Full detail"
      >
        <MetricGrid>
          <MetricCard label="Any biomarker" value={fmtNum(subjects.hasAnyBiomarker as number)} accent="teal" />
          <MetricCard label="NCRAD" value={fmtNum(subjects.hasNcrad as number)} accent="sky" />
          <MetricCard label="C2N" value={fmtNum(subjects.hasC2n as number)} accent="navy" />
          <MetricCard label="VCS REDCap" value={fmtNum(subjects.hasVcsRedcap as number)} accent="sky" />
          <MetricCard label="Legacy CSF" value={fmtNum(subjects.hasLegacyCsf as number)} accent="navy" />
          <MetricCard label="A / T / N / V" value={`${fmtNum(subjects.hasA as number)} / ${fmtNum(subjects.hasT as number)} / ${fmtNum(subjects.hasN as number)} / ${fmtNum(subjects.hasV as number)}`} accent="purple" />
        </MetricGrid>
        {availability && (
          <>
            <MetricGrid>
              <MetricCard label="Matrix rows" value={fmtNum(availability.totalRows as number)} accent="teal" />
              <MetricCard label="Unique subjects" value={fmtNum(availability.uniqueSubjects as number)} accent="teal" />
              <MetricCard label="With measurement" value={fmtNum(availability.withMeasurement as number)} accent="sky" />
            </MetricGrid>
            <BreakdownGrid
              items={[
                { key: "src", title: "Source family", data: asRecord(availability.bySourceFamily) },
                { key: "dataset", title: "Source dataset", data: asRecord(availability.bySourceDataset) },
                { key: "atn", title: "ATN domain", data: asRecord(availability.byAtnvDomain) },
                { key: "qc", title: "QC review flag", data: asRecord(availability.byAnyQcReview) },
                { key: "unit", title: "Biomarker unit", data: asRecord(availability.byBiomarkerUnit) },
                { key: "bio-all", title: "All biomarkers (availability)", data: asRecord(availability.byBiomarker), fullWidth: true },
              ]}
            />
          </>
        )}
      </ExpandableSection>

      {longFormat && (
        <ExpandableSection
          title="Long-format measurements"
          subtitle={`${fmtNum(longFormat.totalMeasurements as number)} measurements · ${fmtNum(longFormat.uniqueSubjects as number)} subjects`}
        >
          <BreakdownGrid
            items={[
              { key: "lspec", title: "Specimen type", data: asRecord(longFormat.bySpecimenType), chart: "pie" },
              { key: "lsrc", title: "Source family", data: asRecord(longFormat.bySourceFamily) },
              { key: "ldataset", title: "Source dataset", data: asRecord(longFormat.bySourceDataset) },
              { key: "latn", title: "ATN domain", data: asRecord(longFormat.byAtnvDomain) },
              { key: "lassay", title: "Assay method", data: asRecord(longFormat.byAssayMethod) },
              { key: "lplatform", title: "Assay platform", data: asRecord(longFormat.byAssayPlatform) },
              { key: "lqc", title: "QC status", data: asRecord(longFormat.byQcStatus) },
              { key: "lbio", title: "Biomarkers (measurement counts)", data: asRecord(longFormat.byBiomarker), fullWidth: true },
            ]}
          />
        </ExpandableSection>
      )}

      {sourceCatalog && (
        <ExpandableSection
          title="Source catalog"
          subtitle="Integrated source datasets by biomarker"
          badge={`${fmtNum(sourceCatalog.totalSourceRows as number)} sources`}
        >
          <MetricGrid>
            <MetricCard label="Measurements cataloged" value={fmtNum(sourceCatalog.totalMeasurementsCataloged as number)} accent="sky" />
            <MetricCard label="Subject slots" value={fmtNum(sourceCatalog.totalSubjectSlots as number)} accent="purple" />
          </MetricGrid>
          <BreakdownGrid
            items={[
              { key: "csrc", title: "By source family", data: asRecord(sourceCatalog.bySourceFamily) },
              { key: "cspec", title: "By specimen type", data: asRecord(sourceCatalog.bySpecimenType) },
              { key: "catn", title: "By ATN domain", data: asRecord(sourceCatalog.byAtnvDomain) },
            ]}
          />
          {Array.isArray(sourceCatalog.entries) && (
            <SourceCatalogByBiomarker entries={sourceCatalog.entries as SourceCatalogEntry[]} />
          )}
        </ExpandableSection>
      )}

      {dataDictionary && (
        <ExpandableSection
          title="Data dictionary"
          subtitle={`${dataDictionary.length} field definitions`}
        >
          <DataDictionaryTable entries={dataDictionary} />
        </ExpandableSection>
      )}

      <FieldCoveragePanel summary={subjects} title="Biomarker subjects — complete field coverage" />
      {availability && (
        <FieldCoveragePanel summary={availability} title="Availability matrix — complete field coverage" />
      )}
      {longFormat && (
        <FieldCoveragePanel summary={longFormat} title="Long-format measurements — complete field coverage" />
      )}
      {sourceCatalog && (
        <FieldCoveragePanel summary={sourceCatalog} title="Source catalog — complete field coverage" />
      )}
    </div>
  );
}

function MapRedcapPipelineDetail({ summary }: { summary: Record<string, unknown> }) {
  const brs = summary.brsCohort as Record<string, unknown> | undefined;
  const apoe = summary.apoeGenotype as Record<string, unknown> | undefined;

  if (!brs && !apoe) return null;

  return (
    <div className="space-y-6">
      {brs && (
        <PipelineHighlight
          title="BRS cohort"
          subtitle="MAP REDCap enrollment and autopsy linkage (951-row export — not RPPR 231 enrollment total)"
        >
          {typeof brs.raceEthnicityNote === "string" && (
            <p className="text-sm text-cpbh-navy/65 max-w-3xl">{brs.raceEthnicityNote}</p>
          )}
          <MetricGrid>
            <MetricCard label="BRS records" value={fmtNum(brs.totalRecords as number)} accent="sky" />
            <MetricCard label="Active enrolled" value={fmtNum(brs.activeEnrolled as number)} accent="teal" />
            <MetricCard label="Autopsy consent" value={fmtNum(brs.withAutopsyConsent as number)} accent="purple" />
            <MetricCard label="Autopsies performed" value={fmtNum(brs.autopsiesPerformed as number)} accent="purple" />
          </MetricGrid>
          <p className="text-sm text-cpbh-navy/55">
            Year-to-date consent and autopsy counts are in the year-to-date section above.
          </p>
          <BreakdownGrid
            items={[
              { key: "status", title: "BRS enrollment status", data: asRecord(brs.byStatus), chart: "pie" },
              { key: "gender", title: "Gender", data: asRecord(brs.byGender), chart: "pie" },
            ]}
          />
          <ExpandableSection title="Additional BRS breakdowns" subtitle="Diagnosis, eye donation, and ethnicity">
            <MetricGrid>
              <MetricCard label="Deceased" value={fmtNum(brs.deceased as number)} accent="navy" />
              <MetricCard label="Terminated" value={fmtNum(brs.terminated as number)} accent="navy" />
              <MetricCard label="Hispanic" value={fmtNum(brs.hispanic as number)} accent="teal" />
              <MetricCard label="Non-Hispanic" value={fmtNum(brs.nonHispanic as number)} accent="teal" />
            </MetricGrid>
            <BreakdownGrid
              items={[
                { key: "eye", title: "Eye donation", data: asRecord(brs.byEyeDonation) },
                {
                  key: "consent-dx",
                  title: "Autopsy consent diagnosis",
                  data: asRecord(brs.byAutopsyConsentDiagnosis),
                },
                {
                  key: "final-dx",
                  title: "Autopsy final diagnosis",
                  data: asRecord(brs.byAutopsyFinalDiagnosis),
                  fullWidth: true,
                },
              ]}
            />
          </ExpandableSection>
          <FieldCoveragePanel summary={brs} title="BRS cohort — complete field coverage" />
        </PipelineHighlight>
      )}

      {apoe && (
        <PipelineHighlight title="APOE genotype" subtitle="Genotype distribution and source attribution">
          <MetricGrid>
            <MetricCard label="APOE records" value={fmtNum(apoe.totalRecords as number)} accent="purple" />
            <MetricCard label="ε4 carriers" value={fmtNum(apoe.e4Carrier as number)} accent="purple" />
          </MetricGrid>
          <BreakdownGrid
            items={[
              { key: "geno", title: "APOE genotype", data: asRecord(apoe.byGenotype), chart: "pie" },
              { key: "src", title: "APOE by source", data: asRecord(apoe.bySource) },
              { key: "consistent", title: "Consistency flag", data: asRecord(apoe.byConsistent) },
            ]}
          />
          <ExpandableSection
            title="APOE source attribution detail"
            subtitle="Genotype calls by contributing source system"
          >
            <BreakdownGrid
              items={[
                { key: "nacc", title: "NACC", data: asRecord(apoe.byApoeNacc) },
                { key: "vcs", title: "VCS", data: asRecord(apoe.byApoeVcs) },
                { key: "hmri", title: "hMRI", data: asRecord(apoe.byApoeHmri) },
                { key: "c2n", title: "C2N", data: asRecord(apoe.byApoeC2n) },
                { key: "markvcid", title: "MarkVCID", data: asRecord(apoe.byApoeMarkvcid) },
                { key: "dvr", title: "DVR", data: asRecord(apoe.byApoeDvr) },
                { key: "genescreen", title: "GeneScreen", data: asRecord(apoe.byApoeGenescreen) },
                { key: "nplog", title: "NP log", data: asRecord(apoe.byApoeNpLog) },
              ]}
            />
          </ExpandableSection>
          <FieldCoveragePanel summary={apoe} title="APOE genotype — complete field coverage" />
        </PipelineHighlight>
      )}
    </div>
  );
}

function ImagingPendingDetail({ summary }: { summary: Record<string, unknown> }) {
  const expected = summary.expectedOutputs as string[] | undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-cpbh-mist bg-cpbh-mist/20 p-6">
        <p className="text-sm text-cpbh-navy/65">{summary.note as string}</p>
        {expected && expected.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-cpbh-navy/60 list-disc list-inside">
            {expected.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PipelineDetail({ pipeline }: { pipeline: DataPackagePipeline }) {
  switch (pipeline.id) {
    case "uds-harmonization":
      return <UdsPipelineDetail summary={pipeline.summary} />;
    case "integrated-biomarkers":
      return <BiomarkerPipelineDetail summary={pipeline.summary} />;
    case "map-redcap":
      return <MapRedcapPipelineDetail summary={pipeline.summary} />;
    case "integrated-imaging":
      return <ImagingPendingDetail summary={pipeline.summary} />;
    default:
      return null;
  }
}

function PipelineCard({ pipeline }: { pipeline: DataPackagePipeline }) {
  const isPending = pipeline.status === "pending";

  return (
    <section className="dashboard-card space-y-6 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-xl font-semibold text-cpbh-navy">
              {pipeline.title}
            </h2>
            <span
              className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full ${
                isPending
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isPending ? "Pending" : "Available"}
            </span>
          </div>
          <p className="text-sm text-cpbh-navy/65 max-w-3xl">{pipeline.description}</p>
        </div>
        {pipeline.reportPath && (
          <Link
            href={pipeline.reportPath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-cpbh-sky hover:text-cpbh-navy border border-cpbh-sky/30 rounded-lg px-3 py-2 bg-cpbh-sky/5 shrink-0"
          >
            Open report →
          </Link>
        )}
      </div>

      <PipelineDetail pipeline={pipeline} />
    </section>
  );
}

export default function DataPackageExplorer({ data }: { data: RpprDataPackage }) {
  const pkg = normalizePackageData(data);

  return (
    <div className="space-y-6">
      <section className="dashboard-card space-y-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-cpbh-navy">Package overview</h2>
          <p className="text-sm text-cpbh-navy/65 mt-1 max-w-3xl">{pkg.note}</p>
          <p className="text-xs text-cpbh-navy/45 mt-2">
            Received {pkg.receivedAt} · aggregated {formatLastUpdated(pkg.lastAggregated)}
            {" · "}
            {pkg.totals.files} files · {fmtNum(pkg.totals.totalCsvRows)} CSV rows
          </p>
        </div>

        <MetricGrid>
          <MetricCard label="UDS subjects" value={fmtNum(pkg.totals.udsSubjects)} accent="purple" />
          <MetricCard label="UDS visits" value={fmtNum(pkg.totals.udsVisitRecords)} accent="teal" />
          <MetricCard label="Biomarker subjects" value={fmtNum(pkg.totals.biomarkerSubjects)} accent="teal" />
          <MetricCard label="Measurements" value={fmtNum(pkg.totals.biomarkerMeasurements)} accent="navy" />
          <MetricCard label="BRS cohort" value={fmtNum(pkg.totals.brsRecords)} accent="sky" />
          <MetricCard label="APOE records" value={fmtNum(pkg.totals.apoeRecords)} accent="sky" />
          <MetricCard label="Milestone records" value={fmtNum(pkg.totals.milestoneRecords)} accent="teal" />
          <MetricCard label="CSV files" value={fmtNum(pkg.totals.csvFiles)} accent="navy" />
        </MetricGrid>
      </section>

      {pkg.reportingPeriodSummary && (
        <ReportingPeriodSummarySection summary={pkg.reportingPeriodSummary} />
      )}

      {pkg.reportingPeriodAdditional && (
        <ReportingPeriodAdditionalSection summary={pkg.reportingPeriodAdditional} />
      )}

      {pkg.pipelines.map((pipeline) => (
        <PipelineCard key={pipeline.id} pipeline={pipeline} />
      ))}

      {pkg.inventory.files.length > 0 && (
        <section className="dashboard-card">
          <ExpandableSection
            title="File inventory"
            subtitle="All deliverable files in the Sep 16 data package"
            badge={`${pkg.inventory.files.length} files`}
          >
            <FileInventoryTable files={pkg.inventory.files} />
          </ExpandableSection>
        </section>
      )}

      <div className="text-center pb-4">
        <Link href="/" className="text-sm font-medium text-cpbh-sky hover:text-cpbh-navy">
          ← Back to Metrics dashboard
        </Link>
      </div>
    </div>
  );
}

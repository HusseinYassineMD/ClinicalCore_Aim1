"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import type {
  RegistryColumn,
  RegistryChartSlot,
  TopRegistryOverview,
  DataProvenance,
} from "@/types/aim1";
import {
  chartBarFill,
  chartPieFill,
  chartCountDisplay,
  chartHeadlineCount,
  metricValueClass,
} from "@/lib/metricValueClass";
import { PIE_START_AT_TWELVE, sortPieSlicesAscending } from "@/lib/pieChartConfig";
import TargetProgressLabel from "@/components/TargetProgressLabel";
import {
  BRS_TBD_APOE,
  BRS_TBD_ETHNICITY,
  BRS_TBD_SEX,
  GENESCREEN_YTD_LEGACY_ETHNICITY,
  LEGACY_RED_CHART_CAPTION,
} from "@/data/recruitmentChartConstants";

type ChartCountItem = {
  label: string;
  count: number;
  provenance?: DataProvenance;
};

function segmentColor(
  item: ChartCountItem,
  index: number,
  slotProvenance: DataProvenance = "ytd",
): string {
  const prov = item.provenance ?? slotProvenance;
  if (prov === "unknown") return chartBarFill("unknown", index);
  return PIE_SLICE_FILLS[index % PIE_SLICE_FILLS.length];
}

/** Pie slice hues — distinct from green/black/red count labels so every label stays readable. */
const PIE_SLICE_FILLS = [
  "#5c4d9a",
  "#3b82c4",
  "#0d9488",
  "#6366f1",
  "#78716c",
] as const;

function pieSegmentFill(
  item: ChartCountItem,
  index: number,
  slotProvenance: DataProvenance,
): string {
  const prov = item.provenance ?? slotProvenance;
  if (prov === "unknown") return chartPieFill("unknown", index);
  return PIE_SLICE_FILLS[index % PIE_SLICE_FILLS.length];
}

function stampChartProvenance(
  items: { label: string; count: number; provenance?: DataProvenance }[],
  provenance: DataProvenance,
): ChartCountItem[] {
  return items.map((row) => ({
    label: row.label,
    count: row.count,
    provenance: row.provenance ?? provenance,
  }));
}

const CHART_PLOT_CLASS = "registry-chart-plot w-full shrink-0";

interface TopRegistryOverviewProps {
  data: TopRegistryOverview;
}

const BAR_CHART_HEIGHT = 132;
const BAR_ROW_HEIGHT = 26;
const PIE_RING_HEIGHT = 108;
const REGISTRY_PIE_INNER = 24;
const REGISTRY_PIE_OUTER = 42;

function shortAxisLabel(text: string, max = 18): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function preferHorizontalBars(items: { name: string }[]): boolean {
  if (items.length > 3) return true;
  return items.some((d) => d.name.length > 12);
}

function barPlotHeight(itemCount: number, horizontal: boolean): number {
  if (!horizontal) return BAR_CHART_HEIGHT;
  return Math.min(220, Math.max(BAR_CHART_HEIGHT, itemCount * BAR_ROW_HEIGHT + 28));
}

function BreakdownCountList({
  data,
  chartProvenance,
  colorAt,
  compact = false,
}: {
  data: ChartCountItem[];
  chartProvenance: DataProvenance;
  colorAt: (item: ChartCountItem, index: number) => string;
  compact?: boolean;
}) {
  return (
    <ul
      className={
        compact
          ? "flex flex-col justify-center gap-1.5 py-0.5 pl-1"
          : "mt-1.5 space-y-1 rounded-lg bg-cpbh-mist/30 px-2.5 py-2 shrink-0"
      }
    >
      {data.map((g, i) => (
        <li
          key={g.label}
          className="flex items-start justify-between gap-2 text-[9px] leading-snug"
        >
          <span className="flex min-w-0 items-start gap-1.5 text-cpbh-navy/80">
            <span
              className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-sm"
              style={{ backgroundColor: colorAt(g, i) }}
              aria-hidden
            />
            <span className={compact ? "line-clamp-3" : "line-clamp-2"} title={g.label}>
              {g.label}
            </span>
          </span>
          <span
            className={`shrink-0 tabular-nums text-[10px] font-bold ${metricValueClass(g.provenance ?? chartProvenance, g.count)}`}
          >
            {chartCountDisplay(g.provenance ?? chartProvenance, g.count).text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ChartSlot({
  children,
  tall = false,
}: {
  children: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <div className="rounded-xl border border-cpbh-mist/80 bg-white px-3 pt-2.5 pb-2.5 flex flex-col w-full h-full shadow-sm shadow-cpbh-navy/[0.03]">
      {children}
    </div>
  );
}

function ChartTitle({
  title,
  n,
  nCaption,
  provenance = "unknown",
}: {
  title: string;
  n?: number | null;
  nCaption?: string;
  provenance?: DataProvenance;
}) {
  const headline = chartHeadlineCount(provenance, n);
  return (
    <div className="mb-2 shrink-0 space-y-0.5">
      <p className="text-[11px] font-semibold text-cpbh-navy/85 leading-tight">
        {title}{" "}
        <span className={headline.className}>{headline.text}</span>
      </p>
      {nCaption ? (
        <p
          className="text-[9px] text-cpbh-navy/50 leading-snug line-clamp-1"
          title={nCaption}
        >
          {nCaption}
        </p>
      ) : null}
    </div>
  );
}

function ApoePieChart({
  genotypes,
  title,
  n,
  nCaption,
  nProvenance = "unknown",
  chartProvenance = "unknown",
}: {
  genotypes: ChartCountItem[];
  title: string;
  n?: number | null;
  nCaption?: string;
  nProvenance?: DataProvenance;
  chartProvenance?: DataProvenance;
}) {
  const allItems = genotypes.map((g) => ({
    ...g,
    provenance: g.provenance ?? chartProvenance,
  }));
  const measured = sortPieSlicesAscending(allItems.filter((g) => g.count > 0));
  const legendItems = sortPieSlicesAscending(allItems);
  /** Keep the donut visible when counts are TBD (equal placeholder slices, legend stays TBD). */
  const pieSlices =
    measured.length > 0
      ? measured
      : legendItems.map((g) => ({ ...g, count: 1 }));

  return (
    <ChartSlot tall>
      <ChartTitle
        title={title}
        n={n}
        nCaption={nCaption}
        provenance={nProvenance}
      />
      <div
        className={`${CHART_PLOT_CLASS} mx-auto max-w-[200px]`}
        style={{ height: PIE_RING_HEIGHT, minHeight: PIE_RING_HEIGHT }}
      >
        <ResponsiveContainer width="100%" height={PIE_RING_HEIGHT}>
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={pieSlices}
              cx="50%"
              cy="50%"
              innerRadius={REGISTRY_PIE_INNER}
              outerRadius={REGISTRY_PIE_OUTER}
              paddingAngle={measured.length > 1 ? 2 : measured.length === 0 ? 3 : 0}
              dataKey="count"
              nameKey="label"
              isAnimationActive={false}
              {...PIE_START_AT_TWELVE}
            >
              {pieSlices.map((entry, i) => (
                <Cell
                  key={i}
                  fill={pieSegmentFill(entry, i, chartProvenance)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <BreakdownCountList
        data={legendItems}
        chartProvenance={chartProvenance}
        colorAt={(g, i) => {
          const idx = pieSlices.findIndex((row) => row.label === g.label);
          if (idx >= 0) return pieSegmentFill(pieSlices[idx], idx, chartProvenance);
          return pieSegmentFill(g, i, chartProvenance);
        }}
      />
    </ChartSlot>
  );
}

function barTopLabel(
  chartData: { provenance?: DataProvenance }[],
  chartProvenance: DataProvenance,
  props: {
    x?: number | string;
    y?: number | string;
    value?: number | string;
    index?: number;
  },
) {
  const idx = props.index ?? 0;
  const prov = chartData[idx]?.provenance ?? chartProvenance;
  const val = props.value;
  if (val == null || val === "") return null;
  const label = chartCountDisplay(prov, val);
  return (
    <text
      x={Number(props.x ?? 0)}
      y={Number(props.y ?? 0) - 4}
      textAnchor="middle"
      fill={label.fill}
      fontSize={10}
      fontWeight={700}
    >
      {label.text}
    </text>
  );
}

function MiniBarChart({
  data,
  title,
  n,
  nCaption,
  nProvenance = "unknown",
  chartProvenance = "unknown",
  variant = "default",
}: {
  data: ChartCountItem[];
  title: string;
  n?: number | null;
  nCaption?: string;
  nProvenance?: DataProvenance;
  chartProvenance?: DataProvenance;
  variant?: "default" | "adrcVertical" | "wide";
}) {
  const chartData = data.map((d) => ({
    name: d.label,
    count: d.count,
    provenance: d.provenance ?? chartProvenance,
  }));
  const yMax = Math.max(
    ...chartData.map((d) => d.count),
    1,
  );
  const yTop = Math.ceil(yMax * 1.08);
  const adrcVertical = variant === "adrcVertical";
  const wideBars = variant === "wide" || adrcVertical;
  const horizontal = !adrcVertical && preferHorizontalBars(chartData);
  const plotH = adrcVertical
    ? Math.max(BAR_CHART_HEIGHT, 96 + chartData.length * 4)
    : variant === "wide"
      ? Math.max(BAR_CHART_HEIGHT + 16, barPlotHeight(chartData.length, horizontal))
      : barPlotHeight(chartData.length, horizontal);
  const yAxisWidth = horizontal
    ? Math.min(92, Math.max(64, ...chartData.map((d) => d.name.length * 4.8)))
    : 32;

  const barFillAt = (entry: (typeof chartData)[0], i: number) =>
    segmentColor(
      { label: entry.name, count: entry.count, provenance: entry.provenance },
      i,
      chartProvenance,
    );

  const verticalBarChart = (
    <BarChart
      data={chartData}
      margin={{
        top: 18,
        right: adrcVertical ? 4 : 8,
        left: 0,
        bottom: adrcVertical ? 4 : 8,
      }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="#e8e4f3"
        vertical={false}
      />
      <XAxis
        dataKey="name"
        tick={adrcVertical ? false : { fontSize: 9, fill: "#1a2744" }}
        axisLine={false}
        tickLine={false}
        interval={0}
        tickFormatter={
          adrcVertical ? undefined : (v: string) => shortAxisLabel(v, 10)
        }
        height={adrcVertical ? 6 : undefined}
      />
      <YAxis
        tick={{ fontSize: 9, fill: "#64748b" }}
        axisLine={false}
        tickLine={false}
        allowDecimals={false}
        width={28}
        domain={[0, yTop]}
      />
      {!adrcVertical ? (
        <Tooltip
          labelFormatter={(label) => String(label)}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e8e4f3",
            fontSize: "11px",
          }}
        />
      ) : null}
      <Bar
        dataKey="count"
        radius={[4, 4, 0, 0]}
        maxBarSize={
          wideBars ? (adrcVertical ? 52 : variant === "wide" ? 72 : 58) : 48
        }
        minPointSize={3}
      >
        {chartData.map((entry, i) => (
          <Cell key={i} fill={barFillAt(entry, i)} />
        ))}
        <LabelList
          dataKey="count"
          position="top"
          content={(props) => barTopLabel(chartData, chartProvenance, props)}
        />
      </Bar>
    </BarChart>
  );

  return (
    <ChartSlot>
      <ChartTitle
        title={title}
        n={n}
        nCaption={nCaption}
        provenance={nProvenance}
      />
      <div
        className={
          adrcVertical
            ? "flex min-h-0 w-full gap-1 items-stretch"
            : undefined
        }
      >
        <div
          className={`${CHART_PLOT_CLASS} ${adrcVertical ? "min-w-0 flex-[1.05]" : "w-full"}`}
          style={{ height: plotH }}
        >
          <ResponsiveContainer width="100%" height={plotH}>
            {horizontal ? (
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 2, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e8e4f3"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, yTop]}
                tick={{ fontSize: 9, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={yAxisWidth}
                tick={{ fontSize: 9, fill: "#1a2744" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => shortAxisLabel(v, 14)}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                barSize={variant === "wide" ? 22 : 14}
                minPointSize={3}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={segmentColor(
                      {
                        label: entry.name,
                        count: entry.count,
                        provenance: entry.provenance,
                      },
                      i,
                      chartProvenance,
                    )}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            verticalBarChart
          )}
        </ResponsiveContainer>
        </div>
        {adrcVertical ? (
          <div className="min-w-0 flex-[0.95] border-l border-cpbh-mist/60 pl-1.5">
            <BreakdownCountList
              data={data}
              chartProvenance={chartProvenance}
              compact
              colorAt={(g, i) => barFillAt(
                {
                  name: g.label,
                  count: g.count,
                  provenance: g.provenance ?? chartProvenance,
                },
                i,
              )}
            />
          </div>
        ) : null}
      </div>
      {horizontal ? (
        <BreakdownCountList
          data={data}
          chartProvenance={chartProvenance}
          colorAt={(g, i) =>
            segmentColor(g, i, chartProvenance)
          }
        />
      ) : null}
    </ChartSlot>
  );
}

function TbdBox({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className="rounded-xl border-2 border-dashed border-cpbh-mist bg-cpbh-mist/20 flex items-center justify-center p-3"
      style={{
        height: tall ? PIE_RING_HEIGHT + 72 : BAR_CHART_HEIGHT + 40,
      }}
    >
      <p className={`font-medium text-lg ${metricValueClass("unknown")}`}>TBD</p>
    </div>
  );
}

const PERIOD_CARD_HEIGHT = "min-h-[5.75rem]";

function PeriodActivityCard({
  label,
  count,
  provenance,
  target,
  accent = "teal",
}: {
  label: string;
  count: number;
  provenance: DataProvenance;
  target?: number;
  accent?: "navy" | "purple" | "teal";
}) {
  const valueClass = metricValueClass(provenance, count);
  const hasTarget = target != null && target > 0;
  const pct = hasTarget
    ? Math.min(Math.round((count / target) * 100), 100)
    : 0;
  const fillClass =
    accent === "navy"
      ? "bg-cpbh-navy"
      : accent === "purple"
        ? "bg-cpbh-purple"
        : "bg-cpbh-teal";

  return (
    <div
      className={`flex h-full ${PERIOD_CARD_HEIGHT} flex-col rounded-lg border border-cpbh-mist bg-white px-2 py-2 text-center shadow-sm`}
    >
      <p className="shrink-0 h-8 text-[9px] sm:text-[10px] text-cpbh-navy/55 leading-tight line-clamp-2 flex items-center justify-center">
        {label}
      </p>
      <div className="mt-auto flex flex-col justify-end">
        <div
          className={`flex h-5 w-full items-baseline justify-center gap-0.5 whitespace-nowrap tabular-nums text-sm sm:text-base font-semibold leading-none ${valueClass}`}
        >
          <span>{count}</span>
          {hasTarget ? (
            <span className="font-normal opacity-45">/ {target}</span>
          ) : null}
        </div>
        <div className="mt-1.5 h-2 rounded-full overflow-hidden mx-0.5 bg-cpbh-mist/90">
          {hasTarget ? (
            <div
              className={`h-full rounded-full transition-all ${fillClass}`}
              style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
            />
          ) : count > 0 ? (
            <div
              className={`h-full rounded-full ${fillClass}`}
              style={{ width: "35%" }}
            />
          ) : null}
        </div>
        {hasTarget ? (
          <TargetProgressLabel
            pct={pct}
            valueClass={valueClass}
            className="mt-0.5 text-[9px] sm:text-[10px]"
          />
        ) : (
          <p className="h-3 mt-0.5 text-[9px] text-transparent select-none" aria-hidden>
            —
          </p>
        )}
      </div>
    </div>
  );
}

function PeriodCardSlot({
  children,
  span = 1,
}: {
  children: React.ReactNode;
  span?: 1 | 2 | 3;
}) {
  const spanClass =
    span === 2 ? "col-span-2" : span === 3 ? "col-span-3" : undefined;

  return (
    <div className={`h-full min-h-0 flex flex-col ${spanClass ?? ""}`}>
      {children}
    </div>
  );
}

function ReportingPeriodPanel({
  items,
  provenance,
  footnote,
  accent = "teal",
}: {
  items: {
    label: string;
    count: number;
    periodTarget?: number;
    provenance?: DataProvenance;
  }[];
  provenance: DataProvenance;
  footnote?: string;
  accent?: "navy" | "purple" | "teal";
}) {
  const cardProps = (item: (typeof items)[number]) => ({
    label: item.label,
    count: item.count,
    provenance: item.provenance ?? provenance,
    target: item.periodTarget,
    accent,
  });

  const cardWidth = "w-[calc((100%-1rem)/3)]";

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-sm text-cpbh-navy/60 text-center leading-none">
        + year to date
      </p>
      {items.length === 2 ? (
        <div className="flex justify-center gap-2 items-stretch">
          {items.map((item) => (
            <div key={item.label} className={`${cardWidth} flex flex-col`}>
              <PeriodActivityCard {...cardProps(item)} />
            </div>
          ))}
        </div>
      ) : items.length === 1 ? (
        <div className="flex justify-center items-stretch">
          <div className={`${cardWidth} flex flex-col`}>
            <PeriodActivityCard {...cardProps(items[0])} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 items-stretch">
          {items.map((item) => (
            <PeriodCardSlot key={item.label}>
              <PeriodActivityCard {...cardProps(item)} />
            </PeriodCardSlot>
          ))}
        </div>
      )}
      {footnote ? (
        <p className="text-[10px] text-cpbh-navy/45 text-center leading-snug px-1 pt-0.5">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}

function PeriodGoalProgress({
  current,
  target,
  provenance,
}: {
  current: number;
  target: number;
  provenance: DataProvenance;
}) {
  const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const valueClass = metricValueClass(provenance, current);

  return (
    <div className="flex w-full flex-col gap-2 px-2">
      <p className="text-sm text-cpbh-navy/60 text-center leading-none">
        + year to date
      </p>
      <div className="flex flex-col justify-center py-1">
        <p className={`text-2xl font-semibold text-center leading-none ${valueClass}`}>
          {current}
          <span className="text-base font-normal opacity-50 ml-1">/ {target}</span>
        </p>
        <div className="h-2 bg-cpbh-mist rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-cpbh-teal transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <TargetProgressLabel
          pct={pct}
          valueClass={valueClass}
          className="text-[10px] sm:text-xs text-center mt-1"
        />
      </div>
    </div>
  );
}

/** Do not back-fill YTD slots with cumulative/registry numbers — show TBD (red) instead. */
function cumulativeFallbackForSlot(
  slot: RegistryChartSlot,
  column: RegistryColumn,
): RegistryChartSlot | null {
  if (column.id === "brs") {
    return null;
  }
  if (column.id === "adrc" && (slot.nProvenance === "ytd" || slot.chartProvenance === "ytd")) {
    return null;
  }
  const title = slot.title.toLowerCase();

  if (title.includes("gender") || title.includes("sex")) {
    if (column.gender) {
      return {
        ...slot,
        items: stampChartProvenance(
          [
            { label: "Male", count: column.gender.male },
            { label: "Female", count: column.gender.female },
          ],
          "prior",
        ),
        provenance: "prior",
        nProvenance: "prior",
        chartProvenance: "prior",
        n: column.total,
        nCaption: slot.nCaption ?? "Last RPPR reporting period",
      };
    }
  }

  if (title.includes("apoe")) {
    const genotypes = column.apoeGenotypes?.filter((g) => g.count > 0) ?? [];
    if (genotypes.length > 0) {
      return {
        ...slot,
        items: stampChartProvenance(
          genotypes.map((g) => ({ label: g.label, count: g.count })),
          "prior",
        ),
        provenance: "prior",
        nProvenance: "prior",
        chartProvenance: "prior",
        n: column.total,
        nCaption: slot.nCaption ?? "Last RPPR reporting period",
      };
    }
  }

  if (title.includes("ethnicity") || title.includes("demographic")) {
    const demos = column.catchmentDemos?.filter((d) => d.count > 0) ?? [];
    const looksLikeSexOnly =
      demos.length > 0 &&
      demos.every((d) => /^(male|female|m|f)$/i.test(d.label.trim()));
    if (demos.length > 0 && !looksLikeSexOnly) {
      return {
        ...slot,
        items: stampChartProvenance(
          demos.map((d) => ({ label: d.label, count: d.count })),
          "prior",
        ),
        provenance: "prior",
        nProvenance: "prior",
        chartProvenance: "prior",
        n: column.total,
        nCaption: slot.nCaption ?? "Last RPPR reporting period",
      };
    }
  }

  if (
    title.includes("source") ||
    title.includes("recruitment") ||
    slot.title === "Source"
  ) {
    const sources = column.bySource?.filter((s) => s.count > 0) ?? [];
    if (sources.length > 0) {
      return {
        ...slot,
        items: stampChartProvenance(
          sources.map((s) => ({ label: s.source, count: s.count })),
          "prior",
        ),
        provenance: "prior",
        nProvenance: "prior",
        chartProvenance: "prior",
        n: slot.n ?? column.total,
        nCaption: slot.nCaption,
      };
    }
  }

  return null;
}

function resolveChartSlot(
  slot: RegistryChartSlot,
  column: RegistryColumn,
  chartsProvenance: DataProvenance,
): RegistryChartSlot {
  const hasItems =
    slot.items.length > 0 && slot.items.some((i) => i.count > 0);
  if (hasItems) return slot;

  const fallback = cumulativeFallbackForSlot(slot, column);
  if (fallback) return fallback;

  return {
    ...slot,
    provenance: slot.provenance ?? chartsProvenance,
  };
}

/** Red placeholder charts (legacy layout) when harmonized export has no breakdown. */
function legacyRedChartSlot(
  slot: RegistryChartSlot,
  column: RegistryColumn,
): RegistryChartSlot | null {
  const title = slot.title.toLowerCase();
  const red: DataProvenance = "unknown";

  if (column.id === "brs" && title.includes("apoe")) {
    return {
      ...slot,
      type: "pie",
      provenance: red,
      nProvenance: red,
      chartProvenance: red,
      nCaption: LEGACY_RED_CHART_CAPTION,
      items: stampChartProvenance([...BRS_TBD_APOE], red),
    };
  }

  if (column.id === "brs" && title.includes("ethnicity")) {
    return {
      ...slot,
      type: "bar",
      provenance: red,
      nProvenance: red,
      chartProvenance: red,
      nCaption: LEGACY_RED_CHART_CAPTION,
      items: stampChartProvenance([...BRS_TBD_ETHNICITY], red),
    };
  }

  if (
    column.id === "brs" &&
    (title.includes("sex") || title.includes("gender"))
  ) {
    return {
      ...slot,
      type: "bar",
      provenance: red,
      nProvenance: red,
      chartProvenance: red,
      nCaption: LEGACY_RED_CHART_CAPTION,
      items: stampChartProvenance([...BRS_TBD_SEX], red),
    };
  }

  if (column.id === "genescreen" && title.includes("ethnicity")) {
    return {
      ...slot,
      type: "bar",
      provenance: red,
      nProvenance: red,
      chartProvenance: red,
      n: 0,
      nCaption: LEGACY_RED_CHART_CAPTION,
      items: stampChartProvenance([...GENESCREEN_YTD_LEGACY_ETHNICITY], red),
    };
  }

  if (column.id === "genescreen" && title.includes("apoe")) {
    return {
      ...slot,
      type: "pie",
      provenance: red,
      nProvenance: red,
      chartProvenance: red,
      n: 0,
      nCaption: LEGACY_RED_CHART_CAPTION,
      items: stampChartProvenance(
        [
          { label: "APOE4 carrier", count: 0 },
          { label: "Non-carrier", count: 0 },
        ],
        red,
      ),
    };
  }

  if (
    column.id === "genescreen" &&
    (title.includes("gender") || title.includes("demographic"))
  ) {
    return {
      ...slot,
      type: "bar",
      provenance: red,
      nProvenance: red,
      chartProvenance: red,
      n: 0,
      nCaption: LEGACY_RED_CHART_CAPTION,
      items: stampChartProvenance(
        [
          { label: "Male", count: 0 },
          { label: "Female", count: 0 },
        ],
        red,
      ),
    };
  }

  return null;
}

function renderChartSlot(
  slot: RegistryChartSlot,
  index: number,
  column: RegistryColumn,
  chartsProvenance: DataProvenance,
) {
  let resolved = resolveChartSlot(slot, column, chartsProvenance);
  const hasPositiveCounts = resolved.items.some((i) => i.count > 0);
  if (!hasPositiveCounts) {
    const legacy = legacyRedChartSlot(resolved, column);
    if (legacy) resolved = legacy;
  }
  if (resolved.items.length === 0) {
    return <TbdBox key={index} tall={resolved.type === "pie"} />;
  }

  const slotProvenance = resolved.provenance ?? chartsProvenance;
  const nProv = resolved.nProvenance ?? slotProvenance ?? chartsProvenance;
  const slotN =
    resolved.n ??
    (nProv === "unknown" ? undefined : column.newThisPeriod);
  const nProvenance =
    resolved.nProvenance ?? slotProvenance ?? chartsProvenance;
  const chartProvenance =
    resolved.chartProvenance ?? slotProvenance ?? chartsProvenance;

  if (resolved.type === "pie") {
    return (
      <ApoePieChart
        key={`${index}-${resolved.title}-${slotN}`}
        title={resolved.title}
        genotypes={resolved.items}
        n={slotN}
        nCaption={resolved.nCaption}
        nProvenance={nProvenance}
        chartProvenance={chartProvenance}
      />
    );
  }

  return (
    <MiniBarChart
      key={`${index}-${resolved.title}-${slotN}`}
      title={resolved.title}
      data={resolved.items}
      n={slotN}
      nCaption={resolved.nCaption}
      nProvenance={nProvenance}
      chartProvenance={chartProvenance}
      variant={
        column.id === "adrc" ||
        (column.id === "genescreen" && column.chartsProvenance === "ytd")
          ? "adrcVertical"
          : column.id === "genescreen" || column.id === "brs"
            ? "wide"
            : "default"
      }
    />
  );
}

/** Cumulative last-RPPR / registry charts (columns 1 & 3) — every count tagged prior (green). */
function classicRegistryChartSlots(
  column: RegistryColumn,
): [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot] {
  const cumulativeN = column.total;
  const cumProv: DataProvenance = "prior";
  const cumCaption = "Last RPPR reporting period · rpprMetrics.json / REDCap export";

  const ethnicityOrDemoItems = stampChartProvenance(
    column.catchmentDemos.length > 0
      ? column.catchmentDemos.map((d) => ({ label: d.label, count: d.count }))
      : column.gender
        ? [
            { label: "Male", count: column.gender.male },
            { label: "Female", count: column.gender.female },
          ]
        : [],
    cumProv,
  );

  const genderBarItems = stampChartProvenance(
    column.gender
      ? [
          { label: "Male", count: column.gender.male },
          { label: "Female", count: column.gender.female },
        ]
      : ethnicityOrDemoItems,
    cumProv,
  );

  const apoeItems = stampChartProvenance(
    column.apoeGenotypes?.map((g) => ({ label: g.label, count: g.count })) ??
      [],
    cumProv,
  );

  const sourceItems = stampChartProvenance(
    column.bySource.map((s) => ({ label: s.source, count: s.count })),
    cumProv,
  );

  const slotBase = {
    provenance: cumProv,
    nProvenance: cumProv,
    chartProvenance: cumProv,
    n: cumulativeN,
    nCaption: cumCaption,
  };

  if (column.id === "genescreen") {
    return [
      {
        ...slotBase,
        title: "Demographics",
        type: "bar",
        items: genderBarItems,
      },
      {
        ...slotBase,
        title: "APOE4",
        type: "pie",
        items: apoeItems,
      },
      {
        ...slotBase,
        title: "Source",
        type: "bar",
        items: sourceItems,
      },
    ];
  }

  if (column.id === "brs") {
    return [
      {
        ...slotBase,
        title: "Ethnicity",
        type: "bar",
        items: ethnicityOrDemoItems,
      },
      {
        ...slotBase,
        title: "APOE genotype",
        type: "pie",
        items: apoeItems,
      },
      {
        ...slotBase,
        title: "Sex",
        type: "bar",
        items: genderBarItems,
      },
    ];
  }

  return [
    {
      ...slotBase,
      title: "Demographics",
      type: "bar",
      items: ethnicityOrDemoItems,
    },
    {
      ...slotBase,
      title: "APOE Genotype",
      type: "pie",
      items: apoeItems,
    },
    {
      ...slotBase,
      title: "Source",
      type: "bar",
      items: sourceItems,
    },
  ];
}

/** GeneScreen YTD uses REDCap chartSlots when wired; BRS lower charts stay cumulative RPPR (green). */
function reportingPeriodChartSlots(
  column: RegistryColumn,
): [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot] {
  if (
    (column.id === "genescreen" || column.id === "brs") &&
    column.chartSlots?.length
  ) {
    return yearToDateChartSlotsFromColumn(column);
  }
  return classicRegistryChartSlots(column);
}

/** YTD breakdown charts from column.chartSlots (harmonized package or REDCap aggregate). */
function yearToDateChartSlotsFromColumn(
  column: RegistryColumn,
): [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot] {
  const slots = column.chartSlots;
  if (!slots?.length) {
    return [
      {
        title: "Ethnicity",
        type: "bar",
        provenance: "unknown",
        nProvenance: "unknown",
        chartProvenance: "unknown",
        n: column.newThisPeriod,
        nCaption: "No harmonized breakdown in export",
        items: [],
      },
      {
        title: "APOE genotype",
        type: "pie",
        provenance: "unknown",
        nProvenance: "unknown",
        chartProvenance: "unknown",
        n: column.newThisPeriod,
        nCaption: "No harmonized breakdown in export",
        items: [],
      },
      {
        title: "Referral source (NACC A1)",
        type: "bar",
        provenance: "unknown",
        nProvenance: "unknown",
        chartProvenance: "unknown",
        n: column.newThisPeriod,
        nCaption: "No harmonized breakdown in export",
        items: [],
      },
    ];
  }
  return slots.map((s) => ({
    ...s,
    type: s.type ?? "bar",
    n: s.n ?? column.newThisPeriod,
    provenance: s.provenance ?? "ytd",
    nProvenance: s.nProvenance ?? "ytd",
    chartProvenance: s.chartProvenance ?? "ytd",
    items: stampChartProvenance(
      s.items.map((i) => ({
        label: i.label,
        count: i.count,
        provenance: i.provenance,
      })),
      s.chartProvenance ?? s.provenance ?? "ytd",
    ),
  })) as [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot];
}

function adrcYearToDateChartSlots(
  column: RegistryColumn,
): [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot] {
  return yearToDateChartSlotsFromColumn(column);
}

function columnAccentBorder(column: RegistryColumn): string {
  return column.id === "adrc"
    ? "border-t-cpbh-navy"
    : column.id === "genescreen"
      ? "border-t-cpbh-purple"
      : "border-t-cpbh-teal";
}

function activeChartSlotsForColumn(
  column: RegistryColumn,
): [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot] {
  const chartsProvenance =
    column.chartsProvenance ?? column.totalsProvenance ?? "unknown";
  return column.id === "adrc"
    ? adrcYearToDateChartSlots(column)
    : reportingPeriodChartSlots(column);
}

function chartsProvenanceForColumn(column: RegistryColumn): DataProvenance {
  return column.chartsProvenance ?? column.totalsProvenance ?? "unknown";
}

function RegistryHeaderBlock({ column }: { column: RegistryColumn }) {
  const totalsProvenance = column.totalsProvenance ?? "ytd";
  const valueClass = metricValueClass(totalsProvenance, column.total);

  return (
    <div className="text-center rounded-2xl border-2 border-cpbh-purple/25 bg-cpbh-mist/30 px-4 py-3 shadow-sm flex flex-col items-center justify-center min-h-[7.5rem] h-full">
      <p className="text-sm font-medium text-cpbh-purple uppercase tracking-wide leading-snug px-1 line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
        {column.title}
      </p>
      <p className={`text-4xl md:text-5xl font-semibold mt-1 leading-none ${valueClass}`}>
        {column.total}
      </p>
      {column.id === "genescreen" && column.totalsProvenance === "ytd" ? (
        <p className="text-[10px] text-cpbh-navy/55 mt-0.5 leading-tight px-1">
          Black = GeneScreen REDCap export ({column.total} Complete? records). Last RPPR cited 668.
        </p>
      ) : null}
      <p className="text-xs mt-1 min-h-[1.125rem]">
        {column.gender ? (
          <>
            <span
              className={metricValueClass(
                column.totalsProvenance ?? "unknown",
                column.gender.male,
              )}
            >
              {column.gender.male} M
            </span>
            <span className="text-cpbh-navy/45"> · </span>
            <span
              className={metricValueClass(
                column.totalsProvenance ?? "unknown",
                column.gender.female,
              )}
            >
              {column.gender.female} F
            </span>
            <span className="text-cpbh-navy/55"> enrolled</span>
          </>
        ) : null}
      </p>
    </div>
  );
}

const YTD_ROW_MIN = "min-h-[11.5rem]";

function RegistryYtdBlock({ column }: { column: RegistryColumn }) {
  return (
    <div
      className={`rounded-xl bg-cpbh-mist/40 px-3 py-2 h-full flex flex-col justify-center ${YTD_ROW_MIN}`}
    >
      {column.periodActivities ? (
        <ReportingPeriodPanel
          items={column.periodActivities}
          provenance="ytd"
          footnote={column.periodTargetNote}
          accent={
            column.id === "adrc"
              ? "navy"
              : column.id === "genescreen"
                ? "purple"
                : "teal"
          }
        />
      ) : column.periodTarget != null ? (
        <PeriodGoalProgress
          current={column.newThisPeriod}
          target={column.periodTarget}
          provenance="ytd"
        />
      ) : (
        <ReportingPeriodPanel
          items={[
            {
              label: "New this period",
              count: column.newThisPeriod,
            },
          ]}
          provenance="ytd"
        />
      )}
    </div>
  );
}

/** Stacked column (mobile / tablet). */
function RegistryColumnCard({ column }: { column: RegistryColumn }) {
  const chartsProvenance = chartsProvenanceForColumn(column);
  const slots = activeChartSlotsForColumn(column);

  return (
    <div
      className={`dashboard-card border-t-4 ${columnAccentBorder(column)} flex flex-col gap-3 h-auto min-w-[14rem] w-full`}
    >
      <RegistryHeaderBlock column={column} />
      <RegistryYtdBlock column={column} />
      <div className="flex flex-col gap-2.5 shrink-0 w-full min-w-0">
        {slots.map((slot, index) =>
          renderChartSlot(slot, index, column, chartsProvenance),
        )}
      </div>
    </div>
  );
}

const REGISTRY_ROW_GRID =
  "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-x-6 xl:gap-y-5 items-stretch";

/** Desktop: each horizontal band aligns across GeneScreen · ADRC · BRS. */
function RegistryAlignedDesktop({ columns }: { columns: RegistryColumn[] }) {
  return (
    <div className="hidden xl:flex xl:flex-col xl:gap-3 w-full mx-auto">
      <div
        className={REGISTRY_ROW_GRID}
        data-deck-slide="recruitment-registry-headers"
        data-deck-caption="Recruitment · GeneScreen, ADRC, BRS · registry totals"
      >
        {columns.map((col) => (
          <div
            key={`head-${col.id}`}
            className={`dashboard-card border-t-4 ${columnAccentBorder(col)} p-4 h-full`}
          >
            <RegistryHeaderBlock column={col} />
          </div>
        ))}
      </div>
      <div
        className={REGISTRY_ROW_GRID}
        data-deck-slide="recruitment-ytd-activities"
        data-deck-caption="Recruitment · YTD activities (Jan–Sep 2026)"
      >
        {columns.map((col) => (
          <div
            key={`ytd-${col.id}`}
            className={`dashboard-card border-t-4 ${columnAccentBorder(col)} p-4 h-full`}
          >
            <RegistryYtdBlock column={col} />
          </div>
        ))}
      </div>
      {[0, 1, 2].map((rowIndex) => (
        <div
          key={`charts-${rowIndex}`}
          className={REGISTRY_ROW_GRID}
          data-deck-slide={`recruitment-charts-row-${rowIndex + 1}`}
          data-deck-caption={`Recruitment · charts (row ${rowIndex + 1})`}
        >
          {columns.map((col) => {
            const chartsProvenance = chartsProvenanceForColumn(col);
            const slots = activeChartSlotsForColumn(col);
            return (
              <div
                key={`${col.id}-chart-${rowIndex}`}
                className="h-full min-h-0 min-w-0 w-full flex flex-col"
              >
                {renderChartSlot(
                  slots[rowIndex],
                  rowIndex,
                  col,
                  chartsProvenance,
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function TopRegistryOverview({
  data,
}: TopRegistryOverviewProps) {
  return (
    <section className="relative z-[1] space-y-6 w-full mx-auto max-w-[90rem]">
      <RegistryAlignedDesktop columns={data.columns} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:hidden">
        {data.columns.map((col) => (
          <RegistryColumnCard key={col.id} column={col} />
        ))}
      </div>
    </section>
  );
}

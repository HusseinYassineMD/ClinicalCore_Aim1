"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PACKAGE_CHART_COLORS,
  type ChartDatum,
  recordToChartData,
  totalFromRecord,
} from "@/lib/dataPackageChartUtils";
import { metricChartLabelFill, metricValueClass } from "@/lib/metricValueClass";
import { PIE_START_AT_TWELVE } from "@/lib/pieChartConfig";

const PANEL_BASE =
  "rounded-2xl border border-cpbh-mist/80 bg-white flex flex-col shadow-md shadow-cpbh-navy/[0.06] overflow-hidden";

/** Uniform height for side-by-side panels in the data package grid. */
export const BREAKDOWN_PANEL_MIN_H = "min-h-[440px]";

const PANEL_SHELL = `${PANEL_BASE} h-full w-full ${BREAKDOWN_PANEL_MIN_H}`;
const PANEL_COMPACT = PANEL_SHELL;
/** Sizes to content — for short card-list breakdowns in paired grids. */
const PANEL_SHELL_FIT = `${PANEL_BASE} h-auto w-full`;

export type PanelAccent = "purple" | "teal" | "sky" | "navy";

const BAR_CHART_WIDTH = 640;
const BAR_CHART_HEIGHT = 240;

export function BreakdownPanelHeader({
  title,
  subtitle,
  accent = "purple",
}: {
  title: string;
  subtitle?: string;
  accent?: PanelAccent;
}) {
  const accentBar = {
    purple: "from-cpbh-purple/80 to-cpbh-purple/30",
    teal: "from-cpbh-teal/80 to-cpbh-teal/30",
    sky: "from-cpbh-sky/80 to-cpbh-sky/30",
    navy: "from-cpbh-navy/80 to-cpbh-navy/30",
  }[accent];

  return (
    <div className="relative flex min-h-[4.75rem] shrink-0 flex-col justify-center border-b border-cpbh-mist/70 bg-gradient-to-br from-cpbh-mist/40 via-white to-white px-5 py-3.5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBar}`} />
      <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-cpbh-navy pt-0.5">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 text-base font-medium tabular-nums text-cpbh-purple/70">{subtitle}</p>
      )}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-cpbh-mist bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-cpbh-navy max-w-[220px]">{item.fullName}</p>
      <p className="text-cpbh-purple font-semibold">{item.value.toLocaleString()}</p>
    </div>
  );
}

function formatBarValue(value: number | string): string {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n.toLocaleString() : String(value);
}

function ChartAxisCaption({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 pb-3 text-center text-sm text-cpbh-navy/55">{children}</p>
  );
}

function formatPiePercent(percent: number): string {
  const pct = percent * 100;
  if (pct > 0 && pct < 1) return "<1%";
  return `${Math.round(pct)}%`;
}

function PieSliceMetrics({
  data,
  total,
}: {
  data: ChartDatum[];
  total: number;
}) {
  return (
    <ul className="mx-auto w-full max-w-[360px] space-y-1 px-2 pb-1">
      {data.map((item, i) => {
        const share = total > 0 ? item.value / total : 0;
        return (
          <li
            key={item.fullName}
            className="flex items-start justify-between gap-3 text-sm leading-snug"
          >
            <span className="flex min-w-0 items-start gap-2 text-cpbh-navy/80">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{
                  backgroundColor:
                    PACKAGE_CHART_COLORS[i % PACKAGE_CHART_COLORS.length],
                }}
              />
              <span title={item.fullName !== item.name ? item.fullName : undefined}>
                {item.name}
              </span>
            </span>
            <span
              className={`shrink-0 tabular-nums font-semibold whitespace-nowrap ${metricValueClass("ytd", item.value)}`}
            >
              {item.value.toLocaleString()} ({formatPiePercent(share)})
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function renderPieLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  value?: number;
  percent?: number;
}) {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, value, percent } = props;

  if (value == null || percent == null) return null;

  const angle = (-midAngle * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // Small slices get pushed further out so labels stay readable and off the ring.
  const radialBoost = percent < 0.02 ? 28 : percent < 0.05 ? 18 : 0;
  const labelRadius = outerRadius + 14 + radialBoost;
  const x = cx + labelRadius * cos;
  const y = cy + labelRadius * sin;
  const onRight = cos >= 0;

  return (
    <text
      x={x}
      y={y}
      fill={metricChartLabelFill("ytd", value)}
      fontSize={percent < 0.02 ? 10 : 12}
      fontWeight={600}
      textAnchor={onRight ? "start" : "end"}
      dominantBaseline="central"
      dx={onRight ? 4 : -4}
    >
      {`${value.toLocaleString()} (${formatPiePercent(percent)})`}
    </text>
  );
}

function pieChartMargins(sliceCount: number) {
  const extra = Math.max(0, sliceCount - 3) * 6;
  return {
    top: 32 + extra,
    right: 48 + extra,
    bottom: 16,
    left: 48 + extra,
  };
}

function PackagePieChart({
  title,
  data,
  maxItems,
  accent = "purple",
}: {
  title: string;
  data: Record<string, number>;
  maxItems?: number;
  accent?: PanelAccent;
}) {
  const chartData = recordToChartData(data, maxItems, "valueAsc");
  const total = totalFromRecord(data);
  if (chartData.length === 0) return null;

  return (
    <div className={PANEL_SHELL}>
      <BreakdownPanelHeader
        title={title}
        subtitle={`n = ${total.toLocaleString()}`}
        accent={accent}
      />
      <div className="flex min-h-0 flex-1 flex-col items-center px-4 py-4">
        <div className="mx-auto h-[240px] w-full max-w-[320px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={pieChartMargins(chartData.length)}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="36%"
                outerRadius="52%"
                paddingAngle={chartData.length > 4 ? 1 : 2}
                dataKey="value"
                nameKey="name"
                label={renderPieLabel}
                labelLine={{
                  stroke: "#1a2744",
                  strokeWidth: 1,
                  strokeOpacity: 0.35,
                }}
                isAnimationActive={false}
                {...PIE_START_AT_TWELVE}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={PACKAGE_CHART_COLORS[i % PACKAGE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 w-full min-h-0 flex-1">
          <PieSliceMetrics data={chartData} total={total} />
        </div>
        <ChartAxisCaption>
          Each slice = category share of total (n = {total.toLocaleString()}).
        </ChartAxisCaption>
      </div>
    </div>
  );
}

function PackageBarChart({
  title,
  data,
  maxItems = 8,
  horizontal = false,
  sortBy = "value",
  fullWidth = false,
  accent = "purple",
}: {
  title: string;
  data: Record<string, number>;
  maxItems?: number;
  horizontal?: boolean;
  sortBy?: "value" | "label";
  fullWidth?: boolean;
  accent?: PanelAccent;
}) {
  const chartData = recordToChartData(data, maxItems, sortBy);
  const total = totalFromRecord(data);
  if (chartData.length === 0) return null;

  const chartWidth = fullWidth ? 900 : BAR_CHART_WIDTH;
  const barHeight = horizontal
    ? Math.max(200, chartData.length * 34 + 48)
    : Math.min(360, Math.max(BAR_CHART_HEIGHT, chartData.length * 26 + 48));
  const yAxisWidth = fullWidth ? 200 : 112;

  if (horizontal) {
    return (
      <div className={PANEL_SHELL}>
        <BreakdownPanelHeader
          title={title}
          subtitle={`n = ${total.toLocaleString()}`}
          accent={accent}
        />
        <div className="min-h-0 flex-1 p-4 pt-2">
          <div className="w-full" style={{ height: barHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 64, left: 4, bottom: 32 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4f3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#1a2744" }}
                  axisLine={false}
                  label={{
                    value: "Count (records)",
                    position: "insideBottom",
                    offset: -4,
                    style: { fill: "#1a2744", fontSize: 13, fontWeight: 600 },
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={yAxisWidth}
                  tick={{ fontSize: 12, fill: "#1a2744" }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Category",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#1a2744", fontSize: 13, fontWeight: 600, textAnchor: "middle" },
                  }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PACKAGE_CHART_COLORS[i % PACKAGE_CHART_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={formatBarValue}
                    style={{
                      fill: metricChartLabelFill("ytd"),
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartAxisCaption>
            Y-axis = category · X-axis = number of records
          </ChartAxisCaption>
        </div>
      </div>
    );
  }

  return (
    <div className={PANEL_SHELL}>
      <BreakdownPanelHeader
        title={title}
        subtitle={`n = ${total.toLocaleString()}`}
        accent={accent}
      />
      <div className="min-h-0 flex-1 p-4 pt-2 rounded-b-xl">
        <BarChart
          width={chartWidth}
          height={barHeight}
          data={chartData}
          margin={{ top: 16, right: 12, left: 4, bottom: 36 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e4f3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#1a2744" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={chartData.length > 6 ? -25 : 0}
            textAnchor={chartData.length > 6 ? "end" : "middle"}
            height={chartData.length > 6 ? 64 : 36}
            label={{
              value: "Category",
              position: "insideBottom",
              offset: chartData.length > 6 ? -2 : -4,
              style: { fill: "#1a2744", fontSize: 13, fontWeight: 600 },
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#1a2744" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={52}
            label={{
              value: "Count",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#1a2744", fontSize: 13, fontWeight: 600, textAnchor: "middle" },
            }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={PACKAGE_CHART_COLORS[i % PACKAGE_CHART_COLORS.length]} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={formatBarValue}
              style={{
                fill: metricChartLabelFill("ytd"),
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          </Bar>
        </BarChart>
        <ChartAxisCaption>
          X-axis = category · Y-axis = number of records (values shown above each bar)
        </ChartAxisCaption>
      </div>
    </div>
  );
}

export type ScatterPoint = {
  x: number;
  y: number;
  label: string;
};

export function recordToScatterPoints(
  data: Record<string, number>,
  sortBy: "value" | "label" = "label",
): ScatterPoint[] {
  const entries = Object.entries(data).filter(([, value]) => value > 0);
  const sorted =
    sortBy === "label"
      ? [...entries].sort((a, b) => {
          const na = parseFloat(a[0]);
          const nb = parseFloat(b[0]);
          if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
          return a[0].localeCompare(b[0]);
        })
      : [...entries].sort((a, b) => b[1] - a[1]);

  return sorted
    .map(([label, count]) => ({
      x: parseFloat(label),
      y: count,
      label,
    }))
    .filter((point) => Number.isFinite(point.x));
}

function ScatterTooltip({
  active,
  payload,
  xAxisLabel,
}: {
  active?: boolean;
  payload?: { payload: ScatterPoint }[];
  xAxisLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-cpbh-mist bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-cpbh-navy">
        {xAxisLabel}: {point.label}
      </p>
      <p className="text-cpbh-purple font-semibold">
        {point.y.toLocaleString()} subjects
      </p>
    </div>
  );
}

export function PackageScatterChart({
  title,
  data,
  xAxisLabel,
  accent = "purple",
  sortBy = "label",
  tickFormatter,
}: {
  title: string;
  data: Record<string, number>;
  xAxisLabel: string;
  accent?: PanelAccent;
  sortBy?: "value" | "label";
  tickFormatter?: (value: number) => string;
}) {
  const points = recordToScatterPoints(data, sortBy);
  const total = totalFromRecord(data);
  if (points.length === 0) return null;

  const accentColor = {
    purple: PACKAGE_CHART_COLORS[0],
    teal: PACKAGE_CHART_COLORS[2],
    sky: PACKAGE_CHART_COLORS[1],
    navy: PACKAGE_CHART_COLORS[4],
  }[accent];

  return (
    <div className={PANEL_SHELL}>
      <BreakdownPanelHeader
        title={title}
        subtitle={`n = ${total.toLocaleString()}`}
        accent={accent}
      />
      <div className="min-h-0 flex-1 px-2 py-3">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 20, bottom: 28, left: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#d4cfe8" />
              <XAxis
                type="number"
                dataKey="x"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 11, fill: "#1a2744" }}
                axisLine={{ stroke: "#1a2744", strokeDasharray: "4 4" }}
                tickLine={{ stroke: "#1a2744", strokeDasharray: "4 4" }}
                tickFormatter={tickFormatter}
                label={{
                  value: xAxisLabel,
                  position: "insideBottom",
                  offset: -4,
                  style: { fill: "#1a2744", fontSize: 12, fontWeight: 600 },
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                allowDecimals={false}
                width={52}
                tick={{ fontSize: 11, fill: "#1a2744" }}
                axisLine={{ stroke: "#1a2744", strokeDasharray: "4 4" }}
                tickLine={{ stroke: "#1a2744", strokeDasharray: "4 4" }}
                label={{
                  value: "Count (subjects)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fill: "#1a2744",
                    fontSize: 12,
                    fontWeight: 600,
                    textAnchor: "middle",
                  },
                }}
              />
              <Tooltip
                content={<ScatterTooltip xAxisLabel={xAxisLabel} />}
                cursor={{ strokeDasharray: "4 4", stroke: "#8b7cb8" }}
              />
              <Scatter
                data={points}
                fill={accentColor}
                shape={(props: { cx?: number; cy?: number }) => {
                  const { cx, cy } = props;
                  if (cx == null || cy == null) return <g />;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5.5}
                      fill={accentColor}
                      fillOpacity={0.88}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <ChartAxisCaption>
          Each dot = one {xAxisLabel.toLowerCase()} value · height = subject count
        </ChartAxisCaption>
      </div>
    </div>
  );
}

export type BreakdownViewProps = {
  title: string;
  data: Record<string, number>;
  maxItems?: number;
  mode?: "auto" | "pie" | "bar";
  sortBy?: "value" | "label";
  fullWidth?: boolean;
  accent?: PanelAccent;
};

export function BreakdownView({
  title,
  data,
  maxItems,
  mode = "auto",
  sortBy = "value",
  fullWidth = false,
  accent = "purple",
}: BreakdownViewProps) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;

  const preferHorizontal =
    entries.length > 5 || entries.some(([label]) => label.length > 20);

  const useBar =
    mode === "bar" || (mode === "auto" && preferHorizontal);

  if (useBar) {
    const horizontalBar =
      mode === "bar" || (sortBy !== "label" && preferHorizontal);
    return (
      <div className="h-full">
        <PackageBarChart
          title={title}
          data={data}
          maxItems={maxItems}
          horizontal={horizontalBar}
          sortBy={sortBy}
          fullWidth={fullWidth}
          accent={accent}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      <PackagePieChart title={title} data={data} maxItems={maxItems} accent={accent} />
    </div>
  );
}

/** Shared panel shell for charts and side-by-side breakdown panels. */
export const breakdownPanelShell = PANEL_SHELL;

/** Compact panel shell for tables that should size to their content. */
export const breakdownPanelShellCompact = PANEL_COMPACT;

/** Panel shell for full-height tables — no minimum height, grows with rows. */
export const breakdownPanelShellFlat = PANEL_BASE;

/** Panel shell that hugs content (no min-height) for compact side-by-side cards. */
export const breakdownPanelShellFit = PANEL_SHELL_FIT;

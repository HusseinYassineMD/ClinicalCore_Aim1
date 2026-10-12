"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import type { DataProvenance, DemographicGroup } from "@/types/aim1";
import { DEMOGRAPHIC_GROUP_LABELS } from "@/types/aim1";
import {
  type Table1StratumKey,
  cdrCounts,
  parseLeadingCount,
  parseMeanSD,
  parseParenPercent,
  parsePercent,
  table1StrataKeys,
} from "@/lib/table1Parse";
import { metricValueClass } from "@/lib/metricValueClass";
import { PIE_START_AT_TWELVE, sortPieSlicesAscending } from "@/lib/pieChartConfig";

/** Table 1 charts: CPBH strata hues (counts/labels stay black). */
const TABLE1_OVERALL_FILL = "#1a2744";
const TABLE1_STRATA_FILLS = [
  "#5b4b8a",
  "#4a90c4",
  "#3d8b8b",
  "#8b7cb8",
  "#6b9080",
] as const;
const TABLE1_CHART_LABEL_FILL = "#1a2744";

function chartSliceFill(index: number): string {
  if (index === 0) return TABLE1_OVERALL_FILL;
  return TABLE1_STRATA_FILLS[(index - 1) % TABLE1_STRATA_FILLS.length];
}

/** Table 1 pies: same ring size + legend block below on every card. */
const TABLE1_PIE_CARD_H = 292;
const PIE_RING_H = 168;
const PIE_CY = 84;
const PIE_OUTER_R = 42;
const PIE_INNER_R = 26;
const PIE_LEGEND_MIN_H = 112;
/** Room for count labels placed outside the ring (not on the slice). */
const PIE_CHART_MARGIN = { top: 24, right: 44, bottom: 18, left: 44 } as const;

/** RPPR Table 1 footnote — asterisk on race rows (Hispanic is a separate stratum). */
export const TABLE1_RACE_ASTERISK_NOTE =
  "* White, Black, and Asian = non-Hispanic; Hispanic row is Hispanic/Latino ethnicity.";

const BAR_H = 168;

const BAR_VALUE_LABEL = {
  fontSize: 10,
  fill: TABLE1_CHART_LABEL_FILL,
  fontWeight: 600,
} as const;

const STACKED_PCT_LABEL = {
  fontSize: 9,
  fill: TABLE1_CHART_LABEL_FILL,
  fontWeight: 600,
} as const;

type PieSlice = { label: string; count: number; fill: string };

type DemographicsPieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  value?: number;
};

/** Participant count just outside the arc (PDF-friendly; legend keeps detail). */
function demographicsPieSliceLabel(props: DemographicsPieLabelProps) {
  const { cx, cy, midAngle, outerRadius, value } = props;
  const n = Number(value);
  if (
    value == null ||
    !Number.isFinite(n) ||
    n <= 0 ||
    midAngle == null ||
    cx == null ||
    cy == null ||
    outerRadius == null ||
    !Number.isFinite(cx) ||
    !Number.isFinite(cy) ||
    !Number.isFinite(outerRadius)
  ) {
    return null;
  }

  const rad = (-midAngle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const r = outerRadius + 14;
  const x = cx + r * cos;
  const y = cy + r * sin;
  const textAnchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";

  return (
    <text
      x={x}
      y={y}
      fill={TABLE1_CHART_LABEL_FILL}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {n}
    </text>
  );
}

function formatBarTopLabel(value: number, unit?: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const core =
    unit === "%"
      ? `${Math.round(n * 10) / 10}%`
      : Number.isInteger(n)
        ? String(n)
        : (Math.round(n * 10) / 10).toFixed(1);
  return unit && unit !== "%" ? `${core}${unit}` : core;
}

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: "1px solid #e8e4f3",
  fontSize: 12,
  boxShadow: "0 6px 16px rgba(26, 39, 68, 0.08)",
} as const;

export type Table1VisualData = {
  overall: DemographicGroup;
  hispanic: DemographicGroup;
  white: DemographicGroup;
  black: DemographicGroup;
  asian: DemographicGroup;
  otherUnknown?: DemographicGroup;
};

function stratumChartLabel(key: Table1StratumKey): string {
  if (key === "otherUnknown") return "Other/unknown";
  return DEMOGRAPHIC_GROUP_LABELS[key].replace("*", "");
}

function ChartCard({
  title,
  subtitle,
  children,
  plotHeight,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  plotHeight: number;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-cpbh-mist/90 bg-gradient-to-b from-white via-white to-cpbh-mist/25 p-4 shadow-md shadow-cpbh-navy/5">
      <div className="mb-3 shrink-0 border-l-[3px] border-cpbh-purple pl-2.5">
        <p className="text-sm font-semibold text-cpbh-navy leading-snug">{title}</p>
        {subtitle ? (
          <p className="text-[11px] text-cpbh-navy/55 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      <div
        className="demographics-chart-plot registry-chart-plot w-full overflow-visible"
        style={{ height: plotHeight }}
      >
        {children}
      </div>
    </div>
  );
}

function DemographicsPie({
  data,
  centerLabel,
  donut = false,
  valueProvenance = "ytd",
}: {
  data: PieSlice[];
  centerLabel?: string | number;
  donut?: boolean;
  valueProvenance?: DataProvenance;
}) {
  const slices = sortPieSlicesAscending(data);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 w-full" style={{ height: PIE_RING_H }}>
        <ResponsiveContainer
          width="100%"
          height={PIE_RING_H}
          initialDimension={{ width: 320, height: PIE_RING_H }}
        >
          <PieChart margin={PIE_CHART_MARGIN}>
            <Pie
              data={slices}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy={PIE_CY}
              innerRadius={donut ? PIE_INNER_R : 0}
              outerRadius={PIE_OUTER_R}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
              isAnimationActive={false}
              label={(props) => demographicsPieSliceLabel(props)}
              labelLine={false}
              {...PIE_START_AT_TWELVE}
            >
              {slices.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
              {centerLabel != null ? (
                <Label
                  value={centerLabel}
                  position="center"
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    fill: TABLE1_CHART_LABEL_FILL,
                  }}
                />
              ) : null}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        className="mt-3 shrink-0 border-t border-cpbh-mist/80 pt-3"
        style={{ minHeight: PIE_LEGEND_MIN_H }}
      >
        <ul className="mx-auto flex w-full max-w-[240px] flex-col gap-1.5">
          {slices.map((slice) => (
            <li
              key={slice.label}
              className="flex items-center gap-2 text-[10px] leading-snug text-cpbh-navy/85"
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm border border-white shadow-sm"
                style={{ backgroundColor: slice.fill }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">{slice.label}</span>
              <span
                className={`shrink-0 tabular-nums font-semibold ${metricValueClass(valueProvenance, slice.count)}`}
              >
                {slice.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function stratumSeries(
  data: Table1VisualData,
  valueOf: (g: DemographicGroup) => number,
) {
  const strata = table1StrataKeys(data);
  return [
    {
      group: "Overall",
      value: valueOf(data.overall),
      fill: chartSliceFill(0),
    },
    ...strata.map((key, i) => ({
      group: stratumChartLabel(key),
      value: valueOf(data[key]!),
      fill: chartSliceFill(i + 1),
    })),
  ];
}

function StratumBarChart({
  data,
  unit,
  domain,
}: {
  data: { group: string; value: number; fill: string }[];
  unit?: string;
  domain?: [number, number];
}) {
  return (
    <ResponsiveContainer
      width="100%"
      height={BAR_H}
      initialDimension={{ width: 360, height: BAR_H }}
    >
      <BarChart data={data} margin={{ top: 22, right: 8, left: -4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf0" vertical={false} />
        <XAxis dataKey="group" tick={{ fontSize: 10, fill: "#1a2744" }} />
        <YAxis tick={{ fontSize: 10 }} domain={domain} unit={unit} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: number) => [`${v}${unit ?? ""}`, "Value"]}
        />
        <Bar dataKey="value" name="Value" radius={[5, 5, 0, 0]} maxBarSize={64}>
          {data.map((row) => (
            <Cell key={row.group} fill={row.fill} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            style={BAR_VALUE_LABEL}
            formatter={(value: number) => formatBarTopLabel(value, unit)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function DemographicsVisuals({
  data,
  valueProvenance = "ytd",
}: {
  data: Table1VisualData;
  valueProvenance?: DataProvenance;
}) {
  const nTotal = parseLeadingCount(data.overall.n);
  const maleN = parseLeadingCount(data.overall.male);
  const femaleN = Math.max(0, nTotal - maleN);

  const strata = table1StrataKeys(data);

  const ethnicityPie: PieSlice[] = strata.map((key, i) => ({
    label:
      key === "otherUnknown"
        ? "Other / unknown"
        : DEMOGRAPHIC_GROUP_LABELS[key],
    count: parseLeadingCount(data[key]!.n),
    fill: chartSliceFill(i),
  }));

  const overallCdr = cdrCounts(data.overall);
  const cdrPie: PieSlice[] = [
    { label: "CDR = 0", count: overallCdr.cdr0, fill: chartSliceFill(1) },
    { label: "CDR = 0.5", count: overallCdr.cdr05, fill: chartSliceFill(2) },
    { label: "CDR ≥ 1", count: overallCdr.cdrGe1, fill: chartSliceFill(3) },
  ];

  const sexPie: PieSlice[] = [
    { label: "Male", count: maleN, fill: chartSliceFill(0) },
    { label: "Female", count: femaleN, fill: chartSliceFill(1) },
  ];

  const cdrByGroup = strata.map((key) => {
    const g = data[key]!;
    const counts = cdrCounts(g);
    const n = parseLeadingCount(g.n);
    return {
      group: stratumChartLabel(key),
      cdr0Pct: n ? (counts.cdr0 / n) * 100 : 0,
      cdr05Pct: n ? (counts.cdr05 / n) * 100 : 0,
      cdrGe1Pct: n ? (counts.cdrGe1 / n) * 100 : 0,
    };
  });

  return (
    <div className="space-y-5">
      <div
        className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3"
        data-deck-slide="demographics-charts-pies"
        data-deck-caption="Demographics · race, CDR, sex (Table 1)"
      >
        <ChartCard
          title="Race / ethnicity"
          subtitle={`Derived from Table 1 · N = ${nTotal} · * = non-Hispanic race`}
          plotHeight={TABLE1_PIE_CARD_H}
        >
          <DemographicsPie
            data={ethnicityPie}
            centerLabel={nTotal}
            donut
            valueProvenance={valueProvenance}
          />
        </ChartCard>
        <ChartCard
          title="CDR global (overall cohort)"
          subtitle="From Table 1 CDR columns (overall row)"
          plotHeight={TABLE1_PIE_CARD_H}
        >
          <DemographicsPie data={cdrPie} valueProvenance={valueProvenance} />
        </ChartCard>
        <ChartCard
          title="Sex (overall cohort)"
          subtitle={`From Table 1 male n (%) · Female ${femaleN} inferred`}
          plotHeight={TABLE1_PIE_CARD_H}
        >
          <DemographicsPie data={sexPie} donut valueProvenance={valueProvenance} />
        </ChartCard>
      </div>

      <div
        data-deck-slide="demographics-charts-cdr-strata"
        data-deck-caption="Demographics · CDR staging by race / ethnicity"
      >
      <ChartCard
        title="CDR staging by race / ethnicity"
        subtitle="100% stacked · share within each stratum"
        plotHeight={BAR_H + 8}
      >
        <ResponsiveContainer
          width="100%"
          height={BAR_H + 8}
          initialDimension={{ width: 720, height: BAR_H + 8 }}
        >
          <BarChart
            data={cdrByGroup}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf0" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
            <YAxis
              type="category"
              dataKey="group"
              width={72}
              tick={{ fontSize: 10, fill: "#1a2744" }}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(1)}%`,
                name,
              ]}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar
              dataKey="cdr0Pct"
              name="CDR = 0"
              stackId="pct"
              fill={chartSliceFill(1)}
            >
              <LabelList
                dataKey="cdr0Pct"
                position="center"
                style={STACKED_PCT_LABEL}
                formatter={(v: number) =>
                  v >= 10 ? `${Math.round(v)}%` : ""
                }
              />
            </Bar>
            <Bar
              dataKey="cdr05Pct"
              name="CDR = 0.5"
              stackId="pct"
              fill={chartSliceFill(2)}
            >
              <LabelList
                dataKey="cdr05Pct"
                position="center"
                style={STACKED_PCT_LABEL}
                formatter={(v: number) =>
                  v >= 10 ? `${Math.round(v)}%` : ""
                }
              />
            </Bar>
            <Bar
              dataKey="cdrGe1Pct"
              name="CDR ≥ 1"
              stackId="pct"
              fill={chartSliceFill(3)}
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="cdrGe1Pct"
                position="center"
                style={STACKED_PCT_LABEL}
                formatter={(v: number) =>
                  v >= 8 ? `${Math.round(v)}%` : ""
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        data-deck-slide="demographics-charts-clinical-bars-1"
        data-deck-caption="Demographics · age, MoCA, sex, APOE (Table 1)"
      >
        <ChartCard title="Mean age (years)" subtitle="Overall + strata" plotHeight={BAR_H}>
          <StratumBarChart
            data={stratumSeries(data, (g) => parseMeanSD(g.ageMeanSD))}
            domain={[65, 78]}
          />
        </ChartCard>
        <ChartCard
          title="MoCA score"
          subtitle="Mean (SD) parsed from each Table 1 stratum row"
          plotHeight={BAR_H}
        >
          <StratumBarChart
            data={stratumSeries(data, (g) => parseMeanSD(g.mocaMeanSD))}
            domain={[23, 28]}
          />
        </ChartCard>
        <ChartCard title="Male (%)" subtitle="Within each stratum" plotHeight={BAR_H}>
          <StratumBarChart
            data={stratumSeries(data, (g) => {
              const p = parseParenPercent(g.male);
              return p > 0 ? p : parsePercent(g.male);
            })}
            unit="%"
            domain={[0, 45]}
          />
        </ChartCard>
        <ChartCard title="APOE ε4 (%)" subtitle="Participants with genotype" plotHeight={BAR_H}>
          <StratumBarChart
            data={stratumSeries(data, (g) => parsePercent(g.apoeE4Percent))}
            unit="%"
            domain={[0, 50]}
          />
        </ChartCard>
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        data-deck-slide="demographics-charts-clinical-bars-2"
        data-deck-caption="Demographics · education & follow-up (Table 1)"
      >
        <ChartCard title="Education (years, median)" subtitle="Table 1 median" plotHeight={BAR_H}>
          <StratumBarChart
            data={stratumSeries(data, (g) => parseMeanSD(g.eduMedianIQR))}
            domain={[12, 18]}
          />
        </ChartCard>
        <ChartCard title="Follow-up (years, mean)" subtitle="Registry duration" plotHeight={BAR_H}>
          <StratumBarChart
            data={stratumSeries(data, (g) => parseMeanSD(g.followUpMeanSD))}
            domain={[2, 8]}
          />
        </ChartCard>
      </div>
    </div>
  );
}

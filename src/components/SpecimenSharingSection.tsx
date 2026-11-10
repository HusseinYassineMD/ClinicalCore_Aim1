"use client";

import type { DataProvenance, SpecimenSharing } from "@/types/aim1";
import { PIE_START_AT_TWELVE, sortPieSlicesAscending } from "@/lib/pieChartConfig";
import MetricCard from "./MetricCard";
import PlasmaRequestSummaryBlock from "./PlasmaRequestSummary";
import { ClientMountGate } from "@/components/MetricsChartsHost";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const PIE_COLORS = ["#5b4b8a", "#4a90c4", "#3d8b8b", "#8b7cb8"];

function SpecimenSharingSnapshot({
  data,
  periodLabel,
  emphasized = false,
  provenance = "ytd",
}: {
  data: SpecimenSharing;
  periodLabel: string;
  emphasized?: boolean;
  provenance?: DataProvenance;
}) {
  const requestorPie = sortPieSlicesAscending(data.requestorTypes);
  return (
    <div
      className={
        emphasized
          ? "rounded-xl border border-cpbh-purple/25 bg-cpbh-purple/5 p-4"
          : "rounded-xl border border-cpbh-mist bg-cpbh-mist/15 p-4"
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="# of Requests Received"
          value={data.requestsReceived}
          accent="navy"
          provenance={provenance}
        />
        <div className="metric-card border-l-4 border-l-cpbh-sky h-full flex flex-col">
          <p className="text-cpbh-purple text-xs font-medium uppercase tracking-wide mb-2">
            Requestor Types
          </p>
          <div className="flex-1 min-h-[120px]">
            <ClientMountGate
              skeleton={
                <div
                  className="w-full min-h-[120px] rounded-lg bg-cpbh-mist/40 animate-pulse"
                  style={{ height: 120 }}
                  aria-hidden
                />
              }
            >
              <div className="w-full min-h-[120px]" style={{ height: 120 }}>
                <ResponsiveContainer
                  width="100%"
                  height={120}
                  initialDimension={{ width: 280, height: 120 }}
                >
                  <PieChart>
                    <Pie
                      data={requestorPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="label"
                      isAnimationActive={false}
                      {...PIE_START_AT_TWELVE}
                    >
                      {requestorPie.map((_, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e8e4f3",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px" }} iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ClientMountGate>
          </div>
        </div>
        <MetricCard
          label="# of Requests Fulfilled"
          value={data.requestsFulfilled}
          accent="purple"
          provenance={provenance}
        />
      </div>
      {data.plasma && (
        <PlasmaRequestSummaryBlock
          data={data.plasma}
          periodLabel={periodLabel}
          provenance={provenance}
        />
      )}
    </div>
  );
}

interface SpecimenSharingSectionProps {
  data: SpecimenSharing;
  reportingPeriodLabel: string;
  title: string;
  /** Where the requests came from. Shown first under the heading. */
  source?: string;
  /** Last date this count actually contains. Shown second. */
  through?: string;
  /** Coverage dates, shown after source and through. */
  dateLine: string;
  subtitle?: string;
  deckSlideId?: string;
  deckCaption?: string;
  countProvenance?: DataProvenance;
}

export default function SpecimenSharingSection({
  data,
  reportingPeriodLabel,
  title,
  source,
  through,
  dateLine,
  subtitle = "RedCap request tracking · year to date",
  deckSlideId,
  deckCaption,
  countProvenance = "ytd",
}: SpecimenSharingSectionProps) {
  return (
    <div
      className="dashboard-card"
      data-deck-slide={deckSlideId}
      data-deck-caption={deckSlideId ? (deckCaption ?? title) : undefined}
    >
      <div className="mb-4 text-center">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          {title}
        </h3>
        {source ? (
          <p className="text-cpbh-navy text-sm mt-1">Source: {source}</p>
        ) : null}
        {through ? (
          <p className="text-cpbh-navy text-sm">Through: {through}</p>
        ) : null}
        <p className="text-cpbh-navy/70 text-sm mt-1">{dateLine}</p>
        <p className="text-cpbh-navy/55 text-xs mt-1">{subtitle}</p>
      </div>
      <SpecimenSharingSnapshot
        data={data}
        periodLabel={reportingPeriodLabel}
        emphasized
        provenance={countProvenance}
      />
    </div>
  );
}

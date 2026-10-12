"use client";

import { useMemo, useState } from "react";
import {
  DASHBOARD_METRIC_AUDIT,
  TIER_LABELS,
  type MetricTier,
} from "@/data/dashboardMetricAudit";

const TIERS: MetricTier[] = ["verified", "estimated", "plan", "mock", "tbd"];

export default function DashboardMetricAudit() {
  const [filter, setFilter] = useState<MetricTier | "all">("all");

  const rows = useMemo(
    () =>
      filter === "all"
        ? DASHBOARD_METRIC_AUDIT
        : DASHBOARD_METRIC_AUDIT.filter((r) => r.tier === filter),
    [filter],
  );

  const counts = useMemo(() => {
    const c: Record<MetricTier, number> = {
      verified: 0,
      estimated: 0,
      plan: 0,
      mock: 0,
      tbd: 0,
    };
    for (const row of DASHBOARD_METRIC_AUDIT) c[row.tier]++;
    return c;
  }, []);

  return (
    <div className="space-y-6">
      <div className="dashboard-card bg-cpbh-mist/25 border-cpbh-purple/20">
        <h2 className="font-display text-lg font-semibold text-cpbh-navy mb-2">
          How to use these checks
        </h2>
        <ul className="text-sm text-cpbh-navy/75 space-y-1.5 list-disc pl-5">
          <li>
            Built after programmatic listening sessions with core leads—each row
            ties a dashboard number to a file or RPPR reference for mid-cycle and
            RPPR alignment.
          </li>
          <li>
            <strong>Verified</strong> = matches export or RPPR ·{" "}
            <strong>Placeholder / TBD</strong> = not on the dashboard as a final
            number yet.
          </li>
          <li>
            <strong>Black</strong> on the dashboard = calendar year-to-date ·{" "}
            <strong>Green</strong> = last RPPR period ·{" "}
            <strong>Red</strong> = no data ·{" "}
            <strong>Red</strong> = zero or not in the current export.
          </li>
          <li>
            <strong>Grant plan</strong> toggles show renewal targets—not RPPR
            actuals. <strong>Registry Summaries</strong> is raw CSV detail, not
            headline RPPR counts.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`All (${DASHBOARD_METRIC_AUDIT.length})`}
        />
        {TIERS.map((tier) => (
          <FilterChip
            key={tier}
            active={filter === tier}
            onClick={() => setFilter(tier)}
            label={`${TIER_LABELS[tier].label} (${counts[tier]})`}
            className={TIER_LABELS[tier].className}
          />
        ))}
      </div>

      <div className="dashboard-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr>
                <th className="table-header text-left">Section</th>
                <th className="table-header text-left">Metric</th>
                <th className="table-header text-left">Dashboard value</th>
                <th className="table-header text-left">Tier</th>
                <th className="table-header text-left">Source</th>
                <th className="table-header text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const tier = TIER_LABELS[row.tier];
                return (
                  <tr
                    key={`${row.section}-${row.metric}`}
                    className={i % 2 === 1 ? "table-row-alt" : ""}
                  >
                    <td className="table-cell text-cpbh-navy/70 whitespace-nowrap">
                      {row.section}
                    </td>
                    <td className="table-cell font-medium">{row.metric}</td>
                    <td className="table-cell font-mono text-xs">{row.value}</td>
                    <td className="table-cell">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${tier.className}`}
                        title={tier.description}
                      >
                        {tier.label}
                      </span>
                    </td>
                    <td className="table-cell text-cpbh-navy/80 text-xs leading-snug max-w-[220px]">
                      {row.source}
                    </td>
                    <td className="table-cell text-cpbh-navy/55 text-xs leading-snug max-w-[240px]">
                      {row.notes ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? `ring-2 ring-cpbh-purple/40 ${className || "bg-white border-cpbh-mist"}`
          : "bg-white/80 border-cpbh-mist text-cpbh-navy/60 hover:border-cpbh-purple/30"
      }`}
    >
      {label}
    </button>
  );
}

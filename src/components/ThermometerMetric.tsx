import type { DataProvenance } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";
import TargetProgressLabel from "@/components/TargetProgressLabel";

interface ThermometerMetricProps {
  label: string;
  current: number;
  target: number;
  targetNote?: string;
  provenance?: DataProvenance;
  accent?: "navy" | "purple" | "teal" | "sky";
  compact?: boolean;
}

const ACCENT_FILL: Record<NonNullable<ThermometerMetricProps["accent"]>, string> = {
  navy: "bg-cpbh-navy",
  purple: "bg-cpbh-purple",
  teal: "bg-cpbh-teal",
  sky: "bg-cpbh-sky",
};

const ACCENT_BORDER: Record<NonNullable<ThermometerMetricProps["accent"]>, string> = {
  navy: "border-l-cpbh-navy",
  purple: "border-l-cpbh-purple",
  teal: "border-l-cpbh-teal",
  sky: "border-l-cpbh-sky",
};

export default function ThermometerMetric({
  label,
  current,
  target,
  targetNote,
  provenance = "ytd",
  accent = "teal",
  compact = false,
}: ThermometerMetricProps) {
  const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const valueClass = metricValueClass(provenance, current);
  const fillClass = ACCENT_FILL[accent];
  const borderClass = ACCENT_BORDER[accent];
  const tubeHeight = compact ? "h-28" : "h-36";

  return (
    <div className={`metric-card border-l-4 ${borderClass}`}>
      <p className="text-cpbh-purple text-xs font-medium uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="flex items-end gap-4">
        <div className={`relative w-8 shrink-0 ${tubeHeight}`}>
          <div className="absolute inset-x-1 top-0 bottom-3 rounded-t-full rounded-b-sm bg-cpbh-mist overflow-hidden">
            <div
              className={`absolute inset-x-0 bottom-0 rounded-t-sm transition-all ${fillClass}`}
              style={{ height: `${pct}%` }}
            />
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-6 h-6 rounded-full border-2 border-white shadow-sm ${fillClass}`}
            style={{ opacity: pct > 0 ? 1 : 0.35 }}
          />
        </div>
        <div className="flex-1 min-w-0 pb-1">
          <p className={`font-semibold ${compact ? "text-2xl" : "text-3xl"} ${valueClass}`}>
            {current}
            <span className={`${compact ? "text-lg" : "text-xl"} font-normal opacity-50 ml-1`}>
              / {target}
            </span>
          </p>
          <TargetProgressLabel pct={pct} valueClass={valueClass} variant="annual" />
          {targetNote && (
            <p className="text-xs text-cpbh-navy/55 mt-2 leading-snug">{targetNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}

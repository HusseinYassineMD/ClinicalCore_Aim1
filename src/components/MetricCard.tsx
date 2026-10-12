import type { DataProvenance } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: "navy" | "purple" | "teal" | "sky" | "amber" | "orange" | "rose" | "emerald";
  provenance?: DataProvenance;
}

const accentColors = {
  navy: "border-l-cpbh-navy",
  purple: "border-l-cpbh-purple",
  teal: "border-l-cpbh-teal",
  sky: "border-l-cpbh-sky",
  amber: "border-l-amber-500",
  orange: "border-l-orange-500",
  rose: "border-l-rose-500",
  emerald: "border-l-emerald-600",
};

export default function MetricCard({
  label,
  value,
  sublabel,
  accent = "navy",
  provenance = "ytd",
}: MetricCardProps) {
  return (
    <div className={`metric-card h-full border-l-4 ${accentColors[accent]}`}>
      <p className="text-cpbh-purple text-xs font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={`text-3xl font-semibold ${metricValueClass(provenance, value)}`}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-cpbh-navy/60 text-sm mt-1">{sublabel}</p>
      )}
    </div>
  );
}

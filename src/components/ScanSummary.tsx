import type { ScanData } from "@/types/aim1";
import MetricCard from "./MetricCard";
import { metricValueClass } from "@/lib/metricValueClass";

interface ScanSummaryProps {
  scans: ScanData;
  claritiScans: ScanData;
  periodLabel?: string;
}

const MODALITY_ACCENTS = {
  MRI: "sky",
  "Amyloid PET": "purple",
  "Tau PET": "teal",
} as const;

function ScanProgressBlock({
  title,
  data,
  periodLabel,
}: {
  title: string;
  data: ScanData;
  periodLabel?: string;
}) {
  const ytdSublabel = periodLabel ? `Participants · ${periodLabel}` : undefined;
  const modalities = [
    { label: "MRI" as const, count: data.mri },
    { label: "Amyloid PET" as const, count: data.amyloidPet },
    { label: "Tau PET" as const, count: data.tauPet },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <h3 className="font-display text-2xl md:text-3xl font-semibold text-cpbh-navy">
          {title}
        </h3>
        <div className="inline-flex items-center gap-2 bg-cpbh-mist/60 rounded-lg px-4 py-2 text-sm shrink-0">
          <span className="text-cpbh-navy/60">Target:</span>
          <span
            className={`font-semibold ${metricValueClass(data.targetProvenance ?? "unknown", data.target)}`}
          >
            {data.target}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modalities.map((mod) => (
          <MetricCard
            key={mod.label}
            label={mod.label}
            value={mod.count}
            accent={MODALITY_ACCENTS[mod.label]}
            provenance={data.provenance ?? "ytd"}
            sublabel={ytdSublabel}
          />
        ))}
      </div>
    </div>
  );
}

export default function ScanSummary({
  scans,
  claritiScans,
  periodLabel,
}: ScanSummaryProps) {
  return (
    <div className="dashboard-card space-y-8">
      <ScanProgressBlock
        title="SCAN Progress"
        data={scans}
        periodLabel={periodLabel}
      />
      <div className="border-t border-cpbh-mist pt-8">
        <ScanProgressBlock
          title="CLARITi Progress"
          data={claritiScans}
          periodLabel={periodLabel}
        />
      </div>
    </div>
  );
}

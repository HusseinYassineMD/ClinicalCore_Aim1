import type { ScanData } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";

interface ScanSummaryProps {
  scans: ScanData;
  claritiScans: ScanData;
  periodLabel?: string;
  sourceNote?: string;
}

const MODALITY_ACCENTS = {
  MRI: "border-l-cpbh-sky",
  "Amyloid PET": "border-l-cpbh-purple",
  "Tau PET": "border-l-cpbh-teal",
} as const;

function ScanProgressBlock({
  title,
  data,
  gapNotes,
}: {
  title: string;
  data: ScanData;
  gapNotes: string[];
}) {
  const provenance = data.provenance ?? "unknown";
  const modalities = [
    { label: "MRI" as const, count: data.mri },
    { label: "Amyloid PET" as const, count: data.amyloidPet },
    { label: "Tau PET" as const, count: data.tauPet },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-center gap-3 mb-3 text-center">
        <h3 className="font-display text-2xl md:text-3xl font-semibold metric-value-unknown">
          {title}
        </h3>
        <div className="inline-flex items-center gap-2 bg-cpbh-mist/60 border border-cpbh-mist rounded-lg px-4 py-2 text-sm shrink-0">
          <span className="text-cpbh-navy/60">Target:</span>
          <span
            className={`font-semibold ${metricValueClass(
              data.targetProvenance ?? "ytd",
              data.target,
            )}`}
          >
            {data.target}
          </span>
        </div>
      </div>

      {gapNotes.length > 0 ? (
        <div className="text-center space-y-1 mb-6 max-w-3xl mx-auto">
          {gapNotes.map((note) => (
            <p key={note} className="text-sm metric-value-unknown leading-snug">
              {note}
            </p>
          ))}
        </div>
      ) : (
        <div className="mb-6" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modalities.map((mod) => (
          <div
            key={mod.label}
            className={`metric-card h-full border-l-4 ${MODALITY_ACCENTS[mod.label]}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide mb-1 metric-value-unknown">
              {mod.label}
            </p>
            <p
              className={`text-3xl font-semibold ${metricValueClass(provenance, mod.count)}`}
            >
              {mod.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScanSummary({
  scans,
  claritiScans,
}: ScanSummaryProps & { sourceNote?: string }) {
  return (
    <div className="dashboard-card space-y-8 border-red-200/70">
      <ScanProgressBlock
        title="USC Scan Progress"
        data={scans}
        gapNotes={[
          "Red gap · source: externally hosted file from Diana (pending).",
        ]}
      />
      <div className="border-t border-red-100 pt-8">
        <ScanProgressBlock
          title="CLARiTI Progress"
          data={claritiScans}
          gapNotes={[
            "Red gap · source: externally hosted file from Diana (pending).",
          ]}
        />
      </div>
    </div>
  );
}

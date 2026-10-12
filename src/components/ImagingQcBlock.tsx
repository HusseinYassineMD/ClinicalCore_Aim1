import type { ImagingQcMetrics } from "@/types/aim1";
import MetricCard from "./MetricCard";

interface ImagingQcBlockProps {
  data: ImagingQcMetrics;
}

export default function ImagingQcBlock({ data }: ImagingQcBlockProps) {
  const metrics = [
    { label: "Amyloid PET QC", value: data.amyloidPetQc, accent: "purple" as const },
    { label: "Tau PET QC", value: data.tauPetQc, accent: "teal" as const },
    { label: "Structural MRI QC", value: data.structuralMriQc, accent: "sky" as const },
    {
      label: "New Raw PET Datasets (PPG cohort)",
      value: data.newRawPetDatasets,
      accent: "navy" as const,
    },
  ];

  return (
    <div className="dashboard-card">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          RPPR Imaging QC (cumulative)
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-1 leading-snug">
          Green · last RPPR Imaging Core (B2) · cumulative QC narrative. Not in
          James Integrated Imaging Availability — no calendar YTD QC counts in the
          Sept 2026 harmonized package. YTD scan progress is SCAN / CLARiTI
          participant cards above.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            accent={item.accent}
            provenance="prior"
          />
        ))}
      </div>
    </div>
  );
}

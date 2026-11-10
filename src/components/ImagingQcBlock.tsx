import type { ImagingQcMetrics } from "@/types/aim1";
import MetricCard from "./MetricCard";
import { HeadingLead } from "@/components/HeadingLead";
import { lastRpprReportingPeriod } from "@/data/reportingPeriodLegend";

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
      <div className="mb-4 text-center">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          RPPR Imaging QC (cumulative)
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source="Last RPPR · Imaging Core (B2) · rpprMetrics.json"
          through={lastRpprReportingPeriod}
        >
          Green · cumulative QC narrative. Not in James Integrated Imaging
          Availability. YTD scan progress is the SCAN / CLARiTI participant
          cards above, from v1.5.4.
        </HeadingLead>
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

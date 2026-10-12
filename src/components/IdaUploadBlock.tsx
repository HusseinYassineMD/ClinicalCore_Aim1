import type { IdaImagingUploadMetrics } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";
import MetricCard from "./MetricCard";

interface IdaUploadBlockProps {
  data: IdaImagingUploadMetrics;
}

export default function IdaUploadBlock({ data }: IdaUploadBlockProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          IDA Imaging Uploads
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-1 leading-snug">
          Green · last RPPR Data Core (B2) · cumulative LONI IDA upload totals.
          Not in James harmonized export — no YTD upload log in the data
          package. YTD imaging headcount uses study_date in Integrated Imaging
          longitudinal files (above).
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="MR Participants"
          value={formatInteger(data.mrParticipants)}
          accent="purple"
          provenance="prior"
        />
        <MetricCard
          label="MR Scans Uploaded"
          value={formatInteger(data.mrScans)}
          accent="navy"
          provenance="prior"
        />
        <MetricCard
          label="PET Participants"
          value={formatInteger(data.petParticipants)}
          accent="sky"
          provenance="prior"
        />
        <MetricCard
          label="PET Scans Uploaded"
          value={formatInteger(data.petScans)}
          accent="teal"
          provenance="prior"
        />
      </div>
    </div>
  );
}

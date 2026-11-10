import type { IdaImagingUploadMetrics } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";
import MetricCard from "./MetricCard";
import { HeadingLead } from "@/components/HeadingLead";
import { lastRpprReportingPeriod } from "@/data/reportingPeriodLegend";

interface IdaUploadBlockProps {
  data: IdaImagingUploadMetrics;
}

export default function IdaUploadBlock({ data }: IdaUploadBlockProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-4 text-center">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          IDA Imaging Uploads
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source="Last RPPR · Data Core (B2) · rpprMetrics.json"
          through={lastRpprReportingPeriod}
        >
          Green · cumulative LONI IDA upload totals. Not in James harmonized
          export. YTD imaging headcount uses study_date in Integrated Imaging
          longitudinal files (above).
        </HeadingLead>
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

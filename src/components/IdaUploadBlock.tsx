import type { IdaImagingUploadMetrics } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";
import { formatScopeDate } from "@/lib/formatScopeDate";
import MetricCard from "./MetricCard";
import { HeadingLead } from "@/components/HeadingLead";
import idaImages from "@/data/jamesIdaImageIds.json";

interface IdaUploadBlockProps {
  data: IdaImagingUploadMetrics;
}

export default function IdaUploadBlock({ data }: IdaUploadBlockProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-4 text-center">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          IDA image IDs
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source={`James Wang · ${idaImages.sourceFile} · ${idaImages.imageIdField} in ${idaImages.searchFiles.join(" and ")}`}
          through={formatScopeDate(idaImages.throughDate)}
        >
          Pink · unique IDA image IDs in the November 6 package. The two search
          files do not share an image_id. {idaImages.excludedSearchFile} has
          participants and no image_id, so those rows are not in this count.
          The old RPPR sentence was {formatInteger(data.mrParticipants)} MR
          participants, {formatInteger(data.mrScans)} MR scans,{" "}
          {formatInteger(data.petParticipants)} PET participants, and{" "}
          {formatInteger(data.petScans)} PET scans. That sentence is a different
          count.
        </HeadingLead>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="MR participants"
          value={formatInteger(idaImages.mriParticipants)}
          accent="purple"
          provenance="span"
        />
        <MetricCard
          label="MR IDA image IDs"
          value={formatInteger(idaImages.mriImageIds)}
          accent="navy"
          provenance="span"
        />
        <MetricCard
          label="PET participants"
          value={formatInteger(idaImages.petParticipants)}
          accent="sky"
          provenance="span"
        />
        <MetricCard
          label="PET IDA image IDs"
          value={formatInteger(idaImages.petImageIds)}
          accent="teal"
          provenance="span"
        />
      </div>
    </div>
  );
}

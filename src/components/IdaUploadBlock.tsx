import type { IdaImagingUploadMetrics } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";
import { formatScopeDate } from "@/lib/formatScopeDate";
import MetricCard from "./MetricCard";
import { HeadingLead } from "@/components/HeadingLead";
import idaImages from "@/data/jamesIdaImageIds.json";

interface IdaUploadBlockProps {
  data: IdaImagingUploadMetrics;
}

export default function IdaUploadBlock({ data: _data }: IdaUploadBlockProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-4 text-center">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          IDA image IDs
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source={`James Wang · ${idaImages.sourceFile} · ${idaImages.imageIdField} · received ${formatScopeDate(idaImages.receivedDate)}`}
          through={`${formatScopeDate(idaImages.throughDate)} · cumulative`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="MR participants"
          value={formatInteger(idaImages.mriParticipants)}
          sublabel={`${formatScopeDate(idaImages.mriStudyStart)} – ${formatScopeDate(idaImages.mriStudyEnd)}`}
          accent="purple"
          provenance="ytd"
        />
        <MetricCard
          label="MR IDA image IDs"
          value={formatInteger(idaImages.mriImageIds)}
          sublabel={`${formatScopeDate(idaImages.mriStudyStart)} – ${formatScopeDate(idaImages.mriStudyEnd)}`}
          accent="navy"
          provenance="ytd"
        />
        <MetricCard
          label="PET participants"
          value={formatInteger(idaImages.petParticipants)}
          sublabel={`${formatScopeDate(idaImages.petStudyStart)} – ${formatScopeDate(idaImages.petStudyEnd)}`}
          accent="sky"
          provenance="ytd"
        />
        <MetricCard
          label="PET IDA image IDs"
          value={formatInteger(idaImages.petImageIds)}
          sublabel={`${formatScopeDate(idaImages.petStudyStart)} – ${formatScopeDate(idaImages.petStudyEnd)}`}
          accent="teal"
          provenance="ytd"
        />
      </div>
    </div>
  );
}

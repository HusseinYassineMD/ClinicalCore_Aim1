import type { ImagingQcMetrics } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";
import { formatScopeDate } from "@/lib/formatScopeDate";
import MetricCard from "./MetricCard";
import { HeadingLead } from "@/components/HeadingLead";
import qcLists from "@/data/jamesImagingQcLists.json";

interface ImagingQcBlockProps {
  data: ImagingQcMetrics;
}

export default function ImagingQcBlock({ data: _data }: ImagingQcBlockProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-4 text-center">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          Imaging QC lists
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source={`James Wang · ${qcLists.sourceFile} · received ${formatScopeDate(qcLists.receivedDate)}`}
          through={`${formatScopeDate(qcLists.countThrough)} · cumulative`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Amyloid PET QC"
          value={qcLists.amyloidPetQc}
          sublabel={`${formatScopeDate(qcLists.amyloidStudyStart)} – ${formatScopeDate(qcLists.amyloidStudyEnd)}`}
          accent="purple"
          provenance="ytd"
        />
        <MetricCard
          label="Tau PET QC"
          value={qcLists.tauPetQc}
          sublabel={`${formatScopeDate(qcLists.tauStudyStart)} – ${formatScopeDate(qcLists.tauStudyEnd)}`}
          accent="teal"
          provenance="ytd"
        />
        <MetricCard
          label="Structural MRI QC sessions"
          value={qcLists.structuralMriSessions}
          sublabel={`${formatScopeDate(qcLists.structuralStudyStart)} – ${formatScopeDate(qcLists.structuralStudyEnd)}`}
          accent="sky"
          provenance="ytd"
        />
        <MetricCard
          label="Structural MRI QC series"
          value={formatInteger(qcLists.structuralMriSeries)}
          sublabel={`${formatScopeDate(qcLists.structuralStudyStart)} – ${formatScopeDate(qcLists.structuralStudyEnd)}`}
          accent="navy"
          provenance="ytd"
        />
      </div>
    </div>
  );
}

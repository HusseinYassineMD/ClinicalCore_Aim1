import type { ImagingQcMetrics } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";
import { formatScopeDate } from "@/lib/formatScopeDate";
import MetricCard from "./MetricCard";
import { HeadingLead } from "@/components/HeadingLead";
import qcLists from "@/data/jamesImagingQcLists.json";

interface ImagingQcBlockProps {
  data: ImagingQcMetrics;
}

export default function ImagingQcBlock({ data }: ImagingQcBlockProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-4 text-center">
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          Imaging QC lists
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source={`James Wang · ${qcLists.sourceFile} · ${qcLists.petQcFile} · ${qcLists.mriQcFiles.join(" · ")} · MRI field ${qcLists.mriQcField}`}
          through={formatScopeDate(qcLists.countThrough)}
        >
          Black · study_date on or before October 16, 2026. The MRI QC list has
          later study dates, and those rows are excluded. Amyloid and tau are
          participants on the CLARiTI PET QC list. Structural MRI is conventional
          MRI on the two MRI QC lists: {qcLists.structuralMriSessions} sessions,{" "}
          {formatInteger(qcLists.structuralMriSeries)} series,{" "}
          {qcLists.structuralMriParticipants} participants. The SCAN PET dashboard
          has {qcLists.scanPetFailedQc} tau rows marked Failed QC, and those are
          not in the tau count. There is no new-raw-PET variable. The old RPPR
          sentence was amyloid {data.amyloidPetQc}, tau {data.tauPetQc},
          structural MRI {data.structuralMriQc}, and {data.newRawPetDatasets} new
          raw PET datasets. That sentence is a different count.
        </HeadingLead>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Amyloid PET QC"
          value={qcLists.amyloidPetQc}
          accent="purple"
          provenance="ytd"
        />
        <MetricCard
          label="Tau PET QC"
          value={qcLists.tauPetQc}
          accent="teal"
          provenance="ytd"
        />
        <MetricCard
          label="Structural MRI QC sessions"
          value={qcLists.structuralMriSessions}
          accent="sky"
          provenance="ytd"
        />
        <MetricCard
          label="Structural MRI QC series"
          value={formatInteger(qcLists.structuralMriSeries)}
          accent="navy"
          provenance="ytd"
        />
      </div>
    </div>
  );
}

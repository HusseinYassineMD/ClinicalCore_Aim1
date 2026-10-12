"use client";

import type {
  ClaritiScans,
  ScanData,
  ImagingQcMetrics,
  IntegratedImagingStudySummary,
  ImagingYtdMeta,
  IdaImagingUploadMetrics,
  SectionDataStatus,
} from "@/types/aim1";
import ScanSummary from "./ScanSummary";
import IntegratedImagingSummaryBlock from "./IntegratedImagingSummaryBlock";
import ImagingQcBlock from "./ImagingQcBlock";
import IdaUploadBlock from "./IdaUploadBlock";
import DataStatusStickyNote from "./DataStatusStickyNote";
import IdaUploadConfirmationStickyNote from "./IdaUploadConfirmationStickyNote";
import StickyNoteRail, { SectionWithNotes } from "./StickyNoteRail";
import SectionScopeBracket from "@/components/SectionScopeBracket";

interface ImagingSectionProps {
  claritiScans: ClaritiScans;
  scans: ScanData;
  imagingYtdIntegratedStudySummary?: IntegratedImagingStudySummary;
  imagingYtdMeta?: ImagingYtdMeta;
  imagingQc: ImagingQcMetrics;
  idaImagingUpload: IdaImagingUploadMetrics;
  sectionDataStatus: SectionDataStatus;
}

export default function ImagingSection({
  claritiScans,
  scans,
  imagingYtdIntegratedStudySummary,
  imagingYtdMeta,
  imagingQc,
  idaImagingUpload,
  sectionDataStatus,
}: ImagingSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy">
        <span className="block">Imaging</span>
        <SectionScopeBracket sectionId="imaging" className="block mt-2" />
      </h2>

      <SectionWithNotes
        notes={
          <StickyNoteRail>
            <DataStatusStickyNote
              heading="Scan Progress"
              {...sectionDataStatus.imagingScanProgress}
            />
            <DataStatusStickyNote
              heading="Integrated imaging"
              {...sectionDataStatus.imagingQc}
            />
          </StickyNoteRail>
        }
      >
        <div className="space-y-6">
          <div
            data-deck-slide="imaging-scan-summary"
            data-deck-caption="Imaging · SCAN & CLARiTI scan progress (YTD)"
          >
            <ScanSummary
              scans={scans}
              claritiScans={claritiScans}
              periodLabel={imagingYtdMeta?.periodLabel}
            />
          </div>
          {imagingYtdIntegratedStudySummary ? (
            <div
              data-deck-slide="imaging-integrated-summary"
              data-deck-caption="Imaging · study-wide YTD availability"
            >
              <IntegratedImagingSummaryBlock
                ytdStudySummary={imagingYtdIntegratedStudySummary}
                ytdMeta={imagingYtdMeta}
              />
            </div>
          ) : null}
          <div
            data-deck-slide="imaging-qc"
            data-deck-caption="Imaging · QC metrics"
          >
            <ImagingQcBlock data={imagingQc} />
          </div>
        </div>
      </SectionWithNotes>

      <SectionWithNotes
        notes={
          <StickyNoteRail>
            <DataStatusStickyNote
              heading="IDA Uploads"
              {...sectionDataStatus.idaImagingUpload}
            />
            <IdaUploadConfirmationStickyNote />
          </StickyNoteRail>
        }
      >
        <div
          data-deck-slide="imaging-ida-uploads"
          data-deck-caption="Imaging · IDA upload status"
        >
          <IdaUploadBlock data={idaImagingUpload} />
        </div>
      </SectionWithNotes>
    </section>
  );
}

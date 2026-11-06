"use client";

import type {
  SampleCounts,
  BiofluidCollectionEntry,
  BiomarkerCoreSampleProcessingData,
  BiomarkerResults,
  DataProvenance,
  SectionDataStatus,
} from "@/types/aim1";
import MetricCard from "./MetricCard";
import BiofluidCollectionBlock from "./BiofluidCollectionBlock";
import BiomarkerCoreSampleProcessingBlock from "./BiomarkerCoreSampleProcessingBlock";
import BiomarkerRenewalStickyNote from "./BiomarkerRenewalStickyNote";
import DataStatusStickyNote from "./DataStatusStickyNote";
import SectionScopeBracket from "@/components/SectionScopeBracket";
import StickyNoteRail, { SectionWithNotes } from "./StickyNoteRail";
import { packageYtd, siteReportingWindow } from "@/data/siteReporting";
import { formatScopeDate } from "@/lib/formatScopeDate";

interface BiomarkersSectionProps {
  samples: SampleCounts;
  samplesProvenance?: Partial<Record<keyof SampleCounts, DataProvenance>>;
  biofluidCollection: BiofluidCollectionEntry[];
  biomarkerCoreSampleProcessing: BiomarkerCoreSampleProcessingData;
  biomarkers: BiomarkerResults;
  plasmaNcradProvenance?: DataProvenance;
  sectionDataStatus: SectionDataStatus;
}

export default function BiomarkersSection({
  samples,
  samplesProvenance,
  biofluidCollection,
  biomarkerCoreSampleProcessing,
  biomarkers,
  plasmaNcradProvenance = "unknown",
  sectionDataStatus,
}: BiomarkersSectionProps) {
  const ncradProvenance = plasmaNcradProvenance;
  const jamesPacket = packageYtd?.biomarkers;
  const ncradCountStart = jamesPacket?.collectionCoverageStart;
  const ncradCountEnd = jamesPacket?.collectionCoverageEnd;
  const packetStart = jamesPacket?.packetCollectionStart;
  const packetEnd = jamesPacket?.packetCollectionEnd;
  const plasmaBiomarkers = [
    {
      label: "Plasma Biomarker — NCRAD Aβ40",
      value: biomarkers.ab40,
      accent: "navy" as const,
    },
    {
      label: "Plasma Biomarker — NCRAD Aβ42",
      value: biomarkers.ab42,
      accent: "purple" as const,
    },
    { label: "GFAP", value: biomarkers.gfap, accent: "teal" as const },
    { label: "NfL", value: biomarkers.nfl, accent: "sky" as const },
    { label: "ptau217", value: biomarkers.ptau217, accent: "navy" as const },
  ];

  return (
    <section className="space-y-6">
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy text-center">
        <span className="block">Biomarkers</span>
        <SectionScopeBracket
          sectionId="biomarkers"
          className="block mt-2 max-w-3xl mx-auto"
        />
      </h2>

      <SectionWithNotes
        notes={
          <StickyNoteRail>
            <DataStatusStickyNote
              heading="Biofluid Collection"
              {...sectionDataStatus.biofluidCollection}
            />
            <DataStatusStickyNote
              heading="Biomarker Core processing"
              {...sectionDataStatus.biomarkerCoreSampleProcessing}
            />
            <DataStatusStickyNote
              heading="NCRAD & Samples"
              {...sectionDataStatus.biomarkersSamplesAndNcrad}
            />
            <BiomarkerRenewalStickyNote />
          </StickyNoteRail>
        }
      >
        <div className="space-y-6">
          <div
            data-deck-slide="biomarkers-biofluid-collection"
            data-deck-caption="Biomarkers · biofluid collection"
          >
            <BiofluidCollectionBlock data={biofluidCollection} />
          </div>

          <div
            data-deck-slide="biomarkers-core-sample-processing"
            data-deck-caption="Biomarkers · Biomarker Core sample processing (Abhay Sagare)"
          >
            <BiomarkerCoreSampleProcessingBlock
              data={biomarkerCoreSampleProcessing}
            />
          </div>

          <div
            className="dashboard-card space-y-6 p-8"
            data-deck-slide="biomarkers-samples-ncrad-lab"
            data-deck-caption="Biomarkers · samples and NCRAD plasma"
          >
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <MetricCard
                  label="PBMC Samples"
                  value={samples.pbmc}
                  accent="teal"
                  provenance={samplesProvenance?.pbmc ?? "prior"}
                  sublabel="Stopped for now. Separate procedure. Not in REDCap or BST. The number is the last RPPR inventory count."
                />
              </div>
            </div>
            <p className="text-cpbh-navy/60 text-sm text-center max-w-3xl mx-auto leading-relaxed">
              Black · hard cutoff {formatScopeDate(siteReportingWindow.endDate)}.
              JamesDataPacket, November 5, 2026 (v1.1.2), from James Wang. NCRAD
              plasma counts are collections inside that cutoff:{" "}
              {formatScopeDate(ncradCountStart)} – {formatScopeDate(ncradCountEnd)}.
              The packet’s full collection-date range is{" "}
              {formatScopeDate(packetStart)} – {formatScopeDate(packetEnd)}.
              NCRAD Flywheel update {formatScopeDate(jamesPacket?.ncradFlywheelUpdate)}.
            </p>
            <p className="text-cpbh-navy/55 text-xs text-center max-w-3xl mx-auto leading-relaxed">
              Source: {jamesPacket?.sourcePath ?? jamesPacket?.sourceFile}. Rows
              are counted only when collection_date is on or before{" "}
              {formatScopeDate(siteReportingWindow.endDate)}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plasmaBiomarkers.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value ?? "—"}
                  accent={item.accent}
                  provenance={ncradProvenance}
                />
              ))}
            </div>
          </div>

        </div>
      </SectionWithNotes>
    </section>
  );
}

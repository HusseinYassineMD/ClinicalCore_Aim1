"use client";

import type {
  SampleCounts,
  BiofluidCollectionEntry,
  BiomarkerResearchEntry,
  BiomarkerResults,
  DataProvenance,
  SectionDataStatus,
} from "@/types/aim1";
import MetricCard from "./MetricCard";
import BiofluidCollectionBlock from "./BiofluidCollectionBlock";
import BiomarkerRenewalStickyNote from "./BiomarkerRenewalStickyNote";
import BiomarkerResearchBlock from "./BiomarkerResearchBlock";
import DataStatusStickyNote from "./DataStatusStickyNote";
import SectionScopeBracket from "@/components/SectionScopeBracket";
import StickyNoteRail, { SectionWithNotes } from "./StickyNoteRail";

interface BiomarkersSectionProps {
  samples: SampleCounts;
  samplesProvenance?: Partial<Record<keyof SampleCounts, DataProvenance>>;
  biofluidCollection: BiofluidCollectionEntry[];
  biomarkerResearch: BiomarkerResearchEntry[];
  biomarkers: BiomarkerResults;
  plasmaNcradProvenance?: DataProvenance;
  sectionDataStatus: SectionDataStatus;
}

function formatValue(value: number | null): string | number {
  return value ?? "—";
}

export default function BiomarkersSection({
  samples,
  samplesProvenance,
  biofluidCollection,
  biomarkerResearch,
  biomarkers,
  plasmaNcradProvenance = "unknown",
  sectionDataStatus,
}: BiomarkersSectionProps) {
  const ncradProvenance = plasmaNcradProvenance;
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

  const clinicalLabMetrics = [
    {
      label: "A1C values",
      value: formatValue(biomarkers.a1c),
      accent: "amber" as const,
    },
    {
      label: "LIPID VALUES",
      value: formatValue(biomarkers.lipid),
      accent: "orange" as const,
    },
    {
      label: "CREATININE VALUES",
      value: formatValue(biomarkers.creatinine),
      accent: "rose" as const,
    },
    {
      label: "BLOOD PRESSURE VALUES",
      value: formatValue(biomarkers.bloodPressure),
      accent: "emerald" as const,
    },
  ];

  return (
    <section className="space-y-6">
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy">
        <span className="block">Biomarkers</span>
        <SectionScopeBracket sectionId="biomarkers" className="block mt-2" />
      </h2>

      <SectionWithNotes
        notes={
          <StickyNoteRail>
            <DataStatusStickyNote
              heading="Biofluid Collection"
              {...sectionDataStatus.biofluidCollection}
            />
            <DataStatusStickyNote
              heading="NCRAD & Samples"
              {...sectionDataStatus.biomarkersSamplesAndNcrad}
            />
            <DataStatusStickyNote
              heading="Clinical Lab"
              {...sectionDataStatus.biomarkersClinicalLab}
            />
            <DataStatusStickyNote
              heading="Biomarker Research"
              {...sectionDataStatus.biomarkerResearch}
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
            className="dashboard-card space-y-6 p-8"
            data-deck-slide="biomarkers-samples-ncrad-lab"
            data-deck-caption="Biomarkers · samples, NCRAD plasma, clinical lab"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                label="PBMC Samples"
                value={samples.pbmc}
                accent="teal"
                provenance={samplesProvenance?.pbmc ?? "prior"}
                sublabel="RPPR inventory · not in James biospecimen package"
              />
              <MetricCard
                label="Buffy Coat Samples"
                value={samples.buffyCoat}
                accent="purple"
                provenance={samplesProvenance?.buffyCoat ?? "prior"}
                sublabel={
                  samplesProvenance?.buffyCoat === "ytd"
                    ? "YTD aliquots · USC_ADRC_Biospecimen_Availability_Long"
                    : "RPPR inventory · not in James biospecimen export"
                }
              />
              <MetricCard
                label="126 Plasma Samples"
                value={samples.plasma126}
                accent="navy"
                provenance={samplesProvenance?.plasma126 ?? "prior"}
                sublabel="RPPR 126-plasma line · distinct from inventory aliquots"
              />
            </div>
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
            <div className="border-t border-cpbh-mist pt-6">
              <h4 className="font-display text-base font-semibold text-cpbh-navy mb-4">
                Clinical Lab Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl bg-amber-50/50 border border-amber-100 p-4">
                {clinicalLabMetrics.map((item) => (
                  <MetricCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    accent={item.accent}
                    provenance="unknown"
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            data-deck-slide="biomarkers-research"
            data-deck-caption="Biomarkers · biomarker research studies"
          >
            <BiomarkerResearchBlock data={biomarkerResearch} />
          </div>
        </div>
      </SectionWithNotes>
    </section>
  );
}

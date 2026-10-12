import DashboardHeader from "@/components/DashboardHeader";
import DashboardNav from "@/components/DashboardNav";
import {
  DemographicsChartsHost,
  RegistryChartsHost,
} from "@/components/MetricsChartsHost";
import TopRegistryOverview from "@/components/TopRegistryOverview";
import DemographicsTableClient from "@/components/DemographicsTableClient";
import SectionLabel from "@/components/SectionLabel";
import BiomarkersSection from "@/components/BiomarkersSection";
import ImagingSection from "@/components/ImagingSection";
import RecSection from "@/components/RecSection";
import NeuropathAdditionalMetrics from "@/components/NeuropathAdditionalMetrics";
import BrsRpprTableBlock from "@/components/BrsRpprTableBlock";
import SpecimenSharingSection from "@/components/SpecimenSharingSection";
import DemographicsTableStickyNote from "@/components/DemographicsTableStickyNote";
import DashboardContactFooter from "@/components/DashboardContactFooter";
import DataStatusStickyNote from "@/components/DataStatusStickyNote";
import AutopsyEnrollmentConfirmationStickyNote from "@/components/AutopsyEnrollmentConfirmationStickyNote";
import EventAttendeesConfirmationStickyNote from "@/components/EventAttendeesConfirmationStickyNote";
import FulfilledConfirmationStickyNote from "@/components/FulfilledConfirmationStickyNote";
import StickyNoteRail, {
  SectionWithNotes,
} from "@/components/StickyNoteRail";
import OreOutreachBlock from "@/components/OreOutreachBlock";
import { aim1MockData } from "@/data/aim1MockData";
import SitePeriodStrip from "@/components/SitePeriodStrip";
import MetricsSectionNav from "@/components/MetricsSectionNav";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";
import { siteReportingWindow } from "@/data/siteReporting";

export default function DashboardPage() {
  const data = aim1MockData;

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        reportingPeriod={data.reportingPeriod}
        grantPeriod={data.grantPeriod}
        lastUpdated={data.lastUpdated}
      />
      <DashboardNav />
      <SitePeriodStrip />
      <MetricsSectionNav />

      <main className="flex-1 mx-auto w-full min-w-0 max-w-[90rem] px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-12">
        {/* 1. Recruitment + Table 1 */}
        <section id="recruitment" className="scroll-mt-32 space-y-6">
          <div id="deck-section-recruitment" className="space-y-6 mx-auto w-full max-w-none">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy text-center">
            Recruitment
          </h2>
          <div id="recruitment-charts" className="scroll-mt-32">
          <SectionWithNotes
            layoutMaxWidth="max-w-none"
            contentClassName="w-full max-w-none"
            notes={
              <StickyNoteRail>
                <DataStatusStickyNote
                  heading="Recruitment sources"
                  {...data.sectionDataStatus.recruitment}
                />
              </StickyNoteRail>
            }
          >
            <RegistryChartsHost
              skeleton={
                <div
                  className="w-full max-w-6xl mx-auto min-h-[520px] rounded-2xl border border-cpbh-mist bg-white/80 animate-pulse"
                  aria-hidden
                />
              }
            >
              <ChartErrorBoundary fallbackTitle="Recruitment charts could not load">
                <TopRegistryOverview data={data.topRegistry} />
              </ChartErrorBoundary>
            </RegistryChartsHost>
          </SectionWithNotes>
          </div>
          </div>

          <div id="demographics" className="scroll-mt-32">
            <SectionWithNotes
              layoutMaxWidth="max-w-none"
              contentClassName="w-full max-w-none"
              notes={
                <StickyNoteRail>
                  <DataStatusStickyNote
                    heading="Demographics"
                    {...data.sectionDataStatus.demographics}
                  />
                  <DemographicsTableStickyNote />
                </StickyNoteRail>
              }
            >
              <SectionLabel
                title="Demographics"
                subtitle={`Harmonized active cohort (N=569) · visit counts above are ${siteReportingWindow.label}`}
                variant="priority"
              />
              <DemographicsChartsHost
                skeleton={
                  <div
                    className="dashboard-card min-h-[640px] animate-pulse bg-cpbh-mist/30 rounded-2xl"
                    aria-busy
                    aria-label="Loading demographics charts"
                  />
                }
              >
                <DemographicsTableClient />
              </DemographicsChartsHost>
            </SectionWithNotes>
          </div>
        </section>

        {/* 2. Neuropathology */}
        <section id="neuropathology" className="scroll-mt-32 space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy text-center">
            Neuropathology
          </h2>
          <SectionWithNotes
            notes={
              <StickyNoteRail>
                <DataStatusStickyNote
                  heading="Neuropathology"
                  {...data.sectionDataStatus.neuropathology}
                />
                <AutopsyEnrollmentConfirmationStickyNote />
              </StickyNoteRail>
            }
          >
            <NeuropathAdditionalMetrics data={data.neuropath} />
            <BrsRpprTableBlock />
          </SectionWithNotes>
          <SectionWithNotes
            notes={
              <StickyNoteRail>
                <DataStatusStickyNote
                  heading="Tissue Inquiries"
                  {...data.sectionDataStatus.specimenSharingNeurobank}
                />
                <FulfilledConfirmationStickyNote />
              </StickyNoteRail>
            }
          >
            <SpecimenSharingSection
              title="Tissue Inquiries"
              data={data.neurobankSpecimenSharing}
              reportingPeriodLabel={data.specimenSharingReportingPeriodLabel}
              subtitle={`RedCap neurobank requests · year to date · ${data.specimenSharingReportingPeriodLabel}`}
              deckSlideId="neuropath-tissue-inquiries"
              deckCaption="Neuropathology · tissue inquiries (neurobank YTD)"
            />
          </SectionWithNotes>
        </section>

        {/* 3. ORE */}
        <section id="ore" className="scroll-mt-32 space-y-6">
          <SectionWithNotes
            notes={
              <StickyNoteRail>
                <DataStatusStickyNote
                  heading="ORE"
                  {...data.sectionDataStatus.oreOutreach}
                />
                <EventAttendeesConfirmationStickyNote />
              </StickyNoteRail>
            }
          >
            <OreOutreachBlock
              outreach={data.oreOutreach}
              engagement={data.oreEngagement}
            />
          </SectionWithNotes>
        </section>

        {/* 4. Biomarkers */}
        <section id="biomarkers" className="scroll-mt-32 space-y-6">
          <BiomarkersSection
            samples={data.samples}
            samplesProvenance={data.samplesProvenance}
            biofluidCollection={data.biofluidCollection}
            biomarkerResearch={data.biomarkerResearch}
            biomarkers={data.biomarkers}
            plasmaNcradProvenance={data.plasmaNcradProvenance}
            sectionDataStatus={data.sectionDataStatus}
          />
          <SectionWithNotes
            notes={
              <StickyNoteRail>
                <DataStatusStickyNote
                  heading="Biofluid Inquiries"
                  {...data.sectionDataStatus.specimenSharingBiofluids}
                />
                <FulfilledConfirmationStickyNote />
              </StickyNoteRail>
            }
          >
            <SpecimenSharingSection
              title="Biofluid Inquiries"
              data={data.biofluidSpecimenSharing}
              reportingPeriodLabel={data.specimenSharingReportingPeriodLabel}
              subtitle={`RedCap biofluid requests · year to date · ${data.specimenSharingReportingPeriodLabel}`}
              deckSlideId="biomarkers-biofluid-inquiries"
              deckCaption="Biomarkers · biofluid inquiries (RedCap YTD)"
            />
          </SectionWithNotes>
        </section>

        {/* 5. REC */}
        <div id="rec" className="scroll-mt-32">
        <SectionWithNotes
          notes={
            <StickyNoteRail>
              <DataStatusStickyNote
                heading="REC"
                {...data.sectionDataStatus.rec}
              />
            </StickyNoteRail>
          }
        >
          <RecSection data={data.rec} roster={data.recRoster} />
        </SectionWithNotes>
        </div>

        {/* 6. Imaging */}
        <div id="imaging" className="scroll-mt-32">
        <ImagingSection
          claritiScans={data.claritiScans}
          scans={data.scans}
          imagingYtdIntegratedStudySummary={data.imagingYtdIntegratedStudySummary}
          imagingYtdMeta={data.imagingYtdMeta}
          imagingQc={data.imagingQc}
          idaImagingUpload={data.idaImagingUpload}
          sectionDataStatus={data.sectionDataStatus}
        />
        </div>
      </main>

      <DashboardContactFooter />
    </div>
  );
}

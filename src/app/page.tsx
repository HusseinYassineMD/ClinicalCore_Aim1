import DashboardHeader from "@/components/DashboardHeader";
import DashboardNav from "@/components/DashboardNav";
import {
  DemographicsChartsHost,
  RegistryChartsHost,
} from "@/components/MetricsChartsHost";
import TopRegistryOverview from "@/components/TopRegistryOverview";
import { JamesUdsPacketBlock } from "@/components/JamesNovember6PacketBlocks";
import DemographicsTableClient from "@/components/DemographicsTableClient";
import AdminTableA7Biomarkers from "@/components/AdminTableA7Biomarkers";
import BiomarkersSection from "@/components/BiomarkersSection";
import ImagingSection from "@/components/ImagingSection";
import RecSection from "@/components/RecSection";
import NeuropathAdditionalMetrics from "@/components/NeuropathAdditionalMetrics";
import BrsRpprTableBlock from "@/components/BrsRpprTableBlock";
import SpecimenSharingSection from "@/components/SpecimenSharingSection";
import DemographicsTableStickyNote from "@/components/DemographicsTableStickyNote";
import DashboardContactFooter from "@/components/DashboardContactFooter";
import { sourceThroughText } from "@/components/HeadingLead";
import { lastRpprReportingPeriod } from "@/data/reportingPeriodLegend";
import DataStatusStickyNote from "@/components/DataStatusStickyNote";
import AutopsyEnrollmentConfirmationStickyNote from "@/components/AutopsyEnrollmentConfirmationStickyNote";
import FulfilledConfirmationStickyNote from "@/components/FulfilledConfirmationStickyNote";
import StickyNoteRail, {
  SectionWithNotes,
} from "@/components/StickyNoteRail";
import { aim1MockData } from "@/data/aim1MockData";
import redcapSpecimenSharing from "@/data/redcapSpecimenSharing.json";
import {
  biofluidRequestEarliestDate,
  biofluidRequestLatestDate,
  neurobankRequestEarliestDate,
  neurobankRequestFileLatestDate,
  neurobankRequestLatestDate,
  siteReportingWindow,
} from "@/data/siteReporting";
import { formatScopeDate } from "@/lib/formatScopeDate";
import SitePeriodStrip from "@/components/SitePeriodStrip";
import MetricsSectionNav from "@/components/MetricsSectionNav";
import SectionScopeBracket from "@/components/SectionScopeBracket";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";

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
        <section className="scroll-mt-32 space-y-6">
          <div id="deck-section-recruitment" className="space-y-6 mx-auto w-full max-w-none">
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
              <div className="mb-4 flex justify-center">
                <div className="dashboard-card w-full max-w-xs p-5 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-cpbh-navy/55">
                    Total ADRC
                  </p>
                  <p className="mt-1 text-4xl font-semibold metric-value-ytd">
                    {table1HarmonizedActiveSnapshot.meta.participantCount}
                  </p>
                  <p className="mt-2 text-xs leading-snug text-cpbh-navy/60">
                    {sourceThroughText(
                      table1HarmonizedActiveSnapshot.meta.source,
                      formatScopeDate(table1HarmonizedActiveSnapshot.meta.asOfDate),
                      "Black · active ADRC participants (UDS) as of October 16, 2026. Received November 10, 2026.",
                    )}
                  </p>
                </div>
              </div>
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

          <div id="recruitment" className="scroll-mt-32 space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy text-center">
            <span className="block">Recruitment</span>
            <SectionScopeBracket
              sectionId="recruitment"
              className="block mt-2 max-w-3xl mx-auto"
            />
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
          <JamesUdsPacketBlock />
          </div>
          </div>
          </div>

        </section>

        {/* 2. Neuropathology */}
        <section id="neuropathology" className="scroll-mt-32 space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy text-center">
            <span className="block">Neuropathology</span>
            <SectionScopeBracket
              sectionId="neuropathology"
              className="block mt-2 max-w-3xl mx-auto"
            />
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
              reportingPeriodLabel={siteReportingWindow.label}
              source={`REDCap · ${redcapSpecimenSharing.sources.neurobank}`}
              through={formatScopeDate(neurobankRequestLatestDate)}
              dateLine={`${formatScopeDate(siteReportingWindow.startDate)} – ${formatScopeDate(siteReportingWindow.endDate)} · last request ${formatScopeDate(neurobankRequestLatestDate)}`}
              subtitle={`REDCap pull ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}. Requests in this count run ${formatScopeDate(neurobankRequestEarliestDate)} – ${formatScopeDate(neurobankRequestLatestDate)}. The pull also has requests through ${formatScopeDate(neurobankRequestFileLatestDate)}, after this cutoff.`}
              countProvenance="ytd"
              deckSlideId="neuropath-tissue-inquiries"
              deckCaption="Neuropathology · tissue inquiries (neurobank YTD)"
            />
          </SectionWithNotes>
        </section>

        {/* 3. ORE */}
        <section id="ore" className="scroll-mt-32 space-y-4">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy text-center">
            Outreach, Recruitment, and Engagement
          </h2>
          <p className="text-center text-lg text-cpbh-navy/70">
            {sourceThroughText(
              "Last RPPR",
              lastRpprReportingPeriod,
              "N/A for this current period.",
            )}
          </p>
        </section>

        {/* 4. Biomarkers */}
        <section id="biomarkers" className="scroll-mt-32 space-y-6">
          <BiomarkersSection
            samples={data.samples}
            samplesProvenance={data.samplesProvenance}
            biofluidCollection={data.biofluidCollection}
            biomarkerCoreSampleProcessing={data.biomarkerCoreSampleProcessing}
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
              reportingPeriodLabel={siteReportingWindow.label}
              source={`REDCap · ${redcapSpecimenSharing.sources.biofluids}`}
              through={formatScopeDate(biofluidRequestLatestDate)}
              dateLine={`${formatScopeDate(siteReportingWindow.startDate)} – ${formatScopeDate(siteReportingWindow.endDate)} · last request ${formatScopeDate(biofluidRequestLatestDate)}`}
              subtitle={`REDCap pull ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}. Requests in this count run ${formatScopeDate(biofluidRequestEarliestDate)} – ${formatScopeDate(biofluidRequestLatestDate)}. Nothing in this pull is later than ${formatScopeDate(biofluidRequestLatestDate)}.`}
              countProvenance="ytd"
              deckSlideId="biomarkers-biofluid-inquiries"
              deckCaption="Biomarkers · biofluid inquiries (RedCap YTD)"
            />
          </SectionWithNotes>
          <AdminTableA7Biomarkers />
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

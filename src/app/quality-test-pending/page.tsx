import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";
import SitePeriodStrip from "@/components/SitePeriodStrip";
import IntegratedImagingSummaryBlock from "@/components/IntegratedImagingSummaryBlock";
import ImagingQcBlock from "@/components/ImagingQcBlock";
import IdaUploadBlock from "@/components/IdaUploadBlock";
import DataStatusStickyNote from "@/components/DataStatusStickyNote";
import IdaUploadConfirmationStickyNote from "@/components/IdaUploadConfirmationStickyNote";
import StickyNoteRail, { SectionWithNotes } from "@/components/StickyNoteRail";
import { aim1MockData } from "@/data/aim1MockData";

const INDEX_ITEMS = [
  {
    title: "Registries",
    detail: "Registry Summaries file index — review later.",
    href: "/registry-data",
  },
  {
    title: "Data checks",
    detail: "Metric checks & sources — review later.",
    href: "/data-sources",
  },
  {
    title: "Site-wide / study-wide availability",
    detail: "Moved off the main Metrics Imaging page for quality review.",
    href: "#imaging-study-wide",
  },
  {
    title: "QCs",
    detail: "Moved off the main Metrics Imaging page for quality review.",
    href: "#imaging-qc",
  },
  {
    title: "IDA imaging uploads",
    detail: "Moved off the main Metrics Imaging page for quality review.",
    href: "#imaging-ida-uploads",
  },
] as const;

export default function QualityTestPendingPage() {
  const data = aim1MockData;

  return (
    <div className="min-h-screen flex flex-col bg-cpbh-mist/15">
      <header className="bg-hero-pattern text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-cpbh-soft text-xs font-medium tracking-wide uppercase mb-2">
            USC ADRC · Quality test pending
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3">
            Quality test pending
          </h1>
          <p className="text-white/90 text-sm max-w-2xl leading-relaxed">
            Registries, data checks, and the imaging study-wide / QC / IDA blocks
            held for later review. These sections are no longer on the main
            Metrics Imaging page.
          </p>
        </div>
      </header>
      <DashboardNav />
      <SitePeriodStrip />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="dashboard-card border-red-200/80 bg-white space-y-4">
          <p className="text-sm metric-value-unknown font-medium">
            Pending quality review — open when ready.
          </p>
          <ul className="divide-y divide-cpbh-mist">
            {INDEX_ITEMS.map((item) => (
              <li key={item.title} className="py-4 first:pt-0 last:pb-0">
                <Link
                  href={item.href}
                  className="group block hover:bg-cpbh-mist/30 -mx-2 px-2 py-1 rounded-lg transition-colors"
                >
                  <span className="font-display text-lg font-semibold text-cpbh-navy group-hover:text-cpbh-purple">
                    {item.title}
                  </span>
                  <p className="text-sm text-cpbh-navy/65 mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {data.imagingYtdIntegratedStudySummary ? (
          <div
            id="imaging-study-wide"
            className="scroll-mt-28"
            data-deck-slide="imaging-integrated-summary"
            data-deck-caption="Quality pending · study-wide YTD availability"
          >
            <SectionWithNotes
              notes={
                <StickyNoteRail>
                  <DataStatusStickyNote
                    heading="Integrated imaging"
                    {...data.sectionDataStatus.imagingQc}
                  />
                </StickyNoteRail>
              }
            >
              <IntegratedImagingSummaryBlock
                ytdStudySummary={data.imagingYtdIntegratedStudySummary}
                ytdMeta={data.imagingYtdMeta}
              />
            </SectionWithNotes>
          </div>
        ) : null}

        <div
          id="imaging-qc"
          className="scroll-mt-28"
          data-deck-slide="imaging-qc"
          data-deck-caption="Quality pending · Imaging QC metrics"
        >
          <ImagingQcBlock data={data.imagingQc} />
        </div>

        <div
          id="imaging-ida-uploads"
          className="scroll-mt-28"
          data-deck-slide="imaging-ida-uploads"
          data-deck-caption="Quality pending · IDA upload status"
        >
          <SectionWithNotes
            notes={
              <StickyNoteRail>
                <DataStatusStickyNote
                  heading="IDA Uploads"
                  {...data.sectionDataStatus.idaImagingUpload}
                />
                <IdaUploadConfirmationStickyNote />
              </StickyNoteRail>
            }
          >
            <IdaUploadBlock data={data.idaImagingUpload} />
          </SectionWithNotes>
        </div>
      </main>
    </div>
  );
}

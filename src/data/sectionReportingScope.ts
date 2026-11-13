import rpprDataPackage from "@/data/rpprDataPackage.json";
import rpprDataPackageMeta from "@/data/rpprDataPackageMeta.json";
import redcapSpecimenSharing from "@/data/redcapSpecimenSharing.json";
import geneScreenYtd from "@/data/geneScreenYtd.json";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";
import table1Demographics from "@/data/table1Demographics.json";
import recMeetingAttendance from "@/data/recMeetingAttendance.json";
import recRoster from "@/data/recRoster.json";
import rpprMetrics from "@/data/rpprMetrics.json";
import type { RpprDataPackage } from "@/types/dataPackage";
import {
  biofluidRequestEarliestDate,
  biofluidRequestLatestDate,
  biomarkerLatestCollectionDate,
  neurobankRequestEarliestDate,
  neurobankRequestLatestDate,
  siteReportingWindow,
} from "@/data/siteReporting";
import { lastRpprReportingPeriod } from "@/data/reportingPeriodLegend";
import { formatScopeDate } from "@/lib/formatScopeDate";

const pkg = rpprDataPackage as RpprDataPackage;
const pkgMeta = rpprDataPackage as RpprDataPackage & {
  supplementReceivedAt?: string;
};
const ytd = pkg.reportingPeriodSummary!;
const supplementReceivedAt = pkgMeta.supplementReceivedAt;
const cov = ytd.dataCoverage ?? {};
const imagingCov = ytd.imaging?.dataCoverage ?? {};

export type SectionScopeId =
  | "recruitment"
  | "demographics"
  | "neuropathology"
  | "ore"
  | "biomarkers"
  | "rec"
  | "imaging";

export type SectionReportingScope = {
  id: SectionScopeId;
  navLabel: string;
  /** Shown in small brackets beside section titles */
  bracket: string;
  /** Extra lines in the presenter strip */
  bullets: string[];
};

const ytdLabel = siteReportingWindow.label;
const rpprPeriod = lastRpprReportingPeriod;
const rpprTable1Period = table1Demographics.meta.reportingPeriod;

function bracket(parts: string[]): string {
  return parts.filter(Boolean).join(" · ");
}

export const SECTION_REPORTING_SCOPES: SectionReportingScope[] = [
  {
    id: "demographics",
    navLabel: "Demographics",
    bracket: bracket([
      "black",
      "as of",
      formatScopeDate(table1HarmonizedActiveSnapshot.meta.asOfDate),
      `N=${table1HarmonizedActiveSnapshot.meta.participantCount}`,
    ]),
    bullets: [
      `Table 1 and the charts under it are black: Xinhui Wang, active ADRC participants (UDS) N=${table1HarmonizedActiveSnapshot.meta.participantCount} · as of ${formatScopeDate(table1HarmonizedActiveSnapshot.meta.asOfDate)}. Received November 10, 2026.`,
      `Recruitment UDS counts are black through ${formatScopeDate(cov.udsLatestVisitDate)}, the last visit in James’s file. Autopsy enrollment is 225, black, from Xinhui Wang as of October 16, 2026.`,
      `Old RPPR Table 1 workbook period, if cited: ${rpprTable1Period}. Those old RPPR numbers stay green.`,
    ],
  },
  {
    id: "recruitment",
    navLabel: "Recruitment",
    bracket: bracket([
      "UDS black",
      `last visit ${formatScopeDate(cov.udsLatestVisitDate)}`,
      "autopsy 225 black",
      "as of October 16, 2026",
    ]),
    bullets: [
      `UDS visit counts are black from James’s harmonized export. Last visit_date in that file: ${formatScopeDate(cov.udsLatestVisitDate)}. The reporting window is still ${ytdLabel}.`,
      `USC ADRC cumulative is all participants in James Wang's UDS file, pink, through the last visit. Active with UDS is 585, black: Xinhui Wang, active ADRC participants (UDS data) as of October 16, 2026. A UDS visit since 7/1/2025 in James's file is a different count.`,
      `Autopsy enrollment is 225, black. Source is Xinhui Wang, BRS table as of October 16, 2026, received November 10, 2026. Code book: race/ethnicity Hispanic 39, non-Hispanic White 143, African American 10, Asian 16, Others 17. sex Male 82, Female 143. APOE4 Yes 71, No 139, no genotype 15. James MAP Active 231 is a different count.`,
      `GeneScreen is pink: REDCap ${geneScreenYtd.sourceFile} · export ${formatScopeDate(geneScreenYtd.lastUpdated)}. That file stops October 7, 2026.`,
      `Green numbers are the old RPPR only (${rpprPeriod}).`,
    ],
  },
  {
    id: "neuropathology",
    navLabel: "Neuropathology",
    bracket: bracket([
      "225 black",
      "as of October 16, 2026",
    ]),
    bullets: [
      `Enrollment 225 is black. Source is Xinhui Wang, BRS table, January 1 through October 16, 2026, received November 10, 2026. New enrolled 5, withdrawal 1, died with autopsy 7, died without autopsy 1. The person list is the same 225.`,
      `Neurobank requests are black. ${formatScopeDate(siteReportingWindow.startDate)} – ${formatScopeDate(siteReportingWindow.endDate)}. Requests ${formatScopeDate(neurobankRequestEarliestDate)} – ${formatScopeDate(neurobankRequestLatestDate)} · ${redcapSpecimenSharing.sources.neurobank} · pulled ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}.`,
    ],
  },
  {
    id: "ore",
    navLabel: "ORE",
    bracket: bracket([
      "green",
      `RPPR ${rpprPeriod}`,
      "calendar 2026 YTD not wired",
    ]),
    bullets: [
      `Community events / attendees (green): rpprMetrics.json · ${rpprPeriod}.`,
      `Black calendar YTD outreach counts: pending harmonized export (dashboard shows 0 / TBD).`,
    ],
  },
  {
    id: "biomarkers",
    navLabel: "Biomarkers",
    bracket: bracket([
      "black",
      "Jan 1 – Sep 30, 2026",
      "Abhay Sagare",
    ]),
    bullets: [
      `NCRAD plasma is black. James Wang, November 5. Collections ${formatScopeDate(ytd.biomarkers.collectionCoverageStart)} – ${formatScopeDate(biomarkerLatestCollectionDate)}, inside ${formatScopeDate(siteReportingWindow.startDate)} – ${formatScopeDate(siteReportingWindow.endDate)}. No collection is dated January 1–5.`,
      "Biofluid Collection is black for January–September 2026. October stays pink: Abhay Sagare’s workbook is the latest packet, it is monthly and has no day, and October runs through October 31.",
      `Biofluid requests are black. ${formatScopeDate(siteReportingWindow.startDate)} – ${formatScopeDate(siteReportingWindow.endDate)}. Requests ${formatScopeDate(biofluidRequestEarliestDate)} – ${formatScopeDate(biofluidRequestLatestDate)} · ${redcapSpecimenSharing.sources.biofluids} · pulled ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}.`,
    ],
  },
  {
    id: "rec",
    navLabel: "REC",
    bracket: bracket([
      "roster tables",
      `sync ${formatScopeDate(recRoster.meta.syncedAt.slice(0, 10))}`,
      `speaker schedule as of ${formatScopeDate(siteReportingWindow.endDate)}`,
    ]),
    bullets: [
      `Scholars / faculty / programs: data/reference/rec CSVs · last sync ${recRoster.meta.syncedAt.replace("T", " ").replace("Z", " UTC")}.`,
      `Speaker series completed/scheduled: recSpeakerSeries.json · counts through dashboard end ${formatScopeDate(siteReportingWindow.endDate)}.`,
      `Zoom attendance: meeting-attendance.csv · ${recMeetingAttendance.summary.sessionCount} sessions synced (avg ${recMeetingAttendance.summary.avgAttendees}).`,
    ],
  },
  {
    id: "imaging",
    navLabel: "Imaging",
    bracket: bracket([
      "black",
      "v1.5.4",
      `studies through ${formatScopeDate(imagingCov.imagingLatestStudyDate)}`,
    ]),
    bullets: [
      `SCAN, CLARiTI, and the study-wide table are black: Integrated Imaging v1.5.4 · filter window ${ytdLabel} · latest study_date ${formatScopeDate(imagingCov.imagingLatestStudyDate)}.`,
      `Integrated study summary is black: v1.5.4, latest study_date ${formatScopeDate(imagingCov.imagingLatestStudyDate)}.`,
      `Imaging QC lists are cumulative, received November 6, 2026: amyloid Apr 17–Oct 15, 2026 · tau Apr 27–Oct 13, 2026 · structural MRI Jan 4, 2021–Oct 16, 2026.`,
      `IDA image IDs are cumulative, received November 6, 2026: MR Jan 1, 2000–Oct 16, 2026 · PET Oct 6, 2006–Aug 20, 2026.`,
    ],
  },
];

export function sectionReportingScope(id: SectionScopeId): SectionReportingScope {
  const row = SECTION_REPORTING_SCOPES.find((s) => s.id === id);
  if (!row) throw new Error(`Unknown section scope: ${id}`);
  return row;
}

/** Header strip + validation cross-check timestamp */
export const dashboardValidationSnapshot = {
  validatedChecks: 94,
  packageAggregated: rpprDataPackageMeta.lastAggregated,
  harmonizedPackageReceived: pkg.receivedAt,
  harmonizedSupplement: supplementReceivedAt,
  eacCountWindowEnd: siteReportingWindow.endDate,
  dataCoverage: cov,
};

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
  brsLatestActivityDate,
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
      "pink",
      "snapshot",
      formatScopeDate(table1HarmonizedActiveSnapshot.meta.asOfDate),
      "stops before Oct 16",
    ]),
    bullets: [
      `Table 1 and the charts under it are pink: harmonized active cohort N=${table1HarmonizedActiveSnapshot.meta.participantCount} · as of ${formatScopeDate(table1HarmonizedActiveSnapshot.meta.asOfDate)}. That snapshot stops before October 16.`,
      `Recruitment UDS counts are black through ${formatScopeDate(cov.udsLatestVisitDate)}, the last visit in James’s file. Autopsy enrollment 226 is pink: Xinhui’s MAP pull is October 7, 2026.`,
      `Old RPPR Table 1 workbook period, if cited: ${rpprTable1Period}. Those old RPPR numbers stay green.`,
    ],
  },
  {
    id: "recruitment",
    navLabel: "Recruitment",
    bracket: bracket([
      "UDS black",
      `last visit ${formatScopeDate(cov.udsLatestVisitDate)}`,
      "autopsy 226 pink",
      "Nov 6 counts black",
      `last consent ${formatScopeDate(brsLatestActivityDate)}`,
    ]),
    bullets: [
      `UDS visit counts are black from James’s harmonized export. Last visit_date in that file: ${formatScopeDate(cov.udsLatestVisitDate)}. The reporting window is still ${ytdLabel}.`,
      `Autopsy enrollment 226 stays pink. Source is Xinhui Wang, MAP pull Oct 7, 2026. That packet stops before October 16. New consents, ethnicity, and APOE are black from the Nov 6 MAP pull. Last consent ${formatScopeDate(brsLatestActivityDate)}. Last death and last autopsy performed date are Oct 4, 2026.`,
      `GeneScreen is pink: REDCap ${geneScreenYtd.sourceFile} · export ${formatScopeDate(geneScreenYtd.lastUpdated)}. That file stops October 7, 2026.`,
      `Green numbers are the old RPPR only (${rpprPeriod}).`,
    ],
  },
  {
    id: "neuropathology",
    navLabel: "Neuropathology",
    bracket: bracket([
      "226 pink",
      "Nov 6 window counts black",
      `last consent ${formatScopeDate(brsLatestActivityDate)}`,
    ]),
    bullets: [
      `Enrollment 226 is pink. Source is Xinhui Wang, MAP pull Oct 7, 2026. That packet stops before October 16. New consents 5 and autopsy performed dates 7 are black from MAPDatabase-BRSCohort_DATA_LABELS_2026-11-06_1248.csv, pulled Nov 6, 2026. Last consent ${formatScopeDate(brsLatestActivityDate)}. Last death and last autopsy performed date Oct 4, 2026.`,
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
      `RPPR Imaging QC and IDA stay green: old RPPR · ${rpprPeriod}.`,
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

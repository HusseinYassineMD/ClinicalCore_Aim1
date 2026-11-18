import rpprDataPackage from "@/data/rpprDataPackage.json";
import rpprDataPackageMeta from "@/data/rpprDataPackageMeta.json";
import redcapSpecimenSharing from "@/data/redcapSpecimenSharing.json";
import geneScreenYtd from "@/data/geneScreenYtd.json";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";
import table1Demographics from "@/data/table1Demographics.json";
import recMeetingAttendance from "@/data/recMeetingAttendance.json";
import recRoster from "@/data/recRoster.json";
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
      `Table 1 and the charts under it are black: Xinhui Wang, active ADRC participants (UDS) N=${table1HarmonizedActiveSnapshot.meta.participantCount} · as of ${formatScopeDate(table1HarmonizedActiveSnapshot.meta.asOfDate)}. Received November 13, 2026. Hispanic 180, White 217, Black 58, Asian 93, Other/unknown 37.`,
      `NIH Inclusion Enrollment Report 555816 (Clinical Core UDS, not BRS): ethnicity-first tables from Dr. Chui FINAL PDF 3/22/2026. Cumulative Actual active excluding minimal contact as of 12/31/2025 N=260 (green). Planned N=645 (pink). BRS excluding minimal is a different count (115).`,
      `GeneScreen Inclusion Enrollment (ethnicity first) from REDCap Ethnicity/Race NACC/NIH names: Complete? N=739 through October 7, 2026 (pink) · consent YTD N=55 in ${ytdLabel} (pink; export stops before October 16). No live REDCap API — CSV export only.`,
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
      `Autopsy enrollment is 225, black. Source is Xinhui Wang, BRS table as of October 16, 2026, received November 13, 2026. Code book: race/ethnicity Hispanic 46, non-Hispanic White 143, African American 10, Asian 16, Others 10. sex Male 82, Female 143. APOE4 Yes 71, No 139, no genotype 15. James MAP Active 231 is a different count.`,
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
      `Enrollment 225 is black. Source is Xinhui Wang, BRS table, January 1 through October 16, 2026, received November 13, 2026. New enrolled 5, withdrawal 1, died with autopsy 7, died without autopsy 1. The person list is the same 225.`,
      `Neurobank requests are black. ${formatScopeDate(siteReportingWindow.startDate)} – ${formatScopeDate(siteReportingWindow.endDate)}. Requests ${formatScopeDate(neurobankRequestEarliestDate)} – ${formatScopeDate(neurobankRequestLatestDate)} · ${redcapSpecimenSharing.sources.neurobank} · pulled ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}.`,
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
      `speaker schedule as of ${formatScopeDate(recMeetingAttendance.sessions.at(-1)?.sessionDate ?? siteReportingWindow.endDate)}`,
    ]),
    bullets: [
      `Scholars / faculty / programs: data/reference/rec CSVs · last sync ${recRoster.meta.syncedAt.replace("T", " ").replace("Z", " UTC")}.`,
      `Speaker series completed/scheduled: recSpeakerSeries.json · counts through the latest Zoom attendance date ${formatScopeDate(recMeetingAttendance.sessions.at(-1)?.sessionDate ?? siteReportingWindow.endDate)}.`,
      `Zoom attendance is pink: meeting-attendance.csv from Sahar Nikkhah Bahrami’s Zoom report through ${formatScopeDate(recMeetingAttendance.sessions.at(-1)?.sessionDate ?? siteReportingWindow.endDate)} · ${recMeetingAttendance.summary.sessionCount} sessions · avg ${recMeetingAttendance.summary.avgAttendees} · total ${recMeetingAttendance.summary.totalAttendees}. The October 16 session is not in that report.`,
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
      `USC SCAN Progress is black from USCSCANParticipantTr_DATA_LABELS_2026-11-17_1414.csv (Complete baseline MRI / Amyloid PET / Tau PET with effective scan date in ${ytdLabel}). Target 24 black. CLARiTI progress remains a red gap pending Diana’s file / CLARiTI REDCap (target 36 black).`,
      `Study-wide availability, QC lists, and IDA image IDs are only on Quality test pending (removed from the main Metrics Imaging page).`,
      `Integrated study summary (Quality test pending): v1.5.4 YTD · SCAN 17/16/1/2 · CLARiTI 21/11/19/18 · USC ADRC 42/42/0/0.`,
      `Imaging QC lists (Quality test pending) are cumulative, received November 6, 2026: amyloid 19 · tau 18 · structural MRI 38 sessions / 966 series.`,
      `IDA image IDs (Quality test pending) are cumulative, received November 6, 2026: MR 10,259 participants / 143,034 IDs · PET 6,775 / 13,573.`,
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

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
  biofluidRequestLatestDate,
  biomarkerLatestCollectionDate,
  biospecimenLatestCollectionDate,
  biospecimenLatestSpecimenDate,
  brsLatestActivityDate,
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
    id: "recruitment",
    navLabel: "Recruitment",
    bracket: bracket([
      "UDS black",
      `last visit ${formatScopeDate(cov.udsLatestVisitDate)}`,
      "autopsy green",
      `last MAP date ${formatScopeDate(brsLatestActivityDate)}`,
    ]),
    bullets: [
      `UDS visit counts are black from James’s harmonized export. Last visit_date in that file: ${formatScopeDate(cov.udsLatestVisitDate)}. The reporting window is still ${ytdLabel}.`,
      `Autopsy enrollment stays green. Last MAP date ${formatScopeDate(brsLatestActivityDate)} (autopsy consent). MAP pull 2026-10-07.`,
      `GeneScreen black: REDCap ${geneScreenYtd.sourceFile} · ${geneScreenYtd.reportingPeriodLabel} · export ${formatScopeDate(geneScreenYtd.lastUpdated)}.`,
      `Green registry headlines (668 / 573 / 231): last RPPR ${rpprPeriod}.`,
    ],
  },
  {
    id: "demographics",
    navLabel: "Demographics",
    bracket: bracket([
      "green",
      "old RPPR Table 1",
      `snapshot ${formatScopeDate(table1HarmonizedActiveSnapshot.meta.asOfDate)}`,
    ]),
    bullets: [
      `Table 1 and the charts under it are green: old RPPR harmonized active cohort N=${table1HarmonizedActiveSnapshot.meta.participantCount} · as of ${formatScopeDate(table1HarmonizedActiveSnapshot.meta.asOfDate)} (not the visit-date window).`,
      `Recruitment UDS counts are black through ${formatScopeDate(cov.udsLatestVisitDate)}, the last visit in James’s file. Autopsy enrollment stays green through ${formatScopeDate(brsLatestActivityDate)}.`,
      `Green RPPR Table 1 workbook period (if cited elsewhere): ${rpprTable1Period}.`,
    ],
  },
  {
    id: "neuropathology",
    navLabel: "Neuropathology",
    bracket: bracket([
      "green",
      `last MAP date ${formatScopeDate(brsLatestActivityDate)}`,
      "MAP pull Oct 7, 2026",
    ]),
    bullets: [
      `BRS counts are green. Last autopsy consent in ${ytd.brsAutopsy.sourceFile}: ${formatScopeDate(brsLatestActivityDate)}. Supplement ${formatScopeDate(ytd.brsAutopsy.supplementReceivedAt)}.`,
      `Neurobank requests are green. Last Survey Timestamp ${formatScopeDate(neurobankRequestLatestDate)} · ${redcapSpecimenSharing.sources.neurobank} · pulled ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}.`,
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
      "green",
      `plasma collections through ${formatScopeDate(biomarkerLatestCollectionDate)}`,
      `inventory through ${formatScopeDate(biospecimenLatestSpecimenDate)}`,
    ]),
    bullets: [
      `NCRAD plasma is green. Integrated_Biomarkers_Long last collection_date ${formatScopeDate(biomarkerLatestCollectionDate)}.`,
      `Biospecimen inventory is green. Last specimen_date ${formatScopeDate(biospecimenLatestSpecimenDate)}. Last collection_date ${formatScopeDate(biospecimenLatestCollectionDate)}.`,
      `Biofluid requests are green. Last Survey Timestamp ${formatScopeDate(biofluidRequestLatestDate)} · ${redcapSpecimenSharing.sources.biofluids} · pulled ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}.`,
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
      "green",
      "source ends before 10/16/2026",
      `studies through ${formatScopeDate(imagingCov.imagingLatestStudyDate)}`,
    ]),
    bullets: [
      `SCAN, CLARiTI, and the study-wide table are green: Integrated Imaging longitudinal · filter window ${ytdLabel} · latest study_date ${formatScopeDate(imagingCov.imagingLatestStudyDate)}.`,
      `Integrated study summary (green / cumulative): package-wide NACC-verified subjects — not calendar YTD.`,
      `RPPR Imaging QC & IDA (green): ${rpprPeriod} · rpprMetrics.json.`,
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

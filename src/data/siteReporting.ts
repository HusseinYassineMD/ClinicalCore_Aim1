import rpprDataPackage from "@/data/rpprDataPackage.json";
import type { RpprDataPackage, ReportingPeriodSummary } from "@/types/dataPackage";

const pkg = rpprDataPackage as RpprDataPackage;

export const packageYtd: ReportingPeriodSummary | undefined =
  pkg.reportingPeriodSummary;

export const siteReportingWindow = {
  label: packageYtd?.label ?? "Year to date",
  startDate: packageYtd?.startDate ?? "2026-01-01",
  endDate: packageYtd?.endDate ?? "",
  /** Short phrase for chart captions and subtitles */
  periodCaption: packageYtd
    ? `year to date · ${packageYtd.label}`
    : "year to date",
};

export const packageSnapshotTotals = pkg.totals;

/** Participants with ≥1 harmonized UDS visit in the calendar YTD window (Data Core export). */
export const ytdParticipantsWithVisit =
  packageYtd?.udsClinical.uniqueParticipantsWithVisit ??
  packageYtd?.udsClinical.totalVisitRecords;

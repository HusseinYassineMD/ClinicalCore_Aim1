import rpprDataPackage from "@/data/rpprDataPackage.json";
import type { RpprDataPackage, ReportingPeriodSummary } from "@/types/dataPackage";

const pkg = rpprDataPackage as RpprDataPackage;

export const packageYtd: ReportingPeriodSummary | undefined =
  pkg.reportingPeriodSummary;

/** Last visit_date in the harmonized UDS file currently loaded. */
export const udsLatestVisitDate =
  packageYtd?.dataCoverage?.udsLatestVisitDate ?? null;

/** Last collection_date in Integrated_Biomarkers_Long (NCRAD plasma rows). */
export const biomarkerLatestCollectionDate =
  packageYtd?.dataCoverage?.biomarkerLatestCollectionDate ?? null;

/** Latest of autopsy consent, autopsy performed, death, and termination in the Oct 9 MAP BRS file. */
export const brsLatestActivityDate =
  packageYtd?.dataCoverage?.brsLatestActivityDate ?? null;

/** Field maxima in MAPDatabase-BRSCohort_DATA_2026-10-09_1005.csv. */
export const brsLatestConsentDate = "2026-10-05";
export const brsLatestAutopsyPerformedDate = "2026-10-04";
export const brsLatestDeathDate = "2026-10-04";

/**
 * USC_ADRC_Biospecimen_Availability_Long_v1.0.1.csv.
 * Inventory rows count if collection_date or specimen_date falls in the window.
 * collection_date ends 2026-01-26; specimen_date ends 2026-09-23.
 */
export const biospecimenLatestSpecimenDate = "2026-09-23";
export const biospecimenLatestCollectionDate = "2026-01-26";

/**
 * First and last Survey Timestamp counted inside Jan 1–Oct 16, 2026.
 * REDCap Submitted Requests pull dated 2026-11-06.
 */
export const biofluidRequestEarliestDate = "2026-01-05";
export const biofluidRequestLatestDate = "2026-10-05";
export const neurobankRequestEarliestDate = "2026-01-07";
export const neurobankRequestLatestDate = "2026-10-16";
/** Latest Survey Timestamp in the tissue pull, including rows after the cutoff. */
export const neurobankRequestFileLatestDate = "2026-11-05";

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

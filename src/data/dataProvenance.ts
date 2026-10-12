import { lastRpprReportingPeriod } from "@/data/reportingPeriodLegend";
import { siteReportingWindow } from "@/data/siteReporting";

/** Primary contacts for harmonized exports and dashboard curation. */
export const DATA_OWNERS_DISPLAY = "James Wang & Xinhui Wang";

/** Board- and NIH-facing labels for USC ADRC Data Core deliverables (not internal nicknames). */
export const DATA_CORE = {
  team: "USC ADRC Data Core",
  harmonizedExport: "USC ADRC harmonized data export",
  rpprPackage: "USC ADRC RPPR Data Package",
  imagingProduct: "USC ADRC Integrated Imaging Availability",
} as const;

export const HARMONIZED_FILES = {
  udsLongitudinal: "UDS_longitudinal_harmonized.csv",
  biomarkersLong: "Integrated_Biomarkers_Long_v1.0.5.csv",
  brsCohort: "MAPDatabase-BRSCohort_DATA (REDCap export)",
  biospecimenLong: "USC_ADRC_Biospecimen_Availability_Long_v1.0.1.csv",
  imagingLongitudinal: "USC_ADRC_Imaging_Availability_Longitudinal",
  imagingStudySummary: "USC_ADRC_Imaging_Availability_Study_Summary",
} as const;

export const JAMES_SUPPLEMENT_RECEIVED_AT = "2026-10-09";

/** RPPR / dashboard YTD locked with EAC (Dr. Chui). */
export const EAC_RPPR_LOCK_LABEL = "1/1/2026 – 10/13/2026";

/** Year-to-date window tied to aggregated JSON (Jan 1 → snapshot end). */
export function ytdWindowPhrase(): string {
  return siteReportingWindow.label;
}

/** Standard provenance line for black (YTD) metrics from Data Core CSVs. */
export function dataCoreYtdSource(detail: string): string {
  return `${ytdWindowPhrase()} · ${DATA_CORE.harmonizedExport} · ${detail}`;
}

/** When a metric is not yet available in the harmonized export. */
export const PENDING_IN_HARMONIZED_EXPORT =
  "Not yet in harmonized Data Core export";

/** Dashboard black numbers: rpprDataPackage.json YTD + data/redcap CSV aggregates only. */
export const PACKAGE_JSON = "src/data/rpprDataPackage.json";

/** In-package snapshot rows (black) but not calendar YTD (e.g. Study_Summary). */
export const PACKAGE_SNAPSHOT_NOTE =
  "James RPPR Data Package JSON · export snapshot · not calendar YTD";

/** Red: no data in package or last RPPR extract for this metric. */
export const NOT_IN_DATA_PACKAGE = "No data available — shown red";

export const LAST_RPPR_SOURCE = `Last RPPR reporting period · ${lastRpprReportingPeriod} · rpprMetrics.json`;

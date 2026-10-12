export interface DataPackageFileMeta {
  path: string;
  fileName: string;
  rowCount: number;
  columnCount: number;
  fileSizeMb: number;
  fileModified: string;
  relativeDir?: string;
  description?: string;
  fileType: string;
  columns?: string[];
  columnTruncated?: boolean;
}

export interface DataPackageDictionaryEntry {
  variable: string;
  description: string;
}

export interface FieldPresenceSummary {
  nonBlank: number;
  blank: number;
  uniqueValues?: number;
  tokenTotal?: number;
}

export interface NumericFieldSummary {
  count: number;
  min?: number;
  max?: number;
  mean?: number;
  sum?: number;
}

export interface FieldCoverageSummary {
  fieldBreakdowns?: Record<string, Record<string, number>>;
  numericSummaries?: Record<string, NumericFieldSummary>;
  fieldPresence?: Record<string, FieldPresenceSummary>;
}

export interface SourceCatalogEntry {
  sourceFamily: string;
  sourceDataset: string;
  specimenType: string;
  biomarker: string;
  atnvDomain: string;
  nMeasurements: number;
  nSubjects: number;
  firstCollectionDate: string;
  latestCollectionDate: string;
}

export interface DataPackagePipeline {
  id: string;
  title: string;
  description: string;
  status: "available" | "pending";
  reportPath: string | null;
  summary: Record<string, unknown>;
  files: DataPackageFileMeta[];
  dashboardLinks: string[];
}

export interface ReportingPeriodReference {
  newInitialEvaluations?: number;
  followUpInPerson?: number;
  followUpRemote?: number;
  newAutopsyConsents?: number;
  autopsiesPerformed?: number;
}

export interface ReportingPeriodDataCoverage {
  packageReceivedAt?: string;
  udsLatestVisitDate?: string | null;
  biomarkerLatestCollectionDate?: string | null;
  brsLatestActivityDate?: string | null;
  milestonesLatestVisitDate?: string | null;
}

export interface ImagingStudyPeriodCounts {
  studyLabel: string;
  participantsWithMri: number;
  participantsWithAmyloidPet: number;
  participantsWithTauPet: number;
  definitions: Record<string, string>;
}

export interface ImagingReportingPeriod {
  packageVersion: string;
  /** Only rows/subjects passing this James QC flag are counted on the dashboard. */
  identityFilter?: string;
  sourceFiles: { longitudinal: string; studySubjectLevel: string };
  dateField: string;
  scanStudy: ImagingStudyPeriodCounts;
  claritiStudy: ImagingStudyPeriodCounts;
  note: string;
  dataCoverage?: { imagingLatestStudyDate?: string | null };
}

export interface IntegratedImagingStudySummaryRow {
  study: string;
  uniqueSubjects: number;
  naccRegistryVerifiedSubjects: number;
  subjectsWithMri: number;
  subjectsWithAmyloidPet: number;
  subjectsWithTauPet: number;
}

export interface IntegratedImagingStudySummary {
  packageVersion: string;
  sourceFile?: string;
  sourceFiles?: { longitudinal: string; studySubjectLevel: string };
  dateField?: string;
  note: string;
  studies: IntegratedImagingStudySummaryRow[];
}

export interface ReportingPeriodSummary {
  label: string;
  startDate: string;
  endDate: string;
  note: string;
  periodKind?: string;
  packageReceivedAt?: string;
  dataCoverage?: ReportingPeriodDataCoverage;
  udsClinical: {
    sourceFile: string;
    dateFields: string[];
    newInitialEvaluations: number;
    followUpInPerson: number;
    followUpRemote: number;
    totalVisitRecords: number;
    uniqueParticipantsWithVisit: number;
    definitions: Record<string, string>;
    rpprReference?: ReportingPeriodReference;
    newInitialEvaluationBreakdown?: {
      byRaceEthnicity: { label: string; count: number }[];
      byApoeGenotype: { label: string; count: number }[];
      byReferralSource: { label: string; count: number }[];
      sources: {
        raceEthnicity: string;
        apoeGenotype: string;
        referralSource: string;
      };
    };
  };
  biomarkers: {
    sourceFile: string;
    dateField: string;
    subjectsWithCollection: number;
    subjectsWithPlasmaCollection: number;
    subjectsWithCsfCollection: number;
    measurementRows: number;
    plasmaMeasurementRows: number;
    csfMeasurementRows: number;
    /** YTD plasma row counts by harmonized biomarker label (James integrated long file). */
    ncradPlasmaMeasurements?: {
      ab40: number;
      ab42: number;
      gfap: number;
      nfl: number;
      ptau217: number;
    };
    definitions: Record<string, string>;
  };
  imaging?: ImagingReportingPeriod;
  imagingIntegratedStudySummary?: IntegratedImagingStudySummary;
  imagingYtdIntegratedStudySummary?: IntegratedImagingStudySummary;
  brsAutopsy: {
    sourceFile: string;
    supplementReceivedAt?: string;
    newAutopsyConsents: number;
    autopsiesPerformed: number;
    activeEnrolled?: number;
    withdrawalsYtd?: number;
    withAutopsyCaseNumber?: number;
    cumulativeAutopsiesFlagged?: number;
    definitions: Record<string, string>;
    rpprReference?: ReportingPeriodReference;
  };
  /** James biospecimen availability supplement — collection inventory, not assay rows. */
  biospecimenInventory?: {
    sourceFile: string;
    supplementReceivedAt?: string;
    dateFields: string[];
    byComponentYtd: Record<
      string,
      { participants: number; aliquots: number; collectionRows: number }
    >;
    byComponentCumulative: Record<
      string,
      { participants: number; aliquots: number; collectionRows: number }
    >;
    definitions: Record<string, string>;
  };
}

export interface ReportingPeriodAdditionalMetric {
  label: string;
  value: number;
  participants?: number;
}

export interface ReportingPeriodAdditionalDomain {
  id: string;
  title: string;
  sourceFile: string;
  dateHint: string;
  metrics: ReportingPeriodAdditionalMetric[];
  footnote?: string;
}

export interface ReportingPeriodAdditionalSummary {
  label: string;
  startDate: string;
  endDate: string;
  note: string;
  domains: ReportingPeriodAdditionalDomain[];
}

export interface RpprDataPackage {
  packageLabel: string;
  receivedAt: string;
  lastAggregated: string;
  reportingPeriodSummary?: ReportingPeriodSummary;
  reportingPeriodAdditional?: ReportingPeriodAdditionalSummary;
  note: string;
  inventory: {
    totalFiles: number;
    csvFiles: number;
    htmlReports: number;
    totalCsvRows: number;
    totalSizeMb: number;
    files: DataPackageFileMeta[];
  };
  pipelines: DataPackagePipeline[];
  totals: {
    files: number;
    csvFiles: number;
    htmlReports: number;
    udsSubjects: number;
    udsVisitRecords: number;
    milestoneRecords: number;
    brsRecords: number;
    apoeRecords: number;
    biomarkerSubjects: number;
    biomarkerMeasurements: number;
    totalCsvRows: number;
  };
}

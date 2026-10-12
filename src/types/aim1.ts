export interface DemographicGroup {
  n: string;
  ageMeanSD: string;
  eduMedianIQR: string;
  male: string;
  mocaMeanSD: string;
  cdr0: string;
  cdr05: string;
  cdrGe1: string;
  apoeE4Percent: string;
  followUpMeanSD: string;
}

export interface CatchmentBreakdown {
  area: string;
  count: number;
}

export interface SourceCount {
  source: string;
  count: number;
}

export interface CatchmentDemo {
  label: string;
  count: number;
}

export interface ApoeGenotype {
  label: string;
  count: number;
}

export interface GenderBreakdown {
  male: number;
  female: number;
}

export interface RegistryChartSlot {
  title: string;
  items: { label: string; count: number; provenance?: DataProvenance }[];
  /** Defaults to column newThisPeriod when omitted */
  n?: number;
  nCaption?: string;
  provenance?: DataProvenance;
  /** Chart segment legend color; defaults to `provenance`. Use `unknown` for illustrative splits with a verified YTD n. */
  chartProvenance?: DataProvenance;
  /** Headline n= color; defaults to `provenance`. */
  nProvenance?: DataProvenance;
  type?: "bar" | "pie";
}

export interface PeriodActivityItem {
  label: string;
  count: number;
  /** Budget / renewal target — shows mini thermometer on this card only */
  periodTarget?: number;
  provenance?: DataProvenance;
}

export interface RegistryChartViews {
  reportingPeriod: [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot];
  grantPeriod: [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot];
  grantPeriodCaption?: string;
}

export type RegistryChartTimeframe = "reportingPeriod" | "grantPeriod";

export interface RegistryColumn {
  id: "adrc" | "genescreen" | "brs";
  title: string;
  total: number;
  newThisPeriod: number;
  /** ADRC: split reporting-period activity into initial / remote / in-person boxes */
  periodActivities?: PeriodActivityItem[];
  totalsProvenance?: DataProvenance;
  /** Chart slot labels (demographics, APOE, source) — may differ from column totals */
  chartsProvenance?: DataProvenance;
  /** Budget-goal thermometer for reporting-period recruitment (GeneScreen column) */
  periodTarget?: number;
  periodTargetNote?: string;
  /** Three chart slots — titles and metrics differ by registry (ADRC vs GeneScreen vs BRS) */
  chartSlots?: [RegistryChartSlot, RegistryChartSlot, RegistryChartSlot];
  /** Reporting-period vs 5-yr grant chart views (toggle above pictographs) */
  chartViews?: RegistryChartViews;
  catchmentDemos: CatchmentDemo[];
  bySource: SourceCount[];
  apoeGenotypes?: ApoeGenotype[];
  gender?: GenderBreakdown;
  showTbd?: boolean;
}

export interface TopRegistryOverview {
  columns: RegistryColumn[];
}

export interface GeneScreenMetrics {
  yearLabel: string;
  membersAdded: number;
  membersWithdrew: number;
  males: number;
  females: number;
  genotypes: ApoeGenotype[];
  leads: {
    newLeadsAdded: number;
    contactsInitiated: number;
    contactsCompleted: number;
  };
  surveys?: {
    initiated: number;
    incomplete: number;
    disqualified: number;
    completed: number;
  };
  enrollment: {
    surveysCompleted: number;
    surveysVerified: number;
    firstKitsMailed: number;
    secondKitsMailed: number;
    genotypesReceived: number;
    membersEnrolled: number;
  };
}

export interface RecruitmentSource {
  source: string;
  count: number;
  catchment?: CatchmentBreakdown[];
}

export interface RecruitmentData {
  total: number;
  bySource: RecruitmentSource[];
}

export interface ScanData {
  target: number;
  mri: number;
  amyloidPet: number;
  tauPet: number;
  provenance?: DataProvenance;
  targetProvenance?: DataProvenance;
}

export interface ClaritiScans {
  target: number;
  mri: number;
  amyloidPet: number;
  tauPet: number;
  provenance?: DataProvenance;
  targetProvenance?: DataProvenance;
}

export interface ClinicalAssessments {
  followUpInPerson: number;
  followUpRemote: number;
  initialAssessments: number;
}

export interface SampleCounts {
  pbmc: number;
  buffyCoat: number;
  plasma126: number;
}

export interface BiofluidCollectionEntry {
  type: string;
  participants: number | null;
  /** Omitted when not reported in RPPR Table A7 (e.g. WBC aliquots). */
  aliquots?: number;
  provenance?: DataProvenance;
}

export interface BiomarkerResearchEntry {
  metric: string;
  samples?: number;
  samplesDisplay?: string;
  csfSamples?: number;
  plasmaSamples?: number;
  unit?: "samples" | "count";
  provenance?: DataProvenance;
}

export interface ImagingQcMetrics {
  amyloidPetQc: number;
  tauPetQc: number;
  structuralMriQc: number;
  newRawPetDatasets: number;
}

export interface IntegratedImagingStudyRow {
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
  studies: IntegratedImagingStudyRow[];
}

/** Harmonized imaging export · calendar YTD window (black metrics on dashboard). */
export interface ImagingYtdMeta {
  periodLabel: string;
  packageVersion: string;
  latestStudyDate?: string;
  identityFilter?: string;
  longitudinalSourceFile: string;
}

export interface IdaImagingUploadMetrics {
  mrScans: number;
  mrParticipants: number;
  petScans: number;
  petParticipants: number;
}

export interface OreOutreachActivityRow {
  activityType: string;
  events: number;
  attendees: number | null;
}

export interface OreCommunityOutreachActivitiesTable {
  title: string;
  source: string;
  reportingContext?: string;
  provenance: DataProvenance;
  rows: OreOutreachActivityRow[];
  totalEvents: number;
  totalAttendees: number;
}

export interface OreOutreachMetrics {
  communityEvents: number;
  eventAttendees: number;
  communityGroupsContacted: number;
  groupsCollaborating: number;
  advisoryCommitteeMeetings: number;
  newOnlineEnrollments: number;
  /** ORE Core detailed outreach-by-activity (Progress & Accomplishments). */
  communityOutreachActivities?: OreCommunityOutreachActivitiesTable;
}

export interface OreEngagementGoals {
  communityAdvisoryBoardMeetings: number;
  brainHealth4MeEngaged: number | null;
  geneScreenNewMembers: number;
}

export interface BiomarkerResults {
  ab40: number | null;
  ab42: number | null;
  gfap: number | null;
  nfl: number | null;
  ptau217: number | null;
  a1c: number | null;
  lipid: number | null;
  creatinine: number | null;
  bloodPressure: number | null;
}

export interface RequestorType {
  label: string;
  count: number;
}

export interface PlasmaRequestSummary {
  requestsWithPlasma: number;
  requestsFulfilled: number;
  aliquotsRequested: number;
  byDiagnosis: RequestorType[];
}

export interface SpecimenSharing {
  requestsReceived: number;
  requestsFulfilled: number;
  requestorTypes: RequestorType[];
  plasma?: PlasmaRequestSummary;
}

export interface SpecimenSharingByPeriod {
  reportingPeriod: SpecimenSharing;
  grantYear: SpecimenSharing;
}

export interface RecMetrics {
  completed: number;
  scheduled: number;
  seriesLabel: string;
  asOfDate: string;
  avgAttendees: number;
  totalAttendees: number;
}

export interface RecScholarTraineeRow {
  id: string;
  name: string;
  currentOrPast: string;
  scholarOrTrainee: string;
  trainingLevel: string;
  researchArea: string;
  progress: string;
  adrcAffiliated: boolean;
  adrdField: boolean;
  notes: string | null;
}

export interface RecFacultyRow {
  id: string;
  lastName: string;
  firstName: string;
  title: string;
  institutionDepartment: string;
  theme: string;
  researchArea: string;
  executiveCommittee: boolean;
}

export interface RecTrainingProgramRow {
  id: string;
  program: string;
  traineesPerYear: string;
  minorityResearchers: string;
  focus: string;
  preceptor: string;
  notes: string | null;
}

export interface RecRosterData {
  meta: {
    sourceRoot: string;
    sources: {
      scholarsTrainees: string;
      faculty: string;
      trainingPrograms: string;
    };
    syncedAt: string;
    maintenance: string;
  };
  scholarsTrainees: {
    title: string;
    rows: RecScholarTraineeRow[];
    summary: {
      total: number;
      current: number;
      past: number;
      currentScholars: number;
      currentTrainees: number;
      allAdrcAffiliated: boolean;
      allAdrdField: boolean;
    };
  };
  faculty: {
    title: string;
    footnote: string;
    rows: RecFacultyRow[];
    summary: { total: number; executiveCommittee: number };
  };
  trainingPrograms: {
    title: string;
    rows: RecTrainingProgramRow[];
    summary: { totalPrograms: number };
  };
}

export interface NeuropathMetrics {
  brsNewlyConsented: number;
  enrolledInAutopsyProgram: number | null;
  withdrawals: number | null;
  cohortDeaths: number;
  /** Deaths with autopsy (Data Core BRS RPPR table). */
  diedWithAutopsy?: number;
  /** Deaths without autopsy (Data Core BRS RPPR table). */
  diedWithoutAutopsy?: number;
  autopsiesPerformed: number;
  autopsyEnrollmentRate: {
    enrolled: number | null;
    adrcTotal: number | null;
    percent: number | null;
  };
  /** James MAP row counts for same reporting window (cross-check). */
  jamesMapExportComparison?: {
    activeStatusOne: number;
    newConsents: number;
    autopsiesPerformed: number;
    deaths: number;
    sourceFile: string;
  };
}

/** Value color: YTD Jan 1–date (black), last RPPR period (green), no data (red; pie slices stay slate). */
export type DataProvenance = "ytd" | "prior" | "unknown";

export interface DataStatusBulletGroup {
  title: string;
  lines: string[];
}

export interface DataStatusInfo {
  status: DataProvenance | "mixed";
  source?: string;
  /** For mixed sections: what is real and from which workbook/table */
  realFrom?: string;
  /** Second real source when a section pulls from multiple workbooks */
  realFrom2?: string;
  /** For mixed sections: what is still mock/placeholder */
  mockFrom?: string;
  /** Line-by-line provenance (sticky notes). */
  bulletGroups?: DataStatusBulletGroup[];
}

export interface SectionDataStatus {
  recruitment: DataStatusInfo;
  recruitmentAdrc: DataStatusInfo;
  recruitmentGeneScreen: DataStatusInfo;
  recruitmentBrs: DataStatusInfo;
  genescreenRegistry: DataStatusInfo;
  oreOutreach: DataStatusInfo;
  imagingScanProgress: DataStatusInfo;
  imagingQc: DataStatusInfo;
  idaImagingUpload: DataStatusInfo;
  clinicalAssessments: DataStatusInfo;
  biomarkersSamplesAndNcrad: DataStatusInfo;
  biomarkersClinicalLab: DataStatusInfo;
  biofluidCollection: DataStatusInfo;
  biomarkerResearch: DataStatusInfo;
  specimenSharingBiofluids: DataStatusInfo;
  neuropathology: DataStatusInfo;
  specimenSharingNeurobank: DataStatusInfo;
  rec: DataStatusInfo;
  demographics: DataStatusInfo;
}

export interface Aim1DashboardData {
  reportingPeriod: string;
  grantPeriod: string;
  lastUpdated: string;
  dataOwner: string;
  dataSources: string[];
  sectionDataStatus: SectionDataStatus;
  topRegistry: TopRegistryOverview;
  oreOutreach: OreOutreachMetrics;
  oreEngagement: OreEngagementGoals;
  geneScreen: GeneScreenMetrics;
  scans: ScanData;
  claritiScans: ClaritiScans;
  integratedImagingStudySummary?: IntegratedImagingStudySummary;
  imagingYtdIntegratedStudySummary?: IntegratedImagingStudySummary;
  imagingYtdMeta?: ImagingYtdMeta;
  imagingQc: ImagingQcMetrics;
  idaImagingUpload: IdaImagingUploadMetrics;
  clinicalAssessments: ClinicalAssessments;
  samples: SampleCounts;
  samplesProvenance?: Partial<Record<keyof SampleCounts, DataProvenance>>;
  biofluidCollection: BiofluidCollectionEntry[];
  biomarkerResearch: BiomarkerResearchEntry[];
  biomarkers: BiomarkerResults;
  /** NCRAD plasma panel cards: YTD from James long file when present. */
  plasmaNcradProvenance?: DataProvenance;
  biofluidSpecimenSharing: SpecimenSharing;
  neurobankSpecimenSharing: SpecimenSharing;
  specimenSharingReportingPeriodLabel: string;
  neuropath: NeuropathMetrics;
  rec: RecMetrics;
  recRoster: RecRosterData;
  overall: DemographicGroup;
  hispanic: DemographicGroup;
  white: DemographicGroup;
  black: DemographicGroup;
  asian: DemographicGroup;
}

export type DemographicGroupKey =
  | "overall"
  | "hispanic"
  | "white"
  | "black"
  | "asian";

export const DEMOGRAPHIC_GROUP_LABELS: Record<DemographicGroupKey, string> = {
  overall: "Overall",
  hispanic: "Hispanic",
  white: "White*",
  black: "Black*",
  asian: "Asian*",
};

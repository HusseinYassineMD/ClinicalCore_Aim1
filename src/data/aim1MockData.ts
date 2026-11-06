import type { Aim1DashboardData } from "@/types/aim1";
import redcapSpecimenSharing from "@/data/redcapSpecimenSharing.json";
import geneScreenYtd from "@/data/geneScreenYtd.json";
import rpprMetrics from "@/data/rpprMetrics.json";
import table1Demographics from "@/data/table1Demographics.json";
import oreCommunityOutreachActivities from "@/data/oreCommunityOutreachActivities2025.json";
import { METRIC_SOURCES, sourceLabel } from "@/data/metricSources";
import { BUDGET_TARGETS } from "@/data/budgetTargets";
import { REGISTRY_CHART_VIEWS } from "@/data/registryChartViews";
import { DASHBOARD_LAST_PUBLISHED } from "@/data/dashboardBuildStamp";
import { latestTimestamp } from "@/lib/formatLastUpdated";
import { getRecAttendanceTotals } from "@/lib/recAttendanceMetrics";
import { getRecSessionCounts } from "@/lib/recSpeakerMetrics";
import rpprDataPackageMeta from "@/data/rpprDataPackageMeta.json";
import rpprDataPackage from "@/data/rpprDataPackage.json";
import biomarkerCoreSampleProcessing2026 from "@/data/biomarkerCoreSampleProcessing2026.json";
import type { RpprDataPackage } from "@/types/dataPackage";
import {
  biofluidRequestLatestDate,
  biomarkerLatestCollectionDate,
  biospecimenLatestCollectionDate,
  biospecimenLatestSpecimenDate,
  brsLatestActivityDate,
  neurobankRequestFileLatestDate,
  neurobankRequestLatestDate,
  packageYtd,
  siteReportingWindow,
  udsLatestVisitDate,
  ytdParticipantsWithVisit,
} from "@/data/siteReporting";
import { formatScopeDate } from "@/lib/formatScopeDate";
import { buildRecruitmentSectionNotes } from "@/data/recruitmentProvenance";
import {
  adrcYtdApoeChartProvenance,
  adrcYtdApoeItems,
  adrcYtdBreakdownCaption,
  adrcYtdEthnicityChartProvenance,
  adrcYtdEthnicityItems,
  adrcYtdReferralChartProvenance,
  adrcYtdReferralItems,
} from "@/data/adrcYtdBreakdown";
import {
  DATA_CORE,
  DATA_OWNERS_DISPLAY,
  HARMONIZED_FILES,
  LAST_RPPR_SOURCE,
  dataCoreYtdSource,
  ytdWindowPhrase,
} from "@/data/dataProvenance";
import { priorPeriodCaption } from "@/data/reportingPeriodLegend";
import {
  BRS_ACTIVE_APOE,
  BRS_ACTIVE_COHORT,
} from "@/data/recruitmentChartConstants";
import brsRpprTableDataCore from "@/data/brsRpprTableDataCore2026.json";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";
import recRosterJson from "@/data/recRoster.json";
import type { RecRosterData } from "@/types/aim1";

const recRoster = recRosterJson as RecRosterData;

const recruitmentNotes = buildRecruitmentSectionNotes();

const r = rpprMetrics;

const t1 = table1Demographics;
const pkg = rpprDataPackage as RpprDataPackage;
const ytd = packageYtd!;
const ytdUds = ytd.udsClinical;
const ytdBio = ytd.biomarkers;
const ytdBrs = ytd.brsAutopsy;
const ytdBiospecimen = ytd.biospecimenInventory;

type BiospecComponentStats = {
  participants: number;
  aliquots: number;
  collectionRows?: number;
};

function biospecYtd(component: string): BiospecComponentStats | undefined {
  const stats = ytdBiospecimen?.byComponentYtd?.[component];
  if (!stats) return undefined;
  return stats as BiospecComponentStats;
}

function biospecCumulative(component: string): BiospecComponentStats | undefined {
  const stats = ytdBiospecimen?.byComponentCumulative?.[component];
  if (!stats) return undefined;
  return stats as BiospecComponentStats;
}

function brsDataCoreRow(id: string) {
  return brsRpprTableDataCore.rows.find((row) => row.id === id);
}

const brsDcCurrent = brsDataCoreRow("currentEnrollment");
const brsDcNew = brsDataCoreRow("newEnrolled");
const brsDcWithdrawal = brsDataCoreRow("withdrawal");
const brsDcDiedWithAutopsy = brsDataCoreRow("diedWithAutopsy");
const brsDcDiedWithoutAutopsy = brsDataCoreRow("diedWithoutAutopsy");
const brsDcEnrollmentN = brsDcCurrent?.participants ?? null;
const ytdImaging = ytd.imaging;
const ytdImagingStudyRollup = ytd.imagingYtdIntegratedStudySummary;

/** Abhay's workbook is monthly. January–September sit fully inside the October 16 lock. October has no day, so it is not in this total. */
const abhayThroughSeptember = biomarkerCoreSampleProcessing2026.months
  .filter((month) => month.month !== "October 2026")
  .reduce(
    (sum, month) => ({
      samples: {
        plasma: sum.samples.plasma + month.samples.plasma,
        buffyCoat: sum.samples.buffyCoat + month.samples.buffyCoat,
        serum: sum.samples.serum + month.samples.serum,
      },
      tubes: {
        plasma: sum.tubes.plasma + month.tubes.plasma,
        buffyCoat: sum.tubes.buffyCoat + month.tubes.buffyCoat,
        serum: sum.tubes.serum + month.tubes.serum,
      },
    }),
    {
      samples: { plasma: 0, buffyCoat: 0, serum: 0 },
      tubes: { plasma: 0, buffyCoat: 0, serum: 0 },
    },
  );

export const aim1MockData: Aim1DashboardData = {
  reportingPeriod: siteReportingWindow.label,
  grantPeriod: r.meta.grantPeriod,
  lastUpdated: latestTimestamp(
    DASHBOARD_LAST_PUBLISHED,
    r.meta.extractedAt,
    t1.meta.extractedAt,
    redcapSpecimenSharing.lastUpdated,
    geneScreenYtd.lastUpdated,
    rpprDataPackageMeta.lastAggregated,
  ),
  dataOwner: DATA_OWNERS_DISPLAY,
  dataSources: [
    METRIC_SOURCES.rppr,
    METRIC_SOURCES.clinicalCoreY7,
    METRIC_SOURCES.dataCoreY7,
    METRIC_SOURCES.neuropathCoreY7,
    METRIC_SOURCES.biomarkerCore,
    METRIC_SOURCES.imagingCore,
    METRIC_SOURCES.oreCore,
    "RedCap — Participant Registration Tracking",
    "RedCap — UDS 4",
    "RedCap — USC ADRC Biofluid Request Tracking",
    "RedCap — USC ADRC Neurobank Request Tracking",
    "GeneScreen — biobetagenetest.usc.edu/yassine/gs/recruitment.php",
    "USC ADRC RPPR Data Package · UDS Harmonization (v1.1.5)",
    "JamesDataPacket November 5 · Integrated Biomarkers (v1.1.2)",
    "JamesDataPacket November 6 · Integrated Imaging Availability (v1.5.4)",
    "MAPDatabase REDCap · BRS Cohort & APOE Genotype",
  ],

  sectionDataStatus: {
    ...recruitmentNotes,
    genescreenRegistry: {
      status: "ytd",
      source: `USC GeneScreen REDCap · ${geneScreenYtd.sourceFile} · ${geneScreenYtd.reportingPeriodLabel}`,
      realFrom: `geneScreenYtd.json · ${geneScreenYtd.newMembersByConsentDate} new by consent date · ${geneScreenYtd.onlineEnrollmentsByMembershipTimestamp} online by membership timestamp`,
      mockFrom:
        "Weekly ops PDF (kits/genotypes) · data/reference/genescreen · see /data-sources — not used for black headline",
    },
    oreOutreach: {
      status: "prior",
      source: `${LAST_RPPR_SOURCE} · ORE Table E1/E2`,
    },
    imagingScanProgress: {
      status: "mixed",
      realFrom: ytdImaging
        ? `MRI / Amyloid PET / Tau PET participants ${ytdWindowPhrase()} · ${DATA_CORE.imagingProduct} ${ytdImaging.packageVersion} · ${ytdImaging.identityFilter ?? "nacc_registry_verified"} only · SCAN & CLARiTI separate (do not sum)`
        : "SCAN target (24) and CLARITi target (36) · RPPR budget",
      mockFrom: ytdImaging
        ? "Targets (24 / 36) · RPPR budget"
        : `Modality counts pending ${DATA_CORE.imagingProduct} export`,
    },
    imagingQc: {
      status: "prior",
      source: sourceLabel(METRIC_SOURCES.rppr, "Imaging Core B2 · QC totals"),
      mockFrom:
        "James: integrated imaging = availability only · QC/upload ops (Kirsten / LONI) — pending export",
      bulletGroups: [
        {
          title: priorPeriodCaption(),
          lines: [
            `Amyloid PET QC ${r.imagingQc.amyloidPetQc} · Tau PET ${r.imagingQc.tauPetQc} · Structural MRI ${r.imagingQc.structuralMriQc} · new raw PET ${r.imagingQc.newRawPetDatasets} · ${LAST_RPPR_SOURCE}`,
          ],
        },
        {
          title: "James YTD (black) — different metric",
          lines: [
            ytdImagingStudyRollup
              ? `Modality participants by study_date in ${siteReportingWindow.label} · ${DATA_CORE.imagingProduct}`
              : "YTD modality counts pending imaging aggregate",
            "Longitudinal export has modality / study_date / NACC verified — not Imaging Core QC workflow totals",
          ],
        },
      ],
    },
    idaImagingUpload: {
      status: "prior",
      source: sourceLabel(METRIC_SOURCES.rppr, "Data Core B2 · IDA upload totals"),
      mockFrom:
        "James defers IDA upload totals to Imaging Core / LONI — not in harmonized availability CSVs",
      bulletGroups: [
        {
          title: priorPeriodCaption(),
          lines: [
            `MR ${r.idaImagingUpload.mrScans} scans / ${r.idaImagingUpload.mrParticipants} participants · PET ${r.idaImagingUpload.petScans} / ${r.idaImagingUpload.petParticipants} · ${LAST_RPPR_SOURCE}`,
          ],
        },
        {
          title: "James YTD (black) — different metric",
          lines: [
            `Integrated Imaging longitudinal · unique participants with study_date in ${siteReportingWindow.label} (SCAN / CLARiTI / study-wide table)`,
            "No IDA or Imaging Core QC fields in USC_ADRC_Imaging_Availability_*.csv",
          ],
        },
      ],
    },
    clinicalAssessments: {
      status: "ytd",
      source: sourceLabel(
        METRIC_SOURCES.dataCoreY7,
        dataCoreYtdSource(`${HARMONIZED_FILES.udsLongitudinal} · visit_date`),
      ),
    },
    biomarkersSamplesAndNcrad: {
      status: "mixed",
      realFrom: dataCoreYtdSource(
        `NCRAD plasma panel · ${HARMONIZED_FILES.biomarkersLong} · Plasma specimen only`,
      ),
      mockFrom: sourceLabel(
        METRIC_SOURCES.rppr,
        "PBMC & 126-plasma RPPR inventory · PBMC not in James biospecimen package",
      ),
      bulletGroups: [
        {
          title: `James Oct 9 supplement (green · last specimen_date ${formatScopeDate(biospecimenLatestSpecimenDate)})`,
          lines: [
            `Biospecimen inventory · ${HARMONIZED_FILES.biospecimenLong} · last specimen_date ${formatScopeDate(biospecimenLatestSpecimenDate)} · last collection_date ${formatScopeDate(biospecimenLatestCollectionDate)}`,
            `Buffy coat YTD aliquots: ${biospecYtd("buffy_coat")?.aliquots ?? "—"} · cumulative inventory aliquots: ${biospecCumulative("buffy_coat")?.aliquots ?? "—"}`,
            `Black · James Wang, November 5. Collections ${formatScopeDate(ytdBio.collectionCoverageStart)} – ${formatScopeDate(ytdBio.collectionCoverageEnd)}, inside ${formatScopeDate(siteReportingWindow.startDate)} – ${formatScopeDate(siteReportingWindow.endDate)}. No collection is dated January 1–5.`,
            "PBMC is stopped for now. Separate procedure. Not in REDCap or BST. The count on the card is the last RPPR inventory.",
          ],
        },
        {
          title: priorPeriodCaption(),
          lines: [
            `${r.samples.pbmc} PBMC · ${r.samples.buffyCoat} buffy · ${r.samples.plasma126} 126-plasma · ${LAST_RPPR_SOURCE}`,
          ],
        },
      ],
    },
    biomarkersClinicalLab: {
      status: "mixed",
      mockFrom: "Moved to the Clinical section. Pinned for a future RPPR.",
      bulletGroups: [
        {
          title: "Pinned for a future RPPR",
          lines: [
            "A1C, lipids, creatinine, and blood pressure sit in the Clinical section.",
            "Not counted in this cycle. No matching rows in Integrated_Biomarkers_Long.",
          ],
        },
      ],
    },
    biofluidCollection: {
      status: "ytd",
      source: biomarkerCoreSampleProcessing2026.meta.providedBy,
      bulletGroups: [
        {
          title: `Black · January 1–September 30, 2026 · ${biomarkerCoreSampleProcessing2026.meta.providedBy}`,
          lines: [
            "Biofluid Collection uses the updated sample and tube totals from Abhay Sagare’s Biomarker Core sample processing file.",
            `Plasma: ${abhayThroughSeptember.samples.plasma} samples · ${abhayThroughSeptember.tubes.plasma} tubes`,
            `Buffy coat: ${abhayThroughSeptember.samples.buffyCoat} samples · ${abhayThroughSeptember.tubes.buffyCoat} tubes`,
            `Serum: ${abhayThroughSeptember.samples.serum} samples · ${abhayThroughSeptember.tubes.serum} tubes`,
            "October is pink on the monthly table. It is a monthly total with no day, so it is not in this October 16 count.",
            "CSF: 0 samples · 0 tubes",
          ],
        },
      ],
    },
    biomarkerCoreSampleProcessing: {
      status: "ytd",
      source: biomarkerCoreSampleProcessing2026.meta.providedBy,
      bulletGroups: [
        {
          title: "Black · January–September 2026 · October is pink",
          lines: [
            biomarkerCoreSampleProcessing2026.meta.sourceFile,
            `Synced ${biomarkerCoreSampleProcessing2026.meta.lastUpdated} · npm run sync:biomarker-processing`,
            `January–September samples: plasma ${abhayThroughSeptember.samples.plasma}, buffy ${abhayThroughSeptember.samples.buffyCoat}, serum ${abhayThroughSeptember.samples.serum}`,
            `January–September tubes: plasma ${abhayThroughSeptember.tubes.plasma}, buffy ${abhayThroughSeptember.tubes.buffyCoat}, serum ${abhayThroughSeptember.tubes.serum}`,
            "October stays pink. The workbook has no day, and that month runs through October 31.",
          ],
        },
      ],
    },
    biomarkerResearch: {
      status: "prior",
      source: sourceLabel(METRIC_SOURCES.biomarkerCore, LAST_RPPR_SOURCE),
      mockFrom: `Cumulative collaboration / CSF analyzed / REC counts · not calendar YTD in James package`,
      bulletGroups: [
        {
          title: priorPeriodCaption(),
          lines: [
            `${r.biomarkerResearch.csfSamplesAnalyzed} CSF analyzed · ${r.biomarkerResearch.collaborationSamples} collaboration samples · REC ${r.biomarkerResearch.recCsfSamples}/${r.biomarkerResearch.recPlasmaSamples}`,
            `APOE genotyping display "${r.biomarkerResearch.apoeGenotypingDisplay}" · MAP export has separate genotype rows (not same definition)`,
          ],
        },
      ],
    },
    specimenSharingBiofluids: {
      status: "ytd",
      source: `${METRIC_SOURCES.redcapBiofluidCsv} · ${METRIC_SOURCES.biomarkerCore} biofluid requests`,
      bulletGroups: [
        {
          title: `Black · ${siteReportingWindow.label}`,
          lines: [
            `src/data/redcapSpecimenSharing.json · biofluids.reportingPeriod`,
            `Source CSV: ${redcapSpecimenSharing.sources.biofluids}`,
            `${redcapSpecimenSharing.biofluids.reportingPeriod.requestsReceived} requests · ${redcapSpecimenSharing.biofluids.reportingPeriod.plasma.aliquotsRequested} plasma aliquots requested`,
            `Last request ${formatScopeDate(biofluidRequestLatestDate)}. Nothing in this pull is later. Pull dated ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}.`,
          ],
        },
      ],
    },
    neuropathology: {
      status: "mixed",
      realFrom: `Data Core BRS RPPR Table 1 · ${brsRpprTableDataCore.meta.windowLabel} · MAP pull ${brsRpprTableDataCore.meta.mapBrsDataPullDate}`,
      mockFrom: `James MAP raw export · ${siteReportingWindow.label} · cross-check only`,
      bulletGroups: [
        {
          title: `RPPR BRS Table 1 (green · last MAP date ${formatScopeDate(brsLatestActivityDate)})`,
          lines: [
            `Current enrollment N=${brsDcEnrollmentN ?? "—"} · new ${brsDcNew?.participants ?? "—"} · withdrawal ${brsDcWithdrawal?.participants ?? "—"}`,
            `Deaths: ${brsDcDiedWithAutopsy?.participants ?? "—"} with autopsy · ${brsDcDiedWithoutAutopsy?.participants ?? "—"} w/o autopsy`,
            brsRpprTableDataCore.currentEnrollmentDefinition,
            `Pending: Tiffany confirmation of RPPR withdrawal window (1/1/2026–10/16/2026 proposed); Carol NP withdrawal may be missing from MAP.`,
          ],
        },
        {
          title: "James MAP export Nov 6 (black · pull is after Oct 16)",
          lines: [
            `5 consents · 7 autopsy_performed_date · 9 date_of_death · ${siteReportingWindow.label}`,
            `Active n=231 · MAPDatabase-BRSCohort_DATA_LABELS_2026-11-06_1248.csv · last consent Oct 5, 2026 · last death Oct 4, 2026 · last performed Oct 4, 2026`,
          ],
        },
        {
          title: priorPeriodCaption(),
          lines: [
            `${r.neuropath.enrolledInAutopsyProgram} enrolled · ${r.neuropath.withdrawals} withdrawals · ${LAST_RPPR_SOURCE} (Jul–Dec 2025 packet — not current BRS table)`,
          ],
        },
      ],
    },
    specimenSharingNeurobank: {
      status: "ytd",
      source: `${METRIC_SOURCES.redcapNeurobankCsv} · ${METRIC_SOURCES.neuropathCoreY7} tissue request table`,
      bulletGroups: [
        {
          title: `Black · ${siteReportingWindow.label}`,
          lines: [
            `src/data/redcapSpecimenSharing.json · neurobank.reportingPeriod`,
            `Source CSV: ${redcapSpecimenSharing.sources.neurobank}`,
            `Last request counted ${formatScopeDate(neurobankRequestLatestDate)}. The pull also has requests through ${formatScopeDate(neurobankRequestFileLatestDate)}, after the cutoff. Pull dated ${formatScopeDate(redcapSpecimenSharing.lastUpdated)}.`,
            "scripts/aggregate_specimen_sharing.py",
          ],
        },
      ],
    },
    rec: {
      status: "mixed",
      source: `${METRIC_SOURCES.recRoster} · RPPR Table 1a / faculty / training programs`,
      realFrom: `Scholars, faculty, programs · ${recRoster.meta.sources.scholarsTrainees}`,
      realFrom2: METRIC_SOURCES.recSpeakerSeries,
      mockFrom: "Add rows to data/reference/rec/meeting-attendance.csv · npm run sync:rec",
      bulletGroups: [
        {
          title: "Roster tracking (black tables)",
          lines: [
            "Edit CSV under data/reference/rec/ · npm run sync:rec",
            `Last roster sync: ${recRoster.meta.syncedAt}`,
            `${recRoster.scholarsTrainees.summary.current} current scholars/trainees · ${recRoster.faculty.summary.total} faculty`,
          ],
        },
        {
          title: "Speaker series",
          lines: [
            "Completed/scheduled from recSpeakerSeries.json",
            "Zoom attendance from meeting-attendance.csv (REC admin report)",
          ],
        },
      ],
    },
    demographics: {
      status: "prior",
      source: `${LAST_RPPR_SOURCE} · table1Demographics.json · Table 1 cohort`,
      bulletGroups: [
        {
          title: "Not the same as",
          lines: [
            `ADRC registry card headline (${ytdParticipantsWithVisit}) — unique participants with UDS visit · ${siteReportingWindow.label} · black · last visit in James’s file ${formatScopeDate(udsLatestVisitDate)}`,
            "Harmonized YTD Table 1 — planned in Data Core export",
          ],
        },
      ],
    },
  },

  topRegistry: {
    // Display order is applied in TopRegistryOverview: UDS, GeneScreen, brain donation.
    columns: [
      {
        id: "genescreen",
        title: "Total Members · GeneScreen Registry",
        total: geneScreenYtd.registrySnapshot.membersComplete,
        newThisPeriod: geneScreenYtd.newMembersByConsentDate,
        periodActivities: [
          {
            label: "Online enrollments",
            count: geneScreenYtd.onlineEnrollmentsByMembershipTimestamp,
            provenance: "span",
          },
          {
            label: "New members",
            count: geneScreenYtd.newMembersByConsentDate,
            provenance: "span",
            periodTarget: BUDGET_TARGETS.geneScreenRecruitmentReportingPeriod,
          },
        ],
        totalsProvenance: "span",
        chartsProvenance: "span",
        headerNote:
          "Pink · 739 Complete? records in the October 7, 2026 REDCap export. That file stops October 7, before October 16. The old RPPR number was 668.",
        periodTarget: BUDGET_TARGETS.geneScreenRecruitmentReportingPeriod,
        periodTargetNote: `Pink · REDCap file ${geneScreenYtd.sourceFile}. That file stops October 7, 2026, so this is not a count through October 16.`,
        chartSlots: [
          {
            title: "Ethnicity",
            type: "bar",
            provenance: "span",
            nProvenance: "span",
            chartProvenance: "span",
            n: geneScreenYtd.newMembersByConsentDate,
            nCaption:
              "Pink · October 7, 2026 REDCap export. That file stops before October 16.",
            items: geneScreenYtd.ethnicity.map((row) => ({
              ...row,
              provenance: "span" as const,
            })),
          },
          {
            title: "APOE4",
            type: "pie",
            provenance: "span",
            nProvenance: "span",
            chartProvenance: "span",
            n: geneScreenYtd.newMembersByConsentDate,
            nCaption:
              "Pink · October 7, 2026 REDCap export. That file stops before October 16.",
            items: geneScreenYtd.apoe4.map((row) => ({
              ...row,
              provenance: "span" as const,
            })),
          },
          {
            title: "Gender",
            type: "bar",
            provenance: "span",
            nProvenance: "span",
            chartProvenance: "span",
            n: geneScreenYtd.newMembersByConsentDate,
            nCaption:
              "Pink · October 7, 2026 REDCap export. That file stops before October 16.",
            items: geneScreenYtd.gender.map((row) => ({
              ...row,
              provenance: "span" as const,
            })),
          },
        ],
        catchmentDemos: [
          { label: "Male", count: geneScreenYtd.registrySnapshot.males },
          { label: "Female", count: geneScreenYtd.registrySnapshot.females },
        ],
        bySource: [
          {
            source: "On registry",
            count: geneScreenYtd.registrySnapshot.membersComplete,
          },
        ],
        apoeGenotypes: [
          {
            label: "APOE4 carrier",
            count: geneScreenYtd.registrySnapshot.apoe4Carriers,
          },
          {
            label: "Non-carrier",
            count:
              geneScreenYtd.registrySnapshot.membersComplete -
              geneScreenYtd.registrySnapshot.apoe4Carriers,
          },
        ],
        gender: {
          male: geneScreenYtd.registrySnapshot.males,
          female: geneScreenYtd.registrySnapshot.females,
        },
        chartViews: REGISTRY_CHART_VIEWS.genescreen,
      },
      {
        id: "adrc",
        title: "Participants with UDS visit · year to date",
        total: ytdParticipantsWithVisit ?? 0,
        newThisPeriod: ytdUds.newInitialEvaluations,
        periodActivities: [
          {
            label: "In-person follow-ups",
            count: ytdUds.followUpInPerson,
          },
          {
            label: "Remote follow-ups",
            count: ytdUds.followUpRemote,
          },
          {
            label: "Initial",
            count: ytdUds.newInitialEvaluations,
            periodTarget: BUDGET_TARGETS.adrcNewEvalsPerYear,
          },
        ],
        totalsProvenance: "ytd",
        chartsProvenance: adrcYtdEthnicityChartProvenance(),
        chartSlots: [
          {
            title: "Ethnicity",
            type: "bar",
            provenance: "ytd",
            nProvenance: "ytd",
            chartProvenance: adrcYtdEthnicityChartProvenance(),
            n: ytdUds.newInitialEvaluations,
            nCaption: adrcYtdBreakdownCaption,
            items: adrcYtdEthnicityItems(),
          },
          {
            title: "APOE genotype",
            type: "pie",
            provenance: "ytd",
            nProvenance: "ytd",
            chartProvenance: adrcYtdApoeChartProvenance(),
            n: ytdUds.newInitialEvaluations,
            nCaption: `${adrcYtdBreakdownCaption} · red = not in MAP APOE export`,
            items: adrcYtdApoeItems(),
          },
          {
            title: "Referral source (NACC A1)",
            type: "bar",
            provenance: "ytd",
            nProvenance: "ytd",
            chartProvenance: adrcYtdReferralChartProvenance(),
            n: ytdUds.newInitialEvaluations,
            nCaption: adrcYtdBreakdownCaption,
            items: adrcYtdReferralItems(),
          },
        ],
        catchmentDemos: adrcYtdEthnicityItems().map(({ label, count }) => ({
          label,
          count,
        })),
        bySource: adrcYtdReferralItems().map(({ label, count }) => ({
          source: label,
          count,
        })),
        apoeGenotypes: adrcYtdApoeItems().map(({ label, count }) => ({
          label,
          count,
        })),
        chartViews: REGISTRY_CHART_VIEWS.adrc,
      },
      {
        id: "brs",
        title: "Total Enrolled · Autopsy Program",
        total: brsDcEnrollmentN ?? 0,
        newThisPeriod: brsDcNew?.participants ?? ytdBrs.newAutopsyConsents,
        periodActivities: [
          {
            label: "New autopsy consents",
            count: brsDcNew?.participants ?? ytdBrs.newAutopsyConsents,
            periodTarget: BUDGET_TARGETS.brsNewConsentsPerYear,
            provenance: "ytd",
          },
        ],
        totalsProvenance: "span",
        chartsProvenance: "span",
        periodTargetNote:
          "Black · Nov 6 MAP pull · 5 consent dates inside Jan 1–Oct 16 · last consent Oct 5, 2026",
        chartSlots: [
          {
            title: "Ethnicity",
            type: "bar",
            provenance: "ytd",
            nProvenance: "ytd",
            chartProvenance: "ytd",
            n: BRS_ACTIVE_COHORT.activeRows,
            nCaption:
              "Black · James Wang · MAPDatabase-BRSCohort_DATA_LABELS_2026-11-06_1248.csv · status Active · Subject Ethnicity · 231. Pull Nov 6, 2026, after Oct 16. Last consent Oct 5, 2026.",
            items: BRS_ACTIVE_COHORT.hispanicLatino.map((row) => ({
              label: row.label,
              count: row.count,
              provenance: "ytd" as const,
            })),
          },
          {
            title: "APOE genotype",
            type: "pie",
            provenance: "ytd",
            nProvenance: "ytd",
            chartProvenance: "ytd",
            n: BRS_ACTIVE_COHORT.activeRows,
            nCaption:
              "Black · James Wang · MAPDatabase-APOEGenotype_DATA_LABELS_2026-11-06_1248.csv · Consolidated APOE Genotype · joined to the 231 Active rows · an e4 allele is a carrier. Pull Nov 6, 2026, after Oct 16.",
            items: BRS_ACTIVE_APOE.map((row) => ({
              label: row.label,
              count: row.count,
              provenance: "ytd" as const,
            })),
          },
          {
            title: "Sex",
            type: "bar",
            provenance: "span",
            nProvenance: "span",
            chartProvenance: "span",
            n: brsDcEnrollmentN ?? undefined,
            nCaption:
              "Pink · Xinhui Wang · Data Core Table 1, Brain Research Study · current enrollment · MAP pull Oct 7, 2026. That pull stops before Oct 16.",
            items: [
              {
                label: "Male",
                count: brsDcCurrent?.male ?? 0,
                provenance: "span" as const,
              },
              {
                label: "Female",
                count: brsDcCurrent?.female ?? 0,
                provenance: "span" as const,
              },
            ],
          },
        ],
        catchmentDemos: [],
        bySource: [],
        apoeGenotypes: [],
        chartViews: REGISTRY_CHART_VIEWS.brs,
      },
    ],
  },

  oreOutreach: {
    communityEvents: r.oreOutreach.communityEvents,
    eventAttendees: r.oreOutreach.eventAttendees,
    communityGroupsContacted: r.oreOutreach.communityGroupsContacted,
    groupsCollaborating: r.oreOutreach.groupsCollaborating,
    advisoryCommitteeMeetings: r.oreOutreach.advisoryCommitteeMeetings,
    newOnlineEnrollments: r.oreOutreach.newOnlineEnrollments,
    communityOutreachActivities: {
      title: oreCommunityOutreachActivities.meta.title,
      source: oreCommunityOutreachActivities.meta.source,
      reportingContext: oreCommunityOutreachActivities.meta.reportingContext,
      provenance: "prior",
      rows: oreCommunityOutreachActivities.rows,
      totalEvents: oreCommunityOutreachActivities.totals.events,
      totalAttendees: oreCommunityOutreachActivities.totals.attendees,
    },
  },

  oreEngagement: {
    communityAdvisoryBoardMeetings: r.oreOutreach.advisoryCommitteeMeetings,
    brainHealth4MeEngaged: null,
    geneScreenNewMembers: 0,
  },

  geneScreen: {
    yearLabel: `Year to date · ${siteReportingWindow.label}`,
    membersAdded: 0,
    membersWithdrew: 0,
    males: r.geneScreen.males ?? 0,
    females: r.geneScreen.females ?? 0,
    genotypes: [{ label: "APOE4 carriers", count: r.geneScreen.apoe4Carriers ?? 0 }],
    leads: {
      newLeadsAdded: 0,
      contactsInitiated: 0,
      contactsCompleted: 0,
    },
    enrollment: {
      surveysCompleted: 0,
      surveysVerified: 0,
      firstKitsMailed: 0,
      secondKitsMailed: 0,
      genotypesReceived: 0,
      membersEnrolled: r.geneScreen.membersEnrolled,
    },
  },

  scans: {
    target: 0,
    targetProvenance: "unknown",
    mri: ytdImaging?.scanStudy.participantsWithMri ?? 0,
    amyloidPet: ytdImaging?.scanStudy.participantsWithAmyloidPet ?? 0,
    tauPet: ytdImaging?.scanStudy.participantsWithTauPet ?? 0,
    provenance: ytdImaging ? "ytd" : "unknown",
  },

  claritiScans: {
    target: 0,
    targetProvenance: "unknown",
    mri: ytdImaging?.claritiStudy.participantsWithMri ?? 0,
    amyloidPet: ytdImaging?.claritiStudy.participantsWithAmyloidPet ?? 0,
    tauPet: ytdImaging?.claritiStudy.participantsWithTauPet ?? 0,
    provenance: ytdImaging ? "ytd" : "unknown",
  },

  ...(ytdImagingStudyRollup
    ? { imagingYtdIntegratedStudySummary: ytdImagingStudyRollup }
    : {}),

  ...(ytdImaging
    ? {
        imagingYtdMeta: {
          periodLabel: siteReportingWindow.label,
          packageVersion: ytdImaging.packageVersion ?? "v1.5.4",
          latestStudyDate:
            ytdImaging.dataCoverage?.imagingLatestStudyDate ?? undefined,
          identityFilter: ytdImaging.identityFilter,
          longitudinalSourceFile:
            ytdImaging.sourceFiles?.longitudinal ??
            "USC_ADRC_Imaging_Availability_Longitudinal_v1.5.4.csv",
        },
      }
    : {}),

  imagingQc: {
    amyloidPetQc: r.imagingQc.amyloidPetQc,
    tauPetQc: r.imagingQc.tauPetQc,
    structuralMriQc: r.imagingQc.structuralMriQc,
    newRawPetDatasets: r.imagingQc.newRawPetDatasets,
  },

  idaImagingUpload: {
    mrScans: r.idaImagingUpload.mrScans,
    mrParticipants: r.idaImagingUpload.mrParticipants,
    petScans: r.idaImagingUpload.petScans,
    petParticipants: r.idaImagingUpload.petParticipants,
  },

  clinicalAssessments: {
    followUpInPerson: ytdUds.followUpInPerson,
    followUpRemote: ytdUds.followUpRemote,
    initialAssessments: ytdUds.newInitialEvaluations,
  },

  samples: {
    pbmc: r.samples.pbmc,
    buffyCoat: biospecYtd("buffy_coat")?.aliquots ?? r.samples.buffyCoat,
    plasma126: r.samples.plasma126,
  },

  samplesProvenance: {
    pbmc: "prior" as const,
    buffyCoat: "prior" as const,
    plasma126: "prior" as const,
  },

  biofluidCollection: [
    {
      type: "Plasma",
      participants: abhayThroughSeptember.samples.plasma,
      aliquots: abhayThroughSeptember.tubes.plasma,
      provenance: "ytd" as const,
    },
    {
      type: "Buffy coat",
      participants: abhayThroughSeptember.samples.buffyCoat,
      aliquots: abhayThroughSeptember.tubes.buffyCoat,
      provenance: "ytd" as const,
    },
    {
      type: "Serum",
      participants: abhayThroughSeptember.samples.serum,
      aliquots: abhayThroughSeptember.tubes.serum,
      provenance: "ytd" as const,
    },
    {
      type: "CSF",
      participants: 0,
      aliquots: 0,
      provenance: "ytd" as const,
    },
  ],

  biomarkerCoreSampleProcessing:
    biomarkerCoreSampleProcessing2026 as typeof biomarkerCoreSampleProcessing2026,

  biomarkerResearch: [
    {
      metric:
        "CSF samples analyzed for AD biomarkers (e.g., Aβ, total tau, p-tau)",
      samples: r.biomarkerResearch.csfSamplesAnalyzed,
      provenance: "prior",
    },
    {
      metric: "APOE genotyping",
      samplesDisplay: r.biomarkerResearch.apoeGenotypingDisplay,
      provenance: "prior",
    },
    {
      metric:
        "Provided samples for national & international collaborations",
      samples: r.biomarkerResearch.collaborationSamples,
      unit: "count",
      provenance: "prior",
    },
    {
      metric: "Analyzed samples from REC Core",
      csfSamples: r.biomarkerResearch.recCsfSamples,
      plasmaSamples: r.biomarkerResearch.recPlasmaSamples,
      provenance: "prior",
    },
  ],

  biomarkers: (() => {
    const ncrad = ytdBio.ncradPlasmaMeasurements;
    return {
      ab40: ncrad?.ab40 ?? null,
      ab42: ncrad?.ab42 ?? null,
      gfap: ncrad?.gfap ?? null,
      nfl: ncrad?.nfl ?? null,
      ptau217: ncrad?.ptau217 ?? null,
      a1c: null,
      lipid: null,
      creatinine: null,
      bloodPressure: null,
    };
  })(),

  plasmaNcradProvenance: ytdBio.ncradPlasmaMeasurements
    ? ("ytd" as const)
    : ("unknown" as const),

  biofluidSpecimenSharing: redcapSpecimenSharing.biofluids.reportingPeriod,
  neurobankSpecimenSharing: redcapSpecimenSharing.neurobank.reportingPeriod,
  specimenSharingReportingPeriodLabel: siteReportingWindow.label,

  rec: (() => {
    const recAsOf = siteReportingWindow.endDate
      ? new Date(`${siteReportingWindow.endDate}T12:00:00`)
      : new Date("2026-10-16T12:00:00");
    const sessions = getRecSessionCounts(recAsOf);
    const attendance = getRecAttendanceTotals(recAsOf);
    return {
      completed: sessions.completed,
      scheduled: sessions.scheduled,
      seriesLabel: sessions.seriesLabel,
      asOfDate: sessions.asOfDate,
      avgAttendees: attendance.avgAttendees,
      totalAttendees: attendance.totalAttendees,
      attendanceSessionCount: attendance.sessionCount,
      attendanceSessions: attendance.sessions.map((s) => ({
        sessionDate: s.sessionDate,
        attendees: s.attendees,
        reportedBy: s.reportedBy,
      })),
    };
  })(),

  recRoster,

  neuropath: {
    brsNewlyConsented: brsDcNew?.participants ?? ytdBrs.newAutopsyConsents,
    enrolledInAutopsyProgram: brsDcEnrollmentN,
    withdrawals: brsDcWithdrawal?.participants ?? null,
    cohortDeaths:
      (brsDcDiedWithAutopsy?.participants ?? 0) +
      (brsDcDiedWithoutAutopsy?.participants ?? 0),
    diedWithAutopsy: brsDcDiedWithAutopsy?.participants,
    diedWithoutAutopsy: brsDcDiedWithoutAutopsy?.participants,
    autopsiesPerformed: brsDcDiedWithAutopsy?.participants ?? ytdBrs.autopsiesPerformed,
    jamesMapExportComparison: {
      activeStatusOne: 231,
      newConsents: 5,
      autopsiesPerformed: 7,
      deaths: 9,
      sourceFile: "MAPDatabase-BRSCohort_DATA_LABELS_2026-11-06_1248.csv",
    },
    autopsyEnrollmentRate: (() => {
      const enrolled = brsDcEnrollmentN;
      const adrcTotal =
        table1HarmonizedActiveSnapshot.meta.participantCount ?? null;
      const percent =
        enrolled != null && adrcTotal != null && adrcTotal > 0
          ? Math.round((enrolled / adrcTotal) * 1000) / 10
          : null;
      return { enrolled, adrcTotal, percent };
    })(),
  },

  overall: t1.overall,
  hispanic: t1.hispanic,
  white: t1.white,
  black: t1.black,
  asian: t1.asian,
};

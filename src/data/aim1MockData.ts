import type { Aim1DashboardData } from "@/types/aim1";
import redcapSpecimenSharing from "@/data/redcapSpecimenSharing.json";
import geneScreenYtd from "@/data/geneScreenYtd.json";
import rpprMetrics from "@/data/rpprMetrics.json";
import table1Demographics from "@/data/table1Demographics.json";
import oreCommunityOutreachActivities from "@/data/oreCommunityOutreachActivities2025.json";
import { METRIC_SOURCES, sourceLabel } from "@/data/metricSources";
import { BUDGET_TARGETS } from "@/data/budgetTargets";
import { REGISTRY_CHART_VIEWS } from "@/data/registryChartViews";
import { latestTimestamp } from "@/lib/formatLastUpdated";
import { getRecAttendanceTotals } from "@/lib/recAttendanceMetrics";
import { getRecSessionCounts } from "@/lib/recSpeakerMetrics";
import rpprDataPackageMeta from "@/data/rpprDataPackageMeta.json";
import rpprDataPackage from "@/data/rpprDataPackage.json";
import type { RpprDataPackage } from "@/types/dataPackage";
import {
  packageYtd,
  siteReportingWindow,
  ytdParticipantsWithVisit,
} from "@/data/siteReporting";
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
  PENDING_IN_HARMONIZED_EXPORT,
  dataCoreYtdSource,
  ytdWindowPhrase,
} from "@/data/dataProvenance";
import { priorPeriodCaption } from "@/data/reportingPeriodLegend";
import {
  BRS_TBD_APOE,
  BRS_TBD_ETHNICITY,
  BRS_TBD_SEX,
} from "@/data/recruitmentChartConstants";
import brsRpprTableDataCore from "@/data/brsRpprTableDataCore2026.json";
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
const periodCap = siteReportingWindow.periodCaption;
const brsDeathsYtd =
  pkg.reportingPeriodAdditional?.domains
    .find((d) => d.id === "brs-dates")
    ?.metrics.find((m) => m.label.startsWith("Deaths"))?.value ?? 0;

export const aim1MockData: Aim1DashboardData = {
  reportingPeriod: siteReportingWindow.label,
  grantPeriod: r.meta.grantPeriod,
  lastUpdated: latestTimestamp(
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
    "USC ADRC RPPR Data Package · UDS Harmonization (v1.1.0)",
    "USC ADRC RPPR Data Package · Integrated Biomarkers (v1.0.5)",
    "USC ADRC Integrated Imaging Availability (v1.5.2)",
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
          title: "James Oct 9 supplement (black)",
          lines: [
            `Biospecimen inventory · ${HARMONIZED_FILES.biospecimenLong} · collection_date in ${siteReportingWindow.label}`,
            `Buffy coat YTD aliquots: ${biospecYtd("buffy_coat")?.aliquots ?? "—"} · cumulative inventory aliquots: ${biospecCumulative("buffy_coat")?.aliquots ?? "—"}`,
            `NCRAD assay rows still from ${HARMONIZED_FILES.biomarkersLong} (separate pipeline)`,
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
      status: "unknown",
      mockFrom: `${PENDING_IN_HARMONIZED_EXPORT} · no A1c/creatinine/lipid panel counts in Integrated_Biomarkers_Long`,
      bulletGroups: [
        {
          title: "Not extractable from James (red)",
          lines: [
            "A1c, lipid panel, creatinine: no matching biomarker labels in integrated long file",
            "BP/lipid-related UDS fields exist (bpsys, bpdias, hypchol) but dashboard uses RPPR-style lab test counts — not wired",
          ],
        },
      ],
    },
    biofluidCollection: {
      status: "mixed",
      realFrom: dataCoreYtdSource(
        `Biospecimen inventory · ${HARMONIZED_FILES.biospecimenLong} · collection_date in window`,
      ),
      mockFrom: `${LAST_RPPR_SOURCE} · WBC RPPR line (no WBC component in biospecimen export)`,
      bulletGroups: [
        {
          title: "James biospecimen package (black YTD)",
          lines: [
            `Plasma: ${biospecYtd("plasma")?.participants ?? "—"} participants · ${biospecYtd("plasma")?.aliquots ?? "—"} aliquots`,
            `Serum: ${biospecYtd("serum")?.participants ?? "—"} participants · ${biospecYtd("serum")?.aliquots ?? "—"} aliquots`,
            `Buffy coat: ${biospecYtd("buffy_coat")?.participants ?? "—"} participants · ${biospecYtd("buffy_coat")?.aliquots ?? "—"} aliquots`,
            `CSF collections in window: ${biospecYtd("csf")?.participants ?? 0} participants (integrated biomarker CSF assay rows may differ)`,
            `BRS export: ${ytdBrs.sourceFile} · active status=1 snapshot n=${ytdBrs.activeEnrolled ?? "—"} (RPPR cumulative definition pending Dr. Wang)`,
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
          title: "Year to date (black)",
          lines: [
            `src/data/redcapSpecimenSharing.json · biofluids.reportingPeriod`,
            `Source CSV: ${redcapSpecimenSharing.sources.biofluids}`,
            `${redcapSpecimenSharing.biofluids.reportingPeriod.requestsReceived} requests · ${redcapSpecimenSharing.biofluids.reportingPeriod.plasma.aliquotsRequested} plasma aliquots requested`,
            `Window: ${redcapSpecimenSharing.reportingPeriodLabel}`,
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
          title: "RPPR BRS Table 1 (black · Data Core QC)",
          lines: [
            `Current enrollment N=${brsDcEnrollmentN ?? "—"} · new ${brsDcNew?.participants ?? "—"} · withdrawal ${brsDcWithdrawal?.participants ?? "—"}`,
            `Deaths: ${brsDcDiedWithAutopsy?.participants ?? "—"} with autopsy · ${brsDcDiedWithoutAutopsy?.participants ?? "—"} w/o autopsy`,
            brsRpprTableDataCore.currentEnrollmentDefinition,
            `Pending: Tiffany confirmation of RPPR withdrawal window (1/1/2026–10/13/2026 proposed); Carol NP withdrawal may be missing from MAP.`,
          ],
        },
        {
          title: "James MAP export (raw · not RPPR denominator)",
          lines: [
            `${ytdBrs.newAutopsyConsents} consents · ${ytdBrs.autopsiesPerformed} autopsy_performed_date · ${brsDeathsYtd} date_of_death · ${siteReportingWindow.label}`,
            `status=1 snapshot n=${ytdBrs.activeEnrolled ?? "—"} (${ytdBrs.sourceFile}) — Data Core uses N=226 after UDS packet QC`,
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
          title: "Year to date (black)",
          lines: [
            `src/data/redcapSpecimenSharing.json · neurobank.reportingPeriod`,
            `Source CSV: ${redcapSpecimenSharing.sources.neurobank}`,
            `requestsReceived & breakdowns filtered to ${redcapSpecimenSharing.reportingPeriodLabel}`,
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
            `ADRC registry card headline (${ytdParticipantsWithVisit}) — unique participants with UDS visit · ${siteReportingWindow.label} · black`,
            "Harmonized YTD Table 1 — planned in Data Core export",
          ],
        },
      ],
    },
  },

  topRegistry: {
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
            provenance: "ytd",
          },
          {
            label: "New members",
            count: geneScreenYtd.newMembersByConsentDate,
            provenance: "ytd",
            periodTarget: BUDGET_TARGETS.geneScreenRecruitmentReportingPeriod,
          },
        ],
        totalsProvenance: "ytd",
        chartsProvenance: "ytd",
        periodTarget: BUDGET_TARGETS.geneScreenRecruitmentReportingPeriod,
        periodTargetNote: `Black = GeneScreen YTD · ${geneScreenYtd.reportingPeriodLabel} · REDCap · green headline = ${priorPeriodCaption()}`,
        chartSlots: [
          {
            title: "Ethnicity",
            type: "bar",
            provenance: "ytd",
            n: geneScreenYtd.newMembersByConsentDate,
            nCaption: periodCap,
            items: geneScreenYtd.ethnicity.map((row) => ({
              ...row,
              provenance: "ytd" as const,
            })),
          },
          {
            title: "APOE4",
            type: "pie",
            provenance: "ytd",
            n: geneScreenYtd.newMembersByConsentDate,
            nCaption: periodCap,
            items: geneScreenYtd.apoe4.map((row) => ({
              ...row,
              provenance: "ytd" as const,
            })),
          },
          {
            title: "Gender",
            type: "bar",
            provenance: "ytd",
            n: geneScreenYtd.newMembersByConsentDate,
            nCaption: periodCap,
            items: geneScreenYtd.gender.map((row) => ({
              ...row,
              provenance: "ytd" as const,
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
          },
        ],
        totalsProvenance: "ytd",
        chartsProvenance: "ytd",
        chartSlots: [
          {
            title: "Ethnicity",
            type: "bar",
            provenance: "unknown",
            nProvenance: "unknown",
            chartProvenance: "unknown",
            nCaption: `${PENDING_IN_HARMONIZED_EXPORT} · no ethnicity breakdown for Data Core N=${brsDcEnrollmentN ?? "—"}`,
            items: BRS_TBD_ETHNICITY.map((row) => ({
              ...row,
              provenance: "unknown" as const,
            })),
          },
          {
            title: "APOE genotype",
            type: "pie",
            provenance: "unknown",
            nProvenance: "unknown",
            chartProvenance: "unknown",
            nCaption: `${PENDING_IN_HARMONIZED_EXPORT} · no APOE breakdown wired`,
            items: BRS_TBD_APOE.map((row) => ({
              ...row,
              provenance: "unknown" as const,
            })),
          },
          {
            title: "Sex",
            type: "bar",
            provenance: "unknown",
            nProvenance: "unknown",
            chartProvenance: "unknown",
            nCaption: `${PENDING_IN_HARMONIZED_EXPORT} · sex breakdown not in harmonized export`,
            items: BRS_TBD_SEX.map((row) => ({
              ...row,
              provenance: "unknown" as const,
            })),
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
          packageVersion: ytdImaging.packageVersion ?? "v1.5.2",
          latestStudyDate:
            ytdImaging.dataCoverage?.imagingLatestStudyDate ?? undefined,
          identityFilter: ytdImaging.identityFilter,
          longitudinalSourceFile:
            ytdImaging.sourceFiles?.longitudinal ??
            "USC_ADRC_Imaging_Availability_Longitudinal_v1.5.2.csv",
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
    buffyCoat: ytdBiospecimen ? ("ytd" as const) : ("prior" as const),
    plasma126: "prior" as const,
  },

  biofluidCollection: [
    {
      type: "Plasma",
      participants: biospecYtd("plasma")?.participants ?? ytdBio.subjectsWithPlasmaCollection,
      aliquots: biospecYtd("plasma")?.aliquots ?? ytdBio.plasmaMeasurementRows,
      provenance: ytdBiospecimen ? "ytd" : "ytd",
    },
    {
      type: "Buffy coat",
      participants: biospecYtd("buffy_coat")?.participants ?? null,
      aliquots: biospecYtd("buffy_coat")?.aliquots,
      provenance: ytdBiospecimen ? "ytd" : "unknown",
    },
    {
      type: "Serum",
      participants: biospecYtd("serum")?.participants ?? r.biofluidCollection.serumParticipants,
      aliquots: biospecYtd("serum")?.aliquots ?? r.biofluidCollection.serumAliquots,
      provenance: ytdBiospecimen ? "ytd" : "prior",
    },
    {
      type: "CSF",
      participants:
        biospecYtd("csf")?.participants ??
        ytdBio.subjectsWithCsfCollection,
      aliquots: biospecYtd("csf")?.aliquots ?? ytdBio.csfMeasurementRows,
      provenance: ytdBiospecimen ? "ytd" : "ytd",
    },
  ],

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
      : new Date("2026-10-13T12:00:00");
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
      activeStatusOne: ytdBrs.activeEnrolled ?? 0,
      newConsents: ytdBrs.newAutopsyConsents,
      autopsiesPerformed: ytdBrs.autopsiesPerformed,
      deaths: brsDeathsYtd,
      sourceFile: ytdBrs.sourceFile ?? "",
    },
    autopsyEnrollmentRate: (() => {
      const enrolled = brsDcEnrollmentN;
      const adrcTotal = Number.parseInt(String(t1.overall.n), 10) || null;
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

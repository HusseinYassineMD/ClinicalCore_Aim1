import type { DataStatusInfo, SectionDataStatus } from "@/types/aim1";
import { packageYtd } from "@/data/siteReporting";
import {
  HARMONIZED_FILES,
  PENDING_IN_HARMONIZED_EXPORT,
  ytdWindowPhrase,
} from "@/data/dataProvenance";

const ytd = packageYtd!;
const uds = ytd.udsClinical;
const brsYtd = ytd.brsAutopsy;
const win = ytdWindowPhrase();

export function buildRecruitmentSectionNotes(): Pick<
  SectionDataStatus,
  "recruitment" | "recruitmentAdrc" | "recruitmentGeneScreen" | "recruitmentBrs"
> {
  const recruitment: DataStatusInfo = {
    status: "mixed",
    source: `Year to date · ${win} · USC ADRC harmonized data export (Data Core)`,
    bulletGroups: [
      {
        title: "ADRC (black · YTD)",
        lines: [
          `${uds.uniqueParticipantsWithVisit} with ≥1 UDS visit; FU ${uds.followUpInPerson} in-person / ${uds.followUpRemote} remote / ${uds.newInitialEvaluations} initial.`,
          `${HARMONIZED_FILES.udsLongitudinal} · visit_date in window.`,
          "New-eval ethnicity/APOE/referral: rpprDataPackage.json · newInitialEvaluationBreakdown (UDS + subject + MAP APOE).",
        ],
      },
      {
        title: "GeneScreen (black YTD · green cumulative headline)",
        lines: [
          "668 members · 201 M · 467 F · 188 APOE4 · rpprMetrics.json (green total).",
          "YTD new members & period charts: geneScreenYtd.json · USC GeneScreen REDCap export · Consent Date in window.",
        ],
      },
      {
        title: "BRS (black · Data Core table headline)",
        lines: [
          `Current enrollment N=${brsYtd ? "see brsRpprTableDataCore2026.json" : "—"}; new consents YTD from Data Core / MAP cross-check.`,
          "Ethnicity, sex, and APOE charts: TBD until harmonized participant-level breakdown (not MAP active-row proxy).",
        ],
      },
    ],
  };

  return {
    recruitment,
    recruitmentAdrc: recruitment,
    recruitmentGeneScreen: recruitment,
    recruitmentBrs: recruitment,
  };
}

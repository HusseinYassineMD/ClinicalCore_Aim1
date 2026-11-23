import geneScreenYtd from "@/data/geneScreenYtd.json";
import type { DataProvenance } from "@/types/aim1";

type ChartItem = { label: string; count: number; provenance: DataProvenance };

const snap = geneScreenYtd.registrySnapshot;
const sourceFile = geneScreenYtd.sourceFile;
/** REDCap labeled export date embedded in the source filename (stops before Oct 16 window end). */
const throughDate = "October 7, 2026";

export const geneScreenNewMembersN = geneScreenYtd.newMembersByConsentDate;
export const geneScreenAllCompleteN = snap.membersComplete;

export const geneScreenNewMembersCaption = `Source: REDCap · ${sourceFile}. Through: ${throughDate}. Pink · new members by Consent Date. n=${geneScreenNewMembersN}. This is not the ${geneScreenAllCompleteN} Complete? registry members. That file stops before October 16.`;

export const geneScreenAllCompleteCaption = `Source: REDCap · ${sourceFile}. Through: ${throughDate}. Pink · every Complete? record in the export. n=${geneScreenAllCompleteN}. This is not the ${geneScreenNewMembersN} new members by Consent Date. That file stops before October 16.`;

function withSpan(rows: { label: string; count: number }[]): ChartItem[] {
  return rows.map((row) => ({ ...row, provenance: "span" as const }));
}

export function geneScreenNewMembersEthnicityItems(): ChartItem[] {
  return withSpan(geneScreenYtd.ethnicity);
}

export function geneScreenNewMembersGenderItems(): ChartItem[] {
  return withSpan(geneScreenYtd.gender);
}

export function geneScreenNewMembersApoeItems(): ChartItem[] {
  return withSpan(geneScreenYtd.apoe4);
}

export function geneScreenAllCompleteEthnicityItems(): ChartItem[] {
  return withSpan(snap.ethnicity ?? []);
}

export function geneScreenAllCompleteGenderItems(): ChartItem[] {
  return withSpan(
    snap.gender ?? [
      { label: "Male", count: snap.males },
      { label: "Female", count: snap.females },
    ],
  );
}

export function geneScreenAllCompleteApoeItems(): ChartItem[] {
  return withSpan(
    snap.apoe4 ?? [
      { label: "APOE4 carrier", count: snap.apoe4Carriers },
      {
        label: "Non-carrier",
        count: snap.membersComplete - snap.apoe4Carriers,
      },
    ],
  );
}

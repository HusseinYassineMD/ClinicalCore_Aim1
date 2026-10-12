import { siteReportingWindow } from "@/data/siteReporting";
import { DATA_OWNERS_DISPLAY } from "@/data/dataProvenance";
import { VALIDATED_CHECK_COUNT } from "@/data/dashboardConstants";

/** Board- and email-ready story — only claims the UI can support. */
export const DASHBOARD_MISSION = {
  eyebrow: "USC ADRC · Programmatic & core leads",
  headline: "One place for mid-cycle progress and RPPR-aligned metrics",
  preamble:
    "Our programmatic team connected with each core lead through listening sessions on reporting. Those conversations shaped this dashboard: a shared framework that shows the same key visuals and tables we use in RPPR, so cores stay aligned, reporting takes less back-and-forth, and the center can communicate progress between formal milestone cycles—not only at RPPR time.",
  reportingWindow: siteReportingWindow.label,
  validatedCheckCount: VALIDATED_CHECK_COUNT,
  dataOwners: DATA_OWNERS_DISPLAY,
  contacts: [
    {
      name: "Xinhui Wang & James Wang",
      role: "Clinical Core & Data Core · data owners",
      email: "xinhuiwa@usc.edu",
      emailNote: "Please cc James Wang for harmonized export / Data Core questions",
    },
  ] as const,
  onThisPage: [
    "Recruitment, demographics (Table 1), neuropathology, outreach, biomarkers, REC, imaging, and specimen requests",
    "Black = Jan 1–date (harmonized data package YTD); green = last RPPR reporting period; red = no data available",
    "Checks & sources tab lists every headline metric, its tier, and the file it came from",
  ] as const,
  notOnThisPage: [
    "Not a live REDCap stream—figures update when we refresh harmonized exports",
    "GeneScreen registry totals come from USC REDCap pulls—not the James Wang harmonized package folder",
    "Integrated imaging summary tables are export snapshots, not calendar year-to-date counts",
  ] as const,
} as const;

/** Short paragraph teams can paste into email or board materials. */
export function dashboardShareParagraph(): string {
  const m = DASHBOARD_MISSION;
  return (
    `The USC ADRC Metrics Dashboard (${m.reportingWindow}) is our shared mid-cycle view of core progress, built after programmatic listening sessions with core leads. It mirrors the visuals and tables we report in RPPR so we can stay aligned between formal milestones. ` +
    `${m.validatedCheckCount} automated checks tie on-screen numbers to harmonized source files; items shown in red are not yet available from those files. ` +
    `Questions: ${m.contacts[0].email} (${m.contacts[0].name}; cc James Wang for Data Core exports).`
  );
}

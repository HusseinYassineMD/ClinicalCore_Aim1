import type { RegistryChartViews } from "@/types/aim1";
import { packageYtd, siteReportingWindow } from "@/data/siteReporting";
import {
  adrcYtdApoeChartProvenance,
  adrcYtdApoeItems,
  adrcYtdBreakdownCaption,
  adrcYtdEthnicityChartProvenance,
  adrcYtdEthnicityItems,
  adrcYtdReferralChartProvenance,
  adrcYtdReferralItems,
} from "@/data/adrcYtdBreakdown";
import { TABLE1_ETHNICITY_BARS } from "@/data/recruitmentChartConstants";

const ytd = packageYtd!;
const ytdCap = siteReportingWindow.periodCaption;
const adrcInitialN = ytd.udsClinical.newInitialEvaluations;
const brsConsentN = ytd.brsAutopsy.newAutopsyConsents;

/** Per-column explainer when "Grant plan (targets)" chart view is selected. */
export const GRANT_PLAN_NOTICES: Record<
  "adrc" | "genescreen" | "brs",
  { is: string[]; isNot: string[] }
> = {
  adrc: {
    is: [
      "Enrollment targets from the Jun 2024 ADRC renewal application (52 new evals/yr).",
      "Ethnicity chart (n=573) is RPPR Table 1 full clinical core cohort (workbook — not James package YTD).",
    ],
    isNot: [
      "Not year-to-date visit activity (use the Year to date toggle).",
      "Not cumulative enrollment over five years.",
    ],
  },
  genescreen: {
    is: [
      "5-year recruitment goals from the Jun 2024 renewal (1,500 study-ready registrants).",
      "Budget context: 300 genotyped/yr in the renewal application.",
    ],
    isNot: [
      "Not year-to-date new members (not in harmonized Data Core export).",
      "Gender, APOE, and ethnicity bars are renewal planning targets only.",
    ],
  },
  brs: {
    is: [
      "5-year autopsy pool target from the Jun 2024 renewal (350 enrolled, 26 consents/yr).",
    ],
    isNot: [
      "Not year-to-date consent demographics — use Year to date toggle for harmonized export counts.",
      "Ethnicity, sex, and APOE bars are renewal planning targets only.",
    ],
  },
};

/** Chart data toggled by year to date vs. grant renewal plan targets. */
export const REGISTRY_CHART_VIEWS: Record<
  "adrc" | "genescreen" | "brs",
  RegistryChartViews
> = {
  adrc: {
    grantPeriodCaption:
      "Renewal targets · Table 1 ethnicity (workbook) · APOE/source not in data package",
    reportingPeriod: [
      {
        title: "Ethnicity",
        type: "bar",
        provenance: "ytd",
        nProvenance: "ytd",
        chartProvenance: adrcYtdEthnicityChartProvenance(),
        n: adrcInitialN,
        nCaption: adrcYtdBreakdownCaption,
        items: adrcYtdEthnicityItems(),
      },
      {
        title: "APOE genotype",
        type: "pie",
        provenance: "ytd",
        nProvenance: "ytd",
        chartProvenance: adrcYtdApoeChartProvenance(),
        n: adrcInitialN,
        nCaption: adrcYtdBreakdownCaption,
        items: adrcYtdApoeItems(),
      },
      {
        title: "Referral source (NACC A1)",
        type: "bar",
        provenance: "ytd",
        nProvenance: "ytd",
        chartProvenance: adrcYtdReferralChartProvenance(),
        n: adrcInitialN,
        nCaption: adrcYtdBreakdownCaption,
        items: adrcYtdReferralItems(),
      },
    ],
    grantPeriod: [
      {
        title: "Ethnicity",
        type: "bar",
        provenance: "unknown",
        n: 573,
        nCaption: "Table 1 · N=573 (workbook · not James harmonized package)",
        items: [...TABLE1_ETHNICITY_BARS],
      },
      {
        title: "APOE genotype",
        type: "pie",
        provenance: "unknown",
        n: 573,
        nCaption: "Not in James data package",
        items: [],
      },
      {
        title: "Recruitment source",
        type: "bar",
        provenance: "unknown",
        n: 573,
        nCaption: "Not in James data package",
        items: [],
      },
    ],
  },

  genescreen: {
    grantPeriodCaption:
      "Renewal targets · 1,500 registrants goal — not in harmonized export",
    reportingPeriod: [
      {
        title: "Ethnicity",
        type: "bar",
        provenance: "unknown",
        n: 0,
        nCaption: `new members · ${ytdCap} · pending export`,
        items: [],
      },
      {
        title: "APOE4",
        type: "pie",
        provenance: "unknown",
        n: 0,
        nCaption: `new members · ${ytdCap} · pending export`,
        items: [],
      },
      {
        title: "Gender",
        type: "bar",
        provenance: "unknown",
        n: 0,
        nCaption: `new members · ${ytdCap} · pending export`,
        items: [],
      },
    ],
    grantPeriod: [
      {
        title: "Gender",
        type: "bar",
        provenance: "unknown",
        n: 1500,
        nCaption: "TARGET · renewal goal",
        items: [
          { label: "Male", count: 450 },
          { label: "Female", count: 1050 },
        ],
      },
      {
        title: "APOE4",
        type: "pie",
        provenance: "unknown",
        n: 1500,
        nCaption: "TARGET · renewal planning",
        items: [
          { label: "APOE4 carrier", count: 750 },
          { label: "Non-carrier", count: 750 },
        ],
      },
      {
        title: "Ethnicity",
        type: "bar",
        provenance: "unknown",
        n: 1500,
        nCaption: "TARGET · renewal planning",
        items: [
          { label: "Hispanic", count: 450 },
          { label: "White", count: 600 },
          { label: "Black", count: 225 },
          { label: "Asian", count: 225 },
        ],
      },
    ],
  },

  brs: {
    grantPeriodCaption:
      "Renewal targets · 350 pool goal — not current YTD harmonized export",
    reportingPeriod: [
      {
        title: "Ethnicity",
        type: "bar",
        nProvenance: "ytd",
        chartProvenance: "unknown",
        n: brsConsentN,
        nCaption: periodCapForBrs(),
        items: [],
      },
      {
        title: "APOE genotype",
        type: "pie",
        nProvenance: "ytd",
        chartProvenance: "unknown",
        n: brsConsentN,
        nCaption: periodCapForBrs(),
        items: [],
      },
      {
        title: "Sex",
        type: "bar",
        nProvenance: "ytd",
        chartProvenance: "unknown",
        n: brsConsentN,
        nCaption: periodCapForBrs(),
        items: [],
      },
    ],
    grantPeriod: [
      {
        title: "Ethnicity",
        type: "bar",
        provenance: "unknown",
        n: 350,
        nCaption: "TARGET · renewal pool goal",
        items: [
          { label: "Hispanic", count: 105 },
          { label: "White", count: 140 },
          { label: "Black", count: 52 },
          { label: "Asian", count: 53 },
        ],
      },
      {
        title: "APOE genotype",
        type: "pie",
        provenance: "unknown",
        n: 350,
        nCaption: "TARGET · renewal planning",
        items: [
          { label: "E3/E3", count: 140 },
          { label: "E3/E4", count: 105 },
          { label: "E4/E4", count: 70 },
          { label: "Other", count: 35 },
        ],
      },
      {
        title: "Sex",
        type: "bar",
        provenance: "unknown",
        n: 350,
        nCaption: "TARGET · renewal planning",
        items: [
          { label: "Male", count: 130 },
          { label: "Female", count: 220 },
        ],
      },
    ],
  },
};

function periodCapForBrs(): string {
  return ytdCap;
}

export const REGISTRY_CHART_VIEWS_FOOTNOTE =
  `${siteReportingWindow.label} · year to date from USC ADRC harmonized export (UDS/BRS dates)`;

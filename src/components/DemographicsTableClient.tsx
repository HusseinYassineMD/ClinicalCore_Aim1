"use client";

import ChartErrorBoundary from "@/components/ChartErrorBoundary";
import DemographicsVisuals, {
  type Table1VisualData,
} from "@/components/DemographicsVisuals";
import DemographicsTable, {
  type Table1ColumnKey,
} from "@/components/DemographicsTable";
import type { DemographicGroup } from "@/types/aim1";
import { formatScopeDate } from "@/lib/formatScopeDate";
import { HeadingLead } from "@/components/HeadingLead";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";

type HarmonizedSnapshot = Table1VisualData & {
  otherUnknown: DemographicGroup;
  meta: {
    source: string;
    asOfDate: string;
    participantCount: number;
    cohortDefinition: string;
    workflowReference: string;
  };
};

const harmonized = table1HarmonizedActiveSnapshot as HarmonizedSnapshot;

const HARMONIZED_COLUMNS: Table1ColumnKey[] = [
  "overall",
  "hispanic",
  "white",
  "black",
  "asian",
  "otherUnknown",
];

export default function DemographicsTableClient() {
  return (
    <div className="dashboard-card overflow-visible p-0 shadow-lg shadow-cpbh-navy/8">
      <div className="px-6 pt-6 pb-3 text-center">
        <h2 className="font-display text-xl font-semibold text-cpbh-navy">
          Table 1: Demographic and clinical characteristics of the clinical core
        </h2>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source={harmonized.meta.source}
          through={formatScopeDate(harmonized.meta.asOfDate)}
        >
          Pink · harmonized active cohort. That snapshot stops before October 16.
          It is not the old RPPR.
        </HeadingLead>
      </div>

      <div
        className="px-4 sm:px-6 pb-4"
        data-deck-slide="demographics-harmonized-active-table"
        data-deck-caption="Demographics · harmonized active cohort"
      >
        <DemographicsTable
          data={harmonized}
          columnKeys={HARMONIZED_COLUMNS}
          valueProvenance="span"
        />
        <p className="mt-3 px-2 py-3 text-xs text-cpbh-navy/50 border-t border-cpbh-mist bg-cpbh-mist/20 rounded-xl">
          {harmonized.meta.cohortDefinition} NIH RPPR enrollment workflow: Cohort 2
          (active through period end) —{" "}
          <code className="text-[11px]">{harmonized.meta.workflowReference}</code>.
          MoCA N=528; APOE ε4 N=475 in source table.
        </p>
      </div>

      <div className="border-t border-cpbh-mist/80 px-4 sm:px-6 pb-6 pt-5">
        <p className="text-xs text-cpbh-navy/55 mb-4">
          Charts below parse the Table 1 cells above. Source:{" "}
          {harmonized.meta.source}. Through:{" "}
          {formatScopeDate(harmonized.meta.asOfDate)}. Bar colors by stratum.
          Numbers in pink. That snapshot stops before October 16.
        </p>
        <ChartErrorBoundary fallbackTitle="Demographics charts could not load">
          <DemographicsVisuals data={harmonized} valueProvenance="span" />
        </ChartErrorBoundary>
      </div>
    </div>
  );
}

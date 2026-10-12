"use client";

import ChartErrorBoundary from "@/components/ChartErrorBoundary";
import DemographicsVisuals, {
  type Table1VisualData,
} from "@/components/DemographicsVisuals";
import DemographicsTable, {
  type Table1ColumnKey,
} from "@/components/DemographicsTable";
import type { DemographicGroup } from "@/types/aim1";
import { siteReportingWindow } from "@/data/siteReporting";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";

type HarmonizedSnapshot = Table1VisualData & {
  otherUnknown: DemographicGroup;
  meta: {
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
      <div className="px-6 pt-6 pb-3">
        <h2 className="font-display text-xl font-semibold text-cpbh-navy">
          Table 1: Demographic and clinical characteristics of the clinical core
        </h2>
        <p className="text-cpbh-navy/60 text-sm mt-1 leading-snug">
          Black · harmonized active ADRC cohort · as of {harmonized.meta.asOfDate} ·
          N={harmonized.meta.participantCount} · EAC RPPR window{" "}
          {siteReportingWindow.label}
        </p>
      </div>

      <div
        className="px-4 sm:px-6 pb-4"
        data-deck-slide="demographics-harmonized-active-table"
        data-deck-caption="Demographics · harmonized active cohort"
      >
        <DemographicsTable
          data={harmonized}
          columnKeys={HARMONIZED_COLUMNS}
          valueProvenance="ytd"
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
          Charts below parse the Table 1 cells above · bar colors by stratum · value
          labels in navy/black (same source as table).
        </p>
        <ChartErrorBoundary fallbackTitle="Demographics charts could not load">
          <DemographicsVisuals data={harmonized} valueProvenance="ytd" />
        </ChartErrorBoundary>
      </div>
    </div>
  );
}

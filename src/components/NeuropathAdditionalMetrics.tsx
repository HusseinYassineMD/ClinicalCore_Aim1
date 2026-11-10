import type { NeuropathMetrics } from "@/types/aim1";
import MetricCard from "./MetricCard";
import {
  brsLatestAutopsyPerformedDate,
  brsLatestConsentDate,
  brsLatestDeathDate,
} from "@/data/siteReporting";
import { formatScopeDate } from "@/lib/formatScopeDate";
import { HeadingLead, sourceThroughText } from "@/components/HeadingLead";
import brsRpprTableDataCore from "@/data/brsRpprTableDataCore2026.json";

interface NeuropathAdditionalMetricsProps {
  data: NeuropathMetrics;
}

export default function NeuropathAdditionalMetrics({
  data,
}: NeuropathAdditionalMetricsProps) {
  const { enrolled, adrcTotal, percent } = data.autopsyEnrollmentRate;
  const hasRate =
    enrolled != null && adrcTotal != null && adrcTotal > 0 && percent != null;
  const enrollmentLabel = hasRate
    ? `${enrolled} / ${adrcTotal} (${percent}%)`
    : "—";

  const deathsLabel =
    data.diedWithAutopsy != null && data.diedWithoutAutopsy != null
      ? `${data.diedWithAutopsy} w/ autopsy · ${data.diedWithoutAutopsy} w/o`
      : String(data.cohortDeaths);

  const mapCmp = data.jamesMapExportComparison;

  return (
    <div
      className="dashboard-card"
      data-deck-slide="neuropath-autopsy-metrics"
      data-deck-caption="Neuropathology · autopsy & consent metrics"
    >
      <HeadingLead
        className="text-cpbh-navy/60 text-sm mb-4"
        source="James Wang · MAPDatabase-BRSCohort_DATA_LABELS_2026-11-06_1248.csv · pink rows from Xinhui Wang, Data Core Table 1"
        through={`${formatScopeDate(brsLatestConsentDate)} last consent · ${formatScopeDate(brsLatestDeathDate)} last death · ${formatScopeDate(brsLatestAutopsyPerformedDate)} last autopsy performed · Xinhui pull ${formatScopeDate(brsRpprTableDataCore.meta.mapBrsDataPullDate)}`}
      >
        Black counts are the November 6 MAP pull, after the October 16 lock.
        Pink counts are Xinhui Wang, MAP pull {formatScopeDate(brsRpprTableDataCore.meta.mapBrsDataPullDate)}.
      </HeadingLead>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="BRS Newly Consented"
          value={data.brsNewlyConsented}
          accent="navy"
          provenance="ytd"
          sublabel={sourceThroughText(
            "James Wang · MAPDatabase-BRSCohort_DATA_LABELS_2026-11-06_1248.csv",
            formatScopeDate(brsLatestConsentDate),
            `Black · ${mapCmp?.newConsents ?? data.brsNewlyConsented} consent dates inside Jan 1–Oct 16 · pull Nov 6, 2026`,
          )}
        />
        <MetricCard
          label="Enrolled in Autopsy Program"
          value={data.enrolledInAutopsyProgram ?? "—"}
          accent="teal"
          provenance="span"
          sublabel={sourceThroughText(
            "Xinhui Wang · Data Core Table 1",
            formatScopeDate(brsRpprTableDataCore.meta.mapBrsDataPullDate),
            `Pink · current enrollment · N=${brsRpprTableDataCore.meta.percentDenominator}${
              mapCmp ? ` · MAP Active in the Nov 6 file: ${mapCmp.activeStatusOne}` : ""
            }`,
          )}
        />
        <MetricCard
          label="Withdrawals"
          value={data.withdrawals ?? "—"}
          accent="purple"
          provenance="span"
          sublabel={sourceThroughText(
            "Xinhui Wang · Data Core Table 1",
            formatScopeDate(brsRpprTableDataCore.meta.mapBrsDataPullDate),
            "Pink · that pull stops before Oct 16. The Nov 6 MAP file has 0 termination dates inside Jan 1–Oct 16. One NP-reported 2026 withdrawal may not be in MAP yet.",
          )}
        />
        <MetricCard
          label="Participant deaths (RPPR table)"
          value={deathsLabel}
          accent="navy"
          provenance="span"
          sublabel={
            mapCmp
              ? sourceThroughText(
                  "Xinhui Wang · Data Core Table 1",
                  formatScopeDate(brsRpprTableDataCore.meta.mapBrsDataPullDate),
                  `Pink · 7 with autopsy and 1 without. Nov 6 file: ${mapCmp.deaths} deaths inside Jan 1–Oct 16, last death ${formatScopeDate(brsLatestDeathDate)}.`,
                )
              : undefined
          }
        />
        <MetricCard
          label="Died with autopsy"
          value={data.diedWithAutopsy ?? data.autopsiesPerformed}
          accent="sky"
          provenance="ytd"
          sublabel={
            mapCmp
              ? sourceThroughText(
                  "James Wang · MAPDatabase-BRSCohort_DATA_LABELS_2026-11-06_1248.csv",
                  formatScopeDate(brsLatestAutopsyPerformedDate),
                  `Black · ${mapCmp.autopsiesPerformed} autopsy performed dates inside Jan 1–Oct 16 · pull Nov 6, 2026`,
                )
              : "QC: death + autopsy_performed_date + autopsy_number"
          }
        />
        <MetricCard
          label="Autopsy Enrollment Rate"
          value={enrollmentLabel}
          accent="teal"
          provenance={hasRate ? "span" : "unknown"}
          sublabel={
            hasRate
              ? sourceThroughText(
                  "Xinhui Wang enrollment ÷ James harmonized active cohort",
                  "September 17, 2026",
                  `Pink · enrolled ${enrolled} ÷ active cohort N=${adrcTotal}. Neither side runs through October 16.`,
                )
              : undefined
          }
        />
      </div>
    </div>
  );
}

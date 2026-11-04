import type { NeuropathMetrics } from "@/types/aim1";
import MetricCard from "./MetricCard";
import {
  brsLatestActivityDate,
  brsLatestAutopsyPerformedDate,
  brsLatestConsentDate,
  brsLatestDeathDate,
} from "@/data/siteReporting";
import { formatScopeDate } from "@/lib/formatScopeDate";
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
      <p className="text-cpbh-navy/60 text-sm mb-4">
        Green · last date in the MAP file {formatScopeDate(brsLatestActivityDate)}{" "}
        (autopsy consent). MAP pull {brsRpprTableDataCore.meta.mapBrsDataPullDate}.
        The file does not include activity through 10/16/2026. James MAP raw
        counts are in the card sublabels where they differ.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="BRS Newly Consented"
          value={data.brsNewlyConsented}
          accent="navy"
          provenance="prior"
          sublabel={
            mapCmp && mapCmp.newConsents !== data.brsNewlyConsented
              ? `James MAP autopsy_consent_date: ${mapCmp.newConsents} · last consent ${formatScopeDate(brsLatestConsentDate)}`
              : `Last autopsy consent in the MAP file: ${formatScopeDate(brsLatestConsentDate)}`
          }
        />
        <MetricCard
          label="Enrolled in Autopsy Program"
          value={data.enrolledInAutopsyProgram ?? "—"}
          accent="teal"
          provenance="prior"
          sublabel={`Data Core current enrollment · N=${brsRpprTableDataCore.meta.percentDenominator}${
            mapCmp ? ` · MAP status=1: ${mapCmp.activeStatusOne}` : ""
          }`}
        />
        <MetricCard
          label="Withdrawals"
          value={data.withdrawals ?? "—"}
          accent="purple"
          provenance="prior"
          sublabel="date_of_termination + Withdraw status · NP-reported case may lag MAP"
        />
        <MetricCard
          label="Participant deaths (RPPR table)"
          value={deathsLabel}
          accent="navy"
          provenance="prior"
          sublabel={
            mapCmp
              ? `James date_of_death rows: ${mapCmp.deaths} · last death ${formatScopeDate(brsLatestDeathDate)}`
              : undefined
          }
        />
        <MetricCard
          label="Died with autopsy"
          value={data.diedWithAutopsy ?? data.autopsiesPerformed}
          accent="sky"
          provenance="prior"
          sublabel={
            mapCmp
              ? `James autopsy_performed_date rows: ${mapCmp.autopsiesPerformed} · last performed ${formatScopeDate(brsLatestAutopsyPerformedDate)}`
              : "QC: death + autopsy_performed_date + autopsy_number"
          }
        />
        <MetricCard
          label="Autopsy Enrollment Rate"
          value={enrollmentLabel}
          accent="teal"
          provenance={hasRate ? "prior" : "unknown"}
          sublabel={
            hasRate
              ? `Data Core enrolled ÷ Table 1 cohort N (${adrcTotal})`
              : undefined
          }
        />
      </div>
    </div>
  );
}

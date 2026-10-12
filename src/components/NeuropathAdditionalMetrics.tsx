import type { NeuropathMetrics } from "@/types/aim1";
import MetricCard from "./MetricCard";
import { siteReportingWindow } from "@/data/siteReporting";
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
        Black · Data Core BRS RPPR table · {brsRpprTableDataCore.meta.windowLabel}{" "}
        (MAP pull {brsRpprTableDataCore.meta.mapBrsDataPullDate}). James MAP raw
        counts ({siteReportingWindow.label}) in card sublabels where they differ.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="BRS Newly Consented"
          value={data.brsNewlyConsented}
          accent="navy"
          provenance="ytd"
          sublabel={
            mapCmp && mapCmp.newConsents !== data.brsNewlyConsented
              ? `James MAP autopsy_consent_date: ${mapCmp.newConsents} (${siteReportingWindow.label})`
              : "autopsy_consent_date in RPPR window"
          }
        />
        <MetricCard
          label="Enrolled in Autopsy Program"
          value={data.enrolledInAutopsyProgram ?? "—"}
          accent="teal"
          provenance="ytd"
          sublabel={`Data Core current enrollment · N=${brsRpprTableDataCore.meta.percentDenominator}${
            mapCmp ? ` · MAP status=1: ${mapCmp.activeStatusOne}` : ""
          }`}
        />
        <MetricCard
          label="Withdrawals"
          value={data.withdrawals ?? "—"}
          accent="purple"
          provenance="ytd"
          sublabel="date_of_termination + Withdraw status · NP-reported case may lag MAP"
        />
        <MetricCard
          label="Participant deaths (RPPR table)"
          value={deathsLabel}
          accent="navy"
          provenance="ytd"
          sublabel={
            mapCmp
              ? `James date_of_death in ${siteReportingWindow.label}: ${mapCmp.deaths}`
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
              ? `James autopsy_performed_date rows: ${mapCmp.autopsiesPerformed}`
              : "QC: death + autopsy_performed_date + autopsy_number"
          }
        />
        <MetricCard
          label="Autopsy Enrollment Rate"
          value={enrollmentLabel}
          accent="teal"
          provenance={hasRate ? "ytd" : "unknown"}
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

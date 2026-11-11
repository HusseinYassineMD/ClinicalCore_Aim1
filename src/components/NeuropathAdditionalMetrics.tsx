import type { NeuropathMetrics } from "@/types/aim1";
import MetricCard from "./MetricCard";
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
        source={`Xinhui Wang · ${brsRpprTableDataCore.meta.sourceFile}`}
        through={formatScopeDate(brsRpprTableDataCore.meta.asOfDate)}
      >
        Black · Brain Research Study table, January 1 through October 16, 2026.
        Received November 10, 2026. James MAP Active{" "}
        {mapCmp?.activeStatusOne ?? "231"} is a different count.
      </HeadingLead>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="BRS Newly Consented"
          value={data.brsNewlyConsented}
          accent="navy"
          provenance="ytd"
          sublabel={sourceThroughText(
            "Xinhui Wang · BRS Table",
            formatScopeDate(brsRpprTableDataCore.meta.asOfDate),
            "Black · new participants enrolled, January 1 through October 16, 2026.",
          )}
        />
        <MetricCard
          label="Enrolled in Autopsy Program"
          value={data.enrolledInAutopsyProgram ?? "—"}
          accent="teal"
          provenance="ytd"
          sublabel={sourceThroughText(
            "Xinhui Wang · BRS Table",
            formatScopeDate(brsRpprTableDataCore.meta.asOfDate),
            `Black · current enrollment N=${brsRpprTableDataCore.meta.percentDenominator}. Active, consent on or before October 16, and still active on October 16.`,
          )}
        />
        <MetricCard
          label="Withdrawals"
          value={data.withdrawals ?? "—"}
          accent="purple"
          provenance="ytd"
          sublabel={sourceThroughText(
            "Xinhui Wang · BRS Table",
            formatScopeDate(brsRpprTableDataCore.meta.asOfDate),
            "Black · 1 withdrawal in January 1 through October 16, 2026. Female 1, male 0.",
          )}
        />
        <MetricCard
          label="Participant deaths (RPPR table)"
          value={deathsLabel}
          accent="navy"
          provenance="ytd"
          sublabel={sourceThroughText(
            "Xinhui Wang · BRS Table",
            formatScopeDate(brsRpprTableDataCore.meta.asOfDate),
            "Black · 7 died with autopsy and 1 died without autopsy.",
          )}
        />
        <MetricCard
          label="Died with autopsy"
          value={data.diedWithAutopsy ?? data.autopsiesPerformed}
          accent="sky"
          provenance="ytd"
          sublabel={sourceThroughText(
            "Xinhui Wang · BRS Table",
            formatScopeDate(brsRpprTableDataCore.meta.asOfDate),
            "Black · died with autopsy. Female 2, male 5.",
          )}
        />
        <MetricCard
          label="Autopsy Enrollment Rate"
          value={enrollmentLabel}
          accent="teal"
          provenance={hasRate ? "ytd" : "unknown"}
          sublabel={
            hasRate
              ? sourceThroughText(
                  "Xinhui Wang · BRS enrollment ÷ ADRC active table",
                  formatScopeDate(brsRpprTableDataCore.meta.asOfDate),
                  `Black · ${enrolled} enrolled ÷ ${adrcTotal} active ADRC participants. Both as of October 16, 2026.`,
                )
              : undefined
          }
        />
      </div>
    </div>
  );
}

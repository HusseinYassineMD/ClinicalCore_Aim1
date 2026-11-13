import type { NeuropathMetrics } from "@/types/aim1";
import MetricCard from "./MetricCard";
import { formatScopeDate } from "@/lib/formatScopeDate";
import { HeadingLead, sourceThroughText } from "@/components/HeadingLead";
import brsRpprTableDataCore from "@/data/brsRpprTableDataCore2026.json";
import minimalContact from "@/data/adrcMinimalContact.json";

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
  const minimalTotal = minimalContact.count;
  const minimalPercent =
    enrolled != null && minimalTotal > 0
      ? Math.round((enrolled / minimalTotal) * 1000) / 10
      : null;
  const minimalLabel =
    enrolled != null && minimalPercent != null
      ? `${enrolled} / ${minimalTotal} (${minimalPercent}%)`
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
      <h3 className="font-display text-xl font-semibold text-cpbh-navy text-center mb-2">
        BRS autopsy program
      </h3>
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
          label="UDS participants enrolled"
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
        <MetricCard
          label="Enrolled over minimal contact"
          value={minimalLabel}
          accent="navy"
          provenance={minimalPercent != null ? "ytd" : "unknown"}
          sublabel={sourceThroughText(
            "Xinhui Wang · BRS enrollment ÷ James Wang · minimal contact",
            formatScopeDate(brsRpprTableDataCore.meta.asOfDate),
            `Black · ${enrolled ?? "—"} enrolled ÷ ${minimalTotal} minimal contact. The ${minimalTotal} are not in the ${adrcTotal ?? minimalContact.activeWithUdsCount}.`,
          )}
        />
      </div>
    </div>
  );
}

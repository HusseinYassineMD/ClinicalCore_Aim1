import brsRpprTable from "@/data/brsRpprTableDataCore2026.json";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";
import { formatScopeDate } from "@/lib/formatScopeDate";
import { metricValueClass } from "@/lib/metricValueClass";
import { HeadingLead } from "@/components/HeadingLead";

type Row = (typeof brsRpprTable.rows)[number];

function formatPercent(value: number | null): string {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export default function BrsRpprTableBlock() {
  const { meta, currentEnrollmentDefinition, methodology, qcNotes, rows } =
    brsRpprTable;

  const adrcActive = table1HarmonizedActiveSnapshot.meta.participantCount;
  const ratePercent =
    Math.round((meta.percentDenominator / adrcActive) * 1000) / 10;

  return (
    <div
      className="dashboard-card overflow-hidden p-0 mt-6"
      data-deck-slide="neuropath-brs-rppr-table"
      data-deck-caption="Neuropathology · BRS RPPR Table 1 (Data Core QC)"
    >
      <div className="px-6 pt-6 pb-4 border-b border-cpbh-mist text-center">
        <h3 className="font-display text-xl font-semibold text-cpbh-navy">
          {meta.title}
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1"
          source={`${meta.preparedBy} · ${meta.sourceFile}`}
          through={formatScopeDate(meta.asOfDate)}
        >
          Black · window {meta.windowLabel}. Received November 10, 2026. Current
          enrollment is as of October 16, 2026. James MAP Active 231 is a
          different count.
        </HeadingLead>
        <p className="text-cpbh-navy/55 text-xs mt-2 leading-relaxed max-w-3xl mx-auto">
          {currentEnrollmentDefinition}
        </p>
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-cpbh-navy text-white">
              <th className="text-left font-medium px-4 py-3">Metric</th>
              <th className="text-right font-medium px-4 py-3"># participants</th>
              <th className="text-right font-medium px-4 py-3">
                BRS enrolled (%)
              </th>
              <th className="text-right font-medium px-4 py-3">F</th>
              <th className="text-right font-medium px-4 py-3">M</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: Row, index) => (
              <tr
                key={row.id}
                className={
                  row.emphasis
                    ? "bg-white font-semibold"
                    : index % 2 === 0
                      ? "bg-cpbh-mist/25"
                      : "bg-white"
                }
              >
                <td className="px-4 py-3 text-cpbh-navy border-b border-cpbh-mist/80">
                  {row.label}
                  {row.emphasis ? "*" : ""}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums border-b border-cpbh-mist/80 ${metricValueClass("ytd", row.participants)}`}
                >
                  {row.participants}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums border-b border-cpbh-mist/80 ${metricValueClass(
                    row.percentOfEnrollment == null ? "unknown" : "ytd",
                    row.percentOfEnrollment ?? "—",
                  )}`}
                >
                  {formatPercent(row.percentOfEnrollment)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums border-b border-cpbh-mist/80 metric-value-ytd">
                  {row.female}
                </td>
                <td className="px-4 py-3 text-right tabular-nums border-b border-cpbh-mist/80 metric-value-ytd">
                  {row.male}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 text-xs text-cpbh-navy/55 space-y-2 border-t border-cpbh-mist bg-cpbh-mist/15">
        <p>
          Autopsy enrollment rate is {meta.percentDenominator} / {adrcActive} ({ratePercent}%).
          That is current enrollment divided by active ADRC participants with UDS data, both as of October 16, 2026.
        </p>
        <p>
          *{meta.percentDenominatorLabel} — percentages in the table use N={meta.percentDenominator}{" "}
          as denominator (RPPR historical algorithm).
        </p>
        <p>
          James MAP Active in the November 6 file is{" "}
          {brsRpprTable.comparisonJamesMapExportOct9.subject_brs_status_active}.
          That file is {brsRpprTable.comparisonJamesMapExportOct9.sourceFile}. It
          is a different count from this table.
        </p>
        <details className="group">
          <summary className="cursor-pointer text-cpbh-sky font-medium">
            QC methodology (expand)
          </summary>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            <li>{methodology.cumulativeEnrollment}</li>
            <li>{methodology.newEnrollment}</li>
            <li>{methodology.withdrawal}</li>
            <li>{methodology.deathsWithAutopsy}</li>
            <li>{methodology.deathsWithoutAutopsy}</li>
            {qcNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}

import brsRpprTable from "@/data/brsRpprTableDataCore2026.json";
import { metricValueClass } from "@/lib/metricValueClass";

type Row = (typeof brsRpprTable.rows)[number];

function formatPercent(value: number | null): string {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export default function BrsRpprTableBlock() {
  const { meta, currentEnrollmentDefinition, methodology, qcNotes, rows } =
    brsRpprTable;

  return (
    <div
      className="dashboard-card overflow-hidden p-0 mt-6"
      data-deck-slide="neuropath-brs-rppr-table"
      data-deck-caption="Neuropathology · BRS RPPR Table 1 (Data Core QC)"
    >
      <div className="px-6 pt-6 pb-4 border-b border-cpbh-mist">
        <h3 className="font-display text-xl font-semibold text-cpbh-navy">
          {meta.title}
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-1">
          Black · {meta.preparedBy} · {meta.windowLabel} · MAP pull{" "}
          {meta.mapBrsDataPullDate}
        </p>
        <p className="text-cpbh-navy/55 text-xs mt-2 leading-relaxed max-w-3xl">
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
                <td className="px-4 py-3 text-right tabular-nums border-b border-cpbh-mist/80 text-cpbh-navy">
                  {row.female}
                </td>
                <td className="px-4 py-3 text-right tabular-nums border-b border-cpbh-mist/80 text-cpbh-navy">
                  {row.male}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 text-xs text-cpbh-navy/55 space-y-2 border-t border-cpbh-mist bg-cpbh-mist/15">
        <p>
          *{meta.percentDenominatorLabel} — percentages use N={meta.percentDenominator}{" "}
          as denominator (RPPR historical algorithm).
        </p>
        <p>
          Raw James MAP export ({brsRpprTable.comparisonJamesMapExportOct9.windowDashboardAggregate}):
          active status=1 n=
          {brsRpprTable.comparisonJamesMapExportOct9.subject_brs_status_active};
          consents {brsRpprTable.comparisonJamesMapExportOct9.newAutopsyConsentsInWindow}{" "}
          · differs after Data Core QC and MAP pull date.
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

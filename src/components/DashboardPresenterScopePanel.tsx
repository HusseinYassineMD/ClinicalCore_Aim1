import {
  SECTION_REPORTING_SCOPES,
  dashboardValidationSnapshot,
} from "@/data/sectionReportingScope";
import { formatScopeDate } from "@/lib/formatScopeDate";

export default function DashboardPresenterScopePanel() {
  const snap = dashboardValidationSnapshot;
  const cov = snap.dataCoverage;

  return (
    <div className="border-b border-cpbh-mist/80 bg-cpbh-mist/20">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-cpbh-navy/55 mb-2">
          Presenter date key · validated {snap.validatedChecks} checks · package
          aggregated {formatScopeDate(snap.packageAggregated.slice(0, 10))}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[11px] sm:text-xs border-collapse">
            <thead>
              <tr className="text-cpbh-navy/50 border-b border-cpbh-mist">
                <th className="py-1.5 pr-3 font-semibold">Section</th>
                <th className="py-1.5 pr-3 font-semibold">Bracket (on page)</th>
                <th className="py-1.5 font-semibold hidden lg:table-cell">Detail</th>
              </tr>
            </thead>
            <tbody>
              {SECTION_REPORTING_SCOPES.map((row) => (
                <tr key={row.id} className="border-b border-cpbh-mist/60 align-top">
                  <td className="py-2 pr-3 font-medium text-cpbh-navy whitespace-nowrap">
                    {row.navLabel}
                  </td>
                  <td className="py-2 pr-3 text-cpbh-navy/75">{row.bracket}</td>
                  <td className="py-2 text-cpbh-navy/60 hidden lg:table-cell">
                    <ul className="list-disc pl-4 space-y-0.5">
                      {row.bullets.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-cpbh-navy/45 leading-relaxed">
          EAC count window ends {formatScopeDate(snap.eacCountWindowEnd)} · row
          coverage in package: UDS visits through{" "}
          {formatScopeDate(cov.udsLatestVisitDate)} · biomarkers through{" "}
          {formatScopeDate(cov.biomarkerLatestCollectionDate)} · BRS through{" "}
          {formatScopeDate(cov.brsLatestActivityDate)} · harmonized drop{" "}
          {formatScopeDate(snap.harmonizedPackageReceived)} · supplement{" "}
          {formatScopeDate(snap.harmonizedSupplement)}.
        </p>
      </div>
    </div>
  );
}

import DashboardNav from "@/components/DashboardNav";
import SitePeriodStrip from "@/components/SitePeriodStrip";
import DashboardMetricAudit from "@/components/DashboardMetricAudit";
import { AUDIT_SUMMARY } from "@/data/dashboardMetricAudit";
import { DASHBOARD_MISSION, dashboardShareParagraph } from "@/data/dashboardNarrative";
import financeBudgetSnapshot from "@/data/financeBudgetSnapshot.json";
import geneScreenWeeklyReference from "@/data/geneScreenWeeklyReference.json";
import rpprDataPackage from "@/data/rpprDataPackage.json";
import jamesSupplementsManifest from "@/data/jamesSupplementsManifest.json";
import brsRpprTableDataCore from "@/data/brsRpprTableDataCore2026.json";
import type { RpprDataPackage } from "@/types/dataPackage";
import { JAMES_SUPPLEMENT_RECEIVED_AT } from "@/data/dataProvenance";

const pkg = rpprDataPackage as RpprDataPackage;
const ytd = pkg.reportingPeriodSummary;
const biospecimenYtd = ytd?.biospecimenInventory?.byComponentYtd;
const biospecimenCumulative = ytd?.biospecimenInventory?.byComponentCumulative;

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function DataSourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cpbh-mist/15">
      <header className="bg-hero-pattern text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-cpbh-soft text-xs font-medium tracking-wide uppercase mb-2">
            USC ADRC · Checks & sources
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3">
            Metric checks & sources
          </h1>
          <p className="text-white/90 text-sm max-w-2xl leading-relaxed">
            {AUDIT_SUMMARY.validatedChecks} automated checks for{" "}
            {AUDIT_SUMMARY.reportingPeriod}. Each row ties a dashboard number to
            its file or RPPR reference.
          </p>
        </div>
      </header>
      <DashboardNav />
      <SitePeriodStrip />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <details className="dashboard-card mb-6 group">
          <summary className="cursor-pointer list-none font-medium text-cpbh-navy text-sm flex items-center justify-between gap-2">
            <span>Email / board wording (optional copy)</span>
            <span className="text-cpbh-navy/40 text-xs group-open:hidden">
              Expand
            </span>
          </summary>
          <p className="mt-3 text-sm text-cpbh-navy/75 leading-relaxed border-t border-cpbh-mist pt-3">
            {dashboardShareParagraph()}
          </p>
          <p className="mt-2 text-sm">
            <a
              href={`mailto:${DASHBOARD_MISSION.contacts[0].email}`}
              className="font-medium text-cpbh-sky hover:text-cpbh-navy"
            >
              {DASHBOARD_MISSION.contacts[0].email}
            </a>
          </p>
        </details>

        <DashboardMetricAudit />

        <section className="mt-10 dashboard-card border-cpbh-purple/20 bg-white">
          <h2 className="font-display text-lg font-semibold text-cpbh-navy mb-2">
            Harmonized RPPR data package
          </h2>
          <p className="text-sm text-cpbh-navy/70 mb-3">
            UDS harmonization, integrated biomarkers, and core exports—the files
            behind year-to-date metrics on the dashboard.
          </p>
          <a
            href="/data-package"
            className="inline-flex text-sm font-medium text-cpbh-sky hover:text-cpbh-navy"
          >
            Open data package →
          </a>
        </section>

        <section className="mt-6 dashboard-card bg-white">
          <h2 className="font-display text-lg font-semibold text-cpbh-navy mb-2">
            Color-coded provenance (CSV & PDF)
          </h2>
          <p className="text-sm text-cpbh-navy/70 mb-3 leading-relaxed">
            Same black / green / red system as the dashboard.{" "}
            <span className="metric-value-ytd font-medium">Black</span> = James
            &amp; Xinhui Wang harmonized data package (and scripted aggregates
            from those CSVs — not hand-entered).{" "}
            <span className="metric-value-prior font-medium">Green</span> = last
            RPPR workbook/PDF (not James calendar YTD).{" "}
            <span className="metric-value-unknown font-medium">Red</span> = not
            in export / placeholder.
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <a
              href="/reports/USC_ADRC_Dashboard_Metric_Provenance.csv"
              className="text-cpbh-sky hover:text-cpbh-navy"
              download
            >
              Download provenance CSV
            </a>
            <a
              href="/reports/USC_ADRC_Dashboard_Metric_Provenance.pdf"
              className="text-cpbh-sky hover:text-cpbh-navy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open provenance PDF
            </a>
          </div>
        </section>

        <section className="mt-6 dashboard-card bg-white">
          <h2 className="font-display text-lg font-semibold text-cpbh-navy mb-2">
            Reference files (Oct 9, 2026) — not on main dashboard
          </h2>
          <p className="text-sm text-cpbh-navy/70 mb-4 leading-relaxed">
            Stored under <code className="text-xs">data/reference/</code> for
            finance and GeneScreen ops. Clinical metric cards still use James
            YTD + REDCap; these files support admin cross-checks.
          </p>
          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-semibold text-cpbh-navy mb-1">
                BRS RPPR Table 1 · Data Core QC ({brsRpprTableDataCore.meta.windowLabel})
              </h3>
              <p className="text-cpbh-navy/75 leading-relaxed">
                {brsRpprTableDataCore.meta.preparedBy} — current enrollment{" "}
                <span className="metric-value-ytd font-semibold">
                  N={brsRpprTableDataCore.meta.percentDenominator}
                </span>{" "}
                (MAP pull {brsRpprTableDataCore.meta.mapBrsDataPullDate}). Authoritative
                for recruitment BRS headline and neuropath cards; James MAP raw export
                kept as cross-check.
              </p>
              <p className="mt-1 text-cpbh-navy/60 text-xs">
                <code className="text-xs">src/data/brsRpprTableDataCore2026.json</code>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-cpbh-navy mb-1">
                James Wang supplements ({JAMES_SUPPLEMENT_RECEIVED_AT})
              </h3>
              <p className="text-cpbh-navy/75 leading-relaxed">
                MAP BRS cohort export, MAP data dictionary, and USC ADRC Biospecimen
                Availability v1.0.1 — copied under{" "}
                <code className="text-xs">data/rppr-data-package/</code> and{" "}
                <code className="text-xs">data/reference/james-supplements/</code>.
                Dashboard black biofluid inventory uses biospecimen long file; NCRAD
                assay cards still use integrated biomarkers long.
              </p>
              <ul className="mt-2 list-disc pl-5 text-cpbh-navy/65 space-y-1">
                <li>
                  BRS:{" "}
                  <code className="text-xs">{ytd?.brsAutopsy?.sourceFile}</code> ·
                  active (status=1) n={ytd?.brsAutopsy?.activeEnrolled ?? "—"} ·
                  autopsy_number rows {ytd?.brsAutopsy?.withAutopsyCaseNumber ?? "—"}
                </li>
                <li>
                  MAP dictionary:{" "}
                  {jamesSupplementsManifest.files.find(
                    (f) => f.role === "mapDataDictionary",
                  )?.path ?? "—"}
                </li>
                <li>
                  Manifest:{" "}
                  <code className="text-xs">src/data/jamesSupplementsManifest.json</code>{" "}
                  ({jamesSupplementsManifest.files.length} files indexed)
                </li>
              </ul>
              {biospecimenYtd ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[520px] text-xs">
                    <thead>
                      <tr className="border-b border-cpbh-mist text-cpbh-navy/70">
                        <th className="py-2 pr-2 font-medium">Component</th>
                        <th className="py-2 px-2 font-medium text-right">YTD participants</th>
                        <th className="py-2 px-2 font-medium text-right">YTD aliquots</th>
                        <th className="py-2 pl-2 font-medium text-right">Cumulative participants</th>
                        <th className="py-2 pl-2 font-medium text-right">Cumulative aliquots</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ["plasma", "Plasma"],
                          ["serum", "Serum"],
                          ["buffy_coat", "Buffy coat"],
                          ["csf", "CSF"],
                        ] as const
                      ).map(([key, label]) => (
                        <tr key={key} className="border-b border-cpbh-mist/70">
                          <td className="py-2 pr-2">{label}</td>
                          <td className="py-2 px-2 text-right tabular-nums metric-value-ytd">
                            {biospecimenYtd[key]?.participants ?? "—"}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums metric-value-ytd">
                            {biospecimenYtd[key]?.aliquots ?? "—"}
                          </td>
                          <td className="py-2 pl-2 text-right tabular-nums">
                            {biospecimenCumulative?.[key]?.participants ?? "—"}
                          </td>
                          <td className="py-2 pl-2 text-right tabular-nums">
                            {biospecimenCumulative?.[key]?.aliquots ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
            <div>
              <h3 className="font-semibold text-cpbh-navy mb-1">
                GeneScreen weekly PDF
              </h3>
              <p className="text-cpbh-navy/75 leading-relaxed">
                {geneScreenWeeklyReference.content}.{" "}
                {geneScreenWeeklyReference.dashboardUse}
              </p>
              <p className="mt-1 text-cpbh-navy/60">
                REDCap YTD new members ({geneScreenWeeklyReference.reportingPeriodLabel}
                ):{" "}
                <span className="metric-value-ytd font-semibold">
                  {geneScreenWeeklyReference.redcapYtdNewMembersForComparison}
                </span>
                . File:{" "}
                <code className="text-xs">{geneScreenWeeklyReference.sourceFile}</code>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-cpbh-navy mb-1">
                PG budget to actuals &amp; GF spendable (CPBH)
              </h3>
              <p className="text-cpbh-navy/75 mb-2">{financeBudgetSnapshot.note}</p>
              <p className="text-cpbh-navy/60 text-xs mb-2">
                {financeBudgetSnapshot.scope} · as of{" "}
                {financeBudgetSnapshot.asOfDate}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[480px]">
                  <thead>
                    <tr className="border-b border-cpbh-mist text-cpbh-navy/70">
                      <th className="py-2 pr-3 font-medium">Project</th>
                      <th className="py-2 px-2 font-medium text-right">Budget</th>
                      <th className="py-2 px-2 font-medium text-right">Actuals</th>
                      <th className="py-2 px-2 font-medium text-right">Obligations</th>
                      <th className="py-2 pl-2 font-medium text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeBudgetSnapshot.pgBudgetSummary.projects.map((row) => (
                      <tr key={row.projectId} className="border-b border-cpbh-mist/80">
                        <td className="py-2 pr-3 font-mono text-xs">{row.projectId}</td>
                        <td className="py-2 px-2 text-right tabular-nums">{usd(row.budget)}</td>
                        <td className="py-2 px-2 text-right tabular-nums">{usd(row.actuals)}</td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {usd(row.obligations)}
                        </td>
                        <td className="py-2 pl-2 text-right tabular-nums">{usd(row.balance)}</td>
                      </tr>
                    ))}
                    {financeBudgetSnapshot.pgBudgetSummary.grandTotal ? (
                      <tr className="font-semibold text-cpbh-navy">
                        <td className="py-2 pr-3">Grand total</td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {usd(financeBudgetSnapshot.pgBudgetSummary.grandTotal.budget)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {usd(financeBudgetSnapshot.pgBudgetSummary.grandTotal.actuals)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {usd(financeBudgetSnapshot.pgBudgetSummary.grandTotal.obligations)}
                        </td>
                        <td className="py-2 pl-2 text-right tabular-nums">
                          {usd(financeBudgetSnapshot.pgBudgetSummary.grandTotal.balance)}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-cpbh-navy/75">
                GF spendable (all listed funds): available balance{" "}
                <span className="font-semibold tabular-nums">
                  {usd(financeBudgetSnapshot.gfSpendableTotals.availableBalance)}
                </span>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 dashboard-card bg-white">
          <h2 className="font-display text-lg font-semibold text-cpbh-navy mb-3">
            Primary source files
          </h2>
          <ul className="text-sm text-cpbh-navy/75 space-y-1.5 list-disc pl-5">
            {AUDIT_SUMMARY.primarySources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

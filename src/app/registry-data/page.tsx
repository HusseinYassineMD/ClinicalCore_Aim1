import DashboardNav from "@/components/DashboardNav";
import SitePeriodStrip from "@/components/SitePeriodStrip";
import { siteReportingWindow } from "@/data/siteReporting";
import RegistryDataExplorer from "@/components/RegistryDataExplorer";
import manifest from "@/data/registryManifest.json";
import type { RegistryManifest } from "@/types/registry";

export default function RegistryDataPage() {
  const data = manifest as RegistryManifest;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-hero-pattern text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-cpbh-soft text-sm font-medium tracking-wide uppercase mb-1">
                USC ADRC
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
                Registry Data Summaries
              </h1>
              <p className="text-white/80 text-sm">
                ATN, BRS, and UDS · aggregated counts only · site period{" "}
                {siteReportingWindow.label} · last indexed {data.lastUpdated}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-sm">
              <span className="text-cpbh-soft block text-xs uppercase tracking-wide">
                Datasets summarized
              </span>
              <span className="font-medium">
                {data.datasets.length} files ·{" "}
                {data.totals?.rows.toLocaleString() ?? "—"} records indexed
              </span>
            </div>
          </div>
        </div>
      </header>
      <DashboardNav />
      <SitePeriodStrip />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <RegistryDataExplorer manifest={data} />
      </main>
    </div>
  );
}

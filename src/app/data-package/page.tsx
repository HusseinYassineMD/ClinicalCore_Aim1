import DashboardHeader from "@/components/DashboardHeader";
import DashboardNav from "@/components/DashboardNav";
import SitePeriodStrip from "@/components/SitePeriodStrip";
import DataPackageExplorer from "@/components/DataPackageExplorer";
import { aim1MockData } from "@/data/aim1MockData";
import packageData from "@/data/rpprDataPackage.json";
import type { RpprDataPackage } from "@/types/dataPackage";

export default function DataPackagePage() {
  const dash = aim1MockData;
  const data = packageData as RpprDataPackage;

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        reportingPeriod={dash.reportingPeriod}
        grantPeriod={dash.grantPeriod}
        lastUpdated={data.lastAggregated}
      />
      <DashboardNav />
      <SitePeriodStrip />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-cpbh-purple text-sm font-medium uppercase tracking-wide mb-1">
            USC ADRC · Data pipelines
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy mb-2">
            {data.packageLabel}
          </h1>
          <p className="text-cpbh-navy/65 text-sm max-w-3xl">
            UDS harmonization, integrated biomarkers, and MAP REDCap cohort
            summaries — subject coverage, biomarker availability, and pipeline
            reports.
          </p>
        </div>

        <DataPackageExplorer data={data} />
      </main>
    </div>
  );
}

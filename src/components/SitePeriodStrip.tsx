import Link from "next/link";
import { siteReportingWindow } from "@/data/siteReporting";
import { lastRpprReportingPeriod } from "@/data/reportingPeriodLegend";
import { DASHBOARD_UI_STAMP } from "@/data/dashboardBuildStamp";

export default function SitePeriodStrip() {
  return (
    <div className="border-b border-cpbh-mist/80 bg-white">
      <p className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-center text-xs text-cpbh-navy/70">
        <span className="font-medium text-cpbh-navy">EAC count window</span>{" "}
        {siteReportingWindow.label}
        <span className="text-cpbh-navy/50">
          {" "}
          (row dates may end earlier — see Data sources)
        </span>
        <span className="mx-2 text-cpbh-mist">|</span>
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>
            <span className="inline-block w-2 h-2 rounded-sm bg-neutral-950 align-middle mr-1" />
            Black · Jan 1–date ({siteReportingWindow.label})
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-sm bg-emerald-700 align-middle mr-1" />
            Green · last RPPR ({lastRpprReportingPeriod})
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-sm bg-red-600 align-middle mr-1" />
            Red · no data
          </span>
        </span>
        <span className="mx-2 text-cpbh-mist hidden sm:inline">|</span>
        <Link
          href="/data-sources"
          className="font-medium text-cpbh-sky hover:text-cpbh-navy underline-offset-2 hover:underline"
        >
          View checks
        </Link>
        <span className="mx-2 text-cpbh-mist hidden md:inline">|</span>
        <span
          className="hidden md:inline text-[10px] text-cpbh-navy/45 tabular-nums"
          title="Confirms the dashboard JavaScript bundle includes the latest chart code"
        >
          UI {DASHBOARD_UI_STAMP}
        </span>
      </p>
    </div>
  );
}

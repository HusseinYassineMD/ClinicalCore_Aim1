import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";
import SitePeriodStrip from "@/components/SitePeriodStrip";

const PENDING_ITEMS = [
  {
    title: "Registries",
    detail: "Registry Summaries file index — review later.",
    href: "/registry-data",
  },
  {
    title: "Data checks",
    detail: "Metric checks & sources — review later.",
    href: "/data-sources",
  },
  {
    title: "Site-wide / study-wide availability",
    detail:
      "Imaging study-wide availability table under Metrics → Imaging. Held for quality review.",
    href: "/#imaging-study-wide",
  },
  {
    title: "QCs",
    detail: "Imaging QC metrics under Metrics → Imaging. Held for quality review.",
    href: "/#imaging-qc",
  },
  {
    title: "IDA imaging uploads",
    detail:
      "IDA image ID upload counts under Metrics → Imaging. Held for quality review.",
    href: "/#imaging-ida-uploads",
  },
] as const;

export default function QualityTestPendingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cpbh-mist/15">
      <header className="bg-hero-pattern text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-cpbh-soft text-xs font-medium tracking-wide uppercase mb-2">
            USC ADRC · Quality test pending
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3">
            Quality test pending
          </h1>
          <p className="text-white/90 text-sm max-w-2xl leading-relaxed">
            Placeholders for registries, data checks, and imaging blocks we will
            review later. Numbers on the Metrics Imaging page stay visible below
            USC Scan / CLARiTI for now.
          </p>
        </div>
      </header>
      <DashboardNav />
      <SitePeriodStrip />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="dashboard-card border-red-200/80 bg-white space-y-4">
          <p className="text-sm metric-value-unknown font-medium">
            Pending quality review — open when ready.
          </p>
          <ul className="divide-y divide-cpbh-mist">
            {PENDING_ITEMS.map((item) => (
              <li key={item.title} className="py-4 first:pt-0 last:pb-0">
                <Link
                  href={item.href}
                  className="group block hover:bg-cpbh-mist/30 -mx-2 px-2 py-1 rounded-lg transition-colors"
                >
                  <span className="font-display text-lg font-semibold text-cpbh-navy group-hover:text-cpbh-purple">
                    {item.title}
                  </span>
                  <p className="text-sm text-cpbh-navy/65 mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

import { formatLastUpdated } from "@/lib/formatLastUpdated";

interface DashboardHeaderProps {
  reportingPeriod: string;
  grantPeriod: string;
  lastUpdated: string;
}

export default function DashboardHeader({
  reportingPeriod,
  grantPeriod,
  lastUpdated,
}: DashboardHeaderProps) {
  return (
    <header className="w-full shrink-0 bg-hero-pattern text-white">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-cpbh-soft text-xs font-medium tracking-wide uppercase mb-2">
              USC ADRC
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-1 leading-tight">
              Metrics dashboard
            </h1>
            <p className="text-white/80 text-sm">
              Grant period {grantPeriod}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-2 text-sm">
            <div className="rounded-lg px-4 py-2 border border-white/25 bg-white/10">
              <span className="text-cpbh-soft block text-xs uppercase tracking-wide">
                Year to date
              </span>
              <span className="font-medium whitespace-nowrap">{reportingPeriod}</span>
            </div>
            <div className="rounded-lg px-4 py-2 border border-white/25 bg-white/10">
              <span className="text-cpbh-soft block text-xs uppercase tracking-wide">
                Last Updated
              </span>
              <span className="font-medium whitespace-nowrap" suppressHydrationWarning>
                {formatLastUpdated(lastUpdated)}
              </span>
            </div>
            <div className="rounded-lg px-4 py-2 border border-white/25 bg-white/10 text-center">
              <span className="text-cpbh-soft block text-xs uppercase tracking-wide">
                Status
              </span>
              <span className="font-medium whitespace-nowrap">Current snapshot</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

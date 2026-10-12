import type { RecruitmentData } from "@/types/aim1";
import MetricCard from "./MetricCard";

interface RecruitmentSectionProps {
  title: string;
  data: RecruitmentData;
}

export default function RecruitmentSection({
  title,
  data,
}: RecruitmentSectionProps) {
  return (
    <div className="dashboard-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-cpbh-navy">
            {title}
          </h3>
          <p className="text-cpbh-navy/60 text-sm">By recruitment source</p>
        </div>
        <div className="shrink-0">
          <MetricCard
            label="Total Recruited"
            value={data.total}
            accent="purple"
          />
        </div>
      </div>

      <div className="space-y-3">
        {data.bySource.map((item) => (
          <div
            key={item.source}
            className="flex items-center justify-between rounded-xl border border-cpbh-mist bg-cpbh-mist/30 px-4 py-3"
          >
            <span className="font-medium text-cpbh-navy">{item.source}</span>
            <span className="text-lg font-semibold text-cpbh-purple">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

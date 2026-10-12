import type { GeneScreenMetrics as GeneScreenData } from "@/types/aim1";

interface GeneScreenMetricsProps {
  data: GeneScreenData;
}

function StatLine({
  value,
  label,
  bold = true,
}: {
  value: number;
  label: string;
  bold?: boolean;
}) {
  return (
    <p className={`text-cpbh-navy ${bold ? "font-semibold" : "font-normal"}`}>
      <span className="text-lg">{value}</span>{" "}
      <span className="text-sm">{label}</span>
    </p>
  );
}

function MetricColumn({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-6 py-5 border-r border-cpbh-mist last:border-r-0">
      {title && (
        <p className="text-xs font-medium text-cpbh-purple uppercase tracking-wide mb-1">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

export default function GeneScreenMetrics({ data }: GeneScreenMetricsProps) {
  const genotypeLine = data.genotypes
    .map((g) => `${g.count} ${g.label}`)
    .join("  •  ");

  return (
    <div className="dashboard-card overflow-hidden p-0 border-t-4 border-t-cpbh-purple">
      {/* Header bar */}
      <div className="bg-cpbh-deep text-white text-center py-3 px-4">
        <p className="font-display text-lg font-semibold tracking-wide">
          {data.yearLabel}
        </p>
      </div>

      {/* Summary box */}
      <div className="bg-cpbh-soft/50 text-center py-5 px-4 space-y-2 border-b border-cpbh-mist">
        <p className="text-cpbh-navy font-semibold text-base">
          {data.membersAdded} Registry Members Add (
          {data.membersWithdrew > 0 ? "-" : ""}
          {data.membersWithdrew} Registry Members Withdrew)
        </p>
        <p className="text-cpbh-navy/80 text-sm">
          {data.males} Males &nbsp;•&nbsp; {data.females} Females
        </p>
        <p className="text-cpbh-navy/70 text-xs">{genotypeLine}</p>
      </div>

      {/* Three metric columns — matches GS1.png */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-cpbh-mist/20">
        <MetricColumn title="Leads & Contacts">
          <StatLine value={data.leads.newLeadsAdded} label="New Leads Added" />
          <StatLine
            value={data.leads.contactsInitiated}
            label="Contacts Initiated"
          />
          <StatLine
            value={data.leads.contactsCompleted}
            label="Contacts Completed"
          />
        </MetricColumn>

        {data.surveys ? (
          <MetricColumn title="Survey Progress">
            <StatLine value={data.surveys.initiated} label="Survey Initiated" />
            <StatLine
              value={data.surveys.incomplete}
              label="Incomplete"
              bold={false}
            />
            <StatLine
              value={data.surveys.disqualified}
              label="Disqualified"
              bold={false}
            />
            <StatLine value={data.surveys.completed} label="Completed" />
          </MetricColumn>
        ) : null}

        <MetricColumn title="Verification & Enrollment">
          <StatLine
            value={data.enrollment.surveysCompleted}
            label="Surveys Completed"
          />
          <StatLine
            value={data.enrollment.surveysVerified}
            label="Surveys Verified"
          />
          <StatLine
            value={data.enrollment.firstKitsMailed}
            label="First Kits Mailed"
          />
          <StatLine
            value={data.enrollment.secondKitsMailed}
            label="Second Kits Mailed"
          />
          <StatLine
            value={data.enrollment.genotypesReceived}
            label="Genotypes Received"
          />
          <StatLine
            value={data.enrollment.membersEnrolled}
            label="Members Enrolled"
          />
        </MetricColumn>
      </div>
    </div>
  );
}

import type { OreOutreachMetrics } from "@/types/aim1";
import MetricCard from "./MetricCard";
import { METRIC_SOURCES } from "@/data/metricSources";
import { formatInteger } from "@/lib/formatNumber";
import { LAST_RPPR_SOURCE } from "@/data/dataProvenance";
import OreCommunityOutreachActivitiesTable from "@/components/OreCommunityOutreachActivitiesTable";

interface OreOutreachBlockProps {
  outreach: OreOutreachMetrics;
}

export default function OreOutreachBlock({
  outreach,
}: OreOutreachBlockProps) {
  const outreachMetrics = [
    {
      label: "Community Events (Table E1)",
      value: outreach.communityEvents,
      accent: "navy" as const,
    },
    {
      label: "Event Attendees",
      value: formatInteger(outreach.eventAttendees),
      accent: "purple" as const,
    },
    {
      label: "New Online Enrollments",
      value: outreach.newOnlineEnrollments,
      accent: "teal" as const,
    },
    {
      label: "Community Groups Contacted",
      value: outreach.communityGroupsContacted,
      accent: "sky" as const,
    },
    {
      label: "Groups Collaborating",
      value: outreach.groupsCollaborating,
      accent: "navy" as const,
    },
    {
      label: "Advisory Committee Meetings",
      value: outreach.advisoryCommitteeMeetings,
      accent: "purple" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy">
          Outreach, Recruitment, and Engagement
        </h2>
        <p className="text-cpbh-navy/60 text-sm mt-1">
          ORE Core · community outreach and GeneScreen
        </p>
      </div>

      {outreach.communityOutreachActivities ? (
        <div
          data-deck-slide="ore-outreach-activities-table"
          data-deck-caption="ORE · community outreach activities (Table E1)"
        >
          <OreCommunityOutreachActivitiesTable
            data={outreach.communityOutreachActivities}
          />
        </div>
      ) : null}

      <div
        className="dashboard-card"
        data-deck-slide="ore-community-outreach"
        data-deck-caption="ORE · community outreach summary"
      >
        <div className="mb-4">
          <h3 className="font-display text-lg font-semibold text-cpbh-navy">
            Community Outreach Summary
          </h3>
          <p className="text-cpbh-navy/60 text-sm mt-1">
            {METRIC_SOURCES.oreCore} · Aim 2 · Table E1/E2 ·{" "}
            <span className="text-emerald-800 font-medium">{LAST_RPPR_SOURCE}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {outreachMetrics.map((item) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              accent={item.accent}
              provenance="prior"
              sublabel="Green · last RPPR reporting period"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

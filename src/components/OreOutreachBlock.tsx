import type {
  OreOutreachMetrics,
  OreEngagementGoals,
} from "@/types/aim1";
import MetricCard from "./MetricCard";
import ThermometerMetric from "./ThermometerMetric";
import {
  BUDGET_TARGETS,
  reportingPeriodTargetNote,
} from "@/data/budgetTargets";
import { METRIC_SOURCES } from "@/data/metricSources";
import { formatInteger } from "@/lib/formatNumber";
import { LAST_RPPR_SOURCE } from "@/data/dataProvenance";
import OreCommunityOutreachActivitiesTable from "@/components/OreCommunityOutreachActivitiesTable";

interface OreOutreachBlockProps {
  outreach: OreOutreachMetrics;
  engagement: OreEngagementGoals;
}

export default function OreOutreachBlock({
  outreach,
  engagement,
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

  const bh4mCurrent = engagement.brainHealth4MeEngaged ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy">
          Outreach, Recruitment, and Engagement
        </h2>
        <p className="text-cpbh-navy/60 text-sm mt-1">
          ORE Core · community outreach, GeneScreen, and engagement goals
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

      <div
        className="dashboard-card"
        data-deck-slide="ore-engagement-goals"
        data-deck-caption="ORE · engagement goal progress"
      >
        <div className="mb-4">
          <h3 className="font-display text-lg font-semibold text-cpbh-navy">
            Goal Progress
          </h3>
          <p className="text-cpbh-navy/60 text-sm mt-1">
            Reporting-period progress vs. budget justification targets
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThermometerMetric
            label="Community Advisory Boards"
            current={engagement.communityAdvisoryBoardMeetings}
            target={BUDGET_TARGETS.communityAdvisoryBoardMeetingsPerYear}
            targetNote={`Budget ${BUDGET_TARGETS.communityAdvisoryBoardMeetingsPerYear}/yr · not in James data package`}
            provenance="unknown"
            accent="purple"
          />
          <ThermometerMetric
            label="Brain Health 4 Me Engagement"
            current={bh4mCurrent}
            target={BUDGET_TARGETS.brainHealth4MeSubjects}
            targetNote={`${METRIC_SOURCES.budgetJustification} · ${BUDGET_TARGETS.brainHealth4MeSubjects} subjects`}
            provenance="unknown"
            accent="navy"
          />
          <ThermometerMetric
            label="GeneScreen Recruitment"
            current={engagement.geneScreenNewMembers}
            target={BUDGET_TARGETS.geneScreenRecruitmentReportingPeriod}
            targetNote={`Year to date · budget 300/year · ${METRIC_SOURCES.oreCore} Aim 1 · counts not in harmonized export yet`}
            provenance="unknown"
            accent="teal"
          />
        </div>
        <p className="text-xs text-cpbh-navy/50 mt-4 leading-snug">
          Other budget denominators on file: CAB planning meetings (
          {BUDGET_TARGETS.cabPlanningMeetingsPerYear}/year),{" "}
          {BUDGET_TARGETS.cabParticipantsPerMeeting} CAB participants/meeting, BH4M{" "}
          {BUDGET_TARGETS.brainHealth4MeDataPointsPerSubject} data points/subject
          (baseline, T1, T2, T3).
        </p>
      </div>
    </div>
  );
}

import type { RecMetrics, RecRosterData } from "@/types/aim1";
import MetricCard from "./MetricCard";
import RecRosterPanel from "./RecRosterPanel";

interface RecSectionProps {
  data: RecMetrics;
  roster: RecRosterData;
}

export default function RecSection({ data, roster }: RecSectionProps) {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy">
          REC
        </h2>
        <p className="text-cpbh-navy/60 text-sm mt-1">
          Research Education Component · speaker series, scholars, faculty, and
          training programs
        </p>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold text-cpbh-navy mb-3">
          Speaker series
        </h3>
        <div className="dashboard-card">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Completed / Scheduled"
              value={`${data.completed} / ${data.scheduled}`}
              sublabel={`Friday sessions · as of ${data.asOfDate}`}
              accent="teal"
              provenance="unknown"
            />
            <MetricCard
              label="Avg No. Attendees"
              value={data.avgAttendees}
              accent="navy"
              provenance="unknown"
            />
            <MetricCard
              label="Total No. Attendees"
              value={data.totalAttendees}
              accent="sky"
              provenance="unknown"
            />
          </div>
          <p className="text-xs text-cpbh-navy/45 mt-4 border-t border-cpbh-mist pt-3">
            Schedule from ADRC REC Speaker Series ·{" "}
            <span className="font-mono">{data.seriesLabel}</span> · sync via{" "}
            <span className="font-mono">npm run sync:rec</span> (includes roster
            CSVs)
          </p>
        </div>
      </div>

      <div
        data-deck-slide="rec-roster"
        data-deck-caption="REC · scholars, faculty, and training programs"
      >
        <h3 className="font-display text-xl font-semibold text-cpbh-navy mb-3">
          Scholars, faculty &amp; programs
        </h3>
        <RecRosterPanel roster={roster} />
      </div>
    </section>
  );
}

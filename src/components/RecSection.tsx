import type { RecMetrics, RecRosterData } from "@/types/aim1";
import MetricCard from "./MetricCard";
import RecRosterPanel from "./RecRosterPanel";
import SectionScopeBracket from "@/components/SectionScopeBracket";
import { formatScopeDate } from "@/lib/formatScopeDate";

interface RecSectionProps {
  data: RecMetrics;
  roster: RecRosterData;
}

export default function RecSection({ data, roster }: RecSectionProps) {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy">
          <span className="block">REC</span>
          <SectionScopeBracket sectionId="rec" className="block mt-2" />
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
              sublabel={
                data.attendanceSessionCount
                  ? `${data.attendanceSessionCount} sessions with attendance reported`
                  : undefined
              }
              accent="navy"
              provenance="ytd"
            />
            <MetricCard
              label="Total No. Attendees"
              value={data.totalAttendees}
              accent="sky"
              provenance="ytd"
            />
          </div>
          {data.attendanceSessions.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-cpbh-navy/50 border-b border-cpbh-mist">
                    <th className="py-2 pr-4 font-semibold">Session date</th>
                    <th className="py-2 text-right font-semibold tabular-nums">
                      Zoom attendance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendanceSessions.map((row) => (
                    <tr
                      key={row.sessionDate}
                      className="border-b border-cpbh-mist/70 last:border-0"
                    >
                      <td className="py-2 pr-4 text-cpbh-navy/80">
                        {formatScopeDate(row.sessionDate)}
                      </td>
                      <td className="py-2 text-right tabular-nums font-medium text-cpbh-navy">
                        {row.attendees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
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

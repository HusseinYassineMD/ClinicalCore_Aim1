import type { OreCommunityOutreachActivitiesTable as TableData } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";
import { metricValueClass } from "@/lib/metricValueClass";

export default function OreCommunityOutreachActivitiesTable({
  data,
}: {
  data: TableData;
}) {
  const prov = data.provenance;

  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="bg-cpbh-navy px-4 sm:px-6 py-3">
        <h3 className="font-display text-base sm:text-lg font-semibold text-white leading-snug">
          {data.title}
        </h3>
        <p className="text-white/75 text-xs mt-1 leading-snug">
          {data.source}
          {data.reportingContext ? ` · ${data.reportingContext}` : null}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm border-collapse">
          <thead>
            <tr className="bg-amber-100 border-b border-amber-200/80">
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-cpbh-navy"
              >
                Activity type
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-cpbh-navy whitespace-nowrap"
              >
                # Events × type
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-cpbh-navy whitespace-nowrap"
              >
                # Attendees × type
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr
                key={row.activityType}
                className={i % 2 === 0 ? "bg-white" : "bg-cpbh-mist/30"}
              >
                <td className="px-4 py-2.5 text-cpbh-navy/90 text-xs sm:text-sm leading-snug">
                  {row.activityType}
                </td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums font-semibold text-xs sm:text-sm ${metricValueClass(prov, row.events)}`}
                >
                  {formatInteger(row.events)}
                </td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums font-semibold text-xs sm:text-sm whitespace-nowrap ${metricValueClass(prov, row.attendees)}`}
                >
                  {row.attendees == null ? (
                    <span className="text-cpbh-navy/45 font-normal">n/a</span>
                  ) : (
                    formatInteger(row.attendees)
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-cpbh-mist/60 border-t-2 border-cpbh-navy/20 font-semibold">
              <td className="px-4 py-3 text-cpbh-navy text-sm">
                Total number events / activities
              </td>
              <td
                className={`px-4 py-3 text-right tabular-nums text-sm ${metricValueClass(prov, data.totalEvents)}`}
              >
                {formatInteger(data.totalEvents)}
              </td>
              <td
                className={`px-4 py-3 text-right tabular-nums text-sm ${metricValueClass(prov, data.totalAttendees)}`}
              >
                {formatInteger(data.totalAttendees)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="px-4 sm:px-6 py-2.5 text-[11px] text-cpbh-navy/55 border-t border-cpbh-mist bg-cpbh-mist/20 leading-snug">
        Added alongside the Community Outreach Summary cards above (Table E1/E2
        unchanged). Green = ORE Core / last RPPR period · not James harmonized
        YTD. Radio rows: listeners not tracked (n/a).
      </p>
    </div>
  );
}

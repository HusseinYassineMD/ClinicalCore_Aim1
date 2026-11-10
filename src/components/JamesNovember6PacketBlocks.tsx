import type { ReactNode } from "react";
import packet from "@/data/jamesNovember6Packet.json";
import { formatScopeDate } from "@/lib/formatScopeDate";
import { sourceThroughText } from "@/components/HeadingLead";

type CountRow = { label: string; count: number };

function n(value: number): string {
  return value.toLocaleString("en-US");
}

function share(count: number, total: number): string {
  return `${((count / total) * 100).toFixed(1)}%`;
}

function byCount(rows: CountRow[]): CountRow[] {
  return [...rows].sort((a, b) => b.count - a.count);
}

function Shell({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="px-6 pt-6 pb-4 text-center">
        <h3 className="font-display text-xl font-semibold text-cpbh-navy">
          {title}
        </h3>
        <p className="text-sm text-cpbh-navy/60 mt-2 max-w-3xl mx-auto leading-relaxed">
          {note}
        </p>
      </div>
      <div className="px-2 pb-6 space-y-6">{children}</div>
    </div>
  );
}

function MiniTable({
  title,
  field,
  rows,
  total,
}: {
  title: string;
  field: string;
  rows: CountRow[];
  total: number;
}) {
  return (
    <div className="overflow-x-auto px-4">
      <p className="text-sm font-semibold text-cpbh-navy mb-2">{title}</p>
      <p className="text-xs text-cpbh-navy/50 mb-2 font-mono">{field}</p>
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="bg-cpbh-navy text-white">
            <th className="text-left font-medium px-4 py-2">Group</th>
            <th className="text-right font-medium px-4 py-2">Participants</th>
            <th className="text-right font-medium px-4 py-2">Share</th>
          </tr>
        </thead>
        <tbody>
          {byCount(rows).map((row) => (
            <tr key={row.label} className="border-b border-cpbh-mist/80">
              <td className="px-4 py-2 text-cpbh-navy">{row.label}</td>
              <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                {n(row.count)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                {share(row.count, total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JamesUdsPacketBlock() {
  const uds = packet.uds;
  return (
    <Shell
      title={`James UDS packet · ${uds.version}`}
      note={sourceThroughText(
        `James Wang · ${uds.sourceFiles.join(", ")}`,
        formatScopeDate(uds.lastVisitDate),
        `Pink · whole file, not the January 1–October 16 visit count. ${n(uds.participants)} participants, ${n(uds.visits)} UDS visits, ${n(uds.milestoneEvents)} milestone events.`,
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MiniTable
          title="Current participation status"
          field={uds.statusField}
          rows={uds.status}
          total={uds.participants}
        />
        <MiniTable
          title="Latest cognitive diagnosis"
          field={uds.cognitiveDxField}
          rows={uds.cognitiveDx}
          total={uds.participants}
        />
        <MiniTable
          title="Recorded sex"
          field={uds.sexField}
          rows={uds.sex}
          total={uds.participants}
        />
        <MiniTable
          title="Hispanic / Latino"
          field={uds.hispanicField}
          rows={uds.hispanic}
          total={uds.participants}
        />
      </div>
    </Shell>
  );
}

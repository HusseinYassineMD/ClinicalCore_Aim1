import type { ReactNode } from "react";
import type { RecRosterData } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";

function YesNo({ value }: { value: boolean }) {
  return (
    <span
      className={
        value
          ? "text-cpbh-navy font-semibold"
          : "text-red-800/80 font-medium"
      }
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

function TableShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="bg-cpbh-navy px-4 sm:px-6 py-3">
        <h3 className="font-display text-base sm:text-lg font-semibold text-white leading-snug">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-white/75 text-xs mt-1 leading-snug">{subtitle}</p>
        ) : null}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export default function RecRosterPanel({ roster }: { roster: RecRosterData }) {
  const st = roster.scholarsTrainees.summary;
  const fac = roster.faculty.summary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-cpbh-mist bg-white px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-cpbh-navy/50 font-semibold">
            Current scholars
          </p>
          <p className="text-2xl font-display font-semibold text-cpbh-navy tabular-nums">
            {formatInteger(st.currentScholars)}
          </p>
        </div>
        <div className="rounded-lg border border-cpbh-mist bg-white px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-cpbh-navy/50 font-semibold">
            Current trainees
          </p>
          <p className="text-2xl font-display font-semibold text-cpbh-navy tabular-nums">
            {formatInteger(st.currentTrainees)}
          </p>
        </div>
        <div className="rounded-lg border border-cpbh-mist bg-white px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-cpbh-navy/50 font-semibold">
            REC faculty
          </p>
          <p className="text-2xl font-display font-semibold text-cpbh-navy tabular-nums">
            {formatInteger(fac.total)}
          </p>
          <p className="text-[10px] text-cpbh-navy/45 mt-0.5">
            {fac.executiveCommittee} executive committee
          </p>
        </div>
        <div className="rounded-lg border border-cpbh-mist bg-white px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-cpbh-navy/50 font-semibold">
            Training programs
          </p>
          <p className="text-2xl font-display font-semibold text-cpbh-navy tabular-nums">
            {formatInteger(roster.trainingPrograms.summary.totalPrograms)}
          </p>
        </div>
      </div>

      <TableShell
        title={roster.scholarsTrainees.title}
        subtitle={`${st.total} listed · ${st.current} current · ${st.past} past · RPPR Table 1a`}
      >
        <table className="w-full min-w-[960px] text-sm border-collapse">
          <thead>
            <tr className="bg-amber-100 border-b border-amber-200/80">
              {[
                "Name",
                "Current / past",
                "Scholar / trainee",
                "Level",
                "Area of research",
                "Progress",
                "ADRC?",
                "ADRD field?",
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-cpbh-navy"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.scholarsTrainees.rows.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? "bg-white" : "bg-amber-50/40"}
              >
                <td className="px-3 py-2 font-medium text-cpbh-navy whitespace-nowrap">
                  {row.name}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs">
                  {row.currentOrPast}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs">
                  {row.scholarOrTrainee}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs max-w-[8rem]">
                  {row.trainingLevel}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs leading-snug min-w-[12rem]">
                  {row.researchArea}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs leading-snug min-w-[10rem]">
                  {row.progress}
                </td>
                <td className="px-3 py-2 text-xs">
                  <YesNo value={row.adrcAffiliated} />
                </td>
                <td className="px-3 py-2 text-xs">
                  <YesNo value={row.adrdField} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <TableShell
        title={roster.faculty.title}
        subtitle={roster.faculty.footnote}
      >
        <table className="w-full min-w-[880px] text-sm border-collapse">
          <thead>
            <tr className="bg-amber-100 border-b border-amber-200/80">
              {[
                "Last name",
                "First name",
                "Title",
                "Institution / department",
                "Theme",
                "Research area",
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-cpbh-navy"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.faculty.rows.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? "bg-white" : "bg-amber-50/40"}
              >
                <td className="px-3 py-2 font-medium text-cpbh-navy whitespace-nowrap">
                  {row.lastName}
                  {row.executiveCommittee ? (
                    <span className="text-amber-800 ml-0.5" title="Executive committee">
                      *
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85">{row.firstName}</td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs">{row.title}</td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs">
                  {row.institutionDepartment}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs">{row.theme}</td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs leading-snug min-w-[14rem]">
                  {row.researchArea}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <TableShell title={roster.trainingPrograms.title}>
        <table className="w-full min-w-[720px] text-sm border-collapse">
          <thead>
            <tr className="bg-amber-100 border-b border-amber-200/80">
              {[
                "Program",
                "Post-doc trainees / year",
                "% minority researchers",
                "Focus",
                "Preceptor",
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-cpbh-navy"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.trainingPrograms.rows.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? "bg-white" : "bg-amber-50/40"}
              >
                <td className="px-3 py-2 font-medium text-cpbh-navy text-xs leading-snug">
                  {row.program}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs leading-snug">
                  {row.traineesPerYear}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs">
                  {row.minorityResearchers}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs leading-snug min-w-[10rem]">
                  {row.focus}
                </td>
                <td className="px-3 py-2 text-cpbh-navy/85 text-xs leading-snug min-w-[10rem]">
                  {row.preceptor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <div className="rounded-lg border border-cpbh-mist/80 bg-cpbh-mist/25 px-4 py-3 text-xs text-cpbh-navy/65 leading-relaxed">
        <p className="font-semibold text-cpbh-navy/80">Tracking &amp; updates</p>
        <p className="mt-1">
          Roster rows are maintained in{" "}
          <code className="font-mono text-[11px] bg-white/80 px-1 rounded">
            {roster.meta.sourceRoot}
          </code>{" "}
          (CSV). Last sync to dashboard:{" "}
          <span className="font-medium text-cpbh-navy">
            {roster.meta.syncedAt.replace("T", " ").replace("Z", " UTC")}
          </span>
          . {roster.meta.maintenance}
        </p>
        <ul className="mt-2 list-disc pl-4 space-y-0.5 font-mono text-[10px] text-cpbh-navy/55">
          <li>{roster.meta.sources.scholarsTrainees}</li>
          <li>{roster.meta.sources.faculty}</li>
          <li>{roster.meta.sources.trainingPrograms}</li>
        </ul>
      </div>
    </div>
  );
}

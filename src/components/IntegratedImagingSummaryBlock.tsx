import type { ImagingYtdMeta, IntegratedImagingStudySummary } from "@/types/aim1";
import { formatInteger } from "@/lib/formatNumber";

interface IntegratedImagingSummaryBlockProps {
  ytdStudySummary: IntegratedImagingStudySummary;
  ytdMeta?: ImagingYtdMeta;
}

/** Participant headcount only (no longitudinal row totals). */
const YTD_COLUMNS = [
  { key: "naccRegistryVerifiedSubjects", label: "NACC verified participants" },
  { key: "subjectsWithMri", label: "MRI participants" },
  { key: "subjectsWithAmyloidPet", label: "Amyloid PET participants" },
  { key: "subjectsWithTauPet", label: "Tau PET participants" },
] as const;

export default function IntegratedImagingSummaryBlock({
  ytdStudySummary,
  ytdMeta,
}: IntegratedImagingSummaryBlockProps) {
  const periodLabel = ytdMeta?.periodLabel ?? "Year to date";

  return (
    <div className="dashboard-card space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold text-cpbh-navy">
          Study-wide availability · {periodLabel}
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-1 leading-snug">
          USC ADRC Integrated Imaging Availability{" "}
          {ytdMeta?.packageVersion ?? ytdStudySummary.packageVersion} ·{" "}
          <span className="font-medium text-neutral-950">
            black = unique participants · study_date in window
          </span>
          {ytdMeta?.identityFilter ? ` · ${ytdMeta.identityFilter} only` : null}
          {ytdMeta?.latestStudyDate
            ? ` · latest study_date in export ${ytdMeta.latestStudyDate}`
            : null}
        </p>
        <p className="text-cpbh-navy/50 text-xs mt-1 font-mono">
          {ytdMeta?.longitudinalSourceFile ??
            ytdStudySummary.sourceFiles?.longitudinal ??
            ytdStudySummary.sourceFile}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-cpbh-mist text-cpbh-navy/70">
              <th className="py-2 pr-4 font-medium">Study</th>
              {YTD_COLUMNS.map((col) => (
                <th key={col.key} className="py-2 px-2 font-medium text-right">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ytdStudySummary.studies.map((row) => (
              <tr
                key={row.study}
                className="border-b border-cpbh-mist/80 last:border-0"
              >
                <td className="py-3 pr-4 font-semibold text-cpbh-navy">
                  {row.study}
                </td>
                {YTD_COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className="py-3 px-2 text-right tabular-nums metric-value-ytd font-semibold"
                  >
                    {formatInteger(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-cpbh-navy/55 text-xs leading-relaxed">
        {ytdStudySummary.note} All columns are{" "}
        <strong>participant headcount</strong> (unique subject_key), aligned
        with SCAN &amp; CLARiTI progress cards for those study rows. Do not sum
        SCAN and CLARiTI.
      </p>
    </div>
  );
}

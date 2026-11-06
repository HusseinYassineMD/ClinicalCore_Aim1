import type { BiomarkerCoreSampleProcessingData } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";
import { formatScopeDate } from "@/lib/formatScopeDate";

function coverageLabel(startMonth: string, endMonth: string): string {
  const startIso = `${startMonth}-01`;
  const [year, month] = endMonth.split("-").map(Number);
  const endIso = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  return `${formatScopeDate(startIso)} – ${formatScopeDate(endIso)}`;
}

interface BiomarkerCoreSampleProcessingBlockProps {
  data: BiomarkerCoreSampleProcessingData;
}

const PROVENANCE = "ytd" as const;

function numCell(value: number) {
  return (
    <td
      className={`px-4 py-3 text-base tabular-nums border-b border-cpbh-mist ${metricValueClass(PROVENANCE, value)}`}
    >
      {value.toLocaleString()}
    </td>
  );
}

export default function BiomarkerCoreSampleProcessingBlock({
  data,
}: BiomarkerCoreSampleProcessingBlockProps) {
  const { meta, months, totals } = data;

  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="px-8 pt-8 pb-5 text-center">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-cpbh-navy leading-snug">
          Biomarker Core · sample processing
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-2 max-w-3xl mx-auto leading-relaxed">
          Black · {coverageLabel(meta.startMonth, meta.endMonth)} ·{" "}
          {meta.providedBy}. Monthly sample and tube counts for that period.
        </p>
        <p className="text-cpbh-navy/55 text-xs mt-2 max-w-3xl mx-auto leading-relaxed">
          Source: {meta.sourceFile}. Coverage {coverageLabel(meta.startMonth, meta.endMonth)}.
        </p>
      </div>
      <div className="overflow-x-auto px-2 pb-6">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="bg-cpbh-navy text-white text-sm font-medium px-4 py-3 align-bottom"
              >
                Month
              </th>
              <th
                colSpan={3}
                className="bg-cpbh-navy text-white text-sm font-medium px-4 py-2 text-center border-l border-white/20"
              >
                # of samples
              </th>
              <th
                colSpan={3}
                className="bg-cpbh-navy text-white text-sm font-medium px-4 py-2 text-center border-l border-white/20"
              >
                Total tubes
              </th>
            </tr>
            <tr>
              {["Plasma", "Buffy coat", "Serum", "Plasma", "Buffy coat", "Serum"].map(
                (label) => (
                  <th
                    key={label}
                    className="bg-cpbh-navy/90 text-white text-xs font-medium px-4 py-2 border-l border-white/15"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {months.map((row, index) => (
              <tr key={row.month} className={index % 2 === 1 ? "table-row-alt" : undefined}>
                <td className="px-4 py-3 text-sm font-medium text-cpbh-navy border-b border-cpbh-mist whitespace-nowrap">
                  {row.month}
                </td>
                {numCell(row.samples.plasma)}
                {numCell(row.samples.buffyCoat)}
                {numCell(row.samples.serum)}
                {numCell(row.tubes.plasma)}
                {numCell(row.tubes.buffyCoat)}
                {numCell(row.tubes.serum)}
              </tr>
            ))}
            <tr className="bg-cpbh-mist/40 font-semibold">
              <td className="px-4 py-3 text-sm text-cpbh-navy border-b border-cpbh-mist">
                Totals
              </td>
              {numCell(totals.samples.plasma)}
              {numCell(totals.samples.buffyCoat)}
              {numCell(totals.samples.serum)}
              {numCell(totals.tubes.plasma)}
              {numCell(totals.tubes.buffyCoat)}
              {numCell(totals.tubes.serum)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

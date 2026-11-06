import type { BiomarkerCoreSampleProcessingData } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";

interface BiomarkerCoreSampleProcessingBlockProps {
  data: BiomarkerCoreSampleProcessingData;
}

function numCell(value: number, provenance: "ytd" | "prior" | "span") {
  return (
    <td
      className={`px-4 py-3 text-base tabular-nums border-b border-cpbh-mist ${metricValueClass(provenance, value)}`}
    >
      {value.toLocaleString()}
    </td>
  );
}

export default function BiomarkerCoreSampleProcessingBlock({
  data,
}: BiomarkerCoreSampleProcessingBlockProps) {
  const { meta, months } = data;
  const windowMonths = months.filter((row) => row.month !== "October 2026");
  const windowTotals = windowMonths.reduce(
    (sum, row) => ({
      samples: {
        plasma: sum.samples.plasma + row.samples.plasma,
        buffyCoat: sum.samples.buffyCoat + row.samples.buffyCoat,
        serum: sum.samples.serum + row.samples.serum,
      },
      tubes: {
        plasma: sum.tubes.plasma + row.tubes.plasma,
        buffyCoat: sum.tubes.buffyCoat + row.tubes.buffyCoat,
        serum: sum.tubes.serum + row.tubes.serum,
      },
    }),
    {
      samples: { plasma: 0, buffyCoat: 0, serum: 0 },
      tubes: { plasma: 0, buffyCoat: 0, serum: 0 },
    },
  );

  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="px-8 pt-8 pb-5 text-center">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-cpbh-navy leading-snug">
          Biomarker Core · sample processing
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-2 max-w-3xl mx-auto leading-relaxed">
          Black · January through September 2026, inside January 1–October 16.{" "}
          {meta.providedBy}. October stays pink: the workbook is the latest
          packet, it has no day, and that month runs through October 31.
        </p>
        <p className="text-cpbh-navy/55 text-xs mt-2 max-w-3xl mx-auto leading-relaxed">
          Source: {meta.sourceFile}. The total row is January–September only.
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
            {months.map((row, index) => {
              const inWindow = row.month !== "October 2026";
              const provenance = inWindow ? "ytd" : "span";
              return (
              <tr key={row.month} className={index % 2 === 1 ? "table-row-alt" : undefined}>
                <td className="px-4 py-3 text-sm font-medium text-cpbh-navy border-b border-cpbh-mist whitespace-nowrap">
                  {row.month}
                </td>
                {numCell(row.samples.plasma, provenance)}
                {numCell(row.samples.buffyCoat, provenance)}
                {numCell(row.samples.serum, provenance)}
                {numCell(row.tubes.plasma, provenance)}
                {numCell(row.tubes.buffyCoat, provenance)}
                {numCell(row.tubes.serum, provenance)}
              </tr>
              );
            })}
            <tr className="bg-cpbh-mist/40 font-semibold">
              <td className="px-4 py-3 text-sm text-cpbh-navy border-b border-cpbh-mist">
                January–September
              </td>
              {numCell(windowTotals.samples.plasma, "ytd")}
              {numCell(windowTotals.samples.buffyCoat, "ytd")}
              {numCell(windowTotals.samples.serum, "ytd")}
              {numCell(windowTotals.tubes.plasma, "ytd")}
              {numCell(windowTotals.tubes.buffyCoat, "ytd")}
              {numCell(windowTotals.tubes.serum, "ytd")}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

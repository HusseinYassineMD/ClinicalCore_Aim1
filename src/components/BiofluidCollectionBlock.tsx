import type { BiofluidCollectionEntry } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";
import biomarkerCoreSampleProcessing2026 from "@/data/biomarkerCoreSampleProcessing2026.json";

const processingMeta = biomarkerCoreSampleProcessing2026.meta;

interface BiofluidCollectionBlockProps {
  data: BiofluidCollectionEntry[];
}

export default function BiofluidCollectionBlock({ data }: BiofluidCollectionBlockProps) {
  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="px-8 pt-8 pb-5 text-center">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-cpbh-navy leading-snug">
          Biofluid Collection
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-2 max-w-3xl mx-auto leading-relaxed">
          Black · January 1, 2026 – September 30, 2026 · {processingMeta.providedBy}.
        </p>
        <p className="text-cpbh-navy/55 text-xs mt-2 max-w-3xl mx-auto leading-relaxed">
          Source: {processingMeta.sourceFile}. These totals are January through
          September, which sit inside January 1–October 16. October is a
          monthly total with no day, so it is not included. CSF is 0 samples
          and 0 tubes because that workbook has no CSF rows.
        </p>
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr>
              <th className="bg-cpbh-navy text-white text-base font-medium px-6 py-4 text-left">
                Biofluid
              </th>
              <th className="bg-cpbh-navy text-white text-base font-medium px-6 py-4 text-left">
                # of samples
              </th>
              <th className="bg-cpbh-navy text-white text-base font-medium px-6 py-4 text-left">
                Total tubes
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.type}
                className={index % 2 === 1 ? "table-row-alt" : undefined}
              >
                <td className="px-6 py-4 text-base font-medium text-cpbh-navy border-b border-cpbh-mist align-top">
                  {row.type}
                  {row.sourceNote ? (
                    <p className="mt-1 text-xs font-normal text-cpbh-navy/55 leading-snug">
                      {row.sourceNote}
                    </p>
                  ) : null}
                </td>
                <td
                  className={`px-6 py-4 text-base border-b border-cpbh-mist ${metricValueClass(row.provenance ?? "ytd", row.participants)}`}
                >
                  {row.participants == null
                    ? "—"
                    : row.participants.toLocaleString()}
                </td>
                <td
                  className={`px-6 py-4 text-base border-b border-cpbh-mist ${metricValueClass(
                    row.aliquots === undefined
                      ? "unknown"
                      : (row.provenance ?? "ytd"),
                    row.aliquots,
                  )}`}
                >
                  {row.aliquots == null
                    ? "—"
                    : row.aliquots.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

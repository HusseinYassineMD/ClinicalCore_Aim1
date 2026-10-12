import type { BiofluidCollectionEntry } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";

interface BiofluidCollectionBlockProps {
  data: BiofluidCollectionEntry[];
}

export default function BiofluidCollectionBlock({ data }: BiofluidCollectionBlockProps) {
  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="px-8 pt-8 pb-5">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-cpbh-navy leading-snug">
          Biofluid Collection
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-2 max-w-3xl leading-relaxed">
          Black · USC ADRC Biospecimen Availability (James Oct 9 supplement) ·
          collection inventory by{" "}
          <code className="text-[11px]">collection_date</code> — not integrated
          biomarker assay rows. WBC is not a component in this export.
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
                # Participants
              </th>
              <th className="bg-cpbh-navy text-white text-base font-medium px-6 py-4 text-left">
                # Aliquots
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.type}
                className={index % 2 === 1 ? "table-row-alt" : undefined}
              >
                <td className="px-6 py-4 text-base font-medium text-cpbh-navy border-b border-cpbh-mist">
                  {row.type}
                </td>
                <td
                  className={`px-6 py-4 text-base border-b border-cpbh-mist ${metricValueClass(row.provenance ?? "ytd", row.participants)}`}
                >
                  {row.participants ?? "—"}
                </td>
                <td
                  className={`px-6 py-4 text-base border-b border-cpbh-mist ${metricValueClass(
                    row.aliquots === undefined
                      ? "unknown"
                      : (row.provenance ?? "ytd"),
                    row.aliquots,
                  )}`}
                >
                  {row.aliquots ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

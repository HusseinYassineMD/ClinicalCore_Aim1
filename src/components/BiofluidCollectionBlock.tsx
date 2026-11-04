import type { BiofluidCollectionEntry } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";
import {
  biospecimenLatestCollectionDate,
  biospecimenLatestSpecimenDate,
} from "@/data/siteReporting";
import { formatScopeDate } from "@/lib/formatScopeDate";

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
          Green · James harmonized biospecimen inventory (Oct 9 file). Last
          specimen_date {formatScopeDate(biospecimenLatestSpecimenDate)}. Last
          collection_date {formatScopeDate(biospecimenLatestCollectionDate)}.
          Operational sample/tube counts from Abhay Sagare (Jan–Oct 2026) are in
          the Biomarker Core processing table below. Plasma and buffy coat are
          direct-freeze samples in BST (REDCap, James and Xinhui); BST is being
          migrated and closed. CSF is REDCap. NCRAD assay rows are separate.
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

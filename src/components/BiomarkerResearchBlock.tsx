import type { BiomarkerResearchEntry } from "@/types/aim1";
import { metricValueClass } from "@/lib/metricValueClass";

interface BiomarkerResearchBlockProps {
  data: BiomarkerResearchEntry[];
}

function formatValue(entry: BiomarkerResearchEntry): string {
  if (entry.csfSamples != null && entry.plasmaSamples != null) {
    return `Analyzed total APOE levels in ${entry.csfSamples} CSF and ${entry.plasmaSamples} plasma samples`;
  }

  if (entry.samplesDisplay) {
    return entry.unit === "count"
      ? entry.samplesDisplay
      : `${entry.samplesDisplay} samples`;
  }

  if (entry.samples != null) {
    return entry.unit === "count"
      ? String(entry.samples)
      : `${entry.samples} samples`;
  }

  return "—";
}

export default function BiomarkerResearchBlock({ data }: BiomarkerResearchBlockProps) {
  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="px-8 pt-8 pb-5">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-cpbh-navy leading-snug">
          Biomarker Analysis and Collaboration
        </h3>
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr>
              <th className="bg-cpbh-navy text-white text-base font-medium px-6 py-4 text-left w-[55%]">
                Metric
              </th>
              <th className="bg-cpbh-navy text-white text-base font-medium px-6 py-4 text-left">
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.metric}
                className={index % 2 === 1 ? "table-row-alt" : undefined}
              >
                <td className="px-6 py-4 text-base font-medium text-cpbh-navy border-b border-cpbh-mist align-top">
                  {row.metric}
                </td>
                <td
                  className={`px-6 py-4 text-base border-b border-cpbh-mist align-top ${metricValueClass(row.provenance ?? "unknown", formatValue(row))}`}
                >
                  {formatValue(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

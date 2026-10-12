import type {
  DataProvenance,
  DemographicGroup,
  DemographicGroupKey,
} from "@/types/aim1";
import { DEMOGRAPHIC_GROUP_LABELS } from "@/types/aim1";
import type { Table1VisualData } from "@/components/DemographicsVisuals";
import { metricValueClass } from "@/lib/metricValueClass";

const DEFAULT_COLUMN_KEYS: DemographicGroupKey[] = [
  "overall",
  "hispanic",
  "white",
  "black",
  "asian",
];

export type Table1ColumnKey = DemographicGroupKey | "otherUnknown";

const EXTRA_COLUMN_LABELS: Record<"otherUnknown", string> = {
  otherUnknown: "Other/unknown",
};

type RowDef = {
  label: string;
  value: (g: DemographicGroup) => string;
};

const ROWS: RowDef[] = [
  { label: "N", value: (g) => g.n },
  { label: "Age, mean (SD)", value: (g) => g.ageMeanSD },
  { label: "Education, median [IQR]", value: (g) => g.eduMedianIQR },
  { label: "Male, n (%)", value: (g) => g.male },
  { label: "MoCA, mean (SD)", value: (g) => g.mocaMeanSD },
  { label: "CDR = 0, n (%)", value: (g) => g.cdr0 },
  { label: "CDR = 0.5, n (%)", value: (g) => g.cdr05 },
  { label: "CDR ≥ 1, n (%)", value: (g) => g.cdrGe1 },
  { label: "APOE ε4, %", value: (g) => g.apoeE4Percent },
  { label: "Follow-up, mean (SD)", value: (g) => g.followUpMeanSD },
];

export default function DemographicsTable({
  data,
  columnKeys = DEFAULT_COLUMN_KEYS,
  valueProvenance = "prior",
}: {
  data: Table1VisualData & { otherUnknown?: DemographicGroup };
  columnKeys?: Table1ColumnKey[];
  valueProvenance?: DataProvenance;
}) {
  const groups: Record<Table1ColumnKey, DemographicGroup | undefined> = {
    overall: data.overall,
    hispanic: data.hispanic,
    white: data.white,
    black: data.black,
    asian: data.asian,
    otherUnknown: data.otherUnknown,
  };
  const valueClass = metricValueClass(valueProvenance);

  return (
    <div className="px-4 sm:px-6 pb-2">
      <div className="overflow-x-auto rounded-xl border border-cpbh-mist/90">
        <table className="w-full min-w-[720px] text-left text-sm border-collapse">
          <thead>
            <tr className="bg-cpbh-navy text-white">
              <th
                scope="col"
                className="px-3 py-2.5 font-semibold text-xs uppercase tracking-wide sticky left-0 bg-cpbh-navy z-[1]"
              >
                Characteristic
              </th>
              {columnKeys.map((key) => (
                <th
                  key={key}
                  scope="col"
                  className="px-3 py-2.5 font-semibold text-xs whitespace-nowrap"
                >
                  {key === "otherUnknown"
                    ? EXTRA_COLUMN_LABELS.otherUnknown
                    : DEMOGRAPHIC_GROUP_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, rowIndex) => (
              <tr
                key={row.label}
                className={
                  rowIndex % 2 === 0 ? "bg-white" : "bg-cpbh-mist/25"
                }
              >
                <th
                  scope="row"
                  className="px-3 py-2 font-medium text-cpbh-navy/85 text-xs sm:text-sm sticky left-0 bg-inherit z-[1] border-r border-cpbh-mist/60"
                >
                  {row.label}
                </th>
                {columnKeys.map((key) => {
                  const group = groups[key];
                  return (
                  <td
                    key={key}
                    className={`px-3 py-2 tabular-nums text-xs sm:text-sm whitespace-nowrap ${valueClass}`}
                  >
                    {group ? row.value(group) : "—"}
                  </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

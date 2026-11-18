import reportJson from "@/data/inclusionEnrollmentReport555816.json";
import { formatScopeDate } from "@/lib/formatScopeDate";
import { metricValueClass } from "@/lib/metricValueClass";
import { HeadingLead } from "@/components/HeadingLead";
import type { DataProvenance } from "@/types/aim1";

type SexCounts = {
  Female: number;
  Male: number;
  "Unknown/Not Reported": number;
};

type EthnicityKey =
  | "Not Hispanic or Latino"
  | "Hispanic or Latino"
  | "Unknown/Not Reported Ethnicity";

type RaceKey =
  | "American Indian/Alaska Native"
  | "Asian"
  | "Native Hawaiian or Other Pacific Islander"
  | "Black or African American"
  | "White"
  | "More than One Race"
  | "Unknown or Not Reported";

type Cells = Record<RaceKey, Record<EthnicityKey, SexCounts>>;

type TableBlock = {
  label: string;
  asOfDate: string | null;
  provenance: DataProvenance;
  total: number;
  cells: Cells;
};

const report = reportJson as {
  meta: {
    reportId: string;
    title: string;
    program: string;
    sourceFile: string;
    sourcePath: string;
    preparedLabel: string;
    identificationNote: string;
    validationNote: string;
  };
  raceCategories: RaceKey[];
  ethnicityCategories: EthnicityKey[];
  planned: TableBlock;
  cumulativeActual: TableBlock;
};

function cellTotal(sex: SexCounts): number {
  return sex.Female + sex.Male + sex["Unknown/Not Reported"];
}

function getSex(table: TableBlock, race: RaceKey, ethnicity: EthnicityKey): SexCounts {
  return table.cells[race][ethnicity];
}

function ethnicityTotal(table: TableBlock, ethnicity: EthnicityKey): number {
  return report.raceCategories.reduce(
    (sum, race) => sum + cellTotal(getSex(table, race, ethnicity)),
    0,
  );
}

function grandTotal(table: TableBlock): number {
  return report.ethnicityCategories.reduce(
    (sum, ethnicity) => sum + ethnicityTotal(table, ethnicity),
    0,
  );
}

function sexColumnTotal(
  table: TableBlock,
  ethnicities: EthnicityKey[],
  sexKey: keyof SexCounts,
): number {
  return report.raceCategories.reduce((sum, race) => {
    return (
      sum +
      ethnicities.reduce((inner, ethnicity) => {
        return inner + getSex(table, race, ethnicity)[sexKey];
      }, 0)
    );
  }, 0);
}

function EthnicityFirstTable({
  table,
  showUnknownEthnicity,
}: {
  table: TableBlock;
  showUnknownEthnicity: boolean;
}) {
  const ethnicities: EthnicityKey[] = showUnknownEthnicity
    ? report.ethnicityCategories
    : report.ethnicityCategories.filter(
        (ethnicity) => ethnicity !== "Unknown/Not Reported Ethnicity",
      );
  const races: RaceKey[] = showUnknownEthnicity
    ? report.raceCategories
    : report.raceCategories.filter((race) => race !== "Unknown or Not Reported");
  const valueClass = metricValueClass(table.provenance, table.total);
  const colSpan = showUnknownEthnicity ? 5 : 4;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="bg-cpbh-navy text-white">
            <th className="text-left font-medium px-3 py-2.5">Ethnicity → race</th>
            <th className="text-right font-medium px-3 py-2.5">Female</th>
            <th className="text-right font-medium px-3 py-2.5">Male</th>
            {showUnknownEthnicity ? (
              <th className="text-right font-medium px-3 py-2.5">
                Unknown / not reported
              </th>
            ) : null}
            <th className="text-right font-medium px-3 py-2.5 bg-cpbh-navy/90">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {ethnicities.map((ethnicity) => {
            const ethN = ethnicityTotal(table, ethnicity);
            return (
              <EthnicitySection
                key={ethnicity}
                ethnicity={ethnicity}
                ethN={ethN}
                races={races}
                table={table}
                showUnknownSex={showUnknownEthnicity}
                valueClass={valueClass}
                colSpan={colSpan}
              />
            );
          })}
          <tr className="bg-cpbh-mist/50 font-semibold">
            <td className="px-3 py-2.5 text-cpbh-navy border-t border-cpbh-mist">
              Grand total
            </td>
            <td
              className={`px-3 py-2.5 text-right tabular-nums border-t border-cpbh-mist ${valueClass}`}
            >
              {sexColumnTotal(table, ethnicities, "Female")}
            </td>
            <td
              className={`px-3 py-2.5 text-right tabular-nums border-t border-cpbh-mist ${valueClass}`}
            >
              {sexColumnTotal(table, ethnicities, "Male")}
            </td>
            {showUnknownEthnicity ? (
              <td
                className={`px-3 py-2.5 text-right tabular-nums border-t border-cpbh-mist ${valueClass}`}
              >
                {sexColumnTotal(table, ethnicities, "Unknown/Not Reported")}
              </td>
            ) : null}
            <td
              className={`px-3 py-2.5 text-right tabular-nums border-t border-cpbh-mist ${valueClass}`}
            >
              {grandTotal(table)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function EthnicitySection({
  ethnicity,
  ethN,
  races,
  table,
  showUnknownSex,
  valueClass,
  colSpan,
}: {
  ethnicity: EthnicityKey;
  ethN: number;
  races: RaceKey[];
  table: TableBlock;
  showUnknownSex: boolean;
  valueClass: string;
  colSpan: number;
}) {
  return (
    <>
      <tr className="bg-cpbh-sky/15">
        <td
          colSpan={colSpan}
          className="px-3 py-2 font-semibold text-cpbh-navy border-t border-cpbh-mist"
        >
          {ethnicity}
          <span className={`ml-2 tabular-nums font-semibold ${valueClass}`}>
            n = {ethN}
          </span>
        </td>
      </tr>
      {races.map((race) => {
        const sex = getSex(table, race, ethnicity);
        return (
          <tr key={`${ethnicity}-${race}`} className="border-b border-cpbh-mist/70">
            <td className="px-3 py-2 pl-6 text-cpbh-navy/85">{race}</td>
            <td className={`px-3 py-2 text-right tabular-nums ${valueClass}`}>
              {sex.Female}
            </td>
            <td className={`px-3 py-2 text-right tabular-nums ${valueClass}`}>
              {sex.Male}
            </td>
            {showUnknownSex ? (
              <td className={`px-3 py-2 text-right tabular-nums ${valueClass}`}>
                {sex["Unknown/Not Reported"]}
              </td>
            ) : null}
            <td className={`px-3 py-2 text-right tabular-nums font-medium ${valueClass}`}>
              {cellTotal(sex)}
            </td>
          </tr>
        );
      })}
    </>
  );
}

export default function InclusionEnrollmentBlock() {
  const { meta, planned, cumulativeActual } = report;
  const plannedOk = grandTotal(planned) === planned.total;
  const actualOk = grandTotal(cumulativeActual) === cumulativeActual.total;

  return (
    <div
      className="dashboard-card overflow-hidden p-0 mt-6"
      data-deck-slide="demographics-inclusion-enrollment"
      data-deck-caption="Demographics · NIH Inclusion Enrollment (UDS)"
    >
      <div className="px-6 pt-6 pb-4 border-b border-cpbh-mist text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-cpbh-navy/55 mb-1">
          {meta.program}
        </p>
        <h3 className="font-display text-xl font-semibold text-cpbh-navy">
          {meta.title}
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source={`${meta.preparedLabel} · ${meta.sourceFile}`}
          through={formatScopeDate(cumulativeActual.asOfDate)}
        >
          Ethnicity first (Hispanic / not Hispanic / unknown), then race × sex.
          Cumulative Actual is green (year-end prior snapshot). Planned is pink
          (grant inclusion target). This is Clinical Core UDS — not BRS autopsy.
        </HeadingLead>
        <p className="text-cpbh-navy/55 text-xs mt-2 leading-relaxed max-w-3xl mx-auto">
          {meta.identificationNote}
        </p>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-8">
        <div>
          <div className="mb-3 text-center">
            <h4 className="font-display text-lg font-semibold text-cpbh-navy">
              {cumulativeActual.label}
            </h4>
            <p className="text-sm text-cpbh-navy/60 mt-1">
              As of {formatScopeDate(cumulativeActual.asOfDate)} · N ={" "}
              <span className={metricValueClass("prior", cumulativeActual.total)}>
                {cumulativeActual.total}
              </span>
              {actualOk ? null : (
                <span className="metric-value-unknown ml-2">total mismatch</span>
              )}
            </p>
          </div>
          <EthnicityFirstTable table={cumulativeActual} showUnknownEthnicity={false} />
        </div>

        <div className="border-t border-cpbh-mist pt-6">
          <div className="mb-3 text-center">
            <h4 className="font-display text-lg font-semibold text-cpbh-navy">
              {planned.label}
            </h4>
            <p className="text-sm text-cpbh-navy/60 mt-1">
              Grant planned inclusion · N ={" "}
              <span className={metricValueClass("span", planned.total)}>
                {planned.total}
              </span>
              {plannedOk ? null : (
                <span className="metric-value-unknown ml-2">total mismatch</span>
              )}
            </p>
          </div>
          <EthnicityFirstTable table={planned} showUnknownEthnicity />
        </div>

        <p className="text-xs text-cpbh-navy/50 leading-relaxed border-t border-cpbh-mist pt-4">
          {meta.validationNote} File:{" "}
          <code className="text-[11px]">{meta.sourcePath}</code>.
        </p>
      </div>
    </div>
  );
}

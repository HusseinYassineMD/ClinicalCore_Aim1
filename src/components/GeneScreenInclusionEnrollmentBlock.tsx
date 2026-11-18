import reportJson from "@/data/geneScreenInclusionEnrollment.json";
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
  asOfDate: string;
  provenance: DataProvenance;
  definition: string;
  total: number;
  cells: Cells;
};

const report = reportJson as {
  meta: {
    program: string;
    title: string;
    sourceFile: string;
    sourcePath: string;
    naccNamingNote: string;
    accessNote: string;
    reportingPeriodLabel: string;
  };
  raceCategories: RaceKey[];
  ethnicityCategories: EthnicityKey[];
  cumulativeComplete: TableBlock;
  consentYtd: TableBlock;
};

function cellTotal(sex: SexCounts): number {
  return sex.Female + sex.Male + sex["Unknown/Not Reported"];
}

function getSex(
  table: TableBlock,
  race: RaceKey,
  ethnicity: EthnicityKey,
): SexCounts {
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

function EthnicityFirstTable({ table }: { table: TableBlock }) {
  const ethnicities = report.ethnicityCategories;
  const races = report.raceCategories;
  const valueClass = metricValueClass(table.provenance, table.total);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="bg-cpbh-navy text-white">
            <th className="text-left font-medium px-3 py-2.5">Ethnicity → race</th>
            <th className="text-right font-medium px-3 py-2.5">Female</th>
            <th className="text-right font-medium px-3 py-2.5">Male</th>
            <th className="text-right font-medium px-3 py-2.5">
              Unknown / not reported
            </th>
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
                valueClass={valueClass}
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
            <td
              className={`px-3 py-2.5 text-right tabular-nums border-t border-cpbh-mist ${valueClass}`}
            >
              {sexColumnTotal(table, ethnicities, "Unknown/Not Reported")}
            </td>
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
  valueClass,
}: {
  ethnicity: EthnicityKey;
  ethN: number;
  races: RaceKey[];
  table: TableBlock;
  valueClass: string;
}) {
  return (
    <>
      <tr className="bg-cpbh-sky/15">
        <td
          colSpan={5}
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
            <td className={`px-3 py-2 text-right tabular-nums ${valueClass}`}>
              {sex["Unknown/Not Reported"]}
            </td>
            <td className={`px-3 py-2 text-right tabular-nums font-medium ${valueClass}`}>
              {cellTotal(sex)}
            </td>
          </tr>
        );
      })}
    </>
  );
}

function TableSection({ table }: { table: TableBlock }) {
  const ok = grandTotal(table) === table.total;
  return (
    <div>
      <div className="mb-3 text-center">
        <h4 className="font-display text-lg font-semibold text-cpbh-navy">
          {table.label}
        </h4>
        <p className="text-sm text-cpbh-navy/60 mt-1">
          Through {formatScopeDate(table.asOfDate)} · N ={" "}
          <span className={metricValueClass(table.provenance, table.total)}>
            {table.total}
          </span>
          {ok ? null : (
            <span className="metric-value-unknown ml-2">total mismatch</span>
          )}
        </p>
        <p className="text-xs text-cpbh-navy/55 mt-1 max-w-3xl mx-auto leading-relaxed">
          {table.definition}
        </p>
      </div>
      <EthnicityFirstTable table={table} />
    </div>
  );
}

export default function GeneScreenInclusionEnrollmentBlock() {
  const { meta, cumulativeComplete, consentYtd } = report;

  return (
    <div
      className="dashboard-card overflow-hidden p-0 mt-6"
      data-deck-slide="genescreen-inclusion-enrollment"
      data-deck-caption="GeneScreen · Inclusion Enrollment (ethnicity first)"
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
          source={`USC GeneScreen REDCap · ${meta.sourceFile}`}
          through={formatScopeDate(cumulativeComplete.asOfDate)}
        >
          Pink · export stops October 7, 2026 (before the October 16 EAC lock).
          Ethnicity first using NACC/NIH category names from the REDCap
          Ethnicity/Race field, then race × sex.
        </HeadingLead>
        <p className="text-cpbh-navy/55 text-xs mt-2 leading-relaxed max-w-3xl mx-auto">
          {meta.naccNamingNote}
        </p>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-8">
        <TableSection table={cumulativeComplete} />
        <div className="border-t border-cpbh-mist pt-6">
          <TableSection table={consentYtd} />
        </div>
        <p className="text-xs text-cpbh-navy/50 leading-relaxed border-t border-cpbh-mist pt-4">
          {meta.accessNote} Window label {meta.reportingPeriodLabel}. File:{" "}
          <code className="text-[11px]">{meta.sourcePath}</code>.
        </p>
      </div>
    </div>
  );
}

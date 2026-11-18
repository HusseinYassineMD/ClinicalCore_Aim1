import reportJson from "@/data/registryInclusionEnrollment.json";
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

type CohortTable = {
  label: string;
  program: string;
  asOfDate: string;
  provenance: DataProvenance;
  source: string;
  definition: string;
  total: number;
  cells: Cells;
  ethnicityTotals: Record<EthnicityKey, number>;
};

const report = reportJson as {
  meta: {
    title: string;
    layoutNote: string;
    reportingPeriodLabel: string;
    raceCategories: RaceKey[];
    ethnicityCategories: EthnicityKey[];
  };
  udsActiveExcludingMinimal: CohortTable;
  geneScreenComplete: CohortTable;
  geneScreenConsentYtd: CohortTable;
  brsAllEnrollment: CohortTable;
  brsExcludingMinimal: CohortTable;
};

function cellTotal(sex: SexCounts): number {
  return sex.Female + sex.Male + sex["Unknown/Not Reported"];
}

function getSex(
  table: CohortTable,
  race: RaceKey,
  ethnicity: EthnicityKey,
): SexCounts {
  return table.cells[race][ethnicity];
}

function ethnicityTotal(table: CohortTable, ethnicity: EthnicityKey): number {
  return report.meta.raceCategories.reduce(
    (sum, race) => sum + cellTotal(getSex(table, race, ethnicity)),
    0,
  );
}

function grandTotal(table: CohortTable): number {
  return report.meta.ethnicityCategories.reduce(
    (sum, ethnicity) => sum + ethnicityTotal(table, ethnicity),
    0,
  );
}

function sexColumnTotal(
  table: CohortTable,
  sexKey: keyof SexCounts,
): number {
  return report.meta.raceCategories.reduce((sum, race) => {
    return (
      sum +
      report.meta.ethnicityCategories.reduce((inner, ethnicity) => {
        return inner + getSex(table, race, ethnicity)[sexKey];
      }, 0)
    );
  }, 0);
}

function EthnicityFirstTable({ table }: { table: CohortTable }) {
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
          {report.meta.ethnicityCategories.map((ethnicity) => {
            const ethN = ethnicityTotal(table, ethnicity);
            return (
              <EthnicitySection
                key={ethnicity}
                ethnicity={ethnicity}
                ethN={ethN}
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
              {sexColumnTotal(table, "Female")}
            </td>
            <td
              className={`px-3 py-2.5 text-right tabular-nums border-t border-cpbh-mist ${valueClass}`}
            >
              {sexColumnTotal(table, "Male")}
            </td>
            <td
              className={`px-3 py-2.5 text-right tabular-nums border-t border-cpbh-mist ${valueClass}`}
            >
              {sexColumnTotal(table, "Unknown/Not Reported")}
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
  table,
  valueClass,
}: {
  ethnicity: EthnicityKey;
  ethN: number;
  table: CohortTable;
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
      {report.meta.raceCategories.map((race) => {
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

function CohortSection({ table }: { table: CohortTable }) {
  const ok = grandTotal(table) === table.total;
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-cpbh-navy/55">
          {table.program}
        </p>
        <h4 className="font-display text-lg font-semibold text-cpbh-navy mt-1">
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
        <p className="text-[11px] text-cpbh-navy/45 mt-1 max-w-3xl mx-auto leading-relaxed">
          Source: {table.source}
        </p>
      </div>
      <EthnicityFirstTable table={table} />
    </div>
  );
}

export default function RegistryInclusionEnrollmentBlock() {
  const {
    meta,
    udsActiveExcludingMinimal,
    geneScreenComplete,
    geneScreenConsentYtd,
    brsAllEnrollment,
    brsExcludingMinimal,
  } = report;

  return (
    <div
      className="dashboard-card overflow-hidden p-0 mt-6"
      data-deck-slide="registry-inclusion-enrollment"
      data-deck-caption="Registries · Inclusion Enrollment ethnicity-first (UDS / GeneScreen / BRS)"
    >
      <div className="px-6 pt-6 pb-4 border-b border-cpbh-mist text-center">
        <h3 className="font-display text-xl font-semibold text-cpbh-navy">
          {meta.title}
        </h3>
        <HeadingLead
          className="text-cpbh-navy/60 text-sm mt-1 leading-snug"
          source="Our UDS, GeneScreen, and BRS sources (not the Dr. Chui PDF verbatim)"
          through={meta.reportingPeriodLabel}
        >
          {meta.layoutNote}
        </HeadingLead>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-10">
        <CohortSection table={udsActiveExcludingMinimal} />
        <div className="border-t border-cpbh-mist pt-8 space-y-10">
          <CohortSection table={geneScreenComplete} />
          <CohortSection table={geneScreenConsentYtd} />
        </div>
        <div className="border-t border-cpbh-mist pt-8 space-y-10">
          <CohortSection table={brsAllEnrollment} />
          <CohortSection table={brsExcludingMinimal} />
        </div>
      </div>
    </div>
  );
}

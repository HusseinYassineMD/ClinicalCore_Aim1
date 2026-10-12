import type { PlasmaRequestSummary } from "@/types/aim1";
import MetricCard from "./MetricCard";
import { metricValueClass } from "@/lib/metricValueClass";

export default function PlasmaRequestSummaryBlock({
  data,
  periodLabel,
}: {
  data: PlasmaRequestSummary;
  periodLabel: string;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-cpbh-mist">
      <h4 className="font-display text-base font-semibold text-cpbh-navy mb-1">
        Plasma requests
      </h4>
      <p className="text-cpbh-navy/55 text-xs mb-4">
        REDCap plasma_nci_req · plasma_mci_req · plasma_ad_req · {periodLabel}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <MetricCard
          label="Requests with plasma"
          value={data.requestsWithPlasma}
          accent="navy"
          provenance="ytd"
        />
        <MetricCard
          label="Plasma aliquots requested"
          value={data.aliquotsRequested}
          accent="purple"
          provenance="ytd"
        />
        <MetricCard
          label="Plasma requests fulfilled"
          value={data.requestsFulfilled}
          accent="teal"
          provenance="ytd"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {data.byDiagnosis.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-cpbh-mist bg-white/80 px-3 py-3 text-center"
          >
            <p
              className={`text-lg font-semibold tabular-nums ${metricValueClass("ytd", item.count)}`}
            >
              {item.count}
            </p>
            <p className="text-[10px] text-cpbh-navy/55 mt-1 uppercase tracking-wide">
              {item.label} aliquots
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { RegistryDatasetMeta, RegistryManifest } from "@/types/registry";

interface RegistryDataExplorerProps {
  manifest: RegistryManifest;
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-cpbh-mist bg-white px-4 py-3">
      <p className="text-xs text-cpbh-navy/60 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-cpbh-navy mt-1">{value}</p>
    </div>
  );
}

function BreakdownTable({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  if (Object.keys(data).length === 0) return null;
  return (
    <div className="rounded-xl border border-cpbh-mist bg-cpbh-mist/20 p-4">
      <p className="text-sm font-semibold text-cpbh-navy mb-2">{title}</p>
      <ul className="space-y-1 text-sm text-cpbh-navy/80">
        {Object.entries(data).map(([key, count]) => (
          <li key={key} className="flex justify-between gap-2">
            <span className="truncate">{key}</span>
            <span className="font-medium shrink-0">{count.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryPanel({ dataset }: { dataset: RegistryDatasetMeta }) {
  const s = dataset.summary;
  const cards: { label: string; value: string | number }[] = [
    { label: "Total records", value: dataset.rowCount.toLocaleString() },
    { label: "Fields", value: dataset.columnCount.toLocaleString() },
  ];

  if (s.uniqueParticipants != null) {
    cards.push({
      label: "Unique participants",
      value: s.uniqueParticipants.toLocaleString(),
    });
  }
  if (s.uniqueUdsIds != null) {
    cards.push({ label: "Unique UDS IDs", value: s.uniqueUdsIds.toLocaleString() });
  }
  if (s.totalRecords != null) {
    cards.push({ label: "Total records", value: s.totalRecords.toLocaleString() });
  }
  if (s.autopsiesPerformed != null) {
    cards.push({
      label: "Autopsies performed",
      value: s.autopsiesPerformed.toLocaleString(),
    });
  }
  if (s.withAutopsyFlag != null) {
    cards.push({ label: "Autopsy flag (M1)", value: s.withAutopsyFlag.toLocaleString() });
  }
  if (s.withConsentDate != null) {
    cards.push({
      label: "With consent date",
      value: s.withConsentDate.toLocaleString(),
    });
  }
  if (s.withConsent != null) {
    cards.push({ label: "With consent (M1)", value: s.withConsent.toLocaleString() });
  }
  if (s.deceased != null) {
    cards.push({ label: "Deceased", value: s.deceased.toLocaleString() });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <SummaryCard key={card.label} label={card.label} value={card.value} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {s.byDiagnosis && (
          <BreakdownTable title="By diagnosis" data={s.byDiagnosis} />
        )}
        {s.bySex && <BreakdownTable title="By sex" data={s.bySex} />}
        {s.byInBrs && <BreakdownTable title="In BRS" data={s.byInBrs} />}
        {s.byStatus && <BreakdownTable title="BRS status" data={s.byStatus} />}
        {s.topDataTypes && (
          <BreakdownTable title="Top data types" data={s.topDataTypes} />
        )}
        {s.topForms && <BreakdownTable title="Top UDS forms" data={s.topForms} />}
        {s.byVisit && <BreakdownTable title="By visit" data={s.byVisit} />}
        {s.visitYears && <BreakdownTable title="By visit year" data={s.visitYears} />}
        {s.hasBiomarkerFlags && (
          <BreakdownTable title="Biomarker / imaging flags" data={s.hasBiomarkerFlags} />
        )}
      </div>
    </div>
  );
}

function DatasetSummaryCard({ dataset }: { dataset: RegistryDatasetMeta }) {
  return (
    <article className="dashboard-card space-y-4">
      <div>
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-cpbh-purple mb-1">
          {dataset.category}
        </span>
        <h2 className="font-display text-xl font-semibold text-cpbh-navy">
          {dataset.label}
        </h2>
        <p className="text-sm text-cpbh-navy/60 mt-1">{dataset.description}</p>
        <p className="text-xs text-cpbh-navy/50 mt-2">
          Source file indexed {dataset.fileModified} · {dataset.fileSizeMb} MB
        </p>
      </div>
      <SummaryPanel dataset={dataset} />
    </article>
  );
}

export default function RegistryDataExplorer({
  manifest,
}: RegistryDataExplorerProps) {
  const [category, setCategory] = useState<string>("All");

  const filteredDatasets = useMemo(
    () =>
      category === "All"
        ? manifest.datasets
        : manifest.datasets.filter((d) => d.category === category),
    [manifest.datasets, category],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["All", ...manifest.categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-cpbh-navy text-white"
                : "bg-white border border-cpbh-mist text-cpbh-navy hover:bg-cpbh-mist/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredDatasets.map((dataset) => (
          <DatasetSummaryCard key={dataset.id} dataset={dataset} />
        ))}
      </div>
    </div>
  );
}

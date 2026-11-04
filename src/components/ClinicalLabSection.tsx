import SectionScopeBracket from "@/components/SectionScopeBracket";

const CLINICAL_LAB_METRICS = [
  "A1C values",
  "Lipid values",
  "Creatinine values",
  "Blood pressure values",
];

export default function ClinicalLabSection() {
  return (
    <section id="clinical" className="scroll-mt-32 space-y-6">
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-neutral-500">
        <span className="block">Clinical</span>
        <SectionScopeBracket sectionId="clinical" className="block mt-2 text-neutral-400" />
      </h2>
      <div
        className="rounded-2xl border border-neutral-200 bg-neutral-100 p-6 md:p-8"
        data-deck-slide="clinical-lab-metrics"
        data-deck-caption="Clinical · lab metrics pinned for a future RPPR"
      >
        <h3 className="font-display text-xl font-semibold text-neutral-500">
          Clinical lab metrics
        </h3>
        <p className="text-sm text-neutral-500 mt-2 max-w-3xl leading-relaxed">
          Gray. Pinned for a future RPPR. These counts are not part of this
          cycle, so they are not shown in black, green, or red.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {CLINICAL_LAB_METRICS.map((label) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-neutral-400">—</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

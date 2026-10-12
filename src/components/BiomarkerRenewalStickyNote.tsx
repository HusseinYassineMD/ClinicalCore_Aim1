import {
  STICKY_NOTE_BODY,
  STICKY_NOTE_SHELL,
  STICKY_NOTE_TITLE,
} from "@/components/stickyNoteShell";

const RENEWAL_ASSAYS = [
  "BPV",
  "sPDGFRβ",
  "QSM",
  "cPLA2",
  "5-LOX",
  "sEH",
  "HDL particle",
] as const;

export default function BiomarkerRenewalStickyNote() {
  return (
    <div
      className={`${STICKY_NOTE_SHELL} border-amber-200 bg-amber-50/90`}
      aria-label="Biomarker renewal scope note"
    >
        <p className={`${STICKY_NOTE_TITLE} text-amber-900/75`}>
          Renewal scope
        </p>
        <p className={`${STICKY_NOTE_BODY} mb-1`}>
          Additional assays on the measuring list — not yet shown in the tiles
          above:
        </p>
        <ul className="text-cpbh-navy/70 space-y-0.5 list-disc list-inside marker:text-amber-700/60">
          {RENEWAL_ASSAYS.map((assay) => (
            <li key={assay}>{assay}</li>
          ))}
        </ul>
        <p className="text-cpbh-navy/55 mt-1.5 pt-1.5 border-t border-amber-200/60">
          Included in the Jun 2024 renewal; counts here remain RPPR/NCRAD
          reporting only.
        </p>
    </div>
  );
}

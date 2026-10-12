import NeedsConfirmationStickyNote from "./NeedsConfirmationStickyNote";

export default function AutopsyEnrollmentConfirmationStickyNote() {
  return (
    <NeedsConfirmationStickyNote
      ariaLabel="Autopsy enrollment confirmation note"
      message="EAC lock: RPPR dashboard YTD is 1/1/2026–10/13/2026 (Dr. Chui). Data Core BRS table N=226 uses MAP 10/7/2026 + UDS/milestone QC (excludes MAP-active without finalized UDS); James MAP status=1 shows 231. One 2026 withdrawal from Carol (NP) may not be in MAP yet."
    />
  );
}

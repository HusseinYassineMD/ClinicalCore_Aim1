import NeedsConfirmationStickyNote from "./NeedsConfirmationStickyNote";

export default function AutopsyEnrollmentConfirmationStickyNote() {
  return (
    <NeedsConfirmationStickyNote
      ariaLabel="Autopsy enrollment confirmation note"
      message="225 is black. Xinhui Wang, Brain Research Study table, email November 10, 2026: active, autopsy consent on or before October 16, 2026, and still active on October 16. Sex is 143 female and 82 male. The person list has the same 225 IDs. Race is Hispanic 39, non-Hispanic White 143, African American 10, Asian 16, Other 17. APOE4 is 71 carriers, 139 non-carriers, and 15 with no genotype. New enrolled 5, withdrawal 1, died with autopsy 7, died without autopsy 1. James MAP Active 231 is a different count. The list filename says active + minimal contact. The table footnote says remained active."
    />
  );
}

import NeedsConfirmationStickyNote from "./NeedsConfirmationStickyNote";

export default function AutopsyEnrollmentConfirmationStickyNote() {
  return (
    <NeedsConfirmationStickyNote
      ariaLabel="Autopsy enrollment confirmation note"
      message="225 is black. Xinhui Wang, Brain Research Study table, email November 10, 2026: active, autopsy consent on or before October 16, 2026, and still active on October 16. The person-list code book names the charts: race/ethnicity is Hispanic 39, non-Hispanic White 143, African American 10, Asian 16, Others 17. sex is Male 82 and Female 143. APOE4 carrier is Yes 71, No 139, and 15 with no genotype. New enrolled 5, withdrawal 1, died with autopsy 7, died without autopsy 1. James MAP Active 231 is a different count. The list filename says active + minimal contact. The table footnote says remained active."
    />
  );
}

import NeedsConfirmationStickyNote from "./NeedsConfirmationStickyNote";

export default function AutopsyEnrollmentRateConfirmationStickyNote() {
  return (
    <NeedsConfirmationStickyNote
      ariaLabel="Autopsy enrollment rate confirmation note"
      message="Enrollment rate (enrolled / ADRC total) is ambiguous — confirm numerator and denominator definitions with Neuropath Core."
    />
  );
}

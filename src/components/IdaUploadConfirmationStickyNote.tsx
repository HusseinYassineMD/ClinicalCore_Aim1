import NeedsConfirmationStickyNote from "./NeedsConfirmationStickyNote";

export default function IdaUploadConfirmationStickyNote() {
  return (
    <NeedsConfirmationStickyNote
      ariaLabel="IDA imaging uploads confirmation note"
      message="MR/PET participant and scan totals may be cumulative in the RPPR narrative — please verify reporting-period scope with Data Core."
    />
  );
}

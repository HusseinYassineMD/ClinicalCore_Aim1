import NeedsConfirmationStickyNote from "./NeedsConfirmationStickyNote";

export default function FulfilledConfirmationStickyNote() {
  return (
    <NeedsConfirmationStickyNote
      ariaLabel="Requests fulfilled confirmation note"
      message="Fulfilled counts are ambiguous in the current RedCap export — please verify with the core before reporting."
    />
  );
}

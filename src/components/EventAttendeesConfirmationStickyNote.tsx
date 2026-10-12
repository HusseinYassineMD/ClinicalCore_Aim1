import NeedsConfirmationStickyNote from "./NeedsConfirmationStickyNote";

export default function EventAttendeesConfirmationStickyNote() {
  return (
    <NeedsConfirmationStickyNote
      ariaLabel="Event attendees confirmation note"
      message="Event attendee total may be cumulative or ambiguous in RPPR Table E1/E2 — please verify reporting-period scope with ORE Core."
    />
  );
}

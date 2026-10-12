"use client";

import {
  STICKY_NOTE_BODY,
  STICKY_NOTE_SHELL,
  STICKY_NOTE_TITLE,
} from "@/components/stickyNoteShell";

interface NeedsConfirmationStickyNoteProps {
  message: string;
  ariaLabel?: string;
}

/** Internal QA notes — off by default so the board dashboard stays clean. */
const SHOW_VERIFY_NOTES =
  process.env.NEXT_PUBLIC_SHOW_VERIFY_NOTES === "1";

export default function NeedsConfirmationStickyNote({
  message,
  ariaLabel = "Internal verification note",
}: NeedsConfirmationStickyNoteProps) {
  if (!SHOW_VERIFY_NOTES) {
    return null;
  }

  return (
    <div
      className={`${STICKY_NOTE_SHELL} border-amber-200/90 bg-amber-50/95`}
      aria-label={ariaLabel}
    >
      <p className={`${STICKY_NOTE_TITLE} text-amber-950`}>
        Verify before citing
      </p>
      <p className={STICKY_NOTE_BODY}>{message}</p>
    </div>
  );
}

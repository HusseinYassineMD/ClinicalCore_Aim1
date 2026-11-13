import {
  STICKY_NOTE_BODY,
  STICKY_NOTE_SHELL,
  STICKY_NOTE_TITLE,
} from "@/components/stickyNoteShell";
import { siteReportingWindow, ytdParticipantsWithVisit } from "@/data/siteReporting";
import table1HarmonizedActiveSnapshot from "@/data/table1HarmonizedActiveSnapshot.json";

const harmonizedN = table1HarmonizedActiveSnapshot.meta.participantCount;

export default function DemographicsTableStickyNote() {
  return (
    <div
      className={`${STICKY_NOTE_SHELL} border-violet-200 bg-violet-50/90`}
      aria-label="Demographics Table 1 display note"
    >
      <p className={`${STICKY_NOTE_TITLE} text-violet-900`}>
        Table 1 · October 16 snapshot (black)
      </p>
      <ul className={`${STICKY_NOTE_BODY} list-disc pl-3 space-y-0.5`}>
        <li>
          Xinhui Wang · RPPR tables to Aishwarya 2026-1113.xlsx · N=
          {harmonizedN} · received November 13, 2026
        </li>
        <li>
          Registry card: {ytdParticipantsWithVisit} with visit in{" "}
          {siteReportingWindow.label}
        </li>
        <li>Legacy old-RPPR workbook Table 1 (N=573) is not on this page</li>
      </ul>
    </div>
  );
}

import recMeetingAttendance from "@/data/recMeetingAttendance.json";

export interface RecAttendanceSession {
  sessionDate: string;
  attendees: number;
  reportedBy: string | null;
  reportedAt: string | null;
}

export interface RecAttendanceTotals {
  sessionCount: number;
  totalAttendees: number;
  avgAttendees: number;
  sessions: RecAttendanceSession[];
  sourceLabel: string;
  lastReportedAt: string | null;
}

function parseDay(value: string): Date | null {
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Zoom attendance for completed REC speaker-series sessions through referenceDate. */
export function getRecAttendanceTotals(
  referenceDate: Date = new Date(),
): RecAttendanceTotals {
  const ref = parseDay(referenceDate.toISOString().slice(0, 10)) ?? referenceDate;
  const refMs = ref.getTime();

  const sessions = (recMeetingAttendance.sessions as RecAttendanceSession[])
    .filter((row) => {
      const day = parseDay(row.sessionDate);
      return day != null && day.getTime() <= refMs;
    })
    .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

  const totalAttendees = sessions.reduce((sum, row) => sum + row.attendees, 0);
  const sessionCount = sessions.length;
  const avgAttendees =
    sessionCount > 0 ? Math.round((totalAttendees / sessionCount) * 10) / 10 : 0;

  const reportedDates = sessions
    .map((s) => s.reportedAt)
    .filter((v): v is string => Boolean(v))
    .sort();

  return {
    sessionCount,
    totalAttendees,
    avgAttendees,
    sessions,
    sourceLabel: recMeetingAttendance.meta?.sourceRoot ?? "REC meeting attendance",
    lastReportedAt: reportedDates.at(-1) ?? null,
  };
}

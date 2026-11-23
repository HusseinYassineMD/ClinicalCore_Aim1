import recMeetingAttendance from "@/data/recMeetingAttendance.json";

export interface RecAttendanceSession {
  sessionDate: string;
  attendees: number;
  reportedBy: string | null;
  reportedAt: string | null;
  topic?: string | null;
  zoomMeetingId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  totalParticipantMinutes?: number | null;
  sourceFile?: string | null;
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

/** Zoom attendance for completed REC speaker-series sessions in [windowStart, referenceDate]. */
export function getRecAttendanceTotals(
  referenceDate: Date = new Date(),
  windowStartIso: string = "2026-01-01",
): RecAttendanceTotals {
  const ref = parseDay(referenceDate.toISOString().slice(0, 10)) ?? referenceDate;
  const refMs = ref.getTime();
  const start = parseDay(windowStartIso);
  const startMs = start?.getTime() ?? 0;

  const sessions = (recMeetingAttendance.sessions as RecAttendanceSession[])
    .filter((row) => {
      const day = parseDay(row.sessionDate);
      if (day == null) return false;
      const ms = day.getTime();
      return ms >= startMs && ms <= refMs;
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

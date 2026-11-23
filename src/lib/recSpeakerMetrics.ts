import recSpeakerSeries from "@/data/recSpeakerSeries.json";

export interface RecSpeakerEntry {
  id: string;
  name: string;
  email?: string;
  date: string;
  title?: string;
  status: string;
  semester?: string;
}

export interface RecSpeakerYear {
  label: string;
  entries: RecSpeakerEntry[];
}

export interface RecSessionCounts {
  completed: number;
  scheduled: number;
  academicYear: string;
  seriesLabel: string;
  asOfDate: string;
  windowStartDate: string;
  /** All schedule entries in the window (across academic years), sorted by date. */
  entries: RecSpeakerEntry[];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseEntryDate(value: string): Date | null {
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : startOfDay(d);
}

function formatAsOfDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function formatIsoDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function allEntries(
  years: Record<string, RecSpeakerYear>,
): RecSpeakerEntry[] {
  const rows: RecSpeakerEntry[] = [];
  for (const block of Object.values(years)) {
    for (const entry of block.entries ?? []) {
      if (entry?.date) rows.push(entry);
    }
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calendar reporting window (default: site YTD from Jan 1) across academic-year
 * blocks — so spring sessions in 2025–2026 are included with fall 2026–2027.
 */
export function getRecSessionCounts(
  referenceDate: Date = new Date(),
  windowStartIso: string = "2026-01-01",
): RecSessionCounts {
  const years = recSpeakerSeries.years as Record<string, RecSpeakerYear>;
  const today = startOfDay(referenceDate);
  const windowStart =
    parseEntryDate(windowStartIso) ?? parseEntryDate("2026-01-01")!;
  const windowStartDate = formatIsoDay(windowStart);

  const entries = allEntries(years).filter((entry) => {
    const date = parseEntryDate(entry.date);
    return date != null && date >= windowStart;
  });

  let completed = 0;
  let scheduled = 0;

  for (const entry of entries) {
    const date = parseEntryDate(entry.date);
    if (!date) continue;

    if (date < today) {
      if (entry.status !== "Open" && entry.name !== "Open slot") {
        completed += 1;
      }
      continue;
    }

    scheduled += 1;
  }

  const lastDate = entries.at(-1)?.date;
  const seriesLabel = lastDate
    ? `Calendar YTD from ${windowStartDate} · schedule through ${lastDate}`
    : `Calendar YTD from ${windowStartDate}`;

  return {
    completed,
    scheduled,
    academicYear: "calendar-ytd",
    seriesLabel,
    asOfDate: formatAsOfDate(referenceDate),
    windowStartDate,
    entries,
  };
}

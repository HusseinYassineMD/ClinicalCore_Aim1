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

function pickAcademicYear(
  years: Record<string, RecSpeakerYear>,
  today: Date,
): string {
  const todayMs = startOfDay(today).getTime();
  const keys = Object.keys(years).sort((a, b) => b.localeCompare(a));

  for (const year of keys) {
    const dates = years[year].entries
      .map((entry) => parseEntryDate(entry.date))
      .filter((entry): entry is Date => entry != null);
    if (!dates.length) continue;

    const min = Math.min(...dates.map((d) => d.getTime()));
    const max = Math.max(...dates.map((d) => d.getTime()));
    if (todayMs >= min && todayMs <= max) {
      return year;
    }
  }

  return keys[0] ?? "";
}

/** Match REC Speaker Series dashboard: past booked vs all upcoming slots. */
export function getRecSessionCounts(
  referenceDate: Date = new Date(),
): RecSessionCounts {
  const years = recSpeakerSeries.years as Record<string, RecSpeakerYear>;
  const academicYear = pickAcademicYear(years, referenceDate);
  const block = years[academicYear];
  const entries = block?.entries ?? [];
  const today = startOfDay(referenceDate);

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

  return {
    completed,
    scheduled,
    academicYear,
    seriesLabel: block?.label ?? academicYear,
    asOfDate: formatAsOfDate(referenceDate),
  };
}

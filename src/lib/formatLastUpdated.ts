import { parseDashboardDate } from "@/lib/parseDashboardDate";

/** Display dashboard refresh timestamps in a consistent, readable form. */
export function formatLastUpdated(value: string): string {
  const date = parseDashboardDate(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date);
}

/** Pick the most recent ISO or YYYY-MM-DD timestamp from a list. */
export function latestTimestamp(...values: (string | undefined)[]): string {
  let latestMs = -1;
  let latestValue = values.find(Boolean) ?? "";

  for (const value of values) {
    if (!value) continue;
    const ms = parseDashboardDate(value).getTime();
    if (!Number.isNaN(ms) && ms > latestMs) {
      latestMs = ms;
      latestValue = value;
    }
  }

  return latestValue;
}

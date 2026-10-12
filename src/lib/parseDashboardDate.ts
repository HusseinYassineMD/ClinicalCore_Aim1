/** Parse dashboard timestamps the same on Node (SSR) and in the browser. */
export function parseDashboardDate(value: string): Date {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T12:00:00.000Z`);
  }
  return new Date(trimmed);
}

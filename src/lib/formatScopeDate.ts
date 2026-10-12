/** Presenter-friendly dates from ISO strings (UTC calendar day). */
export function formatScopeDate(iso?: string | null): string {
  if (!iso?.trim()) return "—";
  const day = iso.trim().slice(0, 10);
  const d = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

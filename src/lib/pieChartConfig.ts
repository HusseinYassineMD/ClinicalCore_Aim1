/** Recharts Pie: first slice at 12 o'clock, clockwise. */
export const PIE_START_AT_TWELVE = {
  startAngle: 90,
  endAngle: -270,
} as const;

export function sortPieSlicesAscending<
  T extends { count?: number; value?: number; label?: string; name?: string },
>(data: readonly T[]): T[] {
  return [...data].sort((a, b) => {
    const ca = a.count ?? a.value ?? 0;
    const cb = b.count ?? b.value ?? 0;
    if (ca !== cb) return ca - cb;
    const la = a.label ?? a.name ?? "";
    const lb = b.label ?? b.name ?? "";
    return la.localeCompare(lb);
  });
}

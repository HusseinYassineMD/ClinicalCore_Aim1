/** Stable en-US formatting for SSR and client (avoids locale hydration drift). */
export function formatInteger(value: number): string {
  return value.toLocaleString("en-US");
}

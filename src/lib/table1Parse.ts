import type { DemographicGroup, DemographicGroupKey } from "@/types/aim1";

/** Leading integer from strings like "192 (33.5%)" or "573". */
export function parseLeadingCount(raw: string | number): number {
  const m = String(raw ?? "").trim().match(/^(\d+)/);
  return m ? Number(m[1]) : 0;
}

/** Percent inside parentheses, e.g. "317 (55.3%)" → 55.3 */
export function parseParenPercent(raw: string): number {
  const m = raw.match(/\(([\d.]+)%\)/);
  return m ? Number(m[1]) : 0;
}

/** Mean from "72.7 (11.3)" style cells. */
export function parseMeanSD(raw: string | number): number {
  const m = String(raw ?? "").trim().match(/^([\d.]+)/);
  return m ? Number(m[1]) : 0;
}

/** "36.7%" → 36.7 */
export function parsePercent(raw: string): number {
  const m = raw.trim().match(/^([\d.]+)/);
  return m ? Number(m[1]) : 0;
}

export const TABLE1_ETHNICITY_KEYS: Exclude<DemographicGroupKey, "overall">[] = [
  "hispanic",
  "white",
  "black",
  "asian",
];

export type Table1StratumKey = (typeof TABLE1_ETHNICITY_KEYS)[number] | "otherUnknown";

/** Strata present in a Table 1 snapshot (includes other/unknown when exported). */
export function table1StrataKeys(data: {
  hispanic: DemographicGroup;
  white: DemographicGroup;
  black: DemographicGroup;
  asian: DemographicGroup;
  otherUnknown?: DemographicGroup;
}): Table1StratumKey[] {
  const keys: Table1StratumKey[] = [...TABLE1_ETHNICITY_KEYS];
  if (data.otherUnknown) keys.push("otherUnknown");
  return keys;
}

export function cdrCounts(g: DemographicGroup) {
  return {
    cdr0: parseLeadingCount(g.cdr0),
    cdr05: parseLeadingCount(g.cdr05),
    cdrGe1: parseLeadingCount(g.cdrGe1),
  };
}

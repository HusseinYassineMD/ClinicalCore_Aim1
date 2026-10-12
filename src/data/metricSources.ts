/** Workbook filenames and table references for data provenance badges. */
export const METRIC_SOURCES = {
  rppr: "RPPR11382447.FINAL.1.30.26 NO BUDGET(1).pdf",
  clinicalCoreY7: "2. Clinical Core Metrics_Y7.xlsx",
  dataCoreY7: "3. Data Core Metrics_Y7.xlsx",
  neuropathCoreY7: "4. Neuropath Core Metrics_Y7.xlsx",
  biomarkerCore: "6. Biomarker Core Metrics.xlsx",
  imagingCore: "8. Imaging Core Metrics.xlsx",
  oreCore: "5. ORE Core Metrics.xlsx",
  budgetJustification: "Grant budget justification",
  redcapBiofluidCsv: "REDCap Biofluid Request Tracking (CSV export)",
  redcapNeurobankCsv: "REDCap Neurobank Request Tracking (CSV export)",
  recSpeakerSeries: "ADRC REC Speaker Series · speakers.json",
  recRoster: "REC roster CSVs · data/reference/rec/",
} as const;

export function sourceLabel(
  file: string,
  table: string,
): string {
  return `${file} · ${table}`;
}

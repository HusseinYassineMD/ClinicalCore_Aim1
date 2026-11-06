# Data layout

Source files for the Aim 1 metrics dashboard and sync scripts. Generated JSON consumed by the app lives in `src/data/`.

| Path | Purpose |
|------|---------|
| `redcap/` | REDCap CSV exports (specimen sharing, GeneScreen). Drop new exports here; run `npm run sync:redcap`. |
| `rppr-data-package/` | Harmonized Data Core delivery (UDS, biomarkers, BRS, imaging). Run `npm run sync:package`. |
| `MAPDataPacket-November-6/` | MAP BRS cohort and APOE genotype labels exports pulled Nov 6, 2026, 12:48. A copy also sits in `reference/james-supplements/`. |
| `JamesDataPacket-November-5/` | Integrated Biomarkers v1.1.2 received Nov 5, 2026. |
| `uds_data/` | NACC UDS export for Table 1–style demographics. |
| `brs_data/` | BRS MAPDatabase workbooks (`.xlsx` → CSV via registry sync). |
| `reference/core-metrics/` | Year 7 Core Metrics workbooks (Clinical, Data, ORE, etc.). |
| `reference/rppr/` | RPPR PDF and RPPR table workbooks. |
| `reference/grants/` | Renewal application and grant reference PDFs. |
| `reference/finance/` | Budget / spendable balance snapshots. |
| `reference/genescreen/` | GeneScreen ops PDFs (not used for black YTD headline). |
| `reference/nih/` | NIH workflow reference PDFs. |
| `reference/james-supplements/` | Supplemental harmonized drops and dictionaries. |
| `reference/brs-rppr-data-core/` | BRS Data Core table JSON for neuropath section. |
| `reference/rec/` | REC scholars, faculty, and training-program CSVs → `npm run sync:rec`. |
| `reference/biomarker-core/` | Abhay Sagare sample processing workbook → `npm run sync:biomarker-processing` → `src/data/biomarkerCoreSampleProcessing2026.json`. |
| `reference/redcap/` | REDCap form field reference (referral / permission-to-contact — not yet wired to dashboard). |
| `ATN UDS.csv` | APOE / ATN sidecar for UDS Table 1 script. |

**Do not** place new CSVs or workbooks in the repository root — use the folders above.

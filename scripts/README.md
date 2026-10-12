# Scripts

Python and Node utilities for syncing source data → `src/data/` and generating board packets.

| Script | Purpose |
|--------|---------|
| `aggregate_rppr_data_package.py` | Harmonized CSVs → `rpprDataPackage.json` |
| `aggregate_specimen_sharing.py` | RedCap specimen CSVs → `redcapSpecimenSharing.json` |
| `aggregate_genescreen_ytd.py` | GeneScreen RedCap → `geneScreenYtd.json` |
| `aggregate_table1_demographics.py` | UDS export → Table 1 JSON |
| `parse_rppr_metrics.py` | RPPR PDF (`data/reference/rppr/`) → `rpprMetrics.json` |
| `aggregate_rec_roster.py` | REC CSVs → `recRoster.json` |
| `validate_dashboard.py` | Full UI vs source cross-check |
| `generate_*` | Provenance PDFs, briefing PDFs, PowerPoint decks |

Shared paths: `project_paths.py`.

# REDCap exports

Place labeled CSV exports here (GeneScreen, biofluid/neurobank requests, USC SCAN Participant Tracking, and future participant-tracking pulls).

After adding files:

```bash
npm run sync:redcap
npm run validate:dashboard
```

**USC Scan Progress** uses `USCSCANParticipantTr*.csv` → `scripts/aggregate_usc_scan_progress.py` → `src/data/uscScanProgress.json` (Complete baseline MRI / Amyloid / Tau in the dashboard YTD window).

**Referral / permission-to-contact field definitions (REDCap form vs NACC `refersc`):**  
See [`../reference/redcap/USC_ADRC_Referral_Fields_Reference.md`](../reference/redcap/USC_ADRC_Referral_Fields_Reference.md) — review when a new recruitment/participant REDCap export arrives.

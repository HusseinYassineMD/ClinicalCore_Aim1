# USC ADRC Clinical Core · Aim 1 Metrics Dashboard

Next.js dashboard for board- and NIH-facing Clinical Core metrics (Jan 1, 2026 YTD harmonized export + green RPPR cumulative).

## Quick start

```bash
npm install
npm run dev          # http://localhost:3002
npm run validate:dashboard
npm run sync:all     # refresh JSON from data/ (when new drops arrive)
```

Production-style local run: `npm run demo`.

## GitHub Pages (password-protected UI)

Static export with a **username + password gate** (default username `usc-adrc`). Set repository secret **`DASHBOARD_PASSWORD`** in GitHub, then push to `main` — Actions deploys to Pages.

```bash
node scripts/hash_dashboard_password.mjs 'YourPassword'   # optional local check
```

Local dev without login: add `NEXT_PUBLIC_DASHBOARD_AUTH_DISABLED=1` to `.env.local`.

**Privacy note:** GitHub Pages serves static files. The login screen blocks casual visitors, but a determined technical user could inspect downloaded assets. For stricter control, use USC VPN / Cloudflare Access / private app hosting. Do not share the Pages URL publicly.

## Repository layout

| Path | Role |
|------|------|
| `src/app/` | Next.js routes (dashboard, data package explorer, audit). |
| `src/components/` | UI sections and charts. |
| `src/data/` | **Committed aggregates** read by the app (`rpprDataPackage.json`, etc.). |
| `data/` | **Source files** on disk — see [data/README.md](data/README.md). |
| `scripts/` | Python/Node sync, validation, PDF/deck generators. |
| `reports/` | Generated provenance PDFs/CSVs (copied to `public/reports/` when needed). |
| `assets/deck/` | Slide HTML, deck JSON, exported PNG/PPTX. |
| `assets/dashboard-screenshots/` | Captured dashboard images for narrative deck. |
| `public/` | Static assets served by Next.js. |

## Key npm scripts

- `sync:redcap` — RedCap specimen + GeneScreen YTD  
- `sync:package` — Harmonized data package aggregation  
- `sync:rppr` — Parse RPPR PDF → `rpprMetrics.json`  
- `validate:dashboard` — Cross-check UI numbers vs sources  
- `generate:provenance` — Metric provenance PDF for Adrienne / board packet  

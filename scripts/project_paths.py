"""Canonical paths for sync/validation scripts (keep data out of repo root)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SRC_DATA = ROOT / "src" / "data"
REDCAP_DIR = DATA / "redcap"
PKG_DIR = DATA / "rppr-data-package"
REFERENCE = DATA / "reference"
CORE_METRICS_DIR = REFERENCE / "core-metrics"
RPPR_REF_DIR = REFERENCE / "rppr"
GRANTS_REF_DIR = REFERENCE / "grants"
FINANCE_REF_DIR = REFERENCE / "finance"
REPORTS_DIR = ROOT / "reports"
ASSETS_DIR = ROOT / "assets"
DECK_DIR = ASSETS_DIR / "deck"
DECK_EXPORT_DIR = DECK_DIR / "export"
DECK_HTML_DIR = DECK_DIR / "html"
DECK_DATA_DIR = DECK_DIR / "data"
SCREENSHOT_DIR = ASSETS_DIR / "dashboard-screenshots"

RPPR_PDF = RPPR_REF_DIR / "RPPR11382447.FINAL.1.30.26 NO BUDGET(1).pdf"
RPPR_PDF_FALLBACK = Path.home() / "Downloads" / "RPPR11382447.FINAL.1.30.26 NO BUDGET(1).pdf"

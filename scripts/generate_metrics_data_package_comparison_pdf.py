#!/usr/bin/env python3
"""PDF: Table 1 differences, Table 2 synced in both — clean full-width tables."""

from __future__ import annotations

import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from metrics_package_comparison_data import (
    ComparisonRow,
    build_comparison_rows,
    difference_type,
    filter_difference_rows,
    filter_overlap_rows,
    synced_summary,
)

ROOT = Path(__file__).resolve().parents[1]
PACKAGE_JSON = ROOT / "src" / "data" / "rpprDataPackage.json"
RPPR_METRICS_JSON = ROOT / "src" / "data" / "rpprMetrics.json"
OUTPUT_DIR = ROOT / "reports"
OUTPUT_PDF = OUTPUT_DIR / "USC_ADRC_Metrics_vs_Data_Package_Comparison.pdf"
OUTPUT_CSV = OUTPUT_DIR / "USC_ADRC_Metrics_vs_Data_Package_Comparison.csv"

# Column width ratios (must sum to 1.0) — applied to full printable page width
COL_LABELS = [
    "Category",
    "Data element",
    "What it is",
    "Metrics",
    "Data pkg",
    "Status",
    "Detail",
]
COL_RATIOS = [0.10, 0.13, 0.22, 0.06, 0.06, 0.13, 0.30]

UNICODE_REPLACEMENTS = {
    "\u2013": "-",
    "\u2014": "-",
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u00b7": "-",
}


def ascii_safe(text: str) -> str:
    for src, dst in UNICODE_REPLACEMENTS.items():
        text = text.replace(src, dst)
    return text.encode("ascii", "replace").decode("ascii")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


class ComparisonPdf:
    LINE_H = 4.0
    PAD = 1.2

    def __init__(self) -> None:
        from fpdf import FPDF

        self.pdf = FPDF(orientation="L", unit="mm", format="Letter")
        self.pdf.set_auto_page_break(auto=False)
        self.pdf.set_margins(10, 10, 10)
        self.col_widths = [self.pdf.epw * r for r in COL_RATIOS]
        self._repeat_header: callable = lambda: None

    def _t(self, text: str) -> str:
        return ascii_safe(text)

    def _wrap_lines(self, text: str, width: float) -> list[str]:
        self.pdf.set_font("Helvetica", "", 7)
        return self.pdf.multi_cell(
            width - 2 * self.PAD,
            self.LINE_H,
            self._t(text),
            dry_run=True,
            output="LINES",
        )

    def _row_height(self, cells: list[str]) -> float:
        max_lines = 1
        for text, w in zip(cells, self.col_widths, strict=True):
            max_lines = max(max_lines, len(self._wrap_lines(text, w)))
        return max(max_lines * self.LINE_H + 2 * self.PAD, 8)

    def _draw_table_header(self) -> None:
        self.pdf.set_font("Helvetica", "B", 7.5)
        self.pdf.set_fill_color(26, 39, 68)
        self.pdf.set_text_color(255, 255, 255)
        x0 = self.pdf.l_margin
        y0 = self.pdf.get_y()
        h = 8
        x = x0
        for label, w in zip(COL_LABELS, self.col_widths, strict=True):
            self.pdf.rect(x, y0, w, h, style="DF")
            self.pdf.set_xy(x + self.PAD, y0 + 2)
            self.pdf.cell(w - 2 * self.PAD, 4, self._t(label), align="L")
            x += w
        self.pdf.set_xy(x0, y0 + h)

    def _maybe_page_break(self, row_h: float) -> None:
        bottom = self.pdf.h - self.pdf.b_margin
        if self.pdf.get_y() + row_h > bottom:
            self.pdf.add_page()
            self._repeat_header()

    def _draw_row(self, cells: list[str], *, shaded: bool) -> None:
        row_h = self._row_height(cells)
        self._maybe_page_break(row_h)

        x0 = self.pdf.l_margin
        y0 = self.pdf.get_y()
        fill = (248, 247, 252) if shaded else (255, 255, 255)

        x = x0
        for text, w in zip(cells, self.col_widths, strict=True):
            self.pdf.set_fill_color(*fill)
            self.pdf.set_draw_color(180, 175, 195)
            self.pdf.rect(x, y0, w, row_h, style="FD")
            self.pdf.set_text_color(30, 30, 30)
            self.pdf.set_font("Helvetica", "", 7)
            self.pdf.set_xy(x + self.PAD, y0 + self.PAD)
            self.pdf.multi_cell(w - 2 * self.PAD, self.LINE_H, self._t(text))
            x += w

        self.pdf.set_xy(x0, y0 + row_h)

    def _begin_table(self, section_title: str, *, new_page: bool) -> None:
        if new_page:
            self.pdf.add_page()
        elif self.pdf.page_no() == 0:
            self.pdf.add_page()

        self.pdf.set_font("Helvetica", "B", 10)
        self.pdf.set_text_color(26, 39, 68)
        self.pdf.cell(0, 5, self._t(section_title), new_x="LMARGIN", new_y="NEXT")
        self.pdf.ln(2)

        def repeat() -> None:
            self._draw_table_header()

        self._repeat_header = repeat
        repeat()

    def render_doc_header(self, subtitle: str) -> None:
        self.pdf.add_page()
        self.pdf.set_font("Helvetica", "B", 10)
        self.pdf.set_text_color(26, 39, 68)
        self.pdf.cell(0, 5, self._t("USC ADRC - Metrics Dashboard vs Data Package"))
        self.pdf.ln(4)
        self.pdf.set_font("Helvetica", "", 7.5)
        self.pdf.set_text_color(90, 90, 90)
        self.pdf.cell(0, 4, self._t(subtitle), new_x="LMARGIN", new_y="NEXT")
        self.pdf.ln(3)

    def render_table(
        self,
        section_title: str,
        rows: list[ComparisonRow],
        *,
        status_fn,
        new_page: bool,
    ) -> None:
        self._begin_table(section_title, new_page=new_page)

        for i, row in enumerate(rows):
            self._draw_row(
                [
                    row.category,
                    row.element,
                    row.description,
                    row.metrics,
                    row.data_package,
                    status_fn(row),
                    row.notes,
                ],
                shaded=i % 2 == 0,
            )

        self.pdf.ln(4)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.pdf.output(str(path))


def write_csv(
    differences: list[ComparisonRow],
    synced: list[ComparisonRow],
    path: Path,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "Table",
                "Category",
                "Data element",
                "What it is",
                "Metrics dashboard",
                "Data package",
                "Status",
                "Detail",
            ]
        )
        for row in differences:
            writer.writerow(
                [
                    "Differences",
                    row.category,
                    row.element,
                    row.description,
                    row.metrics,
                    row.data_package,
                    difference_type(row),
                    row.notes,
                ]
            )
        for row in synced:
            writer.writerow(
                [
                    "Synced in both",
                    row.category,
                    row.element,
                    row.description,
                    row.metrics,
                    row.data_package,
                    synced_summary(row),
                    row.notes,
                ]
            )


def main() -> int:
    try:
        from fpdf import FPDF  # noqa: F401
    except ImportError:
        print("Install fpdf2: .venv-pdf/bin/pip install fpdf2", file=sys.stderr)
        return 1

    if not PACKAGE_JSON.exists():
        print(f"Missing {PACKAGE_JSON}. Run: npm run sync:package", file=sys.stderr)
        return 1

    package = load_json(PACKAGE_JSON)
    rppr = load_json(RPPR_METRICS_JSON) if RPPR_METRICS_JSON.exists() else {}
    totals = package.get("totals") or {}
    period = rppr.get("meta", {}).get("reportingPeriod", "Jul-Dec 2025")
    package_date = package.get("receivedAt", "2026-09-16")
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    all_rows = build_comparison_rows(totals, rppr)
    differences = filter_difference_rows(all_rows)
    synced = filter_overlap_rows(all_rows)

    subtitle = (
        f"Metrics period {period} | Data package {package_date} | Generated {generated}"
    )

    doc = ComparisonPdf()
    doc.render_doc_header(subtitle)
    doc.render_table(
        f"Table 1 - Differences ({len(differences)} items)",
        differences,
        status_fn=difference_type,
        new_page=False,
    )
    doc.render_table(
        f"Table 2 - Synced in both ({len(synced)} items)",
        synced,
        status_fn=synced_summary,
        new_page=True,
    )
    doc.save(OUTPUT_PDF)
    write_csv(differences, synced, OUTPUT_CSV)

    print(f"Wrote {OUTPUT_PDF} ({len(differences)} differences + {len(synced)} synced)")
    print(f"Wrote {OUTPUT_CSV}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

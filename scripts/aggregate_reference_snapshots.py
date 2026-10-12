#!/usr/bin/env python3
"""Extract Oct 2026 finance + GeneScreen reference metadata for data-sources page."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "data" / "reference"
FIN_OUT = ROOT / "src" / "data" / "financeBudgetSnapshot.json"
GS_OUT = ROOT / "src" / "data" / "geneScreenWeeklyReference.json"


def load_pg_summary() -> dict:
    import openpyxl

    path = REF / "finance" / "PG 10-09-2026_Budget_to_Actuals_2.0_-_Optimized (1).xlsx"
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb["USE THIS "]
    rows = []
    grand = None
    for row in ws.iter_rows(values_only=True):
        if not row or not row[0]:
            continue
        label = str(row[0]).strip()
        if label.startswith("PG"):
            rows.append(
                {
                    "projectId": label.strip(),
                    "budget": float(row[1] or 0),
                    "actuals": float(row[2] or 0),
                    "obligations": float(row[3] or 0),
                    "balance": float(row[4] or 0),
                }
            )
        if label == "Grand Total":
            grand = {
                "budget": float(row[1] or 0),
                "actuals": float(row[2] or 0),
                "obligations": float(row[3] or 0),
                "balance": float(row[4] or 0),
            }
    return {"projects": rows, "grandTotal": grand}


def load_gf_totals() -> dict:
    import openpyxl

    path = REF / "finance" / "GF 10-09-2026_spendable balance.xlsx"
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb[wb.sheetnames[0]]
    totals = None
    for row in ws.iter_rows(values_only=True):
        if row and str(row[0]).strip() == "Totals":
            totals = {
                "priorYearEndingBalance": float(row[5] or 0),
                "income": float(row[6] or 0),
                "budget": float(row[7] or 0),
                "expense": float(row[8] or 0),
                "obligations": float(row[9] or 0),
                "availableBalance": float(row[10] or 0),
                "remainingBalanceIncludingPayout": float(row[14] or 0),
            }
    return totals or {}


def main() -> None:
    gene_screen_pdf = (
        REF
        / "genescreen"
        / "USC_GeneScreen_Recruitment_Enrollment_Summary_2026-10-09.pdf"
    )
    finance = {
        "asOfDate": "2026-10-09",
        "scope": "CPBH Center PG/GF finance (not ADRC clinical core metric cards)",
        "sourceFiles": {
            "pgBudgetToActuals": "data/reference/finance/PG 10-09-2026_Budget_to_Actuals_2.0_-_Optimized (1).xlsx",
            "gfSpendableBalance": "data/reference/finance/GF 10-09-2026_spendable balance.xlsx",
        },
        "pgBudgetSummary": load_pg_summary(),
        "gfSpendableTotals": load_gf_totals(),
        "note": (
            "USE THIS sheet: PG1040966–968 budget vs actuals vs obligations. "
            "GF file: spendable gift balances for CPBH-related funds. "
            "Does not replace grant renewal targets on registry charts."
        ),
    }
    genescreen = {
        "asOfDate": "2026-10-09",
        "sourceFile": str(gene_screen_pdf.relative_to(ROOT)),
        "sourceSystem": "USC GeneScreen weekly export (biobetagenetest.usc.edu)",
        "content": "Weekly operational pipeline: leads, kits, genotypes, members added per week",
        "dashboardUse": (
            "Clinical Core dashboard GeneScreen YTD headline remains USC REDCap "
            "(geneScreenYtd.json). This PDF is a cross-check for operations, not wired to black metric cards."
        ),
        "redcapYtdNewMembersForComparison": 55,
        "reportingPeriodLabel": "1/1/2026 – 10/13/2026",
    }
    FIN_OUT.write_text(json.dumps(finance, indent=2) + "\n", encoding="utf-8")
    GS_OUT.write_text(json.dumps(genescreen, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {FIN_OUT.relative_to(ROOT)}")
    print(f"Wrote {GS_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

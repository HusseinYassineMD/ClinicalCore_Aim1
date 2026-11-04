#!/usr/bin/env python3
"""Parse Biomarker Core sample processing workbook (Abhay Sagare) → dashboard JSON."""

from __future__ import annotations

import csv
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (
    ROOT
    / "data/reference/biomarker-core/Biomarker Core Sample Processing January-October 2026.xlsx"
)
OUTPUT = ROOT / "src/data/biomarkerCoreSampleProcessing2026.json"

COL_KEYS = ("plasma", "buffyCoat", "serum")


def xlsx_to_csv(path: Path) -> list[list[str]]:
    result = subprocess.run(
        ["npx", "--yes", "xlsx-cli", str(path)],
        capture_output=True,
        text=True,
        cwd=ROOT,
        check=True,
    )
    rows: list[list[str]] = []
    for line in result.stdout.splitlines():
        rows.append(next(csv.reader([line])))
    return rows


def parse_rows(rows: list[list[str]]) -> dict:
    months: list[dict] = []
    totals: dict | None = None
    i = 0
    while i < len(rows):
        label = (rows[i][0] or "").strip()
        if label.endswith("2026") and "Total" not in label:
            month_label = label
            samples_row = rows[i + 1] if i + 1 < len(rows) else []
            tubes_row = rows[i + 2] if i + 2 < len(rows) else []
            if (samples_row[0] or "").strip().startswith("# of samples"):
                months.append(
                    {
                        "month": month_label,
                        "samples": {
                            "plasma": int(samples_row[1] or 0),
                            "buffyCoat": int(samples_row[2] or 0),
                            "serum": int(samples_row[3] or 0),
                        },
                        "tubes": {
                            "plasma": int(tubes_row[1] or 0),
                            "buffyCoat": int(tubes_row[2] or 0),
                            "serum": int(tubes_row[3] or 0),
                        },
                    }
                )
                i += 3
                continue
        if label == "Totals":
            samples_row = rows[i + 1] if i + 1 < len(rows) else []
            tubes_row = rows[i + 2] if i + 2 < len(rows) else []
            totals = {
                "samples": {
                    "plasma": int(samples_row[1] or 0),
                    "buffyCoat": int(samples_row[2] or 0),
                    "serum": int(samples_row[3] or 0),
                },
                "tubes": {
                    "plasma": int(tubes_row[1] or 0),
                    "buffyCoat": int(tubes_row[2] or 0),
                    "serum": int(tubes_row[3] or 0),
                },
            }
            break
        i += 1

    if not totals or not months:
        raise ValueError("Could not parse sample processing workbook")

    return {"months": months, "totals": totals}


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source workbook: {SOURCE}")

    parsed = parse_rows(xlsx_to_csv(SOURCE))
    payload = {
        "meta": {
            "providedBy": "Abhay Sagare · USC ADRC Biomarker Core",
            "sourceFile": SOURCE.relative_to(ROOT).as_posix(),
            "reportingPeriodLabel": "January – October 2026",
            "startMonth": "2026-01",
            "endMonth": "2026-10",
            "lastUpdated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "note": (
                "Operational sample processing counts (# samples and total tubes) "
                "by month. Distinct from James harmonized biospecimen inventory "
                "and NCRAD assay rows on the dashboard."
            ),
        },
        **parsed,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    t = payload["totals"]["samples"]
    print(f"  Totals samples plasma={t['plasma']} buffy={t['buffyCoat']} serum={t['serum']}")


if __name__ == "__main__":
    main()

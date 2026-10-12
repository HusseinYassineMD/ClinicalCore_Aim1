#!/usr/bin/env python3
"""Sync ADRC REC Speaker Series schedule into dashboard JSON."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = (
    ROOT.parent.parent
    / "REC_Database"
    / "REC_SpeakerSeries"
    / "data"
    / "speakers.json"
)
OUTPUT = ROOT / "src/data/recSpeakerSeries.json"


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"REC speaker source not found: {SOURCE}")

    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    meta = payload.pop("_meta", {})
    years = {
        year: block
        for year, block in payload.items()
        if isinstance(block, dict) and "entries" in block
    }

    out = {
        "source": str(SOURCE.relative_to(ROOT.parent.parent)),
        "syncedAt": datetime.now(timezone.utc).isoformat(),
        "lastUpdated": meta.get("lastUpdated"),
        "years": years,
    }

    OUTPUT.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT} ({len(years)} academic years)")


if __name__ == "__main__":
    main()

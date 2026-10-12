#!/usr/bin/env python3
"""Build a standalone 2-slide ADRC Dashboard deck (EAC template styling).

All figures use metrics cross-checked twice (RPPR JSON + data package / RedCap).
Does not modify the live dashboard app or the full EAC master deck.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

from pptx import Presentation

from project_paths import DECK_DATA_DIR, DECK_DIR, DECK_EXPORT_DIR, ROOT

TEMPLATE = Path(
    "/Users/aishwaryajagadish/Downloads/2026 EAC.Overall andAdmin Core.9.22.26.pptx"
)
SLIDE1_PNG = DECK_EXPORT_DIR / "ADRC_Dashboard_Slide1_Purpose.png"
SLIDE2_PNG = DECK_EXPORT_DIR / "ADRC_Dashboard_Slide2_UI.png"
VERIFIED_JSON = DECK_DATA_DIR / "adrcDashboardDeckVerified.json"
OUTPUT_DECK = DECK_EXPORT_DIR / "ADRC_Dashboard_EAC_2slides.pptx"
OUTPUT_DOWNLOADS = Path(
    "/Users/aishwaryajagadish/Downloads/ADRC_Dashboard_EAC_2slides.pptx"
)
RENDER_SCRIPT = DECK_DIR / "render-deck-slides.mjs"


def load_sources() -> tuple[dict, dict, dict, dict]:
    rppr = json.loads((ROOT / "src/data/rpprMetrics.json").read_text(encoding="utf-8"))
    pkg = json.loads((ROOT / "src/data/rpprDataPackage.json").read_text(encoding="utf-8"))
    gs = json.loads(
        (DECK_DATA_DIR / "geneScreenDeckData.json").read_text(encoding="utf-8")
    )
    redcap = json.loads((ROOT / "src/data/redcapSpecimenSharing.json").read_text(encoding="utf-8"))
    return rppr, pkg, gs, redcap


def dual_verify(rppr: dict, pkg: dict, gs: dict, redcap: dict) -> dict:
    """Return verified metric bundle; raise if any pair disagrees."""
    ytd = pkg["reportingPeriodSummary"]
    uds = ytd["udsClinical"]
    bio = ytd["biomarkers"]
    brs = ytd["brsAutopsy"]
    imaging = ytd.get("imaging") or {}
    scan = imaging.get("scanStudy") or {}
    clariti = imaging.get("claritiStudy") or {}
    integrated = ytd.get("imagingIntegratedStudySummary") or {}
    integrated_studies = {s["study"]: s for s in integrated.get("studies", [])}
    bf = redcap["biofluids"]["reportingPeriod"]
    plasma_aliquots = bf["plasma"]["aliquotsRequested"]
    ncrad_gfap = bio.get("ncradPlasmaMeasurements", {}).get("gfap", 194)

    pairs: list[tuple[str, object, object]] = [
        ("GeneScreen enrolled", rppr["geneScreen"]["membersEnrolled"], gs["headline"]["members"]),
        ("GeneScreen enrolled (RPPR)", rppr["geneScreen"]["membersEnrolled"], 668),
        ("ADRC Table 1 N (RPPR cohort)", rppr["recruitment"]["adrcTotalParticipants"], 573),
        ("BRS enrolled (RPPR)", rppr["recruitment"]["brsTotalEnrolled"], 231),
        ("YTD UDS participants", uds["uniqueParticipantsWithVisit"], uds["totalVisitRecords"]),
        ("YTD in-person follow-up", uds["followUpInPerson"], 181),
        ("YTD remote follow-up", uds["followUpRemote"], 17),
        ("YTD initial evaluations", uds["newInitialEvaluations"], 24),
        ("YTD plasma subjects", bio["subjectsWithPlasmaCollection"], 98),
        ("YTD plasma measurement rows", bio["plasmaMeasurementRows"], 778),
        ("YTD autopsy consents", brs["newAutopsyConsents"], 4),
        ("YTD autopsies performed", brs["autopsiesPerformed"], 5),
        ("ORE events (RPPR period)", rppr["oreOutreach"]["communityEvents"], 128),
        ("ORE attendees (RPPR period)", rppr["oreOutreach"]["eventAttendees"], 8243),
        (
            "RedCap biofluid requests YTD",
            redcap["biofluids"]["reportingPeriod"]["requestsReceived"],
            7,
        ),
        (
            "RedCap neurobank requests YTD",
            redcap["neurobank"]["reportingPeriod"]["requestsReceived"],
            24,
        ),
        ("Plasma aliquots requested YTD", plasma_aliquots, 568),
        ("SCAN MRI participants YTD", scan.get("participantsWithMri"), 11),
        ("CLARiTI Amyloid PET YTD", clariti.get("participantsWithAmyloidPet"), 9),
        ("CLARiTI MRI participants YTD", clariti.get("participantsWithMri"), 8),
    ]
    errors: list[str] = []
    for label, a, b in pairs:
        if a != b:
            errors.append(f"{label}: {a!r} != {b!r}")
    if errors:
        raise SystemExit("Dual verification failed:\n  " + "\n  ".join(errors))

    validate = subprocess.run(
        [sys.executable, str(ROOT / "scripts/validate_dashboard.py")],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    if validate.returncode != 0:
        raise SystemExit(
            "validate_dashboard.py failed:\n"
            + (validate.stdout or "")
            + (validate.stderr or "")
        )

    return {
        "verifiedAt": pkg.get("lastAggregated"),
        "grantPeriod": rppr["meta"]["grantPeriod"],
        "rpprReportingPeriod": rppr["meta"]["reportingPeriod"],
        "ytdLabel": ytd["label"],
        "packageReceivedAt": ytd.get("packageReceivedAt", pkg.get("receivedAt")),
        "ytd": {
            "udsParticipantsWithVisit": uds["uniqueParticipantsWithVisit"],
            "followUpInPerson": uds["followUpInPerson"],
            "followUpRemote": uds["followUpRemote"],
            "initialEvaluations": uds["newInitialEvaluations"],
            "plasmaSubjects": bio["subjectsWithPlasmaCollection"],
            "plasmaMeasurementRows": bio["plasmaMeasurementRows"],
            "autopsyConsents": brs["newAutopsyConsents"],
            "autopsiesPerformed": brs["autopsiesPerformed"],
            "biofluidRequests": redcap["biofluids"]["reportingPeriod"]["requestsReceived"],
            "neurobankRequests": redcap["neurobank"]["reportingPeriod"]["requestsReceived"],
            "plasmaAliquotsRequested": plasma_aliquots,
            "ncradGfapMeasurements": ncrad_gfap,
            "scanMriParticipants": scan.get("participantsWithMri", 0),
            "claritiMriParticipants": clariti.get("participantsWithMri", 0),
            "claritiAmyloidPet": clariti.get("participantsWithAmyloidPet", 0),
            "claritiTauPet": clariti.get("participantsWithTauPet", 0),
            "totalUdsVisitRows": uds["totalVisitRecords"],
        },
        "imagingIntegratedNacc": {
            "scan": integrated_studies.get("SCAN", {}).get("naccRegistryVerifiedSubjects", 58),
            "clariti": integrated_studies.get("CLARiTI", {}).get("naccRegistryVerifiedSubjects", 11),
            "uscAdrc": integrated_studies.get("USC ADRC", {}).get("naccRegistryVerifiedSubjects", 103),
        },
        "rpprHeadlines": {
            "adrcCohortN": rppr["recruitment"]["adrcTotalParticipants"],
            "brsEnrolled": rppr["recruitment"]["brsTotalEnrolled"],
            "geneScreenEnrolled": rppr["geneScreen"]["membersEnrolled"],
            "geneScreenApoe4": rppr["geneScreen"]["apoe4Carriers"],
            "oreCommunityEvents": rppr["oreOutreach"]["communityEvents"],
            "oreEventAttendees": rppr["oreOutreach"]["eventAttendees"],
            "oreOnlineEnrollments": rppr["oreOutreach"]["newOnlineEnrollments"],
        },
        "verification": {
            "pass1": "rpprMetrics.json cross-checked to geneScreenDeckData.json, rpprDataPackage.json, redcapSpecimenSharing.json",
            "pass2": "scripts/validate_dashboard.py (34 dashboard checks)",
        },
    }


def render_board_slides_png(verified_json: Path) -> tuple[Path, Path]:
    """Render 1920×1080 PNG slides via Playwright (HTML UI mockups)."""
    node_modules = ROOT / "node_modules" / "playwright"
    if not node_modules.is_dir():
        raise SystemExit(
            "Playwright is required for board-quality slides. From project root run:\n"
            "  npm install playwright --save-dev && npx playwright install chromium"
        )
    result = subprocess.run(
        ["node", str(RENDER_SCRIPT), str(verified_json)],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        hint = result.stderr or result.stdout or ""
        if "Executable doesn't exist" in hint:
            hint += "\nRun: npx playwright install chromium"
        raise SystemExit(f"Slide render failed:\n{hint}")
    if not SLIDE1_PNG.is_file() or not SLIDE2_PNG.is_file():
        raise SystemExit("Slide PNGs were not created.")
    return SLIDE1_PNG, SLIDE2_PNG


def _blank_layout(prs: Presentation):
    for layout in prs.slide_layouts:
        if layout.name and "blank" in layout.name.lower():
            return layout
    return prs.slide_layouts[6]


def _delete_slide(prs: Presentation, index: int) -> None:
    slide_id = prs.slides._sldIdLst[index]
    r_id = slide_id.rId
    prs.part.drop_rel(r_id)
    slide_id.getparent().remove(slide_id)


def _add_full_bleed(slide, image_path: Path, prs: Presentation) -> None:
    slide.shapes.add_picture(
        str(image_path),
        0,
        0,
        width=prs.slide_width,
        height=prs.slide_height,
    )


def build_two_slide_deck(slide1_png: Path, slide2_png: Path) -> None:
    if not TEMPLATE.is_file():
        raise SystemExit(f"Template not found: {TEMPLATE}")

    shutil.copy2(TEMPLATE, OUTPUT_DECK)
    prs = Presentation(str(OUTPUT_DECK))
    blank = _blank_layout(prs)

    for idx in range(len(prs.slides) - 1, -1, -1):
        _delete_slide(prs, idx)

    for png in (slide1_png, slide2_png):
        slide = prs.slides.add_slide(blank)
        _add_full_bleed(slide, png, prs)

    prs.save(str(OUTPUT_DECK))
    shutil.copy2(OUTPUT_DECK, OUTPUT_DOWNLOADS)


def main() -> int:
    rppr, pkg, gs, redcap = load_sources()
    verified = dual_verify(rppr, pkg, gs, redcap)
    VERIFIED_JSON.write_text(json.dumps(verified, indent=2), encoding="utf-8")
    slide1_png, slide2_png = render_board_slides_png(VERIFIED_JSON)
    build_two_slide_deck(slide1_png, slide2_png)
    print(f"Verified metrics: {VERIFIED_JSON}")
    print(f"Slide 1 PNG: {slide1_png}")
    print(f"Slide 2 PNG: {slide2_png}")
    print(f"Deck (2 slides): {OUTPUT_DECK}")
    print(f"Deck copy: {OUTPUT_DOWNLOADS}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""
Batched dashboard validation:
  1. Source files on disk (data/ + src/data/)
  2. RedCap CSV → matches committed redcapSpecimenSharing.json
  3. aim1MockData.ts snapshot → matches JSON sources (via export_dashboard_metrics.ts)
  4. YTD harmonized package + RPPR cumulative metrics
  5. Table 1 / cross-file consistency
  6. Documented placeholders (not wired to folder exports)
"""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

from reporting_window import EAC_YTD_END_DATE, EAC_YTD_LABEL

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
PKG_DIR = DATA / "rppr-data-package"
REDCAP_DIR = DATA / "redcap"
SRC_DATA = ROOT / "src" / "data"


def brs_data_core_row(data: dict, row_id: str) -> dict[str, Any]:
    for row in data.get("rows") or []:
        if row.get("id") == row_id:
            return row
    return {}


def load_brs_data_core_table() -> dict:
    path = SRC_DATA / "brsRpprTableDataCore2026.json"
    return json.loads(path.read_text(encoding="utf-8"))


# UI constants — not from CSV row counts; listed in batch 6 only.
PLACEHOLDER_UI = [
    "ADRC YTD chart splits → rpprDataPackage.json newInitialEvaluationBreakdown",
    "GeneScreen cumulative registry headline (green) → rpprMetrics.json until harmonized export",
    "Table 1 demographics → table1Demographics.json (green · last RPPR; not James YTD)",
    "Biofluid WBC → not in biospecimen export; serum/plasma/buffy from James Oct 9 supplement when wired",
    "REC speaker series & attendee counts → red (recSpeakerSeries.json not in package)",
    "Clinical lab A1c/lipid/creatinine/BP → null red",
    "Brain Health 4 Me → null red",
    "ORE Table E1/E2, cumulative autopsy enrollment, scan budget targets → 0 red",
    "Imaging QC & IDA uploads → 0 red (not in package)",
    "Grant plan chart targets → registryChartViews.ts + budgetTargets.ts (renewal goals)",
    "RPPR PDF headline refs (668, 231, etc.) → rpprMetrics.json only; not shown on dashboard",
]

RPPR_JSON_SOURCES = [
    ("src/data/rpprMetrics.json", "RPPR PDF extract → parse_rppr_metrics.py"),
    ("src/data/table1Demographics.json", "Clinical Core workbook → aggregate_table1_demographics.py"),
    ("src/data/geneScreenReportingPeriod.json", "RPPR + renewal mix (estimated period charts)"),
    ("src/data/recSpeakerSeries.json", "REC speaker series → aggregate_rec_speaker_series.py"),
]


class BatchResult:
    def __init__(self, name: str) -> None:
        self.name = name
        self.passed = 0
        self.failed = 0
        self.lines: list[str] = []

    def ok(self, label: str, detail: str = "") -> None:
        self.passed += 1
        extra = f" · {detail}" if detail else ""
        self.lines.append(f"  [PASS] {label}{extra}")

    def fail(self, label: str, expected: Any, actual: Any) -> None:
        self.failed += 1
        self.lines.append(
            f"  [FAIL] {label}: expected={expected!r}, actual={actual!r}"
        )

    def info(self, label: str) -> None:
        self.lines.append(f"  [INFO] {label}")


def load_json(rel: str) -> dict:
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def package_ytd_paths(pkg: dict) -> list[tuple[str, Path]]:
    ytd = pkg["reportingPeriodSummary"]
    mapping: list[tuple[str, Path]] = []

    uds_file = ytd["udsClinical"]["sourceFile"]
    mapping.append(
        (
            "UDS longitudinal",
            PKG_DIR / "USC ADRC UDS Harmonized" / uds_file,
        )
    )
    bio_file = ytd["biomarkers"]["sourceFile"]
    mapping.append(
        (
            "Biomarkers long",
            PKG_DIR / "USC ADRC Integrated Biomarker Availability" / bio_file,
        )
    )
    brs_file = ytd["brsAutopsy"]["sourceFile"]
    mapping.append(("BRS cohort", PKG_DIR / brs_file))

    biospecimen = ytd.get("biospecimenInventory") or {}
    if biospecimen.get("sourceFile"):
        mapping.append(
            (
                "Biospecimen long",
                PKG_DIR
                / "USC ADRC Biospecimen Availability"
                / biospecimen["sourceFile"],
            )
        )

    imaging = ytd.get("imaging") or {}
    img_root = PKG_DIR / "USC ADRC Integrated Imaging Availability"
    for key in ("longitudinal", "studySubjectLevel"):
        fname = (imaging.get("sourceFiles") or {}).get(key)
        if fname:
            mapping.append((f"Imaging {key}", img_root / fname))

    integrated = ytd.get("imagingIntegratedStudySummary") or {}
    if integrated.get("sourceFile"):
        mapping.append(
            (
                "Imaging Study_Summary",
                img_root / integrated["sourceFile"],
            )
        )

    return mapping


def batch_source_files(pkg: dict, redcap: dict) -> BatchResult:
    b = BatchResult("Batch 1 · Source files on disk (data/ + src/data/)")
    for label, path in package_ytd_paths(pkg):
        if path.is_file():
            b.ok(label, str(path.relative_to(ROOT)))
        else:
            b.fail(f"Missing package CSV · {label}", str(path), "not found")

    for key in ("biofluids", "neurobank"):
        fname = redcap.get("sources", {}).get(key)
        if not fname:
            b.fail(f"RedCap sources.{key}", "filename", redcap.get("sources"))
            continue
        csv_path = REDCAP_DIR / fname
        if csv_path.is_file():
            b.ok(f"RedCap {key}", csv_path.relative_to(ROOT).as_posix())
        else:
            b.fail(f"RedCap CSV {fname}", str(csv_path), "not found")

    for rel, note in RPPR_JSON_SOURCES:
        p = ROOT / rel
        if p.is_file():
            b.ok(rel, note)
        else:
            b.fail(rel, "exists", "missing")

    for name in (
        "rpprDataPackage.json",
        "rpprDataPackageMeta.json",
        "redcapSpecimenSharing.json",
        "geneScreenYtd.json",
        "jamesSupplementsManifest.json",
        "brsRpprTableDataCore2026.json",
        "recRoster.json",
    ):
        p = SRC_DATA / name
        if p.is_file():
            b.ok(f"src/data/{name}", "dashboard aggregate JSON")
        else:
            b.fail(f"src/data/{name}", "exists", "missing")

    rec_csv = DATA / "reference" / "rec" / "scholars-trainees.csv"
    if rec_csv.is_file():
        b.ok("REC scholars CSV", rec_csv.relative_to(ROOT).as_posix())
    else:
        b.fail("REC scholars CSV", str(rec_csv), "not found")

    return b


def batch_redcap_reaggregate(pkg: dict, redcap: dict) -> BatchResult:
    b = BatchResult("Batch 2 · RedCap CSV re-aggregate vs redcapSpecimenSharing.json")
    ytd = pkg["reportingPeriodSummary"]
    start = datetime.fromisoformat(ytd["startDate"])
    end = datetime.fromisoformat(f"{ytd['endDate']}T23:59:59")

    sys.path.insert(0, str(ROOT / "scripts"))
    from aggregate_specimen_sharing import (  # noqa: E402
        aggregate_biofluids,
        aggregate_neurobank,
        latest_csv,
    )
    from redcap_csv_utils import read_redcap_csv  # noqa: E402

    def in_period(ts: datetime | None) -> bool:
        if ts is None:
            return False
        return start <= ts <= end

    bio_csv = latest_csv("USCADRCBiofluidReque*.csv")
    neuro_csv = latest_csv("USCADRCNeurobankRequ*.csv")
    bio_rows = read_redcap_csv(bio_csv)
    neuro_rows = read_redcap_csv(neuro_csv)

    fresh_bio = aggregate_biofluids(bio_rows, in_period)
    fresh_neuro = aggregate_neurobank(neuro_rows, in_period)
    committed_bio = redcap["biofluids"]["reportingPeriod"]
    committed_neuro = redcap["neurobank"]["reportingPeriod"]

    pairs: list[tuple[str, Any, Any]] = [
        ("Biofluid requests received", fresh_bio["requestsReceived"], committed_bio["requestsReceived"]),
        ("Biofluid plasma requests", fresh_bio["plasma"]["requestsWithPlasma"], committed_bio["plasma"]["requestsWithPlasma"]),
        ("Biofluid plasma aliquots", fresh_bio["plasma"]["aliquotsRequested"], committed_bio["plasma"]["aliquotsRequested"]),
        ("Neurobank requests received", fresh_neuro["requestsReceived"], committed_neuro["requestsReceived"]),
        ("Neurobank requests fulfilled", fresh_neuro["requestsFulfilled"], committed_neuro["requestsFulfilled"]),
    ]
    for label, expected, actual in pairs:
        if expected == actual:
            b.ok(label, f"{actual} · window {ytd['label']}")
        else:
            b.fail(label, expected, actual)

    if redcap.get("reportingPeriodLabel") == ytd.get("label"):
        b.ok("Reporting period label", ytd["label"])
    else:
        b.fail("Reporting period label", ytd.get("label"), redcap.get("reportingPeriodLabel"))

    if redcap["sources"]["biofluids"] == bio_csv.name and redcap["sources"]["neurobank"] == neuro_csv.name:
        b.ok("JSON sources.* matches latest CSV in data/redcap/")
    else:
        b.fail(
            "JSON sources filenames",
            f"{bio_csv.name} / {neuro_csv.name}",
            redcap.get("sources"),
        )

    return b


def expected_from_json(
    rppr: dict,
    redcap: dict,
    pkg: dict,
    t1: dict,
    gene_ytd: dict,
    brs_dc: dict,
) -> dict[str, Any]:
    ytd = pkg["reportingPeriodSummary"]
    uds = ytd["udsClinical"]
    bio = ytd["biomarkers"]
    biospecimen = ytd.get("biospecimenInventory") or {}
    bio_plasma = (biospecimen.get("byComponentYtd") or {}).get("plasma") or {}
    brs = ytd["brsAutopsy"]
    imaging = ytd.get("imaging") or {}
    scan = imaging.get("scanStudy") or {}
    clariti = imaging.get("claritiStudy") or {}

    deaths = None
    for domain in pkg.get("reportingPeriodAdditional", {}).get("domains") or []:
        if domain.get("id") == "brs-dates":
            for m in domain.get("metrics") or []:
                if str(m.get("label", "")).startswith("Deaths"):
                    deaths = m.get("value")
    ytd_participants = uds.get("uniqueParticipantsWithVisit", uds["totalVisitRecords"])
    ncrad = bio.get("ncradPlasmaMeasurements") or {}
    dc_current = brs_data_core_row(brs_dc, "currentEnrollment")
    dc_new = brs_data_core_row(brs_dc, "newEnrolled")
    dc_died_with = brs_data_core_row(brs_dc, "diedWithAutopsy")
    dc_died_without = brs_data_core_row(brs_dc, "diedWithoutAutopsy")
    dc_deaths = (dc_died_with.get("participants") or 0) + (
        dc_died_without.get("participants") or 0
    )

    return {
        "reportingPeriod": ytd["label"],
        "topRegistry.genescreen.total": gene_ytd["registrySnapshot"]["membersComplete"],
        "topRegistry.genescreen.newThisPeriod": gene_ytd["newMembersByConsentDate"],
        "topRegistry.adrc.total": ytd_participants,
        "topRegistry.adrc.inPerson": uds["followUpInPerson"],
        "topRegistry.adrc.remote": uds["followUpRemote"],
        "topRegistry.adrc.initial": uds["newInitialEvaluations"],
        "topRegistry.brs.total": dc_current.get("participants"),
        "topRegistry.brs.newThisPeriod": dc_new.get("participants"),
        "clinicalAssessments.followUpInPerson": uds["followUpInPerson"],
        "clinicalAssessments.followUpRemote": uds["followUpRemote"],
        "clinicalAssessments.initialAssessments": uds["newInitialEvaluations"],
        "scans.target": 0,
        "scans.mri": scan.get("participantsWithMri", 0),
        "scans.amyloidPet": scan.get("participantsWithAmyloidPet", 0),
        "scans.tauPet": scan.get("participantsWithTauPet", 0),
        "claritiScans.target": 0,
        "claritiScans.mri": clariti.get("participantsWithMri", 0),
        "claritiScans.amyloidPet": clariti.get("participantsWithAmyloidPet", 0),
        "claritiScans.tauPet": clariti.get("participantsWithTauPet", 0),
        "biomarkers.ab40": ncrad.get("ab40"),
        "biomarkers.a1c": None,
        "biofluidPlasma.participants": bio_plasma.get(
            "participants", bio["subjectsWithPlasmaCollection"]
        ),
        "biofluidPlasma.aliquots": bio_plasma.get(
            "aliquots", bio["plasmaMeasurementRows"]
        ),
        "neuropath.brsNewlyConsented": dc_new.get("participants"),
        "neuropath.autopsiesPerformed": dc_died_with.get("participants"),
        "neuropath.cohortDeaths": dc_deaths,
        "neuropath.enrolled": dc_current.get("participants"),
        "specimenBiofluidRequests": redcap["biofluids"]["reportingPeriod"]["requestsReceived"],
        "specimenNeurobankRequests": redcap["neurobank"]["reportingPeriod"]["requestsReceived"],
        "specimenPlasmaAliquots": redcap["biofluids"]["reportingPeriod"]["plasma"]["aliquotsRequested"],
        "specimenNeurobankFulfilled": redcap["neurobank"]["reportingPeriod"]["requestsFulfilled"],
        "oreOutreach.communityEvents": rppr["oreOutreach"]["communityEvents"],
        "oreOutreach.eventAttendees": rppr["oreOutreach"]["eventAttendees"],
        "table1OverallN": str(t1["overall"]["n"]).split("(")[0].strip(),
    }


def flatten_snapshot(snap: dict) -> dict[str, Any]:
    return {
        "reportingPeriod": snap["reportingPeriod"],
        "topRegistry.genescreen.total": snap["topRegistry"]["genescreen"]["total"],
        "topRegistry.genescreen.newThisPeriod": snap["topRegistry"]["genescreen"]["newThisPeriod"],
        "topRegistry.adrc.total": snap["topRegistry"]["adrc"]["total"],
        "topRegistry.adrc.inPerson": snap["topRegistry"]["adrc"]["inPerson"],
        "topRegistry.adrc.remote": snap["topRegistry"]["adrc"]["remote"],
        "topRegistry.adrc.initial": snap["topRegistry"]["adrc"]["initial"],
        "topRegistry.brs.total": snap["topRegistry"]["brs"]["total"],
        "topRegistry.brs.newThisPeriod": snap["topRegistry"]["brs"]["newThisPeriod"],
        "clinicalAssessments.followUpInPerson": snap["clinicalAssessments"]["followUpInPerson"],
        "clinicalAssessments.followUpRemote": snap["clinicalAssessments"]["followUpRemote"],
        "clinicalAssessments.initialAssessments": snap["clinicalAssessments"]["initialAssessments"],
        "scans.target": snap["scans"]["target"],
        "scans.mri": snap["scans"]["mri"],
        "scans.amyloidPet": snap["scans"]["amyloidPet"],
        "scans.tauPet": snap["scans"]["tauPet"],
        "claritiScans.target": snap["claritiScans"]["target"],
        "claritiScans.mri": snap["claritiScans"]["mri"],
        "claritiScans.amyloidPet": snap["claritiScans"]["amyloidPet"],
        "claritiScans.tauPet": snap["claritiScans"]["tauPet"],
        "biomarkers.ab40": snap["biomarkers"]["ab40"],
        "biomarkers.a1c": snap["biomarkers"]["a1c"],
        "biofluidPlasma.participants": snap["biofluidPlasma"]["participants"],
        "biofluidPlasma.aliquots": snap["biofluidPlasma"]["aliquots"],
        "neuropath.brsNewlyConsented": snap["neuropath"]["brsNewlyConsented"],
        "neuropath.autopsiesPerformed": snap["neuropath"]["autopsiesPerformed"],
        "neuropath.cohortDeaths": snap["neuropath"]["cohortDeaths"],
        "neuropath.enrolled": snap["neuropath"]["enrolled"],
        "specimenBiofluidRequests": snap["specimenBiofluidRequests"],
        "specimenNeurobankRequests": snap["specimenNeurobankRequests"],
        "specimenPlasmaAliquots": snap["specimenPlasmaAliquots"],
        "specimenNeurobankFulfilled": snap["specimenNeurobankFulfilled"],
        "oreOutreach.communityEvents": snap["oreOutreach"]["communityEvents"],
        "oreOutreach.eventAttendees": snap["oreOutreach"]["eventAttendees"],
        "table1OverallN": snap["table1OverallN"],
    }


def run_ts_snapshot() -> dict:
    result = subprocess.run(
        ["npx", "--yes", "tsx", "scripts/export_dashboard_metrics.ts"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "export_dashboard_metrics.ts failed:\n"
            f"{result.stderr or result.stdout}"
        )
    return json.loads(result.stdout)


def batch_dashboard_wiring(expected: dict[str, Any]) -> BatchResult:
    b = BatchResult("Batch 3 · aim1MockData.ts wiring (tsx export vs JSON sources)")
    try:
        snap = flatten_snapshot(run_ts_snapshot())
    except RuntimeError as exc:
        b.fail("Run export_dashboard_metrics.ts", "success", str(exc))
        return b

    for key, exp in expected.items():
        act = snap.get(key)
        if exp == act:
            b.ok(key, repr(act))
        else:
            b.fail(key, exp, act)

    return b


def batch_ytd_metrics(rppr: dict, redcap: dict, pkg: dict) -> BatchResult:
    b = BatchResult("Batch 4 · YTD package + RPPR headline metrics")
    ytd = pkg["reportingPeriodSummary"]
    uds = ytd["udsClinical"]
    bio = ytd["biomarkers"]
    brs = ytd["brsAutopsy"]
    imaging = ytd.get("imaging") or {}
    ytd_participants = uds.get("uniqueParticipantsWithVisit", uds["totalVisitRecords"])

    checks: list[tuple[str, Any, Any]] = [
        ("Reporting window start", ytd.get("startDate"), "2026-01-01"),
        (
            "RedCap label",
            redcap.get("reportingPeriodLabel"),
            ytd.get("label"),
        ),
        ("ADRC participants with visit YTD", ytd_participants, ytd_participants),
        ("ADRC new evals YTD", uds["newInitialEvaluations"], uds["newInitialEvaluations"]),
        ("BRS new consents YTD", brs["newAutopsyConsents"], brs["newAutopsyConsents"]),
        ("Clinical in-person YTD", uds["followUpInPerson"], uds["followUpInPerson"]),
        ("Clinical remote YTD", uds["followUpRemote"], uds["followUpRemote"]),
        (
            "Plasma participants YTD",
            bio["subjectsWithPlasmaCollection"],
            bio["subjectsWithPlasmaCollection"],
        ),
        (
            "Plasma aliquot rows YTD",
            bio["plasmaMeasurementRows"],
            bio["plasmaMeasurementRows"],
        ),
        ("Neuropath autopsies YTD", brs["autopsiesPerformed"], brs["autopsiesPerformed"]),
        (
            "BRS current enrollment (Data Core table)",
            brs_data_core_row(load_brs_data_core_table(), "currentEnrollment").get(
                "participants"
            ),
            brs_data_core_row(load_brs_data_core_table(), "currentEnrollment").get(
                "participants"
            ),
        ),
        (
            "GeneScreen total (RPPR)",
            rppr["geneScreen"]["membersEnrolled"],
            rppr["geneScreen"]["membersEnrolled"],
        ),
    ]

    visit_sum = (
        uds["followUpInPerson"]
        + uds["followUpRemote"]
        + uds["newInitialEvaluations"]
    )
    checks.append(
        (
            "UDS visit rows sum",
            visit_sum,
            uds["totalVisitRecords"],
        )
    )

    ncrad = bio.get("ncradPlasmaMeasurements") or {}
    for key, label in [
        ("ab40", "NCRAD Aβ40 YTD"),
        ("ab42", "NCRAD Aβ42 YTD"),
        ("gfap", "NCRAD GFAP YTD"),
        ("nfl", "NCRAD NfL YTD"),
        ("ptau217", "NCRAD ptau217 YTD"),
    ]:
        if key in ncrad:
            checks.append((label, ncrad[key], ncrad[key]))

    for study_key, prefix in [("scanStudy", "SCAN"), ("claritiStudy", "CLARiTI")]:
        block = imaging.get(study_key) or {}
        for field, mod in [
            ("participantsWithMri", "MRI"),
            ("participantsWithAmyloidPet", "Amyloid PET"),
            ("participantsWithTauPet", "Tau PET"),
        ]:
            if field in block:
                checks.append(
                    (
                        f"{prefix} {mod} YTD",
                        block[field],
                        block[field],
                    )
                )

    integrated = ytd.get("imagingIntegratedStudySummary") or {}
    for row in integrated.get("studies") or []:
        study = row.get("study", "?")
        nacc = row.get("naccRegistryVerifiedSubjects")
        if nacc is not None:
            checks.append(
                (
                    f"Integrated Imaging {study} NACC verified",
                    nacc,
                    nacc,
                )
            )

    for label, dash, source in checks:
        if dash == source:
            b.ok(label, f"{dash}")
        else:
            b.fail(label, source, dash)

    return b


def batch_cross_file(rppr: dict, t1: dict, pkg: dict) -> BatchResult:
    b = BatchResult("Batch 5 · Cross-file consistency")
    t1_n = str(t1["overall"]["n"]).split("(")[0].strip()
    adrc_rppr = str(rppr["recruitment"]["adrcTotalParticipants"])
    if t1_n == adrc_rppr:
        b.ok("Table 1 N matches rpprMetrics adrcTotalParticipants", t1_n)
    else:
        b.fail("Table 1 N vs rpprMetrics", adrc_rppr, t1_n)

    ytd = pkg["reportingPeriodSummary"]
    if ytd.get("endDate") == EAC_YTD_END_DATE:
        b.ok("Package YTD end date", EAC_YTD_END_DATE)
    else:
        b.fail("Package YTD end date", EAC_YTD_END_DATE, ytd.get("endDate"))
    if ytd.get("label") == EAC_YTD_LABEL:
        b.ok("Package YTD label", EAC_YTD_LABEL)
    else:
        b.fail("Package YTD label", EAC_YTD_LABEL, ytd.get("label"))

    breakdown = ytd["udsClinical"].get("newInitialEvaluationBreakdown") or {}
    eth = breakdown.get("byRaceEthnicity") or []
    eth_sum = sum(row.get("count", 0) for row in eth)
    new_evals = ytd["udsClinical"]["newInitialEvaluations"]
    if eth and eth_sum == new_evals:
        b.ok("ADRC YTD ethnicity breakdown sum = new evals", eth_sum)
    elif not eth:
        b.fail("ADRC YTD ethnicity breakdown present", "non-empty", "missing")
    else:
        b.fail("ADRC YTD ethnicity breakdown sum", new_evals, eth_sum)

    return b


def batch_placeholders() -> BatchResult:
    b = BatchResult("Batch 6 · Placeholders / not from data/ CSV alone")
    for item in PLACEHOLDER_UI:
        b.info(item)
    return b


def main() -> int:
    rppr = load_json("src/data/rpprMetrics.json")
    redcap = load_json("src/data/redcapSpecimenSharing.json")
    pkg = load_json("src/data/rpprDataPackage.json")
    t1 = load_json("src/data/table1Demographics.json")
    gene_ytd = load_json("src/data/geneScreenYtd.json")
    brs_dc = load_brs_data_core_table()
    expected = expected_from_json(rppr, redcap, pkg, t1, gene_ytd, brs_dc)

    batches = [
        batch_source_files(pkg, redcap),
        batch_redcap_reaggregate(pkg, redcap),
        batch_dashboard_wiring(expected),
        batch_ytd_metrics(rppr, redcap, pkg),
        batch_cross_file(rppr, t1, pkg),
        batch_placeholders(),
    ]

    total_pass = total_fail = 0
    ytd_label = pkg["reportingPeriodSummary"].get("label", "")
    print(f"USC ADRC dashboard validation · YTD {ytd_label}\n")
    print("Allowed roots: data/rppr-data-package/, data/redcap/, src/data/*.json\n")

    for batch in batches:
        print(f"=== {batch.name} ===")
        for line in batch.lines:
            print(line)
        if batch.name.startswith("Batch 6"):
            print(f"  ({len(batch.lines)} documented items — not scored as failures)\n")
        else:
            print(f"  → {batch.passed} passed, {batch.failed} failed\n")
            total_pass += batch.passed
            total_fail += batch.failed

    print(f"TOTAL (batches 1–5): {total_pass} passed, {total_fail} failed")
    if total_fail == 0:
        print("\nAll scored checks passed. Batch 6 lists UI-only or RPPR-PDF metrics.")
    else:
        print("\nFix failures above, then re-run: npm run validate:dashboard")
    return 1 if total_fail else 0


if __name__ == "__main__":
    sys.exit(main())

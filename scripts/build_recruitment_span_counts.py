#!/usr/bin/env python3
"""Count recruitment columns for cumulative history and the active P30 grant window.

Year-to-date stays on the existing dashboard path. This file feeds the other
two recruitment toggle phases. A count is omitted (available: false) only when
the source file has no field for it.
"""

from __future__ import annotations

import csv
import json
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from aggregate_genescreen_ytd import (  # noqa: E402
    apoe4_carrier,
    ethnicity_bucket,
    is_complete,
    latest_genescreen_csv,
)
from aggregate_rppr_data_package import (  # noqa: E402
    PKG,
    REFERSC_LABELS,
    format_apoe_genotype_label,
    latest_brs_cohort_csv,
    parse_row_date,
    race_chart_label,
    visit_participant_id,
)
from redcap_csv_utils import parse_timestamp  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src" / "data" / "recruitmentSpanCounts.json"

# NIH P30 AG066530 project start (RePORTER).
GRANT_START = datetime(2020, 9, 1)
FAR_FUTURE = datetime(9999, 12, 31)
FAR_PAST = datetime(1, 1, 1)

APOE_GAP = "Genotype not in MAP APOE export"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def dated(value: datetime | None, start: datetime, end: datetime) -> bool:
    return value is not None and start <= value <= end


def chart_items(counter: Counter[str], *, gap_label: str | None = None) -> list[dict]:
    rows = []
    for label, count in counter.most_common():
        if count <= 0:
            continue
        rows.append(
            {
                "label": label,
                "count": count,
                "available": label != gap_label,
            }
        )
    return rows


def span_caption(phrase: str, first: str | None, last: str | None) -> str:
    if first and last:
        return f"{phrase} · {first} – {last}"
    if last:
        return f"{phrase} · through {last}"
    return phrase


def uds_visit_date(row: dict[str, str]) -> datetime | None:
    return parse_row_date(row.get("visit_date")) or parse_row_date(row.get("visitdate"))




def summarize_uds(
    visits: list[dict[str, str]],
    subject_by_naccid: dict[str, dict[str, str]],
    apoe_by_ptid: dict[str, str],
    *,
    start: datetime,
    end: datetime,
    phrase: str,
    publish_follow_up_mode: bool = False,
) -> dict:
    chosen = []
    dates: list[datetime] = []
    for row in visits:
        when = uds_visit_date(row)
        if start == FAR_PAST:
            if when is None:
                continue
        elif not dated(when, start, end):
            continue
        chosen.append(row)
        if when:
            dates.append(when)

    initial = [r for r in chosen if (r.get("packet") or "").strip() == "I"]
    follow = [r for r in chosen if (r.get("packet") or "").strip() != "I"]
    in_person = [r for r in follow if (r.get("modea1") or "").strip() == "1"]
    remote = [r for r in follow if (r.get("modea1") or "").strip() in {"2", "3"}]
    people = {visit_participant_id(r) for r in chosen if visit_participant_id(r)}

    race: Counter[str] = Counter()
    apoe: Counter[str] = Counter()
    referral: Counter[str] = Counter()
    for visit in initial:
        subject = subject_by_naccid.get((visit.get("naccid") or "").strip(), {})
        race[race_chart_label(subject.get("der_current_race_ethnicity_summary"))] += 1
        ptid = (visit.get("ptid") or subject.get("ptid") or "").strip()
        comb = apoe_by_ptid.get(ptid)
        if comb:
            apoe[format_apoe_genotype_label(comb)] += 1
        else:
            apoe[APOE_GAP] += 1
        code = (visit.get("refersc") or "").strip()
        referral[REFERSC_LABELS.get(code, f"refersc={code or 'blank'}")] += 1

    first = min(dates).strftime("%Y-%m-%d") if dates else None
    last = max(dates).strftime("%Y-%m-%d") if dates else None
    caption = span_caption("Initial evaluations (packet I)", first, last)
    footnote = (
        "In-person and remote are red: most follow-up visits in this file have no mode, "
        "so those totals are not available. Initial is packet I, the same field rule as year to date."
    )
    return {
        "throughDate": last,
        "fromDate": first,
        "title": f"Participants with a UDS visit · {phrase}",
        "total": len(people),
        "totalAvailable": True,
        "headerNote": f"Pink · UDS visits {span_caption(phrase, first, last)}",
        "banner": "Cumulative" if start == FAR_PAST else "Active grant period",
        "footnote": footnote,
        "activities": [
            {
                "label": "In-person follow-ups",
                "count": len(in_person) if publish_follow_up_mode else 0,
                "available": publish_follow_up_mode,
            },
            {
                "label": "Remote follow-ups",
                "count": len(remote) if publish_follow_up_mode else 0,
                "available": publish_follow_up_mode,
            },
            {"label": "Initial", "count": len(initial), "available": True},
        ],
        "charts": [
            {
                "title": "Ethnicity",
                "type": "bar",
                "n": len(initial),
                "nAvailable": True,
                "nCaption": caption,
                "items": chart_items(race),
            },
            {
                "title": "APOE genotype",
                "type": "pie",
                "n": len(initial),
                "nAvailable": True,
                "nCaption": f"{caption} · red = genotype not in the MAP APOE file",
                "items": chart_items(apoe, gap_label=APOE_GAP),
            },
            {
                "title": "Referral source (NACC A1)",
                "type": "bar",
                "n": len(initial),
                "nAvailable": True,
                "nCaption": caption,
                "items": chart_items(referral),
            },
        ],
    }


def genescreen_sex(row: dict[str, str]) -> str:
    return (row.get("Sex ") or row.get("Sex") or "").strip() or "Unknown"


def summarize_genescreen(
    rows: list[dict[str, str]],
    *,
    start: datetime,
    end: datetime,
    phrase: str,
    headline: str,
) -> dict:
    # 739 Complete rows span May 2023–September 2026. That is not the 2026
    # window, and this CSV does not contain REDCap's 730 record count.
    # Leave cumulative and grant-period GeneScreen red.
    banner = "Cumulative" if phrase.startswith("all years") else "Active grant period"
    del rows, start, end, phrase, headline
    note = (
        "Red · this export does not give a separate total for this window. "
        "The year-to-date GeneScreen figures stay on Year to date."
    )
    empty = {
        "title": "",
        "type": "bar",
        "n": 0,
        "nAvailable": False,
        "nCaption": "Not a separate total in this REDCap export",
        "items": [],
    }
    return {
        "throughDate": None,
        "fromDate": None,
        "title": "Total members · GeneScreen",
        "total": 0,
        "totalAvailable": False,
        "headerNote": note,
        "banner": banner,
        "footnote": note,
        "activities": [
            {"label": "Online enrollments", "count": 0, "available": False},
            {"label": "New members", "count": 0, "available": False},
        ],
        "charts": [
            {**empty, "title": "Ethnicity", "type": "bar"},
            {**empty, "title": "APOE4", "type": "pie"},
            {**empty, "title": "Gender", "type": "bar"},
        ],
    }
    def consent_at(row: dict[str, str]) -> datetime | None:
        return parse_timestamp(row.get("Consent Date"))

    def member_at(row: dict[str, str]) -> datetime | None:
        return parse_timestamp(row.get("Membership Timestamp"))

    if start == FAR_PAST:
        cohort = list(rows)
        consented = [r for r in rows if consent_at(r)]
        online = [r for r in rows if member_at(r)]
    else:
        consented = [r for r in rows if dated(consent_at(r), start, end)]
        online = [r for r in rows if dated(member_at(r), start, end)]
        seen: set[int] = set()
        cohort = []
        for row in consented + online:
            key = id(row)
            if key in seen:
                continue
            seen.add(key)
            cohort.append(row)

    sex_counter = Counter(genescreen_sex(r) for r in cohort)
    eth = Counter(ethnicity_bucket(r.get("Ethnicity/Race", "")) for r in consented)
    sex_consent = Counter(genescreen_sex(r) for r in consented)
    carriers = sum(1 for r in consented if apoe4_carrier(r.get("Genotype", "")))
    missing_gt = sum(1 for r in consented if not (r.get("Genotype") or "").strip())
    named_non = len(consented) - carriers - missing_gt

    consent_dates = [d for r in consented if (d := consent_at(r))]
    first = min(consent_dates).strftime("%Y-%m-%d") if consent_dates else None
    last = max(consent_dates).strftime("%Y-%m-%d") if consent_dates else None
    caption = span_caption("Consent dates", first, last)
    if start == FAR_PAST:
        footnote = f"All Complete records. Consent dates in this export run {caption.removeprefix('Consent dates · ')}."
        banner = "Cumulative"
    else:
        footnote = (
            "Every Complete GeneScreen record in this export consented on or after "
            f"{first}, which is after the grant start, so this column matches the all-years count."
        )
        banner = "Active grant period"
    apoe_items = [
        {"label": "APOE4 carrier", "count": carriers, "available": True},
        {"label": "Non-carrier", "count": named_non, "available": True},
    ]
    if missing_gt:
        apoe_items.append(
            {"label": "Genotype not in GeneScreen export", "count": missing_gt, "available": False}
        )
    apoe_items = [row for row in apoe_items if row["count"] > 0]

    return {
        "throughDate": last,
        "fromDate": first,
        "title": headline,
        "total": len(cohort),
        "totalAvailable": True,
        "headerNote": f"Pink · GeneScreen REDCap · {span_caption(phrase, first, last)}",
        "banner": banner,
        "footnote": footnote,
        "gender": {
            "male": sex_counter.get("Male", 0),
            "female": sex_counter.get("Female", 0),
            "available": True,
        },
        "activities": [
            {"label": "Online enrollments", "count": len(online), "available": True},
            {"label": "New members", "count": len(consented), "available": True},
        ],
        "charts": [
            {
                "title": "Ethnicity",
                "type": "bar",
                "n": len(consented),
                "nAvailable": True,
                "nCaption": caption,
                "items": chart_items(eth),
            },
            {
                "title": "APOE4",
                "type": "pie",
                "n": len(consented),
                "nAvailable": True,
                "nCaption": f"{caption} · red = genotype blank in the REDCap export",
                "items": apoe_items,
            },
            {
                "title": "Gender",
                "type": "bar",
                "n": len(consented),
                "nAvailable": True,
                "nCaption": caption,
                "items": chart_items(sex_consent),
            },
        ],
    }


def summarize_brs(
    rows: list[dict[str, str]],
    apoe_by_ptid: dict[str, str],
    *,
    start: datetime,
    end: datetime,
    phrase: str,
) -> dict:
    """Year-to-date 226 is Data Core current enrollment, not a date-filtered consent count.

    The MAP export has consent dates, but it does not contain an enrollment total
    for 'since 9/1/2020' or for all years that uses the Data Core rule. Leave the
    column red rather than show a different count in that slot.
    """
    del rows, apoe_by_ptid, start, end
    banner = "Cumulative" if phrase.startswith("all years") else "Active grant period"
    note = (
        "Red · year-to-date 226 is Data Core current enrollment. "
        "This export has no matching enrollment total for this window."
    )
    empty = {
        "title": "",
        "type": "bar",
        "n": 0,
        "nAvailable": False,
        "nCaption": "No Data Core enrollment table for this window",
        "items": [],
    }
    return {
        "throughDate": None,
        "fromDate": None,
        "title": f"Total enrolled · Autopsy program · {phrase}",
        "total": 0,
        "totalAvailable": False,
        "headerNote": note,
        "banner": banner,
        "footnote": note,
        "activities": [
            {"label": "New autopsy consents", "count": 0, "available": False},
        ],
        "charts": [
            {**empty, "title": "Ethnicity", "type": "bar"},
            {**empty, "title": "APOE genotype", "type": "pie"},
            {**empty, "title": "Sex", "type": "bar"},
        ],
    }


def main() -> None:
    uds_dir = PKG / "USC ADRC UDS Harmonized"
    visits = read_csv(uds_dir / "UDS_longitudinal_harmonized.csv")
    subjects = read_csv(uds_dir / "ADRC_subject_current_harmonized.csv")
    apoe_rows = read_csv(PKG / "MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv")
    brs_path = latest_brs_cohort_csv()
    brs_rows = read_csv(brs_path)
    gs_path = latest_genescreen_csv()
    with gs_path.open(newline="", encoding="utf-8-sig") as handle:
        gs_rows = [r for r in csv.DictReader(handle) if is_complete(r)]

    subject_by_naccid = {
        (r.get("naccid") or "").strip(): r
        for r in subjects
        if (r.get("naccid") or "").strip()
    }
    apoe_by_ptid = {
        (r.get("uds_id") or "").strip(): (r.get("apoe_comb") or "").strip()
        for r in apoe_rows
        if (r.get("uds_id") or "").strip() and (r.get("apoe_comb") or "").strip()
    }

    phases = {
        "cumulative": (FAR_PAST, FAR_FUTURE, "all years in the file"),
        "grant": (GRANT_START, FAR_FUTURE, "since 9/1/2020"),
    }
    payload: dict = {
        "grantStart": "2020-09-01",
        "grantSource": "NIH P30 AG066530 project start",
        "builtFrom": {
            "uds": "UDS_longitudinal_harmonized.csv",
            "brs": brs_path.name,
            "apoe": "MAPDatabase-APOEGenotype_DATA_2026-09-16_1445.csv",
            "genescreen": gs_path.name,
        },
    }
    for key, (start, end, phrase) in phases.items():
        gs_headline = (
            "Total members · GeneScreen · all Complete records"
            if key == "cumulative"
            else "GeneScreen members · since 9/1/2020"
        )
        payload[key] = {
            "phrase": phrase,
            "adrc": summarize_uds(
                visits,
                subject_by_naccid,
                apoe_by_ptid,
                start=start,
                end=end,
                phrase=phrase,
            ),
            "genescreen": summarize_genescreen(
                gs_rows,
                start=start,
                end=end,
                phrase=phrase,
                headline=gs_headline,
            ),
            "brs": summarize_brs(
                brs_rows,
                apoe_by_ptid,
                start=start,
                end=end,
                phrase=phrase,
            ),
        }

    # Sanity check against the published year-to-date visit counts.
    ytd = summarize_uds(
        visits,
        subject_by_naccid,
        apoe_by_ptid,
        start=datetime(2026, 1, 1),
        end=datetime(2026, 10, 16, 23, 59, 59),
        phrase="year to date",
        publish_follow_up_mode=True,
    )
    payload["ytdCheck"] = {
        "uniqueParticipants": ytd["total"],
        "initial": ytd["activities"][2]["count"],
        "inPerson": ytd["activities"][0]["count"],
        "remote": ytd["activities"][1]["count"],
    }

    ytd_check = payload.pop("ytdCheck")
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(ytd_check, indent=2))
    for phase in ("cumulative", "grant"):
        block = payload[phase]
        print(
            phase,
            "ADRC",
            block["adrc"]["total"],
            block["adrc"]["fromDate"],
            block["adrc"]["throughDate"],
            "GS",
            block["genescreen"]["total"],
            "BRS",
            block["brs"]["total"],
            block["brs"]["fromDate"],
            block["brs"]["throughDate"],
        )


if __name__ == "__main__":
    main()

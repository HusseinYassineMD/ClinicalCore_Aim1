"use client";

import type { ClaritiScans, ScanData, SectionDataStatus } from "@/types/aim1";
import ScanSummary from "./ScanSummary";
import DataStatusStickyNote from "./DataStatusStickyNote";
import StickyNoteRail, { SectionWithNotes } from "./StickyNoteRail";
import SectionScopeBracket from "@/components/SectionScopeBracket";
import Link from "next/link";

interface ImagingSectionProps {
  claritiScans: ClaritiScans;
  scans: ScanData;
  sectionDataStatus: SectionDataStatus;
  periodLabel?: string;
  sourceNote?: string;
}

export default function ImagingSection({
  claritiScans,
  scans,
  sectionDataStatus,
  periodLabel,
  sourceNote,
}: ImagingSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-cpbh-navy text-center">
        <span className="block">Imaging</span>
        <SectionScopeBracket
          sectionId="imaging"
          className="block mt-2 max-w-3xl mx-auto"
        />
      </h2>

      <SectionWithNotes
        notes={
          <StickyNoteRail>
            <DataStatusStickyNote
              heading="USC SCAN Progress"
              {...sectionDataStatus.imagingScanProgress}
            />
          </StickyNoteRail>
        }
      >
        <div
          data-deck-slide="imaging-scan-summary"
          data-deck-caption="Imaging · USC SCAN (REDCap) & CLARiTI progress"
        >
          <ScanSummary
            scans={scans}
            claritiScans={claritiScans}
            periodLabel={periodLabel}
            sourceNote={sourceNote}
          />
        </div>
        <p className="mt-4 text-center text-sm text-cpbh-navy/60">
          Study-wide availability, Imaging QC lists, and IDA image IDs are on{" "}
          <Link
            href="/quality-test-pending"
            className="font-medium text-cpbh-sky hover:text-cpbh-navy underline-offset-2 hover:underline"
          >
            Quality test pending
          </Link>{" "}
          for board review.
        </p>
      </SectionWithNotes>
    </section>
  );
}

import type { ReactNode } from "react";
import packet from "@/data/jamesNovember6Packet.json";
import { formatScopeDate } from "@/lib/formatScopeDate";

type CountRow = { label: string; count: number };

function n(value: number): string {
  return value.toLocaleString("en-US");
}

function share(count: number, total: number): string {
  return `${((count / total) * 100).toFixed(1)}%`;
}

function byCount(rows: CountRow[]): CountRow[] {
  return [...rows].sort((a, b) => b.count - a.count);
}

function Shell({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-card overflow-hidden p-0">
      <div className="px-6 pt-6 pb-4 text-center">
        <h3 className="font-display text-xl font-semibold text-cpbh-navy">
          {title}
        </h3>
        <p className="text-sm text-cpbh-navy/60 mt-2 max-w-3xl mx-auto leading-relaxed">
          {note}
        </p>
      </div>
      <div className="px-2 pb-6 space-y-6">{children}</div>
    </div>
  );
}

function MiniTable({
  title,
  field,
  rows,
  total,
}: {
  title: string;
  field: string;
  rows: CountRow[];
  total: number;
}) {
  return (
    <div className="overflow-x-auto px-4">
      <p className="text-sm font-semibold text-cpbh-navy mb-2">{title}</p>
      <p className="text-xs text-cpbh-navy/50 mb-2 font-mono">{field}</p>
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="bg-cpbh-navy text-white">
            <th className="text-left font-medium px-4 py-2">Group</th>
            <th className="text-right font-medium px-4 py-2">Participants</th>
            <th className="text-right font-medium px-4 py-2">Share</th>
          </tr>
        </thead>
        <tbody>
          {byCount(rows).map((row) => (
            <tr key={row.label} className="border-b border-cpbh-mist/80">
              <td className="px-4 py-2 text-cpbh-navy">{row.label}</td>
              <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                {n(row.count)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                {share(row.count, total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JamesUdsPacketBlock() {
  const uds = packet.uds;
  return (
    <Shell
      title={`James UDS packet · ${uds.version}`}
      note={`Pink · whole file, not the January 1–October 16 visit count. ${n(uds.participants)} participants, ${n(uds.visits)} UDS visits, ${n(uds.milestoneEvents)} milestone events. Last visit ${formatScopeDate(uds.lastVisitDate)}. Files ${uds.sourceFiles.join(", ")}.`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MiniTable
          title="Current participation status"
          field={uds.statusField}
          rows={uds.status}
          total={uds.participants}
        />
        <MiniTable
          title="Latest cognitive diagnosis"
          field={uds.cognitiveDxField}
          rows={uds.cognitiveDx}
          total={uds.participants}
        />
        <MiniTable
          title="Recorded sex"
          field={uds.sexField}
          rows={uds.sex}
          total={uds.participants}
        />
        <MiniTable
          title="Hispanic / Latino"
          field={uds.hispanicField}
          rows={uds.hispanic}
          total={uds.participants}
        />
      </div>
    </Shell>
  );
}

export function JamesBiomarkerPacketBlock() {
  const bio = packet.biomarkers;
  return (
    <Shell
      title={`James biomarker packet · ${bio.version}`}
      note={`Pink · whole file, not the October 16 collection count. ${n(bio.uniqueSubjects)} subjects, ${n(bio.measurements)} measurements, ${bio.sourceFamilies} source families. Plasma ${n(bio.plasmaMeasurements)} / CSF ${n(bio.csfMeasurements)}. Collection dates ${bio.collectionStart} to ${bio.collectionEnd}. ${bio.suspectCollectionDatesExcludedFromRange} suspect dates are left out of that range. Source: ${bio.sourceFile}.`}
    >
      <div className="overflow-x-auto px-4">
        <p className="text-sm font-semibold text-cpbh-navy mb-2">
          By source and specimen
        </p>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-cpbh-navy text-white">
              <th className="text-left font-medium px-4 py-2">Source</th>
              <th className="text-left font-medium px-4 py-2">Specimen</th>
              <th className="text-right font-medium px-4 py-2">Measurements</th>
              <th className="text-right font-medium px-4 py-2">Subjects</th>
            </tr>
          </thead>
          <tbody>
            {bio.bySource.map((row) => (
              <tr
                key={`${row.source}-${row.specimen}`}
                className="border-b border-cpbh-mist/80"
              >
                <td className="px-4 py-2 text-cpbh-navy">{row.source}</td>
                <td className="px-4 py-2 text-cpbh-navy">{row.specimen}</td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {n(row.measurements)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {n(row.subjects)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto px-4">
        <p className="text-sm font-semibold text-cpbh-navy mb-2">
          By biomarker
        </p>
        <p className="text-xs text-cpbh-navy/55 mb-2">
          Measurements and participants with a result. Not a count of abnormal
          results.
        </p>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-cpbh-navy text-white">
              <th className="text-left font-medium px-4 py-2">Specimen</th>
              <th className="text-left font-medium px-4 py-2">Biomarker</th>
              <th className="text-left font-medium px-4 py-2">Group</th>
              <th className="text-right font-medium px-4 py-2">Measurements</th>
              <th className="text-right font-medium px-4 py-2">Subjects</th>
            </tr>
          </thead>
          <tbody>
            {bio.byBiomarker.map((row) => (
              <tr
                key={`${row.specimen}-${row.biomarker}`}
                className="border-b border-cpbh-mist/80"
              >
                <td className="px-4 py-2 text-cpbh-navy">{row.specimen}</td>
                <td className="px-4 py-2 text-cpbh-navy">{row.biomarker}</td>
                <td className="px-4 py-2 text-cpbh-navy">{row.domain}</td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {n(row.measurements)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {n(row.subjects)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

export function JamesImagingPacketBlock() {
  const imaging = packet.imaging;
  return (
    <Shell
      title={`James imaging packet · ${imaging.version}`}
      note={`Pink · whole file, not the October 16 study-date count. ${n(imaging.uniqueSubjects)} subjects. ${n(imaging.reportingSetRecords)} imaging records in the reporting set. UDS/PTID linkable ${n(imaging.udsLinkable)}. Verified in the NACC registry ${n(imaging.naccVerified)}. Latest study date ${imaging.lastStudyDate}. The black SCAN and CLARiTI cards stay the October 16 window.`}
    >
      <div className="overflow-x-auto px-4">
        <p className="text-sm font-semibold text-cpbh-navy mb-2">
          Imaging availability
        </p>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-cpbh-navy text-white">
              <th className="text-left font-medium px-4 py-2">Modality</th>
              <th className="text-right font-medium px-4 py-2">Subjects</th>
              <th className="text-right font-medium px-4 py-2">With UDS/PTID</th>
              <th className="text-right font-medium px-4 py-2">NACC verified</th>
              <th className="text-right font-medium px-4 py-2">% UDS/PTID</th>
              <th className="text-right font-medium px-4 py-2">% NACC</th>
            </tr>
          </thead>
          <tbody>
            {imaging.modalities.map((row) => (
              <tr key={row.label} className="border-b border-cpbh-mist/80">
                <td className="px-4 py-2 text-cpbh-navy">{row.label}</td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {n(row.subjects)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {n(row.udsLinkable)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {n(row.naccVerified)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {share(row.udsLinkable, row.subjects)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums metric-value-span">
                  {share(row.naccVerified, row.subjects)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto px-4">
        <p className="text-sm font-semibold text-cpbh-navy mb-2">
          Study / project
        </p>
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="bg-cpbh-navy text-white">
              {[
                "Study",
                "Subjects",
                "UDS/PTID",
                "NACC verified",
                "Records",
                "Dated visits",
                "Mean / subject",
                "MRI",
                "Amyloid PET",
                "Tau PET",
              ].map((label) => (
                <th
                  key={label}
                  className={`font-medium px-3 py-2 ${label === "Study" ? "text-left" : "text-right"}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {imaging.studies.map((row) => (
              <tr key={row.study} className="border-b border-cpbh-mist/80">
                <td className="px-3 py-2 font-medium text-cpbh-navy">
                  {row.study}
                </td>
                {[
                  n(row.uniqueSubjects),
                  n(row.udsLinkable),
                  n(row.naccVerified),
                  n(row.imagingRecords),
                  n(row.datedVisits),
                  row.meanRecordsPerSubject,
                  n(row.mriSubjects),
                  n(row.amyloidPetSubjects),
                  n(row.tauPetSubjects),
                ].map((value, index) => (
                  <td
                    key={index}
                    className="px-3 py-2 text-right tabular-nums metric-value-span"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

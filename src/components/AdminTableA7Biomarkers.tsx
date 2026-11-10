import type { ReactNode } from "react";

type Run = {
  text: string;
  italic?: boolean;
  bold?: boolean;
  underline?: boolean;
};

function TextRuns({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((run, index) => {
        const className = [
          run.italic ? "italic" : "",
          run.bold ? "font-semibold" : "",
          run.underline ? "underline" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return className ? (
          <span key={index} className={className}>
            {run.text}
          </span>
        ) : (
          <span key={index}>{run.text}</span>
        );
      })}
    </>
  );
}

const ROWS: { category: string; explanation: ReactNode }[] = [
  {
    category: "Neuroimaging Core",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center has a Neuroimaging Core " },
          { text: "in addition", bold: true, italic: true, underline: true },
          {
            text: " to the required Biomarker Core in new P30 application.",
            bold: true,
            italic: true,
          },
        ]}
      />
    ),
  },
  {
    category: "amyloid PET",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) [List ligands Center collects with " },
          { text: "amyloid PET ", italic: true },
          { text: "from participants]" },
        ]}
      />
    ),
  },
  {
    category: "tau PET",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) [List ligands Center collects with " },
          { text: "tau PET ", italic: true },
          { text: "from participants]" },
        ]}
      />
    ),
  },
  {
    category: "other PET",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center uses " },
          { text: "other PET ligands ", italic: true },
          {
            text: "to examine targets other than amyloid and tau; [List other PET targets]",
          },
        ]}
      />
    ),
  },
  {
    category: "MRI",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects " },
          { text: "MRI ", italic: true },
          { text: "from participants" },
        ]}
      />
    ),
  },
  {
    category: "Blood AB42",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center conducts tests to quantitate " },
          { text: "AB42 ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "Blood Ttau",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center conducts tests to quantitate " },
          { text: "Ttau ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "Blood ptau",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center conducts tests to quantitate " },
          { text: "ptau ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "APOE",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center completes " },
          { text: "APOE genotyping ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "CSFAB40",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center conducts test to quantitate " },
          { text: "AB40 ", italic: true },
          { text: "from participant CSF" },
        ]}
      />
    ),
  },
  {
    category: "CSF AB42",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center conducts test to quantitate " },
          { text: "AB42 ", italic: true },
          { text: "from participant CSF" },
        ]}
      />
    ),
  },
  {
    category: "CSF T tau",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center conducts test to quantitate " },
          { text: "Ttau ", italic: true },
          { text: "from participant CSF" },
        ]}
      />
    ),
  },
  {
    category: "CSF ptau",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center conducts test to quantitate " },
          { text: "ptau ", italic: true },
          { text: "from participant CSF" },
        ]}
      />
    ),
  },
  {
    category: "CSF",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects " },
          { text: "CSF ", italic: true },
          { text: "from participants" },
        ]}
      />
    ),
  },
  {
    category: "Cell Pellet",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "cell pellet ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "DNA",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "DNA ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "RNA",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "RNA ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "Plasma",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "plasma ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "Serum",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "serum ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "White Blood Cells",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "white blood cells ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "PBMC",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "PBMC ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "Whole Blood",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "whole blood ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "Lymphoblast Cell Lines",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center creates and stores " },
          { text: "lymphoblast cell lines ", italic: true },
          { text: "from participant blood" },
        ]}
      />
    ),
  },
  {
    category: "Fibroblast Cell Lines",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center creates and stores " },
          { text: "fibroblast cell lines ", italic: true },
          { text: "from participants" },
        ]}
      />
    ),
  },
  {
    category: "Stool",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center collects and stores " },
          { text: "stool ", italic: true },
          { text: "from participants" },
        ]}
      />
    ),
  },
  {
    category: "ELISA",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center uses " },
          { text: "ELISA methods ", italic: true },
          { text: "for quantitation; [List targets measured by ELISA]" },
        ]}
      />
    ),
  },
  {
    category: "Quanterix Simoa",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center uses " },
          { text: "Quanterix Simoa methods ", italic: true },
          {
            text: "for quantitation; [List targets measured by Quanterix Simoa]",
          },
        ]}
      />
    ),
  },
  {
    category: "Roche Elecsys",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center uses " },
          { text: "Roche Elecsys methods ", italic: true },
          {
            text: "for quantitation; [List targets measured by Roche Elecsys]",
          },
        ]}
      />
    ),
  },
  {
    category: "Mass Spec",
    explanation: (
      <TextRuns
        runs={[
          { text: "(Yes/No) Center uses " },
          { text: "mass spectrometry methods ", italic: true },
          { text: "for quantitation; [List targets measured by mass spec]" },
        ]}
      />
    ),
  },
  {
    category: "Other Biomarkers",
    explanation: (
      <>
        List any other biomarkers Center is measuring in participants that is
        not
        <br />
        accounted for in above categories (e.g. post mortem MRI).
      </>
    ),
  },
  {
    category: "Notes",
    explanation: (
      <>
        List any special conclusions/considerations about the Center{"\u2019"}s
        Biomarker Core
        <br />
        that is not accounted for in the above categories.
      </>
    ),
  },
];

export default function AdminTableA7Biomarkers() {
  return (
    <div
      className="dashboard-card overflow-hidden p-0"
      data-deck-slide="biomarkers-admin-table-a7"
      data-deck-caption="Biomarkers · Administrative Table A7 (January 2025)"
    >
      <div className="px-6 pt-6 pb-4 border-b border-cpbh-mist text-center">
        <h3 className="font-display text-xl font-semibold text-cpbh-navy">
          Administrative Table A7
        </h3>
        <p className="text-cpbh-navy/60 text-sm mt-1">
          Source: Biomarkers administrative table, January 2025, shown as provided.
        </p>
        <p className="text-cpbh-navy/60 text-sm">
          Through: January 2025.
        </p>
        <p className="text-cpbh-navy/60 text-sm mt-1">
          Biomarkers · shown as provided
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm border-collapse text-[#404040]">
          <thead>
            <tr>
              <th className="w-[26%] border border-[#8ea0c4] bg-white px-3 py-2 text-left font-semibold text-cpbh-navy">
                Biomarker Category
              </th>
              <th className="border border-[#8ea0c4] bg-white px-3 py-2 text-left font-semibold text-cpbh-navy">
                Explanation
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.category}>
                <td className="border border-[#8ea0c4] bg-[#B4C5E7] px-3 py-2 align-top font-semibold text-[#404040]">
                  {row.category}
                </td>
                <td className="border border-[#8ea0c4] bg-white px-3 py-2 align-top leading-snug">
                  {row.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

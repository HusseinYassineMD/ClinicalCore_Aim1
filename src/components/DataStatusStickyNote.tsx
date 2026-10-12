import type { DataStatusInfo } from "@/types/aim1";
import {
  STICKY_NOTE_BODY,
  STICKY_NOTE_SHELL,
  STICKY_NOTE_TITLE,
} from "@/components/stickyNoteShell";

const NOTE_STYLES = {
  ytd: {
    border: "border-neutral-200",
    bg: "bg-neutral-50",
    title: "text-neutral-800",
    divider: "border-neutral-200",
  },
  prior: {
    border: "border-emerald-200",
    bg: "bg-emerald-50/90",
    title: "text-emerald-900",
    divider: "border-emerald-200",
  },
  unknown: {
    border: "border-red-200",
    bg: "bg-red-50/90",
    title: "text-red-900",
    divider: "border-red-200",
  },
  mixed: {
    border: "border-sky-200",
    bg: "bg-sky-50/90",
    title: "text-sky-900",
    divider: "border-sky-200",
  },
} as const;

const STATUS_LABELS = {
  ytd: "Year to date",
  prior: "Last RPPR reporting period",
  unknown: "Unknown / TBD",
  mixed: "Mixed sources",
} as const;

export interface DataStatusStickyNoteProps extends DataStatusInfo {
  heading?: string;
  className?: string;
}

export default function DataStatusStickyNote({
  status,
  source,
  realFrom,
  realFrom2,
  mockFrom,
  bulletGroups,
  heading,
  className = "",
}: DataStatusStickyNoteProps) {
  const style =
    NOTE_STYLES[status as keyof typeof NOTE_STYLES] ?? NOTE_STYLES.unknown;
  const showBreakdown =
    !bulletGroups?.length &&
    status === "mixed" &&
    (realFrom || realFrom2 || mockFrom);
  const realSummary = [realFrom, realFrom2].filter(Boolean).join(" · ");

  return (
    <div
      className={`${STICKY_NOTE_SHELL} ${style.border} ${style.bg} ${className}`.trim()}
    >
      <p className={`${STICKY_NOTE_TITLE} ${style.title}`}>
        {heading
          ? `${heading} · ${STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? "Data status"}`
          : (STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? "Data status")}
      </p>
      {bulletGroups && bulletGroups.length > 0 ? (
        <div className={`space-y-1.5 ${STICKY_NOTE_BODY}`}>
          {source && (
            <p className="text-cpbh-navy/65 pb-1.5 border-b border-dashed border-cpbh-mist">
              {source}
            </p>
          )}
          {bulletGroups.map((group) => (
            <div key={group.title} className="min-w-0">
              <p
                className={`font-semibold text-cpbh-navy/90 mb-0.5 break-words ${style.title}`}
              >
                {group.title}
              </p>
              <ul className="list-disc pl-3 space-y-0.5 min-w-0">
                {group.lines.map((line, lineIndex) => (
                  <li
                    key={`${group.title}-${lineIndex}`}
                    className="break-words [overflow-wrap:anywhere]"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : showBreakdown ? (
        <div className={`space-y-1 ${STICKY_NOTE_BODY}`}>
          {realSummary && (
            <p>
              <span className="font-semibold text-cpbh-navy/90">Real:</span>{" "}
              {realSummary}
            </p>
          )}
          {mockFrom && (
            <p
              className={
                realSummary ? `pt-1.5 border-t ${style.divider}` : undefined
              }
            >
              <span className="font-semibold text-cpbh-navy/90">Mock:</span>{" "}
              {mockFrom}
            </p>
          )}
        </div>
      ) : (
        source && (
          <p className={STICKY_NOTE_BODY}>
            {source}
          </p>
        )
      )}
    </div>
  );
}

import {
  Children,
  isValidElement,
  type ReactNode,
} from "react";

interface StickyNoteRailProps {
  children: ReactNode;
  className?: string;
}

/** Compact notes beside centered content (xl+); stack below on small screens. */
export default function StickyNoteRail({
  children,
  className = "",
}: StickyNoteRailProps) {
  const items = Children.toArray(children);

  return (
    <aside
      className={`flex min-w-0 w-full max-w-[10.5rem] flex-col gap-2 xl:sticky xl:top-24 xl:max-h-[min(14rem,calc(100vh-6.5rem))] xl:overflow-y-auto xl:overscroll-contain ${className}`.trim()}
      aria-label="Section notes"
    >
      {items.map((child, index) => (
        <div
          key={
            isValidElement(child) && child.key != null ? String(child.key) : index
          }
          className="min-w-0 w-full"
        >
          {child}
        </div>
      ))}
    </aside>
  );
}

/** Main block centered; notes sit to the right of that block without shrinking its width (xl+). */
export function SectionWithNotes({
  children,
  notes,
  className = "",
  contentClassName = "w-full",
  layoutMaxWidth = "max-w-6xl",
}: {
  children: ReactNode;
  notes?: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Width of the centered block notes attach to; `max-w-none` for full-width tables. */
  layoutMaxWidth?: string;
}) {
  return (
    <div className={`relative w-full ${className}`.trim()}>
      <div className={`relative mx-auto w-full min-w-0 ${layoutMaxWidth}`}>
        <div className={contentClassName}>{children}</div>
        {notes ? (
          <div className="mt-3 flex justify-center xl:mt-0 xl:block xl:absolute xl:left-[calc(100%+0.65rem)] xl:top-0 xl:w-[10.5rem] xl:z-0 pointer-events-auto">
            {notes}
          </div>
        ) : null}
      </div>
    </div>
  );
}

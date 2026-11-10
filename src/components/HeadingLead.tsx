import type { ReactNode } from "react";

export function sourceThroughText(
  source: string,
  through: string,
  rest?: string,
): string {
  const lead = `Source: ${source}. Through: ${through}.`;
  return rest ? `${lead} ${rest}` : lead;
}

export function HeadingLead({
  source,
  through,
  children,
  className = "text-cpbh-navy/60 text-sm mt-2 max-w-3xl mx-auto leading-relaxed",
}: {
  source: string;
  through: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p className={className}>
      <span className="block">Source: {source}</span>
      <span className="block">Through: {through}</span>
      {children ? <span className="block mt-1">{children}</span> : null}
    </p>
  );
}

import {
  sectionReportingScope,
  type SectionScopeId,
} from "@/data/sectionReportingScope";

export default function SectionScopeBracket({
  sectionId,
  className = "",
}: {
  sectionId: SectionScopeId;
  className?: string;
}) {
  const scope = sectionReportingScope(sectionId);
  return (
    <span
      className={`font-sans text-xs sm:text-sm font-normal text-cpbh-navy/50 leading-snug ${className}`}
      title={scope.bullets.join("\n")}
    >
      ({scope.bracket})
    </span>
  );
}

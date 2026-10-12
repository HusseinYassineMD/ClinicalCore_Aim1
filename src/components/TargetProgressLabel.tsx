/** Shared caption under progress bars (count color · label neutral). */
export default function TargetProgressLabel({
  pct,
  valueClass,
  className = "text-xs mt-1",
  variant = "period",
}: {
  pct: number;
  valueClass: string;
  className?: string;
  variant?: "period" | "annual";
}) {
  const suffix =
    variant === "annual" ? "of annual target" : "of reporting-period target";
  return (
    <p className={`${className} text-cpbh-navy/55 leading-snug`}>
      <span className={`tabular-nums font-semibold ${valueClass}`}>{pct}%</span>{" "}
      {suffix}
    </p>
  );
}

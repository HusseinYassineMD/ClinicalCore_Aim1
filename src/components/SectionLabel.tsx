interface SectionLabelProps {
  title: string;
  subtitle?: string;
  variant?: "priority" | "ondeck";
}

export default function SectionLabel({
  title,
  subtitle,
  variant = "priority",
}: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className={`inline-block w-1 h-8 rounded-full ${
          variant === "priority" ? "bg-cpbh-purple" : "bg-cpbh-teal"
        }`}
      />
      <div>
        <h2 className="font-display text-xl font-semibold text-cpbh-navy">
          {title}
        </h2>
        {subtitle && (
          <p className="text-cpbh-navy/60 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  DASHBOARD_MISSION,
  dashboardShareParagraph,
} from "@/data/dashboardNarrative";

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-cpbh-navy/80">
      {items.map((line) => (
        <li key={line} className="flex gap-2">
          <span className="text-cpbh-purple mt-0.5 shrink-0">•</span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardMissionBanner() {
  const m = DASHBOARD_MISSION;
  const contact = m.contacts[0];

  return (
    <section
      id="dashboard-mission-banner"
      className="border-b border-cpbh-purple/15 bg-gradient-to-b from-cpbh-purple/[0.12] to-cpbh-mist/30"
    >
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-cpbh-purple">
          {m.eyebrow}
        </p>
        <h2 className="font-display mt-2 text-2xl md:text-3xl font-semibold text-cpbh-navy leading-snug max-w-4xl">
          {m.headline}
        </h2>
        <p className="mt-4 max-w-4xl text-base md:text-lg leading-relaxed text-cpbh-navy/85">
          {m.preamble}
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          <div className="dashboard-card bg-white/95 border-cpbh-mist shadow-sm p-5 md:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-cpbh-purple">
              What you see here
            </h3>
            <BulletList items={m.onThisPage} />
          </div>
          <div className="dashboard-card bg-white/95 border-cpbh-mist shadow-sm p-5 md:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-cpbh-purple">
              What we do not claim
            </h3>
            <BulletList items={m.notOnThisPage} />
          </div>
          <div className="dashboard-card bg-cpbh-purple/[0.08] border-cpbh-purple/25 shadow-sm p-5 md:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-cpbh-purple">
              Checks &amp; contacts
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-cpbh-navy/85">
              <span className="font-semibold text-cpbh-navy">
                {m.validatedCheckCount} automated checks
              </span>{" "}
              match dashboard totals to source files for {m.reportingWindow}.
            </p>
            <Link
              href="/data-sources"
              className="mt-2 inline-block text-sm font-medium text-cpbh-sky hover:underline"
            >
              Open checks &amp; sources →
            </Link>
            <div className="mt-4 pt-4 border-t border-cpbh-purple/15 text-sm text-cpbh-navy/80 space-y-1">
              <p>
                <span className="font-semibold text-cpbh-navy">{contact.name}</span>
                {" · "}
                {contact.role}
              </p>
              <p>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-cpbh-sky font-medium hover:underline"
                >
                  {contact.email}
                </a>
              </p>
              {contact.emailNote ? (
                <p className="text-xs text-cpbh-navy/65">{contact.emailNote}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 dashboard-card bg-white/90 border-cpbh-mist p-5 md:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-cpbh-navy/45 mb-2">
            Copy for email or board notes
          </p>
          <p className="text-sm leading-relaxed text-cpbh-navy/80">
            {dashboardShareParagraph()}
          </p>
        </div>
      </div>
    </section>
  );
}

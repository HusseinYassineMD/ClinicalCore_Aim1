import Link from "next/link";
import { DASHBOARD_MISSION } from "@/data/dashboardNarrative";

export default function DashboardContactFooter() {
  const contact = DASHBOARD_MISSION.contacts[0];

  return (
    <footer className="border-t border-cpbh-mist bg-cpbh-mist/20 mt-10">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-cpbh-navy/70">
        <p>
          <span className="font-medium text-cpbh-navy">{contact.name}</span>
          {" · "}
          <a
            href={`mailto:${contact.email}`}
            className="text-cpbh-sky hover:text-cpbh-navy font-medium"
          >
            {contact.email}
          </a>
        </p>
        <Link
          href="/data-sources"
          className="font-medium text-cpbh-sky hover:text-cpbh-navy sm:text-right"
        >
          {DASHBOARD_MISSION.validatedCheckCount} metric checks & sources →
        </Link>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Metrics" },
  { href: "/data-package", label: "Data Package" },
  { href: "/data-sources", label: "Checks & sources" },
  { href: "/registry-data", label: "Registry Summaries" },
] as const;

export default function DashboardNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const path = mounted ? pathname : null;

  return (
    <nav
      className="border-b border-cpbh-mist bg-white/95 backdrop-blur sticky top-0 z-20"
      aria-label="Dashboard sections"
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-2">
          {TABS.map((tab) => {
            const active =
              path != null &&
              (tab.href === "/" ? path === "/" : path.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-cpbh-navy text-white shadow-sm"
                    : "text-cpbh-navy/70 hover:bg-cpbh-mist/60 hover:text-cpbh-navy"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

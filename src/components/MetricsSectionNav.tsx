"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "recruitment", label: "Recruitment" },
  { id: "demographics", label: "Demographics" },
  { id: "neuropathology", label: "Neuropathology" },
  { id: "ore", label: "ORE" },
  { id: "biomarkers", label: "Biomarkers" },
  { id: "rec", label: "REC" },
  { id: "imaging", label: "Imaging" },
] as const;

export default function MetricsSectionNav() {
  const [active, setActive] = useState<string>("recruitment");
  const [trackScroll, setTrackScroll] = useState(false);

  useEffect(() => {
    setTrackScroll(true);

    const ids = SECTIONS.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.15, 0.4] },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="border-b border-cpbh-mist/80 bg-cpbh-mist/25"
      aria-label="Metrics page sections"
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex gap-1 overflow-x-auto">
        {SECTIONS.map((section) => {
          const isActive = trackScroll && active === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors scroll-mt-28 ${
                isActive
                  ? "bg-cpbh-purple text-white shadow-sm"
                  : "text-cpbh-navy/75 hover:bg-white/80 hover:text-cpbh-navy"
              }`}
            >
              {section.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

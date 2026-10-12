#!/usr/bin/env node
/**
 * Board deck: one dashboard section at a time (Recruitment → Demographics → …).
 * Each section is captured in full; tall sections split into consecutive parts only
 * when needed so every pixel is shown and scaled to fit the slide.
 */
import { chromium } from "playwright";
import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.resolve(process.argv[2] || path.join(ROOT, "assets", "dashboard-screenshots"));
const BASE = process.env.DASHBOARD_URL || "http://localhost:3002";

const VIEWPORT = { width: 1920, height: 1080 };
/**
 * Max document height (CSS px) per slide — tuned so scaled PNG fits above EAC
 * footer with readable chart labels (≈ one viewport band).
 */
/** Smaller slices → fewer rows per slide → larger numbers when scaled to fit. */
const MAX_SLICE_HEIGHT = 780;

const DECK_SECTIONS = [
  {
    id: "recruitment",
    order: "01",
    selector: "#deck-section-recruitment",
    title: "Recruitment",
    subtitle: "GeneScreen, ADRC & BRS",
  },
  {
    id: "demographics",
    order: "02",
    selector: "#demographics",
    title: "Demographics",
    subtitle: "Table 1 · charts & cohort",
  },
  {
    id: "neuropathology",
    order: "03",
    selector: "#neuropathology",
    title: "Neuropathology",
    subtitle: "Autopsy metrics & tissue inquiries",
  },
  {
    id: "ore",
    order: "04",
    selector: "#ore",
    title: "ORE",
    subtitle: "Outreach, recruitment & engagement",
  },
  {
    id: "biomarkers",
    order: "05",
    selector: "#biomarkers",
    title: "Biomarkers",
    subtitle: "Collection, NCRAD, biofluid inquiries",
  },
  {
    id: "rec",
    order: "06",
    selector: "#rec",
    title: "REC",
    subtitle: "Research engagement coordinator",
  },
  {
    id: "imaging",
    order: "07",
    selector: "#imaging",
    title: "Imaging",
    subtitle: "SCAN, CLARiTI & IDA",
  },
];

/** Split at registry row boundaries (and section top/bottom), not fixed 1080px bands. */
async function planSectionSlices(page, selector, maxSliceHeight) {
  return page.evaluate(
    ({ sel, maxH }) => {
      const root = document.querySelector(sel);
      if (!root) return [];

      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const rootBottom = rootTop + Math.max(root.scrollHeight, root.getBoundingClientRect().height);

      const breaks = [rootTop];
      const deckBlocks = root.querySelectorAll("[data-deck-slide]");
      if (deckBlocks.length >= 1) {
        for (const block of deckBlocks) {
          const y = block.getBoundingClientRect().top + window.scrollY;
          if (y > breaks[breaks.length - 1] + 6) breaks.push(y);
        }
      } else {
        const desktop = root.querySelector(".hidden.xl\\:flex");
        if (desktop) {
          for (const row of desktop.children) {
            const y = row.getBoundingClientRect().top + window.scrollY;
            if (y > breaks[breaks.length - 1] + 6) breaks.push(y);
          }
        } else {
          for (const child of root.children) {
            const y = child.getBoundingClientRect().top + window.scrollY;
            if (y > breaks[breaks.length - 1] + 6) breaks.push(y);
          }
        }
      }
      if (rootBottom > breaks[breaks.length - 1] + 4) breaks.push(rootBottom);

      const slices = [];
      let packStart = breaks[0];
      let packEnd = breaks[0];

      for (let i = 1; i < breaks.length; i += 1) {
        const next = breaks[i];
        if (next - packStart > maxH && packEnd > packStart) {
          slices.push({ top: packStart, height: packEnd - packStart });
          packStart = packEnd;
        }
        packEnd = next;
      }
      if (packEnd > packStart) {
        slices.push({ top: packStart, height: packEnd - packStart });
      }
      return slices.length ? slices : [{ top: rootTop, height: rootBottom - rootTop }];
    },
    { sel: selector, maxH: maxSliceHeight },
  );
}

function captionFor(section, part, parts) {
  const head = section.subtitle
    ? `${section.title} · ${section.subtitle}`
    : section.title;
  if (parts <= 1) return head;
  return `${head} (${part} of ${parts})`;
}

async function boostChartLabelSizes(page) {
  await page.evaluate(() => {
    for (const node of document.querySelectorAll(
      ".recharts-text, .recharts-label-list text, .recharts-cartesian-axis-tick-value",
    )) {
      const raw = node.getAttribute("font-size") || node.style.fontSize || "10";
      const n = parseFloat(String(raw).replace(/px$/, ""));
      if (!Number.isFinite(n)) continue;
      const next = Math.max(13, Math.round(n * 1.45));
      node.setAttribute("font-size", String(next));
      node.style.fontSize = `${next}px`;
    }
  });
}

async function measureSectionClipBox(page, selector) {
  return page.evaluate(
    ({ sel, maxW }) => {
      const node = document.querySelector(sel);
      if (!node) return { x: 0, width: maxW };
      const r = node.getBoundingClientRect();
      const pad = 20;
      const x = Math.max(0, Math.floor(r.left + window.scrollX - pad));
      const width = Math.min(maxW - x, Math.ceil(r.width + pad * 2));
      return { x, width: Math.max(320, width) };
    },
    { sel: selector, maxW: VIEWPORT.width },
  );
}

async function captureRegionClip(page, top, height, outPath, clipX, clipWidth) {
  await page.screenshot({
    path: outPath,
    fullPage: true,
    clip: {
      x: clipX,
      y: Math.max(0, top),
      width: clipWidth,
      height: Math.max(1, Math.round(height)),
    },
    animations: "disabled",
  });
}

async function captureSection(page, section) {
  const loc = page.locator(section.selector).first();
  if ((await loc.count()) === 0) {
    console.warn(`Skip missing section: ${section.selector}`);
    return [];
  }

  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);

  const slices = await planSectionSlices(page, section.selector, MAX_SLICE_HEIGHT);
  if (!slices.length) return [];

  const { x: clipX, width: clipWidth } = await measureSectionClipBox(
    page,
    section.selector,
  );

  const parts = slices.length;
  const entries = [];
  for (let p = 0; p < parts; p += 1) {
    const { top: sliceTop, height: sliceH } = slices[p];
    if (sliceH < 24) continue;

    const part = p + 1;
    const fname = `${section.order}-${section.id}-p${String(part).padStart(2, "0")}of${String(parts).padStart(2, "0")}.png`;

    await page.evaluate((y) => window.scrollTo({ top: Math.max(0, y - 12), left: 0 }), sliceTop);
    await page.waitForTimeout(400);

    await captureRegionClip(
      page,
      sliceTop,
      sliceH,
      path.join(OUT, fname),
      clipX,
      clipWidth,
    );

    entries.push({
      file: fname,
      caption: captionFor(section, part, parts),
      sectionId: section.id,
      sectionTitle: section.title,
      sectionSubtitle: section.subtitle,
      part,
      parts,
    });
  }

  return entries;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const name of await readdir(OUT)) {
    if (name.endsWith(".png")) {
      await unlink(path.join(OUT, name));
    }
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 2.5,
  });

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => document.documentElement.classList.add("dashboard-capture"));
  await page.waitForFunction(
    () => {
      const recruit = document.querySelector("#deck-section-recruitment");
      if (! recruit) return false;
      return Boolean(
        recruit.querySelector(".recharts-wrapper") ||
          recruit.querySelector(".registry-chart-plot svg"),
      );
    },
    { timeout: 90_000 },
  );
  await page.waitForTimeout(1200);
  await boostChartLabelSizes(page);

  const manifest = [];
  for (const section of DECK_SECTIONS) {
    await boostChartLabelSizes(page);
    manifest.push(...(await captureSection(page, section)));
  }

  await writeFile(
    path.join(OUT, "manifest.json"),
    JSON.stringify(
      {
        viewport: VIEWPORT,
        mode: "by-section",
        deckBuildId: "slide-center-v20",
        generatedAt: new Date().toISOString(),
        slides: manifest,
      },
      null,
      2,
    ),
  );

  await browser.close();
  console.log(`Wrote ${manifest.length} section PNGs (${DECK_SECTIONS.length} sections) → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

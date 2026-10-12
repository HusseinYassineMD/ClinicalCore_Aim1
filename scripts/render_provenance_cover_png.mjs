#!/usr/bin/env node
import { chromium } from "playwright";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HTML = path.join(ROOT, "assets/deck/html/provenance-cover-slide.html");
const OUT_ASSETS = path.join(
  ROOT,
  "assets/deck/export/USC_ADRC_Metric_Provenance_Cover_Slide.png",
);
const OUT_DESKTOP = path.join(
  process.env.HOME || "",
  "Desktop",
  "USC_ADRC_Metric_Provenance_Cover_Slide.png",
);

const pkg = JSON.parse(
  readFileSync(path.join(ROOT, "src/data/rpprDataPackage.json"), "utf8"),
);
const period = pkg.reportingPeriodSummary?.label || "YTD";
const generated = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

const url =
  "file://" +
  HTML +
  "?period=" +
  encodeURIComponent(period) +
  "&generated=" +
  encodeURIComponent(generated);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.screenshot({ path: OUT_ASSETS, fullPage: false });
await page.screenshot({ path: OUT_DESKTOP, fullPage: false });
await browser.close();
console.log("Wrote", OUT_ASSETS);
console.log("Wrote", OUT_DESKTOP);

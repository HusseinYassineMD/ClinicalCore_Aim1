#!/usr/bin/env node
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "assets/deck/export/USC_ADRC_Dashboard_Mission_Banner.png");
const DESKTOP = path.join(
  process.env.HOME || "",
  "Desktop",
  "USC_ADRC_Dashboard_Mission_Banner.png",
);
const BASE = process.env.DASHBOARD_URL || "http://localhost:3002";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { waitUntil: "networkidle", timeout: 120_000 });
await page.locator("#dashboard-mission-banner").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const el = page.locator("#dashboard-mission-banner");
await el.screenshot({ path: OUT });
await el.screenshot({ path: DESKTOP });
await browser.close();
console.log("Wrote", OUT);
console.log("Wrote", DESKTOP);

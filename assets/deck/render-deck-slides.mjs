import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const verifiedPath = process.argv[2];
if (!verifiedPath) {
  console.error("Usage: node render-deck-slides.mjs <adrcDashboardDeckVerified.json>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(verifiedPath, "utf8"));
const ytd = data.ytd;
const rppr = data.rpprHeadlines;
const nacc = data.imagingIntegratedNacc || {};

function barHeight(value, max) {
  const pct = Math.max(8, Math.round((value / max) * 100));
  return `${pct}%`;
}

const maxVisit = Math.max(ytd.followUpInPerson, ytd.followUpRemote, ytd.initialEvaluations, 1);
const specTotal = ytd.biofluidRequests + ytd.neurobankRequests;

const payload = {
  grantPeriod: data.grantPeriod,
  ytdLabel: data.ytdLabel,
  rpprWindow: data.rpprReportingPeriod,
  packageReceivedAt: data.packageReceivedAt,
  ytd,
  rppr,
  nacc,
  specTotal,
  barInPerson: barHeight(ytd.followUpInPerson, maxVisit),
  barRemote: barHeight(ytd.followUpRemote, maxVisit),
  barInitial: barHeight(ytd.initialEvaluations, maxVisit),
};

async function inject(page, htmlPath, fn) {
  await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
  await page.evaluate(fn, payload);
}

const exportDir = path.join(__dirname, "export");
const out1 = path.join(exportDir, "ADRC_Dashboard_Slide1_Purpose.png");
const out2 = path.join(exportDir, "ADRC_Dashboard_Slide2_UI.png");
const slide1 = path.join(__dirname, "slide1-purpose.html");
const slide2 = path.join(__dirname, "slide2-dashboard-ui.html");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

await inject(page, slide1, (p) => {
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set("grantPeriod", p.grantPeriod);
  set("ytdLabel", p.ytdLabel);
  set("rpprWindow", p.rpprWindow);
  set("kUds", String(p.ytd.udsParticipantsWithVisit));
  set("kAdrc", String(p.rppr.adrcCohortN));
  set("kGs", String(p.rppr.geneScreenEnrolled));
  set("kInPerson", String(p.ytd.followUpInPerson));
  set("kOre", p.rppr.oreEventAttendees.toLocaleString("en-US"));
  set("kSpec", String(p.specTotal));
});
await page.screenshot({ path: out1, type: "png" });

await inject(page, slide2, (p) => {
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set("ytdLabel", p.ytdLabel);
  set("grantPeriod", p.grantPeriod);
  set("rpprWindow", p.rpprWindow);
  set("mUds", String(p.ytd.udsParticipantsWithVisit));
  set("mAdrc", String(p.rppr.adrcCohortN));
  set("mGs", String(p.rppr.geneScreenEnrolled));
  set("mApoe", String(p.rppr.geneScreenApoe4));
  set("mInPerson", String(p.ytd.followUpInPerson));
  set("mRemote", String(p.ytd.followUpRemote));
  set("mInitial", String(p.ytd.initialEvaluations));
  set("mVisitRows", String(p.ytd.totalUdsVisitRows));
  set("mPlasma", String(p.ytd.plasmaSubjects));
  set("mPlasmaRows", String(p.ytd.plasmaMeasurementRows));
  set("mGfap", String(p.ytd.ncradGfapMeasurements));
  set("mBrs", String(p.rppr.brsEnrolled));
  set("mAutConsent", String(p.ytd.autopsyConsents));
  set("mAutopsy", String(p.ytd.autopsiesPerformed));
  set("mOreEv", String(p.rppr.oreCommunityEvents));
  set("mOre", p.rppr.oreEventAttendees.toLocaleString("en-US"));
  set("bInPerson", String(p.ytd.followUpInPerson));
  set("bRemote", String(p.ytd.followUpRemote));
  set("bInitial", String(p.ytd.initialEvaluations));
  set("tBio", String(p.ytd.biofluidRequests));
  set("tNeuro", String(p.ytd.neurobankRequests));
  set("tAliq", String(p.ytd.plasmaAliquotsRequested));
  set("tOnline", String(p.rppr.oreOnlineEnrollments));
  set("iScanMri", String(p.ytd.scanMriParticipants));
  set("iClarMri", String(p.ytd.claritiMriParticipants));
  set("iClarAmy", String(p.ytd.claritiAmyloidPet));
  set("iClarTau", String(p.ytd.claritiTauPet));
  set("iNaccScan", String(p.nacc.scan ?? "—"));
  set("iNaccClar", String(p.nacc.clariti ?? "—"));
  set("iNaccAdrc", String(p.nacc.uscAdrc ?? "—"));
  set("pkgDate", p.packageReceivedAt);
  set("tUds", String(p.ytd.udsParticipantsWithVisit));
  set("tRemote", String(p.ytd.followUpRemote));
  set("tInitial", String(p.ytd.initialEvaluations));
  set("tPlasmaRows", String(p.ytd.plasmaMeasurementRows));
  set("tSpec", String(p.specTotal));
  set("tApoe", String(p.rppr.geneScreenApoe4));
  set("tAutopsy", String(p.ytd.autopsiesPerformed));
  set("tGs", String(p.rppr.geneScreenEnrolled));
  set("tBrs", String(p.rppr.brsEnrolled));
  for (const [id, h] of [
    ["barInPerson", p.barInPerson],
    ["barRemote", p.barRemote],
    ["barInitial", p.barInitial],
  ]) {
    const el = document.getElementById(id);
    if (el) el.style.height = h;
  }
  set("verifyFoot", `Sources: rpprMetrics · RedCap · ADRC core exports · snapshot ${p.packageReceivedAt}`);
});
await page.screenshot({ path: out2, type: "png" });

await browser.close();
console.log("Saved:", out1);
console.log("Saved:", out2);

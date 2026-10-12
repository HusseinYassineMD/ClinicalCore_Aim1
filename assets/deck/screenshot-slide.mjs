import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'html/genescreen-deck-slide.html');
const outPath = path.join(__dirname, 'export/GeneScreen_RPPR_Deck_Slide.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();
console.log('Saved:', outPath);

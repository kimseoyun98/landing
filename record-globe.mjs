import { chromium } from 'playwright';

const WIDTH = 1980;
const HEIGHT = 1024;
const DURATION_MS = 8000;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  recordVideo: { dir: 'recordings', size: { width: WIDTH, height: HEIGHT } },
});
const page = await context.newPage();
await page.goto('http://localhost:5177', { waitUntil: 'networkidle' });
await page.waitForTimeout(DURATION_MS);
await context.close();
await browser.close();

console.log('done');

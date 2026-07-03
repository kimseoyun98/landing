import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1980, height: 1024 } });
await page.goto('http://localhost:5178', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.screenshot({ path: process.argv[2] });
await browser.close();
console.log('saved');

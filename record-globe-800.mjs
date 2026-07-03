import { chromium } from 'playwright';

const SIZE = 800;
const DURATION_MS = 12500;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: SIZE, height: SIZE },
  recordVideo: { dir: 'recordings', size: { width: SIZE, height: SIZE } },
});
const page = await context.newPage();
await page.goto('http://localhost:5177', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500); // 폰트 로드 + 초기 팝 안정화
await page.waitForTimeout(DURATION_MS);
await context.close();
await browser.close();
console.log('done');

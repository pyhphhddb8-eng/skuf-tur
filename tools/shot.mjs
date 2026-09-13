// Скриншоты страницы на трёх ширинах. Запуск: npm run shot [имя-файла]
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

mkdirSync('tools/shots', { recursive: true });
const tag = process.argv[2] || 'now';
const url = pathToFileURL(resolve('index.html')).href;
const browser = await chromium.launch();
for (const w of [360, 768, 1280]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `tools/shots/${tag}-${w}.png`, fullPage: true });
  await page.close();
  console.log(`tools/shots/${tag}-${w}.png`);
}
await browser.close();

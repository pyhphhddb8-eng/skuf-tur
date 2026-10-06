// Рисует og.png 1200×630 — превью ссылки в мессенджерах. Запуск: npm run og
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

// Шрифт, цвета и схема маршрута берутся со страницы, чтобы превью не разъезжалось с ней
const page_html = readFileSync('index.html', 'utf8');
const face = page_html.match(/@font-face\{[\s\S]*?\}/)[0];
const root = page_html.match(/:root\{[\s\S]*?\}/)[0];
const karta = page_html.match(/<svg viewBox="0 0 400 480"[\s\S]*?<\/svg>/)[0];

const html = `<!doctype html><meta charset="utf-8"><style>
  ${face}
  ${root}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:var(--paper);position:relative;overflow:hidden;
    font:400 16px "Finlandica",sans-serif;color:var(--ink)}
  .t{position:absolute;top:84px;left:72px;width:560px}
  h1{font-weight:700;font-size:68px;line-height:1.02;letter-spacing:-.01em}
  p{margin-top:30px;font-size:32px;color:var(--ink-soft)}
  svg{position:absolute;right:56px;top:40px;width:458px;height:550px;border:1px solid var(--line)}
</style>
<div class="t"><h1>Два дня в горах, где от вас ничего не требуется</h1>
<p>Из Краснодара на 2–3 дня,<br>17&nbsp;000&nbsp;₽ с&nbsp;человека</p></div>
${karta}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'og.png' });
await browser.close();
console.log('og.png готов');

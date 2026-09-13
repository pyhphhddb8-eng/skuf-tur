// Рисует og.png 1200×630 — превью ссылки в мессенджерах. Запуск: npm run og
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

// Берём тот же вшитый шрифт, что и на странице, чтобы превью не разъезжалось со страницей
const page_html = readFileSync('index.html', 'utf8');
const face = page_html.match(/@font-face\{[\s\S]*?\}/)[0];

const html = `<!doctype html><meta charset="utf-8"><style>
  ${face}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#f6f2ea;position:relative;overflow:hidden;
    font:400 16px ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif}
  .sky{position:absolute;inset:0;background:linear-gradient(in oklab,#f6f2ea 0%,#efe6d6 68%,#e6d9c2 100%)}
  .far{position:absolute;inset:auto 0 0 0;height:46%;background:#2f4034;opacity:.92;
    clip-path:polygon(0 100%,0 56%,14% 24%,28% 50%,44% 12%,62% 48%,76% 28%,100% 74%,100% 100%)}
  .near{position:absolute;inset:auto 0 0 0;height:28%;background:#24312a;
    clip-path:polygon(0 100%,0 62%,22% 34%,40% 62%,56% 28%,74% 58%,90% 38%,100% 64%,100% 100%)}
  .t{position:absolute;top:78px;left:84px;right:84px;color:#22201c}
  h1{font-family:'Onest',sans-serif;font-weight:700;font-size:78px;line-height:1.02;
     letter-spacing:-.03em;max-width:15ch}
  p{margin-top:26px;font-size:31px;font-weight:500;color:#55504a;letter-spacing:.01em}
</style>
<div class="sky"></div><div class="far"></div><div class="near"></div>
<div class="t"><h1>Два дня в горах, где от вас ничего не требуется</h1>
<p>Краснодар · 2–3 дня · 17 000 ₽ с человека</p></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'og.png' });
await browser.close();
console.log('og.png готов');

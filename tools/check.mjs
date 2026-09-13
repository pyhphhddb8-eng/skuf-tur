// Автопроверка страницы: прокрутка на 360px, alt у картинок, контраст по WCAG, чистая консоль.
// Запуск: npm run check           — проверяет локальный index.html
//         node tools/check.mjs URL — проверяет живой адрес
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const arg = process.argv[2];
const target = arg
  ? (arg.startsWith('http') ? arg : pathToFileURL(resolve(arg)).href)
  : pathToFileURL(resolve('index.html')).href;

const fails = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });

const noise = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') noise.push(m.text()); });
page.on('pageerror', e => noise.push(String(e)));

await page.goto(target, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

// 1. Горизонтальная прокрутка на 360 px
const overflow = await page.evaluate(() => {
  const d = document.documentElement;
  if (d.scrollWidth <= d.clientWidth) return null;
  const guilty = [...document.querySelectorAll('*')]
    .filter(el => el.getBoundingClientRect().right > d.clientWidth + 1)
    .slice(0, 5)
    .map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''));
  return { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth, guilty };
});
if (overflow) fails.push(`Горизонтальная прокрутка на 360px: ${overflow.scrollWidth}>${overflow.clientWidth}, виноваты: ${overflow.guilty.join(', ')}`);

// 2. alt у всех картинок
const noAlt = await page.evaluate(() =>
  [...document.querySelectorAll('img')].filter(i => i.getAttribute('alt') === null).map(i => i.src.slice(-40)));
if (noAlt.length) fails.push(`Нет alt у картинок: ${noAlt.join(', ')}`);

// 3. Контраст по WCAG: 4.5 для обычного текста, 3.0 для крупного (24px+ или 19px+ жирного)
const lowContrast = await page.evaluate(() => {
  const lum = ([r, g, b]) => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const rgb = s => (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
  const bgOf = el => {
    for (let n = el; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const parts = c.match(/[\d.]+/g) || [];
      if (c && c !== 'transparent' && parts[3] !== '0') return rgb(c);
    }
    return [255, 255, 255];
  };
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (!text) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const norm = isLarge ? 3 : 4.5;
    const l1 = lum(rgb(cs.color)), l2 = lum(bgOf(el));
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    if (ratio < norm) bad.push(`«${text.slice(0, 34)}…» — ${ratio.toFixed(2)} при норме ${norm}`);
  }
  return bad;
});
if (lowContrast.length) fails.push('Контраст ниже нормы:\n    ' + lowContrast.join('\n    '));

// 4. Чистая консоль
if (noise.length) fails.push(`Сообщения в консоли: ${noise.join(' | ')}`);

await browser.close();

if (fails.length) { console.error('ПРОВЕРКА НЕ ПРОЙДЕНА:\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Проверка пройдена: прокрутки нет, alt на месте, контраст в норме, консоль чистая.');

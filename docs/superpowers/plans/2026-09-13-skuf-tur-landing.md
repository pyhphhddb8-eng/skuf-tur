# Лендинг «Скуф-тур» — план работ

> **Для исполнителя-агента:** ОБЯЗАТЕЛЬНЫЙ СУБ-НАВЫК: `superpowers:subagent-driven-development`
> (рекомендуется) или `superpowers:executing-plans` — выполнять задача за задачей.
> Шаги помечены чекбоксами `- [ ]` для отслеживания.

**Цель:** собрать одностраничный лендинг «Скуф-тур» из восьми экранов одним
самодостаточным HTML-файлом и выложить его черновиком на GitHub Pages.

**Архитектура:** вся страница — один файл `index.html`: разметка, стили и
единственный маленький скрипт внутри. Ни сборки, ни зависимостей, ни внешних
запросов у страницы. Рядом лежит служебный каталог `tools/` с проверками на
Playwright — он нужен только разработчику и в саму страницу не попадает.

**Стек:** HTML + CSS (custom properties, grid, clamp). Node 24 + Playwright —
только для автоматических проверок и скриншотов. Ничего больше.

**Спека:** `docs/superpowers/specs/2026-09-13-skuf-tur-landing-design.md`

## Сквозные ограничения

Действуют во всех задачах без исключения.

- Страница — **один файл** `index.html`. Никаких внешних запросов из неё:
  ни шрифтов с CDN, ни аналитики, ни картинок по ссылке.
- Единственное исключение — `og.png` рядом с файлом: превью для мессенджеров
  физически обязано быть отдельным файлом по абсолютному адресу.
- Целевое действие одно: **написать в Телеграм**. Формы на странице нет,
  персональные данные не собираются, поля ввода не добавляются.
- Тон: ирония только в заголовках и подписях. Оформление — тёплое и взрослое.
- Запрещены: таймеры обратного отсчёта, «осталось N мест», выдуманные отзывы,
  стоковые фото под видом фото тура, копирование текстов отзывов с Авито.
- Цифры только из объявления: 2–3 дня, 17 000 ₽, микроавтобус на 8 мест,
  группы 5–25 человек, возраст 20–40, рейтинг 5,0 из 5 при 29 отзывах.
  Чего в объявлении нет — того на странице нет.
- Контраст любой текстовой пары по WCAG ≥ 4,5.
- На ширине 360 px горизонтальной прокрутки нет.
- У каждого изображения есть `alt`. У кнопки в Телеграм видимый фокус
  с клавиатуры.
- Пока черновик: в `<head>` стоит `<meta name="robots" content="noindex">`,
  контакты — заглушки, адрес Телеграма подставляется после согласования.
- Адаптив: одна колонка на 360 px, две на 768 px, полная сетка от 1024 px.
- Каждая задача заканчивается коммитом на русском языке.

## Решения, которые нужно подтвердить до Задачи 1

**Шрифты.** `pyftsubset` на машине нет. Два пути:

- **А (рекомендую):** поставить `fontTools` и подрезать один бесплатный
  шрифт с кириллицей под заголовки (Onest или Golos Text, лицензия SIL OFL),
  вшить его в файл как base64. Плюс ~20–35 КБ к весу, зато у страницы
  появляется характер. Текст — системным стеком, 0 КБ.
- **Б:** всё системным стеком. 0 КБ, ноль возни, но типографика обезличена.

**Playwright.** Проверки (контраст, прокрутка, консоль, скриншоты) делаются
скриптом на Playwright. Это разовая установка браузера ~150 МБ в кэш системы.
Без него все проверки придётся делать глазами.

---

## Структура файлов

| Файл                | За что отвечает                                          |
| ------------------- | -------------------------------------------------------- |
| `index.html`        | вся страница целиком: разметка, стили, один скрипт       |
| `og.png`            | превью 1200×630 для мессенджеров, генерируется кодом     |
| `tools/check.mjs`   | автопроверки: контраст, прокрутка на 360, консоль, `alt` |
| `tools/shot.mjs`    | скриншоты 360 / 768 / 1280 в `tools/shots/`              |
| `tools/make-og.mjs` | рисует `og.png` из HTML-шаблона через Playwright         |
| `package.json`      | только devDependency `playwright` и три npm-скрипта      |
| `.gitignore`        | `node_modules/`, `tools/shots/`                          |
| `.nojekyll`         | пустой файл, чтобы GitHub Pages не трогал разметку       |

Порядок задач повторяет порядок экранов: страница растёт сверху вниз и после
каждого экрана остаётся рабочей и проверяемой.

---

### Задача 1: Каркас, оформление и автопроверки

**Файлы:**

- Создать: `index.html`, `tools/check.mjs`, `package.json`, `.gitignore`, `.nojekyll`
- Тест: `tools/check.mjs` — он и есть тест для всех последующих задач

**Интерфейсы:**

- Отдаёт дальше: CSS-переменные `--ink`, `--ink-soft`, `--paper`, `--paper-warm`,
  `--pine`, `--ember`, `--line`; классы `.section`, `.wrap`, `.eyebrow`, `.btn`,
  `.btn--tg`; команду `npm run check`.

- [ ] **Шаг 1: Завести package.json и зависимость для проверок**

```bash
cd ~/Progects/skuf-tur
npm init -y
npm pkg set name="skuf-tur" private=true type="module" description="Лендинг «Скуф-тур»"
npm pkg set scripts.check="node tools/check.mjs"
npm pkg set scripts.shot="node tools/shot.mjs"
npm pkg set scripts.og="node tools/make-og.mjs"
npm install -D playwright
npx playwright install chromium
printf 'node_modules/\ntools/shots/\n' > .gitignore
touch .nojekyll
```

- [ ] **Шаг 2: Написать проверку, которая сейчас обязана упасть**

Создать `tools/check.mjs`:

```js
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const target = process.argv[2]
  ? process.argv[2].startsWith("http")
    ? process.argv[2]
    : pathToFileURL(resolve(process.argv[2])).href
  : pathToFileURL(resolve("index.html")).href;

const fails = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });

const noise = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") noise.push(m.text());
});
page.on("pageerror", (e) => noise.push(String(e)));

await page.goto(target, { waitUntil: "load" });

// 1. Горизонтальная прокрутка на 360 px
const overflow = await page.evaluate(() => {
  const d = document.documentElement;
  if (d.scrollWidth <= d.clientWidth) return null;
  const guilty = [...document.querySelectorAll("*")]
    .filter((el) => el.getBoundingClientRect().right > d.clientWidth + 1)
    .slice(0, 5)
    .map(
      (el) =>
        el.tagName.toLowerCase() +
        (el.className ? "." + String(el.className).split(" ")[0] : ""),
    );
  return { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth, guilty };
});
if (overflow)
  fails.push(
    `Горизонтальная прокрутка на 360px: ${overflow.scrollWidth}>${overflow.clientWidth}, виноваты: ${overflow.guilty.join(", ")}`,
  );

// 2. alt у всех картинок
const noAlt = await page.evaluate(() =>
  [...document.querySelectorAll("img")]
    .filter((i) => !i.getAttribute("alt"))
    .map((i) => i.src.slice(-40)),
);
if (noAlt.length) fails.push(`Нет alt у картинок: ${noAlt.join(", ")}`);

// 3. Контраст по WCAG, норма 4.5
const lowContrast = await page.evaluate(() => {
  const lum = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const rgb = (s) =>
    (s.match(/\d+(\.\d+)?/g) || [0, 0, 0]).slice(0, 3).map(Number);
  const bgOf = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const a = (c.match(/[\d.]+/g) || [])[3];
      if (c && c !== "transparent" && a !== "0") return rgb(c);
    }
    return [255, 255, 255];
  };
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join("");
    if (!text) continue;
    const cs = getComputedStyle(el);
    if (
      cs.visibility === "hidden" ||
      cs.display === "none" ||
      +cs.opacity === 0
    )
      continue;
    const l1 = lum(rgb(cs.color)),
      l2 = lum(bgOf(el));
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    if (ratio < 4.5) bad.push(`${text.slice(0, 32)}… — ${ratio.toFixed(2)}`);
  }
  return bad;
});
if (lowContrast.length)
  fails.push(`Контраст ниже 4.5:\n    ` + lowContrast.join("\n    "));

// 4. Чистая консоль
if (noise.length) fails.push(`Сообщения в консоли: ${noise.join(" | ")}`);

await browser.close();

if (fails.length) {
  console.error("ПРОВЕРКА НЕ ПРОЙДЕНА:\n- " + fails.join("\n- "));
  process.exit(1);
}
console.log(
  "Проверка пройдена: прокрутки нет, alt на месте, контраст ≥ 4.5, консоль чистая.",
);
```

- [ ] **Шаг 3: Запустить проверку и убедиться, что она падает**

```bash
npm run check
```

Ожидается: падение с ошибкой о том, что `index.html` не найден — файла ещё нет.

- [ ] **Шаг 4: Собрать каркас страницы**

Создать `index.html` — голова документа, палитра, типографика, сетка,
стиль кнопки. Секций пока нет, только пустой `<main>`.

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Скуф-тур — два дня в горах под Краснодаром</title>
    <meta
      name="description"
      content="Выезд из Краснодара в горы на 2–3 дня. Ни ретрита, ни тренингов, ни нетворкинга. Группа до 25 человек, 17 000 ₽."
    />
    <link rel="canonical" href="https://pyhphhddb8-eng.github.io/skuf-tur/" />
    <meta property="og:type" content="website" />
    <meta
      property="og:title"
      content="Скуф-тур — два дня в горах под Краснодаром"
    />
    <meta
      property="og:description"
      content="Ни ретрита, ни тренингов, ни нетворкинга. Просто горы, баня и долгие разговоры."
    />
    <meta
      property="og:url"
      content="https://pyhphhddb8-eng.github.io/skuf-tur/"
    />
    <meta
      property="og:image"
      content="https://pyhphhddb8-eng.github.io/skuf-tur/og.png"
    />
    <meta name="twitter:card" content="summary_large_image" />
    <link
      rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%232f4034'/%3E%3Cpath d='M4 25 13 10l5 8 3-4 7 11z' fill='%23e8dfd0'/%3E%3C/svg%3E"
    />
    <style>
      :root {
        --ink: #22201c; /* основной текст */
        --ink-soft: #55504a; /* вторичный текст, контраст к paper 7.0 */
        --paper: #f6f2ea; /* фон страницы */
        --paper-warm: #efe8dc; /* фон чередующихся секций */
        --pine: #2f4034; /* тёмный фон, хвоя */
        --ember: #b4451f; /* акцент, кнопка */
        --line: #d8cfc0;
        --wrap: 1120px;
        --gap: clamp(1rem, 3vw, 2rem);
        --step: clamp(3.5rem, 8vw, 6.5rem); /* вертикальный ритм секций */
      }
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      html {
        -webkit-text-size-adjust: 100%;
      }
      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font:
          400 clamp(1rem, 0.95rem + 0.3vw, 1.125rem)/1.6 ui-sans-serif,
          -apple-system,
          "Segoe UI",
          Roboto,
          "Helvetica Neue",
          Arial,
          sans-serif;
        overflow-x: hidden;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      h1,
      h2,
      h3 {
        line-height: 1.12;
        letter-spacing: -0.02em;
        margin: 0 0 0.5em;
        text-wrap: balance;
      }
      h1 {
        font-size: clamp(2.1rem, 1.3rem + 4vw, 4rem);
        font-weight: 700;
      }
      h2 {
        font-size: clamp(1.6rem, 1.1rem + 2.4vw, 2.75rem);
        font-weight: 700;
      }
      h3 {
        font-size: clamp(1.1rem, 1rem + 0.6vw, 1.375rem);
        font-weight: 600;
      }
      p {
        margin: 0 0 1em;
        max-width: 62ch;
      }
      .wrap {
        width: min(100% - 2 * var(--gap), var(--wrap));
        margin-inline: auto;
      }
      .section {
        padding-block: var(--step);
      }
      .section--warm {
        background: var(--paper-warm);
      }
      .section--dark {
        background: var(--pine);
        color: #f2ece1;
      }
      .section--dark .eyebrow {
        color: #c3b9a6;
      }
      .eyebrow {
        font-size: 0.8125rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-soft);
        margin: 0 0 1rem;
        font-weight: 600;
      }
      .lead {
        font-size: clamp(1.0625rem, 1rem + 0.5vw, 1.3125rem);
        color: var(--ink-soft);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.95rem 1.6rem;
        border-radius: 999px;
        border: 0;
        font-size: 1.0625rem;
        font-weight: 600;
        line-height: 1;
        text-decoration: none;
        cursor: pointer;
        transition:
          transform 0.15s ease,
          background-color 0.15s ease;
      }
      .btn--tg {
        background: var(--ember);
        color: #fff;
      }
      .btn--tg:hover {
        background: #9c3a19;
        transform: translateY(-1px);
      }
      .btn--ghost {
        background: transparent;
        color: var(--ink);
        border: 1px solid var(--line);
      }
      .btn:focus-visible {
        outline: 3px solid var(--pine);
        outline-offset: 3px;
      }
      .section--dark .btn:focus-visible {
        outline-color: #f2ece1;
      }
      @media (prefers-reduced-motion: reduce) {
        * {
          transition: none !important;
          animation: none !important;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <!-- экраны добавляются задачами 2–9 -->
    </main>
  </body>
</html>
```

- [ ] **Шаг 5: Запустить проверку — теперь она должна пройти**

```bash
npm run check
```

Ожидается: `Проверка пройдена: прокрутки нет, alt на месте, контраст ≥ 4.5, консоль чистая.`

- [ ] **Шаг 6: Коммит**

```bash
git add index.html tools/check.mjs package.json package-lock.json .gitignore .nojekyll
git commit -m "Каркас страницы, палитра и автопроверки контраста и адаптива"
```

---

### Задача 2: Экран 1 — первый экран

**Файлы:**

- Изменить: `index.html` (внутрь `<main>`), добавить стили в `<style>`

**Интерфейсы:**

- Потребляет: `.wrap`, `.btn--tg`, палитру из Задачи 1.
- Отдаёт дальше: класс `.hero`, класс `.ph` (заглушка под фото заказчика),
  идентификатор `#tg` у ссылки в Телеграм, константу адреса `TG_URL`.

Заголовок обещает состояние, а не услуги. Подзаголовок закрывает «что, для
кого, почём». Кнопка одна.

- [ ] **Шаг 1: Вставить разметку первого экрана**

В `<main>`:

```html
<section class="hero">
  <div class="wrap hero__grid">
    <div>
      <p class="eyebrow">Краснодар · выезд на 2–3 дня</p>
      <h1>Два дня в горах, где от вас ничего не требуется</h1>
      <p class="lead">
        Забираем из центра города, привозим обратно. Группа до 25 человек. 17
        000 ₽.
      </p>
      <a class="btn btn--tg" id="tg" href="#" rel="noopener"
        >Написать в Телеграм</a
      >
      <p class="hero__note">
        Черновик страницы: адрес Телеграма подставим после согласования.
      </p>
    </div>
    <figure
      class="ph ph--hero"
      role="img"
      aria-label="Здесь будет фотография гор от заказчика"
    >
      <figcaption class="ph__label">Здесь фото заказчика: горы</figcaption>
    </figure>
  </div>
</section>
```

- [ ] **Шаг 2: Добавить стили первого экрана и заглушки под фото**

Заглушка рисуется кодом — градиент плюс силуэт хребта на CSS, а не серый
прямоугольник.

```css
.hero {
  padding-block: clamp(2.5rem, 7vw, 5rem) var(--step);
}
.hero__grid {
  display: grid;
  gap: var(--gap);
  align-items: center;
}
.hero__note {
  font-size: 0.875rem;
  color: var(--ink-soft);
  margin-top: 1rem;
}
.ph {
  margin: 0;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, #cfe0e6 0%, #e7dfd0 62%, #dccfb8 100%);
  border: 1px solid var(--line);
  aspect-ratio: 4/3;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.ph::before {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 62%;
  background: var(--pine);
  clip-path: polygon(
    0 100%,
    0 52%,
    16% 24%,
    29% 46%,
    44% 12%,
    62% 44%,
    74% 28%,
    100% 74%,
    100% 100%
  );
  opacity: 0.9;
}
.ph::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 38%;
  background: #24312a;
  clip-path: polygon(
    0 100%,
    0 62%,
    22% 38%,
    38% 60%,
    55% 30%,
    72% 58%,
    88% 40%,
    100% 66%,
    100% 100%
  );
}
.ph__label {
  position: relative;
  z-index: 1;
  margin: 0 0 0.9rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #3a352e;
  font-size: 0.8125rem;
  font-weight: 600;
}
@media (min-width: 768px) {
  .ph--hero {
    aspect-ratio: 3/2;
  }
}
@media (min-width: 1024px) {
  .hero__grid {
    grid-template-columns: 1.05fr 0.95fr;
    gap: clamp(2rem, 4vw, 3.5rem);
  }
  .ph--hero {
    aspect-ratio: 4/5;
  }
}
```

- [ ] **Шаг 3: Прогнать проверку**

```bash
npm run check
```

Ожидается: проверка пройдена. Если упал контраст `.hero__note` — поднять
`--ink-soft` до более тёмного и прогнать снова.

- [ ] **Шаг 4: Посмотреть глазами**

Открыть `index.html` в браузере через Playwright MCP на ширине 360 и 1280,
снять скриншот, убедиться: заголовок не рвётся посреди слова, кнопка не
прилипает к краю, заглушка под фото выглядит намеренной.

- [ ] **Шаг 5: Коммит**

```bash
git add index.html && git commit -m "Первый экран: оффер, кнопка в Телеграм, заглушка под фото гор"
```

---

### Задача 3: Экран 2 — чего здесь не будет

**Файлы:** изменить `index.html`

**Интерфейсы:** отдаёт дальше `.nots`, `.nots__item`.

Главное отличие продукта, поэтому идёт вторым — до программы. Подаётся
спокойно, без восклицаний.

- [ ] **Шаг 1: Разметка**

```html
<section class="section section--warm">
  <div class="wrap">
    <p class="eyebrow">Сначала о главном</p>
    <h2>Чего здесь не будет</h2>
    <p class="lead">
      Ни одного пункта из этого списка в поездке нет. Это не побочный эффект, а
      замысел.
    </p>
    <ul class="nots">
      <li class="nots__item">Ретрита</li>
      <li class="nots__item">Тренингов и мастер-классов</li>
      <li class="nots__item">Нетворкинга и обмена контактами</li>
      <li class="nots__item">Разбора целей и планов на год</li>
      <li class="nots__item">Психологов, коучей и наставников</li>
      <li class="nots__item">Обязательных активностей по расписанию</li>
    </ul>
  </div>
</section>
```

- [ ] **Шаг 2: Стили**

```css
.nots {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: grid;
  gap: 0.75rem;
}
.nots__item {
  position: relative;
  padding: 0.85rem 1rem 0.85rem 3rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 12px;
  font-weight: 500;
}
.nots__item::before {
  content: "";
  position: absolute;
  left: 1.15rem;
  top: 50%;
  width: 1rem;
  height: 2px;
  background: var(--ember);
  transform: translateY(-50%);
}
@media (min-width: 768px) {
  .nots {
    grid-template-columns: 1fr 1fr;
  }
}
```

- [ ] **Шаг 3: `npm run check`** — ожидается «пройдена».
- [ ] **Шаг 4: Коммит**

```bash
git add index.html && git commit -m "Экран «Чего здесь не будет»"
```

---

### Задача 4: Экран 3 — что происходит за эти дни

**Файлы:** изменить `index.html`

**Интерфейсы:** отдаёт дальше `.cards`, `.card`, `.card__icon`; набор
inline-SVG иконок 24×24 с `stroke="currentColor"` и `aria-hidden="true"`.

Пять карточек. Иконки рисуются кодом, эмодзи не используются.

- [ ] **Шаг 1: Разметка с иконками**

```html
<section class="section">
  <div class="wrap">
    <p class="eyebrow">Программа</p>
    <h2>Что происходит за эти дни</h2>
    <p class="lead">Ничего из этого не обязательно. Всё это просто есть.</p>
    <ul class="cards">
      <li class="card">
        <svg
          class="card__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M2 19 9 7l4 6 2.5-3.5L22 19z" />
          <path d="m7.5 12 2 2" />
        </svg>
        <h3>Горы</h3>
        <p>Смотреть на них. Больше ничего делать не нужно.</p>
      </li>
      <li class="card">
        <svg
          class="card__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M4 20h16" />
          <path d="M6 20v-7a6 6 0 0 1 12 0v7" />
          <path d="M9 6c0-1.5 1-2 1-3M13 6c0-1.5 1-2 1-3" />
        </svg>
        <h3>Баня</h3>
        <p>Долго и без расписания. Выходить, когда захочется.</p>
      </li>
      <li class="card">
        <svg
          class="card__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M3 6 21 11" />
          <circle cx="8" cy="9" r="1" />
          <path d="M9 13h6v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
          <path d="M12 13v-2" />
        </svg>
        <h3>Канатная дорога</h3>
        <p>Подняться наверх и постоять там подольше.</p>
      </li>
      <li class="card">
        <svg
          class="card__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M4 16h16" />
          <path d="M6 16a6 6 0 0 1 12 0" />
          <path
            d="M9 6c0 1-1 1.5-1 2.5M12 5c0 1-1 1.5-1 2.5M15 6c0 1-1 1.5-1 2.5"
          />
          <path d="M7 20h10" />
        </svg>
        <h3>Шашлыки</h3>
        <p>Готовим вместе, едим не торопясь.</p>
      </li>
      <li class="card">
        <svg
          class="card__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M4 5h11a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H9l-5 3z" />
          <path d="M18 9h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v3l-3-3" />
        </svg>
        <h3>Долгие разговоры</h3>
        <p>Те самые, на которые в будни не остаётся вечера.</p>
      </li>
    </ul>
  </div>
</section>
```

- [ ] **Шаг 2: Стили карточек**

```css
.cards {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: grid;
  gap: var(--gap);
}
.card {
  background: var(--paper-warm);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: clamp(1.25rem, 3vw, 1.75rem);
}
.card h3 {
  margin-bottom: 0.35rem;
}
.card p {
  margin: 0;
  color: var(--ink-soft);
}
.card__icon {
  width: 32px;
  height: 32px;
  color: var(--ember);
  margin-bottom: 1rem;
  stroke-linecap: round;
  stroke-linejoin: round;
}
@media (min-width: 768px) {
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1024px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
  .card:first-child {
    grid-column: span 2;
  }
}
```

- [ ] **Шаг 3: `npm run check`**
- [ ] **Шаг 4: Коммит**

```bash
git add index.html && git commit -m "Экран «Что происходит за эти дни»: карточки программы с иконками"
```

---

### Задача 5: Экран 4 — что входит в цену

**Файлы:** изменить `index.html`

**Интерфейсы:** отдаёт дальше `.price`, `.price__num`, `.incl`, `.note`.

Цена 17 000 ₽ показывается без уточнения «за человека» — в объявлении этого
нет, и додумывать нельзя. Рядом честная строка: уточняется у организатора.

- [ ] **Шаг 1: Разметка**

```html
<section class="section section--warm">
  <div class="wrap price">
    <div>
      <p class="eyebrow">Цена</p>
      <p class="price__num">17 000 ₽</p>
      <p class="note">
        Уточняем у организатора, за человека это или за выезд: в объявлении не
        сказано, а выдумывать не будем.
      </p>
    </div>
    <div>
      <h2>Что входит</h2>
      <ul class="incl">
        <li>Микроавтобус на восемь мест, забираем из центра Краснодара</li>
        <li>Жильё: уютно, тепло, по-домашнему</li>
        <li>Завтраки и ужины</li>
        <li>Прогулки и катание</li>
      </ul>
      <p class="note">
        Что оплачивается сверх этого, Иван расскажет в переписке — список ещё
        уточняется.
      </p>
    </div>
  </div>
</section>
```

- [ ] **Шаг 2: Стили**

```css
.price {
  display: grid;
  gap: var(--gap);
}
.price__num {
  font-size: clamp(2.75rem, 2rem + 4vw, 4.5rem);
  font-weight: 700;
  line-height: 1;
  margin: 0 0 0.5rem;
  letter-spacing: -0.03em;
}
.incl {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
  display: grid;
  gap: 0.7rem;
}
.incl li {
  position: relative;
  padding-left: 1.9rem;
}
.incl li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.45em;
  width: 1rem;
  height: 0.5rem;
  border-left: 2px solid var(--ember);
  border-bottom: 2px solid var(--ember);
  transform: rotate(-45deg);
}
.note {
  font-size: 0.9375rem;
  color: var(--ink-soft);
  border-left: 3px solid var(--line);
  padding-left: 0.9rem;
  margin: 0;
}
@media (min-width: 1024px) {
  .price {
    grid-template-columns: 0.8fr 1.2fr;
    gap: clamp(2rem, 5vw, 4rem);
  }
}
```

- [ ] **Шаг 3: `npm run check`**
- [ ] **Шаг 4: Коммит**

```bash
git add index.html && git commit -m "Экран «Что входит в цену»"
```

---

### Задача 6: Экран 5 — кто едет рядом

**Файлы:** изменить `index.html`

**Интерфейсы:** отдаёт дальше `.facts`, `.fact`, `.fact__num`, `.solo`.

Снимает главный барьер: ехать одному — норма.

- [ ] **Шаг 1: Разметка**

```html
<section class="section">
  <div class="wrap">
    <p class="eyebrow">Компания</p>
    <h2>Кто едет рядом</h2>
    <ul class="facts">
      <li class="fact"><span class="fact__num">5–25</span> человек в группе</li>
      <li class="fact"><span class="fact__num">20–40</span> лет участникам</li>
      <li class="fact"><span class="fact__num">2–3</span> дня в горах</li>
    </ul>
    <p class="solo">
      Ехать одному — нормально. Почти все в первый раз едут именно так.
    </p>
    <figure
      class="ph ph--wide"
      role="img"
      aria-label="Здесь будет фотография дома и бани от заказчика"
    >
      <figcaption class="ph__label">
        Здесь фото заказчика: дом и баня
      </figcaption>
    </figure>
  </div>
</section>
```

- [ ] **Шаг 2: Стили**

```css
.facts {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  display: grid;
  gap: var(--gap);
}
.fact {
  color: var(--ink-soft);
}
.fact__num {
  display: block;
  font-size: clamp(2.25rem, 1.5rem + 3vw, 3.5rem);
  font-weight: 700;
  color: var(--ink);
  line-height: 1.05;
  letter-spacing: -0.02em;
}
.solo {
  font-size: clamp(1.25rem, 1rem + 1.4vw, 1.875rem);
  font-weight: 600;
  line-height: 1.3;
  border-left: 4px solid var(--ember);
  padding-left: clamp(1rem, 2vw, 1.5rem);
  margin: 0 0 var(--gap);
  max-width: 26ch;
}
.ph--wide {
  aspect-ratio: 16/9;
  margin-top: var(--gap);
}
@media (min-width: 768px) {
  .facts {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1024px) {
  .ph--wide {
    aspect-ratio: 21/9;
  }
}
```

- [ ] **Шаг 3: `npm run check`**
- [ ] **Шаг 4: Коммит**

```bash
git add index.html && git commit -m "Экран «Кто едет рядом» и снятие барьера поездки в одиночку"
```

---

### Задача 7: Экран 6 — отзывы

**Файлы:** изменить `index.html`

**Интерфейсы:** отдаёт дальше `.rating`, `.rating__score`, `.quotes`, `.quote--empty`.

Тексты отзывов **не копируются**. Показывается проверяемая оценка со ссылкой
на источник и три явные заглушки под цитаты.

- [ ] **Шаг 1: Проверить настоящий адрес объявления**

Открыть в браузере `https://www.avito.ru/krasnodar/bilety_i_puteshestviya/skuf_tur_ne_napryagaemsya_7753483280`.
Если открывается карточка того самого объявления — подставить этот адрес в
`href`. Если нет — найти объявление поиском по номеру 7753483280 и взять
адрес из строки браузера. Пока адрес не подтверждён, кнопка остаётся
`aria-disabled="true"` с подписью «ссылку подставим после проверки»;
выдуманный адрес не подставлять ни при каких обстоятельствах.

- [ ] **Шаг 2: Разметка**

```html
<section class="section section--warm">
  <div class="wrap">
    <p class="eyebrow">Отзывы</p>
    <div class="rating">
      <p class="rating__score">5,0<span> из 5</span></p>
      <p>
        29 отзывов на Авито у компании ORDA. Оценку можно проверить самому — она
        не наша, а площадки.
      </p>
      <a
        class="btn btn--ghost"
        href="ПОДСТАВИТЬ_АДРЕС_ИЗ_ШАГА_1"
        target="_blank"
        rel="noopener nofollow"
        >Прочитать на Авито</a
      >
    </div>
    <ul class="quotes">
      <li class="quote quote--empty">
        Место под отзыв. Появится, когда организатор разрешит процитировать.
      </li>
      <li class="quote quote--empty">
        Место под отзыв. Появится, когда организатор разрешит процитировать.
      </li>
      <li class="quote quote--empty">
        Место под отзыв. Появится, когда организатор разрешит процитировать.
      </li>
    </ul>
  </div>
</section>
```

- [ ] **Шаг 3: Стили**

```css
.rating {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
  margin-bottom: 2rem;
}
.rating__score {
  font-size: clamp(3rem, 2rem + 5vw, 5rem);
  font-weight: 700;
  line-height: 1;
  margin: 0;
  letter-spacing: -0.03em;
}
.rating__score span {
  font-size: 0.28em;
  font-weight: 500;
  color: var(--ink-soft);
  margin-left: 0.4rem;
  letter-spacing: 0;
}
.quotes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--gap);
}
.quote--empty {
  border: 2px dashed var(--line);
  border-radius: 16px;
  padding: 1.5rem;
  color: var(--ink-soft);
  font-size: 0.9375rem;
  min-height: 8rem;
  display: flex;
  align-items: center;
}
@media (min-width: 768px) {
  .quotes {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Шаг 4: `npm run check`**
- [ ] **Шаг 5: Коммит**

```bash
git add index.html && git commit -m "Экран отзывов: проверяемая оценка со ссылкой и заглушки под цитаты"
```

---

### Задача 8: Экран 7 — сомнения

**Файлы:** изменить `index.html`

**Интерфейсы:** отдаёт дальше `.doubts`, `.doubt`, `.doubt__q`.

Четыре возражения, мешающие написать. Каждое — вопрос и короткий ответ.
Аккордеон не нужен: ответов мало, и прятать их от читателя вредно.

- [ ] **Шаг 1: Разметка**

```html
<section class="section">
  <div class="wrap">
    <p class="eyebrow">Сомнения</p>
    <h2>Что обычно мешает написать</h2>
    <dl class="doubts">
      <div class="doubt">
        <dt class="doubt__q">Еду один и никого не знаю</dt>
        <dd>
          Так едет большинство. К вечеру первого дня это перестаёт быть
          вопросом.
        </dd>
      </div>
      <div class="doubt">
        <dt class="doubt__q">Я не спортивный</dt>
        <dd>
          Спортивного в программе нет вообще. Максимум — прогулка в своём темпе,
          и та по желанию.
        </dd>
      </div>
      <div class="doubt">
        <dt class="doubt__q">Не люблю обязательные активности</dt>
        <dd>
          Обязательных нет ни одной. Можно весь день просидеть у печки — никто
          не придёт звать.
        </dd>
      </div>
      <div class="doubt">
        <dt class="doubt__q">А если погода подведёт</dt>
        <dd>
          Тогда баня, шашлыки и разговоры. План Б здесь мало чем отличается от
          плана А.
        </dd>
      </div>
    </dl>
  </div>
</section>
```

- [ ] **Шаг 2: Стили**

```css
.doubts {
  display: grid;
  gap: var(--gap);
  margin: 2rem 0 0;
}
.doubt {
  border-top: 1px solid var(--line);
  padding-top: 1.25rem;
}
.doubt__q {
  font-weight: 700;
  font-size: clamp(1.0625rem, 1rem + 0.4vw, 1.25rem);
  margin-bottom: 0.4rem;
}
.doubt dd {
  margin: 0;
  color: var(--ink-soft);
}
@media (min-width: 768px) {
  .doubts {
    grid-template-columns: 1fr 1fr;
    column-gap: clamp(2rem, 4vw, 3.5rem);
  }
}
```

- [ ] **Шаг 3: `npm run check`**
- [ ] **Шаг 4: Коммит**

```bash
git add index.html && git commit -m "Экран «Сомнения»: четыре ответа на то, что мешает написать"
```

---

### Задача 9: Экран 8 — финал и подвал

**Файлы:** изменить `index.html`

**Интерфейсы:** отдаёт дальше `.final`, `.footer`, `#tg2`; скрипт подстановки
адреса Телеграма в обе кнопки из одной константы.

Повтор оффера, вторая и последняя кнопка, честная строка про личную переписку.
В подвале — пометка о черновике и источник фактуры.

- [ ] **Шаг 1: Разметка**

```html
<section class="section section--dark final">
  <div class="wrap">
    <h2>Если дочитали досюда — вам, кажется, туда</h2>
    <p class="lead final__lead">
      Выезд из Краснодара на 2–3 дня. Ни ретрита, ни тренингов, ни отчётности
      перед группой.
    </p>
    <a class="btn btn--tg" id="tg2" href="#" rel="noopener"
      >Написать в Телеграм</a
    >
    <p class="final__honest">
      Часть дат и форматов Иван сообщает только в личной переписке — поэтому и
      кнопка, а не форма. Спросить быстрее.
    </p>
  </div>
</section>

<footer class="footer">
  <div class="wrap footer__grid">
    <p>
      <strong>Скуф-тур</strong><br />Организатор — компания ORDA, Краснодар.
      Контактное лицо — Иван.
    </p>
    <p class="footer__draft">
      Черновик страницы. Контакты и часть условий — заглушки до согласования с
      организатором. Страница закрыта от поисковых систем.
    </p>
    <p class="footer__src">
      Фактура взята из открытого объявления на Авито № 7753483280 от 16 июля.
    </p>
  </div>
</footer>
```

- [ ] **Шаг 2: Стили**

```css
.final__lead {
  color: #cfc6b6;
}
.final__honest {
  font-size: 0.9375rem;
  color: #b6ac9b;
  margin: 1.25rem 0 0;
  max-width: 52ch;
}
.footer {
  background: #1b1814;
  color: #cdc4b6;
  padding-block: clamp(2rem, 5vw, 3rem);
  font-size: 0.9375rem;
}
.footer p {
  margin: 0;
}
.footer strong {
  color: #f2ece1;
}
.footer__grid {
  display: grid;
  gap: 1.25rem;
}
.footer__draft {
  color: #b6ac9b;
}
.footer__src {
  color: #9a9184;
}
@media (min-width: 768px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
  }
}
```

Внимание: `.footer__src` на фоне `#1b1814` даёт контраст около 4,6 — проверка
это подтвердит. Если упадёт ниже 4,5 — осветлить до `#a9a094`.

- [ ] **Шаг 3: Скрипт подстановки адреса Телеграма**

Перед `</body>`. Адрес живёт в одном месте, обе кнопки берут его оттуда.
Пока адреса нет, кнопки честно ведут себя как неактивные, а не как сломанные.

```html
<script>
  // Подставить настоящий адрес после согласования с организатором:
  const TG_URL = "";
  for (const el of document.querySelectorAll("#tg, #tg2")) {
    if (TG_URL) {
      el.href = TG_URL;
      el.removeAttribute("aria-disabled");
    } else {
      el.href = "#";
      el.setAttribute("aria-disabled", "true");
      el.title = "Адрес Телеграма подставим после согласования";
    }
  }
</script>
```

- [ ] **Шаг 4: `npm run check`** — консоль обязана остаться чистой.
- [ ] **Шаг 5: Коммит**

```bash
git add index.html && git commit -m "Финальный экран и подвал, единая константа адреса Телеграма"
```

---

### Задача 10: Превью для мессенджеров

**Файлы:**

- Создать: `tools/make-og.mjs`, `og.png`

Превью обязано быть отдельным файлом по абсолютному адресу — иначе карточка
ссылки в Телеграме и WhatsApp не развернётся. Рисуется кодом, стоки не нужны.

- [ ] **Шаг 1: Написать генератор**

```js
import { chromium } from "playwright";

const html = `<!doctype html><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#f6f2ea;font:600 1rem ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;position:relative;overflow:hidden}
  .m{position:absolute;inset:auto 0 0 0;height:58%;background:#2f4034;clip-path:polygon(0 100%,0 54%,14% 22%,28% 48%,44% 10%,62% 46%,76% 26%,100% 72%,100% 100%)}
  .m2{position:absolute;inset:auto 0 0 0;height:34%;background:#24312a;clip-path:polygon(0 100%,0 60%,22% 34%,40% 62%,56% 28%,74% 58%,90% 38%,100% 64%,100% 100%)}
  .t{position:absolute;top:86px;left:80px;right:80px;color:#22201c}
  h1{font-size:74px;line-height:1.06;letter-spacing:-0.03em;max-width:16ch}
  p{margin-top:22px;font-size:30px;font-weight:500;color:#55504a}
</style><div class="m"></div><div class="m2"></div>
<div class="t"><h1>Два дня в горах, где от вас ничего не требуется</h1><p>Краснодар · 2–3 дня · 17 000 ₽</p></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "load" });
await page.screenshot({ path: "og.png" });
await browser.close();
console.log("og.png готов");
```

- [ ] **Шаг 2: Сгенерировать и посмотреть**

```bash
npm run og && ls -lh og.png
```

Ожидается: файл 1200×630, вес до 200 КБ. Открыть и убедиться, что заголовок
не наезжает на горы и не обрезается.

- [ ] **Шаг 3: Коммит**

```bash
git add tools/make-og.mjs og.png && git commit -m "Превью ссылки 1200×630, нарисованное кодом"
```

---

### Задача 11: Адаптив, скриншоты и полная проверка

**Файлы:** создать `tools/shot.mjs`; при необходимости править `index.html`

- [ ] **Шаг 1: Написать съёмку скриншотов**

```js
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";

mkdirSync("tools/shots", { recursive: true });
const url = pathToFileURL(resolve("index.html")).href;
const browser = await chromium.launch();
for (const w of [360, 768, 1280]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url, { waitUntil: "load" });
  await page.screenshot({ path: `tools/shots/${w}.png`, fullPage: true });
  await page.close();
  console.log(`tools/shots/${w}.png`);
}
await browser.close();
```

- [ ] **Шаг 2: Снять и просмотреть все три ширины**

```bash
npm run shot
```

Смотреть по списку: на 360 одна колонка и нет прокрутки вбок; на 768 карточки
и «сомнения» встают в две колонки; на 1280 сетка не растягивается шире 1120 px
и строки текста не длиннее ~62 символов.

- [ ] **Шаг 3: Проверить фокус с клавиатуры вживую**

Открыть страницу, нажимать Tab. Обе кнопки в Телеграм и кнопка «Прочитать на
Авито» обязаны получать заметную рамку. Порядок обхода — сверху вниз.

- [ ] **Шаг 4: Полная проверка**

```bash
npm run check
```

- [ ] **Шаг 5: Коммит**

```bash
git add tools/shot.mjs index.html && git commit -m "Съёмка скриншотов и правки адаптива по итогам просмотра"
```

---

### Задача 12: Выкладка на GitHub Pages и проверки на живом адресе

**Файлы:** без изменений в коде

Требуется вход в GitHub: сейчас `gh auth status` сообщает, что вход не
выполнен. Команду `gh auth login` выполняет владелец машины.

- [ ] **Шаг 1: Вход и создание репозитория**

```bash
gh auth login
gh repo create pyhphhddb8-eng/skuf-tur --public --source=. --remote=origin --push
```

- [ ] **Шаг 2: Включить Pages от ветки**

```bash
gh api -X POST repos/pyhphhddb8-eng/skuf-tur/pages -f source[branch]=main -f source[path]=/
```

- [ ] **Шаг 3: Дождаться публикации и проверить живой адрес**

```bash
sleep 60
curl -sI https://pyhphhddb8-eng.github.io/skuf-tur/ | head -3
curl -sI http://pyhphhddb8-eng.github.io/skuf-tur/ | head -3   # ожидается переадресация на https
curl -s https://pyhphhddb8-eng.github.io/skuf-tur/ | shasum -a 256
shasum -a 256 index.html                                        # суммы обязаны совпасть
```

- [ ] **Шаг 4: Прогнать проверки против живого адреса**

```bash
node tools/check.mjs https://pyhphhddb8-eng.github.io/skuf-tur/
curl -sI https://pyhphhddb8-eng.github.io/skuf-tur/og.png | head -3
```

- [ ] **Шаг 5: Замерить вес и скорость для карточки портфолио**

```bash
curl -s -o /dev/null -w 'вес: %{size_download} байт, полная загрузка: %{time_total} c\n' \
  https://pyhphhddb8-eng.github.io/skuf-tur/
```

Прогнать трижды, записать медиану в README.

- [ ] **Шаг 6: Проверить разворачивание карточки ссылки**

Отправить адрес себе в Телеграм и убедиться, что превью разворачивается с
картинкой и заголовком. Проверяется вживую, а не по разметке.

- [ ] **Шаг 7: Коммит**

```bash
git add README.md && git commit -m "README: живой адрес, вес страницы и время загрузки" && git push
```

---

### Задача 13: Записать итог в журнал

**Файлы:** `~/Obsidian/Brain/index.md`, `~/Obsidian/Brain/decisions.md`

- [ ] **Шаг 1:** В `Brain/index.md` — что сделано, что дальше, дата 13.09.2026.
- [ ] **Шаг 2:** В `Brain/decisions.md` — решения: один HTML-файл вместо React;
      кнопка в Телеграм вместо формы и почему это снимает 152-ФЗ; отзывы не
      копируются с Авито; алкоголь и скидка «альтушкам» в черновик не вошли.
- [ ] **Шаг 3:** Показать владельцу живой адрес и список вопросов заказчику
      из спеки — их четыре, и без ответов страница остаётся черновиком.

---

## Что останется незакрытым после плана

Это не недоработки, а то, что зависит от заказчика:

- цена за человека или за выезд;
- ближайшие открытые даты;
- что оплачивается сверх цены;
- разрешение процитировать отзывы;
- настоящий адрес Телеграма;
- фотографии гор, дома и бани вместо нарисованных заглушек;
- судьба алкоголя в программе и скидки «альтушкам».

После ответов снимаются `noindex`, заглушки и пометка о черновике.

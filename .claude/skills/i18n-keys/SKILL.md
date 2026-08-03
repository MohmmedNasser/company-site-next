---
name: i18n-keys
description: Use whenever adding, renaming, or removing any user-facing string in the Next.js site — new sections, new pages, form labels, error messages, button text, aria-labels, or metadata. Also use when a string appears hardcoded in a component during review. Covers key naming, keeping ar.json and en.json in sync, Arabic typography rules for Noto Kufi, and RTL-safe markup.
---

# Adding Translatable Strings

## Non-negotiables

1. **No hardcoded user-facing text in components.** Every string goes through `useTranslations()` or `getTranslations()`.
2. **Never edit one locale file alone.** `messages/ar.json` and `messages/en.json` are always changed in the same commit.
3. **Never use physical CSS properties.** Logical only.
4. Placeholder text, `alt` text, `aria-label`, `title`, and metadata are user-facing strings too.

## Key naming

Namespace by route, then by section, then by role. Lowercase, dot-separated.

```
<page>.<section>.<element>
```

```jsonc
{
  "home": {
    "hero": {
      "eyebrow": "...",
      "title": "...",
      "subtitle": "...",
      "cta.primary": "...",
      "cta.secondary": "...",
    },
    "services": {
      "heading": "...",
      "description": "...",
    },
  },
  "common": {
    "nav.about": "...",
    "actions.readMore": "...",
    "errors.required": "...",
  },
}
```

- Anything used on two or more pages moves to `common`.
- Keys describe **role**, not content. `home.hero.title` — never `home.hero.weBuildSoftware`.
- Keep both files in identical key order so diffs stay readable.

## Procedure

1. Add the key to `messages/en.json`.
2. Add the same key, same position, to `messages/ar.json`.
3. Consume it in the component.
4. Run the parity check (below).
5. Render both locales and confirm the layout survives the Arabic string length. Arabic is often 20–30% shorter than English, sometimes much longer — never size a container to fit one locale.

## Correct

```tsx
// src/components/sections/hero.tsx
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="ps-6 pe-6 text-start">
      <p className="text-secondary">{t("eyebrow")}</p>
      <h1>{t("title")}</h1>
      <button aria-label={t("cta.primary")}>{t("cta.primary")}</button>
    </section>
  );
}
```

## Incorrect

```tsx
// ✗ hardcoded string
<h1>We build software that ships</h1>

// ✗ physical properties — breaks in RTL
<section className="pl-6 pr-6 text-left">

// ✗ untranslated aria-label
<button aria-label="Submit form">{t("cta.primary")}</button>

// ✗ string concatenation — grammar and word order differ per language
<p>{t("results.found")} {count} {t("results.projects")}</p>
```

For counts and inserted values use ICU message format instead:

```jsonc
// en.json
{
  "portfolio": {
    "resultCount": "{count, plural, =0 {No projects} one {# project} other {# projects}}",
  },
}
```

```jsonc
// ar.json — Arabic has six plural forms; do not collapse them
{
  "portfolio": {
    "resultCount": "{count, plural, zero {لا مشاريع} one {مشروع واحد} two {مشروعان} few {# مشاريع} many {# مشروعًا} other {# مشروع}}",
  },
}
```

```tsx
<p>{t("portfolio.resultCount", { count })}</p>
```

## Arabic typography rules

Noto Kufi Arabic does not behave like Inter. These are already set globally — do not override them locally:

| Property                     | Latin     | Arabic                                                       |
| ---------------------------- | --------- | ------------------------------------------------------------ |
| `letter-spacing` on headings | `-0.03em` | `0` — negative tracking breaks connected letterforms         |
| `line-height` body           | `1.5`     | `1.8`                                                        |
| `line-height` headings       | `1.2`     | `1.4`                                                        |
| `text-transform: uppercase`  | allowed   | **never** — no case in Arabic, and it corrupts mixed strings |
| Optical size                 | baseline  | `0.95em` relative                                            |

If a design calls for an uppercase eyebrow label, apply `uppercase` under `:lang(en)` only.

## RTL checklist for the new string's container

- Padding, margin, and positioning use `ps/pe/ms/me/start/end`
- `text-start` / `text-end`, never `text-left` / `text-right`
- Directional icons (`ArrowRight`, `ChevronRight`) mirror in RTL:
  `<ArrowRight className="rtl:-scale-x-100" />`
- Non-directional icons (`Check`, `Mail`, `Search`) must **not** mirror
- `flex-row` orders itself automatically; `absolute` positioning does not — use `start-0` / `end-0`
- Numerals: keep Western digits (`123`) unless the client explicitly requests Eastern Arabic (`١٢٣`). Decide once, record it in `docs/design-decisions.md`

## Parity check

Run before committing. Fails if the two locale files disagree on any key.

```bash
node scripts/check-i18n.mjs
```

```js
// scripts/check-i18n.mjs
import { readFileSync } from "node:fs";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );

const en = flatten(JSON.parse(readFileSync("messages/en.json", "utf8")));
const ar = flatten(JSON.parse(readFileSync("messages/ar.json", "utf8")));

const missingInAr = en.filter((k) => !ar.includes(k));
const missingInEn = ar.filter((k) => !en.includes(k));

if (missingInAr.length || missingInEn.length) {
  console.error("i18n parity check failed");
  if (missingInAr.length) console.error("Missing in ar.json:", missingInAr);
  if (missingInEn.length) console.error("Missing in en.json:", missingInEn);
  process.exit(1);
}

console.log(`i18n parity OK — ${en.length} keys`);
```

Wire it into `lint-staged` so it runs on every commit that touches `messages/`.

## Writing the copy itself

Arabic copy is not a translation of the English — it is written for an Arabic reader. Machine-flavored Arabic is the fastest way to make an agency site look unprofessional to the exact clients it is targeting.

- Prefer plain verbs over formal register: «نبني» not «نقوم ببناء»
- Avoid English syntax carried into Arabic word order
- Technical terms stay in English where that is what practitioners actually say (`API`, `SEO`, `Next.js`) — do not force «واجهة برمجة التطبيقات» into body copy
- Buttons name the action and keep that name through the whole flow: `Publish` → toast `Published`; «إرسال» → «تم الإرسال»

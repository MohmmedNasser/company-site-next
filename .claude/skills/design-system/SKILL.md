---
name: design-system
description: Use whenever writing or editing CSS, Tailwind classes, component styling, or picking a color, spacing, radius, or font-size value anywhere in src/ — including one-off inline styles. Also use before adding any new color pairing to check contrast.
---

## Non-negotiable rules

1. **No raw hex, no `rgb()`, no arbitrary Tailwind color value** (`bg-[#1B1B25]`, `text-[rgb(...)]`) in any component. Every color comes from a `--color-*` semantic token, ultimately sourced from `src/styles/palette.css`. No exceptions, including "just this once for a one-off decorative element." Need a color that doesn't exist yet? Add it to `palette.css` as a hue-step entry, then map it in `tokens.css` — never inline it.
2. **Colour lives nowhere on the site except the logo mark.** This is a hard rule, not a style preference: `public/brand/codexa-mark.svg`, `codexa-lockup.svg`, and `codexa-favicon.svg` keep a fixed, hardcoded violet (`#5E6AD2`/`#6E79D6`) — never `currentColor`, never referenced from `tokens.css`. Every other component, every other pixel, is white, black, or grey. If you catch yourself reaching for `--palette-brand-500`/`400` from `tokens.css`, or `currentColor` on the logo mark specifically, stop — that is the one thing this rule exists to prevent. There is no other sanctioned accent colour anywhere in this system.
3. **No warm colors enter the palette.** Still true, still absolute — but now redundant with rule 2 in practice, since the palette has no accent hue left to warm up. `--color-warning`/`--color-error` are the sole exception, and even those are a separate, currently-unresolved question — see "Status colours" below.
4. **Elevation is a border, not a lightness step.** This replaces the old "background-layering, not shadows" rule. Cards and surfaces sit at (or within a hair of) the page background's own fill — darker than or equal to it in dark mode, lighter than or equal to it in light mode — and are separated from it, and from each other, by a low-opacity 1px border (`rgba(255,255,255,0.08–0.12)` dark, `rgba(0,0,0,0.08–0.12)` light). There is no longer a distinct "raised" fill tier: dropdowns, modals, and the command palette reuse `--color-surface` and lean on the glass/blur treatment plus literal occlusion to read as floating.
5. **Dark mode never gets a shadow; light mode gets a subtle one.** Unchanged from before — a subtle shadow is permitted in light mode only, because light mode needs edge definition shadows would otherwise be missing; shadows are still forbidden on cards in dark mode.
6. **Marketing and admin density must never mix in the same component.** See the density rule below — currently ON HOLD pending an open question, not removed.

## The token contract

Semantic variable names only — never a raw palette token (`--palette-mono-950`, `--palette-brand-500`, etc.) in a component. Raw palette values live once, grouped by hue, in `src/styles/palette.css`; every semantic token below is mapped to one of them in `src/styles/tokens.css` — see `docs/design-decisions.md`'s Colour system section for the full raw→semantic map, the measurement source, and every derivation's reasoning.

| Token                     | Dark                    | Light             | Role                                                                                                                                                                                  |
| ------------------------- | ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-bg`              | `#0A0A0A`               | `#FAFAFA`         | App/page background, deepest layer                                                                                                                                                    |
| `--color-card`            | `#050505`               | `#FFFFFF`         | Card backgrounds. Same fill as `--color-surface` — separated from `--color-bg` by border, not lightness                                                                               |
| `--color-surface`         | `#050505`               | `#FFFFFF`         | Elevated panels — same fill as card; see rule 4                                                                                                                                       |
| `--color-surface-raised`  | `#050505`               | `#FFFFFF`         | Dropdowns, modals, popovers — same fill again; these lean on glass/blur + occlusion, not a lighter tier, to read as floating                                                          |
| `--color-border`          | `rgba(255,255,255,.10)` | `rgba(0,0,0,.10)` | The ENTIRE separation mechanism between bg/card/surface — an almost-invisible 1px line, not a decoration                                                                              |
| `--color-text-primary`    | `#FFFFFF`               | `#0A0A0A`         | Headings, primary body text                                                                                                                                                           |
| `--color-text-secondary`  | `#9A9A9A`               | `#666666`         | Descriptions, metadata, placeholders — AA-checked, see below                                                                                                                          |
| `--color-text-decorative` | `#3A3A3A`               | `#C4C4C4`         | Large, intentionally low-contrast decorative numbers ONLY. Never body/UI text — see the exemption below                                                                               |
| `--color-primary`         | `#FFFFFF`               | `#0A0A0A`         | The CTA fill and focus-ring colour. Flips per theme to whichever extreme is "solid" against that theme's background — this is NOT the same physical colour in both themes anymore     |
| `--color-primary-hover`   | `#E5E5E5`               | `#1A1A1A`         | Hover/pressed state for primary                                                                                                                                                       |
| `--color-on-primary`      | `#0A0A0A`               | `#FFFFFF`         | Text/icons painted directly on `--color-primary` or `--color-primary-hover`. Flips per theme along with `--primary` — do not assume it's theme-invariant the way the old system's was |
| `--color-secondary`       | `#9A9A9A`               | `#666666`         | Secondary highlights, hover accents, gradient endpoints (reuses text-secondary's value — there's no separate hue to draw a second accent from any more)                               |
| `--color-success`         | `#3DD68C`               | `#1FA968`         | Completed/passing states — still colour, see "Status colours" below                                                                                                                   |
| `--color-warning`         | `#F0C000`               | `#B88A00`         | In-progress/attention states — still colour                                                                                                                                           |
| `--color-error`           | `#EB5757`               | `#D13B3B`         | Urgent/error/destructive states — still colour                                                                                                                                        |

**Rebranding is still a one-file change: `src/styles/palette.css`.** `tokens.css` contains zero hex literals; components contain zero hex literals. The one asterisk: the logo mark's two hex values are quarantined in their own commented-off section of `palette.css`, explicitly NOT wired to any semantic token — a future rebrand changes every `--palette-mono-*` value and leaves the logo exactly as it is, on purpose.

## Type scale

Unchanged from before. 11px through 40px is the dense-UI scale; 48/64/80px are a marketing-only extension (40px cannot carry a hero); 96/120px are a second, later marketing-only extension for a one-word-per-line mega headline treatment — reserve them for that treatment specifically, not as general-purpose bigger headings. Admin UI must stay within 11–40px.

| Size  | Role                                                       |
| ----- | ---------------------------------------------------------- |
| 11px  | Shortcut hints, overline labels                            |
| 12px  | Metadata, small labels                                     |
| 13px  | Small body text, nav items                                 |
| 14px  | Body text, issue/list-item titles                          |
| 16px  | h5, panel titles                                           |
| 20px  | h4, view titles                                            |
| 24px  | h3, page titles                                            |
| 32px  | h2, settings headers                                       |
| 40px  | h1, admin landing headers                                  |
| 48px  | Marketing subsection headline                              |
| 64px  | Marketing hero headline (desktop)                          |
| 80px  | Marketing hero headline (large desktop / display only)     |
| 96px  | Mega headline, one word per line (tablet/mid-desktop step) |
| 120px | Mega headline, one word per line (large desktop)           |

**Reproducing the reference's bold/large-number/gradient effects without a new font:** Inter Display is loaded at 400/500/600 only (`src/app/fonts.ts`) — there is no 700/800 face. Use `font-semibold` (600) for the heaviest available weight; never `font-bold` (700) or heavier, which has no matching face and either falls back or renders synthetically bolded. Large decorative numbers use the 96/120px scale (or `--color-text-decorative` for the intentionally faded ones, see below) — not a new size, not a new font. A white-to-transparent heading effect is a `background-clip: text` gradient from `--color-text-primary` to transparent, a CSS technique, not a font dependency.

## Spacing scale

Unchanged. Base unit is 1px (`--spacing: 1px` in `tokens.css`'s `@theme` block), so numeric utility classes equal literal pixels — `p-16` means 16px, matching `--radius-card: 8px` and `--text-32: 32px`'s literal-value convention.

| Scope                     | Values                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| Original (admin + shared) | 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px                               |
| Marketing extension       | 80, 96, 128, 160px — section-level rhythm only, never component padding |

## Radius scale

Unchanged.

| Radius | Token              | Used for                                                     |
| ------ | ------------------ | ------------------------------------------------------------ |
| 4px    | `--radius-chip`    | Chips, inline labels, small badges                           |
| 6px    | `--radius-control` | Buttons, inputs, dropdown items                              |
| 8px    | `--radius-card`    | Cards, panels, sidebar nav items, dropdown menus             |
| 12px   | `--radius-modal`   | Modals, command palette, settings panels                     |
| 9999px | `--radius-full`    | Status circles, avatar circles, keyboard-shortcut containers |

## Duration tokens

Unchanged.

| Token                    | Value | Used for                                        |
| ------------------------ | ----- | ----------------------------------------------- |
| `--duration-micro`       | 150ms | Hover, focus, buttons — every micro-interaction |
| `--duration-reveal`      | 500ms | Scroll-reveal entrances                         |
| `--duration-reveal-slow` | 700ms | Larger/slower scroll-reveal entrances           |

## The density rule — ON HOLD

Marketing pages use the extended type/spacing scale and 400–700ms scroll-reveal motion; 150ms is still correct for their own micro-interactions. **Whether the admin panel (Phase 12-13, not yet built) follows the original dense 11–40px/2–64px/150ms-only spec, adopts this monochrome system, or something else, is an explicit open question — not decided.** See `docs/design-decisions.md`'s open-question section. Until that's resolved: still never mix a marketing-scale value (48px+ type, 80px+ spacing, 400ms+ motion) into a component you know is admin-bound, but don't assume the admin panel is colour-locked to violet either — check the open question before starting Phase 12.

**Bundled into the same open question:** `--color-success`/`--color-warning`/`--color-error` staying colour. `StatusCircle` (backlog/todo/in-progress/done/cancelled) is issue-tracker language belonging conceptually to the admin panel, and today is used on no built marketing page. Don't recolour it to monochrome pre-emptively, and don't treat its current colour as permanent either — it's parked, not decided.

## Contrast requirements

**Real body and UI text: WCAG AA, no exceptions.** 4.5:1 for body text, 3:1 for large text (≥24px, or ≥19px bold). This covers `--color-text-primary`, `--color-text-secondary`, `--color-on-primary`, and any new text/background pairing you introduce.

**`--color-text-decorative` is explicitly exempt.** It exists for large, intentionally low-contrast decorative numbers (a giant, faded step-number behind a card, for example) — its entire purpose is to sit under the 3:1 large-text floor, reading as a background texture rather than as information. Never wire real content, a heading, or anything a user needs to read into this token, and never hold it to the AA bar in review — that would defeat the one thing it's for.

- Use the browser's built-in contrast checker: in Chrome or Firefox DevTools, click a color swatch on the element's computed styles — it shows the ratio against the pixel behind it and flags AA/AAA pass/fail directly.
- Or read it straight off `/styleguide`'s own contrast table (§2), which computes ratios live from the actually-resolved CSS custom properties — not a hardcoded number that can drift from the real tokens.
- If a pairing fails AA, don't lighten/darken it ad hoc — check `docs/design-decisions.md`'s Colour system section for the already-derived value first; if the pairing still isn't covered, that's a new decision record, not a one-line fix in a component.
- **3-digit hex gotcha:** browsers may serialize a resolved custom property as shorthand (`#fff` for a declared `#ffffff`) — far more likely to bite you now that pure white/black are load-bearing tokens instead of an occasional accent. Any hand-rolled contrast/colour-parsing code must expand 3-digit hex before parsing (`Silk.jsx` and the styleguide's `hexToRgb` both do this — copy that pattern, don't rediscover the bug).

## The section-label primitive

Every new hand-built marketing section opens with `src/components/ui/section-label.tsx`: a bracketed index, the section name, and a thin divider filling the rest of the row (`[01]  Services ─────────`). This is the system's core repeating identity element — not optional decoration, use it, don't build a bespoke section header instead.

It's logical/RTL-correct by construction, not by special-casing: a plain `flex` row reorders itself for reading direction automatically (no `rtl:` variant needed), and literal `[`/`]` characters mirror automatically under the Unicode bidi algorithm in an RTL context. The only per-locale input is the translated section-name text passed as `children`.

## Procedure

1. Identify which density context you're in — marketing or admin — before choosing any value. If admin and colour is involved, check the open question above first; don't assume monochrome OR violet.
2. Pick every color from the token table above. If the color you need isn't in the table, that's a signal to stop and ask, not to reach for a hex value. If what you're building is a new accent or highlight anywhere except the logo mark, that's not a token gap — re-read rule 2.
3. Pick every spacing, radius, and type-scale value from the scale for your density context.
4. Opening a new section? Start with `SectionLabel`.
5. If this introduces a color pairing that doesn't already exist elsewhere in the codebase, verify contrast (see above) before committing — unless it's explicitly decorative and routed through `--color-text-decorative`.
6. Confirm no `box-shadow` was added to a dark-mode card, and that any new elevation is expressed as a border change, not a fill change.

## Wrong / right

❌ Wrong — raw hex, a new accent colour, shadow on a dark card:

```tsx
<div className="rounded-[6px] bg-[#1B1B25] p-[18px] shadow-lg">
  <p className="text-[#5E6AD2]">Shipped 3 days ago</p>
</div>
```

✅ Right — tokens only, no shadow, no colour outside the logo:

```tsx
<div className="bg-surface rounded-control p-16 dark:shadow-none">
  <p className="text-text-secondary">Shipped 3 days ago</p>
</div>
```

❌ Wrong — the logo mark going `currentColor` so it "matches the theme":

```tsx
<svg className="text-text-primary">
  <path stroke="currentColor" d="..." />
</svg>
```

✅ Right — the logo mark's colour is fixed, not theme-reactive:

```tsx
<Image src="/brand/codexa-mark.svg" alt="logo" width={40} height={40} />
```

The token layer is three files with a strict one-way dependency:

- **`src/styles/palette.css`** — raw hex literals only, named by hue and step (`--palette-mono-950`, `--palette-mono-450`, ...), plus the quarantined logo-only violet section. No mapping, no logic, no `@theme` wrapper (so Tailwind never generates a utility straight from a raw value — there's no `bg-mono-950` to reach for). **This is the only file to touch to rebrand the site** (the logo excepted, by design).
- **`src/styles/tokens.css`** — mapping only. A `@theme` block for the static, theme-independent scales (type, spacing, radius, duration, fonts), plus `:root` / `.dark` blocks where every semantic token (`--bg`, `--primary`, ...) is a `var()` pointing into `palette.css`. Zero hex literals; a hex literal appearing here is a bug.
- **`src/app/globals.css`** — wiring only: the three `@import`s (`tailwindcss`, `../styles/palette.css`, `../styles/tokens.css`), `@custom-variant dark`, the `@theme inline` block that maps `--color-*` to the runtime variables from `tokens.css`, and base/bilingual styles.

`@theme inline` (not plain `@theme`) is what makes the semantic mapping work: plain `@theme` would resolve `var(--bg)` once at build time and freeze every token on the light value, since `.dark` is never active mid-build. `@theme inline` keeps the reference live, so `bg-bg`, `text-text-secondary`, etc. re-resolve against whichever of `tokens.css`'s `:root` / `.dark` is actually applied at paint time.

## Pre-commit checklist

- [ ] No hex literal, `rgb()`, or arbitrary Tailwind color value anywhere in the diff — except the three logo SVGs
- [ ] No new colour introduced anywhere except the logo mark
- [ ] Every spacing/radius/type value comes from the scale for the correct density context (marketing vs. admin — not mixed)
- [ ] No `box-shadow` added to a dark-mode card; new elevation is a border change, not a fill change
- [ ] Any new color pairing checked against WCAG AA (unless routed through `--color-text-decorative`) and, if it's genuinely new, recorded in `docs/design-decisions.md`
- [ ] New section? Opens with `SectionLabel`

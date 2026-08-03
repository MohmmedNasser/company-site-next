---
name: design-system
description: Use whenever writing or editing CSS, Tailwind classes, component styling, or picking a color, spacing, radius, or font-size value anywhere in src/ — including one-off inline styles. Also use before adding any new color pairing to check contrast.
---

## Non-negotiable rules

1. **No raw hex, no `rgb()`, no arbitrary Tailwind color value** (`bg-[#1B1B25]`, `text-[rgb(...)]`) in any component. Every color comes from a `--color-*` semantic token, ultimately sourced from `src/styles/palette.css`. No exceptions, including "just this once for a one-off decorative element." Need a color that doesn't exist yet? Add it to `palette.css` as a hue-step entry, then map it in `tokens.css` — never inline it.
2. **Violet is an accent, never a large fill.** It marks selection, focus, primary actions, and small highlights. It must never cover a hero background, a full section, or a large card.
3. **No warm colors enter the palette.** The system is deliberately cool-toned — don't introduce oranges, warm yellows, or reds outside the defined `--color-warning` / `--color-error` tokens.
4. **Dark mode uses background-layering, not shadows.** Elevation is expressed by moving up the surface scale (`--color-bg` → `--color-surface` → `--color-surface-raised`), not by adding `box-shadow`. Shadows are forbidden on cards in dark mode; a subtle shadow is permitted in light mode only, because light mode needs edge definition shadows would otherwise be missing.
5. **Marketing and admin density must never mix in the same component.** See the density rule below.

## The token contract

Semantic variable names only — never the raw violet-issue-DESIGN.md hex values directly, and never the raw palette tokens (`--palette-brand-500`, `--palette-neutral-950`, etc.) either. Raw palette values live once, grouped by hue, in `src/styles/palette.css`; every semantic token below is mapped to one of them in `src/styles/tokens.css` — see `docs/design-decisions.md` §6–7 for the full raw→semantic map and the reasoning behind the split.

| Token                    | Dark      | Light     | Role                                                    |
| ------------------------ | --------- | --------- | ------------------------------------------------------- |
| `--color-bg`             | `#101014` | `#FAFAFC` | App/page background, deepest layer                      |
| `--color-card`           | `#1B1B25` | `#FFFFFF` | Card backgrounds ("Neutral / Card")                     |
| `--color-surface`        | `#1F1F2E` | `#F3F3F7` | Elevated panels, distinct from card                     |
| `--color-surface-raised` | `#252536` | `#EBEBF2` | Dropdowns, modals, popovers, command palette            |
| `--color-border`         | `#2C2C3A` | `#E2E2EA` | Dividers, input borders, panel edges                    |
| `--color-text-primary`   | `#F1F1F4` | `#16161C` | Headings, primary body text                             |
| `--color-text-secondary` | `#8A8F98` | `#61656E` | Descriptions, metadata, placeholders                    |
| `--color-primary`        | `#5E6AD2` | `#4E5BBF` | Primary actions, selected states, focus rings           |
| `--color-primary-hover`  | `#4E5BBF` | `#404BA5` | Hover/pressed state for primary interactions            |
| `--color-secondary`      | `#6E79D6` | `#5B68C3` | Secondary highlights, hover accents, gradient endpoints |
| `--color-success`        | `#3DD68C` | `#1FA968` | Completed/passing states                                |
| `--color-warning`        | `#F0C000` | `#B88A00` | In-progress/attention states                            |
| `--color-error`          | `#EB5757` | `#D13B3B` | Urgent/error/destructive states                         |

`--color-primary` is darkened in light mode versus the source violet — the raw `#5E6AD2` fails AA body-text contrast on white. `--color-secondary`'s light value is derived the same way (violet-issue-DESIGN.md only defines Secondary for dark). See `docs/design-decisions.md` §2 and §6 for both derivations.

**Resolved (was an open point through Phase 0):** `--color-card` now has its own token, distinct from `--color-surface` — Phase 1 gave the "Neutral / Card" role a dedicated slot instead of folding it into surface.

## Type scale

11px through 40px is the original Violet Issue scale; 48/64/80px are a marketing-only extension (§1.2 deviation — 40px cannot carry a hero). Admin UI must stay within 11–40px.

| Size | Role                                                   |
| ---- | ------------------------------------------------------ |
| 11px | Shortcut hints, overline labels                        |
| 12px | Metadata, small labels                                 |
| 13px | Small body text, nav items                             |
| 14px | Body text, issue/list-item titles                      |
| 16px | h5, panel titles                                       |
| 20px | h4, view titles                                        |
| 24px | h3, page titles                                        |
| 32px | h2, settings headers                                   |
| 40px | h1, admin landing headers                              |
| 48px | Marketing subsection headline                          |
| 64px | Marketing hero headline (desktop)                      |
| 80px | Marketing hero headline (large desktop / display only) |

## Spacing scale

Tailwind's default spacing base unit is `0.25rem` (`p-16` would render 64px). This project redefines `--spacing: 1px` in `src/styles/tokens.css`'s `@theme` block so numeric utility classes equal literal pixels throughout — `p-16` means 16px, matching `--radius-card: 8px` and `--text-32: 32px`'s literal-value convention. Base unit is 1px; every value below is both the design-scale label and the exact class number to use.

| Scope                     | Values                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| Original (admin + shared) | 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px                               |
| Marketing extension       | 80, 96, 128, 160px — section-level rhythm only, never component padding |

## Radius scale

| Radius | Token              | Used for                                                     |
| ------ | ------------------ | ------------------------------------------------------------ |
| 4px    | `--radius-chip`    | Chips, inline labels, small badges                           |
| 6px    | `--radius-control` | Buttons, inputs, dropdown items                              |
| 8px    | `--radius-card`    | Cards, panels, sidebar nav items, dropdown menus             |
| 12px   | `--radius-modal`   | Modals, command palette, settings panels                     |
| 9999px | `--radius-full`    | Status circles, avatar circles, keyboard-shortcut containers |

## Duration tokens

| Token                    | Value | Used for                                        |
| ------------------------ | ----- | ----------------------------------------------- |
| `--duration-micro`       | 150ms | Hover, focus, buttons — every micro-interaction |
| `--duration-reveal`      | 500ms | Scroll-reveal entrances                         |
| `--duration-reveal-slow` | 700ms | Larger/slower scroll-reveal entrances           |

## The density rule

- **Marketing pages** (everything under the public site) use the extended type/spacing scale above and 400–700ms scroll-reveal motion. 150ms is still correct for their own micro-interactions (hover, focus, buttons).
- **The admin panel** is the one place that follows the _original_ Violet Issue spec exactly: 32px controls, 36px rows, 150ms motion for everything (no 400–700ms reveals), 11–40px type scale only, 2–64px spacing only.
- Never import or reuse a marketing-scale value (48px+ type, 80px+ spacing, 400ms+ motion) inside an admin component, or vice versa. If a component needs both contexts, it needs two components, not one with a density prop.

## Procedure

1. Identify which density context you're in — marketing or admin — before choosing any value.
2. Pick every color from the token table above. If the color you need isn't in the table, that's a signal to stop and ask, not to reach for a hex value.
3. Pick every spacing, radius, and type-scale value from the scale for your density context.
4. If this introduces a color pairing (text-on-background, chip-on-surface, etc.) that doesn't already exist elsewhere in the codebase, verify contrast (see below) before committing.
5. Confirm no `box-shadow` was added to a dark-mode card.

## Wrong / right

❌ Wrong — raw hex, arbitrary values, shadow on a dark card:

```tsx
<div className="rounded-[6px] bg-[#1B1B25] p-[18px] shadow-lg">
  <p className="text-[#8A8F98]">Shipped 3 days ago</p>
</div>
```

✅ Right — tokens only, no shadow, values from the scale:

```tsx
<div className="bg-surface rounded-control p-16 dark:shadow-none">
  <p className="text-text-secondary">Shipped 3 days ago</p>
</div>
```

The token layer is three files with a strict one-way dependency:

- **`src/styles/palette.css`** — raw hex literals only, named by hue and step (`--palette-brand-500`, `--palette-neutral-950`, ...). No mapping, no logic, no `@theme` wrapper (so Tailwind never generates a utility straight from a raw value — there's no `bg-brand-500` to reach for). **This is the only file to touch to rebrand the site.**
- **`src/styles/tokens.css`** — mapping only. A `@theme` block for the static, theme-independent scales (type, spacing, radius, duration, fonts), plus `:root` / `.dark` blocks where every semantic token (`--bg`, `--primary`, ...) is a `var()` pointing into `palette.css`. Zero hex literals; a hex literal appearing here is a bug.
- **`src/app/globals.css`** — wiring only: the three `@import`s (`tailwindcss`, `../styles/palette.css`, `../styles/tokens.css`), `@custom-variant dark`, the `@theme inline` block that maps `--color-*` to the runtime variables from `tokens.css`, and base/bilingual styles.

`@theme inline` (not plain `@theme`) is what makes the semantic mapping work: plain `@theme` would resolve `var(--bg)` once at build time and freeze every token on the light value, since `.dark` is never active mid-build. `@theme inline` keeps the reference live, so `bg-bg`, `text-text-secondary`, etc. re-resolve against whichever of `tokens.css`'s `:root` / `.dark` is actually applied at paint time.

**Rebranding is a one-file change: `src/styles/palette.css`.** `tokens.css` contains zero hex literals. Components contain zero hex literals. Need a color that doesn't exist? Add it to `palette.css` as a hue-step entry, then map it in `tokens.css`. Never inline it. Palette entries are named by hue and step, never by role — see `docs/design-decisions.md` §7.

## Verifying contrast before committing a new color pairing

- Threshold: 4.5:1 for body text, 3:1 for large text (≥24px, or ≥19px bold) — WCAG AA.
- Use the browser's built-in contrast checker: in Chrome or Firefox DevTools, click a color swatch on the element's computed styles — it shows the ratio against the pixel behind it and flags AA/AAA pass/fail directly.
- If a pairing fails AA, don't lighten/darken it ad hoc — check `docs/design-decisions.md` §2 for the already-derived light-mode values first; if the pairing still isn't covered, that's a new decision record, not a one-line fix in a component.

## Pre-commit checklist

- [ ] No hex literal, `rgb()`, or arbitrary Tailwind color value anywhere in the diff
- [ ] Every spacing/radius/type value comes from the scale for the correct density context (marketing vs. admin — not mixed)
- [ ] No `box-shadow` added to a dark-mode card
- [ ] Violet (`--color-primary`) is not used as a large background fill
- [ ] Any new color pairing checked against WCAG AA and, if it's genuinely new, recorded in `docs/design-decisions.md`

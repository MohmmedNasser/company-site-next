---
name: design-system
description: Use whenever writing or editing CSS, Tailwind classes, component styling, or picking a color, spacing, radius, or font-size value anywhere in src/ — including one-off inline styles. Also use before adding any new color pairing to check contrast.
---

## Non-negotiable rules

1. **No raw hex, no `rgb()`, no arbitrary Tailwind color value** (`bg-[#1B1B25]`, `text-[rgb(...)]`) in any component. Every color comes from a `--color-*` token defined in `@theme` (Phase 1, `src/app/globals.css`). No exceptions, including "just this once for a one-off decorative element."
2. **Violet is an accent, never a large fill.** It marks selection, focus, primary actions, and small highlights. It must never cover a hero background, a full section, or a large card.
3. **No warm colors enter the palette.** The system is deliberately cool-toned — don't introduce oranges, warm yellows, or reds outside the defined `--color-warning` / `--color-error` tokens.
4. **Dark mode uses background-layering, not shadows.** Elevation is expressed by moving up the surface scale (`--color-bg` → `--color-surface` → `--color-surface-raised`), not by adding `box-shadow`. Shadows are forbidden on cards in dark mode; a subtle shadow is permitted in light mode only, because light mode needs edge definition shadows would otherwise be missing.
5. **Marketing and admin density must never mix in the same component.** See the density rule below.

## The token contract

Semantic variable names only — never the raw violet-issue-DESIGN.md hex values directly.

| Token                    | Dark      | Light     | Role                                          |
| ------------------------ | --------- | --------- | --------------------------------------------- |
| `--color-bg`             | `#101014` | `#FAFAFC` | App/page background, deepest layer            |
| `--color-surface`        | `#1F1F2E` | `#F3F3F7` | Card backgrounds, elevated panels             |
| `--color-surface-raised` | `#252536` | `#EBEBF2` | Dropdowns, modals, popovers, command palette  |
| `--color-border`         | `#2C2C3A` | `#E2E2EA` | Dividers, input borders, panel edges          |
| `--color-text-primary`   | `#F1F1F4` | `#16161C` | Headings, primary body text                   |
| `--color-text-secondary` | `#8A8F98` | `#61656E` | Descriptions, metadata, placeholders          |
| `--color-primary`        | `#5E6AD2` | `#4E5BBF` | Primary actions, selected states, focus rings |
| `--color-primary-hover`  | `#4E5BBF` | `#404BA5` | Hover/pressed state for primary interactions  |
| `--color-success`        | `#3DD68C` | `#1FA968` | Completed/passing states                      |
| `--color-warning`        | `#F0C000` | `#B88A00` | In-progress/attention states                  |
| `--color-error`          | `#EB5757` | `#D13B3B` | Urgent/error/destructive states               |

`--color-primary` is darkened in light mode versus the source violet — the raw `#5E6AD2` fails AA body-text contrast on white. See `docs/design-decisions.md` §2 for the full derivation.

> **Open point, not yet resolved:** `violet-issue-DESIGN.md`'s original palette has a fourth elevation role, "Neutral / Card" (`#1B1B25` dark / `#FFFFFF` light), distinct from `--color-surface`. This 11-token contract has no dedicated slot for it. Until Phase 1 decides otherwise, card backgrounds use `--color-surface`. If a project maintainer decides a dedicated card token is needed, add it there — don't invent one ad hoc in a component.

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

Base unit is 4px throughout.

| Scope                     | Values                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| Original (admin + shared) | 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px                               |
| Marketing extension       | 80, 96, 128, 160px — section-level rhythm only, never component padding |

## Radius scale

| Radius | Token                                    | Used for                                                     |
| ------ | ---------------------------------------- | ------------------------------------------------------------ |
| 4px    | `--radius-chip`                          | Chips, inline labels, small badges                           |
| 6px    | `--radius-control`                       | Buttons, inputs, dropdown items                              |
| 8px    | `--radius-card`                          | Cards, panels, sidebar nav items, dropdown menus             |
| 12px   | `--radius-modal`                         | Modals, command palette, settings panels                     |
| 9999px | _(none — use Tailwind's `rounded-full`)_ | Status circles, avatar circles, keyboard-shortcut containers |

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

Tailwind v4 generates `bg-surface`, `text-text-secondary`, etc. automatically from any `--color-*` key defined under `@theme` in `src/app/globals.css` — there is no separate mapping step to maintain.

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

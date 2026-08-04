# Design Decisions

Decision records for every place this project deviates from, or resolves an
ambiguity in, `violet-issue-DESIGN.md`. Each entry exists so a choice is made
once and not relitigated in a later session.

---

## 1. Design system deviations

**Decision:** Adopt the full Violet Issue palette, type system, and radii
as-is, but extend five specific areas for a marketing site instead of the
dense application UI the system was designed for.

| Item            | Original spec      | Marketing adaptation                                                               | Why                                                                 |
| --------------- | ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Type scale      | 11–40px            | add 48 / 64 / 80px                                                                 | 40px cannot carry a hero                                            |
| Spacing         | up to 64px         | add 80 / 96 / 128 / 160px                                                          | section rhythm                                                      |
| Motion duration | ≤150ms             | 150ms for micro-interactions (hover, focus, buttons); 400–700ms for scroll reveals | the original rule targets micro-interactions, not section entrances |
| Container       | full viewport      | `max-w-[1280px]` with gutters                                                      | readable measure                                                    |
| Shadows         | forbidden on cards | still forbidden in dark; subtle in light                                           | light mode needs edge definition                                    |

**Rationale:** Violet Issue was written for a dense, dark, 36px-row
application UI. A marketing site needs headline sizes, section breathing
room, and motion that reads as intentional rather than snappy. Everything
else in the system — palette, Inter/JetBrains Mono, radii, no-shadow dark
mode, violet-as-accent-only — is kept unchanged because it _is_ the brand.

**Rejected alternatives:**

- Applying the original spec unmodified to the marketing site — rejected
  because 40px headings and 150ms-only motion cannot carry a hero section.
- Designing a separate, unrelated visual system for marketing pages —
  rejected because it would break the identity link to the admin panel and
  double the design surface to maintain.

**Binding rule:** the admin panel is the exception — it is built against the
_original_ dense spec (32px controls, 36px rows, 150ms motion, command
palette). The marketing and admin scales must never be mixed in the same
component.

---

## 2. Light mode palette

**Decision:** Derive a light-mode counterpart for every dark-mode role in
the source design system, darkening `Primary` for AA contrast on white.

| Role           | Dark (from spec) | Light (derived)                      |
| -------------- | ---------------- | ------------------------------------ |
| Background     | `#101014`        | `#FAFAFC`                            |
| Neutral / Card | `#1B1B25`        | `#FFFFFF`                            |
| Surface        | `#1F1F2E`        | `#F3F3F7`                            |
| Surface Raised | `#252536`        | `#EBEBF2`                            |
| Border         | `#2C2C3A`        | `#E2E2EA`                            |
| Text Primary   | `#F1F1F4`        | `#16161C`                            |
| Text Secondary | `#8A8F98`        | `#61656E`                            |
| Primary        | `#5E6AD2`        | `#4E5BBF` (darkened for AA on white) |
| Primary Hover  | `#4E5BBF`        | `#404BA5`                            |
| Success        | `#3DD68C`        | `#1FA968`                            |
| Warning        | `#F0C000`        | `#B88A00`                            |
| Error          | `#EB5757`        | `#D13B3B`                            |

**Rationale:** `violet-issue-DESIGN.md` only defines a dark palette — it is
written for a dense app UI, not a bilingual marketing site that needs a
light mode. Every dark role was mapped to a light counterpart that
preserves the same semantic role and relative contrast relationship, with
`Primary` specifically darkened because the source violet fails AA body-text
contrast on a white background.

**Rejected alternatives:**

- Dark mode only — rejected; a marketing site's default-visit experience
  should not force dark mode on visitors who prefer light.
- Reusing the dark-mode hex values directly on light surfaces — rejected;
  fails WCAG AA (4.5:1 body, 3:1 large text) for several pairs, most notably
  `Primary` text/borders on white.

**Verification requirement:** every text/background pair in this table must
be checked against WCAG AA (4.5:1 body, 3:1 large text) before it is wired
into `@theme` tokens in Phase 1.

---

## 3. Arabic typography rules

**Decision:** Load Inter for Latin script and Noto Kufi Arabic for Arabic
script, and apply distinct typographic rules per script rather than reusing
Inter's rules for Arabic text.

| Property                     | Latin (Inter) | Arabic (Noto Kufi) | Reason                                                                                            |
| ---------------------------- | ------------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| `letter-spacing` on headings | `-0.03em`     | `0`                | negative tracking damages connected Arabic letterforms                                            |
| `line-height` body           | `1.5`         | `1.8`              | Kufi ascenders/descenders and diacritics need vertical room                                       |
| Optical size                 | baseline      | `0.95em` relative  | Kufi renders visually larger at the same px value                                                 |
| Uppercase transforms         | allowed       | never              | Arabic has no case; `text-transform` is a no-op that only breaks Latin fallbacks in mixed strings |

**Rationale:** Noto Kufi Arabic is a geometric, architectural typeface that
behaves differently from Inter at the same pixel values. Applying Inter's
tracking and line-height rules to Arabic text would compress connected
letterforms and crowd diacritics. Selected via `:lang(ar)` so the rule
applies regardless of route structure.

**Rejected alternatives:**

- A single shared type-rule set for both scripts — rejected; directly causes
  the letterform and vertical-rhythm problems above.
- A humanist Arabic face to better match Inter's warmth — rejected; Kufi's
  geometric, architectural style suits the engineered feel of the violet
  system better, and the Arabic version of the site is allowed to feel
  slightly more monumental than the English one.

---

## 4. Hero background

**Decision:** reactbits `Threads`, with a static CSS gradient fallback for
mobile and `prefers-reduced-motion`.

**Rationale:** `Threads` provides real cursor interaction via
`enableMouseInteraction`, its thin animated lines bend toward the cursor
without competing with headline contrast, and its `ogl` dependency is
significantly lighter than a `three.js`-based alternative.

**Rejected alternatives:**

- `LiquidEther` — genuine fluid simulation, the strongest visual "wow", but
  runs on `three.js` and its GPU cost is too high for a marketing hero.
- `Iridescence` — cheap and `ogl`-based, but its mouse response is too
  subtle to read as intentional interaction.
- `Plasma` — has real perf controls, but its motion competes with the
  headline for attention.

**Mobile and reduced-motion fallback:** static CSS gradient — never a black
rectangle, and never WebGL below 768px or under
`prefers-reduced-motion: reduce`.

---

## 5. Numerals

**Decision:** Western digits (`123`) in both the Arabic and English
locales — Eastern Arabic-Indic numerals (`١٢٣`) are not used anywhere on the
site.

**Rationale:** consistency across locales for prices, dates, and stats
avoids a second numeral system to design, test, and maintain, and Western
digits are the norm on Arabic tech/software marketing sites in this sector.

**Rejected alternatives:**

- Eastern Arabic-Indic numerals in the Arabic locale — rejected; adds a
  second numeral system to maintain for no clear audience benefit on a
  software-agency site.
- Numeral system following the OS/browser locale automatically — rejected;
  unpredictable rendering across environments and untestable as a fixed
  design decision.

## Translation ownership

Two sources, split by nature of the string:

1. **UI chrome → messages/{ar,en}.json**, changed only by deploy.
   Nav, buttons, form labels, validation, empty states, 404, aria-labels.
2. **Content → database, edited in the admin panel**, stored as
   {ar, en} JSON columns.
   Services, projects, testimonials, clients, posts, contact details, plus a
   fixed whitelist of section copy in the settings table (hero title/subtitle/
   CTAs, and heading + description for each home section).

Rule: "would the client change this themselves?" → database.
"would changing this be a bug?" → code.

Rejected: making every string editable. Each editable string costs two admin
form fields and forfeits compile-time type safety for a CMS nobody asked for.

Consequence for Phase 2: section copy lives in
src/lib/content/mock/settings.json shaped as {ar, en} from day one — never in
messages/*.json. Phase 14 swaps the source, not the shape.

Fallback: empty `ar` falls back to `en` at render time. The admin flags
incomplete translations rather than hiding them.

---

## 6. Phase 1 — Design token implementation

**Decision:** Wire every token from §1–3 into `src/app/globals.css` as a
two-layer system — a raw palette (hex literals, named by hue) and a semantic
layer that references it — plus two new derived values §2 and §3 didn't
cover.

### Final semantic token names

| Token                    | Dark      | Light     | Raw source                                    |
| ------------------------ | --------- | --------- | --------------------------------------------- |
| `--color-bg`             | `#101014` | `#FAFAFC` | `--color-neutral-950` / `--color-neutral-25`  |
| `--color-card`           | `#1B1B25` | `#FFFFFF` | `--color-neutral-900` / `--color-neutral-0`   |
| `--color-surface`        | `#1F1F2E` | `#F3F3F7` | `--color-neutral-850` / `--color-neutral-50`  |
| `--color-surface-raised` | `#252536` | `#EBEBF2` | `--color-neutral-800` / `--color-neutral-150` |
| `--color-border`         | `#2C2C3A` | `#E2E2EA` | `--color-neutral-700` / `--color-neutral-200` |
| `--color-text-primary`   | `#F1F1F4` | `#16161C` | `--color-neutral-100` / `--color-neutral-925` |
| `--color-text-secondary` | `#8A8F98` | `#61656E` | `--color-neutral-400` / `--color-neutral-500` |
| `--color-primary`        | `#5E6AD2` | `#4E5BBF` | `--color-violet-500` / `--color-violet-600`   |
| `--color-primary-hover`  | `#4E5BBF` | `#404BA5` | `--color-violet-600` / `--color-violet-700`   |
| `--color-secondary`      | `#6E79D6` | `#5B68C3` | `--color-violet-400` / `--color-violet-550`   |
| `--color-success`        | `#3DD68C` | `#1FA968` | `--color-emerald-500` / `--color-emerald-600` |
| `--color-warning`        | `#F0C000` | `#B88A00` | `--color-gold-500` / `--color-gold-600`       |
| `--color-error`          | `#EB5757` | `#D13B3B` | `--color-coral-500` / `--color-coral-600`     |

Two entries above resolve gaps §2 left open:

- **`--color-card`** — §2 recorded the "Neutral / Card" role's values but the
  design-system skill had no token slot for it (flagged as an open point).
  It now exists as its own token, distinct from `--color-surface`.
- **`--color-secondary`, light theme (`#5B68C3`, raw name `--color-violet-550`)**
  — `violet-issue-DESIGN.md` only defines Secondary for the dark theme
  (`#6E79D6`, "Light Violet"). Derived by applying the same per-channel
  darkening ratio §2 used to derive `--color-primary`'s light value from its
  dark one (a flat channel-wise multiplier, not a hue/saturation rotation).
  Verified: 4.98:1 against white, 4.78:1 against `--color-bg` (light) — both
  clear the 4.5:1 AA body-text bar, even though Secondary is normally used as
  an accent rather than body text.

**Rejected alternative for Secondary:** reusing `--color-primary`'s light
value for Secondary too — rejected because it would make two semantically
distinct roles (primary action vs. secondary highlight) visually
indistinguishable in light mode.

### Why semantic tokens sit in front of raw palette values

Raw hex values (`--color-violet-500`, `--color-neutral-950`, etc.) appear
exactly once each, grouped by hue in a single `@theme` block. Every semantic
token (`--color-bg`, `--color-primary`, ...) references a raw one instead of
repeating its hex. Two consequences:

1. A palette correction (e.g. re-deriving a colour for better AA contrast)
   changes one raw value and every semantic token that depends on it updates
   automatically — nothing downstream needs to be found and edited.
2. Components importing only the semantic names never need to know the
   underlying hex exists at all, which is what makes "no raw hex in
   components" enforceable as a lint-of-the-eye rule rather than something
   that has to be manually cross-checked against a swatch sheet.

### Why `@theme inline`, not plain `@theme`

The semantic layer (`:root` / `.dark`) is the one part of the token system
that changes at runtime — the whole point of a theme toggle. Tailwind's
plain `@theme` resolves any `var()` inside it once, at build time, using
whatever `:root` holds during that build (always the light value, since
`.dark` is never an active class mid-compile). A utility like `bg-bg`
generated from a plain `@theme` would therefore freeze on the light colour
forever and the toggle would silently do nothing.

`@theme inline` keeps the `var()` reference live in the emitted CSS instead
of resolving it at build time, so `bg-bg` re-reads whichever of `:root` /
`.dark` is actually applied on `<html>` at paint time. The raw palette and
the static scales (type, spacing, radius, duration) don't have this problem
— they never change between themes — so they stay in a plain `@theme` block.

### Spacing base unit

Tailwind's default spacing unit is `0.25rem`, so a class like `p-16` would
render 64px. Every scale in this project (type, radius, spacing) is defined
as literal pixel values used directly as class numbers, so `--spacing` was
redefined to `1px`: `p-16` now means 16px, consistently with `--radius-card:
8px` and `--text-32: 32px`. The marketing-only spacing extension (80/96/128/
160, §1) is reachable through this base unit automatically, and is also
declared explicitly as named `--spacing-80/96/128/160` tokens so the
sanctioned upper bound is visible in `globals.css` rather than tribal
knowledge.

> **Superseded by §7:** the raw palette described above as living in
> `globals.css`'s first `@theme` block has since moved to `src/styles/
palette.css`, outside any `@theme` block. The reasoning in "why semantic
> tokens sit in front of raw palette values" still holds — only the file
> location and the exact raw token names changed.

---

## 7. Palette / tokens split — rebranding as a one-file change

**Decision:** Split the raw colour palette out of `globals.css` entirely,
into two files with a strict one-way dependency: `src/styles/palette.css`
(raw hex values, no logic) → `src/styles/tokens.css` (semantic mapping +
static scales, zero hex) → `src/app/globals.css` (wiring: imports,
`@custom-variant dark`, `@theme inline`, base styles).

**Rationale:** §6 already put raw values in front of semantic ones, but both
lived in the same file and the same `@theme` block, so a rebrand still meant
reading mapping logic to find which lines were "the palette" versus "the
wiring." Splitting into dedicated files makes the boundary physical: to
rebrand, edit `palette.css` and nothing else. `tokens.css` and `globals.css`
never change for a colour swap, and neither does any component.

`palette.css` is deliberately **not** wrapped in `@theme` — a plain `:root`
block means Tailwind never generates utilities from it (no `bg-brand-500`
ever exists), so there is no way for a component to reach for a raw palette
value even by accident. Only `tokens.css`'s semantic names, mapped through
`globals.css`'s `@theme inline`, are ever exposed to components.

**Naming rule: hue and step, never role.** Raw entries are named
`--palette-<hue>-<step>` (`--palette-brand-500`, `--palette-neutral-900`,
...), never `--palette-primary` or `--palette-cta`. A rebrand from violet to
teal means editing the hex value on the `--palette-brand-*` lines; if those
variables were named after the role they play today, a rebrand would leave
`--palette-violet-500` holding a teal value — a lie baked into the variable
name. The rule applies to any hue added later: name it by what it _is_, not
by what currently uses it.

**New raw families introduced by the split:** `--palette-brand-*` replaces
the old `--color-violet-*` naming. `--palette-neutral-*` and `--palette-
light-*` replace the old single `--color-neutral-*` scale, split by which
theme each value belongs to rather than by absolute lightness (both were
already a single monotonic scale spanning both themes; this only renames
and re-groups them, no hex changed). One entry, `--palette-brand-550`
(Secondary's light-mode value, §6), isn't part of the brand-400/500/600/700
set given at the start of this refactor — it's preserved as its own step
because dropping it would have changed a rendered colour, which this
refactor is explicitly not allowed to do.

**Deliberate light-mode primary offset:** `--primary` maps to
`--palette-brand-600` in light mode but `--palette-brand-500` in dark mode —
one hue-step darker in light mode, on purpose, because `--palette-brand-500`
(`#5E6AD2`) fails AA body-text contrast on white (§2). This is called out as
a comment directly on the mapping in `tokens.css` so it isn't "corrected"
into consistency later at the cost of contrast.

**Rejected alternatives:**

- Keeping raw and semantic tokens in one file, better-commented — rejected;
  a comment doesn't stop someone editing the wrong line under time pressure,
  and doesn't stop Tailwind generating raw-palette utility classes that
  tempt a component to bypass the semantic layer.
- Wrapping `palette.css` in `@theme` for consistency with `tokens.css` —
  rejected; that would make every raw hue-step directly usable as a Tailwind
  utility class (`bg-brand-500`), undermining the rule that components only
  ever consume semantic tokens.

**Verification:** rebuilt after changing only `--palette-brand-500`
(`#5E6AD2` → `#2A9D8F`) and confirmed via the compiled CSS that only the
dark-theme `--primary` (and anything chained from it) picked up the new
value, then reverted and re-ran the Phase 1 contrast table — every ratio
matched exactly, confirming the split is visually a no-op.

---

## 8. `--color-on-primary` — Phase 3

**Decision:** Add a semantic token for text/icons painted directly on
`--color-primary` or `--color-primary-hover` (the primary `Button` variant's
label), mapped to `--palette-light-0` (`#FFFFFF`) in **both** themes.

**Rationale:** The styleguide's own contrast table (Phase 2) already flagged
this gap in its `WHITE_RAW` comment: "white on primary" had no dedicated
semantic token, so the demo reached for the raw `--palette-light-0` variable
directly — acceptable in styleguide code auditing the token system itself,
never acceptable in a production component per the design-system skill's
token contract. `--color-primary` is a saturated brand colour in both dark
and light mode, so unlike every other semantic token it does not need a
theme-flipped foreground — white reads correctly against it either way.

**Verification:** white (`#FFFFFF`) against dark-mode `--color-primary`
(`#5E6AD2`) is 4.70:1; against light-mode `--color-primary` (`#4E5BBF`) is
5.88:1. Both clear the WCAG AA 4.5:1 body-text bar.

**Rejected alternatives:**

- Reusing `--color-text-primary` — rejected; it's theme-flipped (light text
  in dark mode, dark text in light mode) and would render near-invisible
  dark text on the light-mode primary button.
- Inlining `--palette-light-0` per-component — rejected; it's exactly the
  raw-palette-in-a-component pattern the design-system skill forbids, and
  the styleguide's own comment already called it out as a stopgap, not a
  pattern to repeat.

---

## Process notes

Not design decisions — workflow corrections worth keeping so they aren't
repeated.

**Phase 2 acceptance was declared one commit too early.** `CLAUDE.md`'s
Current State was advanced to Phase 3 at `ea7a723`, but three more commits
still had to land after it to make Phase 2's own deliverable checklist pass:
`db6d354` (a real bug — the styleguide's contrast table could read a stale
theme's computed values for one render after toggling), `40aa665` (hardened
`src/lib/content` against ever being pulled into a client bundle), and
`55b5c4c` (a pnpm config fix needed before `build`/`lint`/`typecheck` could
even run). `55b5c4c` is the commit where Phase 2's checklist was actually
fully green — not `ea7a723`.

**Rule going forward:** the phase-completion commit (the one that advances
`CLAUDE.md`'s Current State) must be the _last_ commit of the phase, made
only after every deliverable-checklist item has been re-verified against
that exact commit — never a commit made mid-fix-wave in anticipation of
verification passing.

**Branch naming: this repo uses `master`, not `main`.** §0.1's frontend
branch table names the client-demo branch `main`; the actual repo (created
in Phase 0) uses `master` as its only trunk, and `CLAUDE.md`'s Current
State has recorded `Branch: master` since Phase 2. Phase 3 was executed on
a short-lived feature branch (`feat/phase-3-app-shell`) per its own prompt —
merging it into `master` is left for review rather than done automatically,
since merges weren't part of the authorized scope. Treat `main` in §0.1 as
the plan's original assumption, not this repo's reality — don't rename the
trunk branch to match the plan; future Current State entries should keep
saying `master`.

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

> **Superseded by §11:** `Threads` was replaced with reactbits `MoltenMetal`.
> This entry is kept as the historical record of the original choice — the
> gating architecture (mobile/reduced-motion fallback, viewport pause,
> mouse interaction) it established still applies unchanged to the new
> background; only the specific reactbits component changed.

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

## 9. Glass / backdrop-blur — scoped exception

**Decision:** Extend `violet-issue-DESIGN.md`'s existing backdrop-blur
treatment — modals ("a subtle `0 24px 48px rgba(0,0,0,0.4)` shadow combined
with a backdrop blur of 4px") and the command palette (same shadow + blur) —
to floating overlay surfaces generally, not just those two.

**Allowed (floating surfaces only):**

- Sticky header, once condensed/scrolled
- Dropdown menus (language switcher, nav submenus)
- Modals (already in the original spec)
- Command palette (already in the original spec)
- Mobile nav overlay

**Never allowed (still banned everywhere else):**

- Content cards (service cards, project cards, testimonial cards)
- Section backgrounds
- Any stacked/nested translucent panel used as decoration
- Anything in the admin panel beyond what the original Linear-style spec
  already allows

**Rationale:** floating surfaces need to show contextual continuity with
what's behind them while staying legible — that's a functional use of blur
(helping the user track that the header/dropdown/modal is layered above
scrolling content), not a decorative genre applied for its own sake. Content
cards sitting in blur is exactly the pattern the Claude Design brief
rejected, and that rejection still stands — this amendment does not reopen
it.

**Token implementation:** background uses the existing surface token at
reduced opacity — `color-mix(in srgb, var(--color-surface-raised)
var(--overlay-surface-opacity), transparent)`, not a new hardcoded rgba
value; `backdrop-filter: blur(var(--blur-overlay))`, a new token sourced
from violet-issue-DESIGN.md's existing 4px modal baseline; border stays
`--color-border`. No hex literal — same rule as everywhere else in the
token contract. `--overlay-surface-opacity` is itself a token (not a magic
number picked ad hoc per component) precisely because the header's own
worst-case contrast check (below) is what determines its value, not
aesthetic taste alone — see the header condense implementation for the
verification.

**Rejected alternatives:**

- A separate, higher blur value for marketing chrome vs. the original 4px
  admin spec — rejected; one blur value keeps the floating-surface language
  visually identical between marketing and admin, and 4px is already
  established as correct for this system's density.
- Applying glass to hero/section backgrounds too, since the benchmarked
  reference site did — rejected explicitly; those are content surfaces, not
  floating ones. The exception is scoped to elements that visually float
  above other content, not to decorative texture.

---

## 10. Hero brand mark — raster exception (dark mode only)

> **Removed — see §11.** The raster asset, `HeroBrandMark`, and its
> Threads density mask were all removed when the hero background was
> swapped to `MoltenMetal`. This entry is kept as the historical record of
> why the exception existed and how it was scoped, in case a future hero
> decoration revives the question of raster assets vs. token-driven shapes.
> The asset files themselves (`public/brand/codexa-hero-mark-3d.webp` /
> `.png`) were deleted, not just unreferenced — do not resurrect this
> section's decision by re-adding them without re-deriving the exception.

**Decision:** Render `public/brand/codexa-hero-mark-3d.webp` (a 710×814
AI-generated 3D glass rendering of the Codexa mark's arc geometry,
background-removed — confirmed genuinely alpha-transparent in both the
`.webp` and `.png` copies via their file headers, not merely appearing so
against a light preview background) as the hero's decorative signature
element, in dark mode only. Light mode renders a flat, token-driven CSS
ambient arc instead (`HeroBrandMark`'s `AmbientArc`, a blurred
`--color-primary`-at-reduced-opacity ring stroke — an accent, not a large
fill, per the design-system skill's rule 2).

Unlike every other visual in this project, this asset's colours are baked
at generation time — it does **not** follow a future `palette.css` rebrand
like everything else in the token system does. Its interior colour
(~`#190F27`) approximates `--color-bg` closely enough to read as intentional
against a dark background, but does not track it exactly, and looks broken
against a light one. This is a known, accepted, one-off exception, scoped to
this single hero decoration only. **If the brand palette changes
significantly later, this asset must be regenerated or retired — flag it as
tech debt, do not let it silently look "wrong" after a rebrand.**

**Why conditional rendering, not CSS `display`/`visibility`:** the theme
check (`useTheme` + `useIsMounted`, the same mount-gated pattern
`Header`'s `ThemeToggle` already uses) decides whether `<Image>` exists in
the tree at all. A visitor resolved to light mode never has the `<Image>`
element mounted, so the browser never requests the asset — hiding it with
CSS instead would still pay for the download on every light-mode visit for
an image that can never be seen.

**Positioning is anchored to the same `max-w-7xl` frame `Container` (and
therefore the headline's 12-column grid) uses, not the full-bleed section.**
The mark is sized in `vw` (responsive), and the container caps at 1280px —
if the mark were positioned against the raw viewport instead, a wide enough
monitor would let it drift left independently of the headline's own capped
column boundary until the two overlapped. Anchoring both to the same capped
frame keeps the gap between them constant regardless of viewport width.
Sized to stay within columns 8-12's own share of that frame (max 520px
against their ~539px), so it doesn't compete with column 7 for space even
before accounting for its `-14%` end-margin bleed off-canvas.

**Motion:** position/scale only, tied to the same Lenis-synced scroll value
as the rest of the hero — never a rotation. A full rotation of a flat
raster render with fixed baked-in highlights would visibly not track real
lighting as it turned, unlike an actual 3D scene; a slow scroll-linked
drift plus a slight idle scale pulse reads as "alive" without that tell.

**Rejected alternatives:**

- Serving the `.png` fallback via `<picture>` — rejected in favour of
  passing the `.webp` `src` straight to `next/image` and letting its own
  format-negotiation pipeline handle the rest, since the task's own
  instructions named this as an equally acceptable approach and it keeps
  next/image's sizing/lazy-loading benefits intact (a hand-rolled
  `<picture>` would bypass them). Known limitation: a browser with zero
  WebP support gets served the source WebP unchanged rather than a
  guaranteed-decodable PNG — accepted given this is a demo/portfolio site,
  not one with hard legacy-browser requirements.
- Reusing `--blur-overlay` (design-decisions.md §9) for the light-mode
  ambient arc's soft-glow blur — rejected; that token is scoped to floating
  overlay chrome at a 4px baseline, which would be imperceptible at this
  shape's much larger scale. The arc uses a plain `blur(64px)` filter
  instead, documented in `hero-brand-mark.tsx` as a deliberately different,
  one-off decorative value, not a reusable token.

---

## 11. Hero background swap — MoltenMetal replaces Threads; brand mark removed

**Decision:** Replace the hero's Threads canvas with reactbits `MoltenMetal`
(same source-acquisition method as Threads — reactbits.dev's `jsrepo`
manifest endpoint still doesn't serve valid JSON, so it's copied by hand
from the same GitHub source `jsrepo` would fetch), and remove the dark-mode-
only 3D raster brand mark (§10) entirely — the hero background is now the
only visual element behind the headline.

**Rationale:** requested directly. `MoltenMetal` renders a slow, organic,
mouse-reactive plasma/flow effect. Task 1's original gating architecture
(mobile/reduced-motion fallback in `hero-background.tsx`, mount/unmount
pause on scroll-out, mouse interaction) carries over unchanged from §4 —
only the specific reactbits component swapped, not the surrounding rules.

**Colour mapping is worst-case-preserving, not re-derived.** `MoltenMetal`
takes three arbitrary hex colours (`color1`/`color2`/`color3`) that blend
by pixel intensity, with `color3` as the terminal colour at the brightest,
most-opaque pixels (see `molten-metal-background.tsx`'s fragment shader —
alpha reaches 1 exactly where the colour mix has fully resolved to
`color3`). The sourced component's own defaults are a violet/pink/white
trio — pink has no place in this cool-toned system (design-system rule 3:
"no warm colours enter the palette"), so all three are remapped to the
already-defined `--palette-brand-*` family: `--palette-brand-700` →
`--palette-brand-600` → `--palette-brand-500`. `color3` is deliberately
pinned to the EXACT value (`--palette-brand-500`) Threads' own worst case
used, so `hero-scrim.tsx`'s already-verified contrast numbers (dark theme
4.05:1 unprotected / >8:1 with the scrim; light theme 3.95:1 unprotected /
similar margin with the scrim) carry over without re-deriving them for a
different worst-case colour — the scrim's job (protect text against a
single fully-opaque brand-500 pixel) is unchanged by which shader produces
that pixel.

**Brand mark removal, downstream effects:** with the mark gone, the Threads
density mask that faded the background's opacity toward the inline-end
third of the viewport — added in §10's era specifically so Threads and the
3D mark wouldn't visually compete — no longer has a purpose and was removed
with it. `HeroBackground` no longer takes a `dir` prop as a result;
`HeroScrim` still does, for its own, unrelated text-contrast gradient
direction. `public/brand/codexa-hero-mark-3d.webp`/`.png` were deleted, not
left unreferenced.

**Rejected alternatives:**

- Keeping the brand mark and layering `MoltenMetal` behind or around it —
  rejected; the request was to remove the 3D image, not relocate it, and
  §10's decision record is moot without a mark left to scope.
- Re-deriving hero-scrim contrast from scratch for `MoltenMetal`'s actual
  worst case — rejected as unnecessary rigor for its own sake: pinning
  `color3` to the identical value Threads already used makes the two
  shaders' worst cases identical by construction, so the existing verified
  numbers are still correct, not merely "probably still fine."

---

## 12. Header restructure — floating pill, fixed positioning

**Decision:** Restructure the header from a full-width `sticky` bar into a
floating, fully-rounded (`rounded-full`) pill: `fixed` positioning with
equal inset margins on narrow viewports, capped at `max-w-5xl` and centered
on wider ones, sitting `top-16` from the viewport edge rather than flush
against it. Requested directly, from a reference screenshot of a personal-
portfolio-style floating capsule nav.

**What carried over unchanged:** the glass treatment (design-decisions.md
§9) and its condensed-state trigger, the `EASE_DECELERATE` transition, the
contrast-driven all-`text-primary` nav text, and the shared-layout active-
nav indicator. Only the container shape and positioning changed — the
glass-onset _logic_ (transparent at the very top, fades in once scrolling
begins) is the same `isCondensed` boolean as before, chosen explicitly over
alternatives (hide-on-scroll-down, or a bare shrink with permanent glass)
because it was the closest match to the header's existing, already-verified
behavior.

**What did not carry over from the reference image:** the avatar photo and
personal name ("Mohammed Nasser" — coincidentally this repo's own git
identity, but not this product's confirmed brand per PRODUCT.md) and its
nav items (Home/About/Projects/Skills/Experience/Contact) were **not**
copied. Codexa's existing `LogoMark` (wrapped in a circular badge to echo
the reference's avatar-in-a-circle treatment) and this project's own nav
items stand in for them — PRODUCT.md's confirmed brand identity overrides a
purely visual/structural reference.

**Layout consequence:** `fixed` removes the header from normal document
flow, so it no longer reserves space the way `sticky` did. The home page
absorbs this for free — the hero is a full-bleed `min-h-screen` background
specifically composed to sit _behind_ a floating header (see
`hero-section.tsx`), matching the reference image's own composition (a
pill floating over a full-bleed dark background). **This is not yet solved
for any non-hero page** — none exist yet (Phase 6 territory per
PROJECT-PLAN.md) — future page templates need their own top clearance
(padding roughly equal to the pill's `top-16` offset plus its up-to-64px
height) since the header no longer pushes content down on its own. Flag
this explicitly when Phase 5/6 pages are built, don't rediscover it as a
bug.

**Consequential change:** the skip-to-content link in `layout.tsx`
(`focus:fixed focus:inset-s-16 focus:top-16`) shared the exact same
`top-16` anchor as the old sticky header's top edge, which was fine when
both were flush against the viewport top. Now that the header floats as a
pill at that same offset, the skip link's focus position was moved to
`focus:top-96` so a keyboard user tabbing to it doesn't land it visually
underneath/behind the header pill.

**Rejected alternatives:**

- Compensating with global top padding on `<main>` now, before any non-hero
  page exists to need it — rejected; padding tuned against a hero that
  doesn't need it risks getting the number wrong for content that does,
  and would need re-deriving anyway once a real page defines what "content
  starts here" looks like without a full-bleed background behind it.
- Keeping the CTA button's visibility breakpoint at `md:` (its previous
  value) — rejected; six nav items plus locale switcher, theme toggle, CTA,
  and the logo badge inside a `max-w-5xl` pill crowds well before `lg:`,
  so the CTA now waits for `lg:inline-flex` to give the pill room to
  breathe at medium widths.

---

## 13. Typography — Inter replaced with Inter Display everywhere (added 2026-08-05)

**Decision:** Inter Display replaces Inter as the site's sole Latin sans-serif,
for every text size — headlines, body text, and UI chrome (11–14px included),
no exception. Loaded locally via `next/font/local` (`InterDisplay-Regular
/-Medium/-SemiBold.woff2`, weights 400/500/600) instead of `next/font/google`,
since Inter Display isn't published on Google Fonts. Noto Kufi Arabic is
unchanged.

The CSS variable and export were renamed from the Inter-specific
`--font-inter`/`inter` to `--font-sans-latin`/`sansLatin`, since the token now
names its role (the Latin sans) rather than one specific typeface — matching
`--font-noto-kufi`'s script-based naming rather than reusing a brand name that
no longer matches what's loaded.

**Source verification:** the three `.woff2` files (from a third-party font
aggregator, not Google Fonts or rsms/inter's GitHub releases) were inspected
via `fonttools`/`ttx` before use. Distinct file sizes (134,036 / 138,856 /
139,316 bytes) and distinct SHA-256 hashes ruled out the same file renamed
three times. Each file's `name` table correctly identifies it as "Inter
Display" (family) at the right weight, with copyright/designer/license
records matching the genuine typeface (`Copyright 2016 The Inter Project
Authors`, Rasmus Andersson/rsms, SIL OFL 1.1, version `4.000;git-a52131595`).
Shared low-level tables (`GDEF`, `GSUB`, `fpgm`, `prep`) have identical
checksums across all three weights, while weight-specific tables (`glyf`,
`hmtx`, `OS/2`, `name`) differ correctly per file — the signature of genuine
sibling weight builds, not tampered or duplicated files.

**Deliberate tradeoff, made with it understood:** Inter Display is optically
tuned for large sizes (~20px+) — it carries tighter tracking and higher
stroke contrast than regular Inter, which has its own optical-size variants
for small text. Using it at 11–14px (shortcut hints, metadata, body, nav,
buttons) is a known deviation from its intended use, not an oversight.
Rendered on `/styleguide`'s full type scale in both themes: at 11–14px the
font stays legible with clear x-height and no rendering artifacts: no
established legibility failure was observed at the sizes checked, on the
screens checked. This is not a blanket clearance for every device/DPI
combination — if a specific screen or accessibility report surfaces a
problem later, revisit this tradeoff then rather than treating this
verification as exhaustive.

**Arabic pairing re-checked, not re-derived:** the `[lang="ar"]` overrides
(§3 — `letter-spacing: 0`, `line-height: 1.8`/`1.4`, `0.95em` optical-size
adjustment) were calibrated against standard Inter's metrics, not Inter
Display's. Rendered `/styleguide`'s mixed-script paragraph (Arabic text with
inline Latin terms — "Next.js", "API", "SEO" — falling back from Noto Kufi to
`--font-sans-latin` per-glyph) in both themes: baseline alignment between the
Latin fallback runs and the surrounding Noto Kufi Arabic held, with no visible
vertical jump or size mismatch. The existing §3 values were kept as-is — no
retuning performed, since nothing visibly broke.

**Rejected alternatives:**

- Keeping the `--font-inter` name and only swapping the loaded font — rejected;
  the variable name would actively lie about what's loaded, and any future
  reader grepping for "Inter" to understand the token would find a name that
  no longer matches the file.
- Re-deriving the Arabic pairing's calibrated values pre-emptively — rejected;
  nothing observed broke, so retuning would be unverified churn against
  numbers that are still working, not a fix for an actual problem.

---

## 14. Hero redesign — mega headline, end-aligned subtitle (added 2026-08-05)

**Decision:** Override the "Header/Footer/Hero are not rebuilt" workflow rule
for this one change, at the developer's explicit request (reference: a
one-word-per-line hero screenshot). The hero headline copy changes from a
full sentence to a fixed 2-3 word phrase ("Shaping Digital Futures" /
"صنع مستقبلك الرقمي"), rendered one word per block-level line at a new
96/120px type-scale extension (§1, §14 table in the design-system skill).
The subtitle + CTA group moves out of the headline's column and is pushed to
the inline-end edge (`self-end`, `text-end`, `justify-end` — all logical,
RTL-safe by construction since flexbox's end/start already follow direction)
below the headline, capped at `max-w-lg`, instead of stacking directly
beneath the headline in a shared 7-column block.

**Binding constraint this creates:** the hero title is no longer free-form —
it must stay to 2-3 short words. `HeroHeadline` renders one `block`-level
line per word at up to 120px; a longer sentence would stack into an
unreasonably tall block rather than wrapping gracefully. This is now a
content constraint on `settings.json`'s `hero.title`, not just a styling
choice — flag it if a future content edit tries to put a full sentence back
in that field.

**Rationale:** requested directly, matching a specific reference composition
(dominant huge-type headline, secondary text/CTA anchored opposite it) that
the existing sentence-style 64/80px headline and same-column subhead layout
could not produce.

**Rejected alternatives:**

- Reaching for an arbitrary Tailwind bracket value (e.g. `text-[120px]`)
  instead of a real token — rejected; the design-system skill's token
  contract applies here exactly as it does everywhere else, so 96px/120px
  were added to the type scale the same way 48/64/80 were, not inlined.
- A rigid 2-column grid (headline column + subtitle column, same row) —
  rejected; at up to 120px a wide headline column crowds a same-row subtitle
  column on mid-size viewports. A single-column flow with the subtitle
  block self-aligned to the end edge reproduces the reference's composition
  without that crowding.
- Removing the CTA buttons — not requested; the reference crop only showed
  subtitle text, not the full section, so CTAs were kept and end-aligned
  alongside the subtitle rather than dropped.

---

## Workflow — manual section design (added 2026-08-05)

**Decision:** Starting now, every marketing section and inner page
(Services, Portfolio, Testimonials, Clients, Contact, About, Blog, and all
other pages not yet built) is designed and implemented by hand by the
developer. AI is no longer used to generate full sections, pages, or
layouts by default.

Header, Footer, and Hero — already built in Phase 3 and Phase 4 — are
UNCHANGED by this decision and remain as AI-built. They may be manually
revised later at the developer's discretion, but are not being rebuilt now.

**Scope of AI involvement going forward:**

- Foundation and infrastructure work, only when explicitly requested
- Fixing specific, reported bugs
- Answering specific technical questions
- Reviewing hand-written code against the design-system and i18n-keys
  skills, when asked — not proactively rewriting it

The design-system and i18n-keys skills remain the binding contract. They
now govern hand-written code exactly as they governed AI-generated code —
token usage, logical CSS properties, RTL rules, and accessibility floor all
still apply regardless of who writes the code.

**Rationale:** Full manual control over section design and layout, rather
than approving/revising AI-generated proposals turn by turn.

**Rejected alternative:** Also rebuilding Header/Footer/Hero by hand as
part of this same transition. Rejected because they are already functional
and already certified — manual effort is better spent on sections that
haven't been built yet.

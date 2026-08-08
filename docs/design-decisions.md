# Design Decisions

This project ran on a violet-accented design system ("Violet Issue") from
Phase 0 through the first build of the Process section. That system, and
every decision record written against it, has been fully replaced by the
monochrome system below and is not reproduced here — it remains completely
recoverable via git history (the file that defined it, `violet-issue-
DESIGN.md`, was last present at commit `59abd91`), so nothing is lost, it's
just no longer the active contract. What follows documents the CURRENT
system only.

---

## 1. Colour system

**Source:** a monochrome reference site, analyzed by extracting frames from
a walkthrough video at 1/second (55 frames) and pixel-sampling the actual
rendered colours — not estimated from a screenshot. Light mode has no
equivalent source (the reference is dark-mode only) and is derived; every
derived value is flagged as such in `palette.css`.

**Governing principle, replacing "background-layering, not shadows":**
elevation is expressed by a **border**, not a lightness step. Cards and
surfaces sit at the same fill as the page background (darker than or equal
to it in dark mode, lighter than or equal to it in light mode) and are
separated from it — and from each other — by a low-opacity 1px line. This
is a real behavioural change from the old system, where `--card` →
`--surface` → `--surface-raised` was a monotonic lightness ramp. There is
no longer a distinct fill for a "raised" tier: dropdowns, modals, and the
command palette reuse `--surface` and lean on the existing glass/blur
treatment plus literal occlusion to read as floating, not a lighter fill.

### Dark theme (measured)

| Token                                                  | Value                    | Source                                                                       |
| ------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------- |
| `--bg`                                                 | `#0A0A0A`                | measured — "base background", consistent across the whole reference page     |
| `--card` / `--surface` / `--surface-raised`            | `#050505`                | measured — "cards/surfaces... darker than or equal to the background"        |
| `--border`                                             | `rgba(255,255,255,0.10)` | measured range `0.08–0.12`; one representative value                         |
| `--text-primary`                                       | `#FFFFFF`                | measured — "primary text, near-pure white"                                   |
| `--text-secondary`                                     | `#9A9A9A`                | measured range `#8F8F8F–#9A9A9A`; the higher-margin end (see contrast table) |
| `--text-decorative` (large de-emphasized numbers only) | `#3A3A3A`                | measured — "very faint text", explicitly NOT AA-checked                      |
| `--primary` (CTA fill)                                 | `#FFFFFF`                | measured — "a solid white button is the only CTA style"                      |
| `--on-primary` (CTA text)                              | `#0A0A0A`                | measured — "black text" on the CTA                                           |
| `--primary-hover`                                      | `#E5E5E5`                | derived — the reference has no captured hover state                          |
| `--secondary` (hero gradient's second blob, etc.)      | `#9A9A9A`                | reused from text-secondary; the reference has no equivalent element          |

### Light theme (derived — no source video)

Same governing principle, mirrored: elevation moves toward the _light_
extreme instead of the dark one.

| Token                                       | Value              | Derivation                                                                                                                                                  |
| ------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--bg`                                      | `#FAFAFA`          | a hair off pure white, mirroring dark mode's bg/card relationship                                                                                           |
| `--card` / `--surface` / `--surface-raised` | `#FFFFFF`          | pure white — "elevated" toward the light extreme, separated from bg by border only                                                                          |
| `--border`                                  | `rgba(0,0,0,0.10)` | same principle, black-based since a white-alpha line is invisible on white                                                                                  |
| `--text-primary`                            | `#0A0A0A`          | reuses dark mode's `--bg` value — one grayscale ramp can serve both themes, unlike a hued palette                                                           |
| `--text-secondary`                          | `#666666`          | chosen for AA margin: 5.50:1 on bg, 5.74:1 on card (bar 4.5:1)                                                                                              |
| `--text-decorative`                         | `#C4C4C4`          | contrast-matched to dark mode's ~1.7:1 de-emphasis ratio against its own background, not eyeballed                                                          |
| `--primary` (CTA fill)                      | `#0A0A0A`          | inverts dark mode's white fill — the CTA is always "the maximum-contrast extreme for this theme", and that extreme is a different physical colour per theme |
| `--on-primary`                              | `#FFFFFF`          | inverts with it                                                                                                                                             |
| `--primary-hover`                           | `#1A1A1A`          | derived, mirrors dark mode's hover-lightens-slightly with hover-darkens-slightly                                                                            |
| `--secondary`                               | `#666666`          | reused from text-secondary                                                                                                                                  |

**This is a real behavioural change from the old system**, not just new
numbers: `--primary` used to be the same saturated violet in both themes
(only its light-mode shade was darkened for AA). Now `--primary` is a
_different physical colour per theme_ — white in dark mode, near-black in
light — because "maximum contrast" in a true monochrome ramp means
different things depending which end of the ramp you're standing on. Focus
rings (`:focus-visible`, built from `--color-primary`) inherit this for
free: they're now a high-contrast neutral outline in both themes, not a
coloured glow, with no separate code change required.

### Contrast — verified live against the rendered tokens, not hand-computed

Read directly off `/styleguide`'s contrast table (which reads the actual
resolved CSS custom properties via `getComputedStyle`, not hardcoded
numbers) after the migration:

| Pair                        | Dark    | Light   | Bar   |
| --------------------------- | ------- | ------- | ----- |
| text-secondary on bg        | 7.04:1  | 5.50:1  | 4.5:1 |
| text-secondary on card      | 7.24:1  | 5.74:1  | 4.5:1 |
| text-primary on bg          | 19.80:1 | 18.97:1 | 4.5:1 |
| text-primary on surface     | 20.38:1 | 19.80:1 | 4.5:1 |
| on-primary on primary       | 19.80:1 | 19.80:1 | 4.5:1 |
| on-primary on primary-hover | 15.72:1 | 17.40:1 | 4.5:1 |

All six pairs clear AA with large margin in both themes. The styleguide's
own contrast-checker had a latent bug this migration surfaced: browsers can
serialize a resolved custom property as 3-digit hex shorthand (`#fff` for a
declared `#ffffff`), which its `hexToRgb` only accepted at 6 digits —
harmless in the old palette (no token happened to collapse to 3 digits) but
broke silently for `--color-primary`/`--color-text-primary`/etc. everywhere
pure white is now used far more. Fixed to expand 3-digit hex, mirroring the
identical fix `Silk.jsx` already carried for the same browser behaviour.

**Hero Silk re-spot-check:** the shader's tonal ramp (`--hero-silk-low/
high`) recolours from violet-derived to pure grey (dark: `#0A0A0A` →
`#787878`; light: `#FAFAFA` → `#FFFFFF`). `#787878` is a deliberate
luminance-matched replacement for the previous ceiling (`#747880`, a
slightly cool-tinted grey) so the headline's contrast against the shader's
worst frame carries over rather than needing re-derivation — sampled live
on a rendered frame post-migration at ~6.7:1 dark / ~16.5:1 light (bar
3:1), and the subtitle-under-scrim at ~6.1:1 dark / ~5.3:1 light (bar
4.5:1) — both with more margin than the pre-migration values, since the
ramp only got lighter/purer, never darker.

**Status colours (`--success`/`--warning`/`--error`) are intentionally
unchanged** — still green/gold/red. See the open question below.

---

## 2. The one exception: violet lives only in the logo mark

Every other colour on the site is white, black, or grey. The logo mark
(`public/brand/codexa-mark.svg`, `codexa-lockup.svg`, `codexa-favicon.svg`)
keeps its original violet strokes (`#5E6AD2` outer arc, `#6E79D6` inner
arc) as **fixed, hardcoded SVG values — never `currentColor`, never
referenced from tokens.css.**

This is a single, named, intentional exception, not a reopening of the
palette. Two consequences that follow directly from "fixed, not
`currentColor`":

- It does not respond to a future rebrand. `palette.css` keeps the same two
  hex values in a clearly quarantined, commented-off section specifically
  so there's a documented source of truth to compare the SVGs against — not
  because any semantic token maps to them. Reaching for
  `--palette-brand-500`/`400` from `tokens.css` is the exact bug that
  quarantine exists to catch.
- It does not follow theme. The header previously served a `currentColor`
  "mono" variant in light mode and a hardcoded-white variant in dark mode,
  swapped via a `mounted`/`resolvedTheme` check — theme-reactive, in other
  words, and the one place in the header doing that dance. It now serves
  `codexa-mark.svg` unconditionally, same asset Footer already used
  correctly, removing the theme branch (and its hydration-mismatch guard)
  entirely rather than reconciling it with a colour that isn't supposed to
  change with theme.

**Everything else — buttons, focus rings, hero background, badges, chips,
icons — is monochrome.** If a future change wants to add colour anywhere
else, that's a new decision to make explicitly, not an extension of this
one.

---

## 3. Typography — Inter Display and Noto Kufi Arabic retained

**Decision, made before this task started:** keep Inter Display (Latin) and
Noto Kufi Arabic exactly as currently installed. The monochrome reference's
own type family — a bold geometric grotesk resembling General Sans/Aeonik —
is a different typeface, and was explicitly NOT sourced or installed.
Everything the reference does typographically is reproduced as an _effect_,
using the fonts already in the project:

- **Very bold weights.** Inter Display is loaded at 400/500/600 (see
  `src/app/fonts.ts`) — no 700/800 face exists. Headings and CTA labels use
  `font-semibold` (600), the heaviest available weight, rather than
  `font-bold` (700), which has no matching face and would either fall back
  to a different family or render synthetically bolded by the browser.
- **Large display numbers.** The type scale's 96/120px steps (added for the
  hero's one-word-per-line mega headline) are the vehicle for this — no new
  sizes needed. `--text-decorative` (§1) exists specifically for a future
  giant, intentionally-low-contrast number treatment (the reference's
  large, semi-transparent step numbers behind process cards), exempted from
  the AA obligation every other text token carries.
- **The white-to-transparent text-gradient heading effect.** Reproducible
  with a `background-clip: text` gradient from `--color-text-primary` to
  transparent (or to `--color-text-secondary`) — a CSS technique, not a
  font dependency. Not yet built anywhere; noted here so a future section
  reaches for this instead of a new font or a hardcoded gradient.

**Arabic-specific rules are unchanged**: Noto Kufi Arabic needs `0`
letter-spacing on headings (negative Latin tracking damages connected
Arabic letterforms), `1.8` body line-height, and `0.95em` optical sizing
relative to Inter Display at the same pixel value — all still applied via
`[lang="ar"]` in `globals.css`. None of this is colour-related, so the
monochrome migration didn't touch it.

---

## 4. Section-label pattern

The reference's core repeating identity element — and now this project's
required pattern for every future hand-built section — is a bracketed
index, the section name, and a thin divider that fills the rest of the row:

```
[01]  Services ─────────────────────────────────────────
```

Built as `src/components/ui/section-label.tsx`. Logical/RTL-correct by
construction rather than by special-casing: it's one `flex` row, which
reorders itself for reading direction automatically (no `rtl:` variant, no
`flex-row-reverse`), and the literal `[`/`]` characters mirror automatically
under the Unicode bidi algorithm in an RTL context. The only thing that
changes per locale is the section-name text the caller passes in, which
arrives already translated.

Demoed on `/styleguide` §18.

---

## 5. Explicitly retired

- **The raster 3D glass hero mark** (`public/brand/codexa-hero-mark-3d.webp`
  /`.png`, an AI-generated 3D rendering of the logo's arc geometry) — its
  colours were baked at generation time and could never follow a palette
  change, which directly contradicts §2 ("colour lives only in the logo
  mark's SVGs, nowhere else, nothing baked"). **Already removed in an
  earlier session, not by this task** — the component and both asset files
  were deleted outright (not merely unreferenced) before the monochrome
  reset began. Recoverable via git history if a future hero decoration
  wants to revisit raster assets vs. token-driven shapes.
- **Its light-mode flat-SVG fallback** (an `AmbientArc` ring stroke) — went
  with it, same prior session, same reasoning: nothing left to fall back
  for once the raster mark it stood in for was gone.
- **The first-card warm-glow exception**, added earlier this session as a
  deliberately-scoped one-off (a red/orange/yellow gradient behind the
  first process-section card, matching a different reference's colours
  exactly). Removed outright by this task rather than converted to a
  neutral white/grey: colour now exists nowhere on the site except the logo
  mark, and a converted glow would have been an arbitrary, unexplained
  visual outlier next to the other two (colourless) cards in the same row —
  there's no equivalent element in the monochrome reference to justify
  keeping a lone decorative glow on one specific card.

---

## 6. Open question — the admin panel (not decided now)

The future Laravel/Inertia admin panel (Phase 12-13, not yet built) has not
been decided one way or the other: it may keep the original dense
Violet-Issue-derived spec (32px controls, 36px rows, 150ms motion, violet
accent) as a deliberately separate density/colour system from the
marketing site, or it may inherit this monochrome system, or something
between the two. **Explicitly deferred, not decided by this task.**

Bundled into this same open question: **`--success`/`--warning`/`--error`
staying colour.** `StatusCircle` (backlog/todo/in-progress/done/cancelled)
is issue-tracker language belonging conceptually to the admin panel, not
the marketing site — and today it's used nowhere but `/styleguide`, on no
built marketing page. Rather than guess which way the admin decision will
land and recolour status semantics to match, they were left exactly as
they were. Revisit both together in whichever future session actually
scopes the admin panel.

Flagged here so it isn't silently forgotten and isn't accidentally decided
by omission.

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

## 6. Inner pages — the shared page conventions

Established while building `/about` and `/services`; every subsequent inner
page follows them rather than inventing its own.

**Every page opens with `PageIntro`** (`src/components/ui/page-intro.tsx`),
which is the home page's section opener, not a new "page header" style:
`SectionLabel`, then the same heading/description block at the same type
steps (`text-48 md:text-64 lg:text-80`, `text-14 md:text-16`). Two
differences, both consequences of being a page rather than a section — the
heading is an `<h1>`, and it carries `pt-128 md:pt-160` to clear the fixed
header pill. `header.tsx` had noted it was removed from normal flow
"because this project's other pages don't yet exist to need compensating
top clearance"; this is that clearance, and it lives in `PageIntro` rather
than in `header.tsx` so the home page's full-bleed hero keeps sitting
behind the header as designed.

Start-aligned, not centered, following the FAQ section's heading treatment:
a centered block reads as a section _inside_ a longer page, while a page
opener is the top of the reading order.

**Section numbering restarts per page.** `[01]` is the page itself (labelled
with its nav name), then `[02]`, `[03]`… for that page's own sections. A
detail page's `[01]` names the section it belongs to, not the record —
`[01] Services` above an `<h1>` of "Web Development" — so a visitor arriving
from search can tell where in the site they landed. A page whose whole body
is one list (`/services`) gets no second label: numbering the list `[02]`
would imply a sibling section that doesn't exist.

**Vertical rhythm is identical to home**: `py-80 md:py-96` per section,
`mt-32 md:mt-48` under each label, same `Container`.

**Long-form prose is one string, split at render.** `Service.body`,
`Post.body`, and `SiteSettings.pages.*.story.body` store paragraphs as a
single `Localized` string separated by blank lines; `toParagraphs()`
(`src/lib/content/paragraphs.ts`) splits it. The alternative — `Localized`
of `string[]` — would make `Localized` mean two different shapes depending
on the field, and the Phase 14 admin panel edits these in a textarea, which
needs a join/split convention either way. **Splitting happens in the page,
never inside a section component**: sections render what they're given.

**`localeAlternates(path, locale)`** (`src/lib/metadata.ts`) derives
canonical + all hreflang from `routing.locales`/`defaultLocale`, extending
the locale layout's pattern to any route. Retyping three entries per page is
the kind of thing that fails silently until a search console flags it.

**Inner-page copy lives in `SiteSettings.pages.<page>`**, separate from
`sections`. `sections` means "the home page's section copy, keyed by home
section"; folding inner pages in would make that key mean two things. A page
whose every block comes from a collection — any detail page — gets no entry.

### Index pages are rows; detail pages are intro → image → body → tail

`/services`, `/portfolio`, and `/blog` are all full-width rows separated by
a `border-t`, with hover brightening that border — the elevation-is-a-border
rule applied to a list instead of a card. Deliberately not card grids: the
home page already renders services and projects as cards, and repeating that
shape on the index makes it read as a duplicate of a section the visitor
just scrolled past. A row also gives the excerpt and the chips room a card
doesn't, which is the reason to open an index at all. `/portfolio` is the
exception that proves it — a filterable grid needs cards to re-flow.

Detail pages run: `PageIntro` → lead image → body (in a two-column split
with the record's facts) → a short tail of sibling records, so a page ends
on a route onward rather than a dead stop.

**The page's primary content gets no SectionLabel.** `[01]` already
announced it. A section only earns a number when it sits _beside_ something
else — `/services/[slug]`'s body has a capabilities column next to it,
`/portfolio/[slug]`'s has a facts list, so both are `[02]`. A blog article
has no sibling column, so its body is unlabelled and "More reading" takes
`[02]` rather than `[03]`.

### Pagination lives in the path, not a query string

`/blog` is page 1; `/blog/page/2` and up are their own routes with their own
`generateStaticParams`. Reading a `?page=` search param would opt the route
out of static rendering, and a pager is not a reason to break the one
property every other route on this site has. Page 1 keeps the bare `/blog`
URL — `/blog/page/1` is a 404, not an alias, so the index has one canonical
address rather than two serving identical content.

The pager renders nothing at all when there is one page. A disabled
prev/next pair for a single page of posts is chrome that tells the reader
nothing, and a disabled arrow is a non-interactive `<span>`, never a
`<button disabled>` or a link to nowhere — there is no destination, so
there should be nothing in the tab order.

### The /portfolio filter is client state, and filtering is not a remount

Category state lives in `useState`, not the URL, for the same static-
rendering reason as pagination — but with a real cost: a filtered view isn't
linkable. If sharing "just the mobile work" ever matters, the fix is moving
the filter into the path (`/portfolio/mobile`) so it stays static, not into
a query string.

Cards that survive a filter change keep their DOM node and slide to their
new grid position via motion's `layout`, instead of every card fading out
and a new set fading in. That is what makes the control read as re-arranging
one body of work rather than loading a different page. The buttons are a
`role="group"` of `aria-pressed` toggles — not a tablist, because they
filter content in place rather than switching between panels — and the
result count sits in an `aria-live="polite"` region, since a grid changing
silently below is not feedback.

### Dates: two defaults that are both wrong

`formatPostDate` (`src/lib/format-date.ts`) pins two things Intl would
otherwise decide badly:

- **`-u-nu-latn` on Arabic.** Intl defaults Arabic to Eastern Arabic
  numerals (٠١٢). This project's numeral decision is Western digits in both
  locales — the same rule `hero.trust` and `TimelineEntry.year` follow by
  storing plain strings — so the numbering system is pinned rather than
  inherited.
- **`timeZone: "UTC"`.** `"2026-06-15"` parses as UTC midnight, so
  formatting it in a zone behind UTC renders the 14th — and differently on
  the server than in the visitor's browser, which is a hydration mismatch on
  every post.

### Two colour-adjacent decisions this forced

**`StatusCircle` gained a `tone` prop** (`"status"` | `"mono"`, defaulting to
`"status"`). `/about`'s timeline needed it, and its `done`/`in-progress`
states render `--color-success`/`--color-warning` — colour on a marketing
page, which §2 forbids. Restricting the timeline to the already-grey states
was rejected: a shipped 2019 milestone rendering as a hollow "todo" ring is
semantically false. `"mono"` maps `done`/`in-progress` to
`--color-text-primary` and the rest to `--color-text-secondary`.

Nothing is lost by dropping the colour, because colour was never the only
channel: the five states are distinguished by **shape** (dashed ring, hollow
ring, half-filled, filled + check, filled + slash). And no new colour
pairing is introduced — `--color-text-primary` behind the check's
`--color-on-primary` stroke resolves to the same two hex values as the
already-verified `primary`/`on-primary` pair (19.80:1 both themes).

The default staying `"status"` is the point: **§7's open question is not
answered by this prop.** Whether the admin panel keeps colour status
semantics is still open; this only says the marketing site can't use them.

**Photography outside the home services section is grayscale, with one
known inconsistency.** The
full-colour photography exception (`Service.image`, see
`src/lib/content/types.ts`) is scoped to the home Services section, and
"exactly as scoped" means it does not extend to `/services`,
`/services/[slug]`, or `/about`'s team portraits. Those render the same
assets with a CSS `grayscale` filter — a filter, not a colour token, and
the source asset is untouched, so restoring colour anywhere is a one-class
change if that exception is ever widened deliberately.

The inconsistency: the HOME page's portfolio section renders the same
`Project.coverImage` files in full colour, while `/portfolio` and
`/portfolio/[slug]` render them grey. That section is hand-built and was
left alone deliberately rather than edited in passing — but the same
photograph appearing in colour on one page and grey on another is worse than
either choice made consistently, so it wants a decision. Adding `grayscale`
to the one `<Image>` in `portfolio-section.tsx` settles it in the direction
everything else already went.

Note also that `next.config.ts`'s `remotePatterns` comment still describes
picsum.photos as "a placeholder photography source for the Services section
only" — team portraits, project covers, and post covers all use the same
host now. The comment is narrower than the actual usage; worth correcting
whenever real assets replace the placeholders.

---

## 7. Open question — the admin panel (not decided now)

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

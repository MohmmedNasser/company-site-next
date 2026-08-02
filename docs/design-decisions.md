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

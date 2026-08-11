# FAQ Home Section — Design

## Context

Not part of the original Phase 5 home-section order (About → Services →
Selected Work → Testimonials → Clients → Contact) documented in
`docs/PROJECT-PLAN.md`. Added on explicit developer request, using the
attached reference screenshot (dark two-column FAQ pattern) as the visual
starting point, adapted to this project's monochrome token system rather
than copied color-for-color.

## Placement

New home section, inserted between Testimonials and the (not-yet-built)
Contact section. `SectionLabel number={6}` — next in sequence after
Testimonials (`5`); Clients and Contact take `7`/`8` whenever they're built.

## Data model

`src/lib/content/types.ts` — new type, same shape family as `ProcessStep`:

```ts
export interface FaqItem {
  id: string;
  order: number;
  question: Localized;
  answer: Localized;
}
```

`src/lib/content/mock/faq.json` — 4 items, English drafted by Claude and
Arabic drafted alongside it; both need a developer read-through before
merge (not sourced from a client-provided doc):

1. How do retainers actually work?
2. What if I don't use all my hours?
3. How fast can you start?
4. Who will be working on my account?

`ContentRepository.getFaqItems(): Promise<FaqItem[]>` added to
`repository.ts`, implemented in `mockRepository` (reads `faq.json`, sorted
by `order`), and added to `apiRepository` as `getFaqItems: notImplemented`
— every existing method there is a `notImplemented` stub until Phase 14,
so `getFaqItems` follows suit rather than being the one exception.

## Section copy

`SiteSettings.sections.faq: SectionCopy` added to `types.ts` and
`settings.json`:

```json
"faq": {
  "heading": { "en": "FAQ", "ar": "الأسئلة الشائعة" },
  "description": {
    "en": "Everything else you're wondering.",
    "ar": "كل ما تبقى من تساؤلاتك."
  }
}
```

The left column's "Have a question?" block is static UI chrome, not
client-editable business content — same treatment as the testimonials
CTA button labels — so it lives in `messages/en.json` /
`messages/ar.json` under `home.faq`, not in `settings.json`:

```json
"home": {
  "faq": {
    "sectionLabel": "FAQ",           // ar: "الأسئلة الشائعة"
    "helpHeading": "Have a question?", // ar: "لديك سؤال؟"
    "helpDescription": "Reach out anytime. We're happy to answer any questions before you commit to working together." // ar equivalent
  }
}
```

No avatar, no named person, no link — text only, per explicit decision
during brainstorming (the reference image's "Sarah Park, Project Manager"
card is dropped, not replaced with a generic contact link).

## Components

- `src/components/sections/faq-section.tsx` — async server component.
  `Container` + `SectionLabel number={6}`. Two-column layout: first DOM
  child = left text column (heading, description, help block), second =
  right accordion column — plain logical flex/grid so it reorders under
  `dir="rtl"` automatically, matching the existing pattern used in
  `testimonials-section.tsx`. Receives `heading`, `description`, and
  mapped `faqItems: { id, question, answer }[]` as props (locale already
  picked in `page.tsx`, per the existing convention).
- `src/components/sections/faq-accordion.tsx` — `"use client"`. Owns a
  single `openId: string | null` state (not per-item booleans — enforces
  single-open by construction). Each item renders as a full-width
  `<button aria-expanded aria-controls>` header row + an animated answer
  panel (`<div id role="region" aria-labelledby>`).

## Interaction & motion

Single-open accordion: clicking a header sets it as `openId`, collapsing
whichever was previously open. Height animate the answer panel using the
`motion` package already in use elsewhere (`Reveal` uses
`motion/react`) — auto-measured height transition, `+`/`−` icon rotates
180° on toggle. `useReducedMotion()` short-circuits to an instant
show/hide with no transform or height transition, exactly matching the
branching pattern already established in `src/components/motion/reveal.tsx`.

## Styling

Design tokens only, no raw hex: `border-border` row dividers,
`text-text-primary` question / `text-text-secondary` answer, existing
spacing scale. Logical properties throughout (`ps-`/`pe-`, `gap-`, no
`left`/`right`/`pl`/`pr`). Toggle row is a real `<button>` spanning the
full row width, min 44px tall for touch target.

## i18n

New keys added to **both** `messages/en.json` and `messages/ar.json`
under `home.faq`: `sectionLabel`, `helpHeading`, `helpDescription`.
`faq.json` carries the question/answer text per item, both locales
inline (`Localized`), same as every other mock content file.

## Page wiring

`src/app/[locale]/page.tsx`: add `content.getFaqItems()` to the existing
`Promise.all`, map to `{ id, question: pick(...), answer: pick(...) }`,
render `<FaqSection>` immediately after `<TestimonialsSection>` and
before the current placeholder `<Container>` block.

## Testing / Done when

- Renders correctly in both `en` and `ar` locales, including RTL column
  order and bidi-safe bracket label (`[06]`).
- Keyboard-operable: `Tab` reaches each header button, `Enter`/`Space`
  toggles it, `aria-expanded` reflects state correctly, only one panel
  open at a time.
- `prefers-reduced-motion` shows/hides instantly, no transform/height
  animation.
- Editing `faq.json` or the `faq` block in `settings.json` changes the
  section with no code change (existing project-wide "done when" bar).
- No raw hex, no physical CSS properties, every new string present in
  both `ar.json` and `en.json` (i18n-keys / design-system skill
  contracts still apply to this hand-requested build).

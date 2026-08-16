# Codexa

**A bilingual (AR/EN), dark-mode-first marketing site for a software agency — monochrome design system, RTL-native, and built to swap its content source without touching a single component.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![next-intl](https://img.shields.io/badge/next--intl-4.13.4-EC4899)](https://next-intl.dev/)
[![Motion](https://img.shields.io/badge/Motion-12.43.0-FFF31A?logo=framer&logoColor=black)](https://motion.dev/)

**Live demo → [codexastudio.vercel.app](https://codexastudio.vercel.app/)**

---

## Overview

Codexa is the public marketing site for a software agency. It ships in Arabic and
English from the same codebase — Arabic is the default locale, `/` redirects to
`/ar`, and the entire layout is written in logical CSS properties so direction
flips without a single `rtl:` override or mirrored stylesheet.

The visual identity is **monochrome**: white, black, and grey only. Elevation is
expressed as a 1px low-opacity border rather than a lightness step, so cards sit
at (or past) the page background's own fill instead of stacking into a lighter
tier. Two colour exceptions exist, both deliberately named and scoped in
[docs/design-decisions.md](docs/design-decisions.md):

1. **The logo mark** keeps its original violet strokes, hardcoded into the SVGs —
   never `currentColor`, never resolved from a token, so it neither follows theme
   nor responds to a rebrand.
2. **Service photography** (`Service.image`) renders in full colour, and only in
   the home page's Services section. Everywhere else the same assets go through a
   CSS `grayscale` filter.

The site is **frontend-only today.** A decoupled Laravel 12 + MySQL backend with
an Inertia admin panel is planned (Phases 9–14 of
[docs/PROJECT-PLAN.md](docs/PROJECT-PLAN.md)) but not started — `docs/learning/`
is still empty and `company-site-api` does not exist yet. Everything currently
renders from a structured mock content layer of typed JSON files behind a
repository interface, which is what lets the site build and deploy with no
backend, no database, and no API keys at all.

---

## Key Features

### Bilingual and RTL

- Arabic (default) and English via `next-intl`, with an `[locale]` route segment
  and locale routing in `src/proxy.ts` (Next.js 16 renamed `middleware.ts`).
- `localePrefix: "always"` and `localeDetection: false` — `/` always redirects to
  `/ar` regardless of `Accept-Language`, so there is one canonical address per
  page per locale.
- `<html lang dir>` set per request; every component uses logical properties
  (`ps-`/`pe-`/`inset-s-`/`text-start`), so no direction-specific CSS exists.
- Per-language typography: Inter Display for Latin, Noto Kufi Arabic for Arabic,
  with Arabic-specific rules applied via `[lang="ar"]` in `globals.css` — `0`
  letter-spacing on headings (negative Latin tracking damages connected Arabic
  letterforms), `1.8` body line-height, and `0.95em` optical sizing.
- Western numerals pinned in both locales, including a `-u-nu-latn` override on
  Arabic date formatting, which `Intl` would otherwise render as ٠١٢.
- `messages/ar.json` and `messages/en.json` parity is enforced by
  `scripts/check-i18n.mjs`, wired into the lint-staged pre-commit hook.

### Design system

- Monochrome, fully token-driven. No hex literal appears in any component; the
  `/styleguide` route (404s in production) renders every token plus a live
  contrast table that reads resolved custom properties via `getComputedStyle`.
- Two-file token architecture (`palette.css` → `tokens.css`) — see
  [Architecture Highlights](#architecture-highlights).
- Signature `[01] Services ─────` bracketed section-label pattern
  (`src/components/ui/section-label.tsx`), RTL-correct by construction rather
  than by special-casing.
- Dark theme by default (`defaultTheme="dark"`), with system preference support
  and no FOUC via `next-themes`.
- Every animation checks `prefers-reduced-motion`; Lenis is not instantiated at
  all under it, rather than instantiated with a shorter duration.

### Sections and pages actually built

Home page: hero (WebGL Silk shader over a token-driven CSS gradient, with
scroll-parallax layers), client marquee, approach statement, process, portfolio,
a scroll-pinned services scroller, testimonials slider, FAQ accordion, and a
contact section.

Inner pages, all in both locales with `generateStaticParams`:

| Route               | What it is                                                             |
| ------------------- | ---------------------------------------------------------------------- |
| `/about`            | Story, values, team, and a `StatusCircle`-driven timeline              |
| `/services`         | Full-width rows (not a card grid — the home page already did cards)    |
| `/services/[slug]`  | Detail: intro → lead image → body + capabilities column → siblings     |
| `/portfolio`        | Client-side category filter with motion `layout` re-flow, not remount  |
| `/portfolio/[slug]` | Case study with a facts column                                         |
| `/blog`             | Paginated index                                                        |
| `/blog/page/[page]` | Pages 2..N as real routes — pagination lives in the path, not `?page=` |
| `/blog/[slug]`      | Article                                                                |
| `/contact`          | Contact form and details                                               |
| `/styleguide`       | Every token and primitive; `notFound()` in production                  |

Plus: dynamic OpenGraph image generation for the home page and every service,
project, and post; `sitemap.ts` and `robots.ts`; `Organization` / `WebSite`
JSON-LD; designed `not-found`, `error`, and `loading` states; a skip-to-content
link; and a floating condensing header pill with a mobile nav.

**Contact form**: `react-hook-form` + `zod` with translated error messages, a
honeypot field, and idle/submitting/success/error states. It posts to a Server
Action that routes through the content repository — whose mock implementation
currently just resolves successfully. No message is persisted or emailed yet;
that's Phase 14.

---

## Screenshots

> **TODO** — add real screenshots at the paths below. These files do not exist
> yet; nothing links to them until they're added.

```
docs/screenshots/home-dark-ar.png      Home page, dark theme, Arabic (default)
docs/screenshots/home-light-en.png     Home page, light theme, English
docs/screenshots/home-dark-en.png      Home page, dark theme, English
docs/screenshots/home-light-ar.png     Home page, light theme, Arabic
docs/screenshots/portfolio-en.png      Portfolio page
docs/screenshots/about-en.png          About page
docs/screenshots/contact-en.png        Contact page
```

---

## Tech Stack

| Category            | Technology                                           | Purpose                                                                                   |
| ------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Framework           | Next.js 16.2.12 (App Router)                         | Routing, RSC, Server Actions, Turbopack, metadata and OG image generation                 |
| Language            | TypeScript 5.9.3 (`strict`)                          | Types in `src/lib/content/types.ts` are the single source of truth for content shape      |
| UI runtime          | React 19.2.4                                         | Server Components by default; `"use client"` only where interaction demands it            |
| Styling             | Tailwind CSS 4.3.3                                   | CSS-first config via `@theme` — no `tailwind.config.js`                                   |
| i18n                | next-intl 4.13.4                                     | `[locale]` segment, locale routing in `proxy.ts`, `ar.json`/`en.json`                     |
| Animation           | Motion 12.43.0                                       | Scroll-linked parallax, reveals, stagger, `layout` transitions on the portfolio filter    |
| Smooth scroll       | Lenis 1.3.25                                         | `<ReactLenis root>`, synced into shared `MotionValue`s so scroll math never desyncs       |
| Theming             | next-themes 0.4.6                                    | Dark-first, class-based, system-preference aware, no FOUC                                 |
| Hero shader         | three 0.180.0 + @react-three/fiber 9.7.0             | WebGL canvas for the Silk background (`src/components/Silk.jsx`)                          |
| Forms               | react-hook-form 7.85.0 + zod 4.4.3                   | Contact and newsletter forms, with `@hookform/resolvers` and translated messages          |
| Headless primitives | @base-ui/react 1.6.0                                 | `Input`, `Select`, `Separator`                                                            |
| Carousel            | embla-carousel-react 8.6.0                           | Testimonials slider                                                                       |
| Icons               | lucide-react 1.28.0                                  | Service, process, and value icons, resolved by name from content                          |
| Brand icons         | react-icons 5.7.0                                    | Footer social links (`fa6`)                                                               |
| Fonts               | `next/font` (local + Google)                         | Inter Display self-hosted at 400/500/600; Noto Kufi Arabic and JetBrains Mono from Google |
| OG fonts            | wawoff2 2.0.1                                        | Decompresses WOFF2 to TTF for Satori, which cannot read WOFF2                             |
| Tooling             | pnpm 11.15.1, ESLint 9, Prettier, Husky, lint-staged | Enforced package manager, flat config, pre-commit formatting + i18n parity check          |

> `ogl` is listed in `package.json` but is not imported anywhere — a leftover from
> the reactbits background candidates evaluated in the project plan. The shipped
> hero uses `three` / `@react-three/fiber` instead. Safe to remove.

---

## Architecture Highlights

### The content repository is the load-bearing decision

No component ever calls `fetch`. Every piece of content passes through
`src/lib/content`, which exports one interface (`ContentRepository`, 17 methods)
and picks an implementation from a single env var:

```ts
export const content: ContentRepository =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "api"
    ? apiRepository
    : mockRepository;
```

`api-repository.ts` already exists and already satisfies the interface — every
method currently throws `Not implemented until Phase 14`. That's deliberate: the
compiler enforces that the eventual Laravel integration fills in exactly the
contract the UI already consumes. Connecting the backend is one file plus one env
var, not a refactor.

The module is marked `import "server-only"`, which is what forces the
server/client boundary to be explicit: `Header` and `MobileNav` are client
components and therefore _cannot_ import content, so the locale layout fetches
`SiteSettings` once and passes it down as a prop to both `Header` and `Footer`.

Every translatable field is `{ ar, en }` from day one, in the mock JSON and later
in MySQL — not parallel Arabic and English files. Long-form prose is stored as
one string with blank lines between paragraphs and split by `toParagraphs()` at
render, so `Localized` never means two different shapes depending on the field,
and the future admin panel edits it in a plain textarea.

### Token architecture: raw values and mapping are separate files

`src/styles/palette.css` holds raw colour values and nothing else — named by hue
and step, never by role, and deliberately **not** wrapped in `@theme`, so
Tailwind never generates a `bg-mono-950` utility and no component can reach a raw
palette value even by accident. `src/styles/tokens.css` is mapping only: every
colour in it is a `var()` into the palette, and a hex literal appearing there is
a bug rather than a shortcut.

The result is that a rebrand touches one file. Nothing in `tokens.css` needs
editing when `palette.css` changes, because nothing in it holds a value of its
own.

One consequence worth naming: `--primary` is a _different physical colour per
theme_ — white in dark mode, near-black in light. In a true monochrome ramp,
"maximum contrast" means opposite ends depending which end you're standing on.
Focus rings inherit this for free.

### Two colour exceptions, scoped narrowly and written down

The logo's violet is quarantined in a commented-off section of `palette.css`
specifically so there's a documented source of truth to diff the SVGs against —
_not_ because any semantic token maps to it. Reaching for a
`--palette-brand-500` from `tokens.css` is the exact bug that quarantine exists
to catch. The header used to serve a theme-reactive mono/white variant of the
mark; that branch (and its hydration guard) was deleted rather than reconciled,
because a colour that isn't supposed to follow theme shouldn't have a theme
branch.

The photography exception is scoped to the home Services section and enforced by
a CSS filter elsewhere, not by a second asset — so widening it later is a
one-class change with the source files untouched.

### pnpm is enforced, not merely preferred

```json
"preinstall": "npx only-allow pnpm"
```

An `npm install` or `yarn install` aborts before it can write a competing
lockfile. Combined with `engine-strict=true` in `.npmrc` and a pinned Node
version in `.nvmrc`, there is exactly one reproducible install path.

### The hero background degrades by construction, not by feature detection

`HeroBackground` is a token-driven CSS gradient — two radial blobs in
`--color-primary`/`--color-secondary`, no JS, no GPU. It is **always painted**,
on every device, in every render including SSR.

The WebGL Silk shader then paints opaquely on top _only when it can_. The gate is
`useTokenColors`, which resolves `--hero-silk-low`/`--hero-silk-high` to literal
hex (a WebGL uniform cannot read a CSS `var()`) and returns `null` until the
first client-side read — deliberately with no server fallback, since a fallback
would have to be a hex literal in that file, reintroducing the duplication the
token layer removes. So the canvas is structurally unreachable during SSR, and
the gradient covers the window until the shader has real values. A
`MutationObserver` on `<html>`'s class attribute repaints the shader in place on
theme toggle, with no canvas teardown.

Two details that came out of real bugs, both documented in the source:

- The upstream reactbits shader took a single colour and multiplied it by the
  pattern, meaning it could only ever _darken_ toward black. Unusable on a light
  page — the near-black headline measured 1.01:1 in the dark bands. It was
  rewritten to take **both** ramp endpoints as uniforms so each theme pins its
  own floor and ceiling.
- Browsers may serialize a resolved custom property as 3-digit hex (`#fff` for a
  declared `#ffffff`). The original `hexToNormalizedRGB` assumed 6 digits, so
  white parsed as `(1.0, 0.06, NaN)` — which is why the light hero rendered
  red-orange. The same latent bug existed in the styleguide's contrast checker
  and was fixed in both.

**Honest scope note:** despite the project plan's rules for WebGL backgrounds,
Silk is _not_ wrapped in `dynamic(..., { ssr: false })`, has no
`IntersectionObserver` pause (it runs `frameloop="always"`), and has no explicit
`prefers-reduced-motion` or sub-768px gate of its own — only the parallax
transforms respect reduced motion. The token gate delivers the no-SSR property in
practice, but the viewport-pause and mobile rules are unimplemented, not
implemented differently.

### The Services section is gated before it mounts, not inside itself

`ServicesScroller` branches on `prefersReducedMotion || !isDesktop` and returns a
plain static stacked list. The pinned, scroll-driven variant never mounts and
never subscribes to scroll on those clients — the fallback is a genuinely
different layout, not a shortened version of the effect.

### Lenis owns the scroll, so scroll-linked motion reads Lenis

Motion's own `useScroll()` subscribes to the native `scroll` event, which desyncs
from what Lenis is actually rendering. Instead, a `LenisMotionSync` component
writes every Lenis tick into shared `MotionValue`s (`lib/motion/lenis-scroll.ts`)
that the hero parallax and header condense both read.

This ownership has a second consequence: the App Router's own `window.scrollTo(0, 0)`
on navigation is overwritten by Lenis on the very next frame, so
`LenisScrollReset` re-issues it through Lenis. It compares the route _without_
its locale prefix, so switching AR↔EN doesn't throw the reader back to the top of
the page they were already reading.

### Bilingual typography is handled per language, not as one shared style

Inter Display is self-hosted at 400/500/600 only. Headings use `font-semibold`
(600) rather than `font-bold` (700) because no 700 face exists and the browser
would otherwise synthesize one. Noto Kufi Arabic gets its own tracking,
line-height, and optical-size rules under `[lang="ar"]`, applied once at the
element carrying the attribute and never re-applied on descendants.

### Contrast is measured against rendered output, not assumed

`/styleguide` reads resolved CSS custom properties at runtime and computes
contrast live. The light-mode hero ramp was tuned against that table rather than
by eye: mirroring the dark ramp in CIE L\* lands on `#747474`, which fails the
subtitle's 4.5:1 bar at 4.31:1. The shipped floor is `#B4B4B4` (4.86:1, ~8%
headroom), and `hero-scrim.tsx` carries a note that darkening the silk further
requires strengthening the scrim in the same change — the two are coupled, not
independent.

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── [...rest]/            # catch-all → localized 404
│   │   ├── about/
│   │   ├── blog/
│   │   │   ├── [slug]/           # + opengraph-image.tsx
│   │   │   └── page/[page]/      # pagination in the path, not ?page=
│   │   ├── contact/
│   │   ├── portfolio/[slug]/     # + opengraph-image.tsx
│   │   ├── services/[slug]/      # + opengraph-image.tsx
│   │   ├── styleguide/           # notFound() in production
│   │   ├── layout.tsx            # <html lang dir>, providers, Header/Footer
│   │   ├── page.tsx              # home
│   │   ├── error.tsx  loading.tsx  not-found.tsx
│   │   └── opengraph-image.tsx
│   ├── fonts.ts                  # Inter Display (local), Noto Kufi, JetBrains Mono
│   ├── globals.css               # @theme inline bridge + [lang="ar"] rules
│   ├── not-found.tsx             # root fallback (supplies its own <html>)
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── about/                    # story, team, timeline, values
│   ├── blog/                     # index, pagination, post body, more-posts
│   ├── contact/                  # contact details
│   ├── hero/                     # section, background, headline, scrim, trust badge
│   ├── icons/                    # logo
│   ├── layout/                   # header, footer, mobile-nav, newsletter-form
│   ├── motion/                   # entrance, reveal, motion-layer, motion-item
│   ├── portfolio/                # case-study, grid, more-projects
│   ├── providers/                # theme, smooth-scroll (Lenis)
│   ├── sections/                 # home page sections
│   ├── seo/                      # json-ld
│   ├── services/                 # overview, list, other-services, icon map
│   ├── ui/                       # primitives: button, card, chip, container,
│   │                             #   field, input, select, section-label,
│   │                             #   page-intro, status-circle, marquee, …
│   └── Silk.jsx                  # WebGL shader (three + @react-three/fiber)
├── fonts/Inter Display/          # self-hosted woff2
├── i18n/                         # routing, request, navigation
├── lib/
│   ├── actions/                  # submit-contact, subscribe-newsletter (Server Actions)
│   ├── content/
│   │   ├── types.ts              # single source of truth for content shape
│   │   ├── repository.ts         # the interface every implementation satisfies
│   │   ├── index.ts              # picks an implementation from an env var
│   │   ├── locale.ts  paragraphs.ts
│   │   ├── mock/                 # 11 JSON files + mock-repository.ts
│   │   └── api/                  # api-repository.ts — throws until Phase 14
│   ├── hooks/                    # in-viewport, is-desktop, is-mounted, min-width,
│   │                             #   prefers-reduced-motion, scroll-reveal-progress,
│   │                             #   token-colors
│   ├── motion/                   # easing, lenis-scroll, read-duration-seconds
│   ├── og/                       # fonts.ts, template.tsx (OG image generation)
│   ├── utils/                    # cn, button-classes, hex-to-rgb
│   ├── format-date.ts  metadata.ts  nav.ts  structured-data.ts  utils.ts
├── styles/
│   ├── palette.css               # raw values only — the one file a rebrand edits
│   └── tokens.css                # mapping only — every colour is a var()
├── types/
└── proxy.ts                      # locale routing (Next.js 16 renamed middleware.ts)
```

---

## Getting Started

**Prerequisites:** Node 22.17.0 (see `.nvmrc`) and pnpm. Other package managers
are blocked by the `preinstall` guard.

```bash
git clone https://github.com/MohmmedNasser/company-site-next.git
cd company-site-next
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/ar`.
Add `/en` for English, and visit `/ar/styleguide` for the full token reference
(dev only).

**No external service keys are required.** Unlike most projects with a `.env`
file, there is nothing to sign up for: `NEXT_PUBLIC_DATA_SOURCE=mock` is the only
variable that matters, and everything renders from local JSON by design. The
optional `NEXT_PUBLIC_SITE_URL` only affects absolute canonical/OG URLs and
defaults to `http://localhost:3000`.

### Scripts

| Command           | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `pnpm dev`        | Dev server (Turbopack)                                |
| `pnpm build`      | Production build                                      |
| `pnpm start`      | Serve the production build                            |
| `pnpm lint`       | ESLint 9 flat config (`next lint` was removed in v16) |
| `pnpm typecheck`  | `tsc --noEmit`                                        |
| `pnpm format`     | Prettier across the repo                              |
| `pnpm check:i18n` | Fails if `ar.json` and `en.json` keys diverge         |

---

## Roadmap / Deferred Decisions

**Laravel + Inertia admin panel — Phases 9–13, not started.** The
`company-site-api` repo does not exist yet, and `docs/learning/` — where every
Laravel file is required to ship with a what/why/alternative/what-breaks
write-up — is still empty. Blockers are tracked in
[docs/BLOCKERS.md](docs/BLOCKERS.md) (local MySQL 8.4 setup, port conflicts).

**API integration — Phase 14, not started.** `api-repository.ts` satisfies the
interface but every method throws. Landing it means implementing those 17
methods, flipping `NEXT_PUBLIC_DATA_SOURCE=api`, adding `"use cache"` +
`cacheTag` invalidated by an admin-triggered webhook, rewiring the contact
Server Action to `POST /api/v1/contact`, and adding the backend's image host to
`remotePatterns`.

**The admin panel's colour and density system is genuinely undecided.** From
[docs/design-decisions.md](docs/design-decisions.md) §7:

> The future Laravel/Inertia admin panel (Phase 12-13, not yet built) has not
> been decided one way or the other: it may keep the original dense
> Violet-Issue-derived spec (32px controls, 36px rows, 150ms motion, violet
> accent) as a deliberately separate density/colour system from the marketing
> site, or it may inherit this monochrome system, or something between the two.
> **Explicitly deferred, not decided by this task.**
>
> Bundled into this same open question: **`--success`/`--warning`/`--error`
> staying colour.**

Not resolved here either.

### Known inconsistencies, already documented

- The home page's portfolio section renders `Project.coverImage` in full colour
  while `/portfolio` and `/portfolio/[slug]` render the same files in grayscale.
  Flagged in design-decisions.md as wanting a decision; adding `grayscale` to the
  one `<Image>` in `portfolio-section.tsx` settles it.
- `next.config.ts`'s `remotePatterns` comment still describes picsum.photos as a
  placeholder "for the Services section only" — team portraits, project covers,
  and post covers all use that host now.
- `--color-error` (red) is used for the contact form's error message, so status
  colour does reach a marketing page — narrower than the open question above
  assumes, but worth folding into it when Phase 12 revisits status tokens.
- `ogl` is an installed but unused dependency.
- The `/portfolio` category filter lives in `useState`, not the URL, so a
  filtered view isn't linkable. If that matters, the fix is moving it into the
  path (`/portfolio/mobile`) to stay statically rendered — not into a query
  string.
- Contact form spam protection is a honeypot only; the plan's client-side rate
  limiting is not implemented.

---

## License

**Proprietary — all rights reserved.**

This code is not licensed for reuse, redistribution, or derivative works. No
`LICENSE` file is present in the repository.

Third-party note: the WebGL background originates from
[reactbits](https://reactbits.dev/) (MIT + Commons Clause), substantially
modified here. Commercial use is permitted; reselling the component library
itself is not.

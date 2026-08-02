# Software Agency Website — Project Plan

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 · Laravel 12 + MySQL · Inertia + React admin
**Design system:** `violet-issue-DESIGN.md`
**Goals, in order:** (1) a modern, distinctive design · (2) learn Laravel — every file, route, and function must be explained.

> All project documentation, plans, prompts, code comments, and commit messages are written in **English**. Site *content* is bilingual (Arabic + English).

---

## 0. Architecture Decisions

Settle these before writing a single line of code. They are what make "build the frontend standalone, connect the backend later" work without a rewrite.

### 0.1 Repositories and branches

```
company-site-web/     ← standalone repo (Next.js)              → Vercel
company-site-api/     ← standalone repo (Laravel + Inertia)    → VPS / Forge
```

**Frontend branches:**

| Branch | Purpose |
|---|---|
| `main` | Client-demo build — local mock data, runs with zero backend |
| `feat/api-integration` | Backend wiring. Merged into `main` after verification |

**Hard rule:** `main` must build and deploy on Vercel at any moment with no API environment variable set. This is the URL you show on freelance platforms.

### 0.2 The backend is two surfaces, not one

This is the key consequence of choosing Inertia:

```
company-site-api/
├── routes/api.php    → JSON REST API  (consumed by Next.js public site)
│                        stateless, versioned, CORS-enabled
└── routes/web.php    → Inertia admin  (React pages rendered by Laravel)
                         session auth, CSRF, no JSON contract
```

Both surfaces share the same Models, Policies, and Services. They differ only in the response layer: `JsonResource` for the API, `Inertia::render()` for the admin. Understanding this split *is* the Laravel lesson — write it up in `docs/learning/`.

### 0.3 Content repository layer — the single most important frontend decision

Never call `fetch` from inside a component. Insert an abstraction:

```
src/lib/content/
  types.ts              ← TypeScript types (single source of truth)
  repository.ts         ← the interface every implementation satisfies
  mock/
    services.json  projects.json  testimonials.json  clients.json  posts.json
    mock-repository.ts
  api/
    api-repository.ts   ← written in Phase 14, not before
  index.ts              ← picks an implementation from an env var
```

```ts
// src/lib/content/index.ts
import { mockRepository } from "./mock/mock-repository";
import { apiRepository } from "./api/api-repository";

export const content =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "api" ? apiRepository : mockRepository;
```

Result: connecting the backend touches one file and one env var. No UI component changes.

### 0.4 Localized content shape

Every translatable field is stored as `{ ar, en }` from day one — in mock JSON and later in MySQL. Do not keep parallel Arabic and English files.

```ts
type Localized = { ar: string; en: string };

interface Service {
  id: string;
  slug: string;
  icon: string;          // lucide-react icon name
  title: Localized;
  excerpt: Localized;
  body: Localized;
  order: number;
}
```

---

## 1. Adapting the Violet Issue Design System

`violet-issue-DESIGN.md` is a strong system, but it was written for a **dense, dark application UI** — 36px rows, ≤150ms motion, no shadows. A marketing site needs room to breathe and motion that reads as intentional. So:

### 1.1 Keep as-is ✅

- The full violet palette — this is the brand
- Inter at 400 / 500 / 600, `-0.03em` tracking on display headings
- JetBrains Mono for numbers, identifiers, code, badges
- Radii: 4 / 6 / 8 / 12 / 9999
- Background layering instead of shadows in dark mode
- **Violet is an accent only — never a large fill**
- No warm colors enter the palette

### 1.2 Extend, and document the deviation ⚠️

| Item | Original spec | Marketing adaptation | Why |
|---|---|---|---|
| Type scale | 11–40px | add 48 / 64 / 80px | 40px cannot carry a hero |
| Spacing | up to 64px | add 80 / 96 / 128 / 160px | section rhythm |
| Motion duration | ≤150ms | **150ms for micro-interactions** (hover, focus, buttons); **400–700ms for scroll reveals** | the original rule targets micro-interactions, not section entrances |
| Container | full viewport | `max-w-[1280px]` with gutters | readable measure |
| Shadows | forbidden on cards | still forbidden in dark; subtle in light | light mode needs edge definition |

Record every deviation in `docs/design-decisions.md` so it is not relitigated in a later session.

> **The admin panel is the exception.** The dashboard is exactly the kind of UI this design system was written for. Build it against the *original* spec — 32px controls, 36px rows, 150ms motion, command palette. Do not apply the marketing adaptations there.

### 1.3 Light mode — not in the source file, must be derived

| Role | Dark (from spec) | Light (derived) |
|---|---|---|
| Background | `#101014` | `#FAFAFC` |
| Neutral / Card | `#1B1B25` | `#FFFFFF` |
| Surface | `#1F1F2E` | `#F3F3F7` |
| Surface Raised | `#252536` | `#EBEBF2` |
| Border | `#2C2C3A` | `#E2E2EA` |
| Text Primary | `#F1F1F4` | `#16161C` |
| Text Secondary | `#8A8F98` | `#61656E` |
| Primary | `#5E6AD2` | `#4E5BBF` ← darkened for AA on white |
| Primary Hover | `#4E5BBF` | `#404BA5` |
| Success | `#3DD68C` | `#1FA968` |
| Warning | `#F0C000` | `#B88A00` |
| Error | `#EB5757` | `#D13B3B` |

Verify every text/background pair against WCAG AA (4.5:1 body, 3:1 large text) before locking these in.

### 1.4 Typography — Inter + Noto Kufi Arabic

Both loaded via `next/font/google`. Inter carries Latin, Noto Kufi Arabic carries Arabic.

```ts
// src/app/fonts.ts
import { Inter, Noto_Kufi_Arabic, JetBrains_Mono } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-kufi",
  display: "swap",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});
```

**Noto Kufi Arabic behaves differently from Inter — compensate for it:**

| Property | Latin (Inter) | Arabic (Noto Kufi) | Reason |
|---|---|---|---|
| `letter-spacing` on headings | `-0.03em` | `0` | negative tracking damages connected Arabic letterforms |
| `line-height` body | `1.5` | `1.8` | Kufi ascenders/descenders and diacritics need vertical room |
| Optical size | baseline | `0.95em` relative | Kufi renders visually larger at the same px value |
| Uppercase transforms | allowed | **never** | Arabic has no case; `text-transform` is a no-op that only breaks Latin fallbacks in mixed strings |

```css
:lang(ar) {
  font-family: var(--font-noto-kufi), sans-serif;
  letter-spacing: 0;
  line-height: 1.8;
}

:lang(ar) h1, :lang(ar) h2, :lang(ar) h3 {
  letter-spacing: 0;
  line-height: 1.4;
}
```

Kufi is a geometric, architectural style — it actually suits the engineered feel of the violet system better than a humanist Arabic face would. Lean into it: the Arabic version of the site is allowed to feel slightly more monumental than the English one.

### 1.5 Signature element

The site needs one thing it is remembered by. Use the **circular status indicator** from the design system (backlog dotted / todo outline / in-progress half-filled / done filled with check) as a repeated visual language:

- Process section — circles fill as the user scrolls
- Portfolio cards — shipped / in development status
- Contact form — step progression

This ties the site to a developer-tooling identity instead of a generic agency template.

---

## 2. Dependencies and Version Notes

### Frontend

```bash
npx create-next-app@latest company-site-web --typescript --tailwind --eslint --app
```

| Package | Purpose |
|---|---|
| `next` 16.x | App Router, Turbopack by default, React 19.2 |
| `tailwindcss` v4 | CSS-first config via `@theme` — **no `tailwind.config.js`** |
| `next-intl` | i18n with a `[locale]` segment |
| `motion` | Framer Motion (current package name) |
| `lenis` | smooth scroll — use `lenis/react` |
| `lucide-react` | icons |
| `next-themes` | light/dark without FOUC |
| `react-hook-form` + `zod` | contact form validation |
| `ogl` | required by most reactbits WebGL backgrounds |

### Next.js 16 breaking changes that invalidate older examples

1. **`params` and `searchParams` are Promises:**
   ```tsx
   export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
     const { locale } = await params;
   }
   ```
2. **`middleware.ts` is now `proxy.ts`** — this is where next-intl's locale routing lives.
3. **Caching is opt-in** via `"use cache"` + `cacheTag` / `cacheLife` (stable, no `unstable_` prefix).
4. **Turbopack is the default bundler** for dev and build.
5. **`next lint` was removed** — run ESLint 9 directly.
6. `next/image` changed its defaults.

### Backend

| Package | Purpose |
|---|---|
| `laravel/framework` 12 | core |
| `inertiajs/inertia-laravel` | server adapter |
| `@inertiajs/react` | client adapter |
| `laravel/breeze` (React + Inertia preset) | scaffolds auth + Inertia + Vite in one command |
| `tightenco/ziggy` | exposes named routes to React |
| `intervention/image` | thumbnails |
| `laravel/sanctum` | tokens if a public write endpoint ever needs them |

---

## 3. Hero Background — Mouse Interaction Required

All candidates verified against the reactbits source. Only these props actually exist:

| Component | Mouse prop | Dependency | Assessment |
|---|---|---|---|
| **Iridescence** | `mouseReact` (default `true`) | `ogl` | Cursor shifts the UV field — smooth, subtle, cheap. Takes `color: [r,g,b]`. **First choice** |
| **Threads** | `enableMouseInteraction` | `ogl` | Thin animated lines that bend toward the cursor. Reads as "precision engineering", keeps text legible. Takes `color: [r,g,b]`, `amplitude`, `distance`. **Second choice** |
| **LiquidEther** | `mouseForce`, `cursorSize` | `three` | Genuine fluid simulation following the cursor. The strongest "wow", the heaviest cost. Has `autoDemo` so it animates before the first mouse move — important for mobile and for screenshots |
| **LineWaves** | `enableMouseInteraction`, `mouseInfluence` | `ogl` | Takes `color1/2/3` as hex. Good for an interior section |
| **SoftAurora** | `enableMouseInteraction`, `mouseInfluence` | `ogl` | Soft and light. Best **mobile fallback** |
| **Plasma** | `mouseInteractive` | `ogl` | Has real perf controls (`renderScale`, `maxDpr`, `targetFps`) but competes with the headline for attention |
| **GradientBlinds** | `mouseDampening` + spotlight props | `ogl` | Cursor-follow spotlight. Sharp geometry may fight the type |
| **Orb** | `hoverIntensity`, `rotateOnHover` | `ogl` | Centered object, not a background. Use as a secondary element |

**Recommendation:** `Threads` for the hero (mouse-reactive, on-brand, text stays readable), `SoftAurora` as the reduced-cost mobile fallback. If the demo needs more impact for freelance-platform screenshots, swap in `LiquidEther` with `autoDemo` enabled.

### Non-negotiable rules for any WebGL background

- `dynamic(() => import(...), { ssr: false })` — never server-render a canvas
- Pause the render loop when the section leaves the viewport (`IntersectionObserver`)
- Static CSS-gradient fallback under `prefers-reduced-motion: reduce`
- Static fallback below 768px — do not run WebGL on a mid-range phone
- **One canvas per page, maximum**
- Pass theme colors in as props and update them on theme change
- Throttle pointer handling with `requestAnimationFrame`; never set state per `mousemove`
- Cover the canvas with a subtle scrim so contrast stays AA-compliant regardless of animation frame

License note: reactbits is MIT + Commons Clause — commercial use is permitted, reselling the component library itself is not.

---

## 4. Phases

### 🟣 Track A — Frontend (ends with a deployable client demo)

---

#### Phase 0 — Foundation and Discipline

**Deliverables**
- `company-site-web` repo, Next 16, TypeScript `strict`, Tailwind v4
- `CLAUDE.md` at the root (content in §5)
- `.claude/skills/` created, priority skills authored
- ESLint + Prettier + Husky + lint-staged
- `docs/design-decisions.md` seeded with the §1.2 deviations
- Empty deploy to Vercel to prove the pipeline

**Done when:** `npm run build` passes and a blank page is live on a Vercel URL.

---

#### Phase 1 — Design Tokens

**Deliverables**
- All tokens in `globals.css` under `@theme` (Tailwind v4 CSS-first)
- Semantic variables, not raw ones: `--color-bg`, `--color-surface`, `--color-text-primary`, flipped by `.dark`
- Inter + Noto Kufi Arabic + JetBrains Mono wired through `next/font`
- Full type scale (11 → 80px) and extended spacing scale
- `/styleguide` route, excluded from production, rendering every token and primitive

```css
@import "tailwindcss";

@theme {
  --color-violet-400: #6E79D6;
  --color-violet-500: #5E6AD2;
  --color-violet-600: #4E5BBF;
  --radius-chip: 4px;
  --radius-control: 6px;
  --radius-card: 8px;
  --radius-modal: 12px;
  --font-sans: var(--font-inter), var(--font-noto-kufi), sans-serif;
  --font-mono: var(--font-jetbrains), monospace;
}

:root {
  --color-bg: #FAFAFC;
  --color-surface: #F3F3F7;
  --color-text-primary: #16161C;
}

.dark {
  --color-bg: #101014;
  --color-surface: #1F1F2E;
  --color-text-primary: #F1F1F4;
}
```

**Done when:** the styleguide is correct in both themes and no hex literal appears in any component.

**⚙️ Skill:** `design-system`

---

#### Phase 2 — Bilingual, RTL, and Theme

**Deliverables**
- `src/app/[locale]/` structure with `next-intl`
- `proxy.ts` for locale routing (not `middleware.ts`)
- `messages/ar.json` and `messages/en.json`, namespaced (`home.hero.title`)
- Dynamic `<html lang dir>`
- **Logical CSS properties only:** `ps-` `pe-` `ms-` `me-` `start-` `end-` `text-start` — never `pl-` `pr-` `left-` `right-`
- Language switcher that preserves the current path
- `next-themes` with FOUC prevention and system-preference support
- Per-language typography rules from §1.4
- `hreflang` alternates in metadata

**Done when:** switching language flips direction with nothing broken, and switching theme causes no flash on reload.

**⚙️ Skills:** `i18n-keys`, `rtl-check`

---

#### Phase 3 — App Shell

**Deliverables**
- Sticky header that condenses on scroll, plus a mobile menu
- Footer with contact and social links
- Lenis mounted via `<ReactLenis root>` in the layout
- Lenis synced with motion's `useScroll` — otherwise scroll math desyncs
- **Lenis disabled under `prefers-reduced-motion`**
- Primitives: `Button` `Card` `Chip` `Container` `SectionHeading` `StatusCircle`

**Done when:** scrolling is smooth, keyboard navigation works, and focus rings are clearly visible.

**⚙️ Skill:** `motion-patterns`

---

#### Phase 4 — Hero: Interactive Background + Parallax

**Deliverables**
- Chosen reactbits background integrated with every §3 rule applied
- Cursor interaction verified on desktop; graceful no-op on touch
- Multi-layer parallax driven by `useScroll` + `useTransform`
- Orchestrated headline entrance (word-level stagger)
- Scroll cue at the bottom
- A genuinely attractive static fallback — never a black rectangle

**Done when:** LCP < 2.5s on throttled 4G, animation holds 60fps on a mid-range laptop, and the cursor effect is visibly responsive within one frame.

**⚙️ Skill:** `reactbits-background`

---

#### Phase 5 — Home Sections

Order: About (short) → Services → Selected Work → Testimonials → Clients → Contact.

**Deliverables**
- One component per section under `src/components/sections/`
- All data via the `content` repository — no hardcoded copy in components
- Shared `Reveal` wrapper for scroll animations
- Client logo marquee that pauses on hover
- Draggable testimonial carousel

**Done when:** editing one JSON file changes the whole section, and every string exists in both languages.

**⚙️ Skill:** `section-component`

---

#### Phase 6 — Inner Pages

- `/about` — story, values, team, timeline (use `StatusCircle` here)
- `/services` and `/services/[slug]`
- `/portfolio` and `/portfolio/[slug]` with category filtering
- `/contact` — form, map, contact details
- `/blog` and `/blog/[slug]` — local MDX at this stage

Reference for blog structure and depth: `https://apex.ps/en/blog`.

**Done when:** every page works in both locales and `generateStaticParams` builds all routes.

---

#### Phase 7 — Contact Form (no backend yet)

**Deliverables**
- `react-hook-form` + `zod` with translated error messages
- A Server Action that logs and returns success — replaced in Phase 14
- Honeypot field and client-side rate limiting
- States: idle / submitting / success / error

**Done when:** errors read correctly in both languages and the form is fully keyboard- and screen-reader-operable.

---

#### Phase 8 — Polish and Deploy ⭐ Client-demo milestone

**Deliverables**
- Metadata, dynamic OG images, `sitemap.ts`, `robots.ts`
- JSON-LD: `Organization`, `WebSite`, `BreadcrumbList`, `Article`
- Lighthouse ≥ 95 across all four categories
- Accessibility pass: contrast, focus order, landmarks, alt text, labels
- Designed `not-found`, `error`, and `loading` states
- Real-device testing — iOS Safari is the usual WebGL failure point
- `main` deployed to Vercel with a custom domain

**Done when:** the URL is ready to put in a freelance portfolio.

**⚙️ Skill:** `seo-page`

---

### 🔵 Track B — Laravel (the learning objective)

> **Binding rule for every phase below:** every file, function, or package added must ship with an explanation in `docs/learning/NN-topic.md` answering: **What is it? · Why is it here? · What was the alternative and why was it rejected? · What breaks if it is removed?**
> This is enforced automatically by the `laravel-teach` skill.

---

#### Phase 9 — Laravel Foundations

**Deliverables**
- `company-site-api` repo, Laravel 12, local MySQL
- Directory structure understood; `php artisan serve` running
- `.env` and configuration
- First controller, first route, first JSON response
- Understand `routes/api.php` vs `routes/web.php` — this split is load-bearing for §0.2

**Topics to write up:** request lifecycle · service container and dependency injection · facades and why they are debated · Artisan · environment configuration

**⚙️ Skill:** `laravel-teach` — authored here, active for every phase after

---

#### Phase 10 — Data Modeling

**Deliverables**
- Migrations: `services` `projects` `testimonials` `clients` `posts` `categories` `contact_messages` `settings` `users`
- Models with relationships, `$fillable`, `casts`
- Factories and seeders loaded with the same data as the frontend mock files
- **Translations:** JSON columns (`title` holds `{"ar": "...", "en": "..."}`) with an accessor that resolves by request locale

**Topics to write up:** Eloquent ORM · why migrations instead of editing the database by hand · hasMany / belongsTo / belongsToMany · accessors, mutators, casts · factories and seeders · JSON columns vs. separate translation tables, and why JSON wins at this scale

**⚙️ Skill:** `laravel-resource`

---

#### Phase 11 — Public JSON API

**Deliverables**
- An API Resource per model
- Form Requests for validation
- Versioned routes under `/api/v1`
- Rate limiting on `POST /contact`
- CORS configured for the Vercel origin
- Uniform error envelope
- `docs/api-contract.md` matching the TypeScript types field for field

```
GET  /api/v1/services
GET  /api/v1/services/{slug}
GET  /api/v1/projects?category=&page=
GET  /api/v1/projects/{slug}
GET  /api/v1/testimonials
GET  /api/v1/clients
GET  /api/v1/posts?page=
GET  /api/v1/posts/{slug}
GET  /api/v1/settings
POST /api/v1/contact
```

**Topics to write up:** API Resources and why models are never returned directly · Form Requests and separating validation from business logic · middleware · throttling · CORS · pagination

**⚙️ Skill:** `api-contract`

---

#### Phase 12 — Inertia + React Admin Setup

**Deliverables**
- `laravel/breeze` with the React + Inertia preset — gives auth, Inertia, and Vite in one step
- `HandleInertiaRequests` middleware configured with shared props (authenticated user, flash messages, locale)
- Admin layout built against the **original** Violet Issue spec: 220px collapsible sidebar, 32px controls, 36px rows, 150ms transitions
- Design tokens copied from the frontend repo into the Laravel app's CSS, with a note in `docs/design-decisions.md` that they must be kept in sync
- Ziggy wired so React can call named Laravel routes
- Roles and policies: admin / editor
- Command palette (Cmd+K) — the design system treats this as the primary navigation pattern, not a nice-to-have

**Topics to write up:** what Inertia actually is — not an API, not a full SPA, but a protocol that returns page components with props · `Inertia::render()` vs `view()` vs `JsonResource` · shared data and how it reaches every page without prop drilling · session auth and CSRF vs token auth · why Inertia was chosen over Blade + Livewire (React skills transfer from the frontend) and over Filament (it would hide exactly what you are trying to learn) · Vite in a Laravel context

**⚙️ Skill:** `inertia-page`

---

#### Phase 13 — Admin CRUD, Media, and Inbox

**Deliverables**
- Full CRUD for every resource: index with filters, sort, pagination; create/edit forms; delete confirmation
- Bilingual field editing — an `ar` / `en` tab pair on every translatable input
- Image upload: `storage:link`, validation, thumbnails, drag-to-reorder galleries
- Rich text editor for blog posts
- Contact inbox: read/unread, archive, delete, CSV export
- Site settings page: contact details, social links, section copy
- Email notification on new contact message, queued
- Reorderable sections and drag-to-sort service and project ordering

**Topics to write up:** `useForm` from `@inertiajs/react` and how Laravel validation errors arrive in React automatically · partial reloads and `only` · flash messages via shared props · file storage and Laravel disks · queues, jobs, and workers · events and listeners · gates and policies applied to Inertia responses

**⚙️ Skill:** `inertia-crud`

---

#### Phase 14 — Integration 🔗

All of this happens on `feat/api-integration` in the frontend repo.

**Deliverables**
- `api-repository.ts` implementing the exact interface in `repository.ts`
- `NEXT_PUBLIC_DATA_SOURCE=api` and `API_URL` configured
- Caching: `"use cache"` + `cacheTag('services')`, invalidated by a webhook that the admin panel calls on every save via `revalidateTag`
- Contact form Server Action rewired to `POST /api/v1/contact`
- Network error handling with a safe fallback to mock data if the API is unreachable
- Backend images served through `next/image` via `remotePatterns`

**Done when:** editing text in the admin panel appears on the site within seconds, and stopping the backend does not take the site down.

---

#### Phase 15 — Deployment and Hardening

- Laravel deployed (Forge, or VPS with Nginx + PHP-FPM)
- HTTPS, scheduled database backups
- `APP_DEBUG=false`, security headers, CSRF verified
- `config:cache`, `route:cache`, `view:cache`
- Supervisor for the queue worker, cron for the scheduler
- Error monitoring (Sentry)
- `feat/api-integration` merged into `main`

**Topics to write up:** deployment environments · Laravel performance caching · Supervisor · the scheduler

---

## 5. Skills for Claude Code

Location: `.claude/skills/<name>/SKILL.md`. The goal is that no prompt is ever written twice.

### Priority 1 — author these first

| # | Name | Triggers on | Contains |
|---|---|---|---|
| 1 | `design-system` | any CSS or component work | all tokens, light/dark map, do's and don'ts from the design file, documented deviations, marketing-vs-admin density rule, **no raw hex** |
| 2 | `laravel-teach` | any Laravel file created | the mandatory explanation template (what / why / alternative / what breaks), path convention `docs/learning/`, assumed reader knows PHP but not Laravel |
| 3 | `section-component` | new marketing section | folder layout, `Reveal` wrapper, data via `content`, translation keys, RTL check, a11y requirements |
| 4 | `i18n-keys` | any new string | key naming, edit `ar.json` and `en.json` together, logical-properties rule, Noto Kufi line-height and tracking rules |

### Priority 2

| # | Name | Contains |
|---|---|---|
| 5 | `laravel-resource` | full checklist for a new resource: migration → model → factory → seeder → FormRequest → controller → API Resource → policy → route → test, each step explained |
| 6 | `motion-patterns` | shared variants, duration rules (150ms micro / 400–700ms reveal), Lenis↔motion wiring, mandatory `prefers-reduced-motion` |
| 7 | `inertia-page` | anatomy of an Inertia page: controller → `Inertia::render` → props → React page component → layout, plus shared-props access |
| 8 | `inertia-crud` | full admin CRUD template: index table with filters and pagination, `useForm` create/edit, validation error display, delete confirmation, flash messages — in Violet Issue admin styling |
| 9 | `api-contract` | keeping TypeScript types and API Resources identical; update `docs/api-contract.md` on every change |
| 10 | `content-repository` | adding new content: type in `types.ts` → method on `repository.ts` → mock JSON → mock impl → (later) api impl |

### Priority 3

| # | Name | Contains |
|---|---|---|
| 11 | `reactbits-background` | safe integration: `ssr:false`, IntersectionObserver pause, reduced-motion and mobile fallbacks, theme-color props, rAF-throttled pointer handling |
| 12 | `seo-page` | metadata, hreflang, OG, JSON-LD, sitemap registration |
| 13 | `rtl-check` | pre-commit checklist: no physical properties, directional icons mirrored, numerals and dates, form alignment, Arabic typography rules applied |

### Bootstrap prompt for Claude Code

```
Read PROJECT-PLAN.md, then create skills 1–4 under .claude/skills/

Each skill lives in its own directory with a SKILL.md containing:
- frontmatter with `name` and a `description` that precisely states when to trigger
- actionable rules, not general advice
- correct and incorrect code examples side by side

Do not write any project code until I approve the skills.
```

---

## 6. `CLAUDE.md`

```markdown
# Project Context

Software agency website. Goals in priority order:
1. Modern, distinctive design
2. Learn Laravel — everything gets explained

## Standing Rules
- Full plan lives in PROJECT-PLAN.md — read it before any task
- Design system: violet-issue-DESIGN.md + docs/design-decisions.md
- All docs, comments, and commits in English. Site content is bilingual.
- No raw hex in components — design tokens only
- No physical CSS properties (pl/pr/left/right) — logical only
- Every new string goes into both ar.json and en.json
- No fetch inside components — go through src/lib/content
- Every Laravel file ships with docs/learning/ notes
- Every animation respects prefers-reduced-motion
- Next.js 16: params is a Promise; the file is proxy.ts, not middleware.ts
- Marketing site uses the extended spacing/motion scale; the admin panel uses
  the original dense Violet Issue spec

## Current State
Phase: 0
Branch: main
```

---

## 7. Timeline Estimate

| Track | Phases | At 2–3 hrs/day |
|---|---|---|
| Frontend | 0 → 8 | 3–4 weeks |
| Laravel + Inertia admin | 9 → 13 | 5–7 weeks (longer by design — it is the learning track) |
| Integration and deploy | 14 → 15 | 1 week |

**Sequencing rule:** do not start Laravel until the Vercel URL is live and presentable. That guarantees a shippable artifact even if the backend stalls.

---

## 8. Next Actions

1. Confirm the hero background: `Threads` (recommended) or `LiquidEther` (higher impact, higher cost)
2. Run Phase 0 and author skills 1–4
3. Complete Phase 1 in full before building any component

Per-phase execution prompts will be written separately, one per phase, in English.

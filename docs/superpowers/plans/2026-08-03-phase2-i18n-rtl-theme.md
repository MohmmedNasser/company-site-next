# Phase 2 — Bilingual Routing, RTL, and Theme Switching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up `next-intl` locale routing (`/ar` default, `/en`) with RTL-correct layout, wire `next-themes` for flash-free theme switching, and build the mock content repository (types, interface, JSON seed data, mock + API-stub implementations) that later phases will consume — with zero marketing components and zero section copy in `messages/*.json`.

**Architecture:** `src/app/[locale]/layout.tsx` becomes the root layout (no `src/app/layout.tsx` — Next.js explicitly supports a root layout under a dynamic segment). `proxy.ts` at the project root runs `next-intl`'s middleware. A root `src/app/not-found.tsx` (with its own `<html>`) catches the one case where the locale layout calls `notFound()` before it can render `<html>` itself — an unrecognized locale segment. Content lives behind `src/lib/content`, an interface with a mock JSON-backed implementation today and a throwing stub for the Phase 14 API implementation.

**Tech Stack:** Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind v4, `next-intl`, `next-themes`, pnpm.

## Global Constraints

- Install nothing beyond `next-intl` and `next-themes` — no other package additions this phase.
- Locales: `en`, `ar`. Default: `ar`. Always show the prefix (`/` → `/ar`).
- The middleware file is `proxy.ts` at the project root, not `middleware.ts` — Next.js 16 renamed the convention.
- `params` is a `Promise` in every layout/page: `const { locale } = await params;`.
- No physical CSS properties anywhere (`pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`) — logical only (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`, `text-end`).
- No raw hex/`rgb()`/arbitrary color values in any component — semantic tokens from `src/styles/tokens.css` only (see `.claude/skills/design-system/SKILL.md`).
- No hardcoded user-facing strings — every string goes through `useTranslations()`/`getTranslations()`, and every string added to `messages/en.json` must be added to `messages/ar.json` in the same commit, same key position (see `.claude/skills/i18n-keys/SKILL.md`).
- No section copy in `messages/*.json` — hero copy and per-section heading/description live in `src/lib/content/mock/settings.json` as `{ ar, en }`, because Phase 14 swaps the data source, not the shape (`docs/design-decisions.md` "Translation ownership").
- No `fetch` inside any component or page — everything goes through `src/lib/content`.
- Build no marketing components. Phase 3 owns the shell, Phase 5 owns the sections.
- Every human-readable content field is `Localized` (`{ ar: string; en: string }`); slugs, ids, icon names, urls, dates, and ordering fields are plain strings/numbers (`docs/PROJECT-PLAN.md` §0.4).
- Every content-repository method is `async`, even the mock — call sites must not change in Phase 14.
- Arabic copy is written for an Arabic reader, not machine-translated — plain verbs, no forced technical-term translation (`.claude/skills/i18n-keys/SKILL.md` "Writing the copy itself").

---

### Task 1: Install dependencies and wire the next-intl Next.js plugin

**Files:**

- Modify: `package.json` (dependency additions only — via `pnpm add`)
- Modify: `next.config.ts`

**Interfaces:**

- Produces: `withNextIntl` config wrapper reading `src/i18n/request.ts` (created in Task 2) — required before Task 2's config file will have any effect.

- [ ] **Step 1: Install the two packages**

Run: `pnpm add next-intl next-themes`

- [ ] **Step 2: Wrap `next.config.ts` with the next-intl plugin**

```ts
// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {/* config options here */};

export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Verify install**

Run: `pnpm typecheck`
Expected: FAILS with "Cannot find module './src/i18n/request.ts'" (or similar) — this is expected until Task 2. Confirm the error is about the missing request-config file, not about the two new packages failing to resolve.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts
git commit -m "chore: install next-intl and next-themes, wire next-intl Next.js plugin"
```

---

### Task 2: i18n routing configuration

**Files:**

- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/i18n/navigation.ts`

**Interfaces:**

- Consumes: nothing (foundational).
- Produces: `routing` (locales `["en", "ar"]`, `defaultLocale: "ar"`) consumed by `proxy.ts` (Task 3) and `src/app/[locale]/layout.tsx` (Task 5); `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `src/i18n/navigation.ts` consumed by the styleguide language switcher (Task 9) and the locale `not-found.tsx` (Task 5).

- [ ] **Step 1: Write the routing config**

```ts
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "ar",
  // Always show the locale prefix — "/" redirects to "/ar", never renders
  // unprefixed content.
  localePrefix: "always",
  // Disabled so "/" always redirects to defaultLocale ("/ar") regardless of
  // the visitor's Accept-Language header or a previously set cookie. Without
  // this, a browser set to English would land on "/en" instead — which
  // contradicts the "/ redirects to /ar" requirement this phase verifies.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 2: Write the request config**

```ts
// src/i18n/request.ts
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Write the navigation helpers**

```ts
// src/i18n/navigation.ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`
Expected: The "Cannot find module './src/i18n/request.ts'" error from Task 1 is gone. Remaining errors (if any) should only be about `messages/en.json` / `messages/ar.json` not existing yet — expected until Task 4.

- [ ] **Step 5: Commit**

```bash
git add src/i18n
git commit -m "feat(i18n): add next-intl routing, request, and navigation config"
```

---

### Task 3: proxy.ts — locale routing middleware

**Files:**

- Create: `proxy.ts` (project root)

**Interfaces:**

- Consumes: `routing` from `src/i18n/routing.ts` (Task 2).

- [ ] **Step 1: Write proxy.ts**

```ts
// proxy.ts
//
// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`. The
// exported function's behavior and signature are unchanged from what
// `middleware.ts` used to do — only the filename changed. Do not rename this
// back to `middleware.ts`; that convention is deprecated as of Next 16, and
// any guide referencing `middleware.ts` predates the rename.
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on every path except API routes, Next.js internals, Vercel
  // internals, and any request for a path with a file extension (static
  // assets like favicon.ico, images, etc).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 2: Verify with the dev server**

Run: `pnpm dev`, then in a browser visit `http://localhost:3000/`.
Expected: redirects to `http://localhost:3000/ar` (the page itself will 404-ish/render blank at this point — no `[locale]` route exists until Task 5 — but the redirect must happen). Stop the dev server after confirming.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat(i18n): add proxy.ts for next-intl locale routing"
```

---

### Task 4: Message files and the i18n parity check

**Files:**

- Create: `messages/en.json`
- Create: `messages/ar.json`
- Create: `scripts/check-i18n.mjs`
- Modify: `package.json` (add `check:i18n` script, extend `lint-staged`)

**Interfaces:**

- Produces: the `common.*` and `notFound.*` translation keys consumed by `src/app/[locale]/layout.tsx`, `src/app/[locale]/not-found.tsx` (Task 5), and the styleguide (Task 9).

- [ ] **Step 1: Write messages/en.json**

```json
{
  "common": {
    "nav": {
      "home": "Home",
      "about": "About",
      "services": "Services",
      "portfolio": "Portfolio",
      "blog": "Blog",
      "contact": "Contact"
    },
    "actions": {
      "readMore": "Read more",
      "viewAll": "View all",
      "submit": "Submit",
      "sending": "Sending…",
      "backToTop": "Back to top",
      "learnMore": "Learn more"
    },
    "theme": {
      "light": "Light",
      "dark": "Dark",
      "system": "System"
    },
    "locale": {
      "switchToArabic": "Switch to Arabic",
      "switchToEnglish": "Switch to English"
    },
    "errors": {
      "required": "This field is required",
      "invalidEmail": "Enter a valid email address",
      "tooShort": "This is too short",
      "somethingWentWrong": "Something went wrong. Please try again."
    },
    "a11y": {
      "skipToContent": "Skip to content",
      "openMenu": "Open menu",
      "closeMenu": "Close menu",
      "toggleTheme": "Toggle theme"
    }
  },
  "notFound": {
    "title": "Page not found",
    "description": "The page you're looking for doesn't exist or has moved.",
    "backHome": "Back to home"
  }
}
```

- [ ] **Step 2: Write messages/ar.json — same key order**

```json
{
  "common": {
    "nav": {
      "home": "الرئيسية",
      "about": "من نحن",
      "services": "الخدمات",
      "portfolio": "أعمالنا",
      "blog": "المدونة",
      "contact": "تواصل معنا"
    },
    "actions": {
      "readMore": "اقرأ المزيد",
      "viewAll": "عرض الكل",
      "submit": "إرسال",
      "sending": "جارٍ الإرسال…",
      "backToTop": "العودة للأعلى",
      "learnMore": "تعرف أكثر"
    },
    "theme": {
      "light": "فاتح",
      "dark": "داكن",
      "system": "تلقائي"
    },
    "locale": {
      "switchToArabic": "التبديل إلى العربية",
      "switchToEnglish": "التبديل إلى الإنجليزية"
    },
    "errors": {
      "required": "هذا الحقل مطلوب",
      "invalidEmail": "أدخل بريدًا إلكترونيًا صحيحًا",
      "tooShort": "هذا قصير جدًا",
      "somethingWentWrong": "حدث خطأ ما، حاول مرة أخرى"
    },
    "a11y": {
      "skipToContent": "تخطَّ إلى المحتوى",
      "openMenu": "فتح القائمة",
      "closeMenu": "إغلاق القائمة",
      "toggleTheme": "تبديل المظهر"
    }
  },
  "notFound": {
    "title": "الصفحة غير موجودة",
    "description": "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    "backHome": "العودة للرئيسية"
  }
}
```

- [ ] **Step 3: Write the parity check script**

```js
// scripts/check-i18n.mjs
import { readFileSync } from "node:fs";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );

const en = flatten(JSON.parse(readFileSync("messages/en.json", "utf8")));
const ar = flatten(JSON.parse(readFileSync("messages/ar.json", "utf8")));

const missingInAr = en.filter((k) => !ar.includes(k));
const missingInEn = ar.filter((k) => !en.includes(k));

if (missingInAr.length || missingInEn.length) {
  console.error("i18n parity check failed");
  if (missingInAr.length) console.error("Missing in ar.json:", missingInAr);
  if (missingInEn.length) console.error("Missing in en.json:", missingInEn);
  process.exit(1);
}

console.log(`i18n parity OK — ${en.length} keys`);
```

- [ ] **Step 4: Wire package.json**

Add a `"check:i18n"` script and a `lint-staged` entry that runs it whenever `messages/*.json` changes, alongside the existing prettier rule for the same glob:

```json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "check:i18n": "node scripts/check-i18n.mjs",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"],
    "messages/*.json": ["node scripts/check-i18n.mjs"]
  }
}
```

- [ ] **Step 5: Verify**

Run: `pnpm check:i18n`
Expected: `i18n parity OK — 20 keys`

Run: `pnpm typecheck`
Expected: The "Cannot find module" errors referencing `messages/*.json` from Task 2 are gone.

- [ ] **Step 6: Commit**

```bash
git add messages scripts/check-i18n.mjs package.json
git commit -m "feat(i18n): seed UI-chrome message files and add the i18n parity check"
```

---

### Task 5: Restructure the app directory under [locale]

**Files:**

- Delete: `src/app/layout.tsx` (replaced by `src/app/[locale]/layout.tsx`)
- Move: `src/app/page.tsx` → `src/app/[locale]/page.tsx` (content unchanged)
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/not-found.tsx`
- Create: `src/app/not-found.tsx`

**Interfaces:**

- Consumes: `routing` from `src/i18n/routing.ts` (Task 2); `content` and `pick` from `src/lib/content` (Tasks 6–8 — this task can be done in parallel with 6–8 since the layout only calls `content.getSettings()`, which type-checks against the interface regardless of which implementation backs it; run `pnpm typecheck` at the end of Task 8 to catch any mismatch).
- Produces: the `<html lang dir>` root layout, theme + intl providers, and locale guard that every later phase's pages render inside.

- [ ] **Step 1: Delete the old root layout and move page.tsx**

```bash
git rm src/app/layout.tsx
mkdir -p "src/app/[locale]"
git mv src/app/page.tsx "src/app/[locale]/page.tsx"
```

- [ ] **Step 2: Write the locale layout**

```tsx
// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { routing } from "@/i18n/routing";
import { content, pick } from "@/lib/content";
import { inter, jetbrainsMono, notoKufi } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await content.getSettings();
  const title = pick(settings.hero.title, locale);
  const description = pick(settings.hero.subtitle, locale);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: { default: title, template: `%s · ${title}` },
    description,
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
        "x-default": "/ar",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    // Thrown before <html> renders below — src/app/not-found.tsx (the root
    // fallback, outside this segment) supplies the <html>/<body> for this
    // case, since no layout above this one exists to do it.
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${inter.variable} ${notoKufi.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Write the locale not-found page**

```tsx
// src/app/[locale]/not-found.tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="mx-auto flex min-h-screen max-w-[1280px] flex-col items-center justify-center gap-16 px-24 text-center">
      <p className="text-primary text-14 font-mono">404</p>
      <h1 className="text-32 text-text-primary font-semibold">{t("title")}</h1>
      <p className="text-16 text-text-secondary max-w-[480px]">
        {t("description")}
      </p>
      <Link
        href="/"
        className="rounded-control border-border text-14 text-text-primary hover:bg-surface border px-16 py-8"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Write the root not-found fallback**

```tsx
// src/app/not-found.tsx
//
// Reached only when app/[locale]/layout.tsx calls notFound() for an
// unrecognized locale segment (e.g. a request for "/fr") — at that point
// no layout in the tree has rendered <html> yet, so this file must supply
// its own complete document. This mirrors Next.js's documented pattern for
// a root layout under a dynamic segment (docs/app/api-reference/
// file-conventions/not-found.md — "the root app/not-found.js ... handle[s]
// any unmatched URLs for your whole application").
//
// This file cannot call useTranslations()/getTranslations(): it renders
// precisely when locale resolution has failed, before
// NextIntlClientProvider or any request-locale context exists — there is
// no "current locale" to translate into. Do not "fix" this into a
// translation-key call; it will throw at runtime with no locale in scope.
// Both languages are hardcoded side by side instead, since a real visitor
// landing here (a mistyped locale prefix) may read only Arabic.
import "./globals.css";
import { inter, jetbrainsMono, notoKufi } from "./fonts";

export default function RootNotFound() {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoKufi.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-text-primary flex min-h-screen flex-col items-center justify-center gap-16 px-24 text-center">
        <p className="text-primary text-14 font-mono">404</p>
        <h1 className="text-32 font-semibold">
          <span lang="en">Page not found</span>
          {" / "}
          <span lang="ar" dir="rtl">
            الصفحة غير موجودة
          </span>
        </h1>
        <p className="text-text-secondary text-16 max-w-[480px]" lang="en">
          The page you&rsquo;re looking for doesn&rsquo;t exist.
        </p>
        <p
          className="text-text-secondary text-16 max-w-[480px]"
          lang="ar"
          dir="rtl"
        >
          الصفحة التي تبحث عنها غير موجودة.
        </p>
        <a
          href="/ar"
          className="rounded-control border-border text-14 text-text-primary hover:bg-surface border px-16 py-8"
        >
          <span lang="en">Back home</span>
          {" / "}
          <span lang="ar" dir="rtl">
            العودة للرئيسية
          </span>
        </a>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify structure**

Run: `pnpm typecheck`
Expected: errors only from `src/lib/content` not existing yet (Tasks 6–8) — no errors about the `[locale]` structure itself, `next-intl` imports, or `next-themes`.

- [ ] **Step 6: Commit**

```bash
git add -A "src/app"
git commit -m "feat(i18n): restructure app directory under [locale] with theme and intl providers"
```

---

### Task 6: Content repository types and interface

**Files:**

- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/repository.ts`
- Create: `src/lib/content/locale.ts`

**Interfaces:**

- Produces: `Localized`, `Service`, `Project`, `Testimonial`, `Client`, `Post`, `SiteSettings` (types.ts); `ContentRepository`, `ContactPayload`, `ContactResult`, `ProjectFilter` (repository.ts); `pick(localized, locale)` (locale.ts) — consumed by Tasks 5, 7, 8, 9.

- [ ] **Step 1: Write types.ts**

```ts
// src/lib/content/types.ts

export type Localized = { ar: string; en: string };

export interface Service {
  id: string;
  slug: string;
  icon: string; // lucide-react icon name, installed in Phase 3
  order: number;
  title: Localized;
  excerpt: Localized;
  body: Localized;
}

export interface Project {
  id: string;
  slug: string;
  category: string;
  status: "shipped" | "in-development";
  client: string; // Client.id
  coverImage: string;
  order: number;
  title: Localized;
  summary: Localized;
  description: Localized;
}

export interface Testimonial {
  id: string;
  clientId: string; // Client.id
  avatar: string;
  order: number;
  author: Localized;
  role: Localized;
  quote: Localized;
}

export interface Client {
  id: string;
  logo: string;
  url: string;
  order: number;
  name: Localized;
}

export interface Post {
  id: string;
  slug: string;
  coverImage: string;
  publishedAt: string; // ISO date
  order: number;
  author: Localized;
  title: Localized;
  excerpt: Localized;
  body: Localized;
}

interface SectionCopy {
  heading: Localized;
  description: Localized;
}

export interface SiteSettings {
  hero: {
    title: Localized;
    subtitle: Localized;
    ctaPrimary: Localized;
    ctaSecondary: Localized;
  };
  sections: {
    about: SectionCopy;
    services: SectionCopy;
    portfolio: SectionCopy;
    testimonials: SectionCopy;
    clients: SectionCopy;
    contact: SectionCopy;
  };
  contact: {
    email: string;
    phone: string;
    address: Localized;
  };
  social: { platform: string; url: string }[];
}
```

- [ ] **Step 2: Write repository.ts**

```ts
// src/lib/content/repository.ts
import type {
  Client,
  Post,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from "./types";

export interface ProjectFilter {
  category?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactResult {
  success: boolean;
}

export interface ContentRepository {
  getServices(): Promise<Service[]>;
  getService(slug: string): Promise<Service | null>;
  getProjects(filter?: ProjectFilter): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  getTestimonials(): Promise<Testimonial[]>;
  getClients(): Promise<Client[]>;
  getPosts(page?: number): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;
  getSettings(): Promise<SiteSettings>;
  submitContact(payload: ContactPayload): Promise<ContactResult>;
}
```

- [ ] **Step 3: Write the locale resolver helper**

```ts
// src/lib/content/locale.ts
import type { Localized } from "./types";

// Admin panel (Phase 13) surfaces incomplete translations rather than
// hiding them — this fallback only affects what the public site renders.
export function pick(localized: Localized, locale: string): string {
  if (locale === "ar" && localized.ar) {
    return localized.ar;
  }
  return localized.en;
}
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`
Expected: no new errors from these three files (errors about `src/lib/content/index.ts` / `mock/mock-repository` not existing yet are expected until Task 8).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/types.ts src/lib/content/repository.ts src/lib/content/locale.ts
git commit -m "feat(content): add content repository types, interface, and locale resolver"
```

---

### Task 7: Mock content data

**Files:**

- Create: `src/lib/content/mock/services.json`
- Create: `src/lib/content/mock/clients.json`
- Create: `src/lib/content/mock/projects.json`
- Create: `src/lib/content/mock/testimonials.json`
- Create: `src/lib/content/mock/posts.json`
- Create: `src/lib/content/mock/settings.json`

**Interfaces:**

- Consumes: shapes from `src/lib/content/types.ts` (Task 6).
- Produces: JSON fixtures consumed by `src/lib/content/mock/mock-repository.ts` (Task 8).

- [ ] **Step 1: Write services.json (6 services)**

```json
[
  {
    "id": "svc-web-development",
    "slug": "web-development",
    "icon": "Globe",
    "order": 1,
    "title": { "en": "Web Development", "ar": "تطوير الويب" },
    "excerpt": {
      "en": "Fast, accessible websites and web apps built on Next.js and modern tooling.",
      "ar": "مواقع وتطبيقات ويب سريعة وسهلة الوصول، مبنية على Next.js وأدوات حديثة."
    },
    "body": {
      "en": "We build marketing sites, dashboards, and web applications that load fast, hold up under real traffic, and stay easy to change six months after launch. Every project ships with clean component architecture and a content layer your team can edit without touching code.",
      "ar": "نبني مواقع تعريفية ولوحات تحكم وتطبيقات ويب تُحمَّل بسرعة وتتحمل حركة زوار حقيقية، وتبقى سهلة التعديل بعد الإطلاق بأشهر. كل مشروع يخرج بمعمارية مكونات نظيفة وطبقة محتوى يمكن لفريقك تعديلها دون لمس الكود."
    }
  },
  {
    "id": "svc-mobile-apps",
    "slug": "mobile-apps",
    "icon": "Smartphone",
    "order": 2,
    "title": { "en": "Mobile App Development", "ar": "تطوير تطبيقات الجوال" },
    "excerpt": {
      "en": "Native-feeling iOS and Android apps from a single React Native codebase.",
      "ar": "تطبيقات iOS وAndroid بأداء قريب من التطبيقات الأصلية، من كود React Native واحد."
    },
    "body": {
      "en": "From the first wireframe to an App Store listing, we handle the full mobile build: offline support, push notifications, and a release pipeline your team can keep shipping through after we hand off.",
      "ar": "من أول تصميم أولي حتى النشر على المتاجر، نتولى بناء التطبيق بالكامل: العمل دون اتصال، الإشعارات، وخط نشر يمكن لفريقك الاستمرار في استخدامه بعد التسليم."
    }
  },
  {
    "id": "svc-ui-ux-design",
    "slug": "ui-ux-design",
    "icon": "PenTool",
    "order": 3,
    "title": {
      "en": "UI/UX Design",
      "ar": "تصميم واجهات وتجربة المستخدم"
    },
    "excerpt": {
      "en": "Interface design grounded in a real design system, not a one-off Figma file.",
      "ar": "تصميم واجهات مبني على نظام تصميم حقيقي، لا ملف Figma منفصل يُستخدم مرة واحدة."
    },
    "body": {
      "en": "We design in tokens from day one — color, type, spacing, and motion — so what ships in production matches the mockups pixel for pixel, and stays consistent as the product grows past the first release.",
      "ar": "نصمم باستخدام رموز تصميم (tokens) منذ البداية — الألوان، الخطوط، المسافات، والحركة — بحيث يطابق ما يُنشر فعليًا التصاميم بدقة، ويبقى متسقًا مع نمو المنتج بعد الإصدار الأول."
    }
  },
  {
    "id": "svc-backend-laravel",
    "slug": "backend-laravel",
    "icon": "Server",
    "order": 4,
    "title": {
      "en": "Backend & Laravel Engineering",
      "ar": "هندسة الخلفية البرمجية وLaravel"
    },
    "excerpt": {
      "en": "APIs, admin panels, and data models built on Laravel, done properly.",
      "ar": "واجهات برمجية، لوحات تحكم، ونماذج بيانات مبنية على Laravel بشكل احترافي."
    },
    "body": {
      "en": "Migrations instead of hand-edited databases, jobs and queues for anything that shouldn't block a request, and a REST API your frontend team can rely on without guessing at undocumented behavior.",
      "ar": "ترحيلات (migrations) بدل تعديل قواعد البيانات يدويًا، مهام وطوابير (queues) لكل ما لا يجب أن يُبطئ الطلب، وواجهة REST يمكن لفريق الواجهة الأمامية الاعتماد عليها دون تخمين سلوك غير موثّق."
    }
  },
  {
    "id": "svc-devops-cloud",
    "slug": "devops-cloud",
    "icon": "Cloud",
    "order": 5,
    "title": {
      "en": "DevOps & Cloud Infrastructure",
      "ar": "DevOps والبنية السحابية"
    },
    "excerpt": {
      "en": "Deployment pipelines and server infrastructure that stay up without a pager going off every week.",
      "ar": "خطوط نشر وبنية خوادم تعمل باستقرار دون إنذارات متكررة كل أسبوع."
    },
    "body": {
      "en": "CI/CD, monitoring, backups, and infrastructure as code — set up once, documented, and handed off with a runbook instead of tribal knowledge trapped in one engineer's head.",
      "ar": "تكامل ونشر مستمر (CI/CD)، مراقبة، نسخ احتياطي، وبنية تحتية ككود — تُعد مرة واحدة، وتُوثّق، وتُسلَّم مع دليل تشغيل بدل معرفة حبيسة في رأس مهندس واحد."
    }
  },
  {
    "id": "svc-technical-consulting",
    "slug": "technical-consulting",
    "icon": "Compass",
    "order": 6,
    "title": { "en": "Technical Consulting", "ar": "استشارات تقنية" },
    "excerpt": {
      "en": "An outside technical read on your stack, your team, or a build-vs-buy decision.",
      "ar": "رأي تقني خارجي حول بنيتكم التقنية، فريقكم، أو قرار البناء مقابل الشراء."
    },
    "body": {
      "en": "Architecture reviews, code audits, and vendor evaluations for teams that need a second opinion before a decision that's expensive to reverse.",
      "ar": "مراجعات معمارية، تدقيق كود، وتقييم موردين للفرق التي تحتاج رأيًا ثانيًا قبل قرار مكلف التراجع عنه."
    }
  }
]
```

- [ ] **Step 2: Write clients.json (6 clients)**

```json
[
  {
    "id": "client-ferry-logistics",
    "name": { "en": "Ferry Logistics", "ar": "فيري للخدمات اللوجستية" },
    "logo": "/clients/ferry-logistics.svg",
    "url": "https://ferrylogistics.example",
    "order": 1
  },
  {
    "id": "client-nour-fintech",
    "name": { "en": "Nour Fintech", "ar": "نور للتقنية المالية" },
    "logo": "/clients/nour-fintech.svg",
    "url": "https://nourfintech.example",
    "order": 2
  },
  {
    "id": "client-basma-retail",
    "name": { "en": "Basma Retail", "ar": "بسمة للتجزئة" },
    "logo": "/clients/basma-retail.svg",
    "url": "https://basmaretail.example",
    "order": 3
  },
  {
    "id": "client-waha-health",
    "name": { "en": "Waha Health", "ar": "واحة للرعاية الصحية" },
    "logo": "/clients/waha-health.svg",
    "url": "https://wahahealth.example",
    "order": 4
  },
  {
    "id": "client-marsa-realestate",
    "name": { "en": "Marsa Real Estate", "ar": "مرسى العقارية" },
    "logo": "/clients/marsa-realestate.svg",
    "url": "https://marsarealestate.example",
    "order": 5
  },
  {
    "id": "client-rawaq-learning",
    "name": { "en": "Rawaq Learning", "ar": "رواق للتعليم" },
    "logo": "/clients/rawaq-learning.svg",
    "url": "https://rawaqlearning.example",
    "order": 6
  }
]
```

- [ ] **Step 3: Write projects.json (6 projects)**

```json
[
  {
    "id": "proj-ferry-logistics-platform",
    "slug": "ferry-logistics-platform",
    "category": "web",
    "status": "shipped",
    "client": "client-ferry-logistics",
    "coverImage": "/projects/ferry-logistics-platform.jpg",
    "order": 1,
    "title": {
      "en": "Ferry Logistics Tracking Platform",
      "ar": "منصة تتبع الشحنات لفيري"
    },
    "summary": {
      "en": "A real-time shipment tracking dashboard replacing a spreadsheet-based workflow.",
      "ar": "لوحة تتبع شحنات لحظية حلّت محل مسار عمل قائم على جداول بيانات."
    },
    "description": {
      "en": "Ferry Logistics tracked shipments across three warehouses using a shared spreadsheet that broke down past 40 concurrent updates. We built a dashboard with live status updates, driver check-ins, and exportable reports, cutting shipment-status queries from a support inbox to a self-serve view.",
      "ar": "كانت فيري تتابع شحناتها عبر ثلاثة مستودعات باستخدام جدول بيانات مشترك يتعطل عند تجاوز 40 تحديثًا متزامنًا. بنينا لوحة تحكم بتحديثات حالة لحظية، تسجيل دخول للسائقين، وتقارير قابلة للتصدير، ما نقل استعلامات حالة الشحنات من صندوق دعم إلى واجهة ذاتية الخدمة."
    }
  },
  {
    "id": "proj-nour-mobile-banking",
    "slug": "nour-mobile-banking",
    "category": "mobile",
    "status": "shipped",
    "client": "client-nour-fintech",
    "coverImage": "/projects/nour-mobile-banking.jpg",
    "order": 2,
    "title": {
      "en": "Nour Mobile Banking App",
      "ar": "تطبيق نور للخدمات المصرفية"
    },
    "summary": {
      "en": "A React Native banking app with biometric login and instant transfers.",
      "ar": "تطبيق مصرفي بReact Native مع تسجيل دخول بالبصمة وتحويلات فورية."
    },
    "description": {
      "en": "Nour needed a mobile banking app that felt as fast as their competitors' native apps without maintaining two separate codebases. We shipped a single React Native app with biometric login, instant transfers, and offline balance caching, live on both stores within four months.",
      "ar": "احتاجت نور تطبيقًا مصرفيًا بسرعة تنافس التطبيقات الأصلية دون صيانة قاعدتي كود منفصلتين. أطلقنا تطبيق React Native واحدًا بتسجيل دخول بالبصمة، تحويلات فورية، وتخزين مؤقت للرصيد دون اتصال، ونُشر على المتجرين خلال أربعة أشهر."
    }
  },
  {
    "id": "proj-basma-storefront",
    "slug": "basma-storefront",
    "category": "ecommerce",
    "status": "shipped",
    "client": "client-basma-retail",
    "coverImage": "/projects/basma-storefront.jpg",
    "order": 3,
    "title": { "en": "Basma Retail Storefront", "ar": "متجر بسمة الإلكتروني" },
    "summary": {
      "en": "A headless storefront that cut checkout time in half.",
      "ar": "متجر إلكتروني (headless) قلّص وقت إتمام الشراء إلى النصف."
    },
    "description": {
      "en": "Basma's old storefront took four steps to check out and lost most mobile shoppers along the way. We rebuilt it as a headless storefront on Next.js with a single-page checkout, cutting checkout abandonment by more than a third in the first quarter after launch.",
      "ar": "كان متجر بسمة القديم يتطلب أربع خطوات لإتمام الشراء ويفقد أغلب المتسوقين عبر الجوال في الطريق. أعدنا بناءه كمتجر headless على Next.js بصفحة دفع واحدة، ما خفّض معدل التخلي عن السلة بأكثر من الثلث في الربع الأول بعد الإطلاق."
    }
  },
  {
    "id": "proj-waha-patient-portal",
    "slug": "waha-patient-portal",
    "category": "web",
    "status": "shipped",
    "client": "client-waha-health",
    "coverImage": "/projects/waha-patient-portal.jpg",
    "order": 4,
    "title": { "en": "Waha Patient Portal", "ar": "بوابة مرضى واحة" },
    "summary": {
      "en": "A patient portal for appointment booking and lab results.",
      "ar": "بوابة مرضى لحجز المواعيد ونتائج التحاليل."
    },
    "description": {
      "en": "Waha Health ran appointment booking entirely over phone calls. We built a patient portal for booking, rescheduling, and viewing lab results, with a Laravel backend enforcing the same validation rules the front-desk staff used to apply manually.",
      "ar": "كانت واحة تدير حجز المواعيد بالكامل عبر المكالمات الهاتفية. بنينا بوابة مرضى لحجز المواعيد وإعادة جدولتها وعرض نتائج التحاليل، بخلفية Laravel تطبّق قواعد التحقق نفسها التي كان موظفو الاستقبال يطبقونها يدويًا."
    }
  },
  {
    "id": "proj-marsa-listings-app",
    "slug": "marsa-listings-app",
    "category": "mobile",
    "status": "in-development",
    "client": "client-marsa-realestate",
    "coverImage": "/projects/marsa-listings-app.jpg",
    "order": 5,
    "title": { "en": "Marsa Listings App", "ar": "تطبيق مرسى العقاري" },
    "summary": {
      "en": "A property-browsing app with saved searches and agent chat, currently in development.",
      "ar": "تطبيق لتصفح العقارات مع عمليات بحث محفوظة ومحادثة مع الوسيط، قيد التطوير حاليًا."
    },
    "description": {
      "en": "Marsa's listings currently live on a public feed with no way to save a search or contact an agent directly. We're building a dedicated app with saved searches, push alerts for new matches, and in-app chat with listing agents.",
      "ar": "تُعرض عقارات مرسى حاليًا على خلاصة عامة دون إمكانية حفظ بحث أو التواصل مباشرة مع وسيط. نعمل على بناء تطبيق مخصص بعمليات بحث محفوظة، تنبيهات فورية للعروض الجديدة، ومحادثة داخل التطبيق مع وسطاء العقارات."
    }
  },
  {
    "id": "proj-rawaq-lms",
    "slug": "rawaq-lms",
    "category": "saas",
    "status": "shipped",
    "client": "client-rawaq-learning",
    "coverImage": "/projects/rawaq-lms.jpg",
    "order": 6,
    "title": {
      "en": "Rawaq Learning Platform",
      "ar": "منصة رواق التعليمية"
    },
    "summary": {
      "en": "A multi-tenant course platform serving over 40 instructors.",
      "ar": "منصة كورسات متعددة المستأجرين تخدم أكثر من 40 مدربًا."
    },
    "description": {
      "en": "Rawaq wanted to let instructors run their own branded course pages under one platform. We built a multi-tenant Laravel application with per-instructor subdomains, video progress tracking, and a quiz engine, now serving more than 40 instructors and several thousand students.",
      "ar": "أرادت رواق تمكين المدربين من إدارة صفحات كورسات بهويتهم الخاصة ضمن منصة واحدة. بنينا تطبيق Laravel متعدد المستأجرين بنطاقات فرعية لكل مدرب، تتبع تقدم الفيديو، ومحرك اختبارات، تخدم الآن أكثر من 40 مدربًا وآلاف الطلاب."
    }
  }
]
```

- [ ] **Step 4: Write testimonials.json (3 testimonials)**

```json
[
  {
    "id": "test-youssef-adel",
    "clientId": "client-ferry-logistics",
    "avatar": "/testimonials/youssef-adel.jpg",
    "order": 1,
    "author": { "en": "Youssef Adel", "ar": "يوسف عادل" },
    "role": {
      "en": "Operations Director, Ferry Logistics",
      "ar": "مدير العمليات، فيري للخدمات اللوجستية"
    },
    "quote": {
      "en": "We went from three people manually checking a spreadsheet to a dashboard the whole warehouse floor trusts. It paid for itself in the first month.",
      "ar": "انتقلنا من ثلاثة أشخاص يراجعون جدول بيانات يدويًا إلى لوحة تحكم يثق بها كل موظفي المستودع. غطت تكلفتها خلال الشهر الأول."
    }
  },
  {
    "id": "test-salma-farid",
    "clientId": "client-nour-fintech",
    "avatar": "/testimonials/salma-farid.jpg",
    "order": 2,
    "author": { "en": "Salma Farid", "ar": "سلمى فريد" },
    "role": {
      "en": "Head of Product, Nour Fintech",
      "ar": "رئيسة المنتج، نور للتقنية المالية"
    },
    "quote": {
      "en": "They shipped a banking app that passed our compliance review on the first submission. That almost never happens.",
      "ar": "سلّموا تطبيقًا مصرفيًا اجتاز مراجعة الامتثال من أول تقديم. هذا نادرًا ما يحدث."
    }
  },
  {
    "id": "test-omar-nabil",
    "clientId": "client-rawaq-learning",
    "avatar": "/testimonials/omar-nabil.jpg",
    "order": 3,
    "author": { "en": "Omar Nabil", "ar": "عمر نبيل" },
    "role": { "en": "Founder, Rawaq Learning", "ar": "مؤسس رواق للتعليم" },
    "quote": {
      "en": "They understood the multi-tenant architecture question before I finished explaining it, and that saved us months of rework.",
      "ar": "فهموا سؤال المعمارية متعددة المستأجرين قبل أن أنهي شرحه، وهذا وفّر علينا أشهرًا من إعادة العمل."
    }
  }
]
```

- [ ] **Step 5: Write posts.json (3 posts)**

```json
[
  {
    "id": "post-why-nextjs",
    "slug": "why-we-chose-nextjs",
    "coverImage": "/blog/why-we-chose-nextjs.jpg",
    "publishedAt": "2026-06-15",
    "order": 1,
    "author": { "en": "Mona Hesham", "ar": "منى هشام" },
    "title": {
      "en": "Why We Chose Next.js for Client Projects",
      "ar": "لماذا اخترنا Next.js لمشاريع عملائنا"
    },
    "excerpt": {
      "en": "App Router, static rendering, and one framework for both marketing sites and dashboards.",
      "ar": "App Router، العرض الثابت، وإطار عمل واحد لكل من المواقع التسويقية ولوحات التحكم."
    },
    "body": {
      "en": "For most client projects we don't need a fully custom backend framework on day one — we need pages that render fast, an admin surface that can come later, and a deploy story that doesn't require a DevOps hire. Next.js's App Router gives us static rendering for marketing pages and server components for anything that needs live data, in the same codebase.",
      "ar": "في معظم مشاريع العملاء لا نحتاج إطار خلفية مخصصًا بالكامل من اليوم الأول — نحتاج صفحات تُعرض بسرعة، ولوحة تحكم يمكن إضافتها لاحقًا، وقصة نشر لا تتطلب توظيف مهندس DevOps. يمنحنا App Router في Next.js عرضًا ثابتًا للصفحات التسويقية ومكونات خادم لأي شيء يحتاج بيانات حية، في نفس قاعدة الكود."
    }
  },
  {
    "id": "post-laravel-json-translations",
    "slug": "laravel-json-columns-for-translations",
    "coverImage": "/blog/laravel-json-columns-for-translations.jpg",
    "publishedAt": "2026-05-02",
    "order": 2,
    "author": { "en": "Tarek Ismail", "ar": "طارق إسماعيل" },
    "title": {
      "en": "Using JSON Columns for Multilingual Content in Laravel",
      "ar": "استخدام أعمدة JSON للمحتوى متعدد اللغات في Laravel"
    },
    "excerpt": {
      "en": "Why a separate translations table is often the wrong call at small-to-medium scale.",
      "ar": "لماذا يكون جدول ترجمات منفصل غالبًا خيارًا خاطئًا في الحجم الصغير إلى المتوسط."
    },
    "body": {
      "en": "A separate translations table looks like the 'correct' normalized design, until you're writing a join for every single list query. For a site with two languages and a few thousand rows per table, a JSON column holding {\"en\": ..., \"ar\": ...} keeps queries simple and lets Eloquent resolve the right string with a one-line accessor.",
      "ar": "يبدو جدول الترجمات المنفصل التصميم المعياري 'الصحيح'، إلى أن تجد نفسك تكتب join لكل استعلام قائمة. لموقع بلغتين وآلاف قليلة من الصفوف في كل جدول، يبقي عمود JSON بالشكل {\"en\": ..., \"ar\": ...} الاستعلامات بسيطة، ويسمح لـEloquent بإرجاع النص الصحيح عبر accessor من سطر واحد."
    }
  },
  {
    "id": "post-performance-budget",
    "slug": "performance-budget-for-marketing-sites",
    "coverImage": "/blog/performance-budget-for-marketing-sites.jpg",
    "publishedAt": "2026-03-20",
    "order": 3,
    "author": { "en": "Mona Hesham", "ar": "منى هشام" },
    "title": {
      "en": "Setting a Performance Budget for Marketing Sites",
      "ar": "وضع ميزانية أداء لمواقع التسويق"
    },
    "excerpt": {
      "en": "A hero animation is not worth a 4-second LCP on a mid-range phone.",
      "ar": "لا تستحق حركة الواجهة الرئيسية أن تكلفك LCP بأربع ثوانٍ على هاتف متوسط."
    },
    "body": {
      "en": "Every marketing site we ship gets a written budget before the first component exists: LCP under 2.5s on throttled 4G, one WebGL canvas maximum, and a static fallback for anything that can't hit that number on a mid-range device. Agreeing on the number before the design gets attached to it is what makes the budget survive contact with a client who loves the hero animation.",
      "ar": "كل موقع تسويقي نسلّمه يحصل على ميزانية أداء مكتوبة قبل بناء أول مكون: LCP أقل من 2.5 ثانية على اتصال 4G مخنوق، لوحة رسم WebGL واحدة كحد أقصى، وبديل ثابت لأي شيء لا يحقق هذا الرقم على جهاز متوسط. الاتفاق على الرقم قبل أن يتعلق به التصميم هو ما يجعل الميزانية تصمد أمام عميل معجب بحركة الواجهة الرئيسية."
    }
  }
]
```

- [ ] **Step 6: Write settings.json**

```json
{
  "hero": {
    "title": {
      "en": "We build software that ships.",
      "ar": "نبني برمجيات تصل فعلًا إلى الإنتاج."
    },
    "subtitle": {
      "en": "A software agency for teams who need a product built right the first time — web, mobile, and the backend that holds it together.",
      "ar": "وكالة برمجية للفرق التي تريد منتجًا مبنيًا بشكل صحيح من أول مرة — مواقع، تطبيقات جوال، والخلفية البرمجية التي تربط كل ذلك."
    },
    "ctaPrimary": { "en": "Start a project", "ar": "ابدأ مشروعك" },
    "ctaSecondary": { "en": "See our work", "ar": "شاهد أعمالنا" }
  },
  "sections": {
    "about": {
      "heading": { "en": "About us", "ar": "من نحن" },
      "description": {
        "en": "A small team that ships production software, not prototypes.",
        "ar": "فريق صغير يسلّم برمجيات جاهزة للإنتاج، لا نماذج أولية."
      }
    },
    "services": {
      "heading": { "en": "What we do", "ar": "ماذا نقدم" },
      "description": {
        "en": "From the first design file to the server it runs on.",
        "ar": "من أول ملف تصميم إلى الخادم الذي يعمل عليه المنتج."
      }
    },
    "portfolio": {
      "heading": { "en": "Selected work", "ar": "أعمال مختارة" },
      "description": {
        "en": "A few of the products we've shipped for clients.",
        "ar": "بعض المنتجات التي سلّمناها لعملائنا."
      }
    },
    "testimonials": {
      "heading": { "en": "What clients say", "ar": "ماذا يقول عملاؤنا" },
      "description": {
        "en": "In their words, not ours.",
        "ar": "بكلماتهم، لا بكلماتنا."
      }
    },
    "clients": {
      "heading": { "en": "Trusted by", "ar": "يثق بنا" },
      "description": {
        "en": "Teams across logistics, fintech, retail, and healthcare.",
        "ar": "فرق من قطاعات اللوجستيات، التقنية المالية، التجزئة، والرعاية الصحية."
      }
    },
    "contact": {
      "heading": { "en": "Let's talk", "ar": "لنتحدث" },
      "description": {
        "en": "Tell us about the project — we usually reply within a day.",
        "ar": "أخبرنا عن مشروعك — نرد عادة خلال يوم واحد."
      }
    }
  },
  "contact": {
    "email": "hello@company-site.example",
    "phone": "+20 100 000 0000",
    "address": { "en": "Cairo, Egypt", "ar": "القاهرة، مصر" }
  },
  "social": [
    {
      "platform": "linkedin",
      "url": "https://linkedin.com/company/company-site"
    },
    { "platform": "twitter", "url": "https://twitter.com/companysite" },
    { "platform": "github", "url": "https://github.com/company-site" },
    { "platform": "instagram", "url": "https://instagram.com/companysite" }
  ]
}
```

- [ ] **Step 7: Verify JSON validity**

Run: `pnpm exec prettier --check src/lib/content/mock/*.json`
Expected: all six files pass (or run `pnpm format` to auto-fix formatting, then re-check).

- [ ] **Step 8: Commit**

```bash
git add src/lib/content/mock/*.json
git commit -m "feat(content): seed mock content data (6 services, 6 projects, 3 testimonials, 6 clients, 3 posts)"
```

---

### Task 8: Mock and API repository implementations, index wiring

**Files:**

- Create: `src/lib/content/mock/mock-repository.ts`
- Create: `src/lib/content/api/api-repository.ts`
- Create: `src/lib/content/index.ts`

**Interfaces:**

- Consumes: `ContentRepository` from `repository.ts`, types from `types.ts` (Task 6), JSON fixtures from `mock/*.json` (Task 7).
- Produces: `content: ContentRepository`, `pick` — the two exports every later phase imports from `@/lib/content`.

- [ ] **Step 1: Write the mock repository**

```ts
// src/lib/content/mock/mock-repository.ts
import type {
  ContactPayload,
  ContactResult,
  ContentRepository,
  ProjectFilter,
} from "../repository";
import type {
  Client,
  Post,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from "../types";

import clientsData from "./clients.json";
import postsData from "./posts.json";
import projectsData from "./projects.json";
import servicesData from "./services.json";
import settingsData from "./settings.json";
import testimonialsData from "./testimonials.json";

const services = servicesData as Service[];
// Project.status is a string union; JSON imports infer plain `string`, so
// this needs the unknown-cast escape hatch instead of a direct assertion.
const projects = projectsData as unknown as Project[];
const testimonials = testimonialsData as Testimonial[];
const clients = clientsData as Client[];
const posts = postsData as Post[];
const settings = settingsData as SiteSettings;

const POSTS_PER_PAGE = 6;

const byOrder = <T extends { order: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.order - b.order);

export const mockRepository: ContentRepository = {
  async getServices() {
    return byOrder(services);
  },
  async getService(slug) {
    return services.find((service) => service.slug === slug) ?? null;
  },
  async getProjects(filter?: ProjectFilter) {
    const filtered = filter?.category
      ? projects.filter((project) => project.category === filter.category)
      : projects;
    return byOrder(filtered);
  },
  async getProject(slug) {
    return projects.find((project) => project.slug === slug) ?? null;
  },
  async getTestimonials() {
    return byOrder(testimonials);
  },
  async getClients() {
    return byOrder(clients);
  },
  async getPosts(page = 1) {
    const sorted = byOrder(posts);
    const start = (page - 1) * POSTS_PER_PAGE;
    return sorted.slice(start, start + POSTS_PER_PAGE);
  },
  async getPost(slug) {
    return posts.find((post) => post.slug === slug) ?? null;
  },
  async getSettings() {
    return settings;
  },
  async submitContact(payload: ContactPayload): Promise<ContactResult> {
    console.log("[mock-repository] contact submission received:", payload);
    return { success: true };
  },
};
```

- [ ] **Step 2: Write the API repository stub**

```ts
// src/lib/content/api/api-repository.ts
import type { ContentRepository } from "../repository";

function notImplemented(): never {
  throw new Error("Not implemented until Phase 14");
}

export const apiRepository: ContentRepository = {
  getServices: notImplemented,
  getService: notImplemented,
  getProjects: notImplemented,
  getProject: notImplemented,
  getTestimonials: notImplemented,
  getClients: notImplemented,
  getPosts: notImplemented,
  getPost: notImplemented,
  getSettings: notImplemented,
  submitContact: notImplemented,
};
```

- [ ] **Step 3: Write the index that picks an implementation**

```ts
// src/lib/content/index.ts
import { apiRepository } from "./api/api-repository";
import { mockRepository } from "./mock/mock-repository";
import type { ContentRepository } from "./repository";

export const content: ContentRepository =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "api"
    ? apiRepository
    : mockRepository;

export { pick } from "./locale";
export type {
  ContactPayload,
  ContactResult,
  ContentRepository,
  ProjectFilter,
} from "./repository";
export type * from "./types";
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`
Expected: no errors anywhere in `src/lib/content` or `src/app/[locale]/layout.tsx` (which imports `content` and `pick` from Task 5).

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/mock/mock-repository.ts src/lib/content/api/api-repository.ts src/lib/content/index.ts
git commit -m "feat(content): wire mock repository, API stub, and data-source switch"
```

---

### Task 9: Move and extend the styleguide — theme toggle, language switcher, RTL section

**Files:**

- Move: `src/app/styleguide/page.tsx` → `src/app/[locale]/styleguide/page.tsx` (content unchanged)
- Move: `src/app/styleguide/styleguide-client.tsx` → `src/app/[locale]/styleguide/styleguide-client.tsx` (rewritten)

**Interfaces:**

- Consumes: `useTheme` from `next-themes`; `useLocale`, `useTranslations` from `next-intl`; `usePathname`, `useRouter` from `@/i18n/navigation` (Task 2).

- [ ] **Step 1: Move the styleguide route**

```bash
mkdir -p "src/app/[locale]/styleguide"
git mv src/app/styleguide/page.tsx "src/app/[locale]/styleguide/page.tsx"
git mv src/app/styleguide/styleguide-client.tsx "src/app/[locale]/styleguide/styleguide-client.tsx"
```

`src/app/[locale]/styleguide/page.tsx` content is unchanged from the Phase 1 version (still guards on `NODE_ENV === "production"` and renders `<StyleguideClient />`) — no edit needed beyond the move.

- [ ] **Step 2: Rewrite styleguide-client.tsx**

Replace the file's local `theme`/`lang` state and manual DOM toggles (`toggleTheme`, `toggleLang` from Phase 1) with `next-themes`/`next-intl`, and add a "9. RTL" section. Everything from Phase 1 (Sections 1–8, `Section`, `Pass`, `Fail`, the token/contrast/type-scale/spacing/radius/font arrays, and the contrast-math helpers) is preserved as-is — only the header bar and the section list change.

```tsx
// src/app/[locale]/styleguide/styleguide-client.tsx
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "@/i18n/navigation";

type SemanticToken = {
  cssVar: `--color-${string}`;
  role: string;
};

const SEMANTIC_TOKENS: SemanticToken[] = [
  { cssVar: "--color-bg", role: "App/page background, deepest layer" },
  { cssVar: "--color-card", role: "Card backgrounds (Neutral / Card)" },
  { cssVar: "--color-surface", role: "Elevated panels" },
  { cssVar: "--color-surface-raised", role: "Dropdowns, modals, popovers" },
  { cssVar: "--color-border", role: "Dividers, input borders, panel edges" },
  { cssVar: "--color-text-primary", role: "Headings, primary body text" },
  {
    cssVar: "--color-text-secondary",
    role: "Descriptions, metadata, placeholders",
  },
  {
    cssVar: "--color-primary",
    role: "Primary actions, selected states, focus rings",
  },
  { cssVar: "--color-primary-hover", role: "Hover/pressed state for primary" },
  {
    cssVar: "--color-secondary",
    role: "Secondary highlights, hover accents, gradient endpoints",
  },
  { cssVar: "--color-success", role: "Completed / passing states" },
  { cssVar: "--color-warning", role: "In-progress / attention states" },
  { cssVar: "--color-error", role: "Urgent / error / destructive states" },
];

// "white on primary" has no dedicated semantic token — --palette-light-0 is
// the raw palette entry that already resolves to pure white in both themes.
const WHITE_RAW = "--palette-light-0";

const CONTRAST_PAIRS: {
  label: string;
  fg: SemanticToken["cssVar"] | typeof WHITE_RAW;
  bg: SemanticToken["cssVar"];
}[] = [
  {
    label: "text-secondary on bg",
    fg: "--color-text-secondary",
    bg: "--color-bg",
  },
  {
    label: "text-secondary on card",
    fg: "--color-text-secondary",
    bg: "--color-card",
  },
  { label: "text-primary on bg", fg: "--color-text-primary", bg: "--color-bg" },
  { label: "white on primary", fg: WHITE_RAW, bg: "--color-primary" },
  {
    label: "text-primary on surface",
    fg: "--color-text-primary",
    bg: "--color-surface",
  },
];

const TYPE_SCALE: {
  token: string;
  px: number;
  weight: 400 | 500 | 600;
  role: string;
}[] = [
  {
    token: "--text-11",
    px: 11,
    weight: 500,
    role: "Shortcut hints, overline labels",
  },
  { token: "--text-12", px: 12, weight: 500, role: "Metadata, small labels" },
  {
    token: "--text-13",
    px: 13,
    weight: 400,
    role: "Small body text, nav items",
  },
  {
    token: "--text-14",
    px: 14,
    weight: 400,
    role: "Body text, list-item titles",
  },
  { token: "--text-16", px: 16, weight: 500, role: "h5, panel titles" },
  { token: "--text-20", px: 20, weight: 600, role: "h4, card/view titles" },
  { token: "--text-24", px: 24, weight: 600, role: "h3, page titles" },
  { token: "--text-32", px: 32, weight: 600, role: "h2, section headings" },
  {
    token: "--text-40",
    px: 40,
    weight: 600,
    role: "h1, admin landing headers",
  },
  {
    token: "--text-48",
    px: 48,
    weight: 600,
    role: "Marketing subsection headline",
  },
  {
    token: "--text-64",
    px: 64,
    weight: 600,
    role: "Marketing hero headline (desktop)",
  },
  {
    token: "--text-80",
    px: 80,
    weight: 600,
    role: "Marketing hero headline (large desktop)",
  },
];

const SAMPLE_EN = "Ship software";
const SAMPLE_AR = "نبني برمجيات";

const SPACING_SCALE = [
  2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160,
];
const MARKETING_ONLY_SPACING = new Set([80, 96, 128, 160]);

const RADIUS_SCALE: { token: string; px: number; usedFor: string }[] = [
  {
    token: "--radius-chip",
    px: 4,
    usedFor: "Chips, inline labels, small badges",
  },
  {
    token: "--radius-control",
    px: 6,
    usedFor: "Buttons, inputs, dropdown items",
  },
  {
    token: "--radius-card",
    px: 8,
    usedFor: "Cards, panels, sidebar nav items",
  },
  {
    token: "--radius-modal",
    px: 12,
    usedFor: "Modals, command palette, settings panels",
  },
  {
    token: "--radius-full",
    px: 9999,
    usedFor: "Status circles, avatar circles",
  },
];

const FONT_SAMPLES: {
  label: string;
  cssVar: string;
  weights: number[];
  sample: string;
}[] = [
  {
    label: "Inter",
    cssVar: "--font-inter",
    weights: [400, 500, 600],
    sample: "The quick brown fox — Aa Bb Cc 123",
  },
  {
    label: "Noto Kufi Arabic",
    cssVar: "--font-noto-kufi",
    weights: [400, 500, 600],
    sample: "الثعلب البني السريع — أب ت 123",
  },
  {
    label: "JetBrains Mono",
    cssVar: "--font-jetbrains",
    weights: [400, 500],
    sample: "const services = await api.get();",
  },
];

const MIXED_SCRIPT_PARAGRAPH =
  "نحن نبني واجهات API سريعة باستخدام Next.js، مع تركيز خاص على تحسين SEO حتى يظهر موقعك بوضوح في نتائج البحث دون أي تنازل عن الأداء.";

const RTL_PARAGRAPH_EN =
  "Every section on this site is built with logical CSS properties, so the whole layout mirrors correctly when a visitor switches from English to Arabic — padding, alignment, and icon direction all flip together instead of being fixed by hand for each language.";

const RTL_PARAGRAPH_AR =
  "كل قسم في هذا الموقع مبني باستخدام خصائص CSS منطقية، بحيث ينعكس التخطيط بالكامل بشكل صحيح عند تبديل الزائر من الإنجليزية إلى العربية — المسافات والمحاذاة واتجاه الأيقونات تنعكس جميعها تلقائيًا بدلاً من ضبطها يدويًا لكل لغة.";

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace("#", "");
  if (clean.length !== 6) return null;
  const value = Number.parseInt(clean, 16);
  if (Number.isNaN(value)) return null;
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA: string, hexB: string): number | null {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return null;
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

// Reads the *currently applied* token values straight from the CSSOM, so the
// contrast table is always computed from the live theme, never hardcoded.
function readResolvedTokens(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const styles = getComputedStyle(document.documentElement);
  const next: Record<string, string> = {};
  for (const token of SEMANTIC_TOKENS) {
    next[token.cssVar] = styles.getPropertyValue(token.cssVar).trim();
  }
  next[WHITE_RAW] = styles.getPropertyValue(WHITE_RAW).trim();
  return next;
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = mounted ? resolvedTheme : undefined;
  const label = current === "dark" ? t("theme.dark") : t("theme.light");

  return (
    <button
      type="button"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      aria-label={t("a11y.toggleTheme")}
      className="rounded-control border-border text-14 text-text-primary hover:bg-surface border px-16 py-8"
    >
      {t("theme.system") === label
        ? label
        : `${t("a11y.toggleTheme")}: ${label}`}
    </button>
  );
}

function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common.locale");
  const target = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? t("switchToEnglish") : t("switchToArabic");

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: target })}
      className="rounded-control border-border text-14 text-text-primary hover:bg-surface border px-16 py-8"
    >
      {label}
    </button>
  );
}

export function StyleguideClient() {
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setResolved(readResolvedTokens());
    }
  }, [mounted, resolvedTheme]);

  return (
    <main className="mx-auto max-w-[1280px] px-24 py-48">
      <div className="border-border mb-40 flex flex-wrap items-center gap-16 border-b pb-24">
        <h1 className="text-32 text-text-primary font-semibold">Styleguide</h1>
        <ThemeToggle />
        <LocaleSwitcher />
      </div>

      {/* 1. Colour */}
      <Section title="1. Colour">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
          {SEMANTIC_TOKENS.map((token) => (
            <div
              key={token.cssVar}
              className="rounded-card border-border border p-16"
            >
              <div
                className="rounded-control border-border mb-12 h-48 border"
                style={{ backgroundColor: `var(${token.cssVar})` }}
              />
              <p className="text-12 text-text-primary font-mono">
                {token.cssVar}
              </p>
              <p className="text-12 text-text-secondary font-mono">
                {resolved[token.cssVar] || "…"}
              </p>
              <p className="text-13 text-text-secondary mt-4">{token.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 2. Contrast */}
      <Section title="2. Contrast">
        <div className="overflow-x-auto">
          <table className="text-14 w-full border-collapse">
            <thead>
              <tr className="border-border text-12 text-text-secondary border-b text-start">
                <th className="p-8 text-start">Pair</th>
                <th className="p-8 text-start">Ratio</th>
                <th className="p-8 text-start">4.5:1 (body)</th>
                <th className="p-8 text-start">3:1 (large)</th>
              </tr>
            </thead>
            <tbody>
              {CONTRAST_PAIRS.map((pair) => {
                const fgHex = resolved[pair.fg];
                const bgHex = resolved[pair.bg];
                const ratio =
                  fgHex && bgHex ? contrastRatio(fgHex, bgHex) : null;
                return (
                  <tr key={pair.label} className="border-border border-b">
                    <td className="text-text-primary p-8">{pair.label}</td>
                    <td className="text-text-primary p-8 font-mono">
                      {ratio ? `${ratio.toFixed(2)}:1` : "…"}
                    </td>
                    <td className="p-8">
                      {ratio ? ratio >= 4.5 ? <Pass /> : <Fail /> : "…"}
                    </td>
                    <td className="p-8">
                      {ratio ? ratio >= 3 ? <Pass /> : <Fail /> : "…"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 3. Type scale */}
      <Section title="3. Type scale">
        <div className="flex flex-col gap-16">
          {TYPE_SCALE.map((step) => (
            <div
              key={step.token}
              className="border-border grid grid-cols-1 gap-8 border-b pb-16 sm:grid-cols-2"
            >
              <div>
                <p className="text-11 text-text-secondary mb-4 font-mono">
                  {step.token} · {step.px}px · {step.weight} · {step.role}
                </p>
                <p
                  style={{
                    fontSize: step.px,
                    fontWeight: step.weight,
                    fontFamily: "var(--font-inter)",
                  }}
                  className="text-text-primary"
                >
                  {SAMPLE_EN}
                </p>
              </div>
              <div lang="ar" dir="rtl">
                <p className="text-11 text-text-secondary mb-4 font-mono">
                  Noto Kufi Arabic
                </p>
                <p
                  style={{
                    fontSize: step.px,
                    fontWeight: step.weight,
                    fontFamily: "var(--font-noto-kufi)",
                  }}
                  className="text-text-primary"
                >
                  {SAMPLE_AR}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Mixed-script paragraph */}
      <Section title="4. Mixed-script paragraph">
        <p
          lang="ar"
          dir="rtl"
          className="text-16 text-text-primary max-w-[720px]"
        >
          {MIXED_SCRIPT_PARAGRAPH}
        </p>
      </Section>

      {/* 5. Spacing scale */}
      <Section title="5. Spacing scale">
        <div className="flex flex-col gap-8">
          {SPACING_SCALE.map((value) => (
            <div key={value} className="flex items-center gap-16">
              <span className="text-12 text-text-secondary w-64 shrink-0 font-mono">
                {value}px{MARKETING_ONLY_SPACING.has(value) ? " *" : ""}
              </span>
              <div className="bg-primary h-16" style={{ width: value }} />
            </div>
          ))}
          <p className="text-12 text-text-secondary mt-8">
            * marketing-only extension — section rhythm, never component padding
          </p>
        </div>
      </Section>

      {/* 6. Radius tokens */}
      <Section title="6. Radius tokens">
        <div className="flex flex-wrap gap-24">
          {RADIUS_SCALE.map((radius) => (
            <div key={radius.token} className="text-center">
              <div
                className="border-border bg-surface mb-8 size-64 border"
                style={{ borderRadius: radius.px }}
              />
              <p className="text-12 text-text-primary font-mono">
                {radius.token}
              </p>
              <p className="text-12 text-text-secondary">
                {radius.px === 9999 ? "full" : `${radius.px}px`}
              </p>
              <p className="text-12 text-text-secondary max-w-[140px]">
                {radius.usedFor}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Fonts */}
      <Section title="7. Fonts">
        <div className="flex flex-col gap-24">
          {FONT_SAMPLES.map((font) => (
            <div key={font.label}>
              <p className="text-12 text-text-secondary mb-8">{font.label}</p>
              {font.weights.map((weight) => (
                <p
                  key={weight}
                  style={{
                    fontFamily: `var(${font.cssVar})`,
                    fontWeight: weight,
                  }}
                  className="text-16 text-text-primary"
                >
                  {weight} — {font.sample}
                </p>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* 8. Overline utility */}
      <Section title="8. Overline utility">
        <div className="flex flex-col gap-8">
          <p className="text-12 text-text-secondary overline">
            {locale === "ar" ? "الأعمال المختارة" : "Selected work"}
          </p>
          <p className="text-13 text-text-secondary">
            Uppercases only under :lang(en) — current locale is {locale}, so
            this {locale === "en" ? "IS" : "is NOT"} rendered uppercase.
          </p>
        </div>
      </Section>

      {/* 9. RTL */}
      <Section title="9. RTL">
        <div className="flex flex-col gap-32">
          <div>
            <p className="text-13 text-text-secondary mb-8">
              Logical spacing — ps-32/pe-8/border-s should sit at the
              reading-start edge in both directions
            </p>
            <div className="border-border bg-surface border">
              <div className="bg-primary/10 border-primary text-14 text-text-primary border-s-4 py-8 ps-32 pe-8">
                ps-32 pe-8 border-s-4 (padding-inline-start/end,
                border-inline-start)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <p className="border-border text-14 text-text-primary border p-12 text-start">
              text-start (aligns to the reading-start edge)
            </p>
            <p className="border-border text-14 text-text-primary border p-12 text-end">
              text-end (aligns to the reading-end edge)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-24">
            <span className="text-14 text-text-primary flex items-center gap-8">
              <ArrowIcon className="text-primary rtl:-scale-x-100" />
              Directional — mirrors in RTL
            </span>
            <span className="text-14 text-text-primary flex items-center gap-8">
              <CheckIcon className="text-success" />
              Non-directional — must NOT mirror
            </span>
          </div>

          <div className="relative h-64 overflow-hidden">
            <div className="border-primary text-primary bg-primary/10 text-11 absolute start-0 top-0 border px-8 py-4">
              start-0 (flips with direction)
            </div>
            <div className="border-error text-error bg-error/10 text-11 absolute top-32 left-0 border px-8 py-4">
              left-0 (never flips — wrong for RTL)
            </div>
          </div>

          <div>
            <p className="text-13 text-text-secondary mb-8">
              flex-row — items should read in reading order automatically
            </p>
            <div className="flex flex-row gap-8">
              {["1", "2", "3"].map((n) => (
                <div
                  key={n}
                  className="bg-surface border-border text-14 text-text-primary flex size-40 items-center justify-center border"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-24 sm:grid-cols-2">
            <p dir="ltr" lang="en" className="text-16 text-text-primary">
              {RTL_PARAGRAPH_EN}
            </p>
            <p dir="rtl" lang="ar" className="text-16 text-text-primary">
              {RTL_PARAGRAPH_AR}
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="mb-48">
      <h2 className="text-20 text-text-primary mb-16 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Pass() {
  return <span className="text-12 text-success font-mono">PASS</span>;
}

function Fail() {
  return <span className="text-12 text-error font-mono">FAIL</span>;
}
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: both pass with no errors.

Run: `pnpm dev`, visit `http://localhost:3000/ar/styleguide` and `http://localhost:3000/en/styleguide`.
Expected:

- `/ar/styleguide`: page direction is RTL, Section 9's `ps-32`/`start-0`/flex-row boxes sit on the visual right, the directional arrow icon points left (mirrored), the check icon does not mirror.
- `/en/styleguide`: page direction is LTR, same boxes sit on the visual left, arrow points right (unmirrored).
- Clicking the language-switcher button on `/ar/styleguide` navigates to `/en/styleguide` (same page, path preserved), and vice versa.
- Clicking the theme-toggle button flips both the button label and the Section 1/2 token swatches and contrast table without a page reload.

- [ ] **Step 4: Commit**

```bash
git add -A "src/app/[locale]/styleguide"
git commit -m "feat(styleguide): move under [locale], wire real theme/locale switching, add RTL section"
```

---

### Task 10: Final verification pass

**Files:** none (verification only).

- [ ] **Step 1: Full build**

Run: `pnpm build`
Expected: succeeds, and the build output lists static pages for both `/ar` and `/en` (from `generateStaticParams` in the locale layout).

- [ ] **Step 2: Lint, typecheck, i18n parity**

Run: `pnpm lint && pnpm typecheck && pnpm check:i18n`
Expected: all three pass with no errors.

- [ ] **Step 3: Manual locale/theme verification**

Run: `pnpm build && pnpm start` (production mode, to genuinely test for flash-of-unstyled-theme — dev mode's extra hydration work can mask FOUC that only shows in production).

- Visit `http://localhost:3000/` → confirm redirect to `http://localhost:3000/ar`.
- Visit `/ar` and `/en` directly → both render.
- Visit `/fr` (an unrecognized locale) → confirm the root not-found fallback renders (not a hard crash).
- On `/ar/styleguide`, hard-refresh (Ctrl+Shift+R) in both light and dark theme (toggle, then hard-refresh again) → confirm no flash of the opposite theme before paint, in both directions.
- Confirm `<html>` has `dir="rtl"` on `/ar/*` and `dir="ltr"` on `/en/*` (inspect via devtools).

- [ ] **Step 4: Report findings**

No code changes in this step — summarize for the user:

1. Whether `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm check:i18n` all passed.
2. Confirmation that `/ar` and `/en` render and `/` redirects to `/ar`.
3. Confirmation that the theme toggle works with no flash on hard refresh, in both themes.
4. Any part of the Section 9 RTL styleguide demo that did not visibly mirror correctly (expected: none — flag anything that didn't).
5. The list of `ContentRepository` methods and their return types (from `src/lib/content/repository.ts`), for the record.

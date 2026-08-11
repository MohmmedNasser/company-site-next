# FAQ Home Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "FAQ" home-page section (accordion of questions, single-open, positioned right before Contact) matching the approved design spec.

**Architecture:** A `FaqItem` content type + `faq.json` mock data read through the existing `ContentRepository` (mirrors the `ProcessStep` pattern exactly). A server `FaqSection` component renders the two-column layout and section copy; a client `FaqAccordion` component owns the single-open toggle state and the height animation. Wired into `page.tsx` between `TestimonialsSection` and the existing placeholder block.

**Tech Stack:** Next.js 16 (App Router, RSC), `next-intl`, `motion` (motion/react) for animation, Tailwind v4 with this project's token system (no other UI/animation library added).

## Global Constraints

- No raw hex anywhere — colors only via existing design tokens (`text-text-primary`, `border-border`, `bg-card`, etc.).
- No physical CSS properties — logical only (`ps-`/`pe-`/`text-start`, never `pl`/`pr`/`text-left`).
- Every new user-facing string must exist in **both** `messages/en.json` and `messages/ar.json`; `pnpm check:i18n` must pass.
- No `fetch` inside components — all content flows through `src/lib/content` (`content.getFaqItems()`, `content.getSettings()`).
- Any new animation must respect `prefers-reduced-motion` — no motion/transform/height-transition when it's set.
- Commits are Conventional Commits, in English (`feat(faq): ...`, etc.).
- **No test framework exists in this repo** (confirmed: no `*.test.*` files, no Jest/Vitest in `package.json`). This project's actual verification tooling is `pnpm typecheck`, `pnpm lint`, and `pnpm check:i18n`, plus manual verification in the running dev server. Every task's "test" steps below use these instead of a unit-test runner — do not introduce a new test framework as part of this plan.

---

### Task 1: Extract the shared `readDurationSeconds` helper

The FAQ accordion needs to read a CSS duration token (`--duration-micro`) into seconds for `motion`, exactly like `Reveal` already does for `--duration-reveal`. Extract the existing inline function out of `reveal.tsx` into a shared module first, so the accordion doesn't duplicate it (DRY) and `Reveal`'s behavior is unchanged.

**Files:**

- Create: `src/lib/motion/read-duration-seconds.ts`
- Modify: `src/components/motion/reveal.tsx:20-35`

**Interfaces:**

- Produces: `readDurationSeconds(cssVar: string, fallbackMs: number): number` — exported from `src/lib/motion/read-duration-seconds.ts`. Task 4 imports this.

- [ ] **Step 1: Create the shared helper**

Create `src/lib/motion/read-duration-seconds.ts`:

```ts
// src/lib/motion/read-duration-seconds.ts

// Reads a duration CSS custom property (e.g. --duration-reveal,
// --duration-micro) from the document root and converts it from
// milliseconds to seconds — motion's transition.duration takes a plain
// number of seconds with no way to hand it a CSS var() directly. Falls
// back to `fallbackMs` during SSR (no `window`) or if the token is
// missing/invalid, so tokens.css stays the single source of truth without
// a runtime crash if it's ever unset. Duration tokens are static across
// the light/dark toggle (unlike color tokens), so a plain read is enough —
// no useSyncExternalStore subscription needed, this isn't mount/hydration
// state.
export function readDurationSeconds(
  cssVar: string,
  fallbackMs: number,
): number {
  if (typeof window === "undefined") return fallbackMs / 1000;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
  const ms = Number.parseFloat(raw);
  return (Number.isFinite(ms) && ms > 0 ? ms : fallbackMs) / 1000;
}
```

- [ ] **Step 2: Update `reveal.tsx` to use the shared helper**

In `src/components/motion/reveal.tsx`, replace lines 20-35 (the comment + local `readDurationSeconds` function) with an import, and delete the now-duplicate local definition:

```ts
import { readDurationSeconds } from "@/lib/motion/read-duration-seconds";
```

Remove the local `function readDurationSeconds(...) { ... }` block entirely (previously lines 20-35). The call site at what was line 59 (`const duration = readDurationSeconds("--duration-reveal", 500);`) stays unchanged — it now resolves to the imported function.

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors (no unused imports, no unused local function left behind).

- [ ] **Step 4: Commit**

```bash
git add src/lib/motion/read-duration-seconds.ts src/components/motion/reveal.tsx
git commit -m "refactor(motion): extract readDurationSeconds into a shared helper"
```

---

### Task 2: `FaqItem` content type, mock data, and repository wiring

**Files:**

- Modify: `src/lib/content/types.ts:67-69`
- Modify: `src/lib/content/repository.ts`
- Modify: `src/lib/content/mock/mock-repository.ts`
- Modify: `src/lib/content/api/api-repository.ts`
- Create: `src/lib/content/mock/faq.json`

**Interfaces:**

- Produces: `FaqItem { id: string; order: number; question: Localized; answer: Localized }` (from `src/lib/content/types.ts`), `ContentRepository.getFaqItems(): Promise<FaqItem[]>`. Task 5 (page wiring) consumes both.

- [ ] **Step 1: Add the `FaqItem` type**

In `src/lib/content/types.ts`, insert after the `ProcessStep` interface (after line 67, before `export interface Post` on line 69):

```ts
// Same shape as ProcessStep on purpose: an FAQ entry has no detail page
// either, just a question/answer pair the accordion renders.
export interface FaqItem {
  id: string;
  order: number;
  question: Localized;
  answer: Localized;
}
```

- [ ] **Step 2: Create the mock data file**

Create `src/lib/content/mock/faq.json`:

```json
[
  {
    "id": "retainers",
    "order": 1,
    "question": {
      "en": "How do retainers actually work?",
      "ar": "كيف تعمل باقات الاشتراك الشهري فعليًا؟"
    },
    "answer": {
      "en": "You reserve a fixed number of hours each month. We meet at the start of the cycle to set priorities, then work through them — no separate contracts or approvals for every small change.",
      "ar": "تحجز عددًا ثابتًا من الساعات كل شهر. نجتمع في بداية كل دورة لتحديد الأولويات، ثم ننفذها مباشرة، دون عقود أو موافقات منفصلة لكل تعديل صغير."
    }
  },
  {
    "id": "unused-hours",
    "order": 2,
    "question": {
      "en": "What if I don't use all my hours?",
      "ar": "ماذا لو لم أستخدم كل ساعاتي؟"
    },
    "answer": {
      "en": "Unused hours roll over into the following month, up to one extra cycle. We'd rather adjust the plan than bill you for time you didn't need.",
      "ar": "الساعات غير المستخدمة تُرحَّل إلى الشهر التالي، لدورة إضافية واحدة كحد أقصى. نفضّل تعديل الخطة على تحصيل رسوم عن وقت لم تحتَجه."
    }
  },
  {
    "id": "start-speed",
    "order": 3,
    "question": {
      "en": "How fast can you start?",
      "ar": "ما مدى سرعة بدء العمل؟"
    },
    "answer": {
      "en": "Most engagements kick off within a week of signing — sooner if the scope is already clear. We'll tell you upfront if a project needs more discovery first.",
      "ar": "تبدأ معظم المشاريع خلال أسبوع من التوقيع، وأحيانًا أسرع إذا كان النطاق واضحًا. سنخبرك مسبقًا إن احتاج المشروع لمرحلة استكشاف إضافية."
    }
  },
  {
    "id": "team",
    "order": 4,
    "question": {
      "en": "Who will be working on my account?",
      "ar": "من الذي سيعمل على حسابي؟"
    },
    "answer": {
      "en": "The same senior team from the first call through delivery — no handoffs to a different bench partway through, and no juniors learning on your budget.",
      "ar": "نفس الفريق الأول من أول مكالمة حتى التسليم، دون تحويل العمل لفريق آخر في المنتصف، ودون تدريب مبتدئين على حساب ميزانيتك."
    }
  }
]
```

- [ ] **Step 3: Add `getFaqItems` to the repository interface**

In `src/lib/content/repository.ts`, add `FaqItem` to the type import and add the method to `ContentRepository`:

```ts
import type {
  Client,
  FaqItem,
  Post,
  ProcessStep,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from "./types";
```

Add inside the `ContentRepository` interface, after `getProcessSteps(): Promise<ProcessStep[]>;`:

```ts
  getFaqItems(): Promise<FaqItem[]>;
```

- [ ] **Step 4: Implement it in `mockRepository`**

In `src/lib/content/mock/mock-repository.ts`, add the import and data cast alongside the others:

```ts
import faqData from "./faq.json";
```

```ts
const faqItems = faqData as FaqItem[];
```

(Add `FaqItem` to the existing `import type { ... } from "../types";` block.)

Add the method to the `mockRepository` object, after `getProcessSteps`:

```ts
  async getFaqItems() {
    return byOrder(faqItems);
  },
```

- [ ] **Step 5: Stub it in `apiRepository`**

In `src/lib/content/api/api-repository.ts`, add the stub after `getProcessSteps`:

```ts
  getFaqItems: notImplemented,
```

- [ ] **Step 6: Verify**

Run: `pnpm typecheck`
Expected: no errors — confirms `ContentRepository`, `mockRepository`, and `apiRepository` all agree on the new method's shape.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/content/types.ts src/lib/content/repository.ts src/lib/content/mock/mock-repository.ts src/lib/content/mock/faq.json src/lib/content/api/api-repository.ts
git commit -m "feat(faq): add FaqItem content type, mock data, and repository method"
```

---

### Task 3: FAQ section copy — settings, types, and i18n messages

**Files:**

- Modify: `src/lib/content/types.ts:110-124` (`SiteSettings.sections`)
- Modify: `src/lib/content/mock/settings.json:66-79`
- Modify: `messages/en.json:27-34`
- Modify: `messages/ar.json:27-34`

**Interfaces:**

- Produces: `SiteSettings.sections.faq: SectionCopy`, and translation keys `home.faq.sectionLabel`, `home.faq.helpHeading`, `home.faq.helpDescription`. Task 5 (`FaqSection`) consumes both.

- [ ] **Step 1: Add `faq` to `SiteSettings.sections`**

In `src/lib/content/types.ts`, in the `sections` block of `SiteSettings` (around line 110-124), add `faq: SectionCopy;` right after `testimonials: SectionCopy;`:

```ts
testimonials: SectionCopy;
faq: SectionCopy;
clients: SectionCopy;
```

- [ ] **Step 2: Add the `faq` block to `settings.json`**

In `src/lib/content/mock/settings.json`, inside `"sections"`, add a new `"faq"` key right after the `"testimonials"` block (after its closing `},` on line 72, before `"clients"`):

```json
    "faq": {
      "heading": { "en": "FAQ", "ar": "الأسئلة الشائعة" },
      "description": {
        "en": "Everything else you're wondering.",
        "ar": "كل ما تبقى من تساؤلاتك."
      }
    },
```

- [ ] **Step 3: Add `home.faq` to `messages/en.json`**

In `messages/en.json`, inside `"home"`, add a new `"faq"` key right after the `"testimonials"` block (after its closing `}` on line 33, before `"home"` closes on line 34):

```json
    "faq": {
      "sectionLabel": "FAQ",
      "helpHeading": "Have a question?",
      "helpDescription": "Reach out anytime. We're happy to answer any questions before you commit to working together."
    }
```

(Remember to add a trailing comma after the `testimonials` block's closing `}` once `faq` follows it.)

- [ ] **Step 4: Add `home.faq` to `messages/ar.json`**

In `messages/ar.json`, same position, same key:

```json
    "faq": {
      "sectionLabel": "الأسئلة الشائعة",
      "helpHeading": "لديك سؤال؟",
      "helpDescription": "تواصل معنا في أي وقت. يسعدنا الإجابة عن أي استفسار قبل أن تلتزم بالعمل معنا."
    }
```

- [ ] **Step 5: Verify**

Run: `pnpm check:i18n`
Expected: `i18n parity OK — <N> keys` (no "Missing in ar.json" / "Missing in en.json" output).

Run: `pnpm typecheck`
Expected: no errors — confirms `settings.json`'s shape still satisfies `SiteSettings`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/content/types.ts src/lib/content/mock/settings.json messages/en.json messages/ar.json
git commit -m "feat(faq): add FAQ section copy to settings and i18n messages"
```

---

### Task 4: `FaqAccordion` client component

**Files:**

- Create: `src/components/sections/faq-accordion.tsx`

**Interfaces:**

- Consumes: `readDurationSeconds(cssVar: string, fallbackMs: number): number` from `src/lib/motion/read-duration-seconds.ts` (Task 1).
- Produces: `export interface FaqItemDisplay { id: string; question: string; answer: string }` and `export default function FaqAccordion({ items }: { items: FaqItemDisplay[] })`. Task 5 (`FaqSection`) imports both.

- [ ] **Step 1: Create the component**

Create `src/components/sections/faq-accordion.tsx`:

```tsx
"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { readDurationSeconds } from "@/lib/motion/read-duration-seconds";
import { cn } from "@/lib/utils/cn";

export interface FaqItemDisplay {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItemDisplay[];
}

// Single `openId` (not one boolean per item) enforces the single-open
// accordion behavior by construction — there is no state shape in which
// two items could both read as open.
export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();
  const duration = readDurationSeconds("--duration-micro", 150);

  return (
    <div className="border-border border-t">
      {items.map((item) => {
        const isOpen = item.id === openId;
        const headerId = `${baseId}-${item.id}-header`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div key={item.id} className="border-border border-b">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="text-14 md:text-16 text-text-primary flex min-h-44 w-full items-center justify-between gap-16 py-16 text-start font-medium"
              >
                <span>{item.question}</span>
                <Plus
                  aria-hidden="true"
                  className={cn(
                    "text-text-secondary size-20 shrink-0",
                    !shouldReduceMotion &&
                      "duration-micro transition-transform",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
            </h3>

            {shouldReduceMotion ? (
              // CRITICAL short-circuit, same rule as Reveal: reduced-motion
              // means no transform/height transition at all, not a
              // shortened version of the same animation — the panel is
              // either fully in the DOM or not there.
              isOpen && (
                <div id={panelId} role="region" aria-labelledby={headerId}>
                  <p className="text-14 text-text-secondary pe-40 pb-16">
                    {item.answer}
                  </p>
                </div>
              )
            ) : (
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                initial={false}
                animate={{ height: isOpen ? "auto" : 0 }}
                transition={{ duration, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="text-14 text-text-secondary pe-40 pb-16">
                  {item.answer}
                </p>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/faq-accordion.tsx
git commit -m "feat(faq): add FaqAccordion single-open client component"
```

---

### Task 5: `FaqSection` server component

**Files:**

- Create: `src/components/sections/faq-section.tsx`

**Interfaces:**

- Consumes: `FaqAccordion` and `FaqItemDisplay` from `src/components/sections/faq-accordion.tsx` (Task 4); translation keys `home.faq.sectionLabel` / `helpHeading` / `helpDescription` (Task 3).
- Produces: `export default function FaqSection({ heading, description, items }: { heading: string; description: string; items: FaqItemDisplay[] })`. Task 6 (page wiring) imports this.

- [ ] **Step 1: Create the component**

Create `src/components/sections/faq-section.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import FaqAccordion, {
  type FaqItemDisplay,
} from "@/components/sections/faq-accordion";

interface FaqSectionProps {
  heading: string;
  description: string;
  items: FaqItemDisplay[];
}

export default async function FaqSection({
  heading,
  description,
  items,
}: FaqSectionProps) {
  const t = await getTranslations("home.faq");

  return (
    <Container as="section" className="py-128 md:py-160">
      <SectionLabel number={6}>{t("sectionLabel")}</SectionLabel>

      {/* First DOM child = heading/help text, second = accordion — plain
          logical flex-row reorders itself under dir="rtl" with no rtl:
          classes needed, same technique used in testimonials-section.tsx. */}
      <div className="mt-32 flex flex-col gap-48 md:mt-48 md:flex-row md:gap-64">
        <div className="flex flex-col gap-32 md:w-320 md:shrink-0">
          <div className="flex flex-col gap-16">
            <h2 className="text-48 md:text-64 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
              {heading}
            </h2>
            <p className="text-14 md:text-16 text-text-secondary text-balance">
              {description}
            </p>
          </div>

          <div className="border-border flex flex-col gap-8 border-t pt-32">
            <h3 className="text-16 text-text-primary font-semibold">
              {t("helpHeading")}
            </h3>
            <p className="text-14 text-text-secondary">
              {t("helpDescription")}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <FaqAccordion items={items} />
        </div>
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/faq-section.tsx
git commit -m "feat(faq): add FaqSection layout component"
```

---

### Task 6: Wire `FaqSection` into the home page

**Files:**

- Modify: `src/app/[locale]/page.tsx`

**Interfaces:**

- Consumes: `content.getFaqItems(): Promise<FaqItem[]>` (Task 2), `settings.sections.faq: SectionCopy` (Task 3), `FaqSection` (Task 5).

- [ ] **Step 1: Add the import**

In `src/app/[locale]/page.tsx`, add alongside the other section imports:

```ts
import FaqSection from "@/components/sections/faq-section";
```

- [ ] **Step 2: Fetch FAQ items**

Add `content.getFaqItems()` to the existing `Promise.all` call and destructure it:

```ts
const [
  settings,
  processSteps,
  services,
  projects,
  clients,
  testimonials,
  faqItems,
] = await Promise.all([
  content.getSettings(),
  content.getProcessSteps(),
  content.getServices(),
  content.getProjects(),
  content.getClients(),
  content.getTestimonials(),
  content.getFaqItems(),
]);
```

- [ ] **Step 3: Render the section**

Insert `<FaqSection>` right after `<TestimonialsSection>` and before the existing placeholder `<Container className="py-96">` block:

```tsx
<FaqSection
  heading={pick(settings.sections.faq.heading, locale)}
  description={pick(settings.sections.faq.description, locale)}
  items={faqItems.map((item) => ({
    id: item.id,
    question: pick(item.question, locale),
    answer: pick(item.answer, locale),
  }))}
/>
```

- [ ] **Step 4: Verify with the full toolchain**

Run: `pnpm typecheck`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

Run: `pnpm check:i18n`
Expected: `i18n parity OK — <N> keys`.

- [ ] **Step 5: Manual verification in the browser**

Run: `pnpm dev`, then in a browser:

- Visit `/en` — confirm the FAQ section renders between Testimonials and the placeholder block, `[06]` label, heading "FAQ", 4 questions all collapsed by default.
- Click a question — confirm its answer expands, the `+` icon rotates, and clicking a different question closes the first one and opens the new one (single-open).
- Click the open question again — confirm it collapses.
- Tab through the section with the keyboard only — confirm each question button receives focus and `Enter`/`Space` toggles it.
- Visit `/ar` — confirm the layout mirrors correctly (accordion column order flips), text reads in Arabic, and the label renders `[٠٦]`/`[06]` correctly per the existing bidi handling used by other sections.
- In OS/browser settings, enable "reduce motion", reload, and confirm the accordion opens/closes instantly with no height/transform animation.

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/page.tsx"
git commit -m "feat(faq): wire FaqSection into the home page"
```

---

## Self-Review Notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-08-11-faq-section-design.md` maps to a task — data model → Task 2, section copy/i18n → Task 3, accordion interaction/motion → Task 4, styling/layout → Task 5, page wiring → Task 6. The spec's `apiRepository` stub note is implemented literally in Task 2 Step 5.
- **No test framework:** this repo has none (verified via `find` for `*.test.*` and `package.json` scripts), so every task substitutes `pnpm typecheck` / `pnpm lint` / `pnpm check:i18n` plus, at the end, one real manual pass in the browser (Task 6 Step 5) — that manual pass is the only place actual UI/keyboard/RTL/reduced-motion behavior gets confirmed, so it is not optional.
- **Type consistency:** `FaqItem` (Task 2) → `FaqItemDisplay` (Task 4, the picked/localized display shape) → `FaqSection` props (Task 5) → `page.tsx` mapping (Task 6) all use the same field names (`id`, `question`, `answer`) end to end.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: prospective clients (businesses, startups, SMEs) across industries evaluating a software agency or freelancer for custom web, mobile, backend, or infrastructure work — technically-sophisticated buyers who land on the marketing site to assess credibility and decide whether to start a project. The existing service and case-study copy is written for readers who care about _how_ something gets built (migrations vs. hand-edited databases, documented runbooks vs. tribal knowledge, multi-tenant architecture understood correctly on the first conversation), not just what it looks like.

No other confirmed audience.

## Product Purpose

Right now this is a portfolio / learning showcase, not yet a live lead-generation business site (confirmed). It doubles as a design-craft demonstration and a Laravel learning exercise for its solo builder (per CLAUDE.md's stated project goals: distinctive design + learning Laravel). The surface itself is presented AS a fully credible software-agency marketing site under the name "Codexa," even though the operator behind it is one person and the current client/project content is placeholder — that gap between presentation and reality is deliberate, not a defect to fix.

## Positioning

Technical credibility over generic agency polish. The differentiator repeatedly signaled in existing copy (services, project case studies) is real engineering discipline: content abstracted from components, design tokens matching production pixel-for-pixel, migrations instead of hand-edited databases, documented runbooks instead of tribal knowledge, understanding multi-tenant architecture before the client finishes explaining it. Positioned for buyers who evaluate engineering judgment, not just visual output.

## Operating Context

Bilingual site (Arabic + English) via next-intl, RTL-aware throughout — this is load-bearing, not an afterthought. Contact details point to Cairo, Egypt (placeholder email/phone for now). Content (services, projects, testimonials, clients, site settings) flows through a content-repository abstraction (`src/lib/content`) backed by mock JSON today, designed to swap to a Laravel API later without touching UI components. An admin panel (Laravel + Inertia + React, Phase 9+ of the project plan) is planned but not yet built — today all content is hand-edited JSON.

## Capabilities and Constraints

Next.js 16 App Router marketing frontend, standalone repo, deployed independent of the backend. A Laravel 12 + Inertia admin (separate repo, `company-site-api`) is planned but not yet started — the frontend must keep building and deploying with zero backend dependency until that lands. Six confirmed service lines: web development, mobile app development, UI/UX design, backend/Laravel engineering, DevOps & cloud infrastructure, technical consulting. Cross-industry generalist positioning (confirmed) — logistics, fintech, retail, healthcare, real estate, and education are all in scope; this is not a niche practice. The contact form exists in the UI but is not yet wired to a real submission backend. One-person operation presented in first-person-plural ("we") voice — confirmed intentional.

## Brand Commitments

Name: **Codexa**. An existing logo system is already built: primary mark, monochrome mark, full lockup, and favicon (`public/brand/`). Visual identity is the Violet Issue design system — dark, developer-tooling aesthetic, violet as the sole accent color (never a large fill), Inter (Latin) + Noto Kufi Arabic (Arabic) + JetBrains Mono (numerals/code), documented in `docs/violet-issue-DESIGN.md` and extended for marketing use in `docs/design-decisions.md`. A supplied hero brand mark (a 3D glass rendering of the mark's open-ring geometry) exists as a dark-mode-only decorative asset with a documented light-mode fallback.

## Evidence on Hand

None yet. Every project, client, and testimonial currently in `src/lib/content/mock/` is fictional placeholder content (`example.com` domains, invented companies and quotes) written to exercise the content-repository pattern and populate the design during development. This is confirmed to be a portfolio/showcase site right now, not a live business collecting real case studies. Future work must not treat this placeholder content as real evidence, and must not silently invent new "real-sounding" clients, metrics, or testimonials beyond what already exists as clearly-fictional demo data.

## Product Principles

- Technical craft is the pitch. Copy and case studies should keep demonstrating real engineering judgment — decisions, tradeoffs, outcomes — not generic "we build great software" language.
- One person, agency voice, by design. The plural "we" is a deliberate, confirmed choice — don't retreat to "I," but also don't invent team-size claims (headcount, office, named engineers) that would misrepresent the actual solo operation.
- Bilingual and RTL are load-bearing. Every surface, string, and layout decision needs to genuinely work in Arabic, not just fit it in after the English is done.
- Generalist positioning by design. Don't narrow the portfolio or services to a single vertical — breadth across industries is the confirmed stance, not an unresolved gap to close later.
- Content stays swappable. New copy or case studies should go through the content-repository shape (`Localized { ar, en }` objects, mock JSON today) rather than being hardcoded into components, preserving the "swap the backend later without touching UI" architecture.

## Accessibility & Inclusion

WCAG AA is an evidenced, already-enforced standard in this codebase, not an aspiration: explicit 4.5:1 contrast verification is documented for every new color pairing (`docs/design-decisions.md`), plus a skip-to-content link, visible focus rings, correct `aria-current`/`aria-label`/`aria-modal` usage, and every animation gated behind `prefers-reduced-motion`. Future work should hold this bar, not introduce a lower one.

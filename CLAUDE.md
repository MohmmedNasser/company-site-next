Full plan: docs/PROJECT-PLAN.md — read it before any task.
Design system: docs/violet-issue-DESIGN.md

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

Phase: 4 — Hero: Interactive Background + Parallax
Branch: master

## Commit Convention

Conventional Commits, in English:

```
<type>(<optional scope>): <short summary>
```

Types used in this project: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`.
Example: `chore(tooling): add prettier, eslint flat config, and husky pre-commit hook`

## Workflow — effective now

The developer designs and builds every marketing section by hand from this
point forward (Services, Portfolio, Testimonials, Clients, Contact, and all
inner pages). Header, Footer, and Hero remain as already built in Phase 3-4
and are not rebuilt.

Claude Code's role going forward is LIMITED to:

1. Foundation and infrastructure work, only when explicitly requested
2. Fixing specific bugs the developer reports
3. Answering specific technical questions
4. Reviewing hand-written code against the design-system and i18n-keys
   skills WHEN ASKED — not proactively rewriting it

Claude Code must NOT generate a full section component, full page, or design
a UI layout unless explicitly asked to. If a request is ambiguous about
whether it wants a full build or targeted help, ask before generating a
complete section.

The design-system and i18n-keys skills remain the contract — they now apply
to hand-written code too, not just AI-generated code.

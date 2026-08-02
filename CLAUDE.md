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

Phase: 0
Branch: main

## Commit Convention

Conventional Commits, in English:

```
<type>(<optional scope>): <short summary>
```

Types used in this project: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`.
Example: `chore(tooling): add prettier, eslint flat config, and husky pre-commit hook`

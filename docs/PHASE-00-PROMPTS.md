# Phase 0 — Prompts for Claude Code

Two prompts. Run `0.1` first, review the output, then run `0.2` in a **new chat**.

---

## Prompt 0.1 — Foundation and Configuration

```
Read docs/PROJECT-PLAN.md and docs/violet-issue-DESIGN.md in full before doing
anything. This is Phase 0.1.

CONTEXT
I already installed Next.js 16 and Tailwind CSS v4 myself. Do not scaffold a new
project and do not run create-next-app. Your job is to verify what exists, strip
the boilerplate, and set up the working discipline for the rest of the project.

TASK 1 — Verification report
Inspect the repo and output a markdown table with columns: Check | Expected |
Actual | Status. Do not silently fix anything in this step — report first.
  - next version                      → 16.x
  - react / react-dom version         → 19.x
  - typescript version                → 5.x
  - tailwindcss version               → 4.x
  - tsconfig.json "strict"            → true
  - src/app/globals.css first line    → @import "tailwindcss";  (NOT @tailwind base/components/utilities — that is v3 syntax)
  - tailwind.config.js / .ts          → must NOT exist (v4 is CSS-first)
  - postcss.config.mjs                → uses @tailwindcss/postcss
  - App Router in use                 → src/app/ exists, no src/pages/
  - node version                      → report it
  - package manager                   → pnpm. pnpm-lock.yaml must exist.
                                        package-lock.json and yarn.lock must NOT
                                        exist — if either does, I installed with
                                        the wrong tool; tell me before deleting
                                        anything.
Then run `pnpm dev` and confirm Turbopack starts. Report the boot time.
Ask me before changing anything that fails a check.

TASK 2 — Remove boilerplate
  - Empty src/app/page.tsx down to a minimal placeholder component
  - Delete all default styles in src/app/globals.css except the tailwind import
    (Phase 1 will rewrite this file entirely)
  - Delete the default SVGs in public/
  - Strip src/app/layout.tsx to a minimal html/body shell. Do not add fonts yet.
  - Remove any leftover README boilerplate from create-next-app

TASK 3 — Directory scaffold
Create these directories with a .gitkeep where empty:
  src/app/
  src/components/ui/
  src/components/sections/
  src/components/layout/
  src/lib/content/mock/
  src/lib/content/api/
  src/lib/utils/
  messages/
  docs/learning/
  scripts/
  .claude/skills/

TASK 4 — Tooling
  - Prettier + prettier-plugin-tailwindcss, config file at the root
  - ESLint 9 flat config (note: `next lint` was removed in Next 16 — wire up a
    "lint": "eslint ." script instead)
  - Husky + lint-staged running prettier and eslint on staged files
  - .editorconfig
  - .nvmrc pinned to the node version you reported in Task 1
  - Scripts in package.json: dev, build, start, lint, format, typecheck
  - Lock this project to pnpm:
      "preinstall": "npx only-allow pnpm"
    and add packageManager: "pnpm@<installed version>" to package.json
  - .npmrc at the root. Do not enable shamefully-hoist — if a package needs
    hoisting, tell me and we decide per package rather than weakening the whole
    tree.
  - Every command you write in docs, scripts, or instructions uses pnpm.
    Use `pnpm dlx` where a guide would say `npx`.

TASK 5 — CLAUDE.md
Create CLAUDE.md at the repo root using section 6 of PROJECT-PLAN.md verbatim,
with these two lines added at the top:
  Full plan: docs/PROJECT-PLAN.md — read it before any task.
  Design system: docs/violet-issue-DESIGN.md

TASK 6 — docs/design-decisions.md
Create it with these sections, filled from the plan, each written as a decision
record (Decision / Rationale / Rejected alternatives):
  1. Design system deviations — the table in plan section 1.2
  2. Light mode palette — the table in plan section 1.3
  3. Arabic typography rules — plan section 1.4
  4. Hero background — DECIDED: reactbits `Threads`.
     Rationale: real cursor interaction via enableMouseInteraction, thin lines
     keep headline contrast intact, ogl dependency is lighter than three.
     Rejected: LiquidEther (three.js, GPU cost too high for a marketing hero),
     Iridescence (mouse response too subtle), Plasma (competes with the headline).
     Mobile and reduced-motion fallback: static CSS gradient.
  5. Numerals — DECIDED: Western digits (123) in both locales.

TASK 7 — Environment
  - .env.example containing: NEXT_PUBLIC_DATA_SOURCE=mock
  - .env.local with the same value, git-ignored
  - Verify .gitignore covers .env.local, node_modules, .next, .vercel
  - .gitignore must also cover package-lock.json and yarn.lock so a stray
    npm/yarn run can never be committed. Only pnpm-lock.yaml is tracked.

TASK 8 — Git
Initialise git if needed and make one commit using Conventional Commits format.
Document the commit convention in a short section at the bottom of CLAUDE.md.

CONSTRAINTS
  - Write no UI components. No Button, no Card, nothing.
  - Install no runtime dependencies. next-intl, motion, lenis, lucide-react,
    next-themes and ogl are installed in the phase that first needs them, so the
    learning trail stays traceable. Dev tooling only in this phase.
  - Never create tailwind.config.js.
  - All code, comments, docs and commit messages in English.

DELIVERABLE
  1. The verification table from Task 1
  2. A tree of every file you created or modified
  3. Anything you found that contradicts the plan

Stop when this is done. Do not start Phase 0.2.
```

**Acceptance criteria:** `pnpm build`, `pnpm lint`, and `pnpm typecheck` all pass. `CLAUDE.md` and `docs/design-decisions.md` exist. No `tailwind.config.js`. No runtime dependency added.

---

## Prompt 0.2 — Author the Priority Skills

Before running this, copy the sample skill into place:

```bash
mkdir -p .claude/skills/i18n-keys
cp ~/Downloads/i18n-keys-SKILL.md .claude/skills/i18n-keys/SKILL.md
```

Note for skill 1 (`design-system`): any shell command it contains must use
pnpm.

Then, in a **new chat**:

```
Read docs/PROJECT-PLAN.md section 5, and read .claude/skills/i18n-keys/SKILL.md
as the reference for format and depth. This is Phase 0.2.

Create two skills. Skill 3 (i18n-keys) already exists — review it and report
any conflict with the plan, but do not rewrite it without asking.

FORMAT — every skill follows this shape
  - Directory: .claude/skills/<name>/SKILL.md
  - Frontmatter with `name` and `description` only
  - The description must state precisely WHEN to trigger, phrased as concrete
    situations ("Use whenever..."), because that string is the only thing read
    at session start. A vague description means the skill never loads.
  - Body: non-negotiable rules first, then a numbered procedure, then correct
    and incorrect code examples side by side, then a pre-commit checklist
  - Actionable rules only. No general advice, no motivational filler.

SKILL 1 — design-system
Triggers on any CSS, styling, or component work.
Must contain:
  - The complete token contract: semantic variable names (--color-bg,
    --color-surface, --color-surface-raised, --color-border,
    --color-text-primary, --color-text-secondary, --color-primary,
    --color-primary-hover, --color-success, --color-warning, --color-error)
    mapped to their dark and light values from PROJECT-PLAN.md sections 1.2-1.3
  - The type scale (11 through 80px) with the role of each step
  - The spacing scale and the radius scale with what each radius is for
  - HARD RULE: no hex literal, no rgb(), no arbitrary Tailwind colour value in
    any component. Tokens only. Include a wrong/right example of this.
  - The density rule: marketing pages use the extended spacing and motion
    scale; the admin panel uses the original dense Violet Issue spec
    (32px controls, 36px rows, 150ms). State that these must never be mixed.
  - The do's and don'ts from violet-issue-DESIGN.md, especially: violet is an
    accent and is never a large background fill; no warm colours; dark mode
    uses background layering instead of shadows
  - How to verify contrast before committing a new colour pairing

SKILL 2 — laravel-teach
Triggers on creating or modifying any file in the Laravel repository.
This project's second goal is learning Laravel, so this skill is what enforces it.
Must contain:
  - The mandatory explanation template. Every Laravel artifact created gets a
    matching entry in docs/learning/NN-topic.md answering four questions:
      What is it?
      Why is it here, in this project specifically?
      What was the alternative, and why was it rejected?
      What breaks if it is removed?
  - Audience calibration: the reader knows PHP and JavaScript well, and knows
    nothing about Laravel conventions. Do not explain what a class is. Do
    explain what a service container is.
  - Explanations reference the actual file just written, with line references,
    not generic framework documentation
  - Numbering convention for docs/learning/ files, and the rule that each file
    ends with "What to read next"
  - HARD RULE: code and its explanation ship in the same commit. A Laravel
    commit with no docs/learning/ change is incomplete.

AFTER CREATING THEM
  1. List each skill with its description line so I can judge trigger quality
  2. Flag any rule that appears in two skills — duplication across skills causes
     conflicting instructions later
  3. Do not write any project code

Stop when this is done and wait for my approval.
```

**Acceptance criteria:** four directories under `.claude/skills/`. Each description names concrete trigger situations. No overlapping rules between skills. No project code written.

---

## After Phase 0

Update the state block at the bottom of `CLAUDE.md`:

```markdown
## Current State

Phase: 1 — Design Tokens
Branch: main
```

Then ask for the Phase 1 prompt.

---
name: laravel-teach
description: Use whenever creating or modifying any file in the company-site-api (Laravel) repository — migrations, models, controllers, routes, middleware, config, anything. This project's second goal is learning Laravel, and this skill is what enforces that every artifact ships with an explanation.
---

## Non-negotiable rules

1. **Every Laravel artifact created or meaningfully modified gets a matching entry in `docs/learning/NN-topic.md`.** "Meaningfully modified" means: a new concept was used, not a typo fix or a rename.
2. **HARD RULE: code and its explanation ship in the same commit.** A Laravel commit that changes `app/`, `routes/`, `database/`, or `config/` with no corresponding `docs/learning/` change is incomplete — do not present it as done.
3. **Audience calibration:** the reader knows PHP and JavaScript well, and knows nothing about Laravel conventions. Do not explain what a class, an interface, or a function is. Do explain what a service container is, what a facade resolves to at runtime, what Artisan is doing under the hood, why a migration exists instead of hand-editing the database, etc. — the framework-specific "why", not general programming.
4. **Explanations reference the actual file just written, with line references** (`app/Http/Controllers/ServiceController.php:14`) — not a generic restatement of the Laravel documentation. If you can't point to a specific line, the explanation is too generic.

## The mandatory explanation template

Every `docs/learning/NN-topic.md` entry answers exactly these four questions, in this order:

1. **What is it?** — one or two sentences, concrete, no framework-doc paraphrasing.
2. **Why is it here, in this project specifically?** — reference the actual file and line, not "Laravel apps typically use this."
3. **What was the alternative, and why was it rejected?** — every non-trivial choice has one (Eloquent vs. raw query builder, Form Request vs. inline validation, JSON column vs. separate translations table, etc.).
4. **What breaks if it is removed?** — a concrete failure, not "it wouldn't work." E.g. "requests would no longer be authenticated" or "the `services` table would have no `slug` index and category filtering would full-table-scan."

## Numbering and file-ending convention

- Files are numbered by creation order, zero-padded to two digits: `docs/learning/01-request-lifecycle.md`, `02-service-container.md`, etc. Never renumber an existing file to make room — append at the next available number even if topics would read better reordered.
- Every file ends with a `## What to read next` section — one to three links to the `docs/learning/` entries (existing or anticipated) that build on this one.

## Procedure

1. Before writing the Laravel file, identify which new concept(s) it introduces that haven't already been written up (check `docs/learning/` for an existing entry — don't duplicate one).
2. Write the Laravel code.
3. Write (or extend) the matching `docs/learning/NN-topic.md` entry using the four-question template, with line references into the file(s) just written.
4. Add `## What to read next`.
5. Commit code and docs together. If the commit only touches Laravel files and no `docs/learning/` file, stop — the task isn't done yet.

## Right / wrong

❌ Wrong — generic, no line reference, restates the Laravel docs:

```markdown
## Eloquent Models

Eloquent is Laravel's ORM. It lets you interact with your database using
an object-oriented syntax. Each database table has a corresponding model.
```

✅ Right — specific to this project, references the actual file, answers all four questions:

```markdown
## What is it?

`app/Models/Service.php:1-24` is an Eloquent model — a PHP class that maps
the `services` table to objects and lets `Service::where(...)` compile to SQL
without hand-written queries.

## Why is it here, in this project specifically?

`Service::class` backs both `routes/api.php`'s `GET /api/v1/services` (via
`ServiceResource`) and the future Inertia admin CRUD — one model, two response
layers, per PROJECT-PLAN.md §0.2.

## What was the alternative, and why was it rejected?

Raw `DB::table('services')` queries were rejected — no relationship methods,
no `$casts` for the `title` JSON column (see `Service.php:14`), and every
consumer would have to know the table's column names directly.

## What breaks if it is removed?

`ServiceController` and every seeder/factory referencing `Service::class`
fails to resolve; `php artisan migrate:fresh --seed` throws immediately.

## What to read next

- `02-service-container.md` — how `Service` instances get built inside a request
- `05-api-resources.md` — how `Service` becomes JSON without exposing raw columns
```

## Pre-commit checklist

- [ ] Every new Laravel concept in this diff has a `docs/learning/NN-topic.md` entry
- [ ] Each entry answers all four questions, in order
- [ ] Each entry references actual file(s) and line(s) from this commit, not generic docs
- [ ] Each entry ends with `## What to read next`
- [ ] Code and docs are staged in the same commit

---
name: section-component
description: Use whenever creating or modifying a marketing section (About, Services, Selected Work, Testimonials, Clients, Contact, etc.) or any other page block under src/components/sections/.
---

## Non-negotiable rules

1. **One component per file, in `src/components/sections/`, named `<SectionName>Section`, default export, typed props.** No multi-section files, no untyped `props: any`.
2. **All content comes from the content repository at `src/lib/content`.** Never call `fetch` inside a component, never hardcode copy — not even a placeholder string "just for now." If the data doesn't exist yet in `src/lib/content/mock/`, add it there first.
3. **Every user-facing string goes through next-intl.** No literal English or Arabic text inside JSX. See the `i18n-keys` skill for key naming (not yet authored as of this project's Phase 0 — until it exists, follow the namespaced key convention already used elsewhere, e.g. `home.hero.title`, and flag the gap rather than inventing a naming scheme unilaterally).
4. **Animated content is wrapped in the shared `Reveal` component** (built in Phase 3 — this skill assumes it exists by the time any section is built). Reveal duration is 400–700ms, children stagger, and content above the fold never animates on initial paint — it should be visible immediately, not fade/slide in on load.
5. **Accessibility floor:** exactly one `<h2>` per section, semantic landmark (`<section aria-label>` or equivalent), visible focus ring on every interactive element, `prefers-reduced-motion` respected (Reveal handles this, but verify — don't bypass Reveal for a "quick" custom animation), decorative images get `alt=""`.
6. **Responsive floor:** works at 360px width with no horizontal scroll, no fixed heights on any container that holds text (translated Arabic strings run longer than their English source and must be allowed to wrap).

## File layout

```
src/components/sections/
  AboutSection.tsx
  ServicesSection.tsx
  SelectedWorkSection.tsx
  TestimonialsSection.tsx
  ClientsSection.tsx
  ContactSection.tsx
```

## Procedure

1. Confirm the data this section needs exists in `src/lib/content/mock/*.json` and has a method on `src/lib/content/repository.ts`. If not, add it there first — see the `content-repository` checklist in `docs/PROJECT-PLAN.md` §5 (type → repository method → mock JSON → mock impl).
2. Write the component reading data through `content`, never through a prop drilled from a server fetch and never through a direct JSON import.
3. Route every string through `useTranslations`/`getTranslations`, with a namespaced key matching the section (`home.services.title`, not `title`).
4. Wrap anything that animates on scroll in `<Reveal>`. Leave above-the-fold content unwrapped or statically visible.
5. Add exactly one `<h2>` and a semantic landmark wrapper.
6. Check the component at 360px width and confirm no text container has a fixed height.

## Wrong / right

❌ Wrong — hardcoded copy, direct fetch, no landmark, arbitrary motion:

```tsx
export default function ServicesSection() {
  const [services, setServices] = useState([]);
  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices);
  }, []);

  return (
    <div className="py-32">
      <div className="text-2xl font-semibold">Our Services</div>
      {services.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {s.title}
        </motion.div>
      ))}
    </div>
  );
}
```

✅ Right — content repository, next-intl, Reveal, semantic landmark:

```tsx
import { content } from "@/lib/content";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";

export default function ServicesSection() {
  const t = useTranslations("home.services");
  const services = content.getServices();

  return (
    <section aria-label={t("title")} className="py-32">
      <h2 className="text-32">{t("title")}</h2>
      {services.map((service) => (
        <Reveal key={service.id}>
          <p>{service.title.en /* resolved by request locale in practice */}</p>
        </Reveal>
      ))}
    </section>
  );
}
```

## Pre-commit checklist

- [ ] Component lives in `src/components/sections/`, named `<SectionName>Section`, default export, typed props
- [ ] No `fetch` inside the component — all data via `content`
- [ ] No hardcoded copy — every string is a translation key present in both `ar.json` and `en.json`
- [ ] Above-the-fold content is not wrapped in a scroll-triggered `Reveal`
- [ ] Exactly one `<h2>`, one semantic landmark
- [ ] Verified at 360px width — no horizontal scroll, no fixed-height text containers
- [ ] **LTR check:** renders correctly with `dir="ltr"`, English copy fits without overflow
- [ ] **RTL check:** renders correctly with `dir="rtl"` — layout mirrors (not just text), no leftover `pl-`/`pr-`/`left-`/`right-` utility broke the mirror, longer Arabic strings don't overflow or clip

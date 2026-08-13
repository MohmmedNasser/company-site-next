// src/lib/content/types.ts

export type Localized = { ar: string; en: string };

export interface Service {
  id: string;
  slug: string;
  icon: string; // lucide-react icon name, installed in Phase 3
  // Full-colour photography — a documented exception to the monochrome
  // system, scoped to the home Services section only. Placeholder paths
  // until real photography is supplied.
  image: string;
  // Short practitioner-term tags (kept in English in both locales, per the
  // i18n-keys skill's "keep practitioner terms in English" rule — these
  // are labels like "API"/"CI/CD", not translatable prose).
  categories: string[];
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
  // Out of 5. Kept per-testimonial rather than assumed-5 across the board —
  // real reviews aren't uniformly perfect, and the small variation reads as
  // more credible than a flat row of identical scores.
  rating: number;
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

// Leaner than Service on purpose: process steps have no detail page, so no
// slug/body — just what the "how we work" cards render (design-decisions.md
// §15).
export interface ProcessStep {
  id: string;
  icon: string; // lucide-react icon name
  order: number;
  title: Localized;
  description: Localized;
}

// Same shape as ProcessStep on purpose: an FAQ entry has no detail page
// either, just a question/answer pair the accordion renders.
export interface FaqItem {
  id: string;
  order: number;
  question: Localized;
  answer: Localized;
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

// --- /about page content -------------------------------------------------

// Leaner than Service (no slug/body): a team member has no detail page, so
// `bio` is the full text the card renders, not an excerpt pointing at one.
export interface TeamMember {
  id: string;
  avatar: string;
  order: number;
  name: Localized;
  role: Localized;
  bio: Localized;
}

// Same shape as ProcessStep on purpose — a value is an icon + a title + a
// paragraph, with no detail page — so the Phase 14 admin form for one
// covers the other with no extra fields.
export interface ValueItem {
  id: string;
  icon: string; // lucide-react icon name, resolved through a render-time map
  order: number;
  title: Localized;
  description: Localized;
}

// `status` is a StatusCircleState, not a free-form string: the timeline
// renders it through the existing StatusCircle primitive, so the content
// layer can only express states that primitive already draws. Marketing
// pages pass tone="mono" (see status-circle.tsx) — the shape carries the
// meaning here, not the colour.
export interface TimelineEntry {
  id: string;
  // Plain string, not localized — Western digits in both locales, same
  // decision as SiteSettings.hero.trust's numerals.
  year: string;
  status: "done" | "in-progress" | "todo";
  order: number;
  title: Localized;
  description: Localized;
}

interface SectionCopy {
  heading: Localized;
  description: Localized;
}

// The only home section whose CTA is settings-editable content rather than
// UI chrome (same reasoning as hero.ctaPrimary/ctaSecondary) — every other
// section's SectionCopy stays uniform on purpose (see the comment on
// `approach` below), so this gets its own shape instead of widening the
// shared one for every section.
interface ProcessSectionCopy extends SectionCopy {
  ctaLabel: Localized;
}

// Multi-paragraph prose. Stored as a single Localized string with blank
// lines between paragraphs and split at render time by `toParagraphs()`
// (src/lib/content/paragraphs.ts) — same storage shape Service.body and
// Post.body already use, so one convention covers every long-form field
// instead of prose being an array here and a string there.
interface ProseSectionCopy extends SectionCopy {
  body: Localized;
}

// Copy for an inner page's own sections. Kept in a `pages` block separate
// from `sections`, because `sections` is specifically the HOME page's
// section copy keyed by home section — an inner page's sections are not
// home sections, and folding them in would make that key mean two things.
// Only an intro: every other block on these pages is rendered from
// collection records (Service / Project / Post), so there's nothing else
// here for the admin panel to edit.
interface IndexPageCopy {
  intro: SectionCopy;
}

interface AboutPageCopy {
  // The page opener: `heading` is the large page heading, `description` the
  // supporting lede under it — same two fields every other section uses, so
  // the shape stays uniform (see the comment on `approach` above).
  intro: SectionCopy;
  story: ProseSectionCopy;
  values: SectionCopy;
  team: SectionCopy;
  timeline: SectionCopy;
}

export interface SiteSettings {
  hero: {
    title: Localized;
    subtitle: Localized;
    ctaPrimary: Localized;
    ctaSecondary: Localized;
    // Numerals are plain strings, not localized — Western digits in both
    // locales, so there's no {ar, en} split to make.
    trust: {
      rating: string;
      ratingScale: string;
      clientsCount: string;
      clientsLabel: Localized;
    };
  };
  sections: {
    about: SectionCopy;
    // Approach reads the shared SectionCopy shape rather than inventing its
    // own: `heading` is the large scroll-revealed statement and
    // `description` the supporting line under it. Keeping the shape uniform
    // means the Phase 14 admin form for section copy covers this section
    // with no extra fields.
    approach: SectionCopy;
    process: ProcessSectionCopy;
    services: SectionCopy;
    portfolio: SectionCopy;
    testimonials: SectionCopy;
    faq: SectionCopy;
    clients: SectionCopy;
    contact: SectionCopy;
  };
  // Inner-page copy. One key per page that needs copy of its own; a page
  // whose every block comes from a collection (a detail page, which is just
  // one record rendered) doesn't get an entry.
  pages: {
    about: AboutPageCopy;
    services: IndexPageCopy;
    portfolio: IndexPageCopy;
    blog: IndexPageCopy;
    contact: IndexPageCopy;
  };
  contact: {
    email: string;
    phone: string;
    address: Localized;
    // Just the city, distinct from the full `address` — Footer's "Built in
    // <city>" line (Phase 3) needs this on its own rather than parsing it
    // back out of the full address string.
    city: Localized;
  };
  // Footer newsletter block copy (Phase 4 rebuild) — content, not UI chrome,
  // so it lives here alongside hero/sections rather than in messages/*.json.
  // The form's field labels/button/status text stay in messages, same split
  // used by sections.contact vs. home.contact.form.
  newsletter: {
    heading: Localized;
    subtext: Localized;
  };
  social: { platform: string; url: string }[];
}

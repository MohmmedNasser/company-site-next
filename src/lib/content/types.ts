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

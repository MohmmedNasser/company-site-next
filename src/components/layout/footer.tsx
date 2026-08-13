import type { ComponentType } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { pick, type SiteSettings } from "@/lib/content";
import { NAV_ITEMS } from "@/lib/nav";
import Container from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import NewsletterForm from "./newsletter-form";

// No "use client" on Footer itself — only NewsletterForm (the one
// interactive piece) is a client component. Content settings (newsletter
// copy, social links, contact email) are received as a prop from the
// locale layout, per Task 5's server/client boundary: components under
// src/lib/content are server-only, and Header/MobileNav next to this one
// ARE client components, so neither of them may import "@/lib/content"
// directly — only this parent-fetched prop.
interface FooterProps {
  settings: SiteSettings;
}

// react-icons/fa6, not lucide — lucide-react 1.28 ships no brand/social
// icons (dropped for trademark reasons). Single-color glyphs (currentColor),
// styled through the same primary/on-primary tokens as <Button variant="primary">
// so the badges read as one system with the rest of the UI, not a new accent.
const SOCIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  youtube: FaYoutube,
};

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  youtube: "YouTube",
};

// "Main" mirrors the primary/offering pages; "Links" the info/contact
// pages — same grouping logic as the reference, sourced from the single
// NAV_ITEMS list (src/lib/nav.ts) rather than a new nav source.
const FOOTER_COLUMNS = [
  { headingKey: "main", itemKeys: ["home", "services", "portfolio"] },
  { headingKey: "links", itemKeys: ["about", "blog", "contact"] },
] as const;

export default async function Footer({ settings }: FooterProps) {
  const t = await getTranslations("common");
  const locale = await getLocale();

  return (
    <footer className="theme-footer-light bg-bg">
      {/* Thin top accent bar. Always the near-black --primary now that
          Footer is pinned to the light palette (see .theme-footer-light in
          tokens.css) — matches the reference regardless of the page's own
          active theme. */}
      <div className="bg-primary h-4 w-full" aria-hidden="true" />

      <Container className="flex flex-col gap-64 py-64 lg:flex-row lg:items-start lg:justify-between lg:gap-80 lg:py-96">
        <NewsletterForm
          heading={pick(settings.newsletter.heading, locale)}
          subtext={pick(settings.newsletter.subtext, locale)}
        />

        <div className="flex gap-48 sm:gap-64">
          {FOOTER_COLUMNS.map((column) => (
            <nav
              key={column.headingKey}
              aria-label={t(`footer.columns.${column.headingKey}`)}
              className="flex flex-col gap-16"
            >
              <p className="text-12 text-text-secondary font-medium">
                {t(`footer.columns.${column.headingKey}`)}
              </p>
              <ul className="flex flex-col gap-12">
                {column.itemKeys.map((itemKey) => {
                  const navItem = NAV_ITEMS.find(
                    (item) => item.key === itemKey,
                  );
                  if (!navItem) return null;
                  return (
                    <li key={itemKey}>
                      <Link
                        href={navItem.href}
                        className="text-text-primary hover:text-text-secondary duration-micro text-16 font-medium transition-colors"
                      >
                        {t(`nav.${navItem.key}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <Container className="flex flex-col items-start gap-24 pb-48 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-8">
          <span className="text-11 text-text-secondary">
            {t("footer.contactEmailLabel")}
          </span>
          <a
            href={`mailto:${settings.contact.email}`}
            className="text-text-primary hover:text-text-secondary duration-micro text-16 font-medium transition-colors"
          >
            {settings.contact.email}
          </a>
        </div>

        <div className="flex items-center gap-8">
          {settings.social.map((entry) => {
            const Icon = SOCIAL_ICONS[entry.platform];
            if (!Icon) return null;
            return (
              <a
                key={entry.platform}
                href={entry.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={t("a11y.followOn", {
                  platform: SOCIAL_LABELS[entry.platform] ?? entry.platform,
                })}
                className="bg-primary text-on-primary hover:bg-primary-hover duration-micro inline-flex size-36 items-center justify-center rounded-full transition-colors"
              >
                <Icon className="size-16" />
              </a>
            );
          })}
        </div>
      </Container>

      {/* Giant faint wordmark, bleeding off both edges and cropped at the
          bottom. The reserved mega-headline tokens (text-96/120) top out at
          120px, which can't span a viewport-wide line for a 6-letter word —
          --text-96 is kept as the floor of a fluid clamp() so the size
          stays token-anchored at the low end while scaling with viewport
          width to actually reach both edges, the one deliberate exception
          to the fixed type scale for this signature element. No start
          padding here (unlike the Container above it) — full bleed, flush
          with the true edge, matching the reference.

          Colour is --color-text-decorative, not a raw hex: this IS the
          token's documented purpose (a large, intentionally low-contrast
          decorative number/word, aria-hidden, never real content a user
          needs to read) — see the design-system skill's contrast section.
          Already wired in .theme-footer-light below, so it resolves
          correctly here regardless of the page's active theme. */}
      <div
        className="flex w-full items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <p
          lang="en"
          style={{
            fontFamily: "var(--font-sans-latin), sans-serif",
            fontSize: "clamp(var(--text-96), 22vw, 260px)",
          }}
          className="text-text-decorative pointer-events-none -mb-16 leading-none font-semibold tracking-[-0.03em] whitespace-nowrap select-none sm:-mb-24 lg:-mb-40"
        >
          CODEXA
        </p>
      </div>
    </footer>
  );
}

import type { ComponentType } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { pick, type SiteSettings } from "@/lib/content";
import { NAV_ITEMS } from "@/lib/nav";
import { LogoMark } from "@/components/icons/logo";
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/icons/social-icons";
import Container from "@/components/ui/container";
import { Link } from "@/i18n/navigation";

// No "use client" — Footer has no interactive/stateful behaviour, so it
// stays a Server Component. Content settings (social links, city) are
// received as a prop from the locale layout, per Task 5's server/client
// boundary: components under src/lib/content are server-only, and Header/
// MobileNav next to this one ARE client components, so neither of them may
// import "@/lib/content" directly — only this parent-fetched prop.
interface FooterProps {
  settings: SiteSettings;
}

const SOCIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  linkedin: LinkedInIcon,
  twitter: XIcon,
  github: GitHubIcon,
  instagram: InstagramIcon,
};

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  github: "GitHub",
  instagram: "Instagram",
};

const FOOTER_COLUMNS = [
  { headingKey: "company", itemKeys: ["home", "about"] },
  { headingKey: "services", itemKeys: ["services", "portfolio"] },
  { headingKey: "resources", itemKeys: ["blog", "contact"] },
] as const;

export default async function Footer({ settings }: FooterProps) {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t">
      <Container className="grid grid-cols-1 gap-48 py-64 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-16">
          <Link
            href="/"
            aria-label={t("nav.home")}
            className="inline-flex items-center gap-8"
          >
            <LogoMark className="text-primary" />
            <span
              lang="en"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
              className="text-text-primary text-16 leading-none font-semibold tracking-[-0.03em]"
            >
              Codexa
            </span>
          </Link>
          <p className="text-14 text-text-secondary max-w-xs">
            {t("footer.description")}
          </p>
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
                  className="text-text-secondary hover:text-primary hover:bg-surface rounded-control duration-micro inline-flex size-32 items-center justify-center transition-colors"
                >
                  <Icon className="size-18" />
                </a>
              );
            })}
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <nav
            key={column.headingKey}
            aria-label={t(`footer.columns.${column.headingKey}`)}
            className="flex flex-col gap-16"
          >
            <p className="text-12 text-text-secondary font-medium overline">
              {t(`footer.columns.${column.headingKey}`)}
            </p>
            <ul className="flex flex-col gap-12">
              {column.itemKeys.map((itemKey) => {
                const navItem = NAV_ITEMS.find((item) => item.key === itemKey);
                if (!navItem) return null;
                return (
                  <li key={itemKey}>
                    <Link
                      href={navItem.href}
                      className="text-14 text-text-secondary hover:text-text-primary duration-micro transition-colors"
                    >
                      {t(`nav.${navItem.key}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-border border-t">
        <Container className="text-13 text-text-secondary flex flex-col-reverse items-center justify-between gap-16 py-24 sm:flex-row">
          <p>{t("footer.copyright", { year })}</p>
          <div className="flex items-center gap-24">
            <Link
              href="/privacy"
              className="hover:text-text-primary duration-micro transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-text-primary duration-micro transition-colors"
            >
              {t("footer.terms")}
            </Link>
            <span>
              {t("footer.builtIn", {
                city: pick(settings.contact.city, locale),
              })}
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}

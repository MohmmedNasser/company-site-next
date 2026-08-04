"use client";

import { Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { motion, useTransform } from "motion/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useIsMounted } from "@/lib/hooks/use-is-mounted";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { lenisScrollY } from "@/lib/motion/lenis-scroll";
import { NAV_ITEMS, isNavItemActive } from "@/lib/nav";
import { cn } from "@/lib/utils/cn";
import { LogoMark } from "@/components/icons/logo";
import { buttonClassNames } from "@/components/ui/button";
import Container from "@/components/ui/container";
import MobileNav from "@/components/layout/mobile-nav";

const CTA_HREF = "/contact";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  // Avoids an SSR/client mismatch: next-themes only knows the real theme
  // after its own hydration effect runs, so the icon renders nothing until
  // useIsMounted flips (useSyncExternalStore-backed, see that hook).
  const mounted = useIsMounted();
  const isDark = mounted ? resolvedTheme === "dark" : undefined;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("a11y.toggleTheme")}
      className="text-text-primary rounded-control hover:bg-surface duration-micro inline-flex size-40 items-center justify-center transition-colors"
    >
      {isDark === undefined ? null : isDark ? (
        <Sun aria-hidden="true" className="size-20" />
      ) : (
        <Moon aria-hidden="true" className="size-20" />
      )}
    </button>
  );
}

function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common.locale");
  const target = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? t("switchToEnglish") : t("switchToArabic");

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: target })}
      aria-label={label}
      className="text-13 text-text-secondary hover:text-text-primary hover:bg-surface rounded-control duration-micro px-12 py-8 font-medium transition-colors"
    >
      {target === "ar" ? "AR" : "EN"}
    </button>
  );
}

function HeaderContent({ ctaLabel }: { ctaLabel: string }) {
  const pathname = usePathname();
  const t = useTranslations("common");

  return (
    <Container className="flex h-full items-center justify-between gap-16">
      <Link
        href="/"
        aria-label={t("nav.home")}
        className="rounded-control inline-flex items-center gap-8"
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

      <nav
        aria-label={t("a11y.primaryNav")}
        className="hidden items-center gap-32 md:flex"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "text-14 rounded-control duration-micro font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <ThemeToggle />
        <Link
          href={CTA_HREF}
          className={cn(
            buttonClassNames({ variant: "primary", size: "compact" }),
            "hidden md:inline-flex",
          )}
        >
          {ctaLabel}
        </Link>
        <MobileNav ctaHref={CTA_HREF} ctaLabel={ctaLabel} />
      </div>
    </Container>
  );
}

export default function Header() {
  const t = useTranslations("common");
  const prefersReducedMotion = usePrefersReducedMotion();
  const ctaLabel = t("actions.startProject");

  // Reads the Lenis-synced MotionValue (see lib/motion/lenis-scroll.ts), not
  // a raw window scroll listener — this is what Task 4 requires and what
  // keeps the condense effect exactly in step with what Lenis is rendering.
  // Both hooks run unconditionally (rules of hooks) even though the
  // reduced-motion branch below never reads their output — under reduced
  // motion, SmoothScrollProvider never mounts Lenis, so lenisScrollY stays
  // frozen at 0 and these would never animate anyway.
  const headerHeight = useTransform(lenisScrollY, [0, 80], ["64px", "52px"], {
    clamp: true,
  });
  const borderOpacity = useTransform(lenisScrollY, [0, 24], [0, 1], {
    clamp: true,
  });

  // CRITICAL: under reduced motion, render a plain, static header — fixed
  // height, border always visible — instead of a header whose condense
  // effect would silently never fire (frozen lenisScrollY) while still
  // carrying a permanently-invisible border. Respecting reduced motion here
  // means no scroll-driven interpolation runs at all, not a smaller one.
  if (prefersReducedMotion) {
    return (
      <header className="bg-bg/85 border-border sticky top-0 z-40 h-64 border-b backdrop-blur">
        <HeaderContent ctaLabel={ctaLabel} />
      </header>
    );
  }

  return (
    <motion.header
      style={{ height: headerHeight }}
      className="bg-bg/85 sticky top-0 z-40 backdrop-blur"
    >
      {/* Border-bottom presence never changes (no layout shift) — only its
          opacity animates, driven by the same Lenis-synced scroll value. */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: borderOpacity }}
        className="border-border pointer-events-none absolute inset-x-0 bottom-0 border-b"
      />
      <HeaderContent ctaLabel={ctaLabel} />
    </motion.header>
  );
}

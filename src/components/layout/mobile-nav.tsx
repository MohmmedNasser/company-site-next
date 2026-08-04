"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { Link, usePathname } from "@/i18n/navigation";
import { buttonClassNames } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, isNavItemActive } from "@/lib/nav";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MobileNavProps {
  ctaHref: string;
  ctaLabel: string;
}

export default function MobileNav({ ctaHref, ctaLabel }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const t = useTranslations("common");
  // Falls back to undefined under prefers-reduced-motion (SmoothScrollProvider
  // never mounts <ReactLenis> there — see that file) or before mount; both
  // guarded with `?.` below.
  const lenis = useLenis();

  // Legitimate effect: subscribes to real DOM events (keydown) and an
  // external system (Lenis, body scroll) only while the overlay is open,
  // and every setState call inside it is in response to one of those
  // external events — not the set-state-in-effect anti-pattern (a state
  // variable that's really just mirroring mount status) that use-is-
  // mounted.ts exists to avoid elsewhere in this codebase.
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    const trigger = triggerRef.current;
    panel?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    document.body.style.overflow = "hidden";
    lenis?.stop();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      lenis?.start();
      trigger?.focus();
    };
  }, [isOpen, lenis]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("a11y.openMenu")}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        className="text-text-primary rounded-control hover:bg-surface inline-flex size-40 items-center justify-center md:hidden"
      >
        <Menu aria-hidden="true" className="size-24" />
      </button>

      {isOpen &&
        createPortal(
          <div
            id="mobile-nav-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("a11y.primaryNav")}
            className="bg-bg fixed inset-0 z-50 flex flex-col md:hidden"
          >
            <div className="flex h-64 items-center justify-end px-24">
              <button
                type="button"
                data-autofocus
                onClick={() => setIsOpen(false)}
                aria-label={t("a11y.closeMenu")}
                className="text-text-primary rounded-control hover:bg-surface inline-flex size-40 items-center justify-center"
              >
                <X aria-hidden="true" className="size-24" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center gap-32">
              {NAV_ITEMS.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "text-24 font-semibold",
                      isActive ? "text-primary" : "text-text-primary",
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                );
              })}
              <Link
                href={ctaHref}
                onClick={() => setIsOpen(false)}
                className={buttonClassNames({
                  variant: "primary",
                  className: "mt-16",
                })}
              >
                {ctaLabel}
              </Link>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}

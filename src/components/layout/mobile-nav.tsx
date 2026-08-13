"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { buttonClassNames } from "@/components/ui/button";
import { useIsMounted } from "@/lib/hooks/use-is-mounted";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { readDurationSeconds } from "@/lib/motion/read-duration-seconds";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, isNavItemActive } from "@/lib/nav";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MobileNavProps {
  ctaHref: string;
  ctaLabel: string;
}

/**
 * Rows, not a centred list.
 *
 * Two reasons beyond looks. The row is the shape this site already uses for
 * every index page (/services, /blog), so the menu reads as part of the
 * same system rather than a separate mobile skin. And a full-width row with
 * `py-20` is a ~64px target, where the previous centred text links were
 * only as tall as their own line box — under the 44px minimum, on the one
 * surface that is only ever touched.
 */
const ROW_CLASSES =
  "group relative flex w-full items-center justify-between gap-16 py-20";

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
  const shouldReduceMotion = useReducedMotion();
  // createPortal needs a real document.body, which doesn't exist during SSR.
  // The portal is now rendered unconditionally once mounted (rather than
  // only while open) so AnimatePresence lives INSIDE it — see the comment
  // at the portal below.
  const mounted = useIsMounted();

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
      // Runs the moment `isOpen` flips, so scroll and focus are restored
      // while the panel is still playing its exit — which is correct: the
      // page should be usable again as soon as the decision to close is
      // made, not after an animation the user is no longer watching.
      document.body.style.overflow = "";
      lenis?.start();
      trigger?.focus();
    };
  }, [isOpen, lenis]);

  const panelContent = (
    <PanelBody
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
      pathname={pathname}
      onNavigate={() => setIsOpen(false)}
      t={t}
    />
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("a11y.openMenu")}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        className="text-text-primary rounded-control hover:bg-surface duration-micro inline-flex size-40 shrink-0 items-center justify-center transition-colors md:hidden"
      >
        <Menu aria-hidden="true" className="size-24" />
      </button>

      {mounted &&
        createPortal(
          // AnimatePresence sits INSIDE the portal, and the portal itself is
          // always rendered. The other way round — a conditional portal
          // wrapped in AnimatePresence — is the classic reason exit
          // animations silently don't play: AnimatePresence would be
          // inspecting a portal object rather than the motion element, and
          // by the time it looked, the whole subtree is already gone.
          <AnimatePresence>
            {isOpen && (
              <Panel
                key="mobile-nav-panel"
                ref={panelRef}
                label={t("a11y.primaryNav")}
                shouldReduceMotion={shouldReduceMotion ?? false}
              >
                {panelContent}
              </Panel>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

const PANEL_CLASSES = "bg-bg fixed inset-0 z-50 flex flex-col md:hidden";

function Panel({
  ref,
  label,
  shouldReduceMotion,
  children,
}: {
  ref: React.Ref<HTMLDivElement>;
  label: string;
  shouldReduceMotion: boolean;
  children: React.ReactNode;
}) {
  const shared = {
    id: "mobile-nav-panel",
    role: "dialog" as const,
    "aria-modal": true,
    "aria-label": label,
  };

  // CRITICAL short-circuit, same contract as Reveal and Entrance: the panel
  // appears and disappears with no transition, no transform, and no exit
  // animation scheduled — not a faster version of the same sheet.
  if (shouldReduceMotion) {
    return (
      <div ref={ref} {...shared} className={PANEL_CLASSES}>
        {children}
      </div>
    );
  }

  const duration = readDurationSeconds("--duration-reveal", 500);

  const panel: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: duration / 2,
        ease: EASE_DECELERATE,
        // The rows start arriving while the sheet is still fading in, so
        // the two read as one gesture rather than "background, then list".
        delayChildren: duration / 4,
        staggerChildren: 0.06,
      },
    },
    // Out faster than in, and as one piece — staggering an exit makes
    // dismissing feel slower than it is.
    exit: {
      opacity: 0,
      transition: { duration: duration / 3, ease: EASE_DECELERATE },
    },
  };

  return (
    <motion.div
      ref={ref}
      {...shared}
      className={PANEL_CLASSES}
      variants={panel}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

// Rows rise a little further than a scroll reveal does: this is a sheet
// arriving, not content easing into place, and the extra distance is what
// makes the sequence legible at a glance.
const ROW_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// The row's own top border, drawn from the reading-start edge as the row
// lands — the same "a line advances through the sequence" idiom as the
// /about timeline rail, so the site has one motion language rather than a
// separate one per surface.
const RULE_VARIANTS: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1 },
};

function PanelBody({
  ctaHref,
  ctaLabel,
  pathname,
  onNavigate,
  t,
}: {
  ctaHref: string;
  ctaLabel: string;
  pathname: string;
  onNavigate: () => void;
  t: (key: string) => string;
}) {
  return (
    <>
      {/* h-64 + px-24 lines the close button up with the header pill's own
          controls, so it appears where the menu button just was. */}
      <motion.div
        variants={ROW_VARIANTS}
        className="flex h-64 shrink-0 items-center justify-end px-24"
      >
        <button
          type="button"
          data-autofocus
          onClick={onNavigate}
          aria-label={t("a11y.closeMenu")}
          className="text-text-primary rounded-control hover:bg-surface duration-micro inline-flex size-40 items-center justify-center transition-colors"
        >
          <X aria-hidden="true" className="size-24" />
        </button>
      </motion.div>

      <nav className="flex flex-1 flex-col justify-center px-24 pb-48">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          return (
            <motion.div key={item.href} variants={ROW_VARIANTS}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={ROW_CLASSES}
              >
                {/* origin-left/rtl:origin-right rather than a logical
                    property: transform-origin has no inline-start keyword,
                    so the draw direction has to be flipped explicitly to
                    follow reading order. */}
                <motion.span
                  aria-hidden="true"
                  variants={RULE_VARIANTS}
                  className="bg-border absolute inset-x-0 top-0 h-px origin-left rtl:origin-right"
                />
                <span
                  className={cn(
                    "text-32 font-semibold",
                    // Active state is weight + opacity, not a colour swap —
                    // there is no accent colour in this system to swap to.
                    isActive
                      ? "text-text-primary"
                      : "text-text-secondary group-hover:text-text-primary duration-micro transition-colors",
                  )}
                >
                  {t(`nav.${item.key}`)}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className={cn(
                    "size-20 shrink-0 rtl:-scale-x-100",
                    isActive ? "text-text-primary" : "text-text-secondary",
                  )}
                />
              </Link>
            </motion.div>
          );
        })}

        <motion.div variants={ROW_VARIANTS} className="mt-32">
          <Link
            href={ctaHref}
            onClick={onNavigate}
            className={buttonClassNames({
              variant: "primary",
              className: "w-full",
            })}
          >
            {ctaLabel}
          </Link>
        </motion.div>
      </nav>
    </>
  );
}

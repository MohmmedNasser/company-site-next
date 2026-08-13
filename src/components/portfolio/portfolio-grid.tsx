"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Link } from "@/i18n/navigation";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { readDurationSeconds } from "@/lib/motion/read-duration-seconds";
import { cn } from "@/lib/utils/cn";

export interface ProjectCardDisplay {
  id: string;
  slug: string;
  /** Raw content value ("web", "mobile", …) — translated in this component. */
  category: string;
  status: "shipped" | "in-development";
  coverImage: string;
  /** Locale-picked on the server: these come from Localized content fields. */
  title: string;
  summary: string;
  clientName: string;
}

interface PortfolioGridProps {
  projects: ProjectCardDisplay[];
  /**
   * Distinct category values in content order. Derived on the server from
   * the full project list rather than from `projects` here, so the filter
   * row is stable and doesn't reorder itself as the grid changes.
   */
  categories: string[];
}

const ALL = "all";

/**
 * The /portfolio index: a category filter over a project grid.
 *
 * Client state rather than a URL search param, deliberately. Every route on
 * this site is statically prerendered; reading a search param would make
 * this page render per request for a control whose whole job is to feel
 * instant. The cost is that a filtered view isn't linkable — worth
 * revisiting if anyone needs to share "just the mobile work", which would
 * mean moving the filter into the path (/portfolio/mobile) so it stays
 * static rather than into a query string.
 *
 * Translations are read here with `useTranslations` rather than passed down
 * as props: label props would be fine, but a `(count) => string` for the
 * ICU plural would not — functions don't cross the server/client boundary.
 * Reading them here keeps all of it in one place. Same thing Header does.
 */
export default function PortfolioGrid({
  projects,
  categories,
}: PortfolioGridProps) {
  const t = useTranslations("portfolio.filter");
  const tCommon = useTranslations("common");
  const [active, setActive] = useState<string>(ALL);
  const shouldReduceMotion = useReducedMotion();

  const visible = useMemo(
    () =>
      active === ALL
        ? projects
        : projects.filter((project) => project.category === active),
    [projects, active],
  );

  const options = [
    { value: ALL, label: t("allLabel") },
    ...categories.map((value) => ({
      value,
      label: tCommon(`projectCategories.${value}`),
    })),
  ];

  return (
    <>
      {/* A group of toggle buttons, not a tablist: these filter content in
          place rather than switching between panels, so `aria-pressed` on
          each button is the honest mapping. Buttons are focusable and pick
          up the global :focus-visible ring with no extra styling. */}
      <div
        role="group"
        aria-label={t("groupLabel")}
        className="flex flex-wrap items-center gap-8"
      >
        {options.map((option) => {
          const isActive = option.value === active;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(option.value)}
              className={cn(
                "rounded-chip text-12 duration-micro border px-12 py-8 font-medium transition-colors",
                isActive
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-text-secondary border-border hover:border-text-secondary hover:text-text-primary",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* aria-live so a keyboard or screen-reader user hears the result of
          pressing a filter — a grid changing silently below is not
          feedback. `polite` waits for a pause instead of cutting off the
          button's own announcement. */}
      <p aria-live="polite" className="text-12 text-text-secondary mt-16">
        {t("resultCount", { count: visible.length })}
      </p>

      <PortfolioCards
        projects={visible}
        shouldReduceMotion={shouldReduceMotion ?? false}
      />
    </>
  );
}

const GRID_CLASSES = "mt-32 grid grid-cols-1 gap-32 md:mt-48 md:grid-cols-2";

function PortfolioCards({
  projects,
  shouldReduceMotion,
}: {
  projects: ProjectCardDisplay[];
  shouldReduceMotion: boolean;
}) {
  // CRITICAL short-circuit, same contract as Reveal and Entrance: a plain
  // grid, no layout animation, no enter/exit transition. Filtering still
  // works — it just swaps the content with no motion, which is the point.
  if (shouldReduceMotion) {
    return (
      <div className={GRID_CLASSES}>
        {projects.map((project) => (
          <PortfolioCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  const duration = readDurationSeconds("--duration-reveal", 500);

  const card: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE_DECELERATE },
    },
    // Faster out than in: something leaving shouldn't hold up the cards
    // moving into its place.
    exit: {
      opacity: 0,
      y: -12,
      transition: { duration: duration / 2, ease: EASE_DECELERATE },
    },
  };

  return (
    // FILTERING IS NOT A REMOUNT. A card that survives a filter change keeps
    // its DOM node and slides to its new grid position via `layout`, instead
    // of every card fading out and a new set fading in. That is what makes
    // the control read as re-arranging one body of work rather than loading
    // a different page.
    <motion.div layout className={GRID_CLASSES}>
      {/* `popLayout` pulls exiting cards out of flow immediately, so the
          survivors start moving during the exit rather than after it. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            variants={card}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ layout: { duration, ease: EASE_DECELERATE } }}
          >
            <PortfolioCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function PortfolioCard({ project }: { project: ProjectCardDisplay }) {
  const tCommon = useTranslations("common");

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group flex flex-col gap-16"
    >
      <div className="border-border bg-card rounded-card relative aspect-video w-full overflow-hidden border">
        <Image
          src={project.coverImage}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          // Grayscale, per the scoped photography exception — see
          // components/motion/hero-image.tsx.
          className="ease-decelerate object-cover grayscale transition-transform duration-700 group-hover:scale-105"
        />
        {/* Solid, not translucent/blurred — --blur-overlay is scoped to
            floating overlay chrome, never content cards. Same treatment the
            home portfolio section uses. */}
        <span className="bg-card border-border text-text-primary text-13 absolute inset-s-16 top-16 rounded-full border px-16 py-8 font-medium">
          {tCommon(
            project.status === "shipped"
              ? "projectStatus.shipped"
              : "projectStatus.inDevelopment",
          )}
        </span>
      </div>

      <div className="flex flex-col gap-8">
        <span className="text-12 text-text-secondary font-medium">
          {tCommon(`projectCategories.${project.category}`)} —{" "}
          {project.clientName}
        </span>
        <h2 className="text-20 md:text-24 text-text-primary font-semibold">
          {project.title}
        </h2>
        <p className="text-14 text-text-secondary">{project.summary}</p>
        <span className="text-13 text-text-primary mt-8 inline-flex items-center gap-8 font-medium">
          {tCommon("actions.viewProject")}
          <ArrowRight className="size-14 rtl:-scale-x-100" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

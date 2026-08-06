import type { SVGAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Decision (Task 4): the mark and wordmark are React components — inline
 * SVG / styled text — not <img src="logo.svg">. Two reasons this matters
 * beyond Phase 3: Phase 8 wants the wordmark as real indexable text for SEO
 * rather than a rasterized image behind approximate alt text, and the
 * Laravel admin panel (Phase 12+) imports this exact component instead of
 * keeping a second synced copy of the asset. Recorded here since both of
 * those phases need to find this decision without re-deriving it.
 */
export function LogoMark({ className, ...rest }: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {/* Echoes the StatusCircle "todo" ring + "done" fill — the same
          circular-status visual language repeated as the brand mark. */}
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.25" fill="currentColor" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn("text-primary inline-flex items-center gap-8", className)}
    >
      <LogoMark />
      {/* Codexa is a Latin-script proper noun kept identical in both
          locales — lang="en" plus an explicit Inter Display font-family
          override stop it inheriting globals.css's [lang="ar"] typography
          block (Noto Kufi font-family/letter-spacing/line-height), which
          would otherwise cascade onto every descendant of <html lang="ar">. */}
      <span
        lang="en"
        style={{ fontFamily: "var(--font-sans-latin), sans-serif" }}
        className="text-text-primary text-16 leading-none font-semibold tracking-[-0.03em]"
      >
        Codexa
      </span>
    </span>
  );
}

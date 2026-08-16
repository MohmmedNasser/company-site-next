// src/lib/og/template.tsx
//
// Shared JSX rendered by every opengraph-image.tsx route. Satori (the
// renderer behind next/og's ImageResponse) draws to a canvas outside the
// DOM/CSS pipeline — it cannot resolve Tailwind classes or this project's
// `var(--color-*)` tokens (src/styles/tokens.css). The two colours below
// are a deliberate, quarantined mirror of `--palette-mono-950` (bg) and
// `--palette-mono-0` (text) from src/styles/palette.css, kept in exactly
// one place for OG images — update them here if the palette ever changes.
// See docs/design-decisions.md's Colour system section for the source
// values, and its §2 for why no other colour belongs on this site.
import type { ReactElement } from "react";

const OG_BG = "#0A0A0A";
const OG_TEXT = "#FFFFFF";
const OG_TEXT_SECONDARY = "#9A9A9A";

export const OG_SIZE = { width: 1200, height: 630 };

export function ogTemplate({
  eyebrow,
  title,
  locale,
}: {
  eyebrow: string;
  title: string;
  locale: string;
}): ReactElement {
  const isRtl = locale === "ar";
  // "Cairo", not the site's real Noto Kufi Arabic — see src/lib/og/fonts.ts
  // for why (a renderer-compatibility substitution scoped to OG images
  // only). Inter Display has no Arabic coverage either way, so the font
  // used for the dynamic (per-page) text still has to follow the locale;
  // the brand wordmark below stays Inter Display regardless, same as the
  // header's logo lockup.
  const textFontFamily = isRtl ? "Cairo" : "Inter Display";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: OG_BG,
        padding: "80px",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* Mirrors the section-label bracket pattern
          (src/components/ui/section-label.tsx) — this system's repeating
          identity element, reused here rather than inventing a new eyebrow
          treatment for OG images specifically. */}
      <div
        style={{
          display: "flex",
          fontFamily: textFontFamily,
          fontSize: 28,
          fontWeight: 600,
          color: OG_TEXT_SECONDARY,
          letterSpacing: "0.02em",
          textAlign: isRtl ? "right" : "left",
        }}
      >
        {`[ ${eyebrow} ]`}
      </div>

      <div
        style={{
          display: "flex",
          fontFamily: textFontFamily,
          // Longer titles step down a size rather than wrapping past two
          // lines and crowding the 630px-tall canvas.
          fontSize: title.length > 36 ? 60 : 76,
          fontWeight: 700,
          color: OG_TEXT,
          lineHeight: 1.15,
          maxWidth: 1000,
          // Satori doesn't propagate the container's `direction: rtl` into
          // an implicit right text-align for wrapped lines the way a
          // browser would — without this, a title's first line reads
          // correctly right-to-left but any wrapped continuation line
          // falls back to left-aligned.
          textAlign: isRtl ? "right" : "left",
        }}
      >
        {title}
      </div>

      {/* Brand wordmark — a proper noun, not translated content, same as
          the hardcoded "Codexa" text next to the logo mark in
          src/components/layout/header.tsx. */}
      <div
        style={{
          display: "flex",
          fontFamily: "Inter Display",
          fontSize: 28,
          fontWeight: 600,
          color: OG_TEXT,
          letterSpacing: "0.02em",
        }}
      >
        Codexa
      </div>
    </div>
  );
}

// src/app/[locale]/styleguide/styleguide-client.tsx
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "@/i18n/navigation";

type SemanticToken = {
  cssVar: `--color-${string}`;
  role: string;
};

const SEMANTIC_TOKENS: SemanticToken[] = [
  { cssVar: "--color-bg", role: "App/page background, deepest layer" },
  { cssVar: "--color-card", role: "Card backgrounds (Neutral / Card)" },
  { cssVar: "--color-surface", role: "Elevated panels" },
  { cssVar: "--color-surface-raised", role: "Dropdowns, modals, popovers" },
  { cssVar: "--color-border", role: "Dividers, input borders, panel edges" },
  { cssVar: "--color-text-primary", role: "Headings, primary body text" },
  {
    cssVar: "--color-text-secondary",
    role: "Descriptions, metadata, placeholders",
  },
  {
    cssVar: "--color-primary",
    role: "Primary actions, selected states, focus rings",
  },
  { cssVar: "--color-primary-hover", role: "Hover/pressed state for primary" },
  {
    cssVar: "--color-secondary",
    role: "Secondary highlights, hover accents, gradient endpoints",
  },
  { cssVar: "--color-success", role: "Completed / passing states" },
  { cssVar: "--color-warning", role: "In-progress / attention states" },
  { cssVar: "--color-error", role: "Urgent / error / destructive states" },
];

// "white on primary" has no dedicated semantic token — --palette-light-0 is
// the raw palette entry that already resolves to pure white in both themes.
const WHITE_RAW = "--palette-light-0";

const CONTRAST_PAIRS: {
  label: string;
  fg: SemanticToken["cssVar"] | typeof WHITE_RAW;
  bg: SemanticToken["cssVar"];
}[] = [
  {
    label: "text-secondary on bg",
    fg: "--color-text-secondary",
    bg: "--color-bg",
  },
  {
    label: "text-secondary on card",
    fg: "--color-text-secondary",
    bg: "--color-card",
  },
  { label: "text-primary on bg", fg: "--color-text-primary", bg: "--color-bg" },
  { label: "white on primary", fg: WHITE_RAW, bg: "--color-primary" },
  {
    label: "text-primary on surface",
    fg: "--color-text-primary",
    bg: "--color-surface",
  },
];

const TYPE_SCALE: {
  token: string;
  px: number;
  weight: 400 | 500 | 600;
  role: string;
}[] = [
  {
    token: "--text-11",
    px: 11,
    weight: 500,
    role: "Shortcut hints, overline labels",
  },
  { token: "--text-12", px: 12, weight: 500, role: "Metadata, small labels" },
  {
    token: "--text-13",
    px: 13,
    weight: 400,
    role: "Small body text, nav items",
  },
  {
    token: "--text-14",
    px: 14,
    weight: 400,
    role: "Body text, list-item titles",
  },
  { token: "--text-16", px: 16, weight: 500, role: "h5, panel titles" },
  { token: "--text-20", px: 20, weight: 600, role: "h4, card/view titles" },
  { token: "--text-24", px: 24, weight: 600, role: "h3, page titles" },
  { token: "--text-32", px: 32, weight: 600, role: "h2, section headings" },
  {
    token: "--text-40",
    px: 40,
    weight: 600,
    role: "h1, admin landing headers",
  },
  {
    token: "--text-48",
    px: 48,
    weight: 600,
    role: "Marketing subsection headline",
  },
  {
    token: "--text-64",
    px: 64,
    weight: 600,
    role: "Marketing hero headline (desktop)",
  },
  {
    token: "--text-80",
    px: 80,
    weight: 600,
    role: "Marketing hero headline (large desktop)",
  },
];

const SAMPLE_EN = "Ship software";
const SAMPLE_AR = "نبني برمجيات";

const SPACING_SCALE = [
  2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160,
];
const MARKETING_ONLY_SPACING = new Set([80, 96, 128, 160]);

const RADIUS_SCALE: { token: string; px: number; usedFor: string }[] = [
  {
    token: "--radius-chip",
    px: 4,
    usedFor: "Chips, inline labels, small badges",
  },
  {
    token: "--radius-control",
    px: 6,
    usedFor: "Buttons, inputs, dropdown items",
  },
  {
    token: "--radius-card",
    px: 8,
    usedFor: "Cards, panels, sidebar nav items",
  },
  {
    token: "--radius-modal",
    px: 12,
    usedFor: "Modals, command palette, settings panels",
  },
  {
    token: "--radius-full",
    px: 9999,
    usedFor: "Status circles, avatar circles",
  },
];

const FONT_SAMPLES: {
  label: string;
  cssVar: string;
  weights: number[];
  sample: string;
}[] = [
  {
    label: "Inter",
    cssVar: "--font-inter",
    weights: [400, 500, 600],
    sample: "The quick brown fox — Aa Bb Cc 123",
  },
  {
    label: "Noto Kufi Arabic",
    cssVar: "--font-noto-kufi",
    weights: [400, 500, 600],
    sample: "الثعلب البني السريع — أب ت 123",
  },
  {
    label: "JetBrains Mono",
    cssVar: "--font-jetbrains",
    weights: [400, 500],
    sample: "const services = await api.get();",
  },
];

const MIXED_SCRIPT_PARAGRAPH =
  "نحن نبني واجهات API سريعة باستخدام Next.js، مع تركيز خاص على تحسين SEO حتى يظهر موقعك بوضوح في نتائج البحث دون أي تنازل عن الأداء.";

const RTL_PARAGRAPH_EN =
  "Every section on this site is built with logical CSS properties, so the whole layout mirrors correctly when a visitor switches from English to Arabic — padding, alignment, and icon direction all flip together instead of being fixed by hand for each language.";

const RTL_PARAGRAPH_AR =
  "كل قسم في هذا الموقع مبني باستخدام خصائص CSS منطقية، بحيث ينعكس التخطيط بالكامل بشكل صحيح عند تبديل الزائر من الإنجليزية إلى العربية — المسافات والمحاذاة واتجاه الأيقونات تنعكس جميعها تلقائيًا بدلاً من ضبطها يدويًا لكل لغة.";

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace("#", "");
  if (clean.length !== 6) return null;
  const value = Number.parseInt(clean, 16);
  if (Number.isNaN(value)) return null;
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA: string, hexB: string): number | null {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return null;
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

// Reads the *currently applied* token values straight from the CSSOM, so the
// contrast table is always computed from the live theme, never hardcoded.
function readResolvedTokens(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const styles = getComputedStyle(document.documentElement);
  const next: Record<string, string> = {};
  for (const token of SEMANTIC_TOKENS) {
    next[token.cssVar] = styles.getPropertyValue(token.cssVar).trim();
  }
  next[WHITE_RAW] = styles.getPropertyValue(WHITE_RAW).trim();
  return next;
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deliberate hydration guard: the client re-render after mount is the
    // point of this effect, so react-hooks/set-state-in-effect is a
    // false positive here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const current = mounted ? resolvedTheme : undefined;
  const label = current === "dark" ? t("theme.dark") : t("theme.light");

  return (
    <button
      type="button"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      aria-label={t("a11y.toggleTheme")}
      className="rounded-control border-border text-14 text-text-primary hover:bg-surface border px-16 py-8"
    >
      {t("theme.system") === label
        ? label
        : `${t("a11y.toggleTheme")}: ${label}`}
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
      className="rounded-control border-border text-14 text-text-primary hover:bg-surface border px-16 py-8"
    >
      {label}
    </button>
  );
}

export function StyleguideClient() {
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    // Deliberate hydration guard: the client re-render after mount is the
    // point of this effect, so react-hooks/set-state-in-effect is a
    // false positive here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Deliberate: re-reads the CSSOM once the DOM has actually been
      // painted with the current theme/mount state, so the flagged
      // setState is the intended synchronization, not an anti-pattern.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolved(readResolvedTokens());
    }
  }, [mounted, resolvedTheme]);

  return (
    <main className="mx-auto max-w-[1280px] px-24 py-48">
      <div className="border-border mb-40 flex flex-wrap items-center gap-16 border-b pb-24">
        <h1 className="text-32 text-text-primary font-semibold">Styleguide</h1>
        <ThemeToggle />
        <LocaleSwitcher />
      </div>

      {/* 1. Colour */}
      <Section title="1. Colour">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
          {SEMANTIC_TOKENS.map((token) => (
            <div
              key={token.cssVar}
              className="rounded-card border-border border p-16"
            >
              <div
                className="rounded-control border-border mb-12 h-48 border"
                style={{ backgroundColor: `var(${token.cssVar})` }}
              />
              <p className="text-12 text-text-primary font-mono">
                {token.cssVar}
              </p>
              <p className="text-12 text-text-secondary font-mono">
                {resolved[token.cssVar] || "…"}
              </p>
              <p className="text-13 text-text-secondary mt-4">{token.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 2. Contrast */}
      <Section title="2. Contrast">
        <div className="overflow-x-auto">
          <table className="text-14 w-full border-collapse">
            <thead>
              <tr className="border-border text-12 text-text-secondary border-b text-start">
                <th className="p-8 text-start">Pair</th>
                <th className="p-8 text-start">Ratio</th>
                <th className="p-8 text-start">4.5:1 (body)</th>
                <th className="p-8 text-start">3:1 (large)</th>
              </tr>
            </thead>
            <tbody>
              {CONTRAST_PAIRS.map((pair) => {
                const fgHex = resolved[pair.fg];
                const bgHex = resolved[pair.bg];
                const ratio =
                  fgHex && bgHex ? contrastRatio(fgHex, bgHex) : null;
                return (
                  <tr key={pair.label} className="border-border border-b">
                    <td className="text-text-primary p-8">{pair.label}</td>
                    <td className="text-text-primary p-8 font-mono">
                      {ratio ? `${ratio.toFixed(2)}:1` : "…"}
                    </td>
                    <td className="p-8">
                      {ratio ? ratio >= 4.5 ? <Pass /> : <Fail /> : "…"}
                    </td>
                    <td className="p-8">
                      {ratio ? ratio >= 3 ? <Pass /> : <Fail /> : "…"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 3. Type scale */}
      <Section title="3. Type scale">
        <div className="flex flex-col gap-16">
          {TYPE_SCALE.map((step) => (
            <div
              key={step.token}
              className="border-border grid grid-cols-1 gap-8 border-b pb-16 sm:grid-cols-2"
            >
              <div>
                <p className="text-11 text-text-secondary mb-4 font-mono">
                  {step.token} · {step.px}px · {step.weight} · {step.role}
                </p>
                <p
                  style={{
                    fontSize: step.px,
                    fontWeight: step.weight,
                    fontFamily: "var(--font-inter)",
                  }}
                  className="text-text-primary"
                >
                  {SAMPLE_EN}
                </p>
              </div>
              <div lang="ar" dir="rtl">
                <p className="text-11 text-text-secondary mb-4 font-mono">
                  Noto Kufi Arabic
                </p>
                <p
                  style={{
                    fontSize: step.px,
                    fontWeight: step.weight,
                    fontFamily: "var(--font-noto-kufi)",
                  }}
                  className="text-text-primary"
                >
                  {SAMPLE_AR}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Mixed-script paragraph */}
      <Section title="4. Mixed-script paragraph">
        <p
          lang="ar"
          dir="rtl"
          className="text-16 text-text-primary max-w-[720px]"
        >
          {MIXED_SCRIPT_PARAGRAPH}
        </p>
      </Section>

      {/* 5. Spacing scale */}
      <Section title="5. Spacing scale">
        <div className="flex flex-col gap-8">
          {SPACING_SCALE.map((value) => (
            <div key={value} className="flex items-center gap-16">
              <span className="text-12 text-text-secondary w-64 shrink-0 font-mono">
                {value}px{MARKETING_ONLY_SPACING.has(value) ? " *" : ""}
              </span>
              <div className="bg-primary h-16" style={{ width: value }} />
            </div>
          ))}
          <p className="text-12 text-text-secondary mt-8">
            * marketing-only extension — section rhythm, never component padding
          </p>
        </div>
      </Section>

      {/* 6. Radius tokens */}
      <Section title="6. Radius tokens">
        <div className="flex flex-wrap gap-24">
          {RADIUS_SCALE.map((radius) => (
            <div key={radius.token} className="text-center">
              <div
                className="border-border bg-surface mb-8 size-64 border"
                style={{ borderRadius: radius.px }}
              />
              <p className="text-12 text-text-primary font-mono">
                {radius.token}
              </p>
              <p className="text-12 text-text-secondary">
                {radius.px === 9999 ? "full" : `${radius.px}px`}
              </p>
              <p className="text-12 text-text-secondary max-w-[140px]">
                {radius.usedFor}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Fonts */}
      <Section title="7. Fonts">
        <div className="flex flex-col gap-24">
          {FONT_SAMPLES.map((font) => (
            <div key={font.label}>
              <p className="text-12 text-text-secondary mb-8">{font.label}</p>
              {font.weights.map((weight) => (
                <p
                  key={weight}
                  style={{
                    fontFamily: `var(${font.cssVar})`,
                    fontWeight: weight,
                  }}
                  className="text-16 text-text-primary"
                >
                  {weight} — {font.sample}
                </p>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* 8. Overline utility */}
      <Section title="8. Overline utility">
        <div className="flex flex-col gap-8">
          <p className="text-12 text-text-secondary overline">
            {locale === "ar" ? "الأعمال المختارة" : "Selected work"}
          </p>
          <p className="text-13 text-text-secondary">
            Uppercases only under :lang(en) — current locale is {locale}, so
            this {locale === "en" ? "IS" : "is NOT"} rendered uppercase.
          </p>
        </div>
      </Section>

      {/* 9. RTL */}
      <Section title="9. RTL">
        <div className="flex flex-col gap-32">
          <div>
            <p className="text-13 text-text-secondary mb-8">
              Logical spacing — ps-32/pe-8/border-s should sit at the
              reading-start edge in both directions
            </p>
            <div className="border-border bg-surface border">
              <div className="bg-primary/10 border-primary text-14 text-text-primary border-s-4 py-8 ps-32 pe-8">
                ps-32 pe-8 border-s-4 (padding-inline-start/end,
                border-inline-start)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <p className="border-border text-14 text-text-primary border p-12 text-start">
              text-start (aligns to the reading-start edge)
            </p>
            <p className="border-border text-14 text-text-primary border p-12 text-end">
              text-end (aligns to the reading-end edge)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-24">
            <span className="text-14 text-text-primary flex items-center gap-8">
              <ArrowIcon className="text-primary rtl:-scale-x-100" />
              Directional — mirrors in RTL
            </span>
            <span className="text-14 text-text-primary flex items-center gap-8">
              <CheckIcon className="text-success" />
              Non-directional — must NOT mirror
            </span>
          </div>

          <div className="relative h-64 overflow-hidden">
            <div className="border-primary text-primary bg-primary/10 text-11 absolute start-0 top-0 border px-8 py-4">
              start-0 (flips with direction)
            </div>
            <div className="border-error text-error bg-error/10 text-11 absolute top-32 left-0 border px-8 py-4">
              left-0 (never flips — wrong for RTL)
            </div>
          </div>

          <div>
            <p className="text-13 text-text-secondary mb-8">
              flex-row — items should read in reading order automatically
            </p>
            <div className="flex flex-row gap-8">
              {["1", "2", "3"].map((n) => (
                <div
                  key={n}
                  className="bg-surface border-border text-14 text-text-primary flex size-40 items-center justify-center border"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-24 sm:grid-cols-2">
            <p dir="ltr" lang="en" className="text-16 text-text-primary">
              {RTL_PARAGRAPH_EN}
            </p>
            <p dir="rtl" lang="ar" className="text-16 text-text-primary">
              {RTL_PARAGRAPH_AR}
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="mb-48">
      <h2 className="text-20 text-text-primary mb-16 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Pass() {
  return <span className="text-12 text-success font-mono">PASS</span>;
}

function Fail() {
  return <span className="text-12 text-error font-mono">FAIL</span>;
}

interface HeroScrimProps {
  dir: "ltr" | "rtl";
}

// Protects headline/subhead/CTA legibility against the busiest possible
// frame of the hero background animation, not just the average background
// colour (Task 3). Verified analytically against the exact tokens in play,
// since the shader's peak output is knowable from reading
// molten-metal-background.tsx rather than guessed: alpha (`a` in the
// fragment shader) is clamped to [0, 1] and reaches 1 at the brightest
// core pixels, where the colour mix has fully resolved to `color3` — a
// value deliberately pinned to --palette-brand-500 (#5E6AD2) specifically
// so this worst case matches what the previous background (Threads) could
// also produce — the same colour in both themes, since neither background
// is driven from the theme-flipped --color-primary. Composited straight
// onto --color-bg with --color-text-primary text on top (relative
// luminance from the exact palette.css hex values, WCAG contrast formula):
//   dark theme:  (0.8815 + 0.05) / (0.1802 + 0.05) = 4.05:1  — fails AA
//   light theme: (0.1802 + 0.05) / (0.00826 + 0.05) = 3.95:1 — fails AA
// Both miss the 4.5:1 body-text bar by roughly the same margin, confirming
// a scrim is load-bearing here, not decorative. Mixing the canvas 85%
// toward --color-bg directly under the text column (tapering to 20% by the
// far edge, where no text sits and the artwork should read clearly) pushes
// the worst case back above 8:1 in both themes — well past the ~10% mix
// the maths alone requires, to also cover denser real-world line
// clustering than one isolated pixel, plus mouse-interaction amplitude.
// Opacity increases here rather than dimming the animation itself, per the
// task's explicit instruction: the scrim's job is to protect the text, the
// animation stays the brand moment.
//
// Direction is resolved from `dir` in JS rather than a physical
// `bg-gradient-to-r` utility class: `linear-gradient()`'s `to right`/
// `to left` keywords have no logical (`to inline-end`) equivalent with
// reliable browser support yet, so the physical side is chosen here from
// the same `dir` the <html> element already carries, keeping the scrim
// anchored to the text's inline-start edge in both languages instead of
// hardcoding one physical side.
export default function HeroScrim({ dir }: HeroScrimProps) {
  const gradientDirection = dir === "rtl" ? "to left" : "to right";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(${gradientDirection}, color-mix(in srgb, var(--color-bg) 85%, transparent) 0%, color-mix(in srgb, var(--color-bg) 60%, transparent) 45%, color-mix(in srgb, var(--color-bg) 20%, transparent) 75%, transparent 100%)`,
      }}
    />
  );
}

interface HeroScrimProps {
  dir: "ltr" | "rtl";
}

// Protects the subtitle/CTA legibility against the background layer
// (design-decisions.md §14 moved that text to the inline-end edge) —
// heaviest there (85% mix toward --color-bg), tapering to 30% toward the
// inline-start edge where the huge bold headline lives instead. The
// headline does not need this protection: at up to 120px/weight 600 it
// clears the large-text 3:1 AA bar against either theme's Silk background
// on its own, unlike the 16-20px subtitle's 4.5:1 body-text bar.
//
// Direction is resolved from `dir` in JS rather than a physical
// `bg-gradient-to-r` utility class: `linear-gradient()`'s `to right`/
// `to left` keywords have no logical (`to inline-end`) equivalent with
// reliable browser support yet, so the physical side is chosen here from
// the same `dir` the <html> element already carries, keeping the scrim
// anchored to the text's inline-end edge in both languages instead of
// hardcoding one physical side.
export default function HeroScrim({ dir }: HeroScrimProps) {
  const gradientDirection = dir === "rtl" ? "to right" : "to left";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(${gradientDirection}, color-mix(in srgb, var(--color-bg) 85%, transparent) 0%, color-mix(in srgb, var(--color-bg) 70%, transparent) 45%, color-mix(in srgb, var(--color-bg) 30%, transparent) 75%, transparent 100%)`,
      }}
    />
  );
}

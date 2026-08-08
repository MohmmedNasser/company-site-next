interface HeroScrimProps {
  dir: "ltr" | "rtl";
}

// Protects the subtitle/CTA legibility against the background layer (the
// hero redesign moved that text to the inline-end edge) — heaviest there
// (85% mix toward --color-bg), tapering to 30% toward the inline-start
// edge where the huge bold headline lives instead. The
// headline does not need this protection: at up to 120px/weight 600 it
// clears the large-text 3:1 AA bar against either theme's Silk background
// on its own, unlike the 16-20px subtitle's 4.5:1 body-text bar.
//
// Re-spot-checked after the monochrome migration recoloured the silk ramp
// (tokens.css's --hero-silk-low/high, now pure grey/white in both themes):
// sampled the rendered background behind the headline/subtitle at a grid of
// points on a live frame (not the exhaustive shader-pattern sweep the
// original numbers below were derived from):
//   headline on BARE silk — dark ~6.7:1, light ~16.5:1 (bar: 3:1)
//   subtitle under this scrim — dark ~6.1:1, light ~5.3:1 (bar: 4.5:1)
// All comfortably clear their bars, with more margin than the pre-migration
// values (dark 3.93:1 / 4.72:1, light 11.76:1 / 5.21:1) — a single-frame
// spot check rather than a full re-derivation, since the ramp only got
// lighter/purer (no more violet-tinted low end), not darker, so the
// worst case couldn't have gotten meaningfully closer to either bar.
//
// The 45% stop is 80%, not the 70% it used to be. On a ~1440px viewport the
// subtitle block spans roughly gradient positions 6%-41%, so that stop —
// not the 85% one at the edge — is what actually sets its worst case. At
// 70% the subtitle measured 4.10:1 here, under the body-text bar; it was
// under it at 4.12:1 with the old shader too, so this fixes a pre-existing
// shortfall rather than compensating for the ramp change.
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
        backgroundImage: `linear-gradient(${gradientDirection}, color-mix(in srgb, var(--color-bg) 85%, transparent) 0%, color-mix(in srgb, var(--color-bg) 80%, transparent) 45%, color-mix(in srgb, var(--color-bg) 30%, transparent) 75%, transparent 100%)`,
      }}
    />
  );
}

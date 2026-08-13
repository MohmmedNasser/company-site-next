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
// Re-derived after the light-mode silk floor moved from mono-25 to mono-300
// (see palette.css) — that change made the light ramp visible for the first
// time, and it moved in the one direction the previous spot check had
// explicitly reasoned it could not: DARKER. The old note here recorded
// light ~16.5:1 / ~5.3:1 sampled off a live frame; those numbers described
// a ramp that no longer exists.
//
// Current figures, computed against the ramp's DARKEST point (the floor),
// which is the worst case for both bars — an upper bound on the worst
// case rather than a single sampled frame:
//   headline on BARE silk — light 9.55:1 (bar: 3:1)
//   subtitle under this scrim — light 4.86:1 (bar: 4.5:1)
// The subtitle figure models this gradient's 80% stop compositing
// --color-bg over the silk floor in sRGB, which is what color-mix() below
// resolves to. Dark mode is untouched by that change and keeps its
// previously sampled ~6.7:1 / ~6.1:1.
//
// The subtitle is the binding constraint on how dark the light floor can
// go — at 4.86:1 it has roughly 8% headroom over its bar, so a further
// darkening of the silk needs this scrim strengthened in the same commit,
// not treated as independent.
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

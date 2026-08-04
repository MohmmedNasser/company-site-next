// Converts a `#rrggbb` (or shorthand `#rgb`) hex colour string into an
// [r, g, b] tuple normalized to 0-1 — the range ogl's `Color` and shader
// uniforms expect, not the 0-255 range CSS/DOM APIs return. Kept as its own
// utility (not inlined) so any future WebGL background reads a palette
// token the same way, per Task 1's "no inline math" requirement.
export function hexToNormalizedRgb(hex: string): [number, number, number] {
  const stripped = hex.trim().replace(/^#/, "");
  const full =
    stripped.length === 3
      ? stripped
          .split("")
          .map((c) => c + c)
          .join("")
      : stripped;

  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;

  return [r, g, b];
}

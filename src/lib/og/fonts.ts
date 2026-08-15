// src/lib/og/fonts.ts
//
// Font loading for next/og's ImageResponse (OG images only — nothing here
// runs in the browser, and nothing here changes the real on-site fonts).
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { decompress } from "wawoff2";

const INTER_DIR = path.join(process.cwd(), "src/fonts/Inter Display");

// next/og's bundled renderer (Satori) can only parse TTF/OTF/WOFF font
// signatures — not WOFF2, which is the only format the site's Inter
// Display files ship in (see src/app/fonts.ts). Confirmed by reading the
// bundled parser directly: node_modules/next/dist/compiled/@vercel/og/
// index.node.js throws "Unsupported OpenType signature" on a WOFF2
// buffer's "wOF2" tag. Decompressed once, in-process, from the exact
// brand font file already in the repo — no network call needed for this
// one.
async function loadLocalTtf(filename: string): Promise<ArrayBuffer> {
  const woff2 = await readFile(path.join(INTER_DIR, filename));
  const ttf = await decompress(woff2);
  return ttf.buffer.slice(
    ttf.byteOffset,
    ttf.byteOffset + ttf.byteLength,
  ) as ArrayBuffer;
}

// Fetched once from Google Fonts' CDN, the same way next/font/google
// self-hosts fonts at build time elsewhere in this project — except here
// the raw bytes are needed directly, so this fetches the CSS and follows
// its @font-face src rather than going through next/font. Requesting the
// CSS without a modern-browser User-Agent returns a `.ttf` source instead
// of `.woff2`, avoiding the same WOFF2 problem loadLocalTtf works around.
async function loadGoogleTtf(
  family: string,
  weight: number,
): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const css = await fetch(cssUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  }).then((res) => res.text());

  const match = css.match(/src: url\(([^)]+)\) format\('truetype'\)/);
  if (!match) {
    throw new Error(`OG font fetch: no truetype source found for ${family}`);
  }

  return fetch(match[1]).then((res) => res.arrayBuffer());
}

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 600 | 700;
  style: "normal";
}

let cachedFonts: Promise<OgFont[]> | null = null;

/**
 * Loaded once per server process and reused by every OG image route.
 *
 * The Arabic face here is "Cairo", not the site's real Noto Kufi Arabic
 * (src/app/fonts.ts) — a deliberate, OG-image-only substitution, not a
 * design-system change. `pnpm build` failed prerendering ANY Arabic OG
 * image using Noto Kufi Arabic (or, tested as a second candidate, Noto
 * Sans Arabic) with "lookupType: 5 - substFormat: 3 is not yet
 * supported": both fonts' GSUB contextual-substitution tables use an
 * OpenType subformat next/og's bundled parser (Satori, via opentype.js)
 * doesn't implement — confirmed unconditional (every real Arabic string
 * already used on the site fails, not just specific ones) and confirmed
 * NOT fixable by requesting a Google Fonts `text=` subset, which still
 * carries the same GSUB table. Cairo was verified against every Arabic
 * eyebrow/title string the OG routes actually render (see git history for
 * the throwaway repro script) and renders cleanly at both weights — it's
 * the closest-available geometric Arabic sans that this renderer can
 * parse. On-site typography is completely unaffected: this file is only
 * ever imported by src/app/**\/opengraph-image.tsx routes.
 */
export function loadOgFonts(): Promise<OgFont[]> {
  cachedFonts ??= Promise.all([
    loadLocalTtf("InterDisplay-SemiBold.woff2"),
    loadLocalTtf("InterDisplay-Bold.woff2"),
    loadGoogleTtf("Cairo", 600),
    loadGoogleTtf("Cairo", 700),
  ]).then(([interSemiBold, interBold, cairoSemiBold, cairoBold]): OgFont[] => [
    {
      name: "Inter Display",
      data: interSemiBold,
      weight: 600,
      style: "normal",
    },
    { name: "Inter Display", data: interBold, weight: 700, style: "normal" },
    { name: "Cairo", data: cairoSemiBold, weight: 600, style: "normal" },
    { name: "Cairo", data: cairoBold, weight: 700, style: "normal" },
  ]);
  return cachedFonts;
}

// wawoff2 ships no types of its own — this covers the one export
// src/lib/og/fonts.ts actually uses (decompressing a local WOFF2 buffer to
// TTF/sfnt bytes for next/og's ImageResponse, which can't parse WOFF2
// directly).
declare module "wawoff2" {
  export function decompress(input: Uint8Array | Buffer): Promise<Uint8Array>;
  export function compress(input: Uint8Array | Buffer): Promise<Uint8Array>;
}

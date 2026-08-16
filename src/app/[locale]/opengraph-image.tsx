// src/app/[locale]/opengraph-image.tsx
//
// Static OG image for the [locale] segment — covers the homepage
// (src/app/[locale]/page.tsx) and every non-dynamic route (about, services
// list, portfolio list, blog list, contact) that doesn't have its own
// opengraph-image.tsx. The three dynamic detail routes each override this
// with their own generated image: services/[slug], portfolio/[slug],
// blog/[slug].
//
// This can't be a plain opengraph-image.png in this folder: a static file
// under a dynamic segment ([locale]) has no way to declare which locale
// values to prerender, and `pnpm run build` fails with
// "Invariant: failed to find source route ... for prerender ...". A route
// file works because it can export generateStaticParams like page.tsx does,
// so the source PNG lives outside app/ and is served as raw bytes here.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { routing } from "@/i18n/routing";

export const alt = "Codexa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image() {
  const file = await readFile(
    join(process.cwd(), "src/assets/og/opengraph-image-source.png"),
  );
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "image/png" },
  });
}

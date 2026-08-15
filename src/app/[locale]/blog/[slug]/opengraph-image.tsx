// src/app/[locale]/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { POSTS_PER_PAGE, content, pick } from "@/lib/content";
import type { Post } from "@/lib/content";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE, ogTemplate } from "@/lib/og/template";

export const runtime = "nodejs";
export const alt = "Codexa";
export const size = OG_SIZE;
export const contentType = "image/png";

// Same pagination-flattening helper as blog/[slug]/page.tsx — getPosts()
// only ever returns one page at a time, and this needs every slug across
// all of them to prerender an image per post.
async function getAllPosts(): Promise<Post[]> {
  const postCount = await content.getPostCount();
  const pageCount = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, index) =>
      content.getPosts(index + 1),
    ),
  );
  return pages.flat();
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [post, tNav, fonts] = await Promise.all([
    content.getPost(slug),
    getTranslations({ locale, namespace: "common.nav" }),
    loadOgFonts(),
  ]);

  return new ImageResponse(
    ogTemplate({
      eyebrow: tNav("blog"),
      // A slug outside generateStaticParams' list falls through to the
      // brand name rather than throwing — the page component itself is
      // what calls notFound() for that case (see page.tsx in this folder).
      title: post ? pick(post.title, locale) : "Codexa",
      locale,
    }),
    { ...OG_SIZE, fonts },
  );
}

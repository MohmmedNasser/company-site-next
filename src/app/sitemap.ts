// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { POSTS_PER_PAGE, content } from "@/lib/content";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// routing.localePrefix is "always" (src/i18n/routing.ts) — "/" only ever
// redirects to the default locale, it never serves content itself, so
// every entry below is locale-prefixed and there is no bare-"/" entry.
function url(locale: string, path: string): string {
  return `${SITE_URL}/${locale}${path}`;
}

function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, url(locale, path)]),
  );
}

function entriesForPath(
  path: string,
  lastModified?: Date,
): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: url(locale, path),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages: languageAlternates(path) },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, postCount] = await Promise.all([
    content.getServices(),
    content.getProjects(),
    content.getPostCount(),
  ]);

  const totalBlogPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));
  const postPages = await Promise.all(
    Array.from({ length: totalBlogPages }, (_, index) =>
      content.getPosts(index + 1),
    ),
  );
  const posts = postPages.flat();

  const entries: MetadataRoute.Sitemap = [
    // Static routes. Services/projects have no updatedAt field in the
    // content layer (src/lib/content/types.ts), so lastModified is left
    // out where it isn't actually derivable rather than guessed.
    ...entriesForPath(""),
    ...entriesForPath("/about"),
    ...entriesForPath("/services"),
    ...entriesForPath("/portfolio"),
    ...entriesForPath("/blog"),
    ...entriesForPath("/contact"),
  ];

  // /blog/page/2..N — real canonical routes, not a query string (see
  // docs/design-decisions.md's "Pagination lives in the path" section) —
  // page 1 is already covered by the "/blog" entry above.
  for (let page = 2; page <= totalBlogPages; page += 1) {
    entries.push(...entriesForPath(`/blog/page/${page}`));
  }

  for (const service of services) {
    entries.push(...entriesForPath(`/services/${service.slug}`));
  }

  for (const project of projects) {
    entries.push(...entriesForPath(`/portfolio/${project.slug}`));
  }

  for (const post of posts) {
    entries.push(
      ...entriesForPath(`/blog/${post.slug}`, new Date(post.publishedAt)),
    );
  }

  return entries;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { POSTS_PER_PAGE, content, pick } from "@/lib/content";
import { localeAlternates } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import BlogIndex from "@/components/blog/blog-index";

type RouteParams = { locale: string; page: string };

/** `null` for anything that isn't an integer of 2 or more. */
function parsePage(raw: string): number | null {
  // Number.parseInt would accept "2abc"; this route's segment has to be
  // digits and nothing else, or /blog/page/2abc would render page 2 at a
  // second URL.
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  // Page 1 is /blog. Serving it here too would duplicate the index at two
  // addresses, so /blog/page/1 is a 404 rather than an alias.
  return page >= 2 ? page : null;
}

/**
 * Pages 2..N only. Page 1 is the /blog route, and Next.js calls this once
 * per parent param, so the locale is already covered by the [locale]
 * layout's own generateStaticParams.
 */
export async function generateStaticParams() {
  const postCount = await content.getPostCount();
  const totalPages = Math.ceil(postCount / POSTS_PER_PAGE);

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, page: rawPage } = await params;
  const page = parsePage(rawPage);

  if (page === null) return {};

  const [settings, t] = await Promise.all([
    content.getSettings(),
    getTranslations({ locale, namespace: "blog.pagination" }),
  ]);
  const intro = settings.pages.blog.intro;
  const postCount = await content.getPostCount();
  const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));

  return {
    // The page number is in the title so a search result for page 3 is
    // distinguishable from the index — two results with the same title and
    // different content is the thing to avoid here.
    title: `${pick(intro.heading, locale)} — ${t("positionLabel", {
      current: page,
      total: totalPages,
    })}`,
    description: pick(intro.description, locale),
    alternates: localeAlternates(`/blog/page/${page}`, locale),
  };
}

export default async function BlogPaginatedPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, page: rawPage } = await params;
  setRequestLocale(locale);

  const page = parsePage(rawPage);
  if (page === null) {
    notFound();
  }

  const [tNav, tPagination] = await Promise.all([
    getTranslations({ locale, namespace: "common.nav" }),
    getTranslations({ locale, namespace: "blog.pagination" }),
  ]);

  // BlogIndex 404s on a page number past the end, so no upper-bound check
  // is needed here.
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tNav("home"), path: "" },
            { name: tNav("blog"), path: "/blog" },
            {
              name: tPagination("pageLabel", { number: page }),
              path: `/blog/page/${page}`,
            },
          ],
          locale,
        )}
      />
      <BlogIndex locale={locale} page={page} />
    </>
  );
}

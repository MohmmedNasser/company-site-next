import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { POSTS_PER_PAGE, content, pick, toParagraphs } from "@/lib/content";
import type { Post } from "@/lib/content";
import { formatPostDate } from "@/lib/format-date";
import { localeAlternates } from "@/lib/metadata";
import Container from "@/components/ui/container";
import PageIntro from "@/components/ui/page-intro";
import HeroImage from "@/components/motion/hero-image";
import PostBodySection from "@/components/blog/post-body-section";
import MorePostsSection from "@/components/blog/more-posts-section";

type RouteParams = { locale: string; slug: string };

// How many other posts the tail shows. Four fills two grid rows exactly.
const MORE_POSTS_COUNT = 4;

/**
 * Every post, across every page.
 *
 * `getPosts()` is paginated by contract, so a single call only ever returns
 * the first POSTS_PER_PAGE records. Both callers below need the whole set —
 * one to prerender a route per post, the other to pick related reading —
 * and either would silently ignore everything past page 1 without this.
 */
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

/**
 * Only the `slug` segment. Next.js calls this once per parent param, and
 * the [locale] layout above already enumerates every locale — returning
 * locales here too would multiply them against themselves.
 */
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await content.getPost(slug);

  if (!post) return {};

  return {
    title: pick(post.title, locale),
    description: pick(post.excerpt, locale),
    alternates: localeAlternates(`/blog/${slug}`, locale),
    // An article, not a generic page — this is what gives a shared link its
    // author and date rather than just a title.
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt,
      authors: [pick(post.author, locale)],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [post, allPosts, tNav, tDetail] = await Promise.all([
    content.getPost(slug),
    getAllPosts(),
    getTranslations({ locale, namespace: "common.nav" }),
    getTranslations({ locale, namespace: "blog.detail" }),
  ]);

  if (!post) {
    notFound();
  }

  const morePosts = allPosts
    .filter((item) => item.id !== post.id)
    .slice(0, MORE_POSTS_COUNT);

  return (
    <>
      {/* The label is the section this page belongs to, not the article's
          title — the <h1> already carries that. */}
      <PageIntro
        label={tNav("blog")}
        heading={pick(post.title, locale)}
        description={pick(post.excerpt, locale)}
      />

      <Container className="pb-48 md:pb-64">
        {/* Byline sits between the opener and the image rather than inside
            PageIntro: it's article metadata, not part of the page heading,
            and PageIntro is shared with pages that have no author. */}
        <p className="text-13 text-text-secondary mb-32 flex flex-wrap items-center gap-8">
          <span>{tDetail("authorLabel")}</span>
          <span className="text-text-primary font-medium">
            {pick(post.author, locale)}
          </span>
          <span aria-hidden="true">—</span>
          <time dateTime={post.publishedAt}>
            {formatPostDate(post.publishedAt, locale)}
          </time>
        </p>

        <HeroImage src={post.coverImage} />
      </Container>

      <PostBodySection paragraphs={toParagraphs(pick(post.body, locale))} />

      <MorePostsSection
        posts={morePosts.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: pick(item.title, locale),
          publishedIso: item.publishedAt,
          publishedLabel: formatPostDate(item.publishedAt, locale),
        }))}
      />
    </>
  );
}

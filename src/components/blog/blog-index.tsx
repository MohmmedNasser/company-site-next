import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { POSTS_PER_PAGE, content, pick } from "@/lib/content";
import { formatPostDate } from "@/lib/format-date";
import PageIntro from "@/components/ui/page-intro";
import PostList from "@/components/blog/post-list";

interface BlogIndexProps {
  locale: string;
  page: number;
}

/**
 * The body of both /blog and /blog/page/N.
 *
 * Shared as a component rather than duplicated across the two route files:
 * the pages differ only in which page number they pass, and a divergence
 * between them — a heading on one, a missing pager on the other — is the
 * exact bug this shape prevents. Both routes stay thin wrappers that own
 * their own metadata and static params, which is the part that genuinely
 * differs.
 */
export default async function BlogIndex({ locale, page }: BlogIndexProps) {
  const [settings, posts, postCount, tNav] = await Promise.all([
    content.getSettings(),
    content.getPosts(page),
    content.getPostCount(),
    getTranslations({ locale, namespace: "common.nav" }),
  ]);

  // An in-range page that happens to hold no posts can only mean the page
  // number is past the end — 404 rather than render an empty index, which
  // would otherwise return 200 for /blog/page/99.
  if (posts.length === 0) {
    notFound();
  }

  const intro = settings.pages.blog.intro;
  const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));

  return (
    <>
      <PageIntro
        label={tNav("blog")}
        heading={pick(intro.heading, locale)}
        description={pick(intro.description, locale)}
      />

      {/* No second SectionLabel: the list IS this page's content, not a
          section within it — same call as /services and /portfolio. */}
      <PostList
        currentPage={page}
        totalPages={totalPages}
        posts={posts.map((post) => ({
          id: post.id,
          slug: post.slug,
          coverImage: post.coverImage,
          title: pick(post.title, locale),
          excerpt: pick(post.excerpt, locale),
          author: pick(post.author, locale),
          publishedIso: post.publishedAt,
          publishedLabel: formatPostDate(post.publishedAt, locale),
        }))}
      />
    </>
  );
}

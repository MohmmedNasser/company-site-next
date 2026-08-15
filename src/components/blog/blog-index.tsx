import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { POSTS_PER_PAGE, content, pick } from "@/lib/content";
import { formatPostDate } from "@/lib/format-date";
import Container from "@/components/ui/container";
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

  const intro = settings.pages.blog.intro;
  const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));

  // Two different reasons this page could be empty, and only one of them
  // is a 404: a page number past the end (postCount > 0 but this page has
  // no rows — /blog/page/99) has nothing to render at that address, so it
  // 404s. Zero posts published at all is a real, valid state of page 1
  // that the admin panel (Phase 14) can reach any time a project has no
  // posts yet — that gets a designed empty state, not a 404.
  if (postCount === 0) {
    if (page > 1) {
      notFound();
    }

    const tEmpty = await getTranslations({
      locale,
      namespace: "blog.list.emptyState",
    });

    return (
      <>
        <PageIntro
          label={tNav("blog")}
          heading={pick(intro.heading, locale)}
          description={pick(intro.description, locale)}
        />

        <Container as="section" className="pb-80 md:pb-96">
          <div className="border-border bg-card rounded-card flex flex-col items-start gap-8 border p-32">
            <p className="text-16 text-text-primary font-semibold">
              {tEmpty("heading")}
            </p>
            <p className="text-14 text-text-secondary">
              {tEmpty("description")}
            </p>
          </div>
        </Container>
      </>
    );
  }

  if (posts.length === 0) {
    notFound();
  }

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

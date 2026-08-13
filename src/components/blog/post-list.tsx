import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import Reveal from "@/components/motion/reveal";
import BlogPagination from "@/components/blog/blog-pagination";

export interface PostListItem {
  id: string;
  slug: string;
  coverImage: string;
  title: string;
  excerpt: string;
  author: string;
  /** Already formatted by `formatPostDate` on the server. */
  publishedLabel: string;
  /** Machine-readable value for <time datetime>. */
  publishedIso: string;
}

interface PostListProps {
  posts: PostListItem[];
  currentPage: number;
  totalPages: number;
}

/**
 * The /blog index, as rows rather than a card grid.
 *
 * Same reasoning as the /services list: a full-width row gives the excerpt
 * room a card doesn't, and it keeps the two index pages on this site
 * visually related instead of each inventing its own shape. The thumbnail
 * sits on the end side and drops out below md, where the heading and
 * excerpt already fill the row.
 */
export default async function PostList({
  posts,
  currentPage,
  totalPages,
}: PostListProps) {
  const t = await getTranslations("blog.list");

  return (
    <Container as="section" className="pb-80 md:pb-96">
      <div className="flex flex-col">
        {posts.map((post) => (
          <Reveal key={post.id}>
            <article>
              <Link
                href={`/blog/${post.slug}`}
                className="group border-border hover:border-text-secondary duration-micro flex flex-col gap-24 border-t py-32 transition-colors md:flex-row md:items-center md:gap-48 md:py-40"
              >
                <div className="flex flex-1 flex-col items-start gap-16">
                  <div className="text-12 text-text-secondary flex flex-wrap items-center gap-8 font-medium">
                    <time dateTime={post.publishedIso}>
                      {post.publishedLabel}
                    </time>
                    <span aria-hidden="true">—</span>
                    <span>{post.author}</span>
                  </div>

                  <h2 className="text-24 md:text-32 text-text-primary font-semibold text-balance">
                    {post.title}
                  </h2>

                  <p className="text-14 md:text-16 text-text-secondary max-w-640">
                    {post.excerpt}
                  </p>

                  <span className="text-13 text-text-primary inline-flex items-center gap-8 font-medium">
                    {t("readLabel")}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-14 rtl:-scale-x-100"
                    />
                  </span>
                </div>

                <div className="border-border bg-card rounded-card relative hidden aspect-video w-240 shrink-0 overflow-hidden border md:block lg:w-320">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 320px, 240px"
                    className="ease-decelerate object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
            </article>
          </Reveal>
        ))}

        {/* Closes the last row, so the list reads as a bounded block rather
            than one that simply ran out of items. */}
        <span aria-hidden="true" className="bg-border h-px w-full" />
      </div>

      <BlogPagination currentPage={currentPage} totalPages={totalPages} />
    </Container>
  );
}

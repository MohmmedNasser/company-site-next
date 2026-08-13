import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";

export interface MorePostItem {
  id: string;
  slug: string;
  title: string;
  publishedLabel: string;
  publishedIso: string;
}

interface MorePostsSectionProps {
  posts: MorePostItem[];
}

/**
 * The tail of an article: a few other posts, so the page ends on a route
 * onward rather than a dead stop. Text-only — the index is where posts get
 * thumbnails and excerpts, and reproducing that here would compete with the
 * article the reader just finished.
 *
 * Numbered [02], not [03] as on the other detail pages: an article's body
 * carries no SectionLabel of its own (see post-body-section.tsx), so this
 * is the page's second labelled section rather than its third.
 */
export default async function MorePostsSection({
  posts,
}: MorePostsSectionProps) {
  const t = await getTranslations("blog.detail");

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={2}>{t("moreLabel")}</SectionLabel>

      <div className="mt-32 grid grid-cols-1 gap-x-48 md:mt-48 md:grid-cols-2">
        {posts.map((post) => (
          <Reveal key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="group border-border hover:border-text-secondary duration-micro flex items-center gap-16 border-t py-24 transition-colors"
            >
              <div className="flex flex-1 flex-col gap-4">
                <time
                  dateTime={post.publishedIso}
                  className="text-12 text-text-secondary font-medium"
                >
                  {post.publishedLabel}
                </time>
                <span className="text-16 text-text-primary font-medium">
                  {post.title}
                </span>
              </div>
              <ArrowRight
                aria-hidden="true"
                className="text-text-secondary size-16 shrink-0 rtl:-scale-x-100"
              />
            </Link>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

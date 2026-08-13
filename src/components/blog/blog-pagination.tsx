import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
}

/**
 * Page 1 lives at /blog; every later page at /blog/page/N.
 *
 * Real paths rather than a `?page=` search param, because reading a search
 * param would opt the whole route out of static rendering — every other
 * route on this site is prerendered, and a pager is not a reason to break
 * that. Page 1 keeps the bare /blog URL so the canonical index has one
 * address rather than two (/blog and /blog/page/1) serving identical
 * content.
 */
export function blogPageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export default async function BlogPagination({
  currentPage,
  totalPages,
}: BlogPaginationProps) {
  const t = await getTranslations("blog.pagination");

  // One page is not a pager. Rendering a disabled prev/next pair for a
  // single page of posts is chrome that tells the reader nothing.
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const arrowClasses =
    "border-border text-text-primary hover:border-text-secondary duration-micro rounded-control inline-flex size-40 items-center justify-center border transition-colors";
  // ChevronLeft/Right are directional, so they mirror under RTL — unlike
  // the non-directional icons elsewhere in this project, which must not.
  const iconClasses = "size-16 rtl:-scale-x-100";

  return (
    <nav
      aria-label={t("navLabel")}
      className="mt-48 flex items-center justify-between gap-16 md:mt-64"
    >
      {/* A disabled arrow is rendered as a non-interactive <span>, not a
          <button disabled> or a link to nowhere: there is no page to go to,
          so there should be nothing in the tab order. */}
      {previousPage ? (
        <Link
          href={blogPageHref(previousPage)}
          aria-label={t("previousLabel")}
          rel="prev"
          className={arrowClasses}
        >
          <ChevronLeft aria-hidden="true" className={iconClasses} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(arrowClasses, "text-text-secondary opacity-40")}
        >
          <ChevronLeft className={iconClasses} />
        </span>
      )}

      <ol className="flex items-center gap-8">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              {isCurrent ? (
                // aria-current="page" is the announcement; the visual
                // treatment is the filled chip. Still a <span>, because a
                // link to the page you are already on is a dead control.
                <span
                  aria-current="page"
                  aria-label={t("pageLabel", { number: page })}
                  className="bg-primary text-on-primary rounded-control text-13 inline-flex size-40 items-center justify-center font-medium tabular-nums"
                >
                  {page}
                </span>
              ) : (
                <Link
                  href={blogPageHref(page)}
                  aria-label={t("pageLabel", { number: page })}
                  className="border-border text-text-secondary hover:border-text-secondary hover:text-text-primary duration-micro rounded-control text-13 inline-flex size-40 items-center justify-center border font-medium tabular-nums transition-colors"
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {nextPage ? (
        <Link
          href={blogPageHref(nextPage)}
          aria-label={t("nextLabel")}
          rel="next"
          className={arrowClasses}
        >
          <ChevronRight aria-hidden="true" className={iconClasses} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(arrowClasses, "text-text-secondary opacity-40")}
        >
          <ChevronRight className={iconClasses} />
        </span>
      )}
    </nav>
  );
}

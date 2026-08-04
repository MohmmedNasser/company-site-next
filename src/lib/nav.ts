// Single source of truth for the primary route list — Header's desktop nav,
// MobileNav's overlay nav, and Footer's "company" link column (Task 5:
// "sourced from nav-equivalent data") all read from this array instead of
// each maintaining their own copy that could drift out of sync.
export const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

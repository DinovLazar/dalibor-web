/**
 * Single source of truth for the primary navigation. The header, the mobile menu
 * (and any later footer "explore" column) all read from here so the nav set is
 * defined once.
 *
 * `key` is the message key under the `nav` namespace (label = t(`nav.${key}`));
 * `href` is the locale-agnostic path — next-intl's <Link> prepends the active
 * locale. Order here is the visual order.
 */
export type NavKey = "home" | "about" | "reviews" | "blog" | "book" | "contact";

export type NavItem = {
  key: NavKey;
  href: string;
};

export const primaryNav: readonly NavItem[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "reviews", href: "/reviews" },
  { key: "blog", href: "/blog" },
  { key: "book", href: "/book" },
  { key: "contact", href: "/contact" },
];

/**
 * Active-route test that also lights the parent item on nested routes
 * (e.g. /reviews/<slug> keeps "Reviews" current). `pathname` is the next-intl
 * pathname (locale prefix already stripped).
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

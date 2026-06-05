import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation wrappers. From here on, ALL internal locale routes
 * must use these (never bare `next/link` / `next/navigation`) so the active
 * locale is carried across links and redirects.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

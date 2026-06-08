import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Next.js 16 renamed the Middleware file convention to `proxy.ts`. next-intl's
 * request handler is filename-agnostic, so `createMiddleware` mounts here
 * unchanged and handles the `/` → `/mk` redirect plus all locale routing.
 */
const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Belt-and-braces guard: the embedded Sanity Studio and the crawl files
  // (`/sitemap.xml`, `/robots.txt`) must NEVER be locale-prefixed/redirected.
  // The matcher below already excludes them, but we observed a dev server
  // serving a stale compiled matcher that redirected /studio → /mk/studio
  // (404). This in-code guard makes the exclusion unconditional regardless of
  // how the matcher is compiled.
  const { pathname } = request.nextUrl;
  if (
    pathname === "/studio" ||
    pathname.startsWith("/studio/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return;
  }
  return handleI18nRouting(request);
}

export const config = {
  // Run on every pathname except API routes, Next.js internals, Vercel
  // internals, the embedded Sanity Studio (`/studio` + sub-paths — it must NOT
  // be locale-prefixed/redirected), and any path containing a dot (static
  // files). The Studio talks to Sanity's own domains, so no other exclusions
  // are needed. The crawl files (`/sitemap.xml`, `/robots.txt`) are named
  // explicitly too: they already match the dot-exclusion, but spelling them out
  // makes the SEO intent unambiguous.
  matcher:
    "/((?!api|_next|_vercel|studio|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
};

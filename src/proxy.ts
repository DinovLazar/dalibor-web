import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Next.js 16 renamed the Middleware file convention to `proxy.ts`. next-intl's
 * request handler is filename-agnostic, so `createMiddleware` mounts here
 * unchanged and handles the `/` → `/mk` redirect plus all locale routing.
 */
export default createMiddleware(routing);

export const config = {
  // Run on every pathname except API routes, Next.js internals, Vercel
  // internals, and any path containing a dot (static files).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};

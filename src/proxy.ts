import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed "middleware" to "proxy". next-intl's request handler is
// API-compatible, so we export it from here as the default proxy.
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API routes, Next internals, and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

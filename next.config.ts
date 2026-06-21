import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // PGlite is server-only and must not be bundled for the browser/edge.
  serverExternalPackages: ["@electric-sql/pglite", "playwright", "playwright-core"],
};

export default withNextIntl(nextConfig);

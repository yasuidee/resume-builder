import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // PGlite is server-only and must not be bundled for the browser/edge.
  serverExternalPackages: [
    "@electric-sql/pglite",
    "postgres",
    "playwright",
    "playwright-core",
    "@sparticuz/chromium",
  ],
  // The runtime migrator reads ./drizzle/*.sql from disk, so make sure those
  // files are traced into every serverless function bundle.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*"],
  },
};

export default withNextIntl(nextConfig);

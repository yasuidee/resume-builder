import { defineRouting } from "next-intl/routing";

export const locales = ["ja", "en", "zh-Hans", "zh-Hant", "vi"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ja";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // `ja` is served at the root (`/`); other locales are prefixed (`/en`, `/vi`...).
  localePrefix: "as-needed",
});

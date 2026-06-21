import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

type Messages = Record<string, unknown>;

// Deep-merge so any key missing from a locale falls back to Japanese. This lets
// non-ja catalogs be partial (main screens translated, the rest inherit ja)
// without ever throwing a MISSING_MESSAGE error.
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const key of Object.keys(override)) {
    const b = base[key];
    const o = override[key];
    if (
      b &&
      o &&
      typeof b === "object" &&
      typeof o === "object" &&
      !Array.isArray(b) &&
      !Array.isArray(o)
    ) {
      out[key] = deepMerge(b as Messages, o as Messages);
    } else {
      out[key] = o;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const ja = (await import("../messages/ja.json")).default as Messages;
  const messages =
    locale === "ja"
      ? ja
      : deepMerge(
          ja,
          (await import(`../messages/${locale}.json`)).default as Messages,
        );

  return { locale, messages };
});

"use client";

import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  ja: "日本語",
  en: "English",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
  vi: "Tiếng Việt",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="relative flex items-center">
      <Globe className="pointer-events-none absolute left-2 size-4 text-slate-400" />
      <select
        aria-label="Language"
        value={locale}
        onChange={(e) =>
          router.replace(pathname, { locale: e.target.value as never })
        }
        className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {LABELS[l] ?? l}
          </option>
        ))}
      </select>
    </div>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const c = useTranslations("Common");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          {c("appName")}
        </Link>
        <nav className="flex items-center gap-1">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">{t("dashboard")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/documents/new">{t("newDocument")}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

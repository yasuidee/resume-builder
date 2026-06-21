import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center" aria-label="JobseeQ">
          <Logo className="h-7 w-auto sm:h-8" />
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

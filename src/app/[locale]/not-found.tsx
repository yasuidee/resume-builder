import { useTranslations } from "next-intl";
import { FileQuestion } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("Errors");
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <FileQuestion className="mb-4 size-12 text-slate-300" />
      <h1 className="text-2xl font-bold text-slate-900">{t("notFoundTitle")}</h1>
      <p className="mt-2 max-w-md text-slate-600">{t("notFoundBody")}</p>
      <Button asChild className="mt-6">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </main>
  );
}

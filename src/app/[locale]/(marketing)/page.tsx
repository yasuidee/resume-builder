import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Languages, Sparkles, ShieldCheck } from "lucide-react";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Landing />;
}

function Landing() {
  const t = useTranslations("Marketing");
  const c = useTranslations("Common");

  const points = [
    { icon: Languages, title: t("point1Title"), body: t("point1Body") },
    { icon: Sparkles, title: t("point2Title"), body: t("point2Body") },
    { icon: FileText, title: t("point3Title"), body: t("point3Body") },
  ];

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center">
        <p className="mb-4 text-sm font-semibold text-indigo-600">
          {c("appName")}
        </p>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-slate-600">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/documents/new">{t("ctaPrimary")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">{t("ctaSecondary")}</Link>
          </Button>
        </div>
      </section>

      {/* Points */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <Card key={p.title}>
              <CardContent className="p-6">
                <p.icon className="mb-4 size-8 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {p.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust note */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="flex items-start gap-3 rounded-2xl bg-indigo-50 p-6 text-sm text-indigo-900">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-indigo-600" />
          <p className="leading-relaxed">{t("trustNote")}</p>
        </div>
      </section>
    </main>
  );
}

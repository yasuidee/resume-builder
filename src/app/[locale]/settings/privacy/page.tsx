import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getConsentState } from "@/lib/actions/consent";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { PrivacyControls } from "@/components/privacy/privacy-controls";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  const user = await getCurrentUser();
  if (!user) notFound();
  const state = await getConsentState(user.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-slate-600">{t("subtitle")}</p>

        <Card className="mt-6 bg-slate-50">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-slate-800">
              {t("purposeTitle")}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t("purposeBody")}</p>
          </CardContent>
        </Card>

        <div className="mt-6">
          <PrivacyControls initial={state} />
        </div>
      </main>
    </>
  );
}

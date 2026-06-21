import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { DocumentTypePicker } from "@/components/document-type-picker";

export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("NewDocument");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-slate-600">{t("subtitle")}</p>
        <div className="mt-8">
          <DocumentTypePicker cvEnabled={true} />
        </div>
      </main>
    </>
  );
}

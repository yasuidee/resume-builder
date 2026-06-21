import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, loadResumeValues } from "@/lib/resume";
import { missingRequiredResume } from "@/lib/validation/resume";
import { ResumeDocument } from "@/components/resume/resume-document";
import { resumeCss } from "@/components/resume/resume-styles";
import { PdfDownloadButton } from "@/components/resume/pdf-download-button";
import { Button } from "@/components/ui/button";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Preview");
  const te = await getTranslations("Editor");

  const user = await getCurrentUser();
  if (!user) notFound();
  const doc = await getDocumentForUser(id, user.id);
  if (!doc) notFound();

  const values = await loadResumeValues(user.id);
  const missing = missingRequiredResume(values);

  const labelFor = (key: string): string =>
    key === "education" ? te("step3") : te(key as never);

  return (
    <div className="flex min-h-full flex-col bg-slate-100">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/documents/${doc.id}/edit`}>
              <ChevronLeft className="size-4" />
              {t("backToEdit")}
            </Link>
          </Button>
          <PdfDownloadButton documentId={doc.id} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {missing.length > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold">{t("incompleteTitle")}</p>
              <p className="mt-1 text-amber-800">{t("incompleteBody")}</p>
              <p className="mt-2 font-medium">
                {missing.map(labelFor).join("・")}
              </p>
            </div>
          </div>
        )}

        {/* The preview sheet uses the exact same CSS as the PDF. */}
        <style dangerouslySetInnerHTML={{ __html: resumeCss }} />
        <div className="overflow-x-auto">
          <div className="mx-auto w-fit bg-white shadow-lg">
            <ResumeDocument values={values} />
          </div>
        </div>
      </main>
    </div>
  );
}

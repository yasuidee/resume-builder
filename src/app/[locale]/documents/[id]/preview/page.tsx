import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, loadResumeValues } from "@/lib/resume";
import { loadCvValues } from "@/lib/cv";
import { missingRequiredResume } from "@/lib/validation/resume";
import { missingRequiredCv } from "@/lib/validation/cv";
import { ResumeDocument } from "@/components/resume/resume-document";
import { CvDocument } from "@/components/resume/cv-document";
import { resumeCss } from "@/components/resume/resume-styles";
import { PdfDownloadButton } from "@/components/resume/pdf-download-button";
import { ConsistencyCheck } from "@/components/resume/consistency-check";
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
  const tc = await getTranslations("CvEditor");

  const user = await getCurrentUser();
  if (!user) notFound();
  const doc = await getDocumentForUser(id, user.id);
  if (!doc) notFound();

  const isCv = doc.type === "cv";

  let missingLabels: string[] = [];
  let sheet: React.ReactNode;
  if (isCv) {
    const values = await loadCvValues(user.id);
    const missing = missingRequiredCv(values);
    const labelMap: Record<string, string> = {
      work: tc("step4"),
      desiredJob: tc("desiredJob"),
    };
    missingLabels = missing.map((m) => labelMap[m] ?? m);
    sheet = <CvDocument values={values} />;
  } else {
    const values = await loadResumeValues(user.id);
    const missing = missingRequiredResume(values);
    missingLabels = missing.map((key) =>
      key === "education" ? te("step3") : te(key as never),
    );
    sheet = <ResumeDocument values={values} />;
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-100">
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
        <ConsistencyCheck documentId={doc.id} />

        {missingLabels.length > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold">{t("incompleteTitle")}</p>
              <p className="mt-1 text-amber-800">{t("incompleteBody")}</p>
              <p className="mt-2 font-medium">{missingLabels.join("・")}</p>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: resumeCss }} />
        <div className="overflow-x-auto">
          <div className="mx-auto w-fit bg-white shadow-lg">{sheet}</div>
        </div>
      </main>
    </div>
  );
}

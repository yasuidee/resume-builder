import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, loadResumeValues } from "@/lib/resume";
import { loadCvValues } from "@/lib/cv";
import { ResumeDocument } from "@/components/resume/resume-document";
import { CvDocument } from "@/components/resume/cv-document";
import { resumeCss } from "@/components/resume/resume-styles";

// Chrome-less page used only as the source for Playwright PDF generation.
export default async function PrintPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) notFound();
  const doc = await getDocumentForUser(id, user.id);
  if (!doc) notFound();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `html,body{background:#fff;margin:0;padding:0;}${resumeCss}`,
        }}
      />
      {doc.type === "cv" ? (
        <CvDocument values={await loadCvValues(user.id)} />
      ) : (
        <ResumeDocument values={await loadResumeValues(user.id)} />
      )}
    </>
  );
}

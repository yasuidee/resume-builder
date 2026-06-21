import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, loadResumeValues } from "@/lib/resume";
import { loadCvValues } from "@/lib/cv";
import { ResumeByTemplate } from "@/components/resume/resume-by-template";
import { CvDocument } from "@/components/resume/cv-document";
import { resumeCss, resumeModernCss } from "@/components/resume/resume-styles";
import type { ResumeTemplate } from "@/lib/actions/documents";

// Chrome-less page used only as the source for Playwright PDF generation.
// `?set=1` renders the resume and CV together (resume + CV combined PDF).
export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ set?: string }>;
}) {
  const { locale, id } = await params;
  const { set } = await searchParams;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) notFound();
  const doc = await getDocumentForUser(id, user.id);
  if (!doc) notFound();

  const isSet = set === "1";
  const template =
    ((doc.data as { template?: ResumeTemplate } | null)?.template ??
      "classic") as ResumeTemplate;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `html,body{background:#fff;margin:0;padding:0;}${resumeCss}${resumeModernCss}`,
        }}
      />
      {isSet ? (
        <>
          <ResumeByTemplate
            values={await loadResumeValues(user.id)}
            template={template}
          />
          <div style={{ breakBefore: "page" }}>
            <CvDocument values={await loadCvValues(user.id)} />
          </div>
        </>
      ) : doc.type === "cv" ? (
        <CvDocument values={await loadCvValues(user.id)} />
      ) : (
        <ResumeByTemplate
          values={await loadResumeValues(user.id)}
          template={template}
        />
      )}
    </>
  );
}

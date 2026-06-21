import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, loadResumeValues } from "@/lib/resume";
import { loadCvValues } from "@/lib/cv";
import { ResumeDocument } from "@/components/resume/resume-document";
import { CvDocument } from "@/components/resume/cv-document";
import { resumeCss } from "@/components/resume/resume-styles";

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

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `html,body{background:#fff;margin:0;padding:0;}${resumeCss}`,
        }}
      />
      {isSet ? (
        <>
          <ResumeDocument values={await loadResumeValues(user.id)} />
          <div style={{ breakBefore: "page" }}>
            <CvDocument values={await loadCvValues(user.id)} />
          </div>
        </>
      ) : doc.type === "cv" ? (
        <CvDocument values={await loadCvValues(user.id)} />
      ) : (
        <ResumeDocument values={await loadResumeValues(user.id)} />
      )}
    </>
  );
}

import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, loadResumeValues } from "@/lib/resume";
import { loadCvValues } from "@/lib/cv";
import { SiteHeader } from "@/components/site-header";
import { ResumeEditor } from "@/components/editor/resume-editor";
import { CvEditor } from "@/components/editor/cv-editor";

export default async function EditDocumentPage({
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
      <SiteHeader />
      <main className="flex-1">
        {doc.type === "cv" ? (
          <CvEditor documentId={doc.id} initialValues={await loadCvValues(user.id)} />
        ) : (
          <ResumeEditor
            documentId={doc.id}
            initialValues={await loadResumeValues(user.id)}
          />
        )}
      </main>
    </>
  );
}

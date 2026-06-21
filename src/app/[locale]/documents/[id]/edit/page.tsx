import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, loadResumeValues } from "@/lib/resume";
import { SiteHeader } from "@/components/site-header";
import { ResumeEditor } from "@/components/editor/resume-editor";

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

  const values = await loadResumeValues(user.id);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <ResumeEditor documentId={doc.id} initialValues={values} />
      </main>
    </>
  );
}

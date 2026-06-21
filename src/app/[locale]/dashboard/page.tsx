import { desc, eq } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDb } from "@/db";
import { documents, pdfExports, consents } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SetPdfButton } from "@/components/resume/set-pdf-button";
import { DocumentActions } from "@/components/dashboard/document-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus2, FileText } from "lucide-react";

function formatDate(value: Date | string | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Dashboard");

  const user = await getCurrentUser();
  const db = await getDb();

  const userId = user!.id;
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.updatedAt));

  const exports = await db
    .select()
    .from(pdfExports)
    .where(eq(pdfExports.userId, userId))
    .orderBy(desc(pdfExports.createdAt))
    .limit(5);

  const consentRows = await db
    .select()
    .from(consents)
    .where(eq(consents.userId, userId))
    .orderBy(desc(consents.createdAt));
  const careerSupportGranted =
    consentRows.find((r) => r.consentType === "career_support")?.isGranted ??
    false;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-slate-600">
            {t("greeting", { name: user?.displayName ?? "" })}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/documents/new">
              <FilePlus2 className="size-4" />
              {t("newDocument")}
            </Link>
          </Button>
          {docs.some((d) => d.type === "resume") &&
            docs.some((d) => d.type === "cv") && (
              <SetPdfButton documentId={docs[0].id} />
            )}
          <Link
            href="/settings/privacy"
            className="text-sm text-slate-500 underline-offset-2 hover:underline"
          >
            {t("consentStatus")}：
            <span
              className={
                careerSupportGranted ? "text-emerald-600" : "text-slate-500"
              }
            >
              {careerSupportGranted ? t("consentOn") : t("consentOff")}
            </span>
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">
            {t("documentsHeading")}
          </h2>
          {docs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <FileText className="size-8 text-slate-300" />
                <p className="text-sm text-slate-500">{t("empty")}</p>
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-3">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <Card>
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {doc.title ||
                            (doc.type === "resume"
                              ? t("typeResume")
                              : t("typeCv"))}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {doc.type === "resume"
                            ? t("typeResume")
                            : t("typeCv")}
                          ・{t("status")}：
                          {doc.status === "completed"
                            ? t("statusCompleted")
                            : t("statusDraft")}
                          ・{t("updatedAt")} {formatDate(doc.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/documents/${doc.id}/edit`}>
                            {t("open")}
                          </Link>
                        </Button>
                        <DocumentActions
                          documentId={doc.id}
                          currentTitle={
                            doc.title ||
                            (doc.type === "resume"
                              ? t("typeResume")
                              : t("typeCv"))
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        {exports.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-slate-500">
              {t("pdfHistory")}
            </h2>
            <ul className="grid gap-2">
              {exports.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <span className="text-slate-700">{e.fileName}</span>
                  <span className="text-slate-400">
                    {formatDate(e.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser } from "@/lib/resume";
import { listVersions } from "@/lib/actions/versions";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VersionList } from "@/components/versions/version-list";

export default async function VersionsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Versions");

  const user = await getCurrentUser();
  if (!user) notFound();
  const doc = await getDocumentForUser(id, user.id);
  if (!doc) notFound();

  const versions = await listVersions(id);
  const items = versions.map((v) => ({
    id: v.id,
    versionNumber: v.versionNumber,
    changeSummary: v.changeSummary,
    createdAt: new Date(v.createdAt).toISOString(),
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={`/documents/${id}/edit`}>
            <ChevronLeft className="size-4" />
            {t("backToEdit")}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>

        <div className="mt-6">
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-slate-500">
                {t("empty")}
              </CardContent>
            </Card>
          ) : (
            <VersionList versions={items} />
          )}
        </div>
      </main>
    </>
  );
}

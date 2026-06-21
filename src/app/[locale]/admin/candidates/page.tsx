import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/db";
import { consents, profiles, jobPreferences } from "@/db/schema";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminCandidatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const user = await getCurrentUser();
  if (!user) notFound();

  // Permission check — non-admins must not see this screen.
  if (user.role !== "admin") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
          <p className="text-slate-600">{t("forbidden")}</p>
        </main>
      </>
    );
  }

  const db = await getDb();

  // Latest career_support consent per user; only granted users are candidates.
  const consentRows = await db
    .select()
    .from(consents)
    .where(eq(consents.consentType, "career_support"))
    .orderBy(desc(consents.createdAt));

  const latest = new Map<string, boolean>();
  for (const r of consentRows) {
    if (!latest.has(r.userId)) latest.set(r.userId, r.isGranted);
  }
  const grantedUserIds = [...latest.entries()]
    .filter(([, granted]) => granted)
    .map(([id]) => id);

  const candidates: {
    id: string;
    name: string;
    desiredJob: string;
    japanese: string;
    updatedAt: Date | null;
  }[] = [];
  for (const uid of grantedUserIds) {
    const [p] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, uid))
      .limit(1);
    const [pref] = await db
      .select()
      .from(jobPreferences)
      .where(eq(jobPreferences.userId, uid))
      .limit(1);
    candidates.push({
      id: uid,
      name: p?.fullName ?? "—",
      desiredJob: pref?.desiredJobType ?? "—",
      japanese: p?.japaneseLevel ?? "—",
      updatedAt: p?.updatedAt ?? null,
    });
  }

  const fmt = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(
          new Date(d),
        )
      : "—";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-slate-600">{t("subtitle")}</p>

        <div className="mt-6">
          {candidates.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-slate-500">
                {t("empty")}
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t("name")}</th>
                    <th className="px-4 py-3 font-medium">{t("desiredJob")}</th>
                    <th className="px-4 py-3 font-medium">{t("japanese")}</th>
                    <th className="px-4 py-3 font-medium">{t("updatedAt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {c.desiredJob}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{c.japanese}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {fmt(c.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

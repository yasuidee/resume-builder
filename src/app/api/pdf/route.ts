import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, jobPreferences, pdfExports, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser } from "@/lib/resume";
import { buildPdfFileName, type DocKind } from "@/lib/pdf/render";
import { urlToPdf } from "@/lib/pdf/playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// PDF generation spins up headless Chromium — give it headroom on Vercel.
export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const documentId = url.searchParams.get("documentId");
  if (!documentId) {
    return new Response("documentId is required", { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const doc = await getDocumentForUser(documentId, user.id);
  if (!doc) return new Response("Not found", { status: 404 });

  const db = await getDb();
  const [profile] = await db
    .select({ fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  const [pref] = await db
    .select({ desiredJobType: jobPreferences.desiredJobType })
    .from(jobPreferences)
    .where(eq(jobPreferences.userId, user.id))
    .limit(1);

  const isSet = url.searchParams.get("set") === "1";
  const kind = (isSet
    ? "set"
    : doc.type === "cv"
      ? "cv"
      : "resume") as DocKind;

  // Playwright renders the chrome-less /print page (it branches by doc type).
  const printUrl = `${url.origin}/documents/${doc.id}/print${
    isSet ? "?set=1" : ""
  }`;
  const pdf = await urlToPdf(printUrl);
  const fileName = buildPdfFileName(
    kind,
    profile?.fullName,
    pref?.desiredJobType,
  );

  await db.insert(pdfExports).values({
    userId: user.id,
    documentId: doc.id,
    fileName,
    kind,
  });
  await db.insert(auditLogs).values({
    userId: user.id,
    action: "pdf.export",
    targetId: doc.id,
    metadata: { fileName, kind },
  });

  const encoded = encodeURIComponent(fileName);
  return new Response(pdf as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="document.pdf"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "no-store",
    },
  });
}

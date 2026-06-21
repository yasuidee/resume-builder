import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobPreferences, pdfExports, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, loadResumeValues } from "@/lib/resume";
import { buildResumeFileName } from "@/lib/pdf/render";
import { urlToPdf } from "@/lib/pdf/playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const values = await loadResumeValues(user.id);
  const [pref] = await db
    .select({ desiredJobType: jobPreferences.desiredJobType })
    .from(jobPreferences)
    .where(eq(jobPreferences.userId, user.id))
    .limit(1);

  // Navigate Playwright to the chrome-less print page (same origin).
  const printUrl = `${url.origin}/documents/${doc.id}/print`;
  const pdf = await urlToPdf(printUrl);
  const fileName = buildResumeFileName(values, pref?.desiredJobType);

  // Record the export + audit trail.
  await db.insert(pdfExports).values({
    userId: user.id,
    documentId: doc.id,
    fileName,
    kind: "resume",
  });
  await db.insert(auditLogs).values({
    userId: user.id,
    action: "pdf.export",
    targetId: doc.id,
    metadata: { fileName, kind: "resume" },
  });

  // RFC 5987 encoding so the Japanese filename survives the header.
  const encoded = encodeURIComponent(fileName);
  return new Response(pdf as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume.pdf"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "no-store",
    },
  });
}

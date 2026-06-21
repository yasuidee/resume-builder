"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { documents, documentVersions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { loadResumeValues, getDocumentForUser } from "@/lib/resume";
import { loadCvValues } from "@/lib/cv";
import { saveResume, saveCv } from "@/lib/actions/documents";

// Capture the current document content as an immutable version snapshot.
export async function snapshotVersion(
  documentId: string,
  changeSummary = "手動保存",
): Promise<{ ok: boolean; versionNumber?: number }> {
  const user = await requireUser();
  const doc = await getDocumentForUser(documentId, user.id);
  if (!doc) return { ok: false };

  const db = await getDb();
  const snapshot =
    doc.type === "cv"
      ? await loadCvValues(user.id)
      : await loadResumeValues(user.id);

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${documentVersions.versionNumber}), 0)` })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId));

  const versionNumber = Number(max) + 1;
  await db.insert(documentVersions).values({
    documentId,
    versionNumber,
    snapshot,
    changeSummary,
  });

  return { ok: true, versionNumber };
}

// Restore a previous snapshot back into the live document.
export async function restoreVersion(
  versionId: string,
): Promise<{ ok: boolean; documentId?: string }> {
  const user = await requireUser();
  const db = await getDb();

  const [version] = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.id, versionId))
    .limit(1);
  if (!version) return { ok: false };

  // Verify the version's document belongs to this user.
  const [doc] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, version.documentId),
        eq(documents.userId, user.id),
      ),
    )
    .limit(1);
  if (!doc) return { ok: false };

  if (doc.type === "cv") {
    await saveCv(doc.id, version.snapshot);
  } else {
    await saveResume(doc.id, version.snapshot);
  }

  return { ok: true, documentId: doc.id };
}

export async function listVersions(documentId: string) {
  const user = await requireUser();
  const doc = await getDocumentForUser(documentId, user.id);
  if (!doc) return [];
  const db = await getDb();
  return db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber));
}

"use server";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { documents, profiles, educations, auditLogs } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  resumeFormSchema,
  computeResumeCompletion,
} from "@/lib/validation/resume";

export type DocumentType = "resume" | "cv";

// Create a new document and return its id (the caller redirects to the editor).
export async function createDocument(
  type: DocumentType,
): Promise<{ id: string }> {
  const user = await requireUser();
  const db = await getDb();
  const [doc] = await db
    .insert(documents)
    .values({ userId: user.id, type, status: "draft" })
    .returning({ id: documents.id });

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "document.create",
    targetId: doc.id,
    metadata: { type },
  });

  return { id: doc.id };
}

// Empty string -> null for nullable `date` columns.
function dateOrNull(value: string): string | null {
  return value && value.trim() !== "" ? value.trim() : null;
}

// Autosave handler for the resume editor. Persists the shared profile + the
// education list, and recomputes the document completion score.
export async function saveResume(
  documentId: string,
  values: unknown,
): Promise<{ ok: true; score: number } | { ok: false; error: string }> {
  const user = await requireUser();
  const parsed = resumeFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }
  const v = parsed.data;
  const db = await getDb();

  // Make sure the document belongs to this user.
  const [doc] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
    .limit(1);
  if (!doc) return { ok: false, error: "not_found" };

  const now = new Date();

  // Upsert the profile (Step 1 + Step 2 fields).
  await db
    .update(profiles)
    .set({
      fullName: v.fullName || null,
      fullNameKana: v.fullNameKana || null,
      romajiName: v.romajiName || null,
      birthDate: dateOrNull(v.birthDate),
      email: v.email || null,
      phone: v.phone || null,
      currentAddress: v.currentAddress || null,
      contactAddress: v.contactAddress || null,
      gender: v.gender,
      residenceStatus: v.residenceStatus || null,
      residenceExpiry: dateOrNull(v.residenceExpiry),
      workRestriction: v.workRestriction || null,
      japaneseLevel: v.japaneseLevel || null,
      jlpt: v.jlpt || null,
      englishLevel: v.englishLevel || null,
      nativeLanguage: v.nativeLanguage || null,
      showResidenceOnResume: v.showResidenceOnResume,
      updatedAt: now,
    })
    .where(eq(profiles.userId, user.id));

  // Replace the education list (simple + correct for autosave).
  await db.delete(educations).where(eq(educations.userId, user.id));
  if (v.educations.length > 0) {
    await db.insert(educations).values(
      v.educations.map((e, i) => ({
        userId: user.id,
        schoolName: e.schoolName || null,
        schoolNameJa: e.schoolNameJa || null,
        country: e.country || null,
        faculty: e.faculty || null,
        degree: e.degree || null,
        startDate: e.startDate || null,
        endDate: e.endDate || null,
        status: e.status || null,
        sortOrder: i,
      })),
    );
  }

  const score = computeResumeCompletion(v);
  await db
    .update(documents)
    .set({ completionScore: score, updatedAt: now })
    .where(eq(documents.id, documentId));

  return { ok: true, score };
}

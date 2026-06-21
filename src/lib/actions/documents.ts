"use server";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  documents,
  profiles,
  educations,
  workExperiences,
  skills,
  certifications,
  jobPreferences,
  auditLogs,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  resumeFormSchema,
  computeResumeCompletion,
} from "@/lib/validation/resume";
import {
  cvFormSchema,
  computeCvCompletion,
  parseSkills,
} from "@/lib/validation/cv";

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

// Delete a single document (its version history cascades). The shared per-user
// profile/education/work data is intentionally left intact.
export async function deleteDocument(
  documentId: string,
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const db = await getDb();
  const [doc] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
    .limit(1);
  if (!doc) return { ok: false };

  await db.delete(documents).where(eq(documents.id, documentId));
  await db.insert(auditLogs).values({
    userId: user.id,
    action: "document.delete",
    targetId: documentId,
    metadata: {},
  });
  return { ok: true };
}

export type ResumeTemplate = "classic" | "modern";

export async function setTemplate(
  documentId: string,
  template: ResumeTemplate,
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const db = await getDb();
  const [doc] = await db
    .select({ data: documents.data })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
    .limit(1);
  if (!doc) return { ok: false };
  await db
    .update(documents)
    .set({ data: { ...(doc.data ?? {}), template }, updatedAt: new Date() })
    .where(eq(documents.id, documentId));
  return { ok: true };
}

export async function renameDocument(
  documentId: string,
  title: string,
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const db = await getDb();
  const clean = title.trim().slice(0, 80);
  const res = await db
    .update(documents)
    .set({ title: clean || null, updatedAt: new Date() })
    .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
    .returning({ id: documents.id });
  return { ok: res.length > 0 };
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
      photoUrl: v.photoUrl || null,
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

// Autosave handler for the CV editor (Steps 4–6).
export async function saveCv(
  documentId: string,
  values: unknown,
): Promise<{ ok: true; score: number } | { ok: false; error: string }> {
  const user = await requireUser();
  const parsed = cvFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const v = parsed.data;
  const db = await getDb();

  const [doc] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
    .limit(1);
  if (!doc) return { ok: false, error: "not_found" };

  const now = new Date();

  // Replace work experiences.
  await db
    .delete(workExperiences)
    .where(eq(workExperiences.userId, user.id));
  if (v.works.length > 0) {
    await db.insert(workExperiences).values(
      v.works.map((w, i) => ({
        userId: user.id,
        companyName: w.companyName || null,
        companyNameJa: w.companyNameJa || null,
        country: w.country || null,
        department: w.department || null,
        position: w.position || null,
        employmentType: w.employmentType || null,
        startDate: w.startDate || null,
        endDate: w.endDate || null,
        isCurrent: w.isCurrent,
        description: w.description || null,
        achievements: w.achievements || null,
        tools: w.tools || null,
        sortOrder: i,
      })),
    );
  }

  // Replace skill tags.
  await db.delete(skills).where(eq(skills.userId, user.id));
  const tags = parseSkills(v.skillsText);
  if (tags.length > 0) {
    await db.insert(skills).values(
      tags.map((name, i) => ({
        userId: user.id,
        category: "tag",
        name,
        sortOrder: i,
      })),
    );
  }

  // Replace certifications.
  await db.delete(certifications).where(eq(certifications.userId, user.id));
  const validCerts = v.certifications.filter((c) => c.name.trim() !== "");
  if (validCerts.length > 0) {
    await db.insert(certifications).values(
      validCerts.map((c, i) => ({
        userId: user.id,
        name: c.name,
        issuer: c.issuer || null,
        acquiredDate: c.acquiredDate || null,
        sortOrder: i,
      })),
    );
  }

  // Upsert the single job-preferences row.
  await db
    .insert(jobPreferences)
    .values({
      userId: user.id,
      desiredJobType: v.desiredJob || null,
      desiredLocation: v.desiredLocation || null,
      desiredEmploymentType: v.desiredEmploymentType || null,
      availableFrom: v.availableFrom || null,
      prAnswers: v.prAnswers,
      careerSummary: v.careerSummary || null,
      selfPr: v.selfPr || null,
      motivation: v.motivation || null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: jobPreferences.userId,
      set: {
        desiredJobType: v.desiredJob || null,
        desiredLocation: v.desiredLocation || null,
        desiredEmploymentType: v.desiredEmploymentType || null,
        availableFrom: v.availableFrom || null,
        prAnswers: v.prAnswers,
        careerSummary: v.careerSummary || null,
        selfPr: v.selfPr || null,
        motivation: v.motivation || null,
        updatedAt: now,
      },
    });

  const score = computeCvCompletion(v);
  await db
    .update(documents)
    .set({ completionScore: score, updatedAt: now })
    .where(eq(documents.id, documentId));

  return { ok: true, score };
}

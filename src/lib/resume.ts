import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, educations, documents, type Document } from "@/db/schema";
import {
  EMPTY_RESUME,
  type ResumeFormValues,
  type EducationValues,
} from "@/lib/validation/resume";

// Load the user's profile + education into the resume form shape. The resume and
// CV documents both draw from this single per-user dataset.
export async function loadResumeValues(
  userId: string,
): Promise<ResumeFormValues> {
  const db = await getDb();
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const edus = await db
    .select()
    .from(educations)
    .where(eq(educations.userId, userId))
    .orderBy(educations.sortOrder);

  return {
    fullName: profile?.fullName ?? "",
    fullNameKana: profile?.fullNameKana ?? "",
    romajiName: profile?.romajiName ?? "",
    birthDate: profile?.birthDate ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    currentAddress: profile?.currentAddress ?? "",
    contactAddress: profile?.contactAddress ?? "",
    gender: (profile?.gender as ResumeFormValues["gender"]) ?? "unspecified",
    residenceStatus: profile?.residenceStatus ?? "",
    residenceExpiry: profile?.residenceExpiry ?? "",
    workRestriction: profile?.workRestriction ?? "",
    japaneseLevel: profile?.japaneseLevel ?? "",
    jlpt: profile?.jlpt ?? "",
    englishLevel: profile?.englishLevel ?? "",
    nativeLanguage: profile?.nativeLanguage ?? "",
    showResidenceOnResume: profile?.showResidenceOnResume ?? false,
    educations: edus.map(
      (e): EducationValues => ({
        id: e.id,
        schoolName: e.schoolName ?? "",
        schoolNameJa: e.schoolNameJa ?? "",
        country: e.country ?? "",
        faculty: e.faculty ?? "",
        degree: e.degree ?? "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
        status: (e.status as EducationValues["status"]) ?? "",
      }),
    ),
  } satisfies ResumeFormValues as ResumeFormValues;
}

export function emptyResume(): ResumeFormValues {
  return structuredClone(EMPTY_RESUME);
}

export async function getDocumentForUser(
  documentId: string,
  userId: string,
): Promise<Document | null> {
  const db = await getDb();
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
    .limit(1);
  return doc ?? null;
}

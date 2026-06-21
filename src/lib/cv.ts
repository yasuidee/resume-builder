import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  workExperiences,
  skills,
  certifications,
  jobPreferences,
} from "@/db/schema";
import {
  EMPTY_CV,
  type CvFormValues,
  type WorkValues,
  type CertificationValues,
  type PrAnswersValues,
} from "@/lib/validation/cv";

export async function loadCvValues(userId: string): Promise<CvFormValues> {
  const db = await getDb();
  const works = await db
    .select()
    .from(workExperiences)
    .where(eq(workExperiences.userId, userId))
    .orderBy(workExperiences.sortOrder);
  const certs = await db
    .select()
    .from(certifications)
    .where(eq(certifications.userId, userId))
    .orderBy(certifications.sortOrder);
  const skillRows = await db
    .select()
    .from(skills)
    .where(eq(skills.userId, userId))
    .orderBy(skills.sortOrder);
  const [pref] = await db
    .select()
    .from(jobPreferences)
    .where(eq(jobPreferences.userId, userId))
    .limit(1);

  const prAnswers: PrAnswersValues = {
    praised: "",
    hardWork: "",
    wantToDo: "",
    teamwork: "",
    numbers: "",
    ...((pref?.prAnswers as Partial<PrAnswersValues>) ?? {}),
  };

  return {
    works: works.map(
      (w): WorkValues => ({
        id: w.id,
        companyName: w.companyName ?? "",
        companyNameJa: w.companyNameJa ?? "",
        country: w.country ?? "",
        department: w.department ?? "",
        position: w.position ?? "",
        employmentType: w.employmentType ?? "",
        startDate: w.startDate ?? "",
        endDate: w.endDate ?? "",
        isCurrent: w.isCurrent,
        description: w.description ?? "",
        achievements: w.achievements ?? "",
        tools: w.tools ?? "",
      }),
    ),
    skillsText: skillRows.map((s) => s.name).join(", "),
    certifications: certs.map(
      (c): CertificationValues => ({
        id: c.id,
        name: c.name ?? "",
        issuer: c.issuer ?? "",
        acquiredDate: c.acquiredDate ?? "",
      }),
    ),
    desiredJob: pref?.desiredJobType ?? "",
    desiredLocation: pref?.desiredLocation ?? "",
    desiredEmploymentType: pref?.desiredEmploymentType ?? "",
    availableFrom: pref?.availableFrom ?? "",
    prAnswers,
    careerSummary: pref?.careerSummary ?? "",
    selfPr: pref?.selfPr ?? "",
    motivation: pref?.motivation ?? "",
  } satisfies CvFormValues;
}

export function emptyCv(): CvFormValues {
  return structuredClone(EMPTY_CV);
}

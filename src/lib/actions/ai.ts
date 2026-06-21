"use server";

import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  profiles,
  workExperiences,
  skills,
  educations,
  jobPreferences,
  aiSuggestions,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import type {
  ExperienceFact,
  PrAnswers,
  ProfileFacts,
} from "@/lib/ai/provider";
import type { AIResult, ConsistencyResult, Tone } from "@/lib/ai/schemas";

async function record(
  userId: string,
  documentId: string | null,
  kind: string,
  input: unknown,
  output: unknown,
) {
  const db = await getDb();
  await db.insert(aiSuggestions).values({
    userId,
    documentId,
    kind,
    input: input as object,
    output: output as object,
  });
}

async function loadProfileFacts(userId: string): Promise<ProfileFacts> {
  const db = await getDb();
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const [pref] = await db
    .select({ desiredJobType: jobPreferences.desiredJobType })
    .from(jobPreferences)
    .where(eq(jobPreferences.userId, userId))
    .limit(1);
  return {
    fullName: p?.fullName ?? undefined,
    japaneseLevel: p?.japaneseLevel ?? undefined,
    nativeLanguage: p?.nativeLanguage ?? undefined,
    desiredJob: pref?.desiredJobType ?? undefined,
  };
}

async function loadExperiences(userId: string): Promise<ExperienceFact[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(workExperiences)
    .where(eq(workExperiences.userId, userId))
    .orderBy(asc(workExperiences.sortOrder));
  return rows.map((w) => ({
    companyName: w.companyName ?? undefined,
    position: w.position ?? undefined,
    description: w.description ?? undefined,
    achievements: w.achievements ?? undefined,
    tools: w.tools ?? undefined,
  }));
}

async function loadPrAnswers(userId: string): Promise<PrAnswers> {
  const db = await getDb();
  const [pref] = await db
    .select({ prAnswers: jobPreferences.prAnswers })
    .from(jobPreferences)
    .where(eq(jobPreferences.userId, userId))
    .limit(1);
  return (pref?.prAnswers as PrAnswers) ?? {};
}

export async function aiImproveText(
  documentId: string,
  fieldLabel: string,
  documentType: "resume" | "cv",
  input: string,
): Promise<AIResult> {
  const user = await requireUser();
  const result = await getAIProvider().improveJapaneseText(input, {
    fieldLabel,
    documentType,
  });
  await record(user.id, documentId, "improve", { fieldLabel, input }, result);
  return result;
}

export async function aiTranslate(
  documentId: string,
  input: string,
  sourceLanguage: "ja" | "en" | "zh-Hans" | "zh-Hant" | "vi",
): Promise<AIResult> {
  const user = await requireUser();
  const result = await getAIProvider().translateToJapanese(
    input,
    sourceLanguage,
  );
  await record(user.id, documentId, "translate", { input, sourceLanguage }, result);
  return result;
}

export async function aiGenerateSelfPR(
  documentId: string,
  tone: Tone,
): Promise<AIResult> {
  const user = await requireUser();
  const [profile, experiences, answers] = await Promise.all([
    loadProfileFacts(user.id),
    loadExperiences(user.id),
    loadPrAnswers(user.id),
  ]);
  const result = await getAIProvider().generateSelfPR(
    profile,
    experiences,
    answers,
    tone,
  );
  await record(user.id, documentId, "selfPr", { tone }, result);
  return result;
}

export async function aiGenerateMotivation(
  documentId: string,
  targetJob: string,
  targetCompany: string,
  tone: Tone,
): Promise<AIResult> {
  const user = await requireUser();
  const [profile, answers] = await Promise.all([
    loadProfileFacts(user.id),
    loadPrAnswers(user.id),
  ]);
  const result = await getAIProvider().generateMotivation(
    profile,
    targetJob,
    targetCompany,
    answers,
    tone,
  );
  await record(
    user.id,
    documentId,
    "motivation",
    { targetJob, targetCompany, tone },
    result,
  );
  return result;
}

export async function aiSummarizeCareer(
  documentId: string,
): Promise<AIResult> {
  const user = await requireUser();
  const db = await getDb();
  const experiences = await loadExperiences(user.id);
  const skillRows = await db
    .select({ name: skills.name })
    .from(skills)
    .where(eq(skills.userId, user.id))
    .orderBy(asc(skills.sortOrder));
  const result = await getAIProvider().summarizeCareer(
    experiences,
    skillRows.map((s) => s.name),
  );
  await record(user.id, documentId, "careerSummary", {}, result);
  return result;
}

export async function aiCheckConsistency(
  documentId: string,
): Promise<ConsistencyResult> {
  const user = await requireUser();
  const db = await getDb();
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  const [firstEdu] = await db
    .select({ startDate: educations.startDate })
    .from(educations)
    .where(eq(educations.userId, user.id))
    .orderBy(asc(educations.sortOrder))
    .limit(1);

  const facts: Record<string, string> = {};
  if (p?.birthDate) facts.birthDate = p.birthDate;
  if (p?.email) facts.email = p.email;
  if (p?.residenceExpiry) facts.residenceExpiry = p.residenceExpiry;
  if (firstEdu?.startDate) facts.firstEducationStart = firstEdu.startDate;

  const result = await getAIProvider().checkDocumentConsistency({ facts });
  await record(user.id, documentId, "consistency", { facts }, result);
  return result;
}

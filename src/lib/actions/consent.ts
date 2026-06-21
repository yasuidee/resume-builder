"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import {
  consents,
  documents,
  educations,
  workExperiences,
  skills,
  certifications,
  jobPreferences,
  pdfExports,
  aiSuggestions,
  profiles,
  auditLogs,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  POLICY_VERSION,
  type ConsentType,
  type ConsentState,
} from "@/lib/consent-constants";

async function requestMeta() {
  const h = await headers();
  return {
    ipAddress: h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? null,
    userAgent: h.get("user-agent") ?? null,
  };
}

// Consent changes are append-only: every grant/withdraw inserts a new row so the
// full history is preserved. The latest row (by createdAt) is the current state.
export async function setConsent(
  consentType: ConsentType,
  isGranted: boolean,
  consentText: string,
  locale: string,
): Promise<{ ok: true }> {
  const user = await requireUser();
  const db = await getDb();
  const meta = await requestMeta();

  await db.insert(consents).values({
    userId: user.id,
    consentType,
    isGranted,
    consentText,
    policyVersion: POLICY_VERSION,
    locale,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  await db.insert(auditLogs).values({
    userId: user.id,
    action: "consent.change",
    targetId: consentType,
    metadata: { isGranted, policyVersion: POLICY_VERSION },
  });

  return { ok: true };
}

export async function saveConsents(input: {
  locale: string;
  careerSupport: { granted: boolean; text: string };
  thirdParty: { granted: boolean; text: string };
}): Promise<{ ok: true }> {
  await setConsent(
    "career_support",
    input.careerSupport.granted,
    input.careerSupport.text,
    input.locale,
  );
  await setConsent(
    "third_party_company_submission",
    input.thirdParty.granted,
    input.thirdParty.text,
    input.locale,
  );
  return { ok: true };
}

export async function getConsentState(userId: string): Promise<ConsentState> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(consents)
    .where(eq(consents.userId, userId))
    .orderBy(desc(consents.createdAt));

  const state: ConsentState = {
    career_support: false,
    third_party_company_submission: false,
  };
  const seen = new Set<string>();
  for (const r of rows) {
    if (seen.has(r.consentType)) continue;
    seen.add(r.consentType);
    if (r.consentType in state) {
      state[r.consentType as ConsentType] = r.isGranted;
    }
  }
  return state;
}

// Delete the user's document data (keeps the account and the consent history).
export async function deleteMyData(): Promise<{ ok: true }> {
  const user = await requireUser();
  const db = await getDb();

  await db.delete(pdfExports).where(eq(pdfExports.userId, user.id));
  await db.delete(aiSuggestions).where(eq(aiSuggestions.userId, user.id));
  // document_versions cascade-delete when their parent documents are removed.
  await db.delete(documents).where(eq(documents.userId, user.id));
  await db.delete(educations).where(eq(educations.userId, user.id));
  await db.delete(workExperiences).where(eq(workExperiences.userId, user.id));
  await db.delete(skills).where(eq(skills.userId, user.id));
  await db.delete(certifications).where(eq(certifications.userId, user.id));
  await db.delete(jobPreferences).where(eq(jobPreferences.userId, user.id));

  // Reset the profile to an empty row (kept so the editor still has a target).
  await db
    .update(profiles)
    .set({
      fullName: null,
      fullNameKana: null,
      romajiName: null,
      birthDate: null,
      email: null,
      phone: null,
      currentAddress: null,
      contactAddress: null,
      gender: "unspecified",
      residenceStatus: null,
      residenceExpiry: null,
      workRestriction: null,
      japaneseLevel: null,
      jlpt: null,
      englishLevel: null,
      nativeLanguage: null,
      showResidenceOnResume: false,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "data.delete",
    targetId: user.id,
    metadata: {},
  });

  return { ok: true };
}

import { z } from "zod";

export const GENDERS = ["unspecified", "male", "female", "other"] as const;

// 日本語レベル（JLPTベース）と母語の選択肢
export const JAPANESE_LEVELS = [
  "N1",
  "N2",
  "N3",
  "N4",
  "N5",
  "試験前",
] as const;

export const NATIVE_LANGUAGES = [
  "ベトナム語",
  "中国語",
  "英語",
  "韓国語",
  "ネパール語",
  "インドネシア語",
  "タガログ語",
  "ミャンマー語",
  "タイ語",
  "モンゴル語",
  "ポルトガル語",
  "スペイン語",
  "日本語",
  "その他",
] as const;
export const EDU_STATUSES = [
  "graduated",
  "expected",
  "enrolled",
  "withdrawn",
] as const;

// Lenient string: trims, never required. Autosave must always succeed even on
// partially filled forms, so the form schema validates shape, not completeness.
const str = () => z.string().trim().default("");

export const educationSchema = z.object({
  id: z.string().optional(),
  schoolName: str(),
  schoolNameJa: str(),
  country: str(),
  faculty: str(),
  degree: str(),
  startDate: str(), // YYYY-MM
  endDate: str(), // YYYY-MM
  status: z.enum(EDU_STATUSES).or(z.literal("")).default(""),
});

export const resumeFormSchema = z.object({
  // Step 1 — basic info
  fullName: str(),
  fullNameKana: str(),
  romajiName: str(),
  birthDate: str(), // YYYY-MM-DD
  email: str(),
  phone: str(),
  currentAddress: str(),
  contactAddress: str(),
  gender: z.enum(GENDERS).default("unspecified"),
  photoUrl: str(), // data URL of the face photo (optional)
  // Step 2 — working in Japan
  residenceStatus: str(),
  residenceExpiry: str(), // YYYY-MM-DD
  workRestriction: str(),
  japaneseLevel: str(),
  jlpt: str(),
  englishLevel: str(),
  nativeLanguage: str(),
  showResidenceOnResume: z.boolean().default(false),
  // Step 3 — education
  educations: z.array(educationSchema).default([]),
});

export type ResumeFormValues = z.infer<typeof resumeFormSchema>;
export type EducationValues = z.infer<typeof educationSchema>;

export const EMPTY_RESUME: ResumeFormValues = {
  fullName: "",
  fullNameKana: "",
  romajiName: "",
  birthDate: "",
  email: "",
  phone: "",
  currentAddress: "",
  contactAddress: "",
  gender: "unspecified",
  photoUrl: "",
  residenceStatus: "",
  residenceExpiry: "",
  workRestriction: "",
  japaneseLevel: "",
  jlpt: "",
  englishLevel: "",
  nativeLanguage: "",
  showResidenceOnResume: false,
  educations: [],
};

// Required fields for a "complete" resume. Used for the completion score and the
// pre-PDF warning. Labels map to Editor message keys.
export const REQUIRED_RESUME_FIELDS = [
  "fullName",
  "fullNameKana",
  "birthDate",
  "email",
  "phone",
  "currentAddress",
  "japaneseLevel",
  "nativeLanguage",
] as const;

export type RequiredResumeField =
  | (typeof REQUIRED_RESUME_FIELDS)[number]
  | "education";

export function missingRequiredResume(
  v: ResumeFormValues,
): RequiredResumeField[] {
  const missing: RequiredResumeField[] = [];
  for (const key of REQUIRED_RESUME_FIELDS) {
    if (!v[key] || v[key].trim() === "") missing.push(key);
  }
  if (!v.educations.some((e) => e.schoolName.trim() !== "")) {
    missing.push("education");
  }
  return missing;
}

export function computeResumeCompletion(v: ResumeFormValues): number {
  const total = REQUIRED_RESUME_FIELDS.length + 1; // +1 for education
  const missing = missingRequiredResume(v).length;
  return Math.round(((total - missing) / total) * 100);
}

export function isValidEmail(email: string): boolean {
  if (!email) return true;
  return z.string().email().safeParse(email).success;
}

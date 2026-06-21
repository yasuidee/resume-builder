import { z } from "zod";

const str = () => z.string().trim().default("");

export const EMPLOYMENT_TYPES = [
  "fulltime",
  "contract",
  "parttime",
  "dispatch",
  "intern",
  "other",
] as const;

export const workSchema = z.object({
  id: z.string().optional(),
  companyName: str(),
  companyNameJa: str(),
  country: str(),
  department: str(),
  position: str(),
  employmentType: str(),
  startDate: str(), // YYYY-MM
  endDate: str(), // YYYY-MM
  isCurrent: z.boolean().default(false),
  description: str(),
  achievements: str(),
  tools: str(),
});
export type WorkValues = z.infer<typeof workSchema>;

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: str(),
  issuer: str(),
  acquiredDate: str(), // YYYY-MM
});
export type CertificationValues = z.infer<typeof certificationSchema>;

export const prAnswersSchema = z.object({
  praised: str(),
  hardWork: str(),
  wantToDo: str(),
  teamwork: str(),
  numbers: str(),
});
export type PrAnswersValues = z.infer<typeof prAnswersSchema>;

export const cvFormSchema = z.object({
  works: z.array(workSchema).default([]),
  skillsText: str(), // comma / newline separated tags
  certifications: z.array(certificationSchema).default([]),
  desiredJob: str(),
  desiredLocation: str(),
  desiredEmploymentType: str(),
  availableFrom: str(),
  prAnswers: prAnswersSchema.default({
    praised: "",
    hardWork: "",
    wantToDo: "",
    teamwork: "",
    numbers: "",
  }),
  careerSummary: str(),
  selfPr: str(),
  motivation: str(),
});
export type CvFormValues = z.infer<typeof cvFormSchema>;

export const EMPTY_CV: CvFormValues = {
  works: [],
  skillsText: "",
  certifications: [],
  desiredJob: "",
  desiredLocation: "",
  desiredEmploymentType: "",
  availableFrom: "",
  prAnswers: {
    praised: "",
    hardWork: "",
    wantToDo: "",
    teamwork: "",
    numbers: "",
  },
  careerSummary: "",
  selfPr: "",
  motivation: "",
};

export function parseSkills(text: string): string[] {
  return text
    .split(/[,、\n]/)
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

export function computeCvCompletion(v: CvFormValues): number {
  const checks: boolean[] = [
    v.works.some((w) => w.companyName.trim() !== ""),
    v.desiredJob.trim() !== "",
    parseSkills(v.skillsText).length > 0,
    v.careerSummary.trim() !== "" || v.selfPr.trim() !== "",
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function missingRequiredCv(v: CvFormValues): string[] {
  const missing: string[] = [];
  if (!v.works.some((w) => w.companyName.trim() !== "")) missing.push("work");
  if (v.desiredJob.trim() === "") missing.push("desiredJob");
  return missing;
}

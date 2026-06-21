import type { AIResult, ConsistencyResult, Tone } from "./schemas";

export type Locale = "ja" | "en" | "zh-Hans" | "zh-Hant" | "vi";

export interface ImproveContext {
  fieldLabel: string;
  documentType: "resume" | "cv";
}

// Minimal, serializable inputs the provider is allowed to use. These are the
// ONLY facts a provider may draw on — there is no hidden knowledge source.
export interface ProfileFacts {
  fullName?: string;
  japaneseLevel?: string;
  nativeLanguage?: string;
  desiredJob?: string;
}

export interface ExperienceFact {
  companyName?: string;
  position?: string;
  description?: string;
  achievements?: string;
  tools?: string;
}

export interface PrAnswers {
  praised?: string; // 仕事でほめられたこと
  hardWork?: string; // 前職で一番がんばったこと
  wantToDo?: string; // 日本でしたい仕事
  teamwork?: string; // チーム作業の好み
  numbers?: string; // 数字で言える実績
}

export interface ConsistencyInput {
  facts: Record<string, string>;
}

export interface AIProvider {
  improveJapaneseText(input: string, context: ImproveContext): Promise<AIResult>;
  translateToJapanese(input: string, sourceLanguage: Locale): Promise<AIResult>;
  generateSelfPR(
    profile: ProfileFacts,
    experiences: ExperienceFact[],
    answers: PrAnswers,
    tone: Tone,
  ): Promise<AIResult>;
  generateMotivation(
    profile: ProfileFacts,
    targetJob: string,
    targetCompany: string,
    answers: PrAnswers,
    tone: Tone,
  ): Promise<AIResult>;
  summarizeCareer(
    experiences: ExperienceFact[],
    skills: string[],
  ): Promise<AIResult>;
  checkDocumentConsistency(input: ConsistencyInput): Promise<ConsistencyResult>;
}

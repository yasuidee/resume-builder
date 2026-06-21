import Anthropic from "@anthropic-ai/sdk";
import type {
  AIProvider,
  ConsistencyInput,
  ExperienceFact,
  ImproveContext,
  Locale,
  PrAnswers,
  ProfileFacts,
} from "./provider";
import {
  aiResultSchema,
  consistencyResultSchema,
  type AIResult,
  type ConsistencyResult,
  type Tone,
} from "./schemas";

// Model is fixed to the latest, most capable Claude model. The same
// anti-fabrication contract as the mock is enforced two ways: a strict system
// prompt, and structured outputs that force the AIResult shape.
const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `あなたは在日外国人の履歴書・職務経歴書づくりを助けるアシスタントです。
最重要ルール（必ず守る）:
- 出力の "text" は、ユーザーが実際に入力した事実（usedFacts に列挙したもの）だけで構成する。
- ユーザーが入力していない経験・資格・実績・固有名詞を絶対に作らない（捏造禁止）。
- 情報が足りないときは創作せず、"clarifyingQuestions" に日本語で質問を入れる。
- "text" は日本企業へ提出できる自然で丁寧な日本語にする。
- 在留資格や法律についての断定的な助言はしない。差別的な情報を求めない。`;

const AI_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: { type: "string" },
    usedFacts: { type: "array", items: { type: "string" } },
    clarifyingQuestions: { type: "array", items: { type: "string" } },
    confidence: { type: "string", enum: ["low", "mid", "high"] },
  },
  required: ["text", "usedFacts", "clarifyingQuestions", "confidence"],
} as const;

const CONSISTENCY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          field: { type: "string" },
          severity: { type: "string", enum: ["info", "warning"] },
          message: { type: "string" },
        },
        required: ["field", "severity", "message"],
      },
    },
    checkedFacts: { type: "array", items: { type: "string" } },
  },
  required: ["issues", "checkedFacts"],
} as const;

function factLines(record: Record<string, string | undefined>): string {
  return Object.entries(record)
    .filter(([, v]) => v && v.trim() !== "")
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
}

export function createRealAIProvider(): AIProvider {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const client = new Anthropic();

  async function generate(
    userPrompt: string,
    schema: Record<string, unknown> = AI_RESULT_SCHEMA as Record<
      string,
      unknown
    >,
    effort: "low" | "medium" = "low",
  ): Promise<unknown> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema }, effort },
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("No text content in AI response");
    }
    return JSON.parse(block.text);
  }

  async function generateResult(
    userPrompt: string,
    effort: "low" | "medium" = "low",
  ): Promise<AIResult> {
    return aiResultSchema.parse(
      await generate(
        userPrompt,
        AI_RESULT_SCHEMA as Record<string, unknown>,
        effort,
      ),
    );
  }

  return {
    async improveJapaneseText(
      input: string,
      context: ImproveContext,
    ): Promise<AIResult> {
      return generateResult(
        `次の文章を、${context.documentType === "cv" ? "職務経歴書" : "履歴書"}の「${context.fieldLabel}」欄向けに、意味を変えずに自然な日本語へ整えてください。新しい事実は足さないこと。\n\n文章:\n${input}`,
      );
    },

    async translateToJapanese(
      input: string,
      sourceLanguage: Locale,
    ): Promise<AIResult> {
      return generateResult(
        `次の文章（${sourceLanguage}）を自然な日本語に翻訳してください。内容を足したり省いたりしないこと。\n\n文章:\n${input}`,
      );
    },

    async generateSelfPR(
      profile: ProfileFacts,
      experiences: ExperienceFact[],
      answers: PrAnswers,
      tone: Tone,
    ): Promise<AIResult> {
      const exp = experiences
        .map(
          (e, i) =>
            `  ${i + 1}. ${factLines({
              会社名: e.companyName,
              役職: e.position,
              業務内容: e.description,
              実績: e.achievements,
            }).replace(/\n/g, " ")}`,
        )
        .join("\n");
      return generateResult(
        `次の入力だけを使って自己PRを作成してください。トーン: ${tone}。\n` +
          `プロフィール:\n${factLines({ 氏名: profile.fullName, 日本語レベル: profile.japaneseLevel, 母語: profile.nativeLanguage })}\n` +
          `回答:\n${factLines({ ほめられたこと: answers.praised, がんばったこと: answers.hardWork, 数字の実績: answers.numbers, チーム: answers.teamwork })}\n` +
          `職歴:\n${exp || "（なし）"}`,
        "medium",
      );
    },

    async generateMotivation(
      profile: ProfileFacts,
      targetJob: string,
      targetCompany: string,
      answers: PrAnswers,
      tone: Tone,
    ): Promise<AIResult> {
      return generateResult(
        `次の入力だけを使って志望動機を作成してください。トーン: ${tone}。\n` +
          factLines({
            応募職種: targetJob,
            応募先企業: targetCompany,
            日本でしたい仕事: answers.wantToDo,
            日本語レベル: profile.japaneseLevel,
          }),
        "medium",
      );
    },

    async summarizeCareer(
      experiences: ExperienceFact[],
      skills: string[],
    ): Promise<AIResult> {
      const exp = experiences
        .map(
          (e, i) =>
            `  ${i + 1}. ${factLines({
              会社名: e.companyName,
              役職: e.position,
              業務内容: e.description,
            }).replace(/\n/g, " ")}`,
        )
        .join("\n");
      return generateResult(
        `次の入力だけを使って職務要約を作成してください。\n職歴:\n${exp || "（なし）"}\nスキル: ${skills.join("、") || "（なし）"}`,
        "medium",
      );
    },

    async checkDocumentConsistency(
      input: ConsistencyInput,
    ): Promise<ConsistencyResult> {
      const parsed = consistencyResultSchema.parse(
        await generate(
          `次の項目に矛盾や不自然な点がないか確認し、見つかった点を issues に日本語で入れてください。問題がなければ issues は空配列。\n${factLines(input.facts)}`,
          CONSISTENCY_SCHEMA as Record<string, unknown>,
        ),
      );
      return parsed;
    },
  };
}

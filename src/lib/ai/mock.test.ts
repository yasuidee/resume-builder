import { describe, it, expect } from "vitest";
import { MockAIProvider } from "./mock";
import type { ExperienceFact, ProfileFacts, PrAnswers } from "./provider";

const ai = new MockAIProvider();

const emptyAnswers: PrAnswers = {};

describe("MockAIProvider — anti-fabrication contract", () => {
  it("returns clarifying questions and no facts when input is empty", async () => {
    const result = await ai.generateSelfPR({}, [], emptyAnswers, "standard");
    expect(result.clarifyingQuestions.length).toBeGreaterThanOrEqual(1);
    expect(result.usedFacts).toHaveLength(0);
  });

  it("never references facts that were not provided (usedFacts ⊆ inputs)", async () => {
    const profile: ProfileFacts = { japaneseLevel: "ビジネスレベル" };
    const experiences: ExperienceFact[] = [
      { companyName: "ABC商事", achievements: "売上を20%向上" },
    ];
    const answers: PrAnswers = {
      praised: "粘り強さ",
      numbers: "コスト10%削減",
    };
    const provided = new Set([
      "ビジネスレベル",
      "ABC商事",
      "売上を20%向上",
      "粘り強さ",
      "コスト10%削減",
    ]);

    const result = await ai.generateSelfPR(
      profile,
      experiences,
      answers,
      "standard",
    );
    for (const f of result.usedFacts) {
      expect(provided.has(f)).toBe(true);
    }
  });

  it("does not invent proper nouns (e.g. schools/certs) absent from input", async () => {
    const result = await ai.generateSelfPR(
      { japaneseLevel: "日常会話" },
      [{ companyName: "山田製作所" }],
      { praised: "丁寧さ" },
      "polite",
    );
    // Fabrications that were never provided must not appear.
    for (const fake of ["東京大学", "TOEIC", "簿記2級", "Google"]) {
      expect(result.text).not.toContain(fake);
    }
  });

  it("self-PR text only contains provided facts as its proper-noun content", async () => {
    const experiences: ExperienceFact[] = [
      { companyName: "ベトナムソフト", achievements: "新機能を3つ開発" },
    ];
    const result = await ai.generateSelfPR(
      {},
      experiences,
      { hardWork: "品質改善", numbers: "不具合を半減" },
      "standard",
    );
    // Every used fact appears in the produced text.
    for (const f of result.usedFacts) {
      expect(result.text).toContain(f);
    }
  });

  it("improveJapaneseText preserves the input and adds no new facts", async () => {
    const input = "私は チームで 開発を 担当しました";
    const result = await ai.improveJapaneseText(input, {
      fieldLabel: "業務内容",
      documentType: "cv",
    });
    expect(result.usedFacts).toEqual([input]);
    expect(result.text).toContain("開発を");
    expect(result.text).not.toContain("リーダー"); // not in the input
  });

  it("empty improve input yields a clarifying question", async () => {
    const result = await ai.improveJapaneseText("", {
      fieldLabel: "業務内容",
      documentType: "cv",
    });
    expect(result.clarifyingQuestions.length).toBeGreaterThanOrEqual(1);
    expect(result.text).toBe("");
  });

  it("consistency check flags a past residence expiry", async () => {
    const result = await ai.checkDocumentConsistency({
      facts: { residenceExpiry: "2000-01-01", email: "ok@example.com" },
    });
    expect(result.issues.some((i) => i.field === "residenceExpiry")).toBe(true);
  });

  it("consistency check flags a malformed email", async () => {
    const result = await ai.checkDocumentConsistency({
      facts: { email: "not-an-email" },
    });
    expect(result.issues.some((i) => i.field === "email")).toBe(true);
  });
});

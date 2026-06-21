import type {
  AIProvider,
  ConsistencyInput,
  ExperienceFact,
  ImproveContext,
  Locale,
  PrAnswers,
  ProfileFacts,
} from "./provider";
import type { AIResult, ConsistencyResult, Tone } from "./schemas";

// Collect labelled, non-empty facts. The output may ONLY reference values that
// pass through here, which is what guarantees the mock never fabricates.
function fact(value: string | undefined | null): string | null {
  if (!value) return null;
  const v = value.trim();
  return v === "" ? null : v;
}

function toneSuffix(tone: Tone): string {
  switch (tone) {
    case "short":
      return "";
    case "polite":
      return "どうぞよろしくお願いいたします。";
    case "n2":
      return "これからも がんばりたいと思います。";
    case "n1":
      return "今後も研鑽を重ねてまいります。";
    case "standard":
    default:
      return "よろしくお願いいたします。";
  }
}

const lowResult = (questions: string[], text = ""): AIResult => ({
  text,
  usedFacts: [],
  clarifyingQuestions: questions,
  confidence: "low",
});

export class MockAIProvider implements AIProvider {
  async improveJapaneseText(
    input: string,
    _context: ImproveContext,
  ): Promise<AIResult> {
    void _context;
    const f = fact(input);
    if (!f) {
      return lowResult(["整えたい文章を入力してください。"]);
    }
    // Light, fact-preserving normalization only — no new facts introduced.
    let text = f.replace(/\s+/g, " ").replace(/。。+/g, "。");
    if (!/[。.!?！？]$/.test(text)) text += "。";
    return {
      text,
      usedFacts: [f],
      clarifyingQuestions: [],
      confidence: "mid",
    };
  }

  async translateToJapanese(
    input: string,
    sourceLanguage: Locale,
  ): Promise<AIResult> {
    const f = fact(input);
    if (!f) {
      return lowResult(["日本語にしたい文章を入力してください。"]);
    }
    // The mock cannot truly translate; it echoes the source and asks for a
    // human check rather than inventing a translation.
    return {
      text: f,
      usedFacts: [f],
      clarifyingQuestions: [
        `この内容（${sourceLanguage}）の日本語訳で間違いがないか確認してください。`,
      ],
      confidence: "low",
    };
  }

  async generateSelfPR(
    profile: ProfileFacts,
    experiences: ExperienceFact[],
    answers: PrAnswers,
    tone: Tone,
  ): Promise<AIResult> {
    // Collect a fact into `used` only when its sentence is actually emitted, so
    // usedFacts and text never drift apart.
    const used: string[] = [];
    const parts: string[] = [];

    const hardWork = fact(answers.hardWork);
    if (hardWork) {
      parts.push(`これまで${hardWork}に力を入れてきました。`);
      used.push(hardWork);
    }
    const praised = fact(answers.praised);
    if (praised) {
      parts.push(`周囲からは${praised}と評価されました。`);
      used.push(praised);
    }
    const numbers = fact(answers.numbers);
    if (numbers) {
      parts.push(`具体的な成果として、${numbers}があります。`);
      used.push(numbers);
    }
    for (const e of experiences) {
      const c = fact(e.companyName);
      const a = fact(e.achievements);
      if (c && a) {
        parts.push(`${c}では${a}を達成しました。`);
        used.push(c, a);
      } else if (a) {
        parts.push(`${a}という成果があります。`);
        used.push(a);
      } else if (c) {
        parts.push(`${c}での経験を活かせます。`);
        used.push(c);
      }
    }
    const teamwork = fact(answers.teamwork);
    if (teamwork) {
      parts.push(`チームでの仕事では${teamwork}を大切にしています。`);
      used.push(teamwork);
    }
    const jp = fact(profile.japaneseLevel);
    if (jp) {
      parts.push(`日本語は${jp}で、業務でも活用できます。`);
      used.push(jp);
    }

    const questions: string[] = [];
    if (!praised) questions.push("仕事でほめられたことを教えてください。");
    if (!numbers)
      questions.push("数字で言える実績があれば、1つ教えてください。");
    if (experiences.length === 0)
      questions.push("これまでの職歴を入力すると、より具体的になります。");

    if (used.length === 0) {
      return lowResult(
        questions.length > 0
          ? questions
          : ["自己PRのもとになる経験を入力してください。"],
        "これまでの経験を活かし、誠実に業務へ取り組みます。",
      );
    }

    parts.push(toneSuffix(tone));
    return {
      text: parts.filter(Boolean).join(""),
      usedFacts: used,
      clarifyingQuestions: questions,
      confidence: questions.length === 0 ? "high" : "mid",
    };
  }

  async generateMotivation(
    profile: ProfileFacts,
    targetJob: string,
    targetCompany: string,
    answers: PrAnswers,
    tone: Tone,
  ): Promise<AIResult> {
    const job = fact(targetJob);
    const company = fact(targetCompany);
    const wantToDo = fact(answers.wantToDo);
    const jp = fact(profile.japaneseLevel);

    const questions: string[] = [];
    if (!job) questions.push("応募したい職種を入力してください。");
    if (!wantToDo)
      questions.push("日本でやってみたい仕事を教えてください。");

    if (!job && !wantToDo) {
      return lowResult(questions, "貴社で長く貢献したいと考えています。");
    }

    const used: string[] = [];
    const parts: string[] = [];
    if (company && job) {
      parts.push(`${company}の${job}の仕事に魅力を感じ、応募しました。`);
      used.push(company, job);
    } else if (job) {
      parts.push(`${job}の仕事に挑戦したいと考えています。`);
      used.push(job);
    }
    if (wantToDo) {
      parts.push(`日本では${wantToDo}に取り組みたいです。`);
      used.push(wantToDo);
    }
    if (jp) {
      parts.push(`日本語（${jp}）を活かして貢献します。`);
      used.push(jp);
    }
    parts.push(toneSuffix(tone));

    return {
      text: parts.filter(Boolean).join(""),
      usedFacts: used,
      clarifyingQuestions: questions,
      confidence: job && wantToDo ? "high" : "mid",
    };
  }

  async summarizeCareer(
    experiences: ExperienceFact[],
    skills: string[],
  ): Promise<AIResult> {
    const used: string[] = [];
    const companies: string[] = [];
    for (const e of experiences) {
      const c = fact(e.companyName);
      const p = fact(e.position);
      if (c) {
        used.push(c);
        companies.push(p ? `${c}（${p}）` : c);
      }
    }
    const skillFacts = skills.map(fact).filter((s): s is string => !!s);
    used.push(...skillFacts);

    if (used.length === 0) {
      return lowResult(
        ["職歴を入力すると、職務要約を作成できます。"],
        "これまでの実務経験を、貴社の業務に活かします。",
      );
    }

    const parts: string[] = [];
    if (companies.length > 0)
      parts.push(`${companies.join("、")}での実務経験があります。`);
    if (skillFacts.length > 0)
      parts.push(`得意分野は${skillFacts.join("、")}です。`);

    return {
      text: parts.join(""),
      usedFacts: used,
      clarifyingQuestions:
        experiences.length < 1
          ? ["職歴をもう少しくわしく入力すると精度が上がります。"]
          : [],
      confidence: "mid",
    };
  }

  async checkDocumentConsistency(
    input: ConsistencyInput,
  ): Promise<ConsistencyResult> {
    const f = input.facts;
    const checked = Object.keys(f).filter((k) => fact(f[k]));
    const issues: ConsistencyResult["issues"] = [];

    // Deterministic, fact-based checks only.
    const birth = f.birthDate ? new Date(f.birthDate) : null;
    const eduStart = f.firstEducationStart
      ? new Date(`${f.firstEducationStart}-01`)
      : null;
    if (birth && eduStart && eduStart < birth) {
      issues.push({
        field: "education",
        severity: "warning",
        message: "学歴の入学年月が生年月日より前になっています。",
      });
    }

    if (f.residenceExpiry) {
      const exp = new Date(f.residenceExpiry);
      if (!Number.isNaN(exp.getTime()) && exp < new Date()) {
        issues.push({
          field: "residenceExpiry",
          severity: "warning",
          message: "在留期限が過去の日付になっています。最新の情報か確認してください。",
        });
      }
    }

    if (fact(f.email) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) {
      issues.push({
        field: "email",
        severity: "warning",
        message: "メールアドレスの形式が正しくないようです。",
      });
    }

    return { issues, checkedFacts: checked };
  }
}

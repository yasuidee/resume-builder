import { z } from "zod";

// Tone options offered to the user when generating text.
export const TONES = ["short", "standard", "polite", "n2", "n1"] as const;
export type Tone = (typeof TONES)[number];

export const confidenceSchema = z.enum(["low", "mid", "high"]);
export type Confidence = z.infer<typeof confidenceSchema>;

/**
 * The single output contract for all generative AI calls. The anti-fabrication
 * rule is encoded structurally:
 *  - `text` must be composed ONLY from facts the user actually entered.
 *  - `usedFacts` enumerates exactly those input facts the text relied on.
 *  - When information is missing, the model must NOT invent it — it asks via
 *    `clarifyingQuestions` instead.
 */
export const aiResultSchema = z.object({
  text: z.string(),
  usedFacts: z.array(z.string()),
  clarifyingQuestions: z.array(z.string()),
  confidence: confidenceSchema,
});
export type AIResult = z.infer<typeof aiResultSchema>;

export const consistencyIssueSchema = z.object({
  field: z.string(),
  severity: z.enum(["info", "warning"]),
  message: z.string(),
});
export type ConsistencyIssue = z.infer<typeof consistencyIssueSchema>;

export const consistencyResultSchema = z.object({
  issues: z.array(consistencyIssueSchema),
  checkedFacts: z.array(z.string()),
});
export type ConsistencyResult = z.infer<typeof consistencyResultSchema>;

import type { AIProvider } from "./provider";

// Placeholder for a real LLM-backed provider (e.g. Claude). Implement the same
// AIProvider interface here and switch via getAIProvider(). It MUST honor the
// same anti-fabrication contract: build `text` only from supplied facts and put
// anything missing into `clarifyingQuestions` rather than inventing it.
export function createRealAIProvider(): AIProvider {
  throw new Error(
    "Real AI provider is not implemented yet. Set AI_PROVIDER=mock (default) for local development.",
  );
}

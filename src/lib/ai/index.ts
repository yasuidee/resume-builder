import type { AIProvider } from "./provider";
import { MockAIProvider } from "./mock";

let cached: AIProvider | null = null;

// Returns the configured AI provider. Defaults to the offline MockAIProvider so
// the app runs locally with no API keys. Set AI_PROVIDER=real to opt in later.
export function getAIProvider(): AIProvider {
  if (cached) return cached;
  if (process.env.AI_PROVIDER === "real") {
    // Lazy import so the unimplemented real provider never loads by default.
    const { createRealAIProvider } =
      require("./real") as typeof import("./real");
    cached = createRealAIProvider();
  } else {
    cached = new MockAIProvider();
  }
  return cached;
}

export type { AIProvider } from "./provider";
export * from "./schemas";

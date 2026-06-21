import type { AIProvider } from "./provider";
import { MockAIProvider } from "./mock";

let cached: AIProvider | null = null;

// Returns the configured AI provider. Defaults to the offline MockAIProvider so
// the app runs locally with no API keys. Set AI_PROVIDER=real to opt in later.
export function getAIProvider(): AIProvider {
  if (cached) return cached;
  if (process.env.AI_PROVIDER === "real") {
    try {
      // Lazy import so the Anthropic SDK never loads unless explicitly enabled.
      const { createRealAIProvider } =
        require("./real") as typeof import("./real");
      cached = createRealAIProvider();
    } catch (err) {
      // Never break the app if the real provider can't initialize (e.g. no key).
      console.warn(
        "[ai] real provider unavailable, falling back to mock:",
        err instanceof Error ? err.message : err,
      );
      cached = new MockAIProvider();
    }
  } else {
    cached = new MockAIProvider();
  }
  return cached;
}

export type { AIProvider } from "./provider";
export * from "./schemas";

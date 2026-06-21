import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests only — Playwright E2E specs live in /e2e and run separately.
    include: ["src/**/*.test.ts"],
  },
});

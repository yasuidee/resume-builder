import { defineConfig } from "@playwright/test";

const PORT = 3201;

// E2E runs against a dedicated dev server with an isolated PGlite database so
// state assertions (e.g. "admin is empty initially") are deterministic.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Default to Japanese so locale detection serves the ja UI (the default
    // experience). The i18n test explicitly switches the language afterward.
    locale: "ja-JP",
  },
  webServer: {
    // Run against a production build for fast, deterministic page loads.
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: { PGLITE_DATA_DIR: ".pglite-e2e" },
  },
});

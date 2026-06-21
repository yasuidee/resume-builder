import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` produces SQL from the schema and never needs a live DB.
// For local development the runtime uses PGlite (see src/db/index.ts); a real
// PostgreSQL can be targeted by setting DATABASE_URL.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pglite",
  dbCredentials: {
    url: process.env.PGLITE_DATA_DIR ?? "./.pglite",
  },
});

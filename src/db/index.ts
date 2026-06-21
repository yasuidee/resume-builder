import "server-only";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import { ensureSeed } from "./seed";

// A single Drizzle client type covers both backends.
export type Db = ReturnType<typeof drizzlePglite<typeof schema>>;

const MIGRATIONS_FOLDER = "./drizzle";

// Cache across HMR reloads so PGlite's data directory is only opened once
// per process (it holds an exclusive lock).
const globalForDb = globalThis as unknown as {
  __dbPromise?: Promise<Db>;
};

async function init(): Promise<Db> {
  const dataDir = process.env.PGLITE_DATA_DIR ?? "./.pglite";
  const client = new PGlite(dataDir);
  const db = drizzlePglite(client, { schema });

  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  await ensureSeed(db);
  return db;
}

export function getDb(): Promise<Db> {
  if (!globalForDb.__dbPromise) {
    globalForDb.__dbPromise = init();
  }
  return globalForDb.__dbPromise;
}

export { schema };

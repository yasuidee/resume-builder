import "server-only";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import { ensureSeed } from "./seed";

// A single Drizzle client type covers both backends (the query API is identical).
export type Db = ReturnType<typeof drizzlePglite<typeof schema>>;

const MIGRATIONS_FOLDER = "./drizzle";

// Cache across HMR reloads so PGlite's data directory is only opened once
// per process (it holds an exclusive lock).
const globalForDb = globalThis as unknown as {
  __dbPromise?: Promise<Db>;
};

async function initPglite(): Promise<Db> {
  const dataDir = process.env.PGLITE_DATA_DIR ?? "./.pglite";
  const client = new PGlite(dataDir);
  const db = drizzlePglite(client, { schema });
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  await ensureSeed(db);
  return db;
}

async function initPostgres(url: string): Promise<Db> {
  // Real PostgreSQL path — used when DATABASE_URL is set.
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const postgres = (await import("postgres")).default;
  // prepare:false keeps it compatible with pooled connections (e.g. Neon /
  // Vercel Postgres via PgBouncer in transaction mode).
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { schema }) as unknown as Db;
  await migrate(db as never, { migrationsFolder: MIGRATIONS_FOLDER });
  await ensureSeed(db);
  return db;
}

async function init(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  return url ? initPostgres(url) : initPglite();
}

export function getDb(): Promise<Db> {
  if (!globalForDb.__dbPromise) {
    globalForDb.__dbPromise = init();
  }
  return globalForDb.__dbPromise;
}

export { schema };

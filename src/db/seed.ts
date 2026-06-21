import { eq } from "drizzle-orm";
import type { Db } from "./index";
import { users, profiles } from "./schema";

// Fixed development user returned by the auth stub (Phases 0–2).
export const SEED_USER_ID = "00000000-0000-0000-0000-000000000001";
export const SEED_USER_EMAIL = "demo@example.com";

// Idempotently ensure the seed user (and an empty profile) exist.
export async function ensureSeed(db: Db): Promise<void> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, SEED_USER_ID))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(users).values({
      id: SEED_USER_ID,
      email: SEED_USER_EMAIL,
      displayName: "デモ ユーザー",
      // admin so the Phase 3 admin screen is reachable in local dev
      role: "admin",
      locale: "ja",
    });
  }

  const profile = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, SEED_USER_ID))
    .limit(1);

  if (profile.length === 0) {
    await db.insert(profiles).values({ userId: SEED_USER_ID });
  }
}

import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, type User } from "@/db/schema";
import { SEED_USER_ID } from "@/db/seed";

/**
 * Auth boundary. Phases 0–2 use a fixed seed user; Phase 3 swaps the body of
 * `getCurrentUser` for Supabase Auth without changing any call sites.
 */
export async function getCurrentUser(): Promise<User | null> {
  const db = await getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, SEED_USER_ID))
    .limit(1);
  return user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

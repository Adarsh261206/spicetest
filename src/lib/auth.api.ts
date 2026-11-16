import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

/**
 * Auth server functions. All server-only modules are imported lazily inside
 * handlers so route files (client+server) can safely import these fns.
 */

async function srv() {
  const [{ getDb }, schema, crypto, nodeCrypto, cookies] = await Promise.all([
    import("./db.server"),
    import("./schema"),
    import("./crypto"),
    import("node:crypto"),
    import("@tanstack/react-start/server"),
  ]);
  return { getDb, ...schema, ...crypto, ...nodeCrypto, ...cookies };
}

const COOKIE = "admin_session";
const SESSION_DAYS = 7;

/* Brute-force guard: max 8 failed logins per email per 10 minutes (per server instance). */
const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; first: number }>();

function attemptKey(email: string): string {
  return email.trim().toLowerCase();
}

function isRateLimited(email: string): boolean {
  const rec = attempts.get(attemptKey(email));
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    attempts.delete(attemptKey(email));
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(email: string): void {
  const key = attemptKey(email);
  const rec = attempts.get(key);
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: Date.now() });
  } else {
    rec.count += 1;
  }
}

function clearAttempts(email: string): void {
  attempts.delete(attemptKey(email));
}

export type AdminUser = { id: string; email: string };

async function userFromToken(token: string | undefined): Promise<AdminUser | null> {
  if (!token) return null;
  const { getDb, users, sessions, createHash } = await srv();
  const { drizzle } = await getDb();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const rows = await drizzle
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);
  const row = rows[0] as { user: AdminUser; session: { expiresAt: string } } | undefined;
  if (!row) return null;
  if (new Date(row.session.expiresAt).getTime() < Date.now()) {
    await drizzle.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    return null;
  }
  return { id: row.user.id, email: row.user.email };
}

export async function requireAdmin(): Promise<AdminUser> {
  const { getCookie } = await srv();
  const token = getCookie(COOKIE);
  const user = await userFromToken(token);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export const meFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getCookie } = await srv();
    const token = getCookie(COOKIE);
    const user = await userFromToken(token);
    return user;
  } catch (e) {
    if ((e as Error)?.name === "DbNotConfigured") return { dbMissing: true as const };
    throw e;
  }
});

export const loginFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { email: string; password: string })
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!email || !data.password) throw new Error("INVALID_CREDENTIALS");
    if (isRateLimited(email)) throw new Error("RATE_LIMITED");
    const {
      getDb,
      users,
      sessions,
      verifyPassword,
      hashPassword,
      newSalt,
      createHash,
      randomBytes,
      randomUUID,
      setCookie,
    } = await srv();
    try {
      const { drizzle } = await getDb();
      const found = await drizzle.select().from(users).where(eq(users.email, email)).limit(1);
      let user = found[0] as
        { id: string; email: string; passSalt: string; passHash: string } | undefined;
      // Vercel env credentials double as a first-login bootstrap / password
      // recovery path for the single admin account.
      const envEmail = (process.env["ADMIN_EMAIL"] ?? "").trim().toLowerCase();
      const envPassword = process.env["ADMIN_PASSWORD"] ?? "";
      const envMatch = Boolean(
        envEmail && envPassword && email === envEmail && data.password === envPassword,
      );
      if (!user) {
        if (!envMatch) {
          recordFailure(email);
          throw new Error("INVALID_CREDENTIALS");
        }
        const salt = newSalt();
        const id = randomUUID();
        const passHash = hashPassword(envPassword, salt);
        await drizzle
          .insert(users)
          .values({ id, email, passHash, passSalt: salt, createdAt: new Date().toISOString() });
        user = { id, email, passSalt: salt, passHash };
      } else if (!verifyPassword(data.password, user.passSalt, user.passHash)) {
        if (!envMatch) {
          recordFailure(email);
          throw new Error("INVALID_CREDENTIALS");
        }
        const salt = newSalt();
        const passHash = hashPassword(envPassword, salt);
        await drizzle.update(users).set({ passHash, passSalt: salt }).where(eq(users.email, email));
        user = { ...user, passSalt: salt, passHash };
      }
      clearAttempts(email);
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
      await drizzle.insert(sessions).values({
        tokenHash: createHash("sha256").update(token).digest("hex"),
        userId: user.id,
        expiresAt,
      });
      setCookie(COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env["NODE_ENV"] === "production",
        maxAge: SESSION_DAYS * 86400,
        path: "/",
      });
      return { email: user.email };
    } catch (e) {
      const error = e as Error & { code?: string };
      if (error.message === "INVALID_CREDENTIALS" || error.message === "RATE_LIMITED") throw e;
      if (error.name === "DbNotConfigured") throw new Error("DB_NOT_CONFIGURED");
      if (error.code === "42P01") throw new Error("DB_NOT_MIGRATED");
      throw e;
    }
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { getCookie, deleteCookie } = await srv();
  const token = getCookie(COOKIE);
  if (token) {
    try {
      const { getDb, sessions, createHash } = await srv();
      const { drizzle } = await getDb();
      await drizzle
        .delete(sessions)
        .where(eq(sessions.tokenHash, createHash("sha256").update(token).digest("hex")));
    } catch {
      // storage unavailable — still clear the cookie
    }
  }
  deleteCookie(COOKIE);
  return { ok: true };
});

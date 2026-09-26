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
    const { getDb, users, sessions, verifyPassword, createHash, randomBytes, setCookie } =
      await srv();
    const { drizzle } = await getDb();
    const found = await drizzle.select().from(users).where(eq(users.email, email)).limit(1);
    const user = found[0] as
      | { id: string; email: string; passSalt: string; passHash: string }
      | undefined;
    if (!user || !verifyPassword(data.password, user.passSalt, user.passHash)) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
    await drizzle
      .insert(sessions)
      .values({ tokenHash: createHash("sha256").update(token).digest("hex"), userId: user.id, expiresAt });
    setCookie(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: SESSION_DAYS * 86400,
      path: "/",
    });
    return { email: user.email };
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

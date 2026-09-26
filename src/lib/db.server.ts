import { join } from "node:path";

/**
 * Database access. Production (Neon/Supabase Postgres) when DATABASE_URL is
 * set, otherwise an embedded PGlite file DB for zero-setup local dev.
 * Server-only: import from *.server.ts modules only.
 */

type Db = {
  // drizzle instance (pg or pglite) — typed loosely to share query code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drizzle: any;
  kind: "pg" | "pglite";
  close: () => Promise<void>;
};

declare global {
  var __db: Db | undefined;
}

export class DbNotConfigured extends Error {
  constructor() {
    super(
      "DATABASE_URL is not set. Create a Postgres DB (Neon free tier works), run bun scripts/db-migrate.ts, and set DATABASE_URL.",
    );
    this.name = "DbNotConfigured";
  }
}

export async function getDb(): Promise<Db> {
  if (globalThis.__db) return globalThis.__db;

  const url = process.env["DATABASE_URL"];
  if (url) {
    const [{ Pool }, drizzleOrm] = await Promise.all([
      import("pg"),
      import("drizzle-orm/node-postgres"),
    ]);
    const pool = new Pool({ connectionString: url });
    const drizzle = drizzleOrm.drizzle(pool);
    globalThis.__db = {
      drizzle,
      kind: "pg",
      close: () => pool.end(),
    };
    return globalThis.__db;
  }

  // Local dev fallback — no setup needed.
  if (process.env["VERCEL"] || process.env["NODE_ENV"] === "production") {
    throw new DbNotConfigured();
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(join(process.cwd(), ".data"), { recursive: true });
  const client = new PGlite(join(process.cwd(), ".data", "local.db"));
  await client.waitReady;
  const drizzle = drizzlePglite(client);
  globalThis.__db = {
    drizzle,
    kind: "pglite",
    close: () => client.close(),
  };
  return globalThis.__db;
}

export async function closeDb() {
  await globalThis.__db?.close();
  globalThis.__db = undefined;
}

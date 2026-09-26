import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Applies drizzle/*.sql in order. Safe to re-run (tracks _migrations). */
async function main() {
  const dir = join(process.cwd(), "drizzle");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const usePg = Boolean(process.env.DATABASE_URL);
  let pool: {
    query: (t: string, p?: unknown[]) => Promise<{ rows: unknown[] }>;
    end: () => Promise<void>;
  } | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lite: any = null;

  if (usePg) {
    const { Pool } = await import("pg");
    pool = new Pool({ connectionString: process.env.DATABASE_URL }) as typeof pool;
  } else {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(join(process.cwd(), ".data"), { recursive: true });
    const { PGlite } = await import("@electric-sql/pglite");
    lite = new PGlite(join(process.cwd(), ".data", "local.db"));
    await lite.waitReady;
  }

  const query = async (text: string, params: unknown[] = []) => {
    if (pool) return pool.query(text, params);
    return lite.query(text, params);
  };
  const exec = async (sql: string) => {
    if (pool) {
      await pool.query(sql);
      return;
    }
    await lite.exec(sql);
  };

  await exec(
    "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)",
  );

  for (const file of files) {
    const { rows } = await query("SELECT name FROM _migrations WHERE name = $1", [file]);
    if (rows.length > 0) {
      console.log(`skip ${file} (already applied)`);
      continue;
    }
    await exec(readFileSync(join(dir, file), "utf-8"));
    await query("INSERT INTO _migrations (name, applied_at) VALUES ($1, $2)", [
      file,
      new Date().toISOString(),
    ]);
    console.log(`applied ${file} [${usePg ? "pg" : "pglite"}]`);
  }

  if (pool) await pool.end();
  else await lite.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

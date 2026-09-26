import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { eq } from "drizzle-orm";

/** Direct layer test: auth crypto + drizzle queries against a temp PGlite DB. */
async function main() {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const lite = new PGlite();
  await lite.waitReady;
  const db = drizzle(lite);
  const { users, sessions, posts } = await import("../src/lib/schema");
  const { hashPassword, newSalt, verifyPassword } = await import("../src/lib/crypto");

  const sql = readFileSync(join(process.cwd(), "drizzle", "0001_init.sql"), "utf-8");
  await lite.exec(sql);

  // users + password
  const salt = newSalt();
  const email = "admin@test.com";
  await db.insert(users).values({
    id: randomUUID(),
    email,
    passHash: hashPassword("secret-123", salt),
    passSalt: salt,
    createdAt: new Date().toISOString(),
  });
  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const u = found[0]!;
  console.log("user insert+select:", u.email === email ? "OK" : "FAIL");
  console.log("password ok:", verifyPassword("secret-123", u.passSalt, u.passHash) ? "OK" : "FAIL");
  console.log("password wrong rejected:", !verifyPassword("nope", u.passSalt, u.passHash) ? "OK" : "FAIL");

  // sessions
  const tokenHash = createHash("sha256").update("tok").digest("hex");
  await db.insert(sessions).values({ tokenHash, userId: u.id, expiresAt: new Date(Date.now() + 1000).toISOString() });
  const s = await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)).limit(1);
  console.log("session round-trip:", s.length === 1 ? "OK" : "FAIL");
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  console.log("session delete:", (await db.select().from(sessions)).length === 0 ? "OK" : "FAIL");

  // posts CRUD + cover round-trip
  const cover = Buffer.from("fake-image-bytes").toString("base64");
  const id = randomUUID();
  await db.insert(posts).values({
    id,
    slug: "test-post",
    title: "Test Post",
    category: "Test",
    tagsJson: JSON.stringify(["a", "b"]),
    excerpt: "ex",
    coverData: cover,
    coverMime: "image/png",
    bodyJson: JSON.stringify([{ type: "paragraph", text: "hi" }]),
    status: "published",
    author: "Tester",
    readingTime: 2,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const got = (await db.select().from(posts).where(eq(posts.slug, "test-post")).limit(1))[0]!;
  console.log("post crud:", got.title === "Test Post" ? "OK" : "FAIL");
  console.log("cover round-trip:", Buffer.from(got.coverData!, "base64").toString() === "fake-image-bytes" ? "OK" : "FAIL");
  await db.update(posts).set({ status: "draft" }).where(eq(posts.id, id));
  const drafts = await db.select().from(posts).where(eq(posts.status, "draft"));
  console.log("status update:", drafts.length === 1 ? "OK" : "FAIL");
  await db.delete(posts).where(eq(posts.id, id));
  console.log("post delete:", (await db.select().from(posts)).length === 0 ? "OK" : "FAIL");

  await lite.close();
  console.log("ALL DB TESTS DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

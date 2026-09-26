import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, closeDb } from "../src/lib/db.server";
import { users } from "../src/lib/schema";
import { hashPassword, newSalt } from "../src/lib/crypto";

/** Creates (or resets) the admin user from ADMIN_EMAIL / ADMIN_PASSWORD. */
async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password || password.length < 8) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in .env first.");
    process.exit(1);
  }
  const { drizzle } = await getDb();
  const salt = newSalt();
  const existing = await drizzle.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) {
    await drizzle
      .update(users)
      .set({ passHash: hashPassword(password, salt), passSalt: salt })
      .where(eq(users.email, email));
    console.log(`admin password reset for ${email}`);
  } else {
    await drizzle.insert(users).values({
      id: randomUUID(),
      email,
      passHash: hashPassword(password, salt),
      passSalt: salt,
      createdAt: new Date().toISOString(),
    });
    console.log(`admin created: ${email}`);
  }
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

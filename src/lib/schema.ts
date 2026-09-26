import { pgTable, text, integer } from "drizzle-orm/pg-core";

/** Admin users (single-admin setup, seeded via scripts/seed-admin.ts). */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passHash: text("pass_hash").notNull(),
  passSalt: text("pass_salt").notNull(),
  createdAt: text("created_at").notNull(),
});

/** Login sessions (token sha256 stored, raw token in httpOnly cookie). */
export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
});

/** Blog posts created in /admin. Covers stored as base64 (blog-scale, no extra service). */
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull().default("From the kitchen"),
  tagsJson: text("tags_json").notNull().default("[]"),
  excerpt: text("excerpt").notNull().default(""),
  coverData: text("cover_data"),
  coverMime: text("cover_mime"),
  bodyJson: text("body_json").notNull().default("[]"),
  status: text("status").notNull().default("draft"),
  author: text("author").notNull().default("Spice N Flavors"),
  readingTime: integer("reading_time").notNull().default(3),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type DbPost = typeof posts.$inferSelect;

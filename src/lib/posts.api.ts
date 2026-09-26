import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { articleBySlug } from "@/lib/data";
import { legacyBySlug } from "@/lib/legacy";
import { coverUrlFor, readingTimeFor, type DbPostPublic, type PostBlock } from "@/lib/blocks";
import type { DbPost } from "@/lib/schema";

/** Server-only modules load lazily inside handlers (routes import these fns). */
async function srv() {
  const [{ getDb }, schema, nodeCrypto] = await Promise.all([
    import("./db.server"),
    import("./schema"),
    import("node:crypto"),
  ]);
  return { getDb, ...schema, ...nodeCrypto };
}

const MAX_COVER_BYTES = 4 * 1024 * 1024;

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "untitled"
  );
}

function parseTags(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ].slice(0, 10);
}

function toPublic(p: DbPost): DbPostPublic {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    tags: JSON.parse(p.tagsJson || "[]") as string[],
    excerpt: p.excerpt,
    coverUrl: coverUrlFor(p.id, Boolean(p.coverData)),
    readingTime: p.readingTime,
    author: p.author,
    date: p.publishedAt || p.updatedAt,
    body: JSON.parse(p.bodyJson || "[]") as PostBlock[],
    draft: false,
  };
}

async function assertSlugFree(slug: string, ignoreId?: string) {
  if (articleBySlug(slug) || legacyBySlug(slug)) {
    throw new Error("SLUG_TAKEN");
  }
  const { getDb, posts } = await srv();
  const { drizzle } = await getDb();
  const existing = await drizzle.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  if (existing[0] && existing[0].id !== ignoreId) throw new Error("SLUG_TAKEN");
}

async function coverFromForm(form: FormData): Promise<{ data: string; mime: string } | null> {
  const file = form.get("cover");
  if (!file || !(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("COVER_NOT_IMAGE");
  if (file.size > MAX_COVER_BYTES) throw new Error("COVER_TOO_LARGE");
  const buf = Buffer.from(await file.arrayBuffer());
  return { data: buf.toString("base64"), mime: file.type };
}

function blocksFromForm(form: FormData): PostBlock[] {
  const raw = String(form.get("body") ?? "[]");
  const parsed = JSON.parse(raw) as PostBlock[];
  if (!Array.isArray(parsed)) throw new Error("BAD_BODY");
  return parsed
    .map((b) => {
      if (b.type === "list") {
        return {
          type: "list" as const,
          style: b.style === "ol" ? ("ol" as const) : ("ul" as const),
          items: b.items.map((i) => i.trim()).filter(Boolean),
        };
      }
      if (b.type === "image")
        return { type: "image" as const, src: b.src, caption: b.caption ?? "" };
      if (b.type === "heading" || b.type === "quote" || b.type === "paragraph") {
        return { ...b, text: b.text.trim() };
      }
      return null;
    })
    .filter((b): b is PostBlock => {
      if (!b) return false;
      if (b.type === "list") return b.items.length > 0;
      if (b.type === "image") return b.src.length > 0;
      return b.text.length > 0;
    });
}

export const listPublishedPostsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getDb, posts } = await srv();
    const { drizzle } = await getDb();
    const rows = await drizzle
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt));
    return rows.map((p: DbPost) => toPublic(p));
  } catch (e) {
    if ((e as Error)?.name === "DbNotConfigured") return [];
    throw e;
  }
});

export const getPublishedPostFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => d as { slug: string })
  .handler(async ({ data }) => {
    try {
      const { getDb, posts } = await srv();
      const { drizzle } = await getDb();
      const rows = await drizzle.select().from(posts).where(eq(posts.slug, data.slug)).limit(1);
      const post = rows[0];
      if (!post || post.status !== "published") return null;
      return toPublic(post);
    } catch (e) {
      if ((e as Error)?.name === "DbNotConfigured") return null;
      throw e;
    }
  });

export const adminListPostsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.api");
  await requireAdmin();
  const { getDb, posts } = await srv();
  const { drizzle } = await getDb();
  const rows = await drizzle.select().from(posts).orderBy(desc(posts.updatedAt));
  return rows.map((p: DbPost) => ({
    ...toPublic(p),
    status: p.status,
    updatedAt: p.updatedAt,
  }));
});

export const adminGetPostFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.api");
    await requireAdmin();
    const { getDb, posts } = await srv();
    const { drizzle } = await getDb();
    const rows = await drizzle.select().from(posts).where(eq(posts.id, data.id)).limit(1);
    const post = rows[0];
    if (!post) return null;
    return {
      ...toPublic(post),
      status: post.status,
      coverUrl: coverUrlFor(post.id, Boolean(post.coverData)),
    };
  });

export const adminSavePostFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as FormData)
  .handler(async ({ data: form }) => {
    const { requireAdmin } = await import("./auth.api");
    await requireAdmin();
    const { getDb, posts } = await srv();
    const id = String(form.get("id") || "");
    const title = String(form.get("title") || "").trim();
    if (!title) throw new Error("TITLE_REQUIRED");
    const slugRaw = String(form.get("slug") || "").trim();
    const slug = slugify(slugRaw || title);
    const category = String(form.get("category") || "").trim() || "From the kitchen";
    const tags = parseTags(String(form.get("tags") || ""));
    const excerpt = String(form.get("excerpt") || "")
      .trim()
      .slice(0, 300);
    const status = String(form.get("status") || "draft") === "published" ? "published" : "draft";
    const author = String(form.get("author") || "").trim() || "Spice N Flavors";
    const body = blocksFromForm(form);
    if (body.length === 0) throw new Error("BODY_REQUIRED");

    const now = new Date().toISOString();
    const { drizzle } = await getDb();

    if (id) {
      const existing = await drizzle.select().from(posts).where(eq(posts.id, id)).limit(1);
      const prev = existing[0];
      if (!prev) throw new Error("NOT_FOUND");
      await assertSlugFree(slug, id);
      const cover = await coverFromForm(form);
      await drizzle
        .update(posts)
        .set({
          slug,
          title,
          category,
          tagsJson: JSON.stringify(tags),
          excerpt,
          ...(cover ? { coverData: cover.data, coverMime: cover.mime } : {}),
          bodyJson: JSON.stringify(body),
          status,
          author,
          readingTime: readingTimeFor(body),
          publishedAt: status === "published" ? prev.publishedAt || now : prev.publishedAt,
          updatedAt: now,
        })
        .where(eq(posts.id, id));
      return { id, slug };
    }

    await assertSlugFree(slug);
    const cover = await coverFromForm(form);
    const { randomUUID } = await import("node:crypto");
    const newId = randomUUID();
    await drizzle.insert(posts).values({
      id: newId,
      slug,
      title,
      category,
      tagsJson: JSON.stringify(tags),
      excerpt,
      coverData: cover?.data ?? null,
      coverMime: cover?.mime ?? null,
      bodyJson: JSON.stringify(body),
      status,
      author,
      readingTime: readingTimeFor(body),
      publishedAt: status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    });
    return { id: newId, slug };
  });

export const adminDeletePostFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.api");
    await requireAdmin();
    const { getDb, posts } = await srv();
    const { drizzle } = await getDb();
    await drizzle.delete(posts).where(eq(posts.id, data.id));
    return { ok: true };
  });

/** Upload one inline body image. Returns a data URL stored inside the block JSON. */
export const adminUploadImageFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as FormData)
  .handler(async ({ data: form }) => {
    const { requireAdmin } = await import("./auth.api");
    await requireAdmin();
    const { getDb, posts } = await srv();
    const file = form.get("image");
    if (!file || !(file instanceof File) || file.size === 0) throw new Error("NO_IMAGE");
    if (!file.type.startsWith("image/")) throw new Error("COVER_NOT_IMAGE");
    if (file.size > MAX_COVER_BYTES) throw new Error("COVER_TOO_LARGE");
    const buf = Buffer.from(await file.arrayBuffer());
    return { dataUrl: `data:${file.type};base64,${buf.toString("base64")}` };
  });

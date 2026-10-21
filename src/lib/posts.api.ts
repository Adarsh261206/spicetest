import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { articleBySlug } from "@/lib/data";
import { legacyBySlug } from "@/lib/legacy";
import { coverUrlFor, readingTimeFor, type DbPostPublic, type PostBlock } from "@/lib/blocks";
import { draftToRecipe, safeParseRecipeJson, type RecipeDraft } from "@/lib/recipe";
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

/** Raster images only — SVG is rejected (stored `coverMime` is served publicly). */
const SAFE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

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

function safeJsonArray<T>(raw: string | null | undefined): T[] {
  try {
    const v = JSON.parse(raw || "[]") as unknown;
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

function toPublic(p: DbPost): DbPostPublic {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    tags: safeJsonArray<string>(p.tagsJson),
    excerpt: p.excerpt,
    coverUrl: coverUrlFor(p.id, Boolean(p.coverData)),
    readingTime: p.readingTime,
    author: p.author,
    date: p.publishedAt || p.updatedAt,
    body: safeJsonArray<PostBlock>(p.bodyJson),
    draft: false,
    kind: p.kind ?? "article",
    recipe: safeParseRecipeJson(p.recipeJson ?? null),
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
  if (!SAFE_IMAGE_TYPES.has(file.type)) throw new Error("COVER_NOT_IMAGE");
  if (file.size > MAX_COVER_BYTES) throw new Error("COVER_TOO_LARGE");
  const buf = Buffer.from(await file.arrayBuffer());
  return { data: buf.toString("base64"), mime: file.type };
}

function blocksFromForm(form: FormData): PostBlock[] {
  const raw = String(form.get("body") ?? "[]");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("BAD_BODY");
  }
  if (!Array.isArray(parsed)) throw new Error("BAD_BODY");
  return (parsed as PostBlock[])
    .map((b) => {
      if (!b || typeof b !== "object") return null;
      if (b.type === "list") {
        const items = Array.isArray(b.items) ? b.items : [];
        return {
          type: "list" as const,
          style: b.style === "ol" ? ("ol" as const) : ("ul" as const),
          items: items.map((i) => String(i).trim()).filter(Boolean),
        };
      }
      if (b.type === "image")
        return {
          type: "image" as const,
          src: String(b.src ?? ""),
          caption: String(b.caption ?? ""),
        };
      if (b.type === "heading" || b.type === "quote" || b.type === "paragraph") {
        return { ...b, text: String(b.text ?? "").trim() };
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
      .where(and(eq(posts.status, "published"), eq(posts.kind, "article")))
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
      const rows = await drizzle
        .select()
        .from(posts)
        .where(and(eq(posts.slug, data.slug), eq(posts.kind, "article")))
        .limit(1);
      const post = rows[0];
      if (!post || post.status !== "published") return null;
      return toPublic(post);
    } catch (e) {
      if ((e as Error)?.name === "DbNotConfigured") return null;
      throw e;
    }
  });

/** Published Recipe-Studio recipes, shaped exactly like curated recipes. */
export const listPublishedRecipesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getDb, posts } = await srv();
    const { drizzle } = await getDb();
    const rows = await drizzle
      .select()
      .from(posts)
      .where(and(eq(posts.status, "published"), eq(posts.kind, "recipe")))
      .orderBy(desc(posts.publishedAt));
    return rows
      .map((p: DbPost) => toPublic(p))
      .filter((p: DbPostPublic) => p.recipe)
      .map((p: DbPostPublic) => ({
        ...draftToRecipe({
          slug: p.slug,
          image: p.coverUrl ?? "/og-default.jpg",
          draft: p.recipe as RecipeDraft,
          blurbFallback: p.excerpt,
        }),
        date: p.date,
      }));
  } catch (e) {
    if ((e as Error)?.name === "DbNotConfigured") return [];
    throw e;
  }
});

export const getPublishedRecipeFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => d as { slug: string })
  .handler(async ({ data }) => {
    try {
      const { getDb, posts } = await srv();
      const { drizzle } = await getDb();
      const rows = await drizzle
        .select()
        .from(posts)
        .where(and(eq(posts.slug, data.slug), eq(posts.kind, "recipe")))
        .limit(1);
      const post = rows[0];
      if (!post || post.status !== "published") return null;
      const pub = toPublic(post);
      if (!pub.recipe) return null;
      return draftToRecipe({
        slug: pub.slug,
        image: pub.coverUrl ?? "/og-default.jpg",
        draft: pub.recipe,
        blurbFallback: pub.excerpt,
      });
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
    const title = String(form.get("title") || "")
      .trim()
      .slice(0, 200);
    if (!title) throw new Error("TITLE_REQUIRED");
    const slugRaw = String(form.get("slug") || "").trim();
    const slug = slugify(slugRaw || title);
    const category =
      String(form.get("category") || "")
        .trim()
        .slice(0, 80) || "From the kitchen";
    const tags = parseTags(String(form.get("tags") || ""));
    const excerpt = String(form.get("excerpt") || "")
      .trim()
      .slice(0, 300);
    const status = String(form.get("status") || "draft") === "published" ? "published" : "draft";
    const author =
      String(form.get("author") || "")
        .trim()
        .slice(0, 120) || "Spice N Flavors";
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

/** Recipe Studio save — structured recipe post (kind='recipe', renders on /recipes). */
export const adminSaveRecipeFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as FormData)
  .handler(async ({ data: form }) => {
    const { requireAdmin } = await import("./auth.api");
    await requireAdmin();
    const { getDb, posts } = await srv();
    const id = String(form.get("id") || "");
    const title = String(form.get("title") || "")
      .trim()
      .slice(0, 200);
    if (!title) throw new Error("TITLE_REQUIRED");
    const slugRaw = String(form.get("slug") || "").trim();
    const slug = slugify(slugRaw || title);
    const status = String(form.get("status") || "draft") === "published" ? "published" : "draft";

    // Assemble the draft from studio fields, then sanitize through the same
    // parser the frontend trusts.
    const draft = safeParseRecipeJson(
      JSON.stringify({
        title,
        slug,
        blurb: String(form.get("blurb") || "").slice(0, 300),
        story: String(form.get("story") || "").slice(0, 5000),
        category: String(form.get("category") || "Main Course").slice(0, 40),
        cuisine: String(form.get("cuisine") || "North Indian").slice(0, 40),
        tags: safeJsonArray<string>(form.get("tags") as string),
        diet: safeJsonArray<string>(form.get("diet") as string),
        prep: Number(form.get("prep")),
        cook: Number(form.get("cook")),
        servings: Number(form.get("servings")),
        difficulty: String(form.get("difficulty") || "Easy"),
        ingredients: safeJsonArray(form.get("ingredients") as string),
        steps: safeJsonArray(form.get("steps") as string),
        notes: safeJsonArray<string>(form.get("notes") as string),
        faqs: safeJsonArray(form.get("faqs") as string),
      }),
    );
    if (!draft) throw new Error("BAD_RECIPE");
    if (draft.ingredients.length === 0) throw new Error("INGREDIENTS_REQUIRED");
    if (draft.steps.length === 0) throw new Error("STEPS_REQUIRED");

    const now = new Date().toISOString();
    const { drizzle } = await getDb();
    // Readable fallback blocks (used if recipe_json is ever unreadable).
    const body: PostBlock[] = [
      ...(draft.story
        ? draft.story.split(/\n\n+/).map((text) => ({ type: "paragraph" as const, text }))
        : []),
      {
        type: "list" as const,
        style: "ul" as const,
        items: draft.ingredients.map((i) =>
          `${i.qty ?? ""} ${i.unit} ${i.name}`.replace(/\s+/g, " ").trim(),
        ),
      },
      {
        type: "list" as const,
        style: "ol" as const,
        items: draft.steps.map((s) => s.text),
      },
    ];
    const cover = await coverFromForm(form);
    const row = {
      slug,
      title,
      category: draft.category,
      tagsJson: JSON.stringify(draft.tags),
      excerpt: draft.blurb.slice(0, 300),
      ...(cover ? { coverData: cover.data, coverMime: cover.mime } : {}),
      bodyJson: JSON.stringify(body),
      status,
      author: "Viya Sheth",
      readingTime: readingTimeFor(body),
      kind: "recipe",
      recipeJson: JSON.stringify(draft),
      updatedAt: now,
    };

    if (id) {
      const existing = await drizzle.select().from(posts).where(eq(posts.id, id)).limit(1);
      const prev = existing[0];
      if (!prev) throw new Error("NOT_FOUND");
      await assertSlugFree(slug, id);
      await drizzle
        .update(posts)
        .set({
          ...row,
          publishedAt: status === "published" ? prev.publishedAt || now : prev.publishedAt,
        })
        .where(eq(posts.id, id));
      return { id, slug };
    }

    await assertSlugFree(slug);
    const { randomUUID } = await import("node:crypto");
    const newId = randomUUID();
    await drizzle.insert(posts).values({
      id: newId,
      ...row,
      createdAt: now,
      publishedAt: status === "published" ? now : null,
    });
    return { id: newId, slug };
  });

/** Community submission from /share — always lands as a draft for admin review. */
export const submitRecipeFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as FormData)
  .handler(async ({ data: form }) => {
    const { getDb, posts } = await srv();
    const name = String(form.get("name") || "")
      .trim()
      .slice(0, 200);
    if (!name) throw new Error("TITLE_REQUIRED");
    const cookName = String(form.get("cookName") || "")
      .trim()
      .slice(0, 120);
    const description = String(form.get("description") || "")
      .trim()
      .slice(0, 500);
    const ingredients = safeJsonArray<string>(form.get("ingredients") as string)
      .map((i) => String(i).trim())
      .filter(Boolean)
      .slice(0, 30)
      .map((i) => i.slice(0, 120));
    const steps = safeJsonArray<string>(form.get("steps") as string)
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 30)
      .map((s) => s.slice(0, 1000));
    if (ingredients.length === 0 || steps.length === 0) throw new Error("BODY_REQUIRED");
    const num = (v: FormDataEntryValue | null, fallback: number) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n), 1440) : fallback;
    };
    const prep = num(form.get("prep"), 0);
    const cook = num(form.get("cook"), 0);
    const servings = Math.min(Math.max(num(form.get("servings"), 2), 1), 50);
    const cuisine =
      String(form.get("cuisine") || "")
        .trim()
        .slice(0, 40) || "North Indian";
    const meal =
      String(form.get("meal") || "")
        .trim()
        .slice(0, 20) || "Dinner";
    const dietTags = safeJsonArray<string>(form.get("dietTags") as string)
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 6);
    const slug = slugify(name);
    await assertSlugFree(slug);
    const cover = await coverFromForm(form);
    const metaLine = `Prep ${prep} min · Cook ${cook} min · Serves ${servings} · ${cuisine} · ${meal}`;
    const body: PostBlock[] = [
      ...(description ? [{ type: "paragraph" as const, text: description }] : []),
      { type: "paragraph" as const, text: metaLine },
      { type: "list" as const, style: "ul" as const, items: ingredients },
      { type: "list" as const, style: "ol" as const, items: steps },
    ];
    const now = new Date().toISOString();
    const { drizzle } = await getDb();
    const { randomUUID } = await import("node:crypto");
    const newId = randomUUID();
    await drizzle.insert(posts).values({
      id: newId,
      slug,
      title: name,
      category: "Community",
      tagsJson: JSON.stringify([meal, cuisine, ...dietTags].slice(0, 10)),
      excerpt: (description || steps[0]!).slice(0, 300),
      coverData: cover?.data ?? null,
      coverMime: cover?.mime ?? null,
      bodyJson: JSON.stringify(body),
      status: "draft",
      author: cookName || "Community cook",
      readingTime: readingTimeFor(body),
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    return { slug };
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
    if (!SAFE_IMAGE_TYPES.has(file.type)) throw new Error("COVER_NOT_IMAGE");
    if (file.size > MAX_COVER_BYTES) throw new Error("COVER_TOO_LARGE");
    const buf = Buffer.from(await file.arrayBuffer());
    return { dataUrl: `data:${file.type};base64,${buf.toString("base64")}` };
  });

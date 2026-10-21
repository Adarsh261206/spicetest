import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import legacyRedirects from "./lib/legacy-redirects.json";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

/** Raster-only whitelist: cover mime is admin-controlled, never trust it blindly. */
const SAFE_COVER_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function serveCover(id: string): Promise<Response> {
  try {
    const { getDb } = await import("./lib/db.server");
    const { eq } = await import("drizzle-orm");
    const { posts } = await import("./lib/schema");
    const { drizzle } = await getDb();
    const rows = await drizzle.select().from(posts).where(eq(posts.id, id)).limit(1);
    const post = rows[0] as { coverData: string | null; coverMime: string | null } | undefined;
    if (!post?.coverData) return new Response("Not found", { status: 404 });
    // Cover mime is admin-controlled: serve a strict raster whitelist so a stored
    // SVG (or any sniffable type) can never execute as script in the browser.
    const mime = SAFE_COVER_MIMES.has(post.coverMime ?? "")
      ? post.coverMime!
      : "application/octet-stream";
    return new Response(Buffer.from(post.coverData, "base64"), {
      status: 200,
      headers: {
        "content-type": mime,
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

async function serveSitemap(): Promise<Response> {
  try {
    const SITE = "https://spicenflavors.com";
    const statics = ["/", "/recipes", "/blog", "/cuisines", "/collections", "/about", "/creators"];
    const data = (await import("./lib/data")) as {
      articles: { slug: string }[];
      collections: { slug: string }[];
      creators: { handle: string }[];
    };
    const legacyMod = (await import("./lib/legacy-posts.json")) as
      | { default: { slug: string; draft: boolean; date: string }[] }
      | { slug: string; draft: boolean; date: string }[];
    const legacy = (Array.isArray(legacyMod) ? legacyMod : legacyMod.default).filter(
      (p) => !p.draft,
    );
    // Recipe-Studio publishes (kind='recipe') live under /recipes/$slug.
    let studioRecipes: { slug: string; date: string }[] = [];
    try {
      const { getDb } = await import("./lib/db.server");
      const { desc: ddesc, eq, and } = await import("drizzle-orm");
      const { posts } = await import("./lib/schema");
      const { drizzle } = await getDb();
      const rows = (await drizzle
        .select({ slug: posts.slug, date: posts.updatedAt })
        .from(posts)
        .where(and(eq(posts.status, "published"), eq(posts.kind, "recipe")))
        .orderBy(ddesc(posts.updatedAt))) as { slug: string; date: string }[];
      studioRecipes = rows;
    } catch {
      /* DB unavailable (static export) — sitemap serves without studio URLs. */
    }
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const url = (loc: string, lastmod?: string) =>
      `  <url><loc>${esc(loc)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}</url>`;
    const urls = [
      ...statics.map((p) => url(`${SITE}${p}`)),
      ...data.articles.map((a) => url(`${SITE}/blog/${a.slug}`)),
      ...data.collections.map((c) => url(`${SITE}/collections/${c.slug}`)),
      ...data.creators.map((c) => url(`${SITE}/creators/${c.handle}`)),
      ...studioRecipes.map((r) => url(`${SITE}/recipes/${r.slug}`, r.date)),
      ...legacy.map((p) => url(`${SITE}/blog/${p.slug}`, p.date)),
    ];
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.join("\n") +
      `\n</urlset>`;
    return new Response(xml, {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Sitemap unavailable", { status: 500 });
  }
}

/** RSS 2.0: fresh DB posts first, then newest legacy recoveries. */
async function serveFeed(): Promise<Response> {
  try {
    const SITE = "https://spicenflavors.com";
    const esc = (s: string) =>
      (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    type Item = { title: string; link: string; date: string; desc: string };
    const items: Item[] = [];
    try {
      const { getDb } = await import("./lib/db.server");
      const { desc: ddesc, eq } = await import("drizzle-orm");
      const { posts } = await import("./lib/schema");
      const { drizzle } = await getDb();
      const rows = (await drizzle
        .select()
        .from(posts)
        .where(eq(posts.status, "published"))
        .orderBy(ddesc(posts.updatedAt))
        .limit(15)) as {
        slug: string;
        title: string;
        excerpt: string;
        kind: string | null;
        publishedAt: string | null;
        updatedAt: string;
      }[];
      for (const r of rows) {
        const base = r.kind === "recipe" ? "/recipes" : "/blog";
        items.push({
          title: r.title,
          link: `${SITE}${base}/${r.slug}`,
          date: r.publishedAt || r.updatedAt,
          desc: r.excerpt,
        });
      }
    } catch {
      /* DB unavailable (static export) — legacy-only feed still serves. */
    }
    const legacyMod = (await import("./lib/legacy-posts.json")) as
      | {
          default: { slug: string; title: string; excerpt: string; date: string; draft: boolean }[];
        }
      | { slug: string; title: string; excerpt: string; date: string; draft: boolean }[];
    const legacy = (Array.isArray(legacyMod) ? legacyMod : legacyMod.default)
      .filter((p) => !p.draft)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 30 - items.length);
    for (const p of legacy) {
      items.push({
        title: p.title,
        link: `${SITE}/blog/${p.slug}`,
        date: p.date,
        desc: p.excerpt,
      });
    }
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0"><channel>\n` +
      `  <title>Spice N Flavors</title>\n` +
      `  <link>${SITE}/blog</link>\n` +
      `  <description>Indian recipes that work, cooking techniques and food stories.</description>\n` +
      `  <language>en-in</language>\n` +
      items
        .map(
          (i) =>
            `  <item><title>${esc(i.title)}</title><link>${esc(i.link)}</link>` +
            `<guid>${esc(i.link)}</guid>` +
            `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` +
            `<description>${esc(i.desc)}</description></item>`,
        )
        .join("\n") +
      `\n</channel></rss>`;
    return new Response(xml, {
      status: 200,
      headers: {
        "content-type": "application/rss+xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Feed unavailable", { status: 500 });
  }
}

/** Blueprint §1 (T4): baseline hardening on every HTML response. */
function withSecurityHeaders(response: Response): Response {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "SAMEORIGIN");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      // Dynamic XML sitemap: static pages + curated recipes/articles +
      // collections/creators + recovered posts (with lastmod where known).
      if (url.pathname === "/sitemap.xml") {
        return serveSitemap();
      }
      // RSS feed for readers + aggregators.
      if (url.pathname === "/feed.xml") {
        return serveFeed();
      }
      // Blog cover images uploaded via /admin (stored in the database).
      const coverMatch = url.pathname.match(/^\/api\/covers\/([A-Za-z0-9-]+)$/);
      if (coverMatch) {
        return serveCover(coverMatch[1]!);
      }
      // Old Blogger URLs (/YYYY/MM/slug.html) -> new blog pages. Keeps
      // spicenflavors.com SEO + bookmarks working after the move.
      const slug = (legacyRedirects as Record<string, string>)[url.pathname];
      if (slug) {
        return Response.redirect(new URL(`/blog/${slug}`, url).toString(), 301);
      }
      // /journal/* was the blog path briefly -> keep it working.
      if (url.pathname === "/journal" || url.pathname.startsWith("/journal/")) {
        return Response.redirect(
          new URL(url.pathname.replace(/^\/journal/, "/blog") + url.search, url).toString(),
          301,
        );
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

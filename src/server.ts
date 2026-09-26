import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import legacyRedirects from "./lib/legacy-redirects.json";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

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
    return new Response(Buffer.from(post.coverData, "base64"), {
      status: 200,
      headers: {
        "content-type": post.coverMime || "image/jpeg",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
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
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, FileText, History, Newspaper, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { meFn } from "@/lib/auth.api";
import { adminDeletePostFn, adminListPostsFn } from "@/lib/posts.api";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatLegacyDate, legacyCover, legacyLive, legacyPosts } from "@/lib/legacy";
import { legacyCategory } from "@/lib/legacy-categories";
import type { DbPostPublic } from "@/lib/blocks";
import { cn } from "@/lib/utils";
import { buildHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const me = await meFn();
    if (!me || "dbMissing" in me) throw redirect({ to: "/admin/login" });
    return { posts: await adminListPostsFn(), user: me };
  },
  head: () =>
    buildHead({
      title: "Admin — content studio",
      description: "Spice N Flavors content studio.",
      path: "/admin",
      noindex: true,
    }),
  component: AdminHome,
});

type AdminPost = DbPostPublic & { status: string; updatedAt: string };

function AdminHome() {
  const { posts, user } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();
  const [tab, setTab] = useState<"posts" | "archive">("posts");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const published = posts.filter((p: AdminPost) => p.status === "published");
  const drafts = posts.filter((p: AdminPost) => p.status !== "published");

  const archive = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return legacyPosts;
    return legacyPosts.filter((p) =>
      [p.title, p.category, p.excerpt, ...p.tags].join(" ").toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <AdminShell
      title={`Hello, ${user.email.split("@")[0]}.`}
      eyebrow="Admin · Dashboard"
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/recipes/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            <Plus className="size-4" strokeWidth={1.8} />
            New recipe
          </Link>
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary"
          >
            <Plus className="size-4" strokeWidth={1.8} />
            Write post
          </Link>
        </div>
      }
    >
      {/* At-a-glance stats — everything on the site in one view. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Newspaper className="size-4" strokeWidth={1.8} />}
          value={String(published.length)}
          label="Your live posts"
        />
        <Stat
          icon={<FileText className="size-4" strokeWidth={1.8} />}
          value={String(drafts.length)}
          label="Drafts waiting"
        />
        <Stat
          icon={<History className="size-4" strokeWidth={1.8} />}
          value={String(legacyLive.length)}
          label="Recovered old blogs"
        />
      </div>

      {/* Tabs: my posts vs the recovered archive. */}
      <div className="mt-10 flex gap-2" role="tablist" aria-label="Admin sections">
        {(
          [
            { id: "posts", label: `My posts (${posts.length})` },
            { id: "archive", label: `Old blogs (${legacyPosts.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all",
              tab === t.id
                ? "border-primary bg-tea font-semibold text-accent-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "posts" ? (
        <div className="mt-6">
          {posts.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-secondary/40 p-10 text-center">
              <p className="font-serif text-xl">No posts yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                One click below, write, hit Publish — it goes live on the blog instantly.
              </p>
              <Link
                to="/admin/posts/new"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
              >
                <Plus className="size-4" strokeWidth={1.8} />
                Write it
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-[2rem] border border-border">
              {posts.map((p: AdminPost) => (
                <li key={p.id} className="flex items-center gap-4 bg-background p-4">
                  {p.coverUrl ? (
                    <img
                      src={p.coverUrl}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="aspect-4/3 w-20 shrink-0 rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <span className="grid aspect-4/3 w-20 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-xs text-muted-foreground">
                      No cover
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{p.title}</p>
                      {p.kind === "recipe" && (
                        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                          Recipe
                        </span>
                      )}
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          p.status === "published"
                            ? "bg-tea text-accent-foreground"
                            : "bg-vanilla text-accent-foreground",
                        )}
                      >
                        {p.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {p.kind === "recipe" ? `/recipes/${p.slug}` : `/blog/${p.slug}`} ·{" "}
                      {formatLegacyDate(p.date) || "unpublished"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {p.status === "published" &&
                      (p.kind === "recipe" ? (
                        <Link
                          to="/recipes/$slug"
                          params={{ slug: p.slug }}
                          aria-label={`View ${p.title}`}
                          className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Eye className="size-4" />
                        </Link>
                      ) : (
                        <Link
                          to="/blog/$slug"
                          params={{ slug: p.slug }}
                          aria-label={`View ${p.title}`}
                          className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Eye className="size-4" />
                        </Link>
                      ))}
                    <button
                      type="button"
                      aria-label={`Edit ${p.title}`}
                      onClick={() =>
                        p.kind === "recipe"
                          ? navigate({ to: "/admin/recipes/$recipeId", params: { recipeId: p.id } })
                          : navigate({ to: "/admin/posts/$postId", params: { postId: p.id } })
                      }
                      className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    {confirmId === p.id ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await adminDeletePostFn({ data: { id: p.id } });
                          setConfirmId(null);
                          await router.invalidate();
                        }}
                        className="rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground"
                      >
                        Confirm?
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Delete ${p.title}`}
                        onClick={() => {
                          setConfirmId(p.id);
                          setTimeout(() => setConfirmId((c) => (c === p.id ? null : c)), 3000);
                        }}
                        className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            These are your old spicenflavors.com blogs — automatically recovered and live on the
            site. They are managed from here; nothing needs to be done for them.
          </p>
          <div
            role="search"
            className="mt-4 flex max-w-md items-center gap-3 rounded-full border border-border bg-secondary/40 py-2 pl-5 pr-4 focus-within:border-primary"
          >
            <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
            <label htmlFor="archive-search" className="sr-only">
              Search old blogs
            </label>
            <input
              id="archive-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${legacyPosts.length} old blogs…`}
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-hidden placeholder:text-muted-foreground/80"
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {archive.length} {archive.length === 1 ? "post" : "posts"}
          </p>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-[2rem] border border-border">
            {archive.slice(0, 50).map((p) => (
              <li key={p.slug} className="flex items-center gap-4 bg-background p-4">
                <img
                  src={legacyCover(p)}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="aspect-4/3 w-20 shrink-0 rounded-xl border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{p.title}</p>
                    {p.draft && (
                      <span className="rounded-full bg-vanilla px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {legacyCategory(p) || "Recipe"} · {formatLegacyDate(p.date)} · {p.readingTime}{" "}
                    min read
                  </p>
                </div>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  aria-label={`View ${p.title}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Eye className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
          {archive.length > 50 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Showing 50 of {archive.length} — search to find the rest, or see the full list in the{" "}
              <Link to="/blog" className="font-semibold text-primary underline underline-offset-2">
                /blog archive
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-5">
      <p className="flex items-center gap-2 text-muted-foreground">{icon}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { meFn } from "@/lib/auth.api";
import { adminDeletePostFn, adminListPostsFn } from "@/lib/posts.api";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatLegacyDate } from "@/lib/legacy";
import type { DbPostPublic } from "@/lib/blocks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const me = await meFn();
    if (!me || "dbMissing" in me) throw redirect({ to: "/admin/login" });
    return { posts: await adminListPostsFn(), user: me };
  },
  component: AdminHome,
});

function AdminHome() {
  const { posts, user } = Route.useLoaderData();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <AdminShell
      title={`Namaste, ${user.email.split("@")[0]}.`}
      eyebrow="Admin · Posts"
      actions={
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
        >
          <Plus className="size-4" strokeWidth={1.8} />
          New post
        </Link>
      }
    >
      {posts.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-secondary/40 p-10 text-center">
          <p className="font-serif text-xl">No posts yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Write your first post — it goes live on the blog the moment you publish.
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
          {posts.map((p: DbPostPublic & { status: string; updatedAt: string }) => (
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
                  /blog/{p.slug} · {formatLegacyDate(p.date) || "unpublished"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label={`Edit ${p.title}`}
                  onClick={() => navigate({ to: "/admin/posts/$postId", params: { postId: p.id } })}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </button>
                {confirmId === p.id ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await adminDeletePostFn({ data: { id: p.id } });
                      await navigate({ to: "/admin" });
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
    </AdminShell>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { meFn } from "@/lib/auth.api";
import { buildHead } from "@/lib/seo";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/admin/posts/new")({
  loader: async () => {
    const me = await meFn();
    if (!me || "dbMissing" in me) throw redirect({ to: "/admin/login" });
    return null;
  },
  head: () =>
    buildHead({
      title: "Admin — new post",
      description: "Spice N Flavors content studio.",
      path: "/admin/posts/new",
      noindex: true,
    }),
  component: NewPost,
});

function NewPost() {
  return (
    <AdminShell title="New post" eyebrow="Admin · Write">
      <PostEditor />
    </AdminShell>
  );
}

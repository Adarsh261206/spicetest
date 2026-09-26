import { createFileRoute, redirect } from "@tanstack/react-router";
import { meFn } from "@/lib/auth.api";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/admin/posts/new")({
  loader: async () => {
    const me = await meFn();
    if (!me || "dbMissing" in me) throw redirect({ to: "/admin/login" });
    return null;
  },
  component: NewPost,
});

function NewPost() {
  return (
    <AdminShell title="New post" eyebrow="Admin · Write">
      <PostEditor />
    </AdminShell>
  );
}

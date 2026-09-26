import { createFileRoute, redirect } from "@tanstack/react-router";
import { meFn } from "@/lib/auth.api";
import { adminGetPostFn } from "@/lib/posts.api";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/admin/posts/$postId")({
  loader: async ({ params }) => {
    const me = await meFn();
    if (!me || "dbMissing" in me) throw redirect({ to: "/admin/login" });
    const post = await adminGetPostFn({ data: { id: params.postId } });
    if (!post) throw redirect({ to: "/admin" });
    return { post };
  },
  component: EditPost,
});

function EditPost() {
  const { post } = Route.useLoaderData();
  return (
    <AdminShell title="Edit post" eyebrow="Admin · Write">
      <PostEditor
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category,
          tags: post.tags.join(", "),
          excerpt: post.excerpt,
          author: post.author,
          status: post.status === "published" ? "published" : "draft",
          coverUrl: post.coverUrl,
          body: post.body,
        }}
      />
    </AdminShell>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { meFn } from "@/lib/auth.api";
import { adminGetPostFn } from "@/lib/posts.api";
import { buildHead } from "@/lib/seo";
import { safeParseRecipeJson } from "@/lib/recipe";
import { AdminShell } from "@/components/admin/AdminShell";
import { RecipeStudio, type StudioInitial } from "@/components/admin/RecipeStudio";

export const Route = createFileRoute("/admin/recipes/$recipeId")({
  loader: async ({ params }) => {
    const me = await meFn();
    if (!me || "dbMissing" in me) throw redirect({ to: "/admin/login" });
    const post = await adminGetPostFn({ data: { id: params.recipeId } });
    if (!post || post.kind !== "recipe") throw redirect({ to: "/admin" });
    const draft = safeParseRecipeJson(JSON.stringify(post.recipe ?? null));
    if (!draft) throw redirect({ to: "/admin" });
    const initial: StudioInitial = {
      id: post.id,
      slug: post.slug,
      coverUrl: post.coverUrl,
      status: post.status === "published" ? "published" : "draft",
      draft: { ...draft, slug: post.slug },
    };
    return { initial, title: post.title };
  },
  head: () =>
    buildHead({
      title: "Admin — edit recipe",
      description: "Spice N Flavors content studio.",
      path: "/admin",
      noindex: true,
    }),
  component: EditRecipe,
});

function EditRecipe() {
  const { initial, title } = Route.useLoaderData();
  return (
    <AdminShell title={title} eyebrow="Admin · Recipe Studio">
      <RecipeStudio initial={initial} />
    </AdminShell>
  );
}

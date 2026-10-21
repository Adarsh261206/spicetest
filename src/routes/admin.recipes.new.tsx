import { createFileRoute, redirect } from "@tanstack/react-router";
import { meFn } from "@/lib/auth.api";
import { buildHead } from "@/lib/seo";
import { AdminShell } from "@/components/admin/AdminShell";
import { RecipeStudio } from "@/components/admin/RecipeStudio";

export const Route = createFileRoute("/admin/recipes/new")({
  loader: async () => {
    const me = await meFn();
    if (!me || "dbMissing" in me) throw redirect({ to: "/admin/login" });
    return null;
  },
  head: () =>
    buildHead({
      title: "Admin — new recipe",
      description: "Spice N Flavors content studio.",
      path: "/admin/recipes/new",
      noindex: true,
    }),
  component: NewRecipe,
});

function NewRecipe() {
  return (
    <AdminShell title="New recipe" eyebrow="Admin · Recipe Studio">
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Write it rough, add a photo, press <strong>Organize with AI</strong> — name, ingredients,
        steps and timings fall into place by themselves. Then review and Publish.
      </p>
      <RecipeStudio />
    </AdminShell>
  );
}

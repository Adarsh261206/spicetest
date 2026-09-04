import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Pencil, Plus, Share2, Trash2, X } from "lucide-react";
import { recipeBySlug, recipes, recipesByCreator } from "@/lib/data";
import { RecipeCard } from "@/components/site/RecipeCard";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your kitchen — saved recipes and collections | Spice N Flavors" },
      {
        name: "description",
        content:
          "Saved recipes, your collections, recently viewed dishes and the recipes you've published.",
      },
      { property: "og:title", content: "Your kitchen — Spice N Flavors" },
      {
        property: "og:description",
        content: "Saved recipes, collections, recently viewed and your published recipes.",
      },
    ],
  }),
  component: Dashboard,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";
const sections = [
  "Saved Recipes",
  "My Collections",
  "Recently Viewed",
  "My Recipes",
  "Following",
  "Cooking History",
] as const;

function Dashboard() {
  const [tab, setTab] = useState<(typeof sections)[number]>("Saved Recipes");
  const {
    saved,
    recent,
    collections: userCollections,
    createCollection,
    renameCollection,
    deleteCollection,
    removeFromCollection,
  } = useSaved();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const savedRecipes = saved.map(recipeBySlug).filter(Boolean);
  const recentRecipes = recent.map(recipeBySlug).filter(Boolean);
  const mine = recipesByCreator("maya-chen").slice(0, 3);

  return (
    <div className={`${shell} pb-8 pt-8`}>
      <header className="max-w-2xl">
        <p className="eyebrow">Your kitchen</p>
        <h1 className="display-lg mt-3">Everything you&apos;ve kept.</h1>
      </header>

      <div
        className="no-scrollbar mt-8 flex gap-2 overflow-x-auto"
        role="tablist"
        aria-label="Dashboard sections"
      >
        {sections.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={tab === s}
            onClick={() => setTab(s)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-all duration-200",
              tab === s
                ? "border-primary bg-tea font-semibold text-accent-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-12">
        {tab === "Saved Recipes" &&
          (savedRecipes.length ? (
            <Grid>
              {savedRecipes.map((r) => (
                <RecipeCard key={r!.slug} recipe={r!} size="sm" />
              ))}
            </Grid>
          ) : (
            <Empty text="Nothing saved yet. Tap the bookmark on any recipe." />
          ))}

        {tab === "Recently Viewed" &&
          (recentRecipes.length ? (
            <Grid>
              {recentRecipes.map((r) => (
                <RecipeCard key={r!.slug} recipe={r!} size="sm" />
              ))}
            </Grid>
          ) : (
            <Empty text="You haven't opened a recipe yet." />
          ))}

        {tab === "My Recipes" && (
          <Grid>
            {mine.map((r) => (
              <RecipeCard key={r.slug} recipe={r} size="sm" />
            ))}
          </Grid>
        )}

        {tab === "Cooking History" && (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {recipes.slice(0, 5).map((r, i) => (
              <li key={r.slug} className="flex items-center gap-4 p-4">
                <img
                  src={r.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="size-12 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/recipes/$slug"
                    params={{ slug: r.slug }}
                    className="truncate font-medium hover:text-primary"
                  >
                    {r.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">Cooked {i + 1}x · last week</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "Following" && (
          <Grid>
            {recipes.slice(0, 6).map((r) => (
              <RecipeCard key={r.slug} recipe={r} size="sm" />
            ))}
          </Grid>
        )}

        {tab === "My Collections" && (
          <div className="space-y-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim()) return;
                createCollection(newName.trim());
                setNewName("");
              }}
              className="flex max-w-md items-center gap-2 rounded-full border border-border bg-secondary/40 py-1.5 pl-5 pr-1.5 focus-within:border-primary"
            >
              <label htmlFor="new-collection" className="sr-only">
                New collection name
              </label>
              <input
                id="new-collection"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New collection name"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-hidden"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
              >
                <Plus className="size-4" strokeWidth={1.8} />
                Create
              </button>
            </form>

            <div className="grid gap-6 lg:grid-cols-2">
              {userCollections.map((c) => (
                <section
                  key={c.id}
                  className="rounded-2xl border border-border bg-secondary/30 p-5"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    {editing === c.id ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        aria-label="Collection name"
                        className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-primary"
                      />
                    ) : (
                      <h2 className="truncate font-serif text-xl">{c.name}</h2>
                    )}
                    <div className="flex shrink-0 items-center gap-1">
                      {editing === c.id ? (
                        <>
                          <IconBtn
                            label="Save name"
                            onClick={() => {
                              renameCollection(c.id, editValue.trim() || c.name);
                              setEditing(null);
                            }}
                          >
                            <Check className="size-4" strokeWidth={1.7} />
                          </IconBtn>
                          <IconBtn label="Cancel" onClick={() => setEditing(null)}>
                            <X className="size-4" strokeWidth={1.7} />
                          </IconBtn>
                        </>
                      ) : (
                        <>
                          <IconBtn
                            label={`Rename ${c.name}`}
                            onClick={() => {
                              setEditing(c.id);
                              setEditValue(c.name);
                            }}
                          >
                            <Pencil className="size-4" strokeWidth={1.7} />
                          </IconBtn>
                          <IconBtn label={`Share ${c.name}`} onClick={() => {}}>
                            <Share2 className="size-4" strokeWidth={1.7} />
                          </IconBtn>
                          <IconBtn
                            label={`Delete ${c.name}`}
                            onClick={() => deleteCollection(c.id)}
                          >
                            <Trash2 className="size-4" strokeWidth={1.7} />
                          </IconBtn>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {c.slugs.length === 0 && (
                      <li className="text-sm text-muted-foreground">Empty for now.</li>
                    )}
                    {c.slugs.map((slug) => {
                      const r = recipeBySlug(slug);
                      if (!r) return null;
                      return (
                        <li
                          key={slug}
                          className="flex items-center gap-3 rounded-xl bg-background p-2"
                        >
                          <img
                            src={r.image}
                            alt=""
                            aria-hidden
                            loading="lazy"
                            className="size-10 rounded-lg object-cover"
                          />
                          <Link
                            to="/recipes/$slug"
                            params={{ slug }}
                            className="min-w-0 flex-1 truncate text-sm hover:text-primary"
                          >
                            {r.title}
                          </Link>
                          <IconBtn
                            label={`Remove ${r.title}`}
                            onClick={() => removeFromCollection(c.id, slug)}
                          >
                            <X className="size-4" strokeWidth={1.7} />
                          </IconBtn>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-border bg-secondary/40 p-10 text-center text-muted-foreground">
      {text}
    </p>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
    >
      {children}
    </button>
  );
}

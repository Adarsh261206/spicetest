import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  categories,
  creators,
  cuisines,
  diets,
  difficulties,
  collections,
  type Recipe,
} from "@/lib/data";
import { RecipeCard } from "@/components/site/RecipeCard";
import { LegacyCard } from "@/components/site/LegacyCard";
import { CategoryRail } from "@/components/site/CategoryRail";
import { CreatorCard } from "@/components/site/CreatorCard";
import { CollectionCard } from "@/components/site/CollectionCard";
import { legacyCover, legacyPosts, type LegacyPost } from "@/lib/legacy";
import { listPublishedRecipesFn } from "@/lib/posts.api";
import { AD_SLOTS, AdSlot } from "@/components/site/Monetization";
import { legacyCategory } from "@/lib/legacy-categories";
import { cn } from "@/lib/utils";
import { buildHead, itemListJsonLd } from "@/lib/seo";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "All").default("All"),
  sort: fallback(z.string(), "relevance").default("relevance"),
});

export const Route = createFileRoute("/recipes/")({
  validateSearch: zodValidator(searchSchema),
  // Recipes published through the admin studio, merged with the recovered archive.
  loader: async () => ({ dbRecipes: await listPublishedRecipesFn() }),
  head: () =>
    buildHead({
      title: "Search Indian recipes by ingredient and cuisine",
      description:
        "Search the Spice N Flavors library by diet, cooking time, difficulty, region and ingredient.",
      path: "/recipes",
    }),
  component: RecipesPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";
const tabs = ["Recipes", "Cuisines", "Creators", "Collections"] as const;

function RecipesPage() {
  const { q, category, sort } = Route.useSearch();
  const { dbRecipes } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/recipes/" });

  const [tab, setTab] = useState<(typeof tabs)[number]>("Recipes");
  const [diet, setDiet] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string[]>([]);
  const [maxTime, setMaxTime] = useState(120);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const term = q.trim().toLowerCase().slice(0, 100);

  const allRecipes: (Recipe & { date?: string })[] = useMemo(() => dbRecipes, [dbRecipes]);

  const results = useMemo(() => {
    let out = allRecipes.filter((r) => {
      const haystack = [
        r.title,
        r.blurb,
        r.cuisine,
        r.category,
        ...r.tags,
        ...r.diet,
        ...r.ingredients.map((i) => i.name),
      ]
        .join(" ")
        .toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (
        category !== "All" &&
        !(r.category === category || r.tags.includes(category) || r.diet.includes(category))
      )
        return false;
      if (diet.length && !diet.every((d) => r.diet.includes(d) || r.tags.includes(d))) return false;
      if (difficulty.length && !difficulty.includes(r.difficulty)) return false;
      if (cuisine.length && !cuisine.includes(r.cuisine)) return false;
      if (r.minutes > maxTime) return false;
      return true;
    });
    if (sort === "quickest") out = [...out].sort((a, b) => a.minutes - b.minutes);
    if (sort === "a-z") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "slow-cooks") out = [...out].sort((a, b) => b.minutes - a.minutes);
    return out;
  }, [term, category, diet, difficulty, cuisine, maxTime, sort, allRecipes]);

  // The recovered archive is the heart of the listing — text/category/cuisine match.
  const archiveMatches = useMemo(() => {
    const words = term.split(/\s+/).filter(Boolean);
    const out = legacyPosts.filter((p) => {
      // Draft recoveries are review-only: reachable by URL, never listed.
      if (p.draft) return false;
      const cat = legacyCategory(p);
      if (category !== "All" && !(cat === category || p.tags.includes(category))) return false;
      if (
        cuisine.length > 0 &&
        !cuisine.some(
          (c) => p.tags.includes(c) || cat === c || p.title.toLowerCase().includes(c.toLowerCase()),
        )
      )
        return false;
      if (words.length === 0) return true;
      const hay = [p.title, p.category, p.excerpt, ...p.tags].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    if (sort === "a-z") out.sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }, [term, category, cuisine, sort]);

  const creatorResults = creators.filter((c) =>
    (c.name + c.specialty + c.location).toLowerCase().includes(term),
  );
  const collectionResults = collections.filter((c) => c.name.toLowerCase().includes(term));
  const cuisineResults = cuisines.filter((c) => c.toLowerCase().includes(term));

  const setSearch = (patch: Partial<{ q: string; category: string; sort: string }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const activeFilters = diet.length + difficulty.length + cuisine.length + (maxTime < 120 ? 1 : 0);

  // Blueprint §2 (R5): ItemList of the lead results (unfiltered view only).
  const listLd =
    tab === "Recipes" && !term
      ? itemListJsonLd("/recipes", [
          ...results.slice(0, 12).map((r) => ({
            name: r.title,
            path: `/recipes/${r.slug}`,
            image: r.image,
          })),
          ...archiveMatches.slice(0, 12).map((p) => ({
            name: p.title,
            path: `/blog/${p.slug}`,
            image: legacyCover(p),
          })),
        ])
      : null;

  return (
    <div className={`${shell} pb-16 pt-8`}>
      {listLd && <script type="application/ld+json">{JSON.stringify(listLd)}</script>}
      <header className="max-w-2xl">
        <p className="eyebrow">Search</p>
        <h1 className="display-lg mt-3">Find your next thing to cook.</h1>
      </header>

      <div
        role="search"
        className="mt-8 flex items-center gap-3 rounded-full border border-border bg-secondary/40 py-2 pl-5 pr-2 transition-colors focus-within:border-primary"
      >
        <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.6} />
        <label htmlFor="site-search" className="sr-only">
          Search recipes, ingredients, cuisines
        </label>
        <input
          id="site-search"
          value={q}
          onChange={(e) => setSearch({ q: e.target.value })}
          placeholder="Search recipes, ingredients, cuisines..."
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-hidden placeholder:text-muted-foreground/80"
        />
        {q && (
          <button
            type="button"
            onClick={() => setSearch({ q: "" })}
            aria-label="Clear search"
            className="grid size-9 place-items-center rounded-full hover:bg-background"
          >
            <X className="size-4" strokeWidth={1.6} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary lg:hidden"
        >
          <SlidersHorizontal className="size-4" strokeWidth={1.6} />
          {activeFilters > 0 && <span className="text-primary">{activeFilters}</span>}
        </button>
      </div>

      <div
        className="no-scrollbar mt-6 flex gap-2 overflow-x-auto"
        role="tablist"
        aria-label="Search scope"
      >
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-all duration-200",
              tab === t
                ? "border-primary bg-tea font-semibold text-accent-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        {/* FILTERS */}
        <aside
          className={cn("space-y-8 lg:block", filtersOpen ? "block" : "hidden")}
          aria-label="Filters"
        >
          <FilterGroup title="Diet">
            <Chips items={diets} selected={diet} onToggle={(v) => toggle(diet, setDiet, v)} />
          </FilterGroup>
          <FilterGroup title="Difficulty">
            <Chips
              items={difficulties}
              selected={difficulty}
              onToggle={(v) => toggle(difficulty, setDifficulty, v)}
            />
          </FilterGroup>
          <FilterGroup title="Cuisine">
            <Chips
              items={cuisines}
              selected={cuisine}
              onToggle={(v) => toggle(cuisine, setCuisine, v)}
            />
          </FilterGroup>
          <FilterGroup title={`Cooking time · under ${maxTime} min`}>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={maxTime}
              aria-label="Maximum cooking time in minutes"
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </FilterGroup>
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setDiet([]);
                setDifficulty([]);
                setCuisine([]);
                setMaxTime(120);
              }}
              className="text-sm font-semibold text-primary underline underline-offset-4"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* RESULTS */}
        <div>
          {tab === "Recipes" && (
            <>
              <CategoryRail
                items={categories}
                value={category}
                onChange={(v) => setSearch({ category: v })}
                hrefFor={(c) => `/recipes?category=${encodeURIComponent(c)}`}
              />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <p className="text-sm text-muted-foreground">
                  {results.length + archiveMatches.length}{" "}
                  {results.length + archiveMatches.length === 1 ? "recipe" : "recipes"}
                  {term && <> for “{term}”</>}
                </p>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Sort
                  <select
                    value={sort}
                    onChange={(e) => setSearch({ sort: e.target.value })}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-sm outline-hidden focus:border-primary"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="quickest">Quickest</option>
                    <option value="a-z">A–Z</option>
                    <option value="slow-cooks">Slow cooks</option>
                  </select>
                </label>
              </div>

              {results.length === 0 && archiveMatches.length === 0 ? (
                <p className="py-16 text-center text-muted-foreground">
                  Nothing matched. Try loosening a filter.
                </p>
              ) : (
                <>
                  <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {results.map((r, i) => (
                      <RecipeCard key={r.slug} recipe={r} size={i % 5 === 0 ? "md" : "sm"} />
                    ))}
                    <ArchiveCards items={archiveMatches} />
                  </div>
                  {(results.length > 0 || archiveMatches.length > 0) && (
                    <AdSlot format="in-feed" slot={AD_SLOTS.feed} />
                  )}
                </>
              )}
            </>
          )}

          {tab === "Creators" && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {creatorResults.map((c) => (
                <CreatorCard key={c.handle} creator={c} />
              ))}
            </div>
          )}

          {tab === "Collections" && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {collectionResults.map((c) => (
                <CollectionCard key={c.slug} collection={c} />
              ))}
            </div>
          )}

          {tab === "Cuisines" && (
            <ul className="flex flex-wrap gap-2">
              {cuisineResults.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch({ q: item });
                      setTab("Recipes");
                    }}
                    className="rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-vanilla"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ArchiveCards({ items }: { items: LegacyPost[] }) {
  const [visible, setVisible] = useState(24);
  const shown = items.slice(0, visible);
  return (
    <>
      {shown.map((p) => (
        <LegacyCard key={p.slug} post={p} size="sm" />
      ))}
      {visible < items.length && (
        <div className="col-span-full mt-2 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + 24)}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:bg-secondary"
          >
            Show more ({items.length - visible} remaining)
          </button>
        </div>
      )}
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rule-hair pt-5 first:border-t-0 first:pt-0">
      <h2 className="eyebrow mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Chips({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(item)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-all duration-200",
              active
                ? "border-primary bg-tea font-semibold text-accent-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

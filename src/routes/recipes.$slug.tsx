import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChefHat, Play, Replace, Share2, ShoppingBasket } from "lucide-react";
import { creatorByHandle } from "@/lib/data";
import { getPublishedRecipeFn } from "@/lib/posts.api";
import { legacyBySlug, legacyCover, legacyLive } from "@/lib/legacy";
import { legacyCategory } from "@/lib/legacy-categories";
import { SaveButton } from "@/components/site/SaveButton";
import { Reveal } from "@/components/site/Reveal";
import { CookingMode } from "@/components/site/CookingMode";
import { AD_SLOTS, AdSlot, AffiliateBox } from "@/components/site/Monetization";
import { buildHead, breadcrumbJsonLd, faqJsonLd, recipeJsonLd } from "@/lib/seo";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recipes/$slug")({
  loader: async ({ params }) => {
    // Old /recipes/<slug> links for recovered posts keep working.
    if (legacyBySlug(params.slug)) {
      throw redirect({ to: "/blog/$slug", params: { slug: params.slug } });
    }
    const fresh = await getPublishedRecipeFn({ data: { slug: params.slug } });
    if (fresh) return { recipe: fresh };
    throw notFound();
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return buildHead({
        title: "Recipe unavailable",
        description: "This recipe could not be found.",
        path: "/recipes",
        noindex: true,
      });
    }
    const { recipe } = loaderData;
    return buildHead({
      title: `${recipe.title} — ${recipe.cuisine} recipe`,
      description: recipe.blurb,
      path: `/recipes/${recipe.slug}`,
      image: recipe.image,
      type: "article",
      keywords: [...recipe.tags, ...recipe.diet, recipe.cuisine, recipe.category].join(", "),
    });
  },
  component: RecipePage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function RecipePage() {
  const { recipe } = Route.useLoaderData();
  const creator = creatorByHandle(recipe.creator);
  const { markViewed } = useSaved();
  const [scale, setScale] = useState(1);
  const [checked, setChecked] = useState<number[]>([]);
  const [cookingOpen, setCookingOpen] = useState(false);

  useEffect(() => {
    markViewed(recipe.slug);
  }, [recipe.slug, markViewed]);

  const recipeLd = recipeJsonLd(recipe);
  const faqLd = faqJsonLd(recipe.faqs);
  // Blueprint §4 (L6): journal stories sharing the recipe's vocabulary keep
  // readers moving between recipes and stories (substring match is too strict
  // for cuisine names, so score word overlap like the blog rail does).
  const journal = (() => {
    const stop = new Set([
      "with",
      "from",
      "that",
      "this",
      "your",
      "recipe",
      "recipes",
      "easy",
      "best",
      "indian",
    ]);
    const words = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !stop.has(w));
    const mine = new Set([
      ...words(recipe.title),
      ...words(recipe.cuisine),
      ...words(recipe.category),
      ...recipe.tags.flatMap(words),
    ]);
    return legacyLive
      .map((p) => {
        let score = 0;
        for (const w of new Set([...words(p.title), ...p.tags.flatMap(words)])) {
          if (mine.has(w)) score += w.length >= 6 ? 2 : 1;
        }
        return { p, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ p }) => p);
  })();
  const crumbsLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Recipes", path: "/recipes" },
    { name: recipe.title, path: `/recipes/${recipe.slug}` },
  ]);

  const fmt = (n: number) => {
    const v = n * scale;
    return Number.isInteger(v) ? String(v) : v.toFixed(v < 1 ? 2 : 1);
  };

  return (
    <article className="pb-10">
      {/* Structured data: Google Recipe Rich Results + FAQ + breadcrumbs. */}
      <script type="application/ld+json">{JSON.stringify(recipeLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      <script type="application/ld+json">{JSON.stringify(crumbsLd)}</script>
      {/* HERO — dark editorial band */}
      <div className="bg-[#1c1815] text-[#f3ede2] print:bg-white print:text-black">
        <div className={`${shell} pb-10 pt-6`}>
          <nav aria-label="Breadcrumb">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 print:text-black">
              <Link to="/" className="hover:text-white">
                Home
              </Link>{" "}
              /{" "}
              <Link
                to="/recipes"
                search={{ q: "", category: "All", sort: "relevance" }}
                className="hover:text-white"
              >
                Recipes
              </Link>{" "}
              / {recipe.cuisine} / {recipe.title}
            </p>
          </nav>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="min-w-0">
              <h1 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">
                {recipe.title}
              </h1>
              <p className="mt-4 max-w-md leading-relaxed text-white/70 print:text-black">
                {recipe.intro}
              </p>

              {creator && (
                <Link
                  to="/creators/$handle"
                  params={{ handle: creator.handle }}
                  className="mt-6 flex w-fit items-center gap-3 rounded-full border border-white/20 py-1.5 pl-1.5 pr-5 transition-colors hover:border-white/60 print:border-border"
                >
                  <img
                    src={creator.portrait}
                    alt={creator.name}
                    loading="lazy"
                    className="size-10 rounded-full object-cover"
                  />
                  <span className="text-sm">
                    <span className="block font-semibold">{creator.name}</span>
                    <span className="block text-xs text-white/60">{creator.specialty}</span>
                  </span>
                </Link>
              )}

              <dl className="mt-8 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-6 sm:grid-cols-5 print:border-border">
                <HeroMeta label="Prep" value={`${recipe.prep}m`} />
                <HeroMeta label="Cook" value={`${recipe.cook}m`} />
                <HeroMeta label="Total" value={`${recipe.minutes}m`} />
                <HeroMeta label="Serves" value={String(recipe.servings)} />
                <HeroMeta label="Level" value={recipe.difficulty} />
              </dl>

              <div className="mt-8 flex flex-wrap gap-3 print:hidden">
                <SaveButton slug={recipe.slug} label className="px-5 py-3 text-sm" />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.share) {
                      void navigator.share({ title: recipe.title, url: window.location.href });
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-white/60"
                >
                  <Share2 className="size-4" strokeWidth={1.6} />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-white/60"
                >
                  Print
                </button>
                <a
                  href="#recipe"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-white/60"
                >
                  Jump to recipe
                </a>
                <button
                  type="button"
                  onClick={() => setCookingOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#c96f4a] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#b25f3d] active:scale-95"
                >
                  <ChefHat className="size-4" strokeWidth={1.8} />
                  Cooking mode
                </button>
              </div>
            </div>

            <div className="zoom-media overflow-hidden rounded-[2rem]">
              <img
                src={recipe.image}
                alt={`${recipe.title} — ${recipe.cuisine}`}
                fetchPriority="high"
                decoding="async"
                className="aspect-4/3 w-full object-cover lg:aspect-4/5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className={`${shell} mt-16 grid gap-14 lg:grid-cols-[0.92fr_1.08fr]`}>
        <div className="space-y-14">
          <Reveal as="section">
            <h2 className="display-md">About this recipe</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{recipe.blurb}</p>
            {recipe.story && (
              <p className="mt-4 font-serif text-xl italic leading-relaxed">
                &ldquo;{recipe.story}&rdquo;
              </p>
            )}
          </Reveal>

          <Reveal as="section">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="display-md">Ingredients</h2>
              <div className="flex items-center gap-1 rounded-full border border-border p-1">
                {[1, 2, 4, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={scale === n}
                    onClick={() => setScale(n)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                      scale === n
                        ? "bg-tea text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Serves {recipe.servings * scale}</p>

            <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-secondary/40">
              {recipe.ingredients.map((ing, i) => {
                const done = checked.includes(i);
                return (
                  <li key={i}>
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-vanilla/50">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() =>
                          setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))
                        }
                        className="size-4 shrink-0 accent-primary"
                      />
                      <span className={cn("min-w-0", done && "text-muted-foreground line-through")}>
                        {ing.qty > 0 || ing.unit ? (
                          <>
                            <span className="font-semibold">
                              {[ing.qty > 0 ? fmt(ing.qty) : "", ing.unit]
                                .filter(Boolean)
                                .join(" ")}
                            </span>{" "}
                          </>
                        ) : null}
                        {ing.name}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
            >
              <ShoppingBasket className="size-4" strokeWidth={1.7} />
              Add all to shopping list
            </button>
          </Reveal>

          <Reveal as="section">
            <h2 className="display-md">Chef&apos;s notes</h2>
            <ul className="mt-5 space-y-3">
              {recipe.notes.map((n) => (
                <li
                  key={n}
                  className="flex gap-3 rounded-2xl border border-border bg-vanilla/60 p-4 text-sm leading-relaxed"
                >
                  <ChefHat className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.6} />
                  {n}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section">
            <h2 className="display-md">Tips & tricks</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {recipe.tips.map((t) => (
                <li key={t} className="rule-hair pt-3 first:border-t-0 first:pt-0">
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section">
            <h2 className="display-md">Ingredient substitutions</h2>
            <dl className="mt-5 divide-y divide-border rounded-2xl border border-border">
              {recipe.substitutions.map((s) => (
                <div key={s.from} className="flex flex-wrap items-baseline gap-2 p-4 text-sm">
                  <Replace className="size-4 shrink-0 text-primary" strokeWidth={1.6} />
                  <dt className="font-semibold">{s.from}</dt>
                  <dd className="min-w-0 text-muted-foreground">→ {s.to}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal as="section">
            <h2 className="display-md">Nutrition</h2>
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
              {recipe.nutrition.map((n) => (
                <div key={n.label} className="bg-background px-4 py-5">
                  <dt className="eyebrow">{n.label}</dt>
                  <dd className="mt-1 font-serif text-xl">{n.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">Per serving, approximate.</p>
          </Reveal>
        </div>

        {/* right column: instructions */}
        <Reveal as="section" id="recipe" className="scroll-mt-24 lg:pl-6">
          <h2 className="display-md">Instructions</h2>
          <ol className="mt-8 space-y-8">
            {recipe.steps.map((step, i) => (
              <li
                key={i}
                className="rule-hair grid grid-cols-[3rem_1fr] gap-4 pt-8 first:border-t-0 first:pt-0"
              >
                <span className="font-serif text-3xl text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-lg leading-relaxed">{step.text}</p>
                  {step.timer && <StepTimer minutes={step.timer} />}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      {/* MONETIZATION — high-viewability in-article zone + affiliate picks. */}
      <div className={`${shell} mt-16`}>
        <AdSlot format="in-article" slot={AD_SLOTS.article} />
        <AffiliateBox />
      </div>

      {/* FAQ */}
      <Reveal as="section" className="mt-24 bg-secondary/60 py-16">
        <div className={shell}>
          <h2 className="display-lg">Frequently asked</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {recipe.faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-background p-5">
                <h3 className="font-serif text-lg leading-snug">{f.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* FROM THE JOURNAL — same-cuisine stories */}
      {journal.length > 0 && (
        <Reveal as="section" className={`${shell} mt-20`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display-lg">From the journal</h2>
            <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">
              All stories →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {journal.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="lift group block overflow-hidden rounded-2xl border border-border bg-secondary/40"
              >
                <div className="zoom-media aspect-16/10">
                  <img
                    src={legacyCover(p)}
                    alt={p.title}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {legacyCategory(p) || "Recipe"}
                  </p>
                  <p className="mt-1 font-serif text-lg leading-snug group-hover:text-primary">
                    {p.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <CookingMode
        title={recipe.title}
        steps={recipe.steps}
        ingredients={recipe.ingredients.map((i) => ({
          name: i.name,
          qty: `${fmt(i.qty)} ${i.unit}`.trim(),
        }))}
        open={cookingOpen}
        onClose={() => setCookingOpen(false)}
      />
    </article>
  );
}

function HeroMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
        {label}
      </dt>
      <dd className="mt-1.5 font-serif text-xl">{value}</dd>
    </div>
  );
}

function StepTimer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) return;
    const id = window.setInterval(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [left]);

  const mm = left !== null ? Math.floor(left / 60) : 0;
  const ss = left !== null ? left % 60 : 0;

  return (
    <button
      type="button"
      onClick={() => setLeft(left === null ? minutes * 60 : null)}
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-tea/60 px-4 py-2 text-xs font-semibold transition-all duration-200 hover:border-primary active:scale-95"
    >
      <Play className="size-3.5" strokeWidth={1.8} />
      {left === null
        ? `Start ${minutes} min timer`
        : left <= 0
          ? "Time's up — reset"
          : `${mm}:${String(ss).padStart(2, "0")} remaining`}
    </button>
  );
}

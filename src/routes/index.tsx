import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Clock, Flame, Search, Users } from "lucide-react";
import {
  about,
  articles,
  brand,
  categories,
  collections,
  creators,
  cuisineRegions,
  featuredArticle,
  featuredRecipe,
  popularRecipes,
  popularSearches,
  quickFilters,
  recipes,
  spices,
} from "@/lib/data";
import { RecipeCard } from "@/components/site/RecipeCard";
import { CategoryRail } from "@/components/site/CategoryRail";
import { CreatorCard } from "@/components/site/CreatorCard";
import { CollectionCard } from "@/components/site/CollectionCard";
import { TrendingList } from "@/components/site/TrendingList";
import { AIRecipeAssistant } from "@/components/site/AIRecipeAssistant";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spice N Flavors — A world of flavor" },
      {
        name: "description",
        content:
          "Indian recipes that work, cooking techniques worth learning and food stories worth reading — from biryani and butter chicken to everyday vegetarian cooking.",
      },
      { property: "og:title", content: "Spice N Flavors — A world of flavor" },
      {
        property: "og:description",
        content: "Recipes, stories and traditions worth bringing to the table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered =
    category === "All"
      ? recipes
      : recipes.filter(
          (r) => r.category === category || r.tags.includes(category) || r.diet.includes(category),
        );
  const grid = (filtered.length ? filtered : recipes).slice(0, 7);
  const [gridFeature, ...rest] = grid;

  const go = (q: string) =>
    navigate({ to: "/recipes", search: { q, category: "All", sort: "relevance" } });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pb-16 pt-6 sm:pt-10 lg:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-10 size-[520px] rounded-full bg-tea/45 blur-[2px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[42%] top-[62%] hidden size-40 rounded-full bg-vanilla lg:block"
        />
        <div
          className={`${shell} relative grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center`}
        >
          <div className="max-w-xl">
            <p className="eyebrow">{brand.hero.eyebrow}</p>
            <h1 className="display-xl mt-5">
              A world of
              <span className="block italic text-primary">flavor.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {brand.hero.support}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/recipes"
                search={{ q: "", category: "All", sort: "relevance" }}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
              >
                {brand.hero.primaryCta}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={1.8}
                />
              </Link>
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:border-primary hover:bg-vanilla"
              >
                {brand.hero.secondaryCta}
              </Link>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(query);
              }}
              className="mt-8 flex items-center gap-3 rounded-full border border-border bg-background py-2 pl-5 pr-2 transition-colors focus-within:border-primary"
              role="search"
            >
              <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.6} />
              <label htmlFor="hero-search" className="sr-only">
                Search recipes, ingredients or dishes
              </label>
              <input
                id="hero-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes, ingredients or dishes..."
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-hidden placeholder:text-muted-foreground/80"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
              >
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-muted-foreground">Popular</span>
              {popularSearches.map((p) => (
                <Link
                  key={p}
                  to="/recipes"
                  search={{ q: p, category: "All", sort: "relevance" }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-primary hover:bg-vanilla hover:text-foreground"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>

          {/* Editorial composition */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="zoom-media overflow-hidden rounded-[2rem] border border-border">
              <img
                src={featuredRecipe.image}
                alt="Charred chicken tikka skewers with mint chutney and lime"
                width={1200}
                height={1504}
                className="aspect-4/5 w-full object-cover"
              />
            </div>

            <div className="zoom-media absolute -bottom-8 -left-4 w-36 overflow-hidden rounded-2xl border border-border sm:-left-10 sm:w-52">
              <img
                src={spices.find((s) => s.name === "Red Chilli")?.image ?? spices[0]!.image}
                alt="Whole dried red chillies and warm spices in small bowls"
                loading="lazy"
                className="aspect-3/4 w-full object-cover"
              />
            </div>

            <div className="absolute -right-2 top-8 w-56 rounded-2xl border border-border bg-background/92 p-4 backdrop-blur sm:right-[-2.5rem]">
              <p className="eyebrow">Cooking now</p>
              <p className="mt-2 font-serif text-lg leading-snug">{featuredRecipe.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {featuredRecipe.cuisine} · {featuredRecipe.category}
              </p>
              <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" strokeWidth={1.6} /> {featuredRecipe.minutes} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <Flame className="size-3.5 text-primary" strokeWidth={1.6} />
                  {featuredRecipe.difficulty}
                </span>
              </div>
            </div>

            <div
              aria-hidden
              className="absolute -left-6 top-4 hidden h-24 w-3 rounded-full bg-vanilla lg:block"
            />
          </div>
        </div>
      </section>

      {/* SPICE STRIP */}
      <Reveal as="section" className={`${shell} mt-6`}>
        <div className="rule-hair flex flex-wrap items-end justify-between gap-4 pt-10">
          <h2 className="display-lg mt-6 max-w-lg">The spices that shape our food.</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Six things that do most of the work in an Indian kitchen — and how to get them to
            behave.
          </p>
        </div>
        <ul className="no-scrollbar -mx-5 mt-10 flex gap-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-6 lg:px-0">
          {spices.map((s) => (
            <li key={s.name} className="lift group w-[13rem] shrink-0 lg:w-auto">
              <div className="zoom-media overflow-hidden rounded-2xl border border-border">
                <img
                  src={s.image}
                  alt={`${s.name} — ${s.notes}`}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <h3 className="mt-4 font-serif text-lg">{s.name}</h3>
              <p className="text-xs text-muted-foreground">{s.notes}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground/90">{s.use}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* EDITORIAL INTRO */}
      <Reveal as="section" className={`${shell} mt-24`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <h2 className="display-lg">Food is more than a recipe.</h2>
            <p className="mt-6 font-serif text-xl italic leading-relaxed sm:text-2xl">
              Ratios that actually work, steps that matter, and the notes you only learn by cooking
              a dish more than once.
            </p>
          </div>
          <p className="shrink-0 border-l border-border pl-6 lg:pl-10">
            <span className="block font-serif text-5xl text-primary">{brand.milestone.value}</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {brand.milestone.label}
            </span>
          </p>
        </div>
      </Reveal>

      {/* FEATURED RECIPE */}
      <Reveal as="section" className="mt-20 bg-vanilla py-16 sm:py-24">
        <div className={`${shell} grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]`}>
          <div className="zoom-media order-2 overflow-hidden rounded-[2rem] border border-border lg:order-1">
            <img
              src={featuredRecipe.image}
              alt={`${featuredRecipe.title} charred at the edges with fresh coriander`}
              loading="lazy"
              className="aspect-5/4 w-full object-cover"
            />
          </div>
          <div className="order-1 max-w-lg lg:order-2 lg:pl-6">
            <p className="eyebrow">Featured recipe</p>
            <h2 className="display-lg mt-4">{featuredRecipe.title}</h2>
            <p className="mt-6 leading-relaxed">{featuredRecipe.intro}</p>
            <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Fact label="Prep" value={`${featuredRecipe.prep} min`} />
              <Fact label="Cook" value={`${featuredRecipe.cook} min`} />
              <Fact label="Serves" value={String(featuredRecipe.servings)} />
              <Fact label="Diet" value={featuredRecipe.diet[0]!} />
            </dl>
            <p className="mt-6 text-sm text-muted-foreground">
              {featuredRecipe.cuisine} · {featuredRecipe.category}
            </p>
            <Link
              to="/recipes/$slug"
              params={{ slug: featuredRecipe.slug }}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
            >
              View Recipe
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* DISCOVERY */}
      <Reveal as="section" className={`${shell} pt-6`}>
        <div className="rule-hair flex flex-wrap items-end justify-between gap-4 pt-10">
          <h2 className="display-lg mt-6">What are you craving?</h2>
          <Link
            to="/recipes"
            search={{ q: "", category: "All", sort: "relevance" }}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            More filters
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {quickFilters.map((f) => (
            <Link
              key={f}
              to="/recipes"
              search={{ q: f, category: "All", sort: "relevance" }}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:border-primary hover:bg-vanilla hover:text-foreground"
            >
              {f}
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <CategoryRail items={categories} value={category} onChange={setCategory} />
        </div>
      </Reveal>

      {/* EDITORIAL GRID */}
      <section className={`${shell} mt-10`}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            {gridFeature && <RecipeCard recipe={gridFeature} size="lg" eager />}
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 2).map((r, i) => (
              <Reveal key={r.slug} delay={i * 80}>
                <RecipeCard recipe={r} size="sm" />
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rest.slice(2, 6).map((r, i) => (
            <Reveal key={r.slug} delay={i * 70} className={i === 1 || i === 3 ? "lg:mt-10" : ""}>
              <RecipeCard recipe={r} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <Reveal as="section" className={`${shell} mt-24`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Popular</p>
            <h2 className="display-lg mt-3">What people are cooking</h2>
          </div>
          <Link
            to="/recipes"
            search={{ q: "", category: "All", sort: "relevance" }}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            All recipes
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularRecipes.map((r, i) => (
            <Reveal key={r.slug} delay={i * 60}>
              <RecipeCard recipe={r} size="sm" />
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* CUISINES */}
      <Reveal as="section" className="mt-24 bg-secondary/70 py-16 sm:py-20">
        <div className={shell}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="display-lg">Where flavor takes you.</h2>
              <p className="mt-4 text-muted-foreground">
                Explore recipes through the regions, traditions and cuisines that shape them.
              </p>
            </div>
            <Link
              to="/cuisines"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              All cuisines
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={1.8}
              />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cuisineRegions.map((c, i) => (
              <Link
                key={c.slug}
                to="/recipes"
                search={{ q: c.name, category: "All", sort: "relevance" }}
                className={`lift group overflow-hidden rounded-2xl border border-border bg-background ${i % 3 === 1 ? "lg:mt-8" : ""}`}
              >
                <div className="zoom-media overflow-hidden">
                  <img
                    src={c.image}
                    alt={`${c.name} cooking`}
                    loading="lazy"
                    className="aspect-4/3 w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl">{c.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* TRENDING */}
      <Reveal as="section" className={`${shell} mt-24`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">This week</p>
            <h2 className="display-lg mt-3">On the stove right now</h2>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            The dishes readers keep coming back to — a mix of long Sunday cooks and weeknight
            regulars.
          </p>
        </div>
        <div className="mt-10">
          <TrendingList items={recipes.slice(0, 8)} />
        </div>
      </Reveal>

      {/* JOURNAL */}
      <Reveal as="section" className={`${shell} mt-24`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Journal</p>
            <h2 className="display-lg mt-3">From the kitchen.</h2>
          </div>
          <Link
            to="/journal"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Read the journal
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Link
            to="/journal/$slug"
            params={{ slug: featuredArticle.slug }}
            className="lift group block overflow-hidden rounded-[2rem] border border-border"
          >
            <div className="zoom-media overflow-hidden">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                loading="lazy"
                className="aspect-16/10 w-full object-cover"
              />
            </div>
            <div className="p-6">
              <p className="eyebrow">{featuredArticle.category}</p>
              <h3 className="display-md mt-3">{featuredArticle.title}</h3>
              <p className="mt-3 max-w-xl text-muted-foreground">{featuredArticle.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {featuredArticle.readingTime} min read
              </p>
            </div>
          </Link>

          <ul className="space-y-6">
            {articles
              .filter((a) => a.slug !== featuredArticle.slug)
              .slice(0, 4)
              .map((a) => (
                <li key={a.slug} className="rule-hair pt-6 first:border-t-0 first:pt-0">
                  <Link to="/journal/$slug" params={{ slug: a.slug }} className="group flex gap-4">
                    <div className="zoom-media size-24 shrink-0 overflow-hidden rounded-xl border border-border">
                      <img
                        src={a.image}
                        alt={a.title}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow">{a.category}</p>
                      <h3 className="mt-1.5 font-serif text-lg leading-snug group-hover:text-primary">
                        {a.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">{a.readingTime} min read</p>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </Reveal>

      {/* KITCHEN TIP */}
      <Reveal as="section" className="mt-24 bg-vanilla py-16">
        <div className={`${shell} max-w-4xl`}>
          <p className="eyebrow">Tip from the kitchen</p>
          <blockquote className="mt-6 font-serif text-2xl italic leading-relaxed sm:text-3xl">
            &ldquo;{brand.kitchenTip}&rdquo;
          </blockquote>
        </div>
      </Reveal>

      {/* THE COOK */}
      <Reveal as="section" className={`${shell} mt-24`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-lg max-w-lg">The cook behind the recipes.</h2>
          <Link
            to="/creators"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Read her story
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </Link>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-center">
          {creators.map((c) => (
            <CreatorCard key={c.handle} creator={c} />
          ))}
          <p className="font-serif text-xl leading-relaxed text-muted-foreground sm:text-2xl">
            Every dish on Spice N Flavors is cooked, tested and written by {creators[0]?.name} — no
            guest posts, no borrowed recipes. If a ratio is here, it was measured in her kitchen
            first.
          </p>
        </div>
      </Reveal>

      {/* COLLECTIONS */}
      <Reveal as="section" className={`${shell} mt-24`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Collections</p>
            <h2 className="display-lg mt-3">Save the mood.</h2>
          </div>
          <Link
            to="/collections"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            All collections
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.slice(0, 4).map((c, i) => (
            <CollectionCard
              key={c.slug}
              collection={c}
              tall={i % 3 === 1}
              className={i % 3 === 1 ? "sm:mt-8" : ""}
            />
          ))}
        </div>
      </Reveal>

      {/* ABOUT */}
      <Reveal as="section" className="mt-24 bg-secondary/70 py-16 sm:py-20">
        <div className={`${shell} grid gap-10 lg:grid-cols-[0.9fr_1.1fr]`}>
          <div>
            <p className="eyebrow">About Spice N Flavors</p>
            <h2 className="display-lg mt-4">{about.headline}</h2>
          </div>
          <div className="space-y-5 text-muted-foreground lg:pl-6">
            {about.paragraphs.map((p) => (
              <p key={p} className="leading-relaxed">
                {p}
              </p>
            ))}
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              More about us
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* AI ASSISTANT */}
      <Reveal as="section" className={`${shell} mt-24`}>
        <AIRecipeAssistant />
      </Reveal>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow flex items-center gap-1.5">
        {label === "Serves" && <Users className="size-3.5" strokeWidth={1.6} />}
        {label}
      </dt>
      <dd className="mt-1 font-serif text-lg">{value}</dd>
    </div>
  );
}

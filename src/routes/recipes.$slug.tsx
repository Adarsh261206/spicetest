import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChefHat,
  Clock,
  Flame,
  Play,
  Replace,
  Share2,
  ShoppingBasket,
  Timer,
  Users,
} from "lucide-react";
import { creatorByHandle, recipeBySlug, recipes } from "@/lib/data";
import { SaveButton } from "@/components/site/SaveButton";
import { RecipeCard } from "@/components/site/RecipeCard";
import { Reveal } from "@/components/site/Reveal";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recipes/$slug")({
  loader: ({ params }) => {
    const recipe = recipeBySlug(params.slug);
    if (!recipe) throw notFound();
    return { recipe };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Recipe unavailable — Spice N Flavors" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { recipe } = loaderData;
    const title = `${recipe.title} — ${recipe.cuisine} recipe | Spice N Flavors`;
    return {
      meta: [
        { title },
        { name: "description", content: recipe.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: recipe.blurb },
      ],
    };
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

  useEffect(() => {
    markViewed(recipe.slug);
  }, [recipe.slug, markViewed]);

  const related = recipes
    .filter(
      (r) =>
        r.slug !== recipe.slug && (r.cuisine === recipe.cuisine || r.category === recipe.category),
    )
    .slice(0, 3);

  const fmt = (n: number) => {
    const v = n * scale;
    return Number.isInteger(v) ? String(v) : v.toFixed(v < 1 ? 2 : 1);
  };

  return (
    <article className="pb-10">
      {/* HERO */}
      <div className={`${shell} pt-6`}>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="zoom-media overflow-hidden rounded-[2rem] border border-border lg:min-h-[58vh]">
            <img
              src={recipe.image}
              alt={`${recipe.title} — ${recipe.cuisine}`}
              className="size-full min-h-[18rem] object-cover"
            />
          </div>

          <div className="flex flex-col justify-center lg:pl-4">
            <p className="eyebrow">
              {recipe.cuisine} · {recipe.category}
            </p>
            <h1 className="display-lg mt-4">{recipe.title}</h1>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{recipe.intro}</p>

            {creator && (
              <Link
                to="/creators/$handle"
                params={{ handle: creator.handle }}
                className="mt-6 flex w-fit items-center gap-3 rounded-full border border-border py-1.5 pl-1.5 pr-5 transition-colors hover:border-primary"
              >
                <img
                  src={creator.portrait}
                  alt={creator.name}
                  loading="lazy"
                  className="size-10 rounded-full object-cover"
                />
                <span className="text-sm">
                  <span className="block font-semibold">{creator.name}</span>
                  <span className="block text-xs text-muted-foreground">{creator.specialty}</span>
                </span>
              </Link>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {recipe.diet.map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-tea px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                >
                  {d}
                </span>
              ))}
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-5">
              <Meta icon={Timer} label="Prep" value={`${recipe.prep} min`} />
              <Meta icon={Clock} label="Cook" value={`${recipe.cook} min`} />
              <Meta icon={Clock} label="Total" value={`${recipe.minutes} min`} />
              <Meta icon={Users} label="Serves" value={String(recipe.servings)} />
              <Meta icon={Flame} label="Level" value={recipe.difficulty} />
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <SaveButton slug={recipe.slug} label className="px-5 py-3 text-sm" />
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    void navigator.share({ title: recipe.title, url: window.location.href });
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:bg-secondary"
              >
                <Share2 className="size-4" strokeWidth={1.6} />
                Share
              </button>
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
                        <span className="font-semibold">
                          {fmt(ing.qty)} {ing.unit}
                        </span>{" "}
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
        <Reveal as="section" className="lg:pl-6">
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

      {/* RELATED */}
      {related.length > 0 && (
        <Reveal as="section" className={`${shell} mt-20`}>
          <h2 className="display-lg">Cook this next</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <RecipeCard key={r.slug} recipe={r} size="sm" />
            ))}
          </div>
        </Reveal>
      )}
    </article>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="bg-background px-4 py-4">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5" strokeWidth={1.6} />
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold">{value}</dd>
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

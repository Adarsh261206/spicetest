import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MapPin, Plus } from "lucide-react";
import { collections, creatorByHandle, recipesByCreator } from "@/lib/data";
import { RecipeCard } from "@/components/site/RecipeCard";
import { CollectionCard } from "@/components/site/CollectionCard";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/creators/$handle")({
  loader: ({ params }) => {
    const creator = creatorByHandle(params.handle);
    if (!creator) throw notFound();
    return { creator };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Creator unavailable — Spice N Flavors" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { creator } = loaderData;
    const title = `${creator.name} — ${creator.specialty} | Spice N Flavors`;
    return {
      meta: [
        { title },
        { name: "description", content: creator.bio },
        { property: "og:title", content: title },
        { property: "og:description", content: creator.bio },
      ],
    };
  },
  component: CreatorProfile,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function CreatorProfile() {
  const { creator } = Route.useLoaderData();
  const [following, setFollowing] = useState(false);
  const theirs = recipesByCreator(creator.handle);
  const [featured, ...latest] = theirs;

  return (
    <div className="pb-10">
      <header className="bg-secondary/60 py-14">
        <div className={`${shell} grid gap-8 md:grid-cols-[auto_1fr] md:items-center`}>
          <div className="zoom-media size-32 overflow-hidden rounded-full border border-border sm:size-40">
            <img src={creator.portrait} alt={creator.name} className="size-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="display-lg">{creator.name}</h1>
            <p className="mt-2 text-muted-foreground">{creator.specialty}</p>
            <p className="mt-4 max-w-xl leading-relaxed">{creator.bio}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" strokeWidth={1.6} />
              {creator.location}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
              <Stat value={String(theirs.length)} label="Recipes" />
              <Stat value={creator.specialty.split(",")[0]!} label="Focus" />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                aria-pressed={following}
                onClick={() => setFollowing((f) => !f)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-95",
                  following
                    ? "border border-primary bg-tea text-accent-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary-deep",
                )}
              >
                {following ? (
                  <Check className="size-4" strokeWidth={1.8} />
                ) : (
                  <Plus className="size-4" strokeWidth={1.8} />
                )}
                {following ? "Following" : "Follow"}
              </button>
              {creator.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:bg-background"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {featured && (
        <Reveal as="section" className={`${shell} mt-16`}>
          <p className="eyebrow">Featured recipe</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <RecipeCard recipe={featured} size="lg" />
            <div className="lg:pl-6">
              <h2 className="display-md">{featured.title}</h2>
              <p className="mt-4 text-muted-foreground">{featured.story ?? featured.blurb}</p>
            </div>
          </div>
        </Reveal>
      )}

      {latest.length > 0 && (
        <Reveal as="section" className={`${shell} mt-20`}>
          <h2 className="display-lg">Latest recipes</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((r) => (
              <RecipeCard key={r.slug} recipe={r} size="sm" />
            ))}
          </div>
        </Reveal>
      )}

      <Reveal as="section" className={`${shell} mt-20`}>
        <h2 className="display-lg">Collections</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.slice(0, 3).map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className={`${shell} mt-20 max-w-3xl`}>
        <h2 className="display-lg">About</h2>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          {creator.bio} Based in {creator.location}, {creator.name.split(" ")[0]} has published{" "}
          {theirs.length} recipes on Spice N Flavors, and cooks most of them again the week after
          writing them down.
        </p>
      </Reveal>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span>
      <span className="font-serif text-xl">{value}</span>{" "}
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

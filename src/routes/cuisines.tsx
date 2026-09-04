import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cuisineRegions, recipes } from "@/lib/data";
import { RecipeCard } from "@/components/site/RecipeCard";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/cuisines")({
  head: () => ({
    meta: [
      { title: "Cuisines — regional Indian cooking and beyond | Spice N Flavors" },
      {
        name: "description",
        content:
          "North Indian, South Indian, Punjabi, Gujarati, Continental and desserts — explore recipes through the regions and traditions that shape them.",
      },
      { property: "og:title", content: "Where flavor takes you — Spice N Flavors" },
      {
        property: "og:description",
        content: "Explore recipes through the regions, traditions and cuisines that shape them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CuisinesPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function CuisinesPage() {
  return (
    <div className={`${shell} pb-8 pt-8`}>
      <header className="max-w-2xl">
        <p className="eyebrow">Cuisines</p>
        <h1 className="display-lg mt-3">Where flavor takes you.</h1>
        <p className="mt-5 text-muted-foreground">
          Explore recipes through the regions, traditions and cuisines that shape them.
        </p>
      </header>

      <div className="mt-14 space-y-16">
        {cuisineRegions.map((region, i) => {
          const theirs = recipes
            .filter(
              (r) =>
                r.cuisine === region.name ||
                r.category === region.name ||
                r.tags.includes(region.name),
            )
            .slice(0, 3);

          return (
            <Reveal
              key={region.slug}
              as="section"
              className="rule-hair grid gap-8 pt-16 first:border-t-0 first:pt-0 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"
            >
              <div className={i % 2 === 1 ? "lg:order-2 lg:pl-10" : ""}>
                <div className="zoom-media overflow-hidden rounded-[2rem] border border-border">
                  <img
                    src={region.image}
                    alt={`${region.name} cooking`}
                    loading="lazy"
                    className="aspect-4/3 w-full object-cover"
                  />
                </div>
                <h2 className="display-md mt-6">{region.name}</h2>
                <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
                  {region.blurb}
                </p>
                <Link
                  to="/recipes"
                  search={{ q: region.name, category: "All", sort: "relevance" }}
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Browse {region.name}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={1.8}
                  />
                </Link>
              </div>

              <div className={`grid gap-5 sm:grid-cols-3 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                {theirs.map((r, j) => (
                  <div key={r.slug} className={j === 1 ? "sm:mt-8" : ""}>
                    <RecipeCard recipe={r} size="sm" />
                  </div>
                ))}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cuisineRegions } from "@/lib/data";
import { legacyLive } from "@/lib/legacy";
import { legacyCategory } from "@/lib/legacy-categories";
import { buildHead } from "@/lib/seo";
import { LegacyCard } from "@/components/site/LegacyCard";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/cuisines")({
  head: () =>
    buildHead({
      title: "Cuisines — regional Indian cooking and beyond",
      description:
        "North Indian, South Indian, Punjabi, Gujarati, Continental and desserts — explore recipes through the regions that shape them.",
      path: "/cuisines",
    }),
  component: CuisinesPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

/** Region slug -> title keywords over the real (recovered) posts. */
const REGION_KEYWORDS: Record<string, RegExp> = {
  "north-indian":
    /makhani|butter|paneer|tikka|naan|dal|rajma|chole|korma|masala|kebab|paratha|biryani/i,
  "south-indian": /dosa|idli|sambar|rasam|upma|uttapam|chettinad|avial|poriyal|kootu/i,
  punjabi: /paratha|chole|paneer|lassi|samosa|kadhi|rajma|sarson|makki/i,
  gujarati: /dhokla|khaman|thepla|fafda|khandvi|handvo|undhiyu|shrikhand|farsi|khakhra/i,
  continental: /pasta|pizza|bake|baked|salad|soup|sandwich|bread|toast|risotto|penne/i,
  desserts: /./,
};

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
          const matcher = REGION_KEYWORDS[region.slug];
          const theirs = matcher
            ? legacyLive
                .filter((p) =>
                  region.slug === "desserts"
                    ? legacyCategory(p) === "Dessert"
                    : matcher.test(p.title),
                )
                .slice(0, 3)
            : [];

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
                {theirs.map((p, j) => (
                  <div key={p.slug} className={j === 1 ? "sm:mt-8" : ""}>
                    <LegacyCard post={p} size="sm" />
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

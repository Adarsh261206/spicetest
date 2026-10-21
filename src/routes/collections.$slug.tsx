import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { collectionBySlug } from "@/lib/data";
import { legacyCategory } from "@/lib/legacy-categories";
import { legacyLive, type LegacyPost } from "@/lib/legacy";
import { LegacyCard } from "@/components/site/LegacyCard";
import { Reveal } from "@/components/site/Reveal";
import { buildHead, breadcrumbJsonLd } from "@/lib/seo";

/** Mood matchers run over the real (recovered) posts. */
const MATCHERS: Record<string, (p: LegacyPost) => boolean> = {
  "weeknight-indian": (p) => legacyCategory(p) === "Main Course",
  "sunday-biryani": (p) => /biryani|pulao|pulav|pilaf|handi/i.test(p.title),
  "festival-sweets": (p) => legacyCategory(p) === "Dessert",
  "street-food-at-home": (p) => ["Street Food", "Snacks"].includes(legacyCategory(p)),
  "everyday-vegetarian": (p) =>
    !/chicken|mutton|fish|prawn|shrimp|egg|keema|lamb|meat|crab|tandoori/i.test(p.title),
  "coastal-and-coconut": (p) =>
    /fish|prawn|shrimp|coconut|coastal|goan|kerala|mangalore|malabar/i.test(p.title),
  "breakfast-table": (p) => legacyCategory(p) === "Breakfast",
  "slow-sunday": (p) => p.readingTime >= 5,
};

export function postsForCollection(slug: string): LegacyPost[] {
  const match = MATCHERS[slug];
  if (!match) return [];
  return legacyLive.filter(match);
}

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const collection = collectionBySlug(params.slug);
    if (!collection) throw notFound();
    return { collection, items: postsForCollection(collection.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return buildHead({
        title: "Collection unavailable",
        description: "This collection could not be found.",
        path: "/collections",
        noindex: true,
      });
    }
    const { collection } = loaderData;
    return buildHead({
      title: `${collection.name} — ${collection.mood}`,
      description: `${collection.name}: ${collection.mood}.`,
      path: `/collections/${collection.slug}`,
      image: collection.cover,
    });
  },
  component: CollectionPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function CollectionPage() {
  const { collection, items } = Route.useLoaderData();
  const crumbsLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: collection.name, path: `/collections/${collection.slug}` },
  ]);
  return (
    <div className={`${shell} pb-16 pt-8`}>
      <script type="application/ld+json">{JSON.stringify(crumbsLd)}</script>
      <p className="eyebrow">
        <Link to="/collections" className="hover:text-primary">
          Collections
        </Link>{" "}
        / {collection.name}
      </p>
      <h1 className="display-lg mt-3">{collection.name}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        {collection.mood} · {items.length} {items.length === 1 ? "recipe" : "recipes"}
      </p>
      <div className="zoom-media mt-8 overflow-hidden rounded-[2rem] border border-border">
        <img
          src={collection.cover}
          alt={collection.name}
          fetchPriority="high"
          decoding="async"
          className="aspect-16/7 w-full object-cover"
        />
      </div>
      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No recipes in this mood yet — check back soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 70}>
              <LegacyCard post={p} size="sm" />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

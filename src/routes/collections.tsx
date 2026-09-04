import { createFileRoute } from "@tanstack/react-router";
import { collections } from "@/lib/data";
import { CollectionCard } from "@/components/site/CollectionCard";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — save the mood | Spice N Flavors" },
      {
        name: "description",
        content:
          "Weeknight Wonders, Weekend Brunch, Comfort Food and more: curated recipe collections for every kind of day.",
      },
      { property: "og:title", content: "Collections — save the mood" },
      {
        property: "og:description",
        content: "Curated recipe collections for every kind of day.",
      },
    ],
  }),
  component: CollectionsPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function CollectionsPage() {
  return (
    <div className={`${shell} pb-8 pt-8`}>
      <header className="max-w-2xl">
        <p className="eyebrow">Collections</p>
        <h1 className="display-lg mt-3">Save the mood.</h1>
        <p className="mt-5 text-muted-foreground">
          Not every night needs a project. Start from how you want to feel and work backwards to
          dinner.
        </p>
      </header>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 70} className={i % 3 === 1 ? "lg:mt-12" : ""}>
            <div id={c.slug} className="scroll-mt-28">
              <CollectionCard collection={c} tall={i % 3 === 1} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

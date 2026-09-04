import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { creators, recipesByCreator } from "@/lib/data";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/creators/")({
  head: () => ({
    meta: [
      { title: "Viya Sheth — the cook behind the recipes | Spice N Flavors" },
      {
        name: "description",
        content:
          "Viya Sheth cooks, tests and writes every recipe on Spice N Flavors, from Gujarati breakfasts to Hyderabadi dum biryani.",
      },
      { property: "og:title", content: "The person behind the plate" },
      {
        property: "og:description",
        content: "One kitchen, one cook, every recipe tested by hand.",
      },
    ],
  }),
  component: CreatorsPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function CreatorsPage() {
  return (
    <div className={`${shell} pb-8 pt-8`}>
      <header className="max-w-2xl">
        <p className="eyebrow">The cook</p>
        <h1 className="display-lg mt-3">The person behind the plate.</h1>
        <p className="mt-5 text-muted-foreground">
          Every recipe here comes out of one kitchen — cooked, tested and written down by Viya
          Sheth.
        </p>
      </header>

      <div className="mt-14 space-y-14">
        {creators.map((creator, i) => {
          const theirs = recipesByCreator(creator.handle).slice(0, 3);
          return (
            <Reveal
              key={creator.handle}
              as="section"
              className="rule-hair grid gap-8 pt-14 first:border-t-0 first:pt-0 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"
            >
              <div className={i % 2 === 1 ? "lg:order-2 lg:pl-10" : ""}>
                <div className="flex items-center gap-5">
                  <Link
                    to="/creators/$handle"
                    params={{ handle: creator.handle }}
                    className="zoom-media block size-24 shrink-0 overflow-hidden rounded-full border border-border sm:size-32"
                  >
                    <img
                      src={creator.portrait}
                      alt={creator.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <h2 className="display-md">
                      <Link
                        to="/creators/$handle"
                        params={{ handle: creator.handle }}
                        className="hover:text-primary"
                      >
                        {creator.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{creator.specialty}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {theirs.length} recipes · {creator.location}
                    </p>
                  </div>
                </div>
                <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">{creator.bio}</p>
                <Link
                  to="/creators/$handle"
                  params={{ handle: creator.handle }}
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  View profile
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={1.8}
                  />
                </Link>
              </div>

              <div className={`grid grid-cols-3 gap-4 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                {theirs.map((r, j) => (
                  <Link
                    key={r.slug}
                    to="/recipes/$slug"
                    params={{ slug: r.slug }}
                    className={`zoom-media lift block overflow-hidden rounded-2xl border border-border ${j === 1 ? "mt-6" : ""}`}
                  >
                    <img
                      src={r.image}
                      alt={r.title}
                      loading="lazy"
                      className="aspect-3/4 w-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { about, brand, creators, images, spices } from "@/lib/data";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Spice N Flavors — cooking is how we remember" },
      {
        name: "description",
        content:
          "Spice N Flavors is a place for Indian recipes that work, stories worth reading and food traditions worth passing on.",
      },
      { property: "og:title", content: "Cooking is how we remember — Spice N Flavors" },
      {
        property: "og:description",
        content: "Recipes that work, stories worth reading and traditions worth passing on.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function AboutPage() {
  return (
    <div className="pb-10">
      <header className={`${shell} grid gap-12 pt-10 lg:grid-cols-[1fr_0.9fr] lg:items-center`}>
        <div className="max-w-xl">
          <p className="eyebrow">About {brand.name}</p>
          <h1 className="display-xl mt-4">{about.headline}</h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Link
            to="/recipes"
            search={{ q: "", category: "All", sort: "relevance" }}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
          >
            Explore Recipes
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </Link>
        </div>
        <div className="zoom-media overflow-hidden rounded-[2rem] border border-border">
          <img
            src={images.heroSpices}
            alt="Whole spices, fresh herbs and a masala dabba on a wooden counter"
            className="aspect-4/5 w-full object-cover"
          />
        </div>
      </header>

      <Reveal as="section" className="mt-24 bg-vanilla py-16">
        <div className={`${shell} max-w-4xl`}>
          <p className="eyebrow">Tip from the kitchen</p>
          <blockquote className="mt-6 font-serif text-2xl italic leading-relaxed sm:text-3xl">
            &ldquo;{brand.kitchenTip}&rdquo;
          </blockquote>
        </div>
      </Reveal>

      <Reveal as="section" className={`${shell} mt-24`}>
        <h2 className="display-lg">How we write a recipe</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Cook it, then write it",
              text: "Every recipe is cooked in a home kitchen on a domestic hob before it is published — not scaled down from a restaurant version.",
            },
            {
              title: "Explain the why",
              text: "A step that says 'cook until the oil separates' is more useful than a step that says 'cook for eight minutes'. We give both wherever we can.",
            },
            {
              title: "Substitutions that hold",
              text: "Not every kitchen has hing, kokum or fresh curry leaves. We list the swaps that work and say plainly when one doesn't.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-secondary/40 p-6">
              <h3 className="font-serif text-xl">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className={`${shell} mt-24`}>
        <h2 className="display-lg">The person writing it</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {creators.map((c) => (
            <Link
              key={c.handle}
              to="/creators/$handle"
              params={{ handle: c.handle }}
              className="lift group block"
            >
              <div className="zoom-media size-24 overflow-hidden rounded-full border border-border">
                <img
                  src={c.portrait}
                  alt={c.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <h3 className="mt-4 font-serif text-xl group-hover:text-primary">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.specialty}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.location}</p>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mt-24 bg-secondary/70 py-16">
        <div className={shell}>
          <h2 className="display-lg max-w-lg">The spices we keep coming back to.</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spices.map((s) => (
              <li key={s.name} className="flex gap-4">
                <div className="zoom-media size-20 shrink-0 overflow-hidden rounded-xl border border-border">
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-lg">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.notes}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/90">{s.use}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal as="section" className={`${shell} mt-24 max-w-2xl`}>
        <h2 className="display-lg">Get in touch</h2>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          Cooked something from here and it went sideways? Tell us what happened — the failed
          batches teach us more than the good ones. Recipe questions, corrections and collaborations
          all reach the same inbox.
        </p>
        <a
          href="mailto:hello@spicenflavors.com"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:bg-vanilla"
        >
          hello@spicenflavors.com
        </a>
      </Reveal>
    </div>
  );
}

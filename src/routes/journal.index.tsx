import { createFileRoute, Link } from "@tanstack/react-router";
import { articles, creatorByHandle, featuredArticle } from "@/lib/data";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "The Journal — cooking guides and kitchen notes | Spice N Flavors" },
      {
        name: "description",
        content:
          "Kitchen tips, cooking guides and ingredient stories: spice boxes, dosa fermentation, tempering, basmati rice and how to get real char on chicken.",
      },
      { property: "og:title", content: "From the kitchen — the Spice N Flavors journal" },
      {
        property: "og:description",
        content: "Cooking guides, kitchen tips and ingredient stories written by people who cook.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JournalPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function JournalPage() {
  const rest = articles.filter((a) => a.slug !== featuredArticle.slug);

  return (
    <div className={`${shell} pb-8 pt-8`}>
      <header className="max-w-2xl">
        <p className="eyebrow">Journal</p>
        <h1 className="display-lg mt-3">From the kitchen.</h1>
        <p className="mt-5 text-muted-foreground">
          Technique, ingredients and the small decisions that separate a dish that works from one
          that nearly does.
        </p>
      </header>

      <Reveal className="mt-12">
        <Link
          to="/journal/$slug"
          params={{ slug: featuredArticle.slug }}
          className="lift group grid overflow-hidden rounded-[2rem] border border-border lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="zoom-media overflow-hidden">
            <img
              src={featuredArticle.image}
              alt={featuredArticle.title}
              className="aspect-16/10 size-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8">
            <p className="eyebrow">{featuredArticle.category}</p>
            <h2 className="display-md mt-3">{featuredArticle.title}</h2>
            <p className="mt-4 text-muted-foreground">{featuredArticle.excerpt}</p>
            <p className="mt-5 text-xs text-muted-foreground">
              {creatorByHandle(featuredArticle.author)?.name} · {featuredArticle.readingTime} min
              read
            </p>
          </div>
        </Link>
      </Reveal>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a, i) => (
          <Reveal key={a.slug} delay={i * 60}>
            <Link to="/journal/$slug" params={{ slug: a.slug }} className="lift group block">
              <div className="zoom-media overflow-hidden rounded-2xl border border-border">
                <img
                  src={a.image}
                  alt={a.title}
                  loading="lazy"
                  className="aspect-4/3 w-full object-cover"
                />
              </div>
              <p className="eyebrow mt-4">{a.category}</p>
              <h3 className="mt-2 font-serif text-xl leading-snug group-hover:text-primary">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
              <p className="mt-3 text-xs text-muted-foreground">{a.readingTime} min read</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

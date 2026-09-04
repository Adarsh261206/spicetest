import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { articleBySlug, articles, creatorByHandle } from "@/lib/data";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const article = articleBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Article unavailable — Spice N Flavors" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { article } = loaderData;
    const title = `${article.title} — ${article.category} | Spice N Flavors`;
    return {
      meta: [
        { title },
        { name: "description", content: article.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: article.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticlePage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const author = creatorByHandle(article.author);
  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article className="pb-10">
      <header className={`${shell} pt-8`}>
        <div className="max-w-3xl">
          <p className="eyebrow">{article.category}</p>
          <h1 className="display-lg mt-4">{article.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
          <p className="mt-6 text-sm text-muted-foreground">
            {author?.name} · {article.readingTime} min read
          </p>
        </div>
        <div className="zoom-media mt-10 overflow-hidden rounded-[2rem] border border-border">
          <img
            src={article.image}
            alt={article.title}
            className="aspect-16/9 w-full object-cover"
          />
        </div>
      </header>

      <div className={`${shell} mt-14 max-w-3xl`}>
        {article.body.map((block, i) => (
          <section key={i} className="mt-10 first:mt-0">
            {block.heading && <h2 className="display-md">{block.heading}</h2>}
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{block.text}</p>
          </section>
        ))}
      </div>

      <Reveal as="section" className={`${shell} mt-20`}>
        <h2 className="display-lg">Keep reading</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((a) => (
            <Link
              key={a.slug}
              to="/journal/$slug"
              params={{ slug: a.slug }}
              className="lift group block"
            >
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
            </Link>
          ))}
        </div>
      </Reveal>
    </article>
  );
}

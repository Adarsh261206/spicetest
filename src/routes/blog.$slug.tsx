import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChefHat, Share2 } from "lucide-react";
import { articleBySlug, articles, creatorByHandle } from "@/lib/data";
import { legacyCategory } from "@/lib/legacy-categories";
import { scaleIngredientText } from "@/lib/scale";
import { cn } from "@/lib/utils";
import { formatLegacyDate, legacyBody, legacyBySlug, legacyCover, legacyPosts } from "@/lib/legacy";
import { getPublishedPostFn } from "@/lib/posts.api";
import type { DbPostPublic } from "@/lib/blocks";
import { PostBody } from "@/components/site/PostBody";
import { Reveal } from "@/components/site/Reveal";
import { AD_SLOTS, AdSlot } from "@/components/site/Monetization";
import { CookingMode, slidesFromBlocks, slidesFromHtml } from "@/components/site/CookingMode";
import { buildHead, articleJsonLd, breadcrumbJsonLd, toAbsolute } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const article = articleBySlug(params.slug);
    if (article) return { kind: "article" as const, article };
    const legacy = legacyBySlug(params.slug);
    if (legacy) return { kind: "legacy" as const, legacy };
    const fresh = await getPublishedPostFn({ data: { slug: params.slug } });
    if (fresh) return { kind: "fresh" as const, fresh };
    throw notFound();
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return buildHead({
        title: "Article unavailable",
        description: "This article could not be found.",
        path: "/blog",
        noindex: true,
      });
    }
    if (loaderData.kind === "legacy") {
      const { legacy } = loaderData;
      return buildHead({
        title: `${legacy.title} — recipe`,
        description: legacy.excerpt,
        path: `/blog/${legacy.slug}`,
        image: legacyCover(legacy),
        type: "article",
        // Draft recoveries stay reachable for review but out of the index.
        noindex: legacy.draft ? true : undefined,
        keywords: [legacyCategory(legacy), ...legacy.tags].filter(Boolean).join(", ") || undefined,
      });
    }
    if (loaderData.kind === "fresh") {
      const { fresh } = loaderData;
      return buildHead({
        title: `${fresh.title} — recipe`,
        description: fresh.excerpt,
        path: `/blog/${fresh.slug}`,
        image: fresh.coverUrl ?? undefined,
        type: "article",
      });
    }
    const { article } = loaderData;
    return buildHead({
      title: `${article.title} — ${article.category}`,
      description: article.excerpt,
      path: `/blog/${article.slug}`,
      image: article.image,
      type: "article",
    });
  },
  component: ArticlePage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";

function ArticlePage() {
  const data = Route.useLoaderData();
  if (data.kind === "legacy") return <LegacyArticlePage slug={data.legacy.slug} />;
  if (data.kind === "fresh") return <FreshArticlePage post={data.fresh} />;
  return <CuratedArticlePage slug={data.article.slug} />;
}

function CuratedArticlePage({ slug }: { slug: string }) {
  const article = articleBySlug(slug)!;
  const author = creatorByHandle(article.author);
  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 3);
  const [cookingOpen, setCookingOpen] = useState(false);
  const ld = articleJsonLd({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    image: article.image,
    author: author?.name,
    authorUrl: author ? toAbsolute(`/creators/${author.handle}`) : undefined,
  });
  const slides = useMemo(
    () =>
      slidesFromBlocks(
        article.body.flatMap((b) => [
          ...(b.heading ? [{ type: "heading" as const, text: b.heading }] : []),
          { type: "paragraph" as const, text: b.text },
        ]),
      ),
    [article],
  );

  const crumbsLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Stories", path: "/blog" },
    { name: article.title, path: `/blog/${article.slug}` },
  ]);

  return (
    <article className="pb-10">
      <script type="application/ld+json">{JSON.stringify(ld)}</script>
      <script type="application/ld+json">{JSON.stringify(crumbsLd)}</script>
      <header className={`${shell} pt-8`}>
        <nav aria-label="Breadcrumb">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            {" / "}
            <Link to="/blog" className="hover:text-primary">
              Stories
            </Link>
          </p>
        </nav>
        <div className="mt-4 max-w-3xl">
          <p className="eyebrow">{article.category}</p>
          <h1 className="display-lg mt-4">{article.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
          <p className="mt-6 text-sm text-muted-foreground">
            {author?.name} · {article.readingTime} min read
          </p>
          <CookModeButton onOpen={() => setCookingOpen(true)} />
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
        <AdSlot format="in-article" slot={AD_SLOTS.article} />
      </div>

      <Reveal as="section" className={`${shell} mt-20`}>
        <h2 className="display-lg">Keep reading</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((a) => (
            <Link
              key={a.slug}
              to="/blog/$slug"
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

      <CookingMode
        title={article.title}
        slides={slides}
        open={cookingOpen}
        onClose={() => setCookingOpen(false)}
      />
    </article>
  );
}

function CookModeButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c96f4a] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#b25f3d] active:scale-95"
    >
      <ChefHat className="size-4" strokeWidth={1.8} />
      Cooking mode
    </button>
  );
}

function LegacyArticlePage({ slug }: { slug: string }) {
  const legacy = legacyBySlug(slug)!;
  const author = creatorByHandle("viya-sheth");
  const body = useMemo(() => legacyBody(legacy), [legacy]);
  const { intro, sections, photos } = useMemo(() => parseLegacySections(body), [body]);
  const [cookingOpen, setCookingOpen] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const [scale, setScale] = useState(1);
  const slides = useMemo(() => slidesFromHtml(body), [body]);
  const ld = articleJsonLd({
    slug: legacy.slug,
    title: legacy.title,
    excerpt: legacy.excerpt,
    image: legacyCover(legacy),
    author: author?.name,
    authorUrl: author ? toAbsolute(`/creators/${author.handle}`) : undefined,
    date: legacy.date,
    modified: legacy.updated,
    readingTime: legacy.readingTime,
  });

  const more = useMemo(
    () =>
      legacyPosts
        .filter((p) => p.slug !== slug)
        .map((p) => ({
          p,
          score: relatedScore(legacy, p),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ p }) => p),
    [slug, legacy],
  );

  const ingredients = sections.filter((s) => s.kind === "ingredients");
  const methods = sections.filter((s) => s.kind === "method");
  const others = sections.filter((s) => s.kind === "other");
  const extras = others.filter((s) => s.items.length > 0);
  const cookIngredients = useMemo(
    () =>
      ingredients.flatMap((s) =>
        s.items.map((item) => ({
          name: item
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim(),
        })),
      ),
    [ingredients],
  );
  const hasInstructions = methods.some((s) => s.items.length > 0 || s.html) || extras.length > 0;
  let stepNo = 0;
  let ingNo = 0;

  return (
    <article className="pb-10">
      <script type="application/ld+json">{JSON.stringify(ld)}</script>

      {/* HERO — same dark editorial band as new recipes */}
      <div className="bg-[#1c1815] text-[#f3ede2] print:bg-white print:text-black">
        <div className={`${shell} pb-10 pt-6`}>
          <nav aria-label="Breadcrumb">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 print:text-black">
              <Link to="/" className="hover:text-white">
                Home
              </Link>{" "}
              /{" "}
              <Link
                to="/recipes"
                search={{ q: "", category: "All", sort: "relevance" }}
                className="hover:text-white"
              >
                Recipes
              </Link>{" "}
              / {legacy.title}
            </p>
          </nav>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  {legacyCategory(legacy) || "Recipe"}
                </span>
                {legacy.draft && (
                  <span className="rounded-full bg-vanilla px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Draft
                  </span>
                )}
              </div>
              <h1 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">
                {legacy.title}
              </h1>
              <p className="mt-4 max-w-md leading-relaxed text-white/70 print:text-black">
                {legacy.excerpt}
              </p>
              <p className="mt-5 text-sm text-white/60">
                {author?.name}
                {formatLegacyDate(legacy.date) ? ` · ${formatLegacyDate(legacy.date)}` : ""} ·{" "}
                {legacy.readingTime} min read
              </p>
              <div className="mt-8 flex flex-wrap gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.share) {
                      void navigator.share({ title: legacy.title, url: window.location.href });
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-white/60"
                >
                  <Share2 className="size-4" strokeWidth={1.6} />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-white/60"
                >
                  Print
                </button>
                <a
                  href="#recipe"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-white/60"
                >
                  Jump to recipe
                </a>
                <button
                  type="button"
                  onClick={() => setCookingOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#c96f4a] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#b25f3d] active:scale-95"
                >
                  <ChefHat className="size-4" strokeWidth={1.8} />
                  Cooking mode
                </button>
              </div>
            </div>
            <div className="zoom-media overflow-hidden rounded-[2rem]">
              <img
                src={legacyCover(legacy)}
                alt={legacy.title}
                fetchPriority="high"
                decoding="async"
                className="aspect-4/3 w-full object-cover lg:aspect-4/5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BODY — structured like new recipes */}
      <div
        id="recipe"
        className={`${shell} mt-14 grid scroll-mt-24 gap-14 lg:grid-cols-[0.92fr_1.08fr]`}
      >
        <div className="space-y-12">
          {intro && (
            <section>
              <h2 className="display-md">About this recipe</h2>
              <div className="legacy-post mt-4" dangerouslySetInnerHTML={{ __html: intro }} />
            </section>
          )}

          {photos.length > 0 && (
            <section aria-label="Step photos">
              <div className={photos.length > 1 ? "grid gap-4 sm:grid-cols-2" : ""}>
                {photos.map((ph, i) => (
                  <figure
                    key={i}
                    className="overflow-hidden rounded-2xl border border-border bg-secondary/40"
                  >
                    <img
                      src={ph.src}
                      alt={ph.caption || `${legacy.title} — photo ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="aspect-4/3 w-full object-cover"
                    />
                    {ph.caption && (
                      <figcaption className="px-4 py-2.5 font-serif text-sm italic text-muted-foreground">
                        {ph.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {(() => {
            // Blueprint §4 (L2): recovered posts carry no tags, so derive
            // topic links from the title — every page gets crawlable links.
            const stop = new Set([
              "with",
              "from",
              "that",
              "this",
              "your",
              "recipe",
              "recipes",
              "easy",
              "best",
              "homemade",
              "indian",
              "spice",
              "flavors",
              "flavours",
              "blog",
              "make",
              "made",
              "using",
            ]);
            const topics =
              legacy.tags.length > 0
                ? legacy.tags
                : [
                    ...new Set(
                      legacy.title
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, " ")
                        .split(/\s+/)
                        .filter((w) => w.length >= 4 && !stop.has(w)),
                    ),
                  ].slice(0, 5);
            if (topics.length === 0) return null;
            return (
              <section>
                <h2 className="display-md">Tags</h2>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                  {topics.map((t) => (
                    <li key={t}>
                      <Link
                        to="/recipes"
                        search={{ q: t }}
                        className="inline-block rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-tea hover:text-accent-foreground"
                      >
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })()}

          {ingredients.map((s, si) => (
            <section key={`ing-${si}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="display-md">{s.heading || "Ingredients"}</h2>
                <div
                  className="flex items-center gap-1 rounded-full border border-border p-1"
                  role="group"
                  aria-label="Scale quantities"
                >
                  {[1, 2, 3].map((n) => (
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
              {s.html && (
                <div className="legacy-post mt-4" dangerouslySetInnerHTML={{ __html: s.html }} />
              )}
              <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-secondary/40">
                {s.items.map((item) => {
                  const idx = ingNo++;
                  const done = checked.includes(idx);
                  return (
                    <li key={idx}>
                      <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-vanilla/50">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() =>
                            setChecked((c) =>
                              c.includes(idx) ? c.filter((x) => x !== idx) : [...c, idx],
                            )
                          }
                          className="size-4 shrink-0 accent-primary"
                        />
                        <span className={done ? "text-muted-foreground line-through" : undefined}>
                          {scaleIngredientText(item, scale)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {others
            .filter((s) => s.html && !s.items.length)
            .map((s, si) => (
              <section key={`note-${si}`}>
                <h2 className="display-md">{s.heading || "Notes"}</h2>
                <div className="legacy-post mt-4" dangerouslySetInnerHTML={{ __html: s.html }} />
              </section>
            ))}
        </div>

        <section className="lg:pl-6">
          {hasInstructions && (
            <>
              <h2 className="display-md">Instructions</h2>
              {methods.some((s) => s.html) && (
                <div className="legacy-post mt-4">
                  {methods.map((s, si) =>
                    s.html ? (
                      <div key={`lead-${si}`} dangerouslySetInnerHTML={{ __html: s.html }} />
                    ) : null,
                  )}
                </div>
              )}
              {methods.length > 0 && methods.some((s) => s.items.length > 0) ? (
                <ol className="mt-8 space-y-8">
                  {methods.flatMap((s, si) =>
                    s.items.map((item) => {
                      stepNo += 1;
                      const n = stepNo;
                      return (
                        <li
                          key={`step-${si}-${n}`}
                          className="rule-hair grid grid-cols-[3rem_1fr] gap-4 pt-8 first:border-t-0 first:pt-0"
                        >
                          <span className="font-serif text-3xl text-primary">
                            {String(n).padStart(2, "0")}
                          </span>
                          <div
                            className="legacy-post-step min-w-0 text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </li>
                      );
                    }),
                  )}
                </ol>
              ) : (
                <div className="legacy-post mt-6">
                  {methods.map((s, si) => (
                    <div key={`m-${si}`}>
                      {s.heading && <h3>{s.heading}</h3>}
                      {s.html && <div dangerouslySetInnerHTML={{ __html: s.html }} />}
                    </div>
                  ))}
                </div>
              )}
              {extras.map((s, si) => (
                <div key={`extra-${si}`} className="mt-10">
                  {s.heading && <h3 className="display-md">{s.heading}</h3>}
                  {s.html && (
                    <div
                      className="legacy-post mt-4"
                      dangerouslySetInnerHTML={{ __html: s.html }}
                    />
                  )}
                  <ul
                    className="legacy-post mt-4"
                    dangerouslySetInnerHTML={{
                      __html: s.items.map((i) => `<li>${i}</li>`).join(""),
                    }}
                  />
                </div>
              ))}
            </>
          )}
        </section>
      </div>

      <div className={`${shell} mt-10 max-w-3xl`}>
        <AdSlot format="in-article" slot={AD_SLOTS.article} />
      </div>

      <CookingMode
        title={legacy.title}
        slides={slides}
        ingredients={cookIngredients.length > 0 ? cookIngredients : undefined}
        open={cookingOpen}
        onClose={() => setCookingOpen(false)}
      />

      <Reveal as="section" className={`${shell} mt-20`}>
        <h2 className="display-lg">Cook this next</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((a) => (
            <Link
              key={a.slug}
              to="/blog/$slug"
              params={{ slug: a.slug }}
              className="lift group block"
            >
              <div className="zoom-media overflow-hidden rounded-2xl border border-border">
                <img
                  src={legacyCover(a)}
                  alt={a.title}
                  loading="lazy"
                  className="aspect-4/3 w-full object-cover"
                />
              </div>
              <p className="eyebrow mt-4">{legacyCategory(a) || "Recipe"}</p>
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

type LegacySection = {
  heading: string;
  kind: "ingredients" | "method" | "other";
  items: string[];
  html: string;
};

type LegacyPhoto = { src: string; caption: string };

const WORD_STOP = new Set([
  "with",
  "from",
  "that",
  "this",
  "your",
  "recipe",
  "recipes",
  "easy",
  "best",
  "homemade",
  "indian",
  "spice",
  "flavors",
  "flavours",
  "blog",
]);

/** Relatedness for archive posts (categories are generic — use title/tag keywords). */
function relatedScore(
  a: { title: string; tags: string[] },
  b: { title: string; tags: string[] },
): number {
  const words = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !WORD_STOP.has(w));
  const aw = new Set([...words(a.title), ...a.tags.flatMap(words)]);
  let score = 0;
  for (const w of new Set([...words(b.title), ...b.tags.flatMap(words)])) {
    if (aw.has(w)) score += w.length >= 6 ? 2 : 1;
  }
  return score;
}

/** Split normalized legacy HTML into intro + headed sections (ingredients / method / notes). */
function parseLegacySections(body: string): {
  intro: string;
  sections: LegacySection[];
  photos: LegacyPhoto[];
} {
  const photos: LegacyPhoto[] = [];
  const pullPhotos = (html: string): string =>
    html.replace(/<figure>([\s\S]*?)<\/figure>/gi, (_m, inner: string) => {
      const src = inner.match(/<img\b[^>]*src="([^"]*)"/i)?.[1] ?? "";
      const caption = (inner.match(/<figcaption>([\s\S]*?)<\/figcaption>/i)?.[1] ?? "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (src) photos.push({ src, caption });
      return "";
    });
  const chunks = pullPhotos(body).split(/(<h3>.*?<\/h3>)/gis);
  const intro = (chunks[0] ?? "").trim();
  const sections: LegacySection[] = [];
  for (let i = 1; i < chunks.length; i += 2) {
    const heading = (chunks[i] ?? "")
      .replace(/<\/?h3>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const content = chunks[i + 1] ?? "";
    const lower = heading.toLowerCase();
    const kind: LegacySection["kind"] = /ingred/.test(lower)
      ? "ingredients"
      : /method|proced|preparat|direction|instruction|\bstep\b|how to make/.test(lower)
        ? "method"
        : "other";
    const items = [...content.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
      .map((m) => (m[1] ?? "").trim())
      .filter((h) => h.replace(/<[^>]+>/g, "").trim());
    const html = pullPhotos(content.replace(/<(ul|ol)>[\s\S]*?<\/\1>/gi, "")).trim();
    sections.push({ heading, kind, items, html });
  }
  return { intro, sections, photos };
}

function FreshArticlePage({ post }: { post: DbPostPublic }) {
  const [cookingOpen, setCookingOpen] = useState(false);
  const slides = useMemo(() => slidesFromBlocks(post.body), [post.body]);
  const ld = articleJsonLd({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.coverUrl,
    author: post.author,
    authorUrl: post.author === "Viya Sheth" ? toAbsolute("/creators/viya-sheth") : undefined,
    date: post.date,
    readingTime: post.readingTime,
  });
  const crumbsLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Stories", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  // Blueprint §4 (L4): fresh posts get the same word-overlap rail as legacy.
  const more = useMemo(() => {
    const pool: { slug: string; title: string; tags: string[]; image: string; label: string }[] = [
      ...legacyPosts
        .filter((p) => !p.draft && p.slug !== post.slug)
        .map((p) => ({
          slug: p.slug,
          title: p.title,
          tags: p.tags,
          image: legacyCover(p),
          label: legacyCategory(p) || "Recipe",
        })),
      ...articles
        .filter((a) => a.slug !== post.slug)
        .map((a) => ({
          slug: a.slug,
          title: a.title,
          tags: [] as string[],
          image: a.image,
          label: a.category,
        })),
    ];
    return pool
      .map((c) => ({ c, score: relatedScore(post, c) }))
      .filter(({ score }) => score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, 3)
      .map(({ c }) => c);
  }, [post]);
  return (
    <article className="pb-10">
      <script type="application/ld+json">{JSON.stringify(ld)}</script>
      <script type="application/ld+json">{JSON.stringify(crumbsLd)}</script>
      <header className={`${shell} pt-8`}>
        <nav aria-label="Breadcrumb">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            {" / "}
            <Link to="/blog" className="hover:text-primary">
              Stories
            </Link>
          </p>
        </nav>
        <div className="mt-4 max-w-3xl">
          <p className="eyebrow">{post.category}</p>
          <h1 className="display-lg mt-4">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          )}
          <p className="mt-6 text-sm text-muted-foreground">
            {post.author}
            {formatLegacyDate(post.date) ? ` · ${formatLegacyDate(post.date)}` : ""} ·{" "}
            {post.readingTime} min read
          </p>
          {post.tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t}>
                  <Link
                    to="/recipes"
                    search={{ q: t }}
                    className="inline-block rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-tea hover:text-accent-foreground"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <CookModeButton onOpen={() => setCookingOpen(true)} />
        </div>
        {post.coverUrl && (
          <div className="zoom-media mt-10 overflow-hidden rounded-[2rem] border border-border">
            <img src={post.coverUrl} alt={post.title} className="aspect-16/9 w-full object-cover" />
          </div>
        )}
      </header>

      <div className={`${shell} legacy-post mt-14 max-w-3xl`}>
        <PostBody blocks={post.body} />
        <AdSlot format="in-article" slot={AD_SLOTS.article} />
      </div>

      {more.length > 0 && (
        <Reveal as="section" className={`${shell} mt-20`}>
          <h2 className="display-lg">Cook this next</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((a) => (
              <Link
                key={a.slug}
                to="/blog/$slug"
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
                <p className="eyebrow mt-4">{a.label}</p>
                <h3 className="mt-2 font-serif text-xl leading-snug group-hover:text-primary">
                  {a.title}
                </h3>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <CookingMode
        title={post.title}
        slides={slides}
        open={cookingOpen}
        onClose={() => setCookingOpen(false)}
      />
    </article>
  );
}

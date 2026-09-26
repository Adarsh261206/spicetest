import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { articles, creatorByHandle, featuredArticle } from "@/lib/data";
import { formatLegacyDate, legacyCover, legacyPosts, legacyYears } from "@/lib/legacy";
import { listPublishedPostsFn } from "@/lib/posts.api";
import type { DbPostPublic } from "@/lib/blocks";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog/")({
  loader: async () => ({ fresh: await listPublishedPostsFn() }),
  head: () => ({
    meta: [
      { title: "The Blog — cooking guides and kitchen notes | Spice N Flavors" },
      {
        name: "description",
        content:
          "Kitchen tips, cooking guides and ingredient stories: spice boxes, dosa fermentation, tempering, basmati rice and how to get real char on chicken.",
      },
      { property: "og:title", content: "From the kitchen — the Spice N Flavors blog" },
      {
        property: "og:description",
        content: "Cooking guides, kitchen tips and ingredient stories written by people who cook.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogPage,
});

const shell = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";
const PAGE_SIZE = 12;

function BlogPage() {
  const { fresh } = Route.useLoaderData();
  // Fresh admin posts first; the hand-written guides fill in until there are some.
  const rest = fresh.length > 0 ? [] : articles.filter((a) => a.slug !== featuredArticle.slug);

  return (
    <div className={`${shell} pb-8 pt-8`}>
      <header className="max-w-2xl">
        <p className="eyebrow">Blog</p>
        <h1 className="display-lg mt-3">From the kitchen.</h1>
        <p className="mt-5 text-muted-foreground">
          Technique, ingredients and the small decisions that separate a dish that works from one
          that nearly does.
        </p>
      </header>

      <Reveal className="mt-12">
        <Link
          to="/blog/$slug"
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

      {fresh.length > 0 && (
        <section aria-label="Latest posts" className="mt-14">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {fresh.map((p: DbPostPublic, i: number) => (
              <FreshCard key={p.slug} post={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a, i) => (
          <Reveal key={a.slug} delay={i * 60}>
            <Link to="/blog/$slug" params={{ slug: a.slug }} className="lift group block">
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

      <ArchiveSection />
    </div>
  );
}

function FreshCard({ post: p, index }: { post: DbPostPublic; index: number }) {
  return (
    <Reveal delay={index * 60}>
      <Link to="/blog/$slug" params={{ slug: p.slug }} className="lift group block">
        <div className="zoom-media overflow-hidden rounded-2xl border border-border">
          {p.coverUrl ? (
            <img
              src={p.coverUrl}
              alt={p.title}
              loading="lazy"
              className="aspect-4/3 w-full object-cover"
            />
          ) : (
            <span className="grid aspect-4/3 w-full place-items-center bg-secondary font-serif text-2xl text-muted-foreground">
              {p.title.slice(0, 1)}
            </span>
          )}
        </div>
        <p className="eyebrow mt-4">{p.category}</p>
        <h3 className="mt-2 font-serif text-xl leading-snug group-hover:text-primary">{p.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {p.excerpt}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {formatLegacyDate(p.date)}
          {formatLegacyDate(p.date) ? " · " : ""}
          {p.readingTime} min read
        </p>
      </Link>
    </Reveal>
  );
}

function ArchiveSection() {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("All");
  const [page, setPage] = useState(0);

  const term = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return legacyPosts.filter((p) => {
      if (year !== "All") {
        const y = p.date ? p.date.slice(0, 4) : "Unknown";
        if (y !== year) return false;
      }
      if (!term) return true;
      const hay = [p.title, p.category, p.excerpt, ...p.tags].join(" ").toLowerCase();
      return term.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [term, year]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <section aria-label="From the archive" className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Archive</p>
          <h2 className="display-lg mt-3">From the old blog.</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every recipe from spicenflavors.com, preserved as it was — {legacyPosts.length} posts
            from 2012 onwards.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "post" : "posts"}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div
          role="search"
          className="flex flex-1 items-center gap-3 rounded-full border border-border bg-secondary/40 py-2 pl-5 pr-4 transition-colors focus-within:border-primary"
        >
          <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.6} />
          <label htmlFor="archive-search" className="sr-only">
            Search the archive
          </label>
          <input
            id="archive-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search 140+ old recipes… try “biryani” or “cake”"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-hidden placeholder:text-muted-foreground/80"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Year
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(0);
            }}
            className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-hidden focus:border-primary"
          >
            <option value="All">All years</option>
            {legacyYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Nothing matched. Try a different search or year.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="lift group block"
            >
              <div className="zoom-media relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={legacyCover(p)}
                  alt={p.title}
                  loading="lazy"
                  className="aspect-4/3 w-full object-cover"
                />
                {p.draft && (
                  <span className="absolute left-3 top-3 rounded-full bg-vanilla px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Draft
                  </span>
                )}
              </div>
              <p className="eyebrow mt-4">{p.category}</p>
              <h3 className="mt-2 font-serif text-xl leading-snug group-hover:text-primary">
                {p.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {p.excerpt}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatLegacyDate(p.date)}
                {formatLegacyDate(p.date) ? " · " : ""}
                {p.readingTime} min read
              </p>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Archive pages" className="mt-12 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
              safePage === 0
                ? "cursor-not-allowed opacity-40"
                : "hover:border-primary hover:bg-secondary",
            )}
          >
            ← Newer
          </button>
          {Array.from({ length: pages }, (_, i) => i)
            .filter((i) => i === 0 || i === pages - 1 || Math.abs(i - safePage) <= 1)
            .reduce<(number | "…")[]>((acc, i, idx, arr) => {
              if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push("…");
              acc.push(i);
              return acc;
            }, [])
            .map((i, k) =>
              i === "…" ? (
                <span key={`gap-${k}`} className="px-1 text-sm text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={i}
                  type="button"
                  aria-current={i === safePage ? "page" : undefined}
                  onClick={() => setPage(i)}
                  className={cn(
                    "size-9 rounded-full border text-sm transition-colors",
                    i === safePage
                      ? "border-primary bg-tea font-semibold text-accent-foreground"
                      : "border-border hover:border-primary",
                  )}
                >
                  {i + 1}
                </button>
              ),
            )}
          <button
            type="button"
            disabled={safePage === pages - 1}
            onClick={() => setPage(safePage + 1)}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
              safePage === pages - 1
                ? "cursor-not-allowed opacity-40"
                : "hover:border-primary hover:bg-secondary",
            )}
          >
            Older →
          </button>
        </nav>
      )}
    </section>
  );
}

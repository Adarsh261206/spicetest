import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChefHat, Sparkles } from "lucide-react";
import { legacyLive } from "@/lib/legacy";
import { legacyCategory } from "@/lib/legacy-categories";
import { scoreItems } from "@/lib/ai/enhance";

const prompts = [
  "What can I make in 20 minutes?",
  "Paneer, tomatoes and cumin",
  "High-protein vegetarian dinner",
  "Chicken without onion or garlic",
];

export type ArchiveMatch = {
  slug: string;
  title: string;
  label: string;
  score: number;
  hits: string[];
};

/** Blueprint §6 (I5): keyword matching across every recovered post. */
export function matchArchive(input: string, limit = 5): ArchiveMatch[] {
  return scoreItems(
    input,
    legacyLive.map((p) => ({
      slug: p.slug,
      title: p.title,
      tags: p.tags,
      label: legacyCategory(p) || "Recipe",
    })),
    { limit },
  ).map(({ item, score, hits }) => ({
    slug: item.slug,
    title: item.title,
    label: item.label,
    score,
    hits,
  }));
}

export function AIRecipeAssistant() {
  const [value, setValue] = useState("");
  const [matches, setMatches] = useState<ArchiveMatch[] | null>(null);
  const [searched, setSearched] = useState("");

  const run = (input: string) => {
    const q = input.trim();
    setSearched(q);
    setMatches(q ? matchArchive(q) : null);
  };

  return (
    <div className="grid gap-10 rounded-3xl border border-border bg-tea/45 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="max-w-md space-y-4">
        <p className="eyebrow">Sous chef</p>
        <h2 className="display-lg">Your sous chef, whenever you need it.</h2>
        <p className="text-muted-foreground">
          Tell us what you have. We&apos;ll match it against every recipe on this site.
        </p>
        <div className="hidden items-center gap-3 pt-2 text-sm text-muted-foreground lg:flex">
          <ChefHat className="size-5 text-primary" strokeWidth={1.5} />
          Searches all {legacyLive.length} recipes on Spice N Flavors.
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
          }}
          className="space-y-4"
        >
          <label htmlFor="kitchen" className="eyebrow block">
            What do you have in your kitchen?
          </label>
          <textarea
            id="kitchen"
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paneer, tomatoes, cumin and leftover rice"
            className="w-full resize-none rounded-xl border border-border bg-secondary/50 p-4 text-base outline-hidden placeholder:text-muted-foreground/70 focus:border-primary"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
          >
            <Sparkles className="size-4" strokeWidth={1.8} />
            Find my recipes
          </button>
        </form>

        <div aria-live="polite">
          {matches !== null && (
            <div className="mt-5">
              {matches.length > 0 ? (
                <ul className="space-y-3">
                  {matches.map((a) => (
                    <li key={a.slug} className="rounded-xl border border-border bg-vanilla/70 p-4">
                      <Link
                        to="/blog/$slug"
                        params={{ slug: a.slug }}
                        className="group flex items-center justify-between gap-3"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-serif text-lg leading-snug group-hover:text-primary">
                            {a.title}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{a.label}</span>
                            {a.hits.length > 0 && (
                              <>
                                <span aria-hidden>·</span>
                                <span>matches {a.hits.slice(0, 3).join(", ")}</span>
                              </>
                            )}
                          </span>
                        </span>
                        <ArrowRight
                          className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                          strokeWidth={1.8}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-border bg-vanilla/70 p-4 text-sm leading-relaxed">
                  Nothing with “{searched}” yet — try fewer ingredients, or browse{" "}
                  <Link
                    to="/recipes"
                    search={{ q: "", category: "All", sort: "relevance" }}
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    all recipes
                  </Link>
                  .
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          {prompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setValue(p);
                run(p);
              }}
              className="rounded-full border border-border bg-vanilla/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

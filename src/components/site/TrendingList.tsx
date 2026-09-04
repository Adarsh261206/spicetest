import { Link } from "@tanstack/react-router";
import { Clock, Flame } from "lucide-react";
import { creatorByHandle, type Recipe } from "@/lib/data";

export function TrendingList({ items }: { items: Recipe[] }) {
  return (
    <ol className="grid gap-x-10 gap-y-0 md:grid-cols-2">
      {items.map((recipe, i) => {
        const creator = creatorByHandle(recipe.creator);
        return (
          <li key={recipe.slug} className="group border-b border-border">
            <Link
              to="/recipes/$slug"
              params={{ slug: recipe.slug }}
              className="flex items-center gap-4 py-4 transition-colors duration-300 sm:gap-6"
            >
              <span className="w-8 shrink-0 font-serif text-lg text-muted-foreground transition-colors group-hover:text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="zoom-media size-16 shrink-0 overflow-hidden rounded-xl border border-border sm:size-20">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg">{recipe.title}</h3>
                <p className="truncate text-xs text-muted-foreground">
                  {recipe.cuisine} · {recipe.category} · {creator?.name}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-4 text-xs text-muted-foreground sm:flex">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" strokeWidth={1.6} />
                  {recipe.minutes}m
                </span>
                <span className="inline-flex items-center gap-1">
                  <Flame className="size-3.5 text-primary" strokeWidth={1.6} />
                  {recipe.difficulty}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

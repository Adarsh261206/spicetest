import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import { type Recipe } from "@/lib/data";
import { SaveButton } from "./SaveButton";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const ratio: Record<Size, string> = {
  sm: "aspect-[4/3]",
  md: "aspect-[4/5]",
  lg: "aspect-[4/5] md:aspect-[16/11]",
};

export function RecipeCard({
  recipe,
  size = "md",
  className,
  eager = false,
}: {
  recipe: Recipe;
  size?: Size;
  className?: string;
  eager?: boolean;
}) {
  return (
    <article className={cn("group", className)}>
      <Link
        to="/recipes/$slug"
        params={{ slug: recipe.slug }}
        className="lift block overflow-hidden rounded-3xl border border-border bg-secondary/40"
      >
        <div className={cn("zoom-media relative", ratio[size])}>
          <img
            src={recipe.image}
            alt={recipe.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="size-full object-cover"
          />
          {/* Bottom scrim so the time pill stays readable on any photo. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
          />
          <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
            <SaveButton slug={recipe.slug} />
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur">
            {recipe.category}
          </span>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold backdrop-blur">
            <Clock className="size-3 text-primary" strokeWidth={2} /> {recipe.minutes} min
          </span>
          <span
            aria-hidden
            className="absolute bottom-3 right-3 grid size-9 translate-y-1.5 place-items-center rounded-full bg-saffron text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ArrowUpRight className="size-4" strokeWidth={2} />
          </span>
        </div>

        <div className="space-y-2 p-4 sm:p-5">
          <h3
            className={cn(
              "font-serif leading-tight transition-colors duration-300 group-hover:text-primary",
              size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-lg" : "text-xl",
            )}
          >
            {recipe.title}
          </h3>
          {size !== "sm" && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.blurb}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
            <span className="font-medium">{recipe.cuisine}</span>
            <span aria-hidden>·</span>
            <span>{recipe.difficulty}</span>
            <span aria-hidden>·</span>
            <span>{recipe.diet[0]}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

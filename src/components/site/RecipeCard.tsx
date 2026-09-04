import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
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
        className="lift block overflow-hidden rounded-2xl border border-border bg-secondary/40"
      >
        <div className={cn("zoom-media relative", ratio[size])}>
          <img
            src={recipe.image}
            alt={recipe.title}
            loading={eager ? "eager" : "lazy"}
            className="size-full object-cover"
          />
          <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
            <SaveButton slug={recipe.slug} />
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur">
            {recipe.category}
          </span>
        </div>

        <div className="space-y-2 p-4 sm:p-5">
          <h3
            className={cn(
              "font-serif leading-tight",
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
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" strokeWidth={1.6} /> {recipe.minutes} min
            </span>
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

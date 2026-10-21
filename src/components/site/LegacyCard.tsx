import { Link } from "@tanstack/react-router";
import { formatLegacyDate, legacyCover, type LegacyPost } from "@/lib/legacy";
import { legacyCategory } from "@/lib/legacy-categories";
import { cn } from "@/lib/utils";

/** Clean the &nbsp; / spacing junk left in Blogger excerpts. */
export function cleanExcerpt(s: string): string {
  return s
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Card for a recovered blog post (the site's real recipe content). */
export function LegacyCard({
  post,
  className,
  size = "md",
}: {
  post: LegacyPost;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className={cn(
        "lift group block overflow-hidden rounded-3xl border border-border bg-secondary/40",
        className,
      )}
    >
      <div className="zoom-media relative aspect-4/3">
        <img
          src={legacyCover(post)}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur">
          {legacyCategory(post) || "Recipe"}
        </span>
      </div>
      <div className="space-y-1.5 p-4 sm:p-5">
        <h3
          className={cn(
            "font-serif leading-tight transition-colors duration-300 group-hover:text-primary",
            size === "sm" ? "text-lg" : "text-xl",
          )}
        >
          {post.title}
        </h3>
        {size !== "sm" && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {cleanExcerpt(post.excerpt)}
          </p>
        )}
        <p className="pt-0.5 text-xs text-muted-foreground">
          {formatLegacyDate(post.date)}
          {formatLegacyDate(post.date) ? " · " : ""}
          {post.readingTime} min read
        </p>
      </div>
    </Link>
  );
}

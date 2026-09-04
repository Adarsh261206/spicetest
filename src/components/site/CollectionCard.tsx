import { Link } from "@tanstack/react-router";
import type { Collection } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CollectionCard({
  collection,
  className,
  tall = false,
}: {
  collection: Collection;
  className?: string;
  tall?: boolean;
}) {
  return (
    <Link
      to="/collections"
      hash={collection.slug}
      className={cn("lift group block overflow-hidden rounded-2xl border border-border", className)}
    >
      <div className={cn("zoom-media relative", tall ? "aspect-[3/4]" : "aspect-[5/4]")}>
        <img
          src={collection.cover}
          alt={collection.name}
          loading="lazy"
          className="size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-foreground/70 to-transparent p-4">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-xl text-background">{collection.name}</h3>
            <p className="text-xs text-background/80">
              {collection.count} recipes · {collection.mood}
            </p>
          </div>
          <div className="flex -space-x-3 pb-1">
            {collection.thumbs.slice(0, 3).map((t, i) => (
              <img
                key={i}
                src={t}
                alt=""
                aria-hidden
                loading="lazy"
                className="size-9 shrink-0 rounded-full border-2 border-background object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

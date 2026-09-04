import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { recipesByCreator, type Contributor } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CreatorCard({ creator, className }: { creator: Contributor; className?: string }) {
  const [following, setFollowing] = useState(false);

  return (
    <article
      className={cn(
        "lift flex shrink-0 flex-col gap-4 rounded-2xl border border-border bg-secondary/40 p-5",
        className,
      )}
    >
      <Link
        to="/creators/$handle"
        params={{ handle: creator.handle }}
        className="zoom-media block size-24 overflow-hidden rounded-full border border-border"
      >
        <img
          src={creator.portrait}
          alt={creator.name}
          loading="lazy"
          className="size-full object-cover"
        />
      </Link>

      <div className="min-w-0 space-y-1">
        <h3 className="text-xl">
          <Link
            to="/creators/$handle"
            params={{ handle: creator.handle }}
            className="hover:text-primary"
          >
            {creator.name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{creator.specialty}</p>
      </div>

      <p className="text-xs text-muted-foreground">
        {recipesByCreator(creator.handle).length} recipes · {creator.location}
      </p>

      <button
        type="button"
        aria-pressed={following}
        onClick={() => setFollowing((f) => !f)}
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95",
          following
            ? "border-primary bg-tea text-accent-foreground"
            : "border-transparent bg-primary text-primary-foreground hover:bg-primary-deep",
        )}
      >
        {following ? (
          <Check className="size-4" strokeWidth={1.8} />
        ) : (
          <Plus className="size-4" strokeWidth={1.8} />
        )}
        {following ? "Following" : "Follow"}
      </button>
    </article>
  );
}

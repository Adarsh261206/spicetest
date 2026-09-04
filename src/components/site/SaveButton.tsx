import { Bookmark } from "lucide-react";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

export function SaveButton({
  slug,
  className,
  label = false,
}: {
  slug: string;
  className?: string;
  label?: boolean;
}) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved recipes" : "Save recipe"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(slug);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-2 text-xs font-semibold backdrop-blur transition-all duration-200 hover:border-primary hover:bg-vanilla active:scale-95",
        saved && "border-primary bg-tea text-accent-foreground",
        className,
      )}
    >
      <Bookmark className="size-4" strokeWidth={1.6} fill={saved ? "currentColor" : "none"} />
      {label && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}

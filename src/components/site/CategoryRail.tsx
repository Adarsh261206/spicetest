import { cn } from "@/lib/utils";

export function CategoryRail({
  items,
  value,
  onChange,
  className,
  ariaLabel = "Recipe categories",
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:px-0",
        className,
      )}
    >
      {items.map((item) => {
        const active = item === value;
        return (
          <button
            key={item}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-all duration-200",
              active
                ? "border-primary bg-tea font-semibold text-accent-foreground"
                : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

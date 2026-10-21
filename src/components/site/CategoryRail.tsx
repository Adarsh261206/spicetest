import { cn } from "@/lib/utils";

export function CategoryRail({
  items,
  value,
  onChange,
  hrefFor,
  className,
  ariaLabel = "Recipe categories",
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  /** Blueprint §4 (L3): when given, chips render as real crawlable links. */
  hrefFor?: (item: string) => string;
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
        const cls = cn(
          "shrink-0 rounded-full border px-4 py-2 text-sm transition-all duration-200",
          active
            ? "border-primary bg-tea font-semibold text-accent-foreground"
            : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
        );
        if (hrefFor) {
          return (
            <a
              key={item}
              href={hrefFor(item)}
              aria-current={active ? "true" : undefined}
              onClick={(e) => {
                // Client-side filter without a reload; href stays for bots/tabs.
                e.preventDefault();
                onChange(item);
              }}
              className={cls}
            >
              {item}
            </a>
          );
        }
        return (
          <button
            key={item}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item)}
            className={cls}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

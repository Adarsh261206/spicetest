import { useEffect, useRef } from "react";
import { ExternalLink, ShoppingBasket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Monetization-ready placements (proposal §07 Revenue Infrastructure). */
/* AdSense zones reserve layout space up-front (no CLS) and render the  */
/* real ad unit as soon as VITE_ADSENSE_CLIENT is configured. Until     */
/* then they render a tasteful labelled placeholder so the layout,      */
/* viewability and UX can be reviewed without an ad account.            */
/* ------------------------------------------------------------------ */

const ADSENSE_CLIENT = import.meta.env["VITE_ADSENSE_CLIENT"] as string | undefined;

/* Blueprint §5 (A3): one slot id per format, from the AdSense dashboard.
   Documented in .env.example as VITE_ADSENSE_SLOT_*. Unset => placeholder. */
export const AD_SLOTS = {
  article: import.meta.env["VITE_ADSENSE_SLOT_ARTICLE"] as string | undefined,
  feed: import.meta.env["VITE_ADSENSE_SLOT_FEED"] as string | undefined,
  sidebar: import.meta.env["VITE_ADSENSE_SLOT_SIDEBAR"] as string | undefined,
};

export function AdSlot({
  slot,
  format = "in-article",
  className,
  label = "Advertisement",
}: {
  /** AdSense ad-slot id (from the AdSense dashboard). */
  slot?: string | undefined;
  format?: "in-article" | "in-feed" | "sidebar";
  className?: string | undefined;
  label?: string | undefined;
}) {
  const minHeight =
    format === "sidebar"
      ? "min-h-[250px]"
      : format === "in-feed"
        ? "min-h-[120px]"
        : "min-h-[180px]";

  // Real AdSense unit when both client + slot are configured.
  if (ADSENSE_CLIENT && slot) {
    return <LiveAdSlot slot={slot} format={format} className={className} label={label} />;
  }

  // Layout-reserving placeholder (same footprint the ad will take).
  return (
    <div
      className={cn("my-8 print:hidden", className)}
      role="complementary"
      aria-label={`${label} (placeholder)`}
      data-ad-format={format}
      data-ad-slot={slot ?? "unconfigured"}
    >
      <p className="mb-1 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </p>
      <div
        className={cn(
          "grid place-items-center rounded-2xl border border-dashed border-border bg-secondary/40 px-6 text-center",
          minHeight,
        )}
      >
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          AdSense {format} zone — set <code>VITE_ADSENSE_CLIENT</code> + slot id to go live.
        </p>
      </div>
    </div>
  );
}

/* Blueprint §5 (A2): live unit. The push() runs client-side only, after the
   loader script (root head) has had a chance to define window.adsbygoogle. */
function LiveAdSlot({
  slot,
  format,
  className,
  label,
}: {
  slot: string;
  format: "in-article" | "in-feed" | "sidebar";
  className?: string | undefined;
  label: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* Ad blockers / failed loads must never break the page. */
    }
  }, []);
  const minHeight =
    format === "sidebar"
      ? "min-h-[250px]"
      : format === "in-feed"
        ? "min-h-[120px]"
        : "min-h-[180px]";
  return (
    <div className={cn("my-8 print:hidden", className)} role="complementary" aria-label={label}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </p>
      <ins
        ref={ref}
        className={cn("adsbygoogle block overflow-hidden rounded-2xl", minHeight)}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

/* -------------------- Affiliate / partner widgets -------------------- */

export type AffiliateItem = {
  name: string;
  blurb: string;
  href: string;
  cta?: string;
};

const DEFAULT_GEAR: AffiliateItem[] = [
  {
    name: "Cast-iron skillet",
    blurb: "Holds high heat for tikka char and dosa crispness.",
    href: "#",
    cta: "View pick",
  },
  {
    name: "Heavy-bottom handi",
    blurb: "Even dum heat so biryani steams instead of catching.",
    href: "#",
    cta: "View pick",
  },
  {
    name: "Spice grinder",
    blurb: "Small-batch garam masala, ground fortnightly.",
    href: "#",
    cta: "View pick",
  },
];

export function AffiliateBox({
  title = "Kitchen gear we actually use",
  items = DEFAULT_GEAR,
  className,
}: {
  title?: string;
  items?: AffiliateItem[];
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-[2rem] border border-border bg-vanilla/60 p-6 sm:p-8 print:hidden",
        className,
      )}
      aria-label="Recommended products"
    >
      <p className="eyebrow flex items-center gap-2">
        <ShoppingBasket className="size-3.5" strokeWidth={1.8} />
        Affiliate picks
      </p>
      <h2 className="mt-3 font-serif text-2xl leading-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Reader-supported: if you buy through these links we may earn a small commission at no extra
        cost to you.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex flex-col rounded-2xl border border-border bg-background p-4"
          >
            <p className="font-semibold text-sm leading-snug">{item.name}</p>
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
              {item.blurb}
            </p>
            <a
              href={item.href}
              rel="sponsored nofollow noopener"
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary-deep active:scale-95"
            >
              {item.cta ?? "View pick"}
              <ExternalLink className="size-3" strokeWidth={2} />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function SponsorBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/50 px-5 py-4 print:hidden",
        className,
      )}
      role="complementary"
      aria-label="Sponsorship"
    >
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4 text-primary" strokeWidth={1.7} />
        Cooking with a food brand? Sponsor slots open for recipe features.
      </p>
      <a
        href="/about"
        className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold transition-colors hover:border-primary"
      >
        Partner with us
      </a>
    </div>
  );
}

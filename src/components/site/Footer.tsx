import { Link } from "@tanstack/react-router";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Recipes", to: "/recipes" as const },
      { label: "Cuisines", to: "/cuisines" as const },
      { label: "Stories & archive", to: "/blog" as const },
      { label: "About", to: "/about" as const },
      { label: "Contact", to: "/about" as const },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Vegetarian", to: "/recipes" as const, search: { category: "Vegetarian" } },
      { label: "Breakfast", to: "/recipes" as const, search: { category: "Breakfast" } },
      { label: "Main Course", to: "/recipes" as const, search: { category: "Main Course" } },
      { label: "Street Food", to: "/recipes" as const, search: { category: "Street Food" } },
      { label: "Desserts", to: "/recipes" as const, search: { category: "Dessert" } },
      { label: "Drinks", to: "/recipes" as const, search: { category: "Drinks" } },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Collections", to: "/collections" as const },
      { label: "Creators", to: "/creators" as const },
      { label: "Share a recipe", to: "/share" as const },
      { label: "Disclosure", to: "/disclosure" as const },
      { label: "Privacy", to: "/privacy" as const },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-[#f3ede2]">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-12">
        <div className="max-w-sm space-y-4">
          <p className="font-serif text-3xl tracking-tight text-[#f8f4ea]">Spice N Flavors</p>
          <p className="text-sm leading-relaxed text-[#f3ede2]/65">
            Recipes, stories and traditions worth bringing to the table. Cooked, tested and written
            down in one kitchen.
          </p>
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-saffron">
            Since 2012 <span aria-hidden>✦</span> 160+ recipes
          </p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title} className="space-y-4">
            <p className="eyebrow-light">{g.title}</p>
            <ul className="space-y-2.5">
              {g.links.map((l) => (
                <li key={l.label}>
                  {"search" in l ? (
                    <Link
                      to={l.to}
                      search={l.search}
                      className="text-sm text-[#f3ede2]/65 transition-colors duration-200 hover:text-saffron"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <Link
                      to={l.to}
                      className="text-sm text-[#f3ede2]/65 transition-colors duration-200 hover:text-saffron"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-[#f3ede2]/50 sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} Spice N Flavors. Cooked, tested and written down.</p>
          <p className="flex items-center gap-2">
            Made with{" "}
            <span aria-hidden className="text-ember">
              ♥
            </span>{" "}
            in the kitchen
          </p>
        </div>
      </div>
    </footer>
  );
}

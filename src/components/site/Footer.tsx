import { Link } from "@tanstack/react-router";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Recipes", to: "/recipes" as const },
      { label: "Cuisines", to: "/cuisines" as const },
      { label: "Journal", to: "/journal" as const },
      { label: "About", to: "/about" as const },
      { label: "Contact", to: "/about" as const },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Vegetarian", to: "/recipes" as const },
      { label: "Non-Veg", to: "/recipes" as const },
      { label: "Breakfast", to: "/recipes" as const },
      { label: "Main Course", to: "/recipes" as const },
      { label: "Desserts", to: "/recipes" as const },
      { label: "Quick Recipes", to: "/recipes" as const },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
        <div className="max-w-sm space-y-3">
          <p className="font-serif text-2xl">Spice N Flavors</p>
          <p className="text-sm text-muted-foreground">
            Recipes, stories and traditions worth bringing to the table.
          </p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title} className="space-y-3">
            <p className="eyebrow">{g.title}</p>
            <ul className="space-y-2">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="rule-hair mx-auto max-w-[1440px] px-5 py-6 text-xs text-muted-foreground sm:px-8 lg:px-12">
        © {new Date().getFullYear()} Spice N Flavors. Cooked, tested and written down.
      </div>
    </footer>
  );
}

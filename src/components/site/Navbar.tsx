import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Menu, PenLine, Search, User, X } from "lucide-react";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", exact: true },
  { to: "/recipes", label: "Recipes" },
  { to: "/cuisines", label: "Cuisines" },
  { to: "/journal", label: "Journal" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [elevated, setElevated] = useState(false);
  const [open, setOpen] = useState(false);
  const { saved } = useSaved();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        elevated
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 sm:px-8 lg:px-12"
      >
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <span className="font-serif text-sm leading-none">S</span>
          </span>
          <span className="truncate font-serif text-xl tracking-tight">Spice N Flavors</span>
        </Link>

        <ul className="hidden justify-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: "exact" in l ? l.exact : false }}
                activeProps={{ className: "text-primary" }}
                className="relative text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground data-[status=active]:text-primary"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Link
            to="/recipes"
            aria-label="Search recipes"
            className="grid size-10 place-items-center rounded-full transition-colors duration-200 hover:bg-secondary"
          >
            <Search className="size-[18px]" strokeWidth={1.6} />
          </Link>
          <Link
            to="/dashboard"
            aria-label={`Saved recipes (${saved.length})`}
            className="relative grid size-10 place-items-center rounded-full transition-colors duration-200 hover:bg-secondary"
          >
            <Bookmark className="size-[18px]" strokeWidth={1.6} />
            {saved.length > 0 && (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
            )}
          </Link>
          <Link
            to="/dashboard"
            aria-label="Your profile"
            className="grid size-10 place-items-center rounded-full transition-colors duration-200 hover:bg-secondary max-sm:hidden"
          >
            <User className="size-[18px]" strokeWidth={1.6} />
          </Link>
          <Link
            to="/share"
            className="ml-1 hidden items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95 md:inline-flex"
          >
            <PenLine className="size-4" strokeWidth={1.8} />
            Share a recipe
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full transition-colors duration-200 hover:bg-secondary lg:hidden"
          >
            {open ? (
              <X className="size-5" strokeWidth={1.6} />
            ) : (
              <Menu className="size-5" strokeWidth={1.6} />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-5 py-4 lg:hidden">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-base transition-colors hover:bg-secondary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate({ to: "/share" });
            }}
            className="mt-3 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            Share a recipe
          </button>
        </div>
      )}
    </header>
  );
}

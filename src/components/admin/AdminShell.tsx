import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, FileText, LogOut, Plus } from "lucide-react";
import { logoutFn } from "@/lib/auth.api";

const shell = "mx-auto w-full max-w-[1100px] px-5 sm:px-8";

export function AdminShell({
  title,
  eyebrow = "Admin",
  actions,
  children,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className={`${shell} pb-16 pt-8`}>
      <nav aria-label="Admin" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 font-medium transition-colors hover:border-primary"
        >
          <FileText className="size-4" strokeWidth={1.7} />
          Posts
        </Link>
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 font-medium transition-colors hover:border-primary"
        >
          <Plus className="size-4" strokeWidth={1.7} />
          New post
        </Link>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.7} />
          View site
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logoutFn();
            await navigate({ to: "/admin/login" });
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <LogOut className="size-4" strokeWidth={1.7} />
          Logout
        </button>
      </nav>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-lg mt-3">{title}</h1>
        </div>
        {actions}
      </header>

      <div className="mt-8">{children}</div>
    </div>
  );
}

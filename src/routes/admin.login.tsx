import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { meFn, loginFn } from "@/lib/auth.api";

export const Route = createFileRoute("/admin/login")({
  loader: async () => {
    const me = await meFn();
    if (me && !("dbMissing" in me)) throw redirect({ to: "/admin" });
    return { dbMissing: Boolean(me && "dbMissing" in me) };
  },
  component: AdminLogin,
});

const shell = "mx-auto w-full max-w-md px-5 pt-16 pb-16";

function AdminLogin() {
  const { dbMissing } = Route.useLoaderData();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (dbMissing) {
    return (
      <div className={shell}>
        <p className="eyebrow">Admin</p>
        <h1 className="display-lg mt-3">Database not connected.</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Set <code>DATABASE_URL</code>, run <code>bun scripts/db-migrate.ts</code> and{" "}
          <code>bun scripts/seed-admin.ts</code>. See README “Backend &amp; admin”.
        </p>
      </div>
    );
  }

  return (
    <div className={shell}>
      <p className="eyebrow">Admin</p>
      <h1 className="display-lg mt-3">Welcome back.</h1>
      <form
        className="mt-8 space-y-4 rounded-[2rem] border border-border bg-secondary/40 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          try {
            await loginFn({ data: { email, password } });
            await navigate({ to: "/admin" });
          } catch {
            setError("Wrong email or password.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <label htmlFor="admin-email" className="eyebrow mb-2 block">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="eyebrow mb-2 block">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden focus:border-primary"
          />
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

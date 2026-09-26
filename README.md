# Spice N Flavors

A culinary journal featuring Indian recipes, stories and traditions.

## Built with

- [TanStack Start](https://tanstack.com/start)
- [React](https://react.dev)
- [TypeScript](https://typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team) + Postgres (Neon in prod, embedded PGlite locally)

## Development

```sh
bun install
cp .env.example .env   # set ADMIN_EMAIL + ADMIN_PASSWORD
bun scripts/db-migrate.ts
bun scripts/seed-admin.ts
bun run dev
```

Local dev needs no database setup — it uses an embedded PGlite file DB in `.data/`.
Open `/admin` and sign in with the seeded credentials to write posts.

## Backend & admin

- `drizzle/0001_init.sql` — schema (`users`, `sessions`, `posts`); applied by `scripts/db-migrate.ts` (re-runnable).
- `src/lib/db.server.ts` — uses `DATABASE_URL` when set, else local PGlite (dev only; production without `DATABASE_URL` runs the site without DB posts).
- `src/lib/auth.api.ts` — scrypt password login, 7-day httpOnly session cookies.
- `src/lib/posts.api.ts` — published list/get (public) + admin CRUD with cover upload (stored in DB, served at `/api/covers/:id`).
- `src/routes/admin/*` — password-gated admin: login, posts list, block editor (paragraph/heading/bullets/steps/quote/photo) with live preview.
- Importing old Blogger content: `node scripts/import-blogger.mjs` (one-off, already done).

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com).

```sh
bun run build
```

For the admin + fresh posts in production, set env vars on Vercel:

1. Create a free Postgres DB (Neon recommended) and set `DATABASE_URL`.
2. Set `ADMIN_EMAIL` + `ADMIN_PASSWORD`, then run once locally against the prod DB:
   `DATABASE_URL="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." bun scripts/db-migrate.ts && bun scripts/seed-admin.ts`
   (or run both with Vercel env pulled via `vercel env pull`).


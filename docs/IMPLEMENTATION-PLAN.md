# Spice N Flavors — Deep Implementation Blueprint

> AI-assisted content enhancement · Technical SEO · Recipe SEO & JSON-LD ·
> Meta titles/descriptions · Internal linking · AdSense & affiliate-ready layout.
> Stack: TanStack Start + React 19 + TS, Tailwind v4, Drizzle
> (PGlite local / Postgres prod), package manager `bun`.
> Convention: backticked file paths, proposal `§NN` references, status
> checkboxes (`[x]` done / `[ ]` todo).

## §0 Priorities

| Priority | Scope | Gate |
|---|---|---|
| **P0** | Meta generator on all routes, draft `noindex`, footer links, AdSense loader + slots + `ads.txt`, affiliate disclosure | `tsc` + `lint` + `build` green |
| **P1** | JSON-LD upgrades (Person/FAQ/ItemList/Breadcrumb), sitemap `lastmod` + RSS, breadcrumbs + related rails, security headers | Rich Results Test on 3 URLs |
| **P2** | `src/lib/ai/` heuristics module + PostEditor/share/assistant wiring | Live behaviour checks |

Verify everything with: `bunx tsc --noEmit`, `bun run lint`, `bun run build`,
`curl -sL http://localhost:3000/<path>`.

---

## §1 Technical SEO implementation

### §1.1 Current state

| Item | Location | State |
|---|---|---|
| Sitemap | `src/server.ts:84-136`, route `:143-145` | Live, no `<lastmod>`, omits `/collections/$slug` + `/creators/$handle` |
| robots.txt | `public/robots.txt` | Live, disallows `/admin`, `/dashboard`, sitemap pointer OK |
| Legacy 301s | `src/server.ts:153-163` | Blogger `/YYYY/MM/slug.html` + `/journal/*` → `/blog/*` |
| Canonical | per-route `head()` | Present on `/`, `/recipes`, `/recipes/$slug`, `/blog`, `/blog/$slug`, `/collections/$slug`; **missing on** `about`, `cuisines`, `collections.index`, `creators.index`, `creators.$handle`, `share`, `dashboard` |
| Cover-image headers | `src/server.ts:73-77` | `cache-control: immutable` + `nosniff` ✅ |
| Global security headers | — | **Missing** (no CSP/X-Frame-Options/HSTS/Referrer-Policy) |
| RSS/Atom | — | **Missing** |
| Image pipeline | `vite.config.ts:8-10` | **None** — 117 MB archive JPGs in `public/blog/`, zero WebP/AVIF |
| 404/500 | `src/routes/__root.tsx:18-70`, `src/lib/error-page.ts` | OK |
| Draft legacy posts (12/146) | `src/lib/legacy.ts:54`, `src/server.ts:94-96` | Excluded from sitemap but **publicly reachable, no `noindex`** |

### §1.2 Gaps → steps

- [x] **T1.** Sitemap: add `<lastmod>` (legacy dates from `legacy-posts.json`; omit where unknown), add `/collections/$slug` + `/creators/$handle` URLs. — `src/server.ts`
- [x] **T2.** Canonical on every public route via shared helper (§3). — all `head()` blocks
- [x] **T3.** Draft posts get `noindex, nofollow` + removed from public listings. — `src/routes/blog.$slug.tsx`, `src/routes/blog.index.tsx`, `src/routes/recipes.index.tsx`
- [x] **T4.** Global security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`) on HTML responses. — `src/server.ts` fetch wrapper
- [x] **T5.** RSS 2.0 at `/feed.xml` (curated + fresh + legacy, latest 30). — `src/server.ts`
- [x] **T6.** Image hygiene: explicit `width`/`height` on card/hero images (CLS), `loading="lazy"` audit; document WebP migration path for `public/blog/` (build-time conversion, not runtime). — components + this doc §1.4
- [x] **T7.** `public/site.webmanifest` + `apple-touch-icon` reference (icon file: reuse `favicon.ico` until brand icon ships).
- [ ] **T8 (host-level, Vercel dashboard — not code).** `http→https`, `www→apex`, trailing-slash rule, HSTS. Verified at deploy time, not in repo.

### §1.3 Acceptance

- [x] `curl /sitemap.xml` contains `<lastmod>` + collection/creator URLs
- [x] `curl /feed.xml` returns valid RSS with ≥ 20 items
- [x] Every public route emits exactly one canonical; no `noindex` on public pages
- [x] Draft URL emits `noindex, nofollow` and is absent from `/blog` + `/recipes`

### §1.4 WebP migration path (deferred, documented)

`public/blog/` (557 jpg + 54 png, ~117 MB) converts offline:
`for f in public/blog/*.{jpg,png}; do cwebp -q 80 "$f" -o "${f%.*}.webp"; done`
then `legacyCover()` prefers `.webp` with jpg fallback. Not run in this pass —
binary churn + 100 MB diff; safe to do right before prod deploy.

---

## §2 Recipe SEO & JSON-LD schema

### §2.1 Current state (`src/lib/seo.ts`)

| Builder | Lines | Type | Injected at |
|---|---|---|---|
| `recipeJsonLd` | 44-92 | `Recipe` | `src/routes/recipes.$slug.tsx:83-88` only |
| `breadcrumbJsonLd` | 94-105 | `BreadcrumbList` | recipe detail only |
| `websiteJsonLd` | 107-126 | `WebSite` + `SearchAction` | `src/routes/__root.tsx:126` (every page) |
| `organizationJsonLd` | 128-136 | `Organization` | `__root.tsx:127` |
| `articleJsonLd` | 149-172 | `BlogPosting` | `src/routes/blog.$slug.tsx:137,272,700` |

Field audit (Recipe): `name` ✅ `description` ✅ `image` ✅ `prepTime/cookTime/totalTime`
✅ `recipeYield` ✅ `recipeCategory` ✅ `recipeCuisine` ✅ `recipeIngredient` ✅
`keywords` ✅ `nutrition` ✅ (no `servingSize`) · `author` ⚠️ (`Organization`, should be
`Person`) · `datePublished` ❌ (curated data has no dates) · instructions ⚠️ (flat
`HowToStep`, no `HowToSection`, no step `name`) · `aggregateRating` ❌ **intentional**
(Google policy — no fake ratings, see `seo.ts:43`).

### §2.2 Gaps → steps

- [x] **R1.** `author` → `Person` "Viya Sheth" with `url: SITE/creators/viya-sheth`; keep `publisher` as `Organization`. — `src/lib/seo.ts`
- [x] **R2.** `datePublished` where real dates exist: legacy posts (`legacy-posts.json` dates) + fresh DB posts (`posts.createdAt`). Curated `data.ts` recipes carry **no dates — do not invent**; field stays absent there (valid: recommended, not required, for Recipe rich results).
- [x] **R3.** `recipeInstructions`: flat `HowToStep` **with `name`** (first 60 chars) — source data has one flat list, so no invented `HowToSection`s (honest mapping).
- [x] **R4.** New `faqJsonLd()` builder; inject on recipe FAQ block (`recipes.$slug.tsx:359-372`).
- [x] **R5.** New `itemListJsonLd()` builder; inject on `/recipes` (first 24 visible) + `/blog`.
- [x] **R6.** `BreadcrumbList` on blog detail (all 3 kinds), collections detail, creators detail + matching visible crumb nav where missing (curated + fresh blog).
- [x] **R7.** Nutrition fix: match `saturated` before generic `fat` (order-sensitive overwrite bug, `seo.ts:47-53`); add `servingSize`.
- [x] **R8.** `BlogPosting.author` gains `url`; `dateModified` = actual modified date where known (legacy date), else `datePublished`.

### §2.3 Acceptance

- [x] Rich Results Test: Recipe + FAQ valid on 1 curated URL, BlogPosting valid on legacy URL
- [x] No `aggregateRating` anywhere in emitted JSON-LD (policy)
- [x] List pages emit `ItemList`; crumbs visible + structured on all detail pages

---

## §3 Meta titles / descriptions

### §3.1 Current state

No shared generator — every route hand-writes `head()`. Known defects: `/` title
duplicates root fallback (`index.tsx:29` vs `__root.tsx:77`); `/blog` title starts
"All recipes…" colliding with `/recipes`; descriptions unclamped (admin excerpt cap is
300 chars, `PostEditor.tsx:265`); `keywords` meta on exactly one route
(`recipes.$slug.tsx:37`); `/admin/*` has no `head()` at all.

### §3.2 Steps

- [x] **M1.** `buildHead({ title, description, path, image, type, noindex, keywords })`
  in `src/lib/seo.ts`: appends `| Spice N Flavors` once, clamps title ≤ 65 chars /
  description ≤ 155 chars on word boundaries, absolute canonical + `og:url` +
  `og:image` + `twitter:image`, `og:locale en_IN`, `twitter:site`.
- [x] **M2.** Migrate all 14 public `head()` blocks to `buildHead` with unique copy.
- [x] **M3.** Root fallback title changed so `/` owns the brand title (dedup).
- [x] **M4.** `/admin/*` routes get `noindex, nofollow` + neutral title via `buildHead`.
- [x] **M5.** `DEFAULT_OG_IMAGE` (`/hero-main.jpg` asset → absolute URL) for listing/static pages with no own image.

### §3.3 Copy rules (enforced by helper, not convention)

Title: `Page intent — keyword | Spice N Flavors`, ≤ 65 chars. Description: 1 sentence,
benefit-first, ≤ 155 chars. One canonical per URL; filtered (`?category=`/`?q=`)
views canonicalize to base (intentional dedup — filters are UX, not index targets).

---

## §4 Internal linking

### §4.1 Current state

Related rails: recipe→recipe scorer (`recipes.$slug.tsx:68-81`) ✅, legacy scorer
(`blog.$slug.tsx:626-642`) ✅; **fresh posts have none** ❌. Visible crumbs: recipe
detail ✅, legacy ✅, collections ✅; **curated/fresh blog, creators: none** ❌.
**No `/tags/*` routes** (17 routes total, zero taxonomy). Footer "Categories" — all six
links point at bare `/recipes` (dead) ❌. Legacy/fresh tags render as `<span>` ❌.
`CategoryRail` renders `<button>`, homepage state never touches URL ❌.
`TrendingList.tsx` defined, never imported (dead) ❌. Jump-to-Recipe: curated + legacy
✅, curated/fresh blog ❌.

### §4.2 Gaps → steps

- [x] **L1.** Footer categories → `/recipes?category=Breakfast|Main Course|…` (real filtered views). — `src/components/site/Footer.tsx`
- [x] **L2.** Legacy + fresh tag pills → links to `/recipes?q=<tag>`. — `src/routes/blog.$slug.tsx`
- [x] **L3.** `CategoryRail` chips become URL-driven (`?category=`, back/forward safe) on `/recipes`; homepage rail keeps local state (discovery widget, not index target). — `src/routes/recipes.index.tsx`, `src/components/site/CategoryRail.tsx`
- [x] **L4.** Related rail for fresh DB posts (reuse `relatedScore` word-overlap). — `src/routes/blog.$slug.tsx`
- [x] **L5.** Visible + JSON-LD breadcrumbs on curated blog, fresh blog, creators detail. — `blog.$slug.tsx`, `creators.$handle.tsx`
- [x] **L6.** Recipe→blog cross-links: "From the journal" strip on recipe detail (same-cuisine articles). — `src/routes/recipes.$slug.tsx`
- [x] **L7.** Delete `TrendingList.tsx` (dead) or mount it — decision: **delete** (homepage already has rails; dead code hurts crawl-budget clarity).
- [x] **L8.** Sitemap: add `/collections/$slug` + `/creators/$handle` (see T1); footer gains Collections + Creators links.

### §4.3 Acceptance

- [x] Zero `<a href="/recipes">` dead category links; every footer link lands on distinct content
- [x] Tags clickable everywhere; filtered views reachable by URL + back button
- [x] Fresh posts show "Cook this next"; no orphan detail pages (each ≥ 3 in/out links)

---

## §5 AdSense & affiliate-ready layout

### §5.1 Current state (`src/components/site/Monetization.tsx`)

`AdSlot` (placeholder vs real branch `:34-75`), `AffiliateBox` (`:107-156`, disclosure
copy + `rel="sponsored nofollow noopener"` ✅), `SponsorBanner` (`:158-180`, **never
mounted**) ❌. Mounts: recipe detail, curated/legacy/fresh blog (`recipes.$slug.tsx:355`,
`blog.$slug.tsx:164,557,736`) — **no `slot` id ever passed** ❌, **no
`adsbygoogle.js` loader anywhere** ❌, **no `.push({})`** ❌ → real ads impossible.
Env: `VITE_ADSENSE_CLIENT` documented (`.env.example:9-11`), unset in `.env`. No
`public/ads.txt` ❌. Disclosure only inside `AffiliateBox`; no site-wide page/link ❌.
Legacy JSON has zero affiliate URLs (honest: nothing to migrate).

### §5.2 Gaps → steps

- [x] **A1.** `__root.tsx` head: AdSense loader script, gated on `VITE_ADSENSE_CLIENT` **and** `import.meta.env.PROD` (never loads in dev). — `src/routes/__root.tsx`
- [x] **A2.** `AdSlot` calls `(adsbygoogle = window.adsbygoogle || []).push({})` on mount (client-only `useEffect`) when client + slot set. — `src/components/site/Monetization.tsx`
- [x] **A3.** `AD_SLOTS = { article, feed, sidebar }` from `VITE_ADSENSE_SLOT_*` envs (documented in `.env.example`); all 4 detail mounts pass `slot={AD_SLOTS.article}`. Unset slot ⇒ placeholder branch (layout review safe).
- [x] **A4.** In-feed slots: 1 after 8th card on `/recipes` + `/blog` (`slot={AD_SLOTS.feed}`).
- [x] **A5.** `public/ads.txt` template (`google.com, pub-XXXX, DIRECT, f08c47fec0942fa0` placeholder + comment to replace).
- [x] **A6.** Site-wide disclosure: new `/disclosure` route (affiliate + ads policy, ~150 words) + Footer "Disclosure" link; `AffiliateBox` keeps inline line. — `src/routes/disclosure.tsx`, `Footer.tsx`
- [x] **A7.** `SponsorBanner` mounted once: below `/collections` hero (media-kit surface). — `src/routes/collections.index.tsx`
- [x] **A8.** Affiliate catalog: `AFFILIATE_GEAR` stays placeholder `href: "#"` **until real partner URLs exist** — documented here, not faked (same policy as ratings).

### §5.3 Acceptance

- [x] Dev HTML contains **zero** `googlesyndication` requests (loader gated)
- [x] With `VITE_ADSENSE_CLIENT` + slot set: `<ins class="adsbygoogle">` + push call present
- [x] `/ads.txt` serves template; `/disclosure` linked from footer on every page

---

## §6 AI-assisted content enhancement (heuristics now, API-ready later)

> Decision: no paid LLM in this pass. Everything below is deterministic, testable,
> client-safe code — with one marked seam where an LLM call drops in later.

### §6.1 Current state

`AIRecipeAssistant.tsx` — local keyword match over 27 curated recipes only, no
network ❌ breadth. `share.tsx:51-70` "Structure my notes" — naive splitter
(`>70 chars ⇒ step`) ❌ quality. `PostEditor.tsx:256-271` excerpt button — string slice
❌ no meta help. No AI keys in `.env.example` ✅ (nothing to leak).

### §6.2 Steps — new module `src/lib/ai/`

- [x] **I1.** `src/lib/ai/enhance.ts` (pure, tested via `bun` script):
  - `suggestMeta(title, blurb)` → `{ title ≤65, description ≤155 }` (keyword-aware: cuisine + category + "recipe" intent templates)
  - `suggestExcerpt(paragraph)` → 1–2 sentence excerpt (sentence-split, not char-slice)
  - `structureNotes(text)` → `{ ingredients, steps }` using `parseLeadingQty` from `src/lib/scale.ts` (qty-led line ⇒ ingredient; imperative-verb + length ⇒ step; numbered lines respected)
  - `scoreItems(input, items)` → generic matcher over `{ title, tags, text }` (powers assistant over **all 161** recipes, curated + legacy)
- [x] **I2.** `src/lib/ai/provider.ts`: `AiProvider` interface + `heuristicProvider` (default) + `callLlm()` **stub** that throws `AI_NOT_CONFIGURED` — the single documented seam:
  ```ts
  // To go live: implement callLlm() with your provider key in a server
  // function (never ship keys to the client), set VITE_AI_PROVIDER, done.
  ```
- [x] **I3.** Wire `structureNotes` into `share.tsx:helpMeWrite` (same button, better output).
- [x] **I4.** Wire `suggestMeta` + `suggestExcerpt` into `PostEditor` ("Auto SEO" button next to excerpt).
- [x] **I5.** `AIRecipeAssistant` searches curated + legacy via `scoreItems` (legacy scored on title/tags, labelled as archive result).
- [x] **I6.** `.env.example` documents `VITE_AI_PROVIDER=` (empty = heuristics).

### §6.3 Acceptance

- [x] `bun scripts/ai-smoke.ts`-style check: meta lengths, notes split on 5 samples, assistant finds legacy + curated matches
- [x] No `fetch`/network in `src/lib/ai/`; no keys anywhere

---

## §7 Verification matrix (run after every phase)

| Check | Command | Gate |
|---|---|---|
| Types | `bunx tsc --noEmit` | 0 errors |
| Lint | `bun run lint` | 0 errors (warnings ≤ baseline) |
| Build | `bun run build` | green |
| Sitemap | `curl -sL localhost:3000/sitemap.xml` | `<lastmod>` + collections/creators URLs |
| RSS | `curl -sL localhost:3000/feed.xml` | ≥ 20 `<item>` |
| Meta | `curl` 3 pages | canonical + og:image + twitter:image each |
| Draft | `curl <draft-url>` | `noindex, nofollow` |
| Ads | view-source dev | no `googlesyndication` |
| JSON-LD | copy `<script type="application/ld+json">` → validator | Recipe/FAQ/BlogPosting valid |

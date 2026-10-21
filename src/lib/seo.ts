/** SEO + structured-data helpers (client-safe, no node imports). */

export const SITE_URL = "https://spicenflavors.com";
export const SITE_NAME = "Spice N Flavors";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export function toAbsolute(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

/** Minutes -> ISO 8601 duration (PT25M / PT1H30M) for schema.org. */
export function isoDuration(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `PT${m}M`;
  if (m === 0) return `PT${h}H`;
  return `PT${h}H${m}M`;
}

type RecipeLike = {
  slug: string;
  title: string;
  blurb: string;
  intro?: string;
  image: string;
  cuisine: string;
  category: string;
  tags: string[];
  diet: string[];
  prep: number;
  cook: number;
  minutes: number;
  servings: number;
  difficulty: string;
  ingredients: { qty: number; unit: string; name: string }[];
  steps: { text: string; timer?: number }[];
  nutrition: { label: string; value: string }[];
};

/** schema.org Recipe node — Google Rich Results ready (no fake ratings). */
export function recipeJsonLd(recipe: RecipeLike) {
  const url = toAbsolute(`/recipes/${recipe.slug}`);
  // "Saturated fat" must match before generic "fat" (order-sensitive by design).
  const nutritionMap: Record<string, string> = {};
  for (const n of recipe.nutrition) {
    const key = n.label.toLowerCase();
    if (key.includes("calor")) nutritionMap["calories"] = n.value;
    else if (key.includes("saturat")) nutritionMap["saturatedFatContent"] = n.value;
    else if (key.includes("protein")) nutritionMap["proteinContent"] = n.value;
    else if (key.includes("carb")) nutritionMap["carbohydrateContent"] = n.value;
    else if (key.includes("fat")) nutritionMap["fatContent"] = n.value;
  }
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "@id": `${url}#recipe`,
    name: recipe.title,
    description: recipe.blurb || recipe.intro || recipe.title,
    image: [toAbsolute(recipe.image)],
    author: {
      "@type": "Person",
      name: "Viya Sheth",
      url: toAbsolute("/creators/viya-sheth"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    url,
    mainEntityOfPage: url,
    recipeCuisine: recipe.cuisine,
    recipeCategory: recipe.category,
    keywords: [...recipe.tags, ...recipe.diet, recipe.cuisine, recipe.category].join(", "),
    prepTime: isoDuration(recipe.prep),
    cookTime: isoDuration(recipe.cook),
    totalTime: isoDuration(recipe.minutes),
    recipeYield: `${recipe.servings} servings`,
    recipeIngredient: recipe.ingredients.map((i) =>
      `${i.qty} ${i.unit} ${i.name}`.replace(/\s+/g, " ").trim(),
    ),
    // Source data has one flat instruction list — flat HowToStep with names is
    // the honest mapping (no invented HowToSections). No datePublished: the
    // curated dataset carries no publish dates and we don't invent them.
    recipeInstructions: recipe.steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: clampMetaText(s.text, 60),
      text: s.text,
    })),
    ...(Object.keys(nutritionMap).length > 0
      ? {
          nutrition: {
            "@type": "NutritionInformation",
            servingSize: "1 serving",
            ...nutritionMap,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: toAbsolute(item.path),
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "Indian recipes, stories and traditions — cooked, tested and written by Viya Sheth.",
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/recipes?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
  };
}
type ArticleLike = {
  slug: string;
  title: string;
  excerpt: string;
  image?: string | null | undefined;
  author?: string | undefined;
  authorUrl?: string | undefined;
  date?: string | undefined;
  modified?: string | undefined;
  readingTime?: number | undefined;
};

/** schema.org BlogPosting node for guides + recovered archive posts. */
export function articleJsonLd(post: ArticleLike) {
  const url = toAbsolute(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    ...(post.image ? { image: [toAbsolute(post.image)] } : {}),
    author: {
      "@type": "Person",
      name: post.author || "Viya Sheth",
      ...(post.authorUrl ? { url: post.authorUrl } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    url,
    mainEntityOfPage: url,
    ...(post.date ? { datePublished: post.date, dateModified: post.modified || post.date } : {}),
    inLanguage: "en-IN",
  };
}

/** schema.org FAQPage node for the visible FAQ block on recipe detail. */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** schema.org ItemList node for listing pages (first N visible items). */
export function itemListJsonLd(
  path: string,
  items: { name: string; path: string; image?: string | undefined }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: toAbsolute(item.path),
      ...(item.image ? { image: toAbsolute(item.image) } : {}),
    })),
    ...(path ? { mainEntityOfPage: toAbsolute(path) } : {}),
  };
}

/* ------------------------- Shared meta builder ------------------------- */
/* Blueprint §3: every route builds head() through here — one canonical,   */
/* clamped title/description, og + twitter image on every page.            */

const TITLE_SUFFIX = `| ${SITE_NAME}`;
const TITLE_MAX = 65;
const DESC_MAX = 155;

/** Clamp on a word boundary ("…" counts toward the limit). */
export function clampMetaText(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const atWord = cut.slice(0, Math.max(0, cut.lastIndexOf(" ")));
  return `${(atWord || cut).trimEnd()}…`;
}

export type HeadInput = {
  /** Page title WITHOUT the site suffix — helper appends "| Spice N Flavors". */
  title: string;
  description: string;
  /** URL path, e.g. "/recipes" — canonical + og:url derive from it. */
  path: string;
  /** Relative ("/x.jpg") or absolute image URL. Defaults to DEFAULT_OG_IMAGE. */
  image?: string | undefined;
  type?: "website" | "article" | undefined;
  noindex?: boolean | undefined;
  keywords?: string | undefined;
};

export function buildHead(input: HeadInput) {
  const fullTitle = clampMetaText(
    input.title.includes(SITE_NAME) ? input.title : `${input.title} ${TITLE_SUFFIX}`,
    TITLE_MAX + TITLE_SUFFIX.length + 1,
  );
  const desc = clampMetaText(input.description, DESC_MAX);
  const canonical = toAbsolute(input.path);
  const image = toAbsolute(input.image || DEFAULT_OG_IMAGE);
  const meta: Record<string, unknown>[] = [
    { title: fullTitle },
    { name: "description", content: desc },
    ...(input.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ...(input.keywords ? [{ name: "keywords", content: input.keywords }] : []),
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: desc },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: canonical },
    { property: "og:image", content: image },
    { property: "og:locale", content: "en_IN" },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@spicenflavors" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: desc },
    { name: "twitter:image", content: image },
  ];
  return { meta, links: [{ rel: "canonical", href: canonical }] };
}

import legacyPostsJson from "@/lib/legacy-posts.json";

import fallback1 from "@/assets/dish-biryani.jpg";
import fallback2 from "@/assets/dish-butter-chicken.jpg";
import fallback3 from "@/assets/dish-masala-dosa.jpg";
import fallback4 from "@/assets/dish-paneer-butter-masala.jpg";
import fallback5 from "@/assets/dish-gulab-jamun.jpg";
import fallback6 from "@/assets/dish-samosa.jpg";
import fallback7 from "@/assets/recipe-curry.jpg";
import fallback8 from "@/assets/recipe-dessert.jpg";

export type LegacyPost = {
  slug: string;
  title: string;
  draft: boolean;
  date: string;
  updated: string;
  oldUrl: string;
  category: string;
  tags: string[];
  excerpt: string;
  readingTime: number;
  /** Local cover path (public/blog/...) — empty when the post had no images. */
  image: string;
  /** Sanitized at import time (scripts/import-blogger.mjs). Safe to render. */
  html: string;
};

export const legacyPosts = legacyPostsJson as LegacyPost[];

const FALLBACKS = [
  fallback1,
  fallback2,
  fallback3,
  fallback4,
  fallback5,
  fallback6,
  fallback7,
  fallback8,
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Cover for a legacy post; deterministic fallback for the few posts without images. */
export function legacyCover(post: LegacyPost): string {
  if (post.image) return post.image;
  return FALLBACKS[hashStr(post.slug) % FALLBACKS.length]!;
}

export const legacyBySlug = (slug: string) => legacyPosts.find((p) => p.slug === slug);

export const legacyLive = legacyPosts.filter((p) => !p.draft);
export const legacyDrafts = legacyPosts.filter((p) => p.draft);

export function legacyYear(post: LegacyPost): string {
  return post.date ? post.date.slice(0, 4) : "Unknown";
}

export const legacyYears: string[] = Array.from(new Set(legacyPosts.map(legacyYear)))
  .sort()
  .reverse();

export function formatLegacyDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

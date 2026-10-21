/** Structured recipe shape for Recipe Studio (client-safe, stored as recipe_json).
 *  Converts 1:1 into the curated `Recipe` type so admin recipes render with
 *  the exact same template, scaler, cooking mode and JSON-LD. */

import type { Recipe } from "./data";

export type DraftIngredient = {
  /** Null when the line has no quantity ("Salt to taste"). */
  qty: number | null;
  unit: string;
  name: string;
  /** Sub-group like "For tempering" (editor + preview show it, card ignores). */
  group?: string | undefined;
};

export type RecipeDraft = {
  title: string;
  slug: string;
  /** Short card line (also the meta description). */
  blurb: string;
  /** Story paragraphs (Blogger-style intro), joined with \n\n. */
  story: string;
  category: string;
  cuisine: string;
  tags: string[];
  diet: string[];
  prep: number;
  cook: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Advanced";
  ingredients: DraftIngredient[];
  steps: { text: string; timer: number | null }[];
  notes: string[];
  faqs: { q: string; a: string }[];
};

export function emptyRecipeDraft(): RecipeDraft {
  return {
    title: "",
    slug: "",
    blurb: "",
    story: "",
    category: "Main Course",
    cuisine: "North Indian",
    tags: [],
    diet: ["Vegetarian"],
    prep: 15,
    cook: 30,
    servings: 4,
    difficulty: "Easy",
    ingredients: [{ qty: null, unit: "", name: "" }],
    steps: [{ text: "", timer: null }],
    notes: [],
    faqs: [],
  };
}

export function slugifyTitle(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function safeParseRecipeJson(raw: string | null | undefined): RecipeDraft | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<RecipeDraft>;
    if (!v || typeof v !== "object" || !Array.isArray(v.ingredients) || !Array.isArray(v.steps)) {
      return null;
    }
    return {
      title: String(v.title ?? ""),
      slug: String(v.slug ?? ""),
      blurb: String(v.blurb ?? ""),
      story: String(v.story ?? ""),
      category: String(v.category ?? "Main Course"),
      cuisine: String(v.cuisine ?? "North Indian"),
      tags: Array.isArray(v.tags) ? v.tags.map(String).slice(0, 10) : [],
      diet: Array.isArray(v.diet) ? v.diet.map(String).slice(0, 6) : [],
      prep: Math.max(0, Math.min(1440, Math.round(Number(v.prep) || 0))),
      cook: Math.max(0, Math.min(1440, Math.round(Number(v.cook) || 0))),
      servings: Math.max(1, Math.min(50, Math.round(Number(v.servings) || 4))),
      difficulty: v.difficulty === "Medium" || v.difficulty === "Advanced" ? v.difficulty : "Easy",
      ingredients: v.ingredients
        .map((i) => ({
          qty: typeof i.qty === "number" && Number.isFinite(i.qty) ? i.qty : null,
          unit: String(i.unit ?? "").slice(0, 20),
          name: String(i.name ?? "").slice(0, 160),
          ...(typeof i.group === "string" && i.group.trim()
            ? { group: i.group.trim().slice(0, 60) }
            : {}),
        }))
        .filter((i) => i.name.trim() || i.qty !== null)
        .slice(0, 40),
      steps: v.steps
        .map((s) => ({
          text: String(s.text ?? "").slice(0, 1000),
          timer:
            typeof s.timer === "number" && Number.isFinite(s.timer) && s.timer > 0
              ? Math.min(1440, Math.round(s.timer))
              : null,
        }))
        .filter((s) => s.text.trim())
        .slice(0, 30),
      notes: Array.isArray(v.notes)
        ? v.notes
            .map(String)
            .map((s) => s.slice(0, 500))
            .filter(Boolean)
            .slice(0, 10)
        : [],
      faqs: Array.isArray(v.faqs)
        ? v.faqs
            .map((f) => ({
              q: String(f.q ?? "").slice(0, 200),
              a: String(f.a ?? "").slice(0, 1000),
            }))
            .filter((f) => f.q.trim() && f.a.trim())
            .slice(0, 8)
        : [],
    };
  } catch {
    return null;
  }
}

export { safeParseRecipeJson };

/** Admin recipe row -> curated-shaped Recipe for the shared detail template. */
export function draftToRecipe(opts: {
  slug: string;
  image: string;
  draft: RecipeDraft;
  blurbFallback?: string;
}): Recipe {
  const { slug, image, draft, blurbFallback } = opts;
  const minutes = draft.prep + draft.cook;
  return {
    slug,
    title: draft.title,
    blurb: draft.blurb || blurbFallback || draft.title,
    intro: draft.blurb || blurbFallback || draft.title,
    image,
    creator: "viya-sheth",
    cuisine: draft.cuisine,
    category: draft.category,
    tags: draft.tags,
    diet: draft.diet,
    minutes,
    prep: draft.prep,
    cook: draft.cook,
    servings: draft.servings,
    difficulty: draft.difficulty,
    ingredients: draft.ingredients.map((i) => ({
      qty: i.qty ?? 0,
      unit: i.unit,
      name: i.name,
    })),
    steps: draft.steps.map((s) => ({
      text: s.text,
      ...(s.timer ? { timer: s.timer } : {}),
    })),
    notes: draft.notes,
    tips: [],
    substitutions: [],
    faqs: draft.faqs,
    nutrition: [],
    ...(draft.story ? { story: draft.story } : {}),
  };
}

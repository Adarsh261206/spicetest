/** Deterministic content-assist heuristics (client-safe, zero network).
 *
 * Blueprint §6: no paid LLM in this pass. Everything here is a pure function
 * with predictable output. When a provider key exists, `provider.ts` exposes
 * the single seam (`callLlm`) — these functions stay as the offline fallback.
 */

import { clampMetaText } from "../seo";
import { parseLeadingQty } from "../scale";

const STOP = new Set([
  "and",
  "with",
  "the",
  "for",
  "from",
  "what",
  "make",
  "can",
  "have",
  "has",
  "had",
  "dinner",
  "lunch",
  "need",
  "want",
  "cook",
  "recipe",
  "recipes",
  "food",
  "meal",
  "something",
  "anything",
  "fresh",
  "leftover",
  "some",
  "dish",
  "today",
  "tonight",
  "indian",
  "easy",
  "best",
]);

export function wordsOf(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP.has(w));
}

export function exclusionsOf(s: string): string[] {
  const out: string[] = [];
  const lower = s.toLowerCase();
  for (const m of lower.matchAll(/(?:without|no|minus)\s+([a-z][a-z\s]*?)(?=[,.]|$| and )/g)) {
    out.push(...wordsOf(m[1] ?? ""));
  }
  return [...new Set(out)];
}

export function maxMinutesOf(s: string): number | null {
  const m = s.toLowerCase().match(/(\d+)\s*min/);
  return m ? Number(m[1]) : null;
}

export type Scorable = { title: string; tags: string[]; text?: string };
export type Scored<T> = { item: T; score: number; hits: string[] };

/** Generic keyword matcher: title hits weigh most, then tags, then body text. */
export function scoreItems<T extends Scorable>(
  input: string,
  items: T[],
  opts?: {
    limit?: number;
    titleWeight?: number;
    tagWeight?: number;
    textWeight?: number;
    minutesOf?: (item: T) => number | null;
  },
): Scored<T>[] {
  const titleW = opts?.titleWeight ?? 2;
  const tagW = opts?.tagWeight ?? 1;
  const textW = opts?.textWeight ?? 1;
  const wants = [...new Set(wordsOf(input))];
  const banned = new Set(exclusionsOf(input));
  const cap = maxMinutesOf(input);
  if (wants.length === 0 && cap === null) return [];
  const wordList = (s: string) => new Set(wordsOf(s));
  const scored: Scored<T>[] = [];
  for (const item of items) {
    const titleWords = wordList(item.title);
    const tagWords = new Set(item.tags.flatMap((t) => wordsOf(t)));
    const textWords = item.text ? wordList(item.text) : new Set<string>();
    if ([...banned].some((b) => titleWords.has(b) || tagWords.has(b) || textWords.has(b))) {
      continue;
    }
    if (cap !== null && opts?.minutesOf) {
      const mins = opts.minutesOf(item);
      if (mins !== null && mins > cap) continue;
    }
    const hits: string[] = [];
    let score = 0;
    for (const w of wants) {
      if (titleWords.has(w)) {
        score += titleW;
        hits.push(w);
      } else if (tagWords.has(w)) {
        score += tagW;
        hits.push(w);
      } else if (textWords.has(w)) {
        score += textW;
        hits.push(w);
      }
    }
    if (score > 0) scored.push({ item, score, hits: [...new Set(hits)] });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, opts?.limit ?? 3);
}

/* ------------------------- SEO field suggestions ------------------------- */

/** Meta title + description suggestion from title + body text (length-safe). */
export function suggestMeta(
  title: string,
  body: string,
  opts?: { cuisine?: string; category?: string },
): { title: string; description: string } {
  const clean = title.replace(/\s+/g, " ").trim();
  const firstSentence = body
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)[0]
    ?.trim();
  // No title yet — don't invent "Untitled recipe" copy, just use the body.
  if (!clean) {
    return {
      title: "",
      description:
        firstSentence && firstSentence.length > 40 ? clampMetaText(firstSentence, 155) : "",
    };
  }
  const keyword = opts?.cuisine || opts?.category || "recipe";
  const metaTitle = clampMetaText(`${clean} — ${keyword} recipe`, 65);
  const description =
    firstSentence && firstSentence.length > 40
      ? clampMetaText(firstSentence, 155)
      : clampMetaText(
          `${clean}: ${keyword} recipe with ingredients, step-by-step instructions and timings that work in a home kitchen.`,
          155,
        );
  return { title: metaTitle, description };
}

/** Excerpt from a paragraph: whole sentences, never a mid-word char slice. */
export function suggestExcerpt(paragraph: string, max = 170): string {
  const text = paragraph.replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  const sentences = text.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  return out || clampMetaText(text, max);
}

/* ------------------------- Rough-notes structuring ------------------------- */

const IMPERATIVE = new Set([
  "add",
  "heat",
  "mix",
  "stir",
  "cook",
  "bake",
  "boil",
  "fry",
  "roast",
  "chop",
  "grind",
  "pour",
  "serve",
  "garnish",
  "whisk",
  "blend",
  "simmer",
  "steam",
  "marinate",
  "toss",
  "sprinkle",
  "drain",
  "soak",
  "knead",
  "roll",
  "slice",
  "dice",
  "mince",
  "saute",
  "sautee",
  "temper",
  "pressure",
  "microwave",
  "preheat",
  "grease",
  "fold",
  "beat",
  "combine",
  "transfer",
  "cover",
  "uncover",
  "reduce",
  "thicken",
  "cool",
  "refrigerate",
  "freeze",
  "thaw",
  "rinse",
  "wash",
  "peel",
  "grate",
  "squeeze",
]);

/** Split rough notes into ingredients vs steps.
 *  qty-led line => ingredient · numbered/imperative/long line => step. */
export function structureNotes(text: string): { ingredients: string[]; steps: string[] } {
  const lines = text
    .split("\n")
    .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
  const ingredients: string[] = [];
  const steps: string[] = [];
  for (const line of lines) {
    const numbered = line.match(/^\d+[.)]\s*(.*)$/);
    if (numbered) {
      steps.push((numbered[1] ?? "").trim());
      continue;
    }
    if (parseLeadingQty(line)) {
      ingredients.push(line);
      continue;
    }
    const firstWord =
      line
        .toLowerCase()
        .split(/\s+/)[0]
        ?.replace(/[^a-z]/g, "") ?? "";
    if (IMPERATIVE.has(firstWord) || line.length > 70) {
      steps.push(line);
      continue;
    }
    ingredients.push(line);
  }
  // Never return both empty when input existed; never return steps-only for
  // what is clearly a shopping list (all short, no verbs).
  if (ingredients.length === 0 && steps.length > 0) {
    const maybeIng = steps.filter((s) => s.length <= 45);
    if (maybeIng.length === steps.length) return { ingredients: maybeIng, steps: [] };
  }
  return { ingredients, steps };
}

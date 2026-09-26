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

/* ------------------------------------------------------------------ */
/* Legacy HTML normalizer: turns Blogger <span>/<br> soup into clean,  */
/* readable article markup (paragraphs, headings, lists, figures).     */
/* ------------------------------------------------------------------ */

const stripTags = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function boldOnlyText(s: string): string {
  const withoutBold = s
    .replace(/<(b|strong)>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (withoutBold.replace(/^[:\-\s–—]+|[:\-\s–—]+$/g, "").length > 0) return "";
  return stripTags(s).replace(/^[:\-\s–—]+|[:\-\s–—]+$/g, "");
}

const METHOD_WORDS = /method|proced|preparat|direction|instruction|steps? to|how to make/i;
const INGRED_WORDS = /ingred/i;

/** Max chars for a line to join the current list (method steps run long). */
const LIST_ITEM_MAX = 450;

type ListMode = null | "ul" | "ol";

/** Drop stray closers / auto-close unbalanced inline tags split across lines. */
function balanceInline(s: string): string {
  let out = s;
  for (const tag of ["i", "em", "b", "strong"]) {
    const open = (out.match(new RegExp(`<${tag}(\\s[^>]*)?>`, "g")) ?? []).length;
    const close = (out.match(new RegExp(`</${tag}>`, "g")) ?? []).length;
    if (close > open) {
      let n = close - open;
      out = out.replace(new RegExp(`</${tag}>`, "g"), (m) => (n-- > 0 ? "" : m));
    } else if (open > close) {
      out += `</${tag}>`.repeat(open - close);
    }
  }
  return out;
}

/**
 * Normalize one imported post into clean article HTML.
 * - caption tables / image separators -> <figure>
 * - standalone bold lines -> headings; following short lines -> lists
 * - drops the cover duplicate + consecutive duplicate photos
 */
export function legacyBody(post: LegacyPost): string {
  const blocks: string[] = [];
  const blockSlot = (block: string) => {
    blocks.push(block);
    return `\n\n@@B${blocks.length - 1}@@\n\n`;
  };

  let html = post.html;

  // Real lists stay lists (rebuilt cleanly so stray markup can't leak in).
  html = html.replace(/<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, tag: string, inner: string) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) => stripTags(m[1] ?? ""))
      .filter(Boolean)
      .map((t) => `<li>${t}</li>`)
      .join("");
    if (!items) return `\n\n${stripTags(inner)}\n\n`;
    return blockSlot(`<${tag}>${items}</${tag}>`);
  });

  // Caption tables -> figures.
  html = html.replace(
    /<table[^>]*class="tr-caption-container"[^>]*>([\s\S]*?)<\/table>/gi,
    (_m, inner: string) => {
      const img = inner.match(/<img\b[^>]*>/i)?.[0] ?? "";
      if (!img) return "\n\n";
      const capRaw = inner.match(/<td[^>]*class="tr-caption"[^>]*>([\s\S]*?)<\/td>/i)?.[1] ?? "";
      const cap = stripTags(capRaw);
      return blockSlot(`<figure>${img}${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`);
    },
  );

  // Image separators -> figures; text separators unwrap; empty ones vanish.
  html = html.replace(
    /<div[^>]*class="separator"[^>]*>([\s\S]*?)<\/div>/gi,
    (_m, inner: string) => {
      const img = inner.match(/<img\b[^>]*>/i)?.[0] ?? "";
      if (img) {
        const link = inner.match(/<a\b[^>]*href="([^"]*)"[^>]*>/i)?.[1];
        return blockSlot(
          link && link !== "#"
            ? `<figure><a href="${link}">${img}</a></figure>`
            : `<figure>${img}</figure>`,
        );
      }
      if (stripTags(inner)) return `\n\n${inner}\n\n`;
      return "\n\n";
    },
  );

  // Remaining tables (rare, non-caption): keep cell text, drop chrome.
  html = html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_m, inner: string) => {
    const text = inner.replace(/<\/(tr|td|th)>/gi, "\n").replace(/<[^>]+>/g, " ");
    return `\n\n${text}\n\n`;
  });

  // Block boundaries + inline cleanup.
  html = html.replace(/<\/?(?:div|p|h1|h2|h3|h4|li|ul|ol|blockquote)[^>]*>/gi, "\n\n");
  html = html.replace(/<\/?(?:span|font|center)[^>]*>/gi, "");
  // Underlined standalone lines are section titles in old posts -> treat as bold.
  html = html.replace(/<u>([^<>]*)<\/u>/gi, "<b>$1</b>");
  html = html.replace(/<\/?u[^>]*>/gi, "");
  html = html.replace(/<br\s*\/?>/gi, "\n");
  html = html.replace(/(?:&nbsp;|&#160;)(\s*(?:&nbsp;|&#160;))+/gi, " ");
  html = html.replace(/&nbsp;|&#160;/g, " ");

  const out: string[] = [];
  let list: ListMode = null;
  let listOpen = false;
  const closeList = () => {
    if (listOpen) {
      out.push(list === "ul" ? "</ul>" : "</ol>");
      listOpen = false;
    }
    list = null;
  };

  // Drop the cover (already shown in the hero) wherever it appears in the
  // body, plus back-to-back duplicate photos (first occurrence wins).
  const seenSrc = new Set<string>();
  const figSrc = (fig: string) => fig.match(/<img\b[^>]*src="([^"]*)"/i)?.[1] ?? "";
  const keepSrc = (src: string): boolean => {
    if (!src) return true;
    if (src === post.image) return false;
    if (seenSrc.has(src)) return false;
    seenSrc.add(src);
    return true;
  };

  for (const rawLine of html.split("\n")) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (!line) continue;

    const slotMatch = line.match(/^@@B(\d+)@@$/);
    if (slotMatch) {
      const fig = blocks[Number(slotMatch[1])] ?? "";
      if (!keepSrc(figSrc(fig))) continue;
      closeList();
      out.push(fig);
      continue;
    }

    // Stray images outside figures (should be rare).
    if (/^<img\b[^>]*>$/.test(line)) {
      const src = line.match(/src="([^"]*)"/i)?.[1] ?? "";
      if (!keepSrc(src)) continue;
      closeList();
      out.push(`<figure>${line}</figure>`);
      continue;
    }

    const text = stripTags(line);
    if (!text) continue;

    const bold = boldOnlyText(line);
    const plainSection =
      /^(ingredients|method|preparation|procedure|directions|instructions)\s*:?$/i.test(text);
    const label = (
      bold && bold.length <= 90 && /[a-zA-Z]/.test(bold) ? bold : plainSection ? text : ""
    ).replace(/:$/, "");
    if (label) {
      closeList();
      if (INGRED_WORDS.test(label)) {
        out.push(`<h3>${label}</h3>`);
        list = "ul";
      } else if (METHOD_WORDS.test(label) || plainSection) {
        out.push(`<h3>${label}</h3>`);
        list = "ol";
      } else {
        out.push(`<h4>${label}</h4>`);
        list = "ul";
      }
      continue;
    }
    if (list && text.length <= LIST_ITEM_MAX) {
      if (!listOpen) {
        out.push(list === "ul" ? "<ul>" : "<ol>");
        listOpen = true;
      }
      const item = balanceInline(
        list === "ol" ? line.replace(/^(?:<[^>]+>)*\d+[.)\]}]\s*/, "") : line,
      );
      out.push(`<li>${item}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${balanceInline(line)}</p>`);
  }
  closeList();

  return out.join("\n").trim();
}

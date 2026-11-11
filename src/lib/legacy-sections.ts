/** Section parser for Blogger-era recipe HTML (normalized by legacyBody). */

import { decodeEntities } from "./legacy";

export type LegacyBlock =
  | { type: "heading"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "html"; html: string };

export type LegacySection = {
  heading: string;
  kind: "ingredients" | "method" | "other";
  items: string[];
  html: string;
  blocks: LegacyBlock[];
};

export type LegacyPhoto = { src: string; caption: string };

export const stripLegacy = (s: string) =>
  decodeEntities(s.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();

/** Upper bound of the first time range in "20–30 minutes" / "1 hour". */
export function timerFromText(text: string): number | undefined {
  const match = text.match(/(\d+)(?:\s*(?:–|—|-|to)\s*(\d+))?\s*(minutes?|mins?|hours?|hrs?)\b/i);
  if (!match) return undefined;
  const value = Number(match[2] ?? match[1]);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  const minutes = /^h/i.test(match[3]!) ? value * 60 : value;
  return Math.min(minutes, 1440);
}

/**
 * An unordered list under a sub-heading is usually a component ingredient
 * list ("Tamarind chutney: 200 gm tamarind…"), not another step. Detect the
 * quantity-led lists so they render as notes instead of numbered steps.
 */
export function isIngredientListBlock(blocks: LegacyBlock[], index: number): boolean {
  const block = blocks[index];
  if (!block || block.type !== "list" || block.ordered) return false;
  if (blocks[index - 1]?.type !== "heading") return false;
  const items = block.items.map(stripLegacy).filter(Boolean);
  if (!items.length) return false;
  const quantityLed = items.filter((item) =>
    /^(?:\d+(?:[./]\d+)?|[¼½¾⅓⅔⅛])\s*(?:g|gm|gms|kg|ml|l|litre|liter|cup|cups|tbsp|tsp|tablespoons?|teaspoons?|oz|pounds?|lbs?|inch|cloves?|pinch|bunch|can|cans|slices?|pieces?|sprigs?)\b/i.test(
      item,
    ),
  ).length;
  return quantityLed / items.length >= 0.5;
}

/** Keep sub-headings, lists and paragraphs in source order (grouped recipes). */
export function sectionBlocks(content: string): LegacyBlock[] {
  const blocks: LegacyBlock[] = [];
  const re = /<h4>([\s\S]*?)<\/h4>|<(ul|ol)[^>]*>([\s\S]*?)<\/\2>/gi;
  let cursor = 0;
  const pushHtml = (raw: string) => {
    const html = raw.trim();
    if (html && stripLegacy(html)) blocks.push({ type: "html", html });
  };
  let match: RegExpExecArray | null;
  while ((match = re.exec(content))) {
    if (match.index > cursor) pushHtml(content.slice(cursor, match.index));
    if (match[1] !== undefined) {
      const text = stripLegacy(match[1]);
      if (text) blocks.push({ type: "heading", text });
    } else {
      const ordered = (match[2] ?? "ul").toLowerCase() === "ol";
      const items = [...(match[3] ?? "").matchAll(/<li>([\s\S]*?)<\/li>/gi)]
        .map((m) => (m[1] ?? "").trim())
        .filter((h) => stripLegacy(h));
      if (items.length) blocks.push({ type: "list", ordered, items });
    }
    cursor = re.lastIndex;
  }
  if (cursor < content.length) pushHtml(content.slice(cursor));
  return blocks;
}

/** Split normalized legacy HTML into intro + headed sections (ingredients / method / notes). */
export function parseLegacySections(body: string): {
  intro: string;
  sections: LegacySection[];
  photos: LegacyPhoto[];
} {
  const photos: LegacyPhoto[] = [];
  const pullPhotos = (html: string): string =>
    html.replace(/<figure>([\s\S]*?)<\/figure>/gi, (_m, inner: string) => {
      const src = inner.match(/<img\b[^>]*src="([^"]*)"/i)?.[1] ?? "";
      const caption = (inner.match(/<figcaption>([\s\S]*?)<\/figcaption>/i)?.[1] ?? "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (src) photos.push({ src, caption });
      return "";
    });
  const chunks = pullPhotos(body).split(/(<h3>.*?<\/h3>)/gis);
  const intro = (chunks[0] ?? "").trim();
  const sections: LegacySection[] = [];
  for (let i = 1; i < chunks.length; i += 2) {
    const heading = (chunks[i] ?? "")
      .replace(/<\/?h3>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const content = chunks[i + 1] ?? "";
    const lower = heading.toLowerCase();
    const kind: LegacySection["kind"] = /ingred/.test(lower)
      ? "ingredients"
      : /method|proced|preparat|direction|instruction|\bstep\b|how to make/.test(lower)
        ? "method"
        : "other";
    const items = [...content.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
      .map((m) => (m[1] ?? "").trim())
      .filter((h) => stripLegacy(h));
    const stripped = pullPhotos(content);
    const html = stripped.replace(/<(ul|ol)>[\s\S]*?<\/\1>/gi, "").trim();
    sections.push({ heading, kind, items, html, blocks: sectionBlocks(stripped) });
  }

  // Old posts occasionally split one method across two "Method" headings —
  // fold those back into a single continuous set of steps.
  const merged: LegacySection[] = [];
  for (const section of sections) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      section.kind === "method" &&
      previous.kind === "method" &&
      /^(method|instructions?|directions?|preparation|procedure|steps?)\b/i.test(section.heading)
    ) {
      previous.blocks.push(...section.blocks);
      previous.items.push(...section.items);
      if (!previous.html && section.html) previous.html = section.html;
      continue;
    }
    merged.push(section);
  }

  // A trailing "For Rice"/"Mutton Gravy" heading introduces the next
  // ingredient group, not another step — move it onto that group.
  for (let i = 0; i < merged.length - 1; i += 1) {
    const section = merged[i]!;
    const next = merged[i + 1]!;
    if (section.kind !== "method" || next.kind !== "ingredients") continue;
    while (section.blocks[section.blocks.length - 1]?.type === "heading") {
      next.blocks.unshift(section.blocks.pop()!);
    }
  }

  // A heading left dangling after the ingredient list is a label for what
  // follows — "For Marinate" before the method, or "Spice powder" before the
  // next ingredient group.
  for (let i = 0; i < merged.length - 1; i += 1) {
    const section = merged[i]!;
    const next = merged[i + 1]!;
    const trailingLabelApplies =
      section.kind === "ingredients" && (next.kind === "method" || next.kind === "ingredients");
    if (!trailingLabelApplies) continue;
    while (section.blocks[section.blocks.length - 1]?.type === "heading") {
      next.blocks.unshift(section.blocks.pop()!);
    }
  }

  // Keep component ingredient lists (with their sub-heading) after the steps
  // instead of interrupting the numbered method.
  for (const section of merged) {
    if (section.kind !== "method") continue;
    const steps: LegacyBlock[] = [];
    const notes: LegacyBlock[] = [];
    section.blocks.forEach((block, index) => {
      if (isIngredientListBlock(section.blocks, index)) {
        const heading = steps[steps.length - 1];
        if (heading?.type === "heading") notes.push(steps.pop()!);
        notes.push(block);
        return;
      }
      steps.push(block);
    });
    section.blocks = [...steps, ...notes];
  }

  return { intro, sections: merged, photos };
}

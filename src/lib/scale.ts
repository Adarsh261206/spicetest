/** Ingredient quantity scaling for free-text legacy ingredients (client-safe). */

const UNICODE_FRACS: Record<string, number> = {
  "½": 0.5,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 0.25,
  "¾": 0.75,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const UNITS = new Set([
  "g",
  "gram",
  "grams",
  "kg",
  "kgs",
  "mg",
  "oz",
  "lb",
  "lbs",
  "pound",
  "pounds",
  "ml",
  "l",
  "litre",
  "litres",
  "liter",
  "liters",
  "tsp",
  "tsps",
  "tbsp",
  "tbsps",
  "teaspoon",
  "teaspoons",
  "tablespoon",
  "tablespoons",
  "cup",
  "cups",
  "pint",
  "pints",
  "quart",
  "quarts",
  "gallon",
  "pinch",
  "dash",
  "handful",
  "bunch",
  "bunches",
  "sprig",
  "sprigs",
  "stalk",
  "stalks",
  "clove",
  "cloves",
  "slice",
  "slices",
  "piece",
  "pieces",
  "can",
  "cans",
  "tin",
  "tins",
  "packet",
  "packets",
  "pack",
  "box",
  "boxes",
  "bag",
  "bags",
  "bottle",
  "bottles",
  "jar",
  "cm",
  "inch",
  "inches",
]);

export const stripHtml = (s: string): string =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function toNumber(raw: string): number | null {
  const t = raw.trim();
  if (UNICODE_FRACS[t] !== undefined) return UNICODE_FRACS[t];
  const frac = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const d = Number(frac[2]);
    if (d === 0) return null;
    return Number(frac[1]) / d;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const FRAC_PRETTY: [number, string][] = [
  [0.125, "⅛"],
  [1 / 3, "⅓"],
  [0.25, "¼"],
  [0.5, "½"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
];

/** 4 -> "4", 0.5 -> "½", 2.666 -> "2.67", 1000 -> "1,000". */
export function formatQty(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  const rounded = Math.round(n * 100) / 100;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9) {
    return Math.round(rounded).toLocaleString("en-IN");
  }
  if (rounded < 20) {
    const whole = Math.floor(rounded);
    const frac = rounded - whole;
    for (const [v, glyph] of FRAC_PRETTY) {
      if (Math.abs(frac - v) < 0.03) return whole > 0 ? `${whole}${glyph}` : glyph;
    }
  }
  return String(parseFloat(rounded.toFixed(2)));
}

export type ParsedQty = { qty: number; unit: string; rest: string; range?: [number, number] };

/** Parse "500g Paneer" / "1/4 cup cashews" / "4 medium tomatoes" / "2-3 cups flour". Null when no leading qty. */
export function parseLeadingQty(text: string): ParsedQty | null {
  const t = stripHtml(text);
  // Range first: "2-3 cups flour".
  const range = t.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s+(.*)$/);
  if (range) {
    const rest = (range[3] ?? "").trim();
    if (!rest) return null;
    return { qty: NaN, unit: "", rest, range: [Number(range[1]), Number(range[2])] };
  }
  const m = t.match(/^(\d+\s*\/\s*\d+|[½⅓⅔¼¾⅛⅜⅝⅞]|\d+(?:\.\d+)?)\s*([a-zA-Z]*)\s*(.*)$/);
  if (!m) return null;
  const qty = toNumber(m[1]!);
  if (qty === null) return null;
  let unit = (m[2] ?? "").toLowerCase();
  let rest = (m[3] ?? "").trim();
  if (unit && !UNITS.has(unit)) {
    rest = `${m[2]}${rest ? ` ${rest}` : ""}`.trim();
    unit = "";
  }
  if (!rest) return null;
  return { qty, unit, rest };
}

/** Scale free-text ingredient line; lines without quantities pass through unchanged. */
export function scaleIngredientText(itemHtml: string, scale: number): string {
  const plain = stripHtml(itemHtml);
  if (scale === 1) return plain;
  const parsed = parseLeadingQty(itemHtml);
  if (!parsed) return plain;
  if (parsed.range) {
    const [a, b] = parsed.range;
    return `${formatQty(a * scale)}-${formatQty(b * scale)} ${parsed.rest}`.trim();
  }
  const unitPart = parsed.unit ? ` ${parsed.unit}` : "";
  return `${formatQty(parsed.qty * scale)}${unitPart} ${parsed.rest}`.trim();
}

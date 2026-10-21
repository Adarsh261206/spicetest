/** Blogger-style rough notes -> structured RecipeDraft (client-safe, zero network).
 *
 * "Trained" for how recipes are actually dictated/typed: mixed Hindi-English
 * headings (Samagri / Vidhi / Banane ki vidhi), jumbled lines, time hints
 * like "30 min" or "Serves 4", tempering sub-groups. Everything uncertain is
 * returned as an editable guess + a warning — never silently invented.
 */

import type { RecipeDraft } from "../recipe";
import { emptyRecipeDraft, slugifyTitle } from "../recipe";
import { legacyCategory } from "../legacy-categories";
import { parseLeadingQty } from "../scale";
import { suggestExcerpt } from "./enhance";
import { cuisines } from "../data";

const HEADINGS: {
  match: RegExp;
  section: "title" | "ingredients" | "method" | "notes" | "meta";
}[] = [
  { match: /^(title|recipe(\s*name)?|dish(\s*name)?|name)\s*:?$/i, section: "title" },
  { match: /^(ingredients?|samagri|saamagri|saman)\s*:?$/i, section: "ingredients" },
  {
    match:
      /^(method|vidhi|banane(\s*ki)?(\s*vidhi)?|instructions?|directions?|preparation|steps?|how(\s*to)?(\s*make)?|banaye|recipe\s*steps?)\s*:?$/i,
    section: "method",
  },
  {
    match: /^(notes?|tips?|note|serving(\s*suggestion)?s?|serve|remember)\s*:?$/i,
    section: "notes",
  },
  {
    match:
      /^(time|timings?|prep(\s*time)?|cook(\s*time)?|total(\s*time)?|serves?|servings?)\s*:?$/i,
    section: "meta",
  },
];

const NON_VEG = new Set([
  "chicken",
  "mutton",
  "lamb",
  "fish",
  "prawn",
  "prawns",
  "shrimp",
  "shrimps",
  "crab",
  "egg",
  "eggs",
  "anda",
  "ande",
  "keema",
  "kheema",
  "beef",
  "pork",
  "bacon",
  "sausage",
  "meat",
  "chicken",
  "tuna",
]);

const DAIRY = new Set([
  "milk",
  "doodh",
  "paneer",
  "ghee",
  "butter",
  "makhan",
  "cream",
  "malai",
  "dahi",
  "yogurt",
  "yoghurt",
  "curd",
  "cheese",
  "khoya",
  "mawa",
]);

function cleanLines(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

function headingOf(line: string): "title" | "ingredients" | "method" | "notes" | "meta" | null {
  const t = line.replace(/:\s*$/, "").trim();
  if (t.length > 40) return null;
  for (const h of HEADINGS) {
    if (h.match.test(t)) return h.section;
  }
  return null;
}

function minutesFromLine(line: string): { prep?: number; cook?: number; total?: number } {
  const out: { prep?: number; cook?: number; total?: number } = {};
  const num = (re: RegExp): number | undefined => {
    const m = line.match(re);
    if (!m) return undefined;
    const v = Number(m[1]);
    if (!Number.isFinite(v)) return undefined;
    const unit = (m[2] ?? "min").toLowerCase();
    return unit.startsWith("h") ? Math.round(v * 60) : Math.round(v);
  };
  const prep = num(
    /(?:prep(?:aration)?|taiyari|taiyaar)(?:\s*time)?\s*:?\s*(\d+)\s*(min(?:ute)?s?|h(?:ou)?r?s?)/i,
  );
  const cook = num(
    /(?:cook(?:ing)?|pakana|pakane|banane)(?:\s*time)?(?:\s*me)?\s*:?\s*(\d+)\s*(min(?:ute)?s?|h(?:ou)?r?s?)/i,
  );
  const total =
    num(/total(?:\s*time)?\s*:?\s*(\d+)\s*(min(?:ute)?s?|h(?:ou)?r?s?)/i) ??
    num(
      /(\d+)\s*(min(?:ute)?s?|h(?:ou)?r?s?)\s*(?:me(?:in)?\s+)?(total|kul|ban|lag|taiyaar|taiyar|ready)/i,
    ) ??
    num(/(?:taiyaar|taiyar|ready)\s*(?:in\s*)?(\d+)\s*(min(?:ute)?s?|h(?:ou)?r?s?)/i);
  if (prep !== undefined) out.prep = prep;
  if (cook !== undefined) out.cook = cook;
  if (total !== undefined) out.total = total;
  return out;
}

function servingsFromLine(line: string): number | undefined {
  const m =
    line.match(/serves?\s*(\d+)(?:\s*-\s*(\d+))?/i) ||
    line.match(/(\d+)\s*servings?/i) ||
    line.match(/servings?\s*:?\s*(\d+)/i) ||
    line.match(/for\s*(\d+)\s*(people|members|persons|log|logo)/i) ||
    line.match(/(\d+)\s*logon?\s*(ke liye|ke|ko)?/i) ||
    line.match(/(\d+)\s*(jan|vyakti|members?)\s*(ke liye)?/i);
  if (!m) return undefined;
  const a = Number(m[1]);
  const b = m[2] && /^\d+$/.test(m[2]) ? Number(m[2]) : a;
  if (!Number.isFinite(a)) return undefined;
  return Math.max(1, Math.min(50, Math.round((a + (Number.isFinite(b) ? b : a)) / 2)));
}

function timerFromStep(text: string): number | null {
  // \b is load-bearing: without it "2 hari mirch" parses as "2 hr" = 120 min.
  const m = text.match(/(\d+)\s*(min(?:ute)?s?|h(?:ou)?r?s?|ghant[ae])\b/i) ?? null;
  if (!m) return null;
  const v = Number(m[1]);
  if (!Number.isFinite(v) || v <= 0 || v > 1440) return null;
  const unit = m[2]!.toLowerCase();
  return unit.startsWith("h") || unit.startsWith("gh") ? v * 60 : v;
}

/* ---------------- Line classifiers for heading-less pastes ---------------- */
/* She usually types Hinglish with no headings — so first-word verbs cover both. */

const EN_IMPERATIVES = new Set([
  "add",
  "heat",
  "mix",
  "mash",
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
  "temper",
  "preheat",
  "grease",
  "fold",
  "beat",
  "combine",
  "transfer",
  "cover",
  "reduce",
  "cool",
  "rinse",
  "peel",
  "grate",
  "squeeze",
]);

// NOTE: every entry here must never be a food word. "bel" (wood apple) and
// "mix" (trail/cake mix) are deliberately absent — "belo"/"bel lo" and
// "karo"/first-word cover those actions instead.
const HI_IMPERATIVES = new Set([
  "karo",
  "karein",
  "karlo",
  "lelo",
  "le",
  "lo",
  "do",
  "dalo",
  "daalo",
  "milao",
  "milo",
  "milayein",
  "bhuno",
  "bhun",
  "pakao",
  "paka",
  "pakayein",
  "seko",
  "sek",
  "belo",
  "kaato",
  "kaat",
  "peeso",
  "pees",
  "ubalo",
  "ubal",
  "talo",
  "tal",
  "nikalo",
  "nikal",
  "rakho",
  "rakh",
  "khao",
  "kha",
  "khayein",
  "chalao",
  "chalayein",
  "gholo",
  "ghol",
  "pheto",
  "phent",
  "hilao",
  "hila",
  "dekho",
  "lagao",
  "lagayein",
  "gundh",
  "gundho",
  "seklo",
]);

const ANYWHERE_IMPERATIVE =
  /\b(karo|karein|kar lo|le lo|de do|lijiye|kijiye|khao|khayein|bhun lo|paka lo)\b/i;

const NOTE_HINT =
  /(fridge|freeze|frozen|\bstays\b|\bkeeps\b|leftover|bacha|bachi|serve hot|garam serve|garam paros|paros do|din tak|hafte tak|week tak)/i;

/** Time/serving hints typed inline ("Prep 15 min", "2 logon ke liye"). */
function isMetaLine(line: string): boolean {
  if (servingsFromLine(line) !== undefined) return true;
  const t = minutesFromLine(line);
  return t.prep !== undefined || t.cook !== undefined || t.total !== undefined;
}

function isNoteLine(line: string): boolean {
  return NOTE_HINT.test(line);
}

/** First-word verb or numbering only (no length rule) — for story eject. */
function isStepLineFirst(line: string): boolean {
  if (/^\d+[.)]\s*\S/.test(line)) return true;
  const first =
    line
      .toLowerCase()
      .split(/\s+/)[0]
      ?.replace(/[^a-z]/g, "") ?? "";
  return EN_IMPERATIVES.has(first) || HI_IMPERATIVES.has(first);
}

/** Any action verb anywhere ("Aloo mash karo", "2 roti bel lo"). */
function hasActionVerb(line: string): boolean {
  if (ANYWHERE_IMPERATIVE.test(line)) return true;
  const words = line
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ""));
  if (words[0] && (EN_IMPERATIVES.has(words[0]) || HI_IMPERATIVES.has(words[0]))) return true;
  return words.some((w) => HI_IMPERATIVES.has(w));
}

/** Numbered, verb-first, timer-bearing, or long prose = an action, not an item. */
function isStepLine(line: string, anywhereVerbs: boolean): boolean {
  if (/^\d+[.)]\s*\S/.test(line)) return true;
  if (timerFromStep(line) !== null) return true;
  const words = line
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ""));
  const first = words[0] ?? "";
  if (EN_IMPERATIVES.has(first) || HI_IMPERATIVES.has(first)) return true;
  if (anywhereVerbs) {
    if (ANYWHERE_IMPERATIVE.test(line)) return true;
    // Verb anywhere in the line ("Rava bhuno", "Aloo mash karo").
    if (words.some((w) => HI_IMPERATIVES.has(w))) return true;
  }
  if (line.length > 70) return true;
  return false;
}

/** Heading-less paste: title = first line, then story -> ingredients -> method
 *  by line shape. Sticky method run; meta/note lines always routed aside. */
function classifyUnheaded(
  lines: string[],
  buckets: Record<"story" | "ingredients" | "method" | "notes" | "meta", string[]>,
  warnings: string[],
  setTitle: (t: string) => void,
): void {
  const [first, ...rest] = lines;
  if (!first) return;
  if (first.length > 80 || parseLeadingQty(first) !== null || isMetaLine(first)) {
    if (isMetaLine(first)) buckets.meta.push(first);
    else if (parseLeadingQty(first) === null) buckets.story.push(first);
    else buckets.ingredients.push(first);
    setTitle("");
    warnings.push("Couldn't find a name — please type it in the Organize step.");
  } else {
    setTitle(first.replace(/^(title|recipe(\s*name)?|dish(\s*name)?|name)\s*:\s*/i, "").trim());
  }

  let state: "story" | "ingredients" | "method" = "story";
  let group = "";
  const pushIngredient = (line: string) => {
    buckets.ingredients.push(group ? `${group} || ${line}` : line);
  };
  for (const line of rest) {
    if (line.length <= 90 && isMetaLine(line)) {
      buckets.meta.push(line);
      continue;
    }
    if (isNoteLine(line)) {
      buckets.notes.push(line);
      continue;
    }
    // Sub-group like "For tempering:" (same rule as the headed path).
    if (
      parseLeadingQty(line) === null &&
      line.length <= 45 &&
      (/:\s*$/.test(line) || /^for\s+/i.test(line))
    ) {
      group = line.replace(/:\s*$/, "").trim();
      if (state === "story") state = "ingredients";
      continue;
    }
    const qty = parseLeadingQty(line) !== null;
    // In the intro zone, length alone never ejects — only a real signal does
    // (quantity item, numbering, leading verb, or timer). Long intro stays story.
    // A qty-led line with an action verb ("2 roti bel lo") is an action.
    const verb = hasActionVerb(line);
    const stepStrong =
      /^\d+[.)]\s*\S/.test(line) || timerFromStep(line) !== null || isStepLineFirst(line);
    if (state === "story") {
      const storyEmpty = buckets.story.length === 0;
      if (qty && !verb) {
        state = "ingredients";
        pushIngredient(line);
      } else if (qty && verb) {
        // Quantity + action ("2 roti bel lo") is an action, not an item.
        state = "method";
        group = "";
        buckets.method.push(line);
      } else if (stepStrong || (!storyEmpty && verb)) {
        // The very first line after the title is protected intro (only hard
        // signals eject it). A later verb-led line is method, not para 2 —
        // a split intro is cheaper to fix than an empty method list.
        state = "method";
        group = "";
        buckets.method.push(line);
      } else {
        buckets.story.push(line);
      }
    } else if (state === "ingredients") {
      if (!verb && (qty || line.length <= 45)) {
        pushIngredient(line);
      } else if (verb || stepStrong || line.length > 45) {
        state = "method";
        group = "";
        buckets.method.push(line);
      } else {
        pushIngredient(line);
      }
    } else {
      buckets.method.push(line);
    }
  }
  if (buckets.ingredients.length > 0 || buckets.method.length > 0) {
    warnings.push("No headings found — lines were split by guess, please review each section.");
  }
}

function guessCuisine(hay: string): string {
  const lower = ` ${hay.toLowerCase()} `;
  for (const c of cuisines) {
    if (lower.includes(` ${c.toLowerCase()} `)) return c;
  }
  return "North Indian";
}

function titleKeywords(title: string, max = 4): string[] {
  const stop = new Set([
    "with",
    "from",
    "that",
    "this",
    "your",
    "recipe",
    "recipes",
    "easy",
    "best",
    "homemade",
    "indian",
    "spice",
    "flavors",
    "flavours",
    "blog",
    "make",
    "made",
    "using",
    "style",
    "special",
  ]);
  return [
    ...new Set(
      title
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !stop.has(w)),
    ),
  ].slice(0, max);
}

export type ParsedRecipe = { draft: RecipeDraft; warnings: string[] };

/** Full rough-paste -> editable draft. Warns about every guess made. */
export function parseRecipeDraft(raw: string): ParsedRecipe {
  const draft = emptyRecipeDraft();
  const warnings: string[] = [];
  const lines = cleanLines(raw);
  if (lines.length === 0) {
    warnings.push("Nothing written yet — paste your rough notes first.");
    return { draft, warnings };
  }

  // 1. Bucket lines into title/story/ingredients/method/notes/meta.
  type Bucket = "story" | "ingredients" | "method" | "notes" | "meta";
  const buckets: Record<Bucket, string[]> = {
    story: [],
    ingredients: [],
    method: [],
    notes: [],
    meta: [],
  };
  let titleLine = "";
  let group = "";

  const sawHeading = lines.some((l) => headingOf(l) !== null);
  if (!sawHeading) {
    // No headings at all (the usual case) — classify line by line.
    classifyUnheaded(lines, buckets, warnings, (t) => {
      titleLine = t;
    });
  } else {
    let section: "title" | Bucket = "story";
    let titleTaken = false;
    for (const line of lines) {
      const h = headingOf(line);
      if (h === "title") {
        section = "title";
        continue;
      }
      if (h) {
        section = h === "meta" ? "meta" : h;
        group = "";
        continue;
      }
      if (section === "title") {
        titleLine = line
          .replace(/^(title|recipe(\s*name)?|dish(\s*name)?|name)\s*:\s*/i, "")
          .trim();
        titleTaken = true;
        section = "story";
        continue;
      }
      if (!titleTaken) {
        // First meaningful line doubles as the title (Blogger style) — unless
        // it is clearly an ingredient line or a wall of text.
        const looksIngredient = parseLeadingQty(line) !== null;
        if (line.length > 80 || looksIngredient || isMetaLine(line)) {
          if (looksIngredient || isMetaLine(line)) {
            if (isMetaLine(line)) buckets.meta!.push(line);
            else buckets.ingredients!.push(line);
          } else {
            buckets.story!.push(line);
          }
          titleTaken = true;
          titleLine = "";
          warnings.push("Couldn't find a name — please type it in the Organize step.");
          continue;
        }
        titleLine = line
          .replace(/^(title|recipe(\s*name)?|dish(\s*name)?|name)\s*:\s*/i, "")
          .trim();
        titleTaken = true;
        continue;
      }
      if (section === "meta") {
        buckets.meta!.push(line);
        continue;
      }
      if (section === "ingredients") {
        // Sub-group like "For tempering:" — short, ends with a colon (or starts
        // with "for "). Plain lines like "Salt to taste" are ingredients, not groups.
        const parsed = parseLeadingQty(line);
        const looksGroup =
          !parsed && line.length <= 45 && (/:\s*$/.test(line) || /^for\s+/i.test(line));
        if (looksGroup) {
          group = line.replace(/:\s*$/, "").trim();
          continue;
        }
        buckets.ingredients!.push(group ? `${group} || ${line}` : line);
        continue;
      }
      // Time/serving hints typed after the method ("Prep 15 mins. Serves 4")
      // belong to meta even without a heading.
      if (
        (section === "method" || section === "story") &&
        line.length <= 90 &&
        (isMetaLine(line) || /^(prep|cook|total|time|serve|serving)/i.test(line))
      ) {
        buckets.meta!.push(line);
        continue;
      }
      if (section === "story" && isNoteLine(line)) {
        buckets.notes!.push(line);
        continue;
      }
      buckets[section]!.push(line);
    }
  }

  draft.title = titleLine.slice(0, 120);
  draft.slug = slugifyTitle(draft.title);

  // 2. Story = leading paragraphs (first 2 non-empty story lines joined).
  const storyText = buckets.story!.join("\n");
  draft.story = storyText;

  // 3. Meta: prep/cook/servings from meta lines + anywhere else.
  let prep: number | undefined;
  let cook: number | undefined;
  let servings: number | undefined;
  for (const line of [...buckets.meta!, ...buckets.story!, ...buckets.method!]) {
    const t = minutesFromLine(line);
    if (prep === undefined && t.prep !== undefined) prep = t.prep;
    if (cook === undefined && t.cook !== undefined) cook = t.cook;
    if (t.total !== undefined && prep === undefined && cook === undefined) {
      prep = Math.round(t.total * 0.3);
      cook = t.total - prep;
    }
    if (servings === undefined) servings = servingsFromLine(line);
  }
  if (prep === undefined) {
    prep = 15;
    warnings.push("No prep time found — assumed 15 min (you can change it).");
  }
  if (cook === undefined) {
    cook = 30;
    warnings.push("No cook time found — assumed 30 min (you can change it).");
  }
  if (servings === undefined) {
    servings = 4;
    warnings.push("No servings found — assumed 4 (you can change it).");
  }
  draft.prep = prep;
  draft.cook = cook;
  draft.servings = servings;

  // 4. Ingredients.
  for (const rawLine of buckets.ingredients!) {
    const gSplit = rawLine.split(" || ");
    const g = gSplit.length > 1 ? gSplit[0]!.trim() : "";
    const line = gSplit.length > 1 ? gSplit.slice(1).join(" || ").trim() : rawLine;
    const parsed = parseLeadingQty(line);
    if (parsed) {
      draft.ingredients.push({
        qty: parsed.qty,
        unit: parsed.unit,
        name: `${parsed.rest}`,
        ...(g ? { group: g } : {}),
      });
    } else {
      draft.ingredients.push({
        qty: null,
        unit: "",
        name: line.slice(0, 160),
        ...(g ? { group: g } : {}),
      });
    }
  }
  // Drop the placeholder empty row once real lines exist.
  if (draft.ingredients.length > 1) {
    draft.ingredients = draft.ingredients.filter((i) => i.name.trim() || i.qty !== null);
  }
  if (draft.ingredients.length === 0) {
    draft.ingredients = [{ qty: null, unit: "", name: "" }];
    warnings.push("No ingredients found — write one item per line under an 'Ingredients' heading.");
  }

  // 5. Steps: numbered lines as-is, else split paragraphs into sentences.
  const stepTexts: string[] = [];
  for (const line of buckets.method!) {
    const numbered = line.match(/^\d+[.)]\s*(.*)$/);
    if (numbered && (numbered[1] ?? "").trim()) {
      stepTexts.push((numbered[1] ?? "").trim());
      continue;
    }
    const sentences = line
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    if (sentences.length > 1) stepTexts.push(...sentences);
    else stepTexts.push(line);
  }
  draft.steps =
    stepTexts.length > 0
      ? stepTexts
          .slice(0, 30)
          .map((text) => ({ text: text.slice(0, 1000), timer: timerFromStep(text) }))
      : [{ text: "", timer: null }];
  if (stepTexts.length === 0) {
    warnings.push("No steps found — write the method under a 'Method' heading.");
  }

  // 6. Notes.
  draft.notes = buckets
    .notes!.map((n) => n.slice(0, 500))
    .filter(Boolean)
    .slice(0, 10);

  // 7. Guesses: category, cuisine, diet, tags, blurb, difficulty.
  const hay = `${draft.title} ${storyText}`;
  draft.category =
    legacyCategory({ title: draft.title, tags: [], excerpt: storyText }) || "Main Course";
  draft.cuisine = guessCuisine(hay);
  const words = new Set(hay.toLowerCase().match(/[a-z]+/g) ?? []);
  const nonVeg = [...NON_VEG].some((w) => words.has(w));
  const hasDairy = [...DAIRY].some((w) => words.has(w));
  draft.diet = nonVeg ? ["Non-Vegetarian"] : hasDairy ? ["Vegetarian"] : ["Vegan", "Vegetarian"];
  draft.tags = [...new Set([draft.category, draft.cuisine, ...titleKeywords(draft.title)])].slice(
    0,
    6,
  );
  const firstPara = storyText.split("\n")[0] ?? "";
  draft.blurb = firstPara
    ? suggestExcerpt(firstPara)
    : draft.title
      ? `${draft.title} — easy to make at home.`
      : "";
  if (!firstPara) warnings.push("No story (intro) found — kept the short line simple.");
  const totalMin = draft.prep + draft.cook;
  draft.difficulty =
    totalMin <= 30 && draft.steps.length <= 6 ? "Easy" : totalMin <= 60 ? "Medium" : "Advanced";
  if (draft.cuisine === "North Indian" && !/north|punjab|delhi|mughlai/i.test(hay)) {
    warnings.push("Cuisine was guessed (North Indian) — please pick the right one.");
  }

  return { draft, warnings };
}

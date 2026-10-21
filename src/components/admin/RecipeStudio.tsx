/** Recipe Studio — Blogger-simple recipe creator for a non-technical cook.
 *
 * Flow: 1) Write (paste rough notes, add photo) -> 2) AI "Organize" button parses
 * everything into a structured draft -> 3) Organize (edit every field with big,
 * plain controls) -> 4) Preview (live preview mirroring the frontend recipe page)
 * -> Save draft / Publish. Published recipes render on /recipes like curated ones.
 */

import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Eye,
  ImagePlus,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { categories, cuisines, diets } from "@/lib/data";
import { adminSaveRecipeFn } from "@/lib/posts.api";
import {
  emptyRecipeDraft,
  slugifyTitle,
  type DraftIngredient,
  type RecipeDraft,
} from "@/lib/recipe";
import { parseRecipeDraft } from "@/lib/ai/parse-recipe";
import { suggestMeta } from "@/lib/ai/enhance";
import { formatQty } from "@/lib/scale";
import { cn } from "@/lib/utils";

export type StudioInitial = {
  id?: string;
  slug: string;
  coverUrl: string | null;
  status: "draft" | "published";
  draft: RecipeDraft;
};

const STEPS = [
  { id: "write", label: "1 · Write", hint: "Paste your rough notes" },
  { id: "organize", label: "2 · Organize", hint: "AI structures it, you review" },
  { id: "preview", label: "3 · Preview", hint: "See how the final page looks" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const UNITS = ["", "g", "kg", "ml", "l", "cup", "tbsp", "tsp", "bunch", "packet"];

const UNICODE_QTY: Record<string, number> = {
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

/** "1", "1.5", "1/2", "½" -> number. Anything else -> null. */
function parseQtyInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (UNICODE_QTY[t] !== undefined) return UNICODE_QTY[t];
  const frac = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const d = Number(frac[2]);
    if (!d) return null;
    return Number(frac[1]) / d;
  }
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-hidden placeholder:text-muted-foreground/60 focus:border-primary";

const labelCls = "mb-2 block text-sm font-semibold";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

export function RecipeStudio({ initial }: { initial?: StudioInitial }) {
  const [step, setStep] = useState<StepId>(initial ? "organize" : "write");
  const [rough, setRough] = useState("");
  const [draft, setDraft] = useState<RecipeDraft>(() => initial?.draft ?? emptyRecipeDraft());
  const [warnings, setWarnings] = useState<string[]>([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.coverUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(initial?.id ?? null);
  const [savedSlug, setSavedSlug] = useState(initial?.slug ?? "");
  const coverInput = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<RecipeDraft>) => setDraft((d) => ({ ...d, ...p }));

  const runAi = () => {
    const { draft: parsed, warnings: warns } = parseRecipeDraft(rough);
    // Keep an already-typed title if the rough box holds only body text.
    setDraft((d) => ({ ...parsed, title: parsed.title || d.title }));
    setSlugTouched(false);
    setWarnings(warns);
    setStep("organize");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const autoBlurb = () => {
    const { description } = suggestMeta(draft.title || "Untitled recipe", draft.story, {
      cuisine: draft.cuisine,
      category: draft.category,
    });
    patch({ blurb: description });
  };

  const pickCover = (file: File | null) => {
    if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : (initial?.coverUrl ?? null));
  };

  const save = async (status: "draft" | "published") => {
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      if (savedId) form.set("id", savedId);
      form.set("title", draft.title);
      form.set("slug", draft.slug || slugifyTitle(draft.title));
      form.set("blurb", draft.blurb);
      form.set("story", draft.story);
      form.set("category", draft.category);
      form.set("cuisine", draft.cuisine);
      form.set("tags", JSON.stringify(draft.tags));
      form.set("diet", JSON.stringify(draft.diet));
      form.set("prep", String(draft.prep));
      form.set("cook", String(draft.cook));
      form.set("servings", String(draft.servings));
      form.set("difficulty", draft.difficulty);
      form.set("ingredients", JSON.stringify(draft.ingredients));
      form.set("steps", JSON.stringify(draft.steps));
      form.set("notes", JSON.stringify(draft.notes));
      form.set("faqs", JSON.stringify(draft.faqs));
      form.set("status", status);
      if (coverFile) form.set("cover", coverFile);
      const { id, slug } = await adminSaveRecipeFn({ data: form });
      setSavedId(id);
      setSavedSlug(slug);
      patch({ slug });
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setError(
        code === "TITLE_REQUIRED"
          ? "Please add the recipe name first (in the Organize step)."
          : code === "INGREDIENTS_REQUIRED"
            ? "At least 1 ingredient is needed."
            : code === "STEPS_REQUIRED"
              ? "At least 1 step is needed."
              : code === "SLUG_TAKEN"
                ? "A page with this name already exists — please change the name slightly."
                : code === "COVER_NOT_IMAGE" || code === "COVER_TOO_LARGE"
                  ? "Photo must be JPG/PNG/WebP and smaller than 4 MB."
                  : "Could not save — check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Stepper */}
      <ol className="flex flex-wrap gap-2" aria-label="Recipe steps">
        {STEPS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => setStep(s.id)}
              aria-current={step === s.id ? "step" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-all",
                step === s.id
                  ? "border-primary bg-tea font-semibold text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              title={s.hint}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm font-medium"
        >
          {error}
        </p>
      )}
      {savedSlug && (
        <p className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-tea bg-tea/40 px-5 py-4 text-sm font-medium">
          <Check className="size-4" strokeWidth={2} />
          Saved.
          <Link
            to="/recipes/$slug"
            params={{ slug: savedSlug }}
            className="font-semibold text-primary underline underline-offset-2"
          >
            View on site →
          </Link>
        </p>
      )}

      {step === "write" && (
        <WriteStep
          rough={rough}
          setRough={setRough}
          coverPreview={coverPreview}
          coverInput={coverInput}
          pickCover={pickCover}
          runAi={runAi}
          goOrganize={() => setStep("organize")}
        />
      )}

      {step === "organize" && (
        <OrganizeStep
          draft={draft}
          patch={patch}
          setDraft={setDraft}
          slugTouched={slugTouched}
          setSlugTouched={setSlugTouched}
          warnings={warnings}
          autoBlurb={autoBlurb}
          goPreview={() => {
            setStep("preview");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {step === "preview" && (
        <div className="mt-8">
          <Preview draft={draft} coverPreview={coverPreview} warnings={warnings} />
          <div className="mt-6 flex">
            <button
              type="button"
              onClick={() => setStep("organize")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary"
            >
              <ArrowLeft className="size-4" strokeWidth={1.8} />
              Back to editing
            </button>
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
        <button
          type="button"
          disabled={busy}
          onClick={() => save("draft")}
          className="rounded-full border border-border px-6 py-3.5 text-base font-semibold transition-colors hover:border-primary disabled:opacity-50"
        >
          {busy ? "Please wait…" : "Save draft"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => save("published")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-deep active:scale-95 disabled:opacity-50"
        >
          <Eye className="size-4" strokeWidth={1.8} />
          {busy ? "Please wait…" : "Publish — goes live on site"}
        </button>
      </div>
    </div>
  );
}

/* ============================== 1 · LIKHO ============================== */

function WriteStep({
  rough,
  setRough,
  coverPreview,
  coverInput,
  pickCover,
  runAi,
  goOrganize,
}: {
  rough: string;
  setRough: (v: string) => void;
  coverPreview: string | null;
  coverInput: React.RefObject<HTMLInputElement | null>;
  pickCover: (f: File | null) => void;
  runAi: () => void;
  goOrganize: () => void;
}) {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <Field
          label="Write your recipe however you like"
          hint="Just like Blogger — name, story, ingredients, method, timings, all together. Adding headings (Ingredients / Method) helps even more. The AI will sort everything into place."
        >
          <textarea
            value={rough}
            onChange={(e) => setRough(e.target.value)}
            rows={18}
            placeholder={
              "Palak Paneer\n\nA winter favourite! Homestyle palak paneer…\n\nIngredients:\n500g paneer\n2 bunches spinach\nSalt to taste\n\nMethod:\n1. Blanch the spinach…\n2. …\n\nPrep 15 min, cook 30 min. Serves 4."
            }
            className={`${inputCls} min-h-[380px] text-base leading-relaxed`}
          />
        </Field>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runAi}
            disabled={!rough.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-deep active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="size-4" strokeWidth={1.8} />
            Organize with AI ✨
          </button>
          <button
            type="button"
            onClick={goOrganize}
            className="rounded-full border border-border px-6 py-3.5 text-base font-semibold transition-colors hover:border-primary"
          >
            I'll fill the form myself
          </button>
        </div>
      </div>

      <div>
        <span className={labelCls}>Dish photo</span>
        <button
          type="button"
          onClick={() => coverInput.current?.click()}
          className="grid aspect-4/3 w-full place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40 transition-colors hover:border-primary"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Dish photo preview" className="size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
              <ImagePlus className="size-8" strokeWidth={1.5} />
              Choose a photo
              <span className="text-xs">JPG / PNG, up to 4 MB</span>
            </span>
          )}
        </button>
        <input
          ref={coverInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => pickCover(e.target.files?.[0] ?? null)}
        />
        {coverPreview && (
          <button
            type="button"
            onClick={() => pickCover(null)}
            className="mt-2 text-xs font-medium text-muted-foreground underline underline-offset-2"
          >
            Remove photo
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================== 2 · SAJAO ============================== */

function OrganizeStep({
  draft,
  patch,
  setDraft,
  slugTouched,
  setSlugTouched,
  warnings,
  autoBlurb,
  goPreview,
}: {
  draft: RecipeDraft;
  patch: (p: Partial<RecipeDraft>) => void;
  setDraft: React.Dispatch<React.SetStateAction<RecipeDraft>>;
  slugTouched: boolean;
  setSlugTouched: (v: boolean) => void;
  warnings: string[];
  autoBlurb: () => void;
  goPreview: () => void;
}) {
  const setTitle = (title: string) =>
    setDraft((d) => ({ ...d, title, slug: slugTouched ? d.slug : slugifyTitle(title) }));

  const move = <T,>(list: T[], i: number, dir: -1 | 1): T[] => {
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return list;
    const next = [...list];
    [next[i], next[j]] = [next[j]!, next[i]!];
    return next;
  };

  return (
    <div className="mt-8 space-y-10">
      {warnings.length > 0 && (
        <div className="rounded-2xl border border-vanilla bg-vanilla/50 px-5 py-4" role="note">
          <p className="text-sm font-semibold">
            The AI guessed the following — please take a look:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Naam + link + blurb */}
      <section className="grid gap-5 rounded-[2rem] border border-border bg-secondary/30 p-5 sm:p-7">
        <h2 className="font-serif text-2xl">Name and identity</h2>
        <Field label="Recipe name">
          <input
            value={draft.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Palak Paneer"
            className={`${inputCls} font-serif text-xl`}
          />
        </Field>
        <Field
          label="Link (slug)"
          hint="Site address: spicenflavors.com/recipes/this-part. Made automatically from the name."
        >
          <input
            value={draft.slug}
            onChange={(e) => {
              setSlugTouched(true);
              patch({ slug: slugifyTitle(e.target.value) });
            }}
            placeholder="palak-paneer"
            className={inputCls}
          />
        </Field>
        <Field
          label="Short line (shown on cards + Google)"
          hint="No more than 2 lines — you can also have the AI write it."
        >
          <div className="flex flex-col gap-2">
            <textarea
              value={draft.blurb}
              onChange={(e) => patch({ blurb: e.target.value })}
              rows={2}
              maxLength={300}
              placeholder="Creamy winter palak paneer…"
              className={inputCls}
            />
            <button
              type="button"
              onClick={autoBlurb}
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-primary"
            >
              <Sparkles className="size-3.5" strokeWidth={1.8} />
              Write with AI
            </button>
          </div>
        </Field>
        <Field
          label="Story (2-4 lines, in your own words)"
          hint="Leave a blank line between separate thoughts."
        >
          <textarea
            value={draft.story}
            onChange={(e) => patch({ story: e.target.value })}
            rows={4}
            placeholder="A winter favourite! …"
            className={inputCls}
          />
        </Field>
      </section>

      {/* Type + time */}
      <section className="grid gap-5 rounded-[2rem] border border-border bg-secondary/30 p-5 sm:p-7">
        <h2 className="font-serif text-2xl">Type and time</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <select
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value })}
              className={`${inputCls} appearance-none`}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cuisine">
            <select
              value={draft.cuisine}
              onChange={(e) => patch({ cuisine: e.target.value })}
              className={`${inputCls} appearance-none`}
            >
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <span className={labelCls}>Who is it for (diet)</span>
          <div className="flex flex-wrap gap-2">
            {diets.map((d) => {
              const on = draft.diet.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    patch({ diet: on ? draft.diet.filter((x) => x !== d) : [...draft.diet, d] })
                  }
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                    on
                      ? "border-primary bg-tea font-semibold text-accent-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <NumberField label="Prep (min)" value={draft.prep} onChange={(v) => patch({ prep: v })} />
          <NumberField label="Cook (min)" value={draft.cook} onChange={(v) => patch({ cook: v })} />
          <NumberField
            label="Servings"
            value={draft.servings}
            min={1}
            max={50}
            onChange={(v) => patch({ servings: v })}
          />
        </div>
        <div>
          <span className={labelCls}>Difficulty</span>
          <div className="flex flex-wrap gap-2">
            {(["Easy", "Medium", "Advanced"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={draft.difficulty === d}
                onClick={() => patch({ difficulty: d })}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                  draft.difficulty === d
                    ? "border-primary bg-tea font-semibold text-accent-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {d === "Easy" ? "Easy" : d === "Medium" ? "Medium" : "Advanced"}
              </button>
            ))}
          </div>
        </div>
        <Field label="Tags (separated by commas)" hint="Helps with search: spinach, paneer, winter">
          <input
            value={draft.tags.join(", ")}
            onChange={(e) =>
              patch({
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .slice(0, 10),
              })
            }
            placeholder="palak, paneer, winter"
            className={inputCls}
          />
        </Field>
      </section>

      {/* Ingredients */}
      <section className="rounded-[2rem] border border-border bg-secondary/30 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Ingredients ({draft.ingredients.length})</h2>
          <button
            type="button"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                ingredients: [...d.ingredients, { qty: null, unit: "", name: "" }],
              }))
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-tea px-4 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            <Plus className="size-4" strokeWidth={2} /> Add another item
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Leave the quantity empty for "to taste" items. For a separate group like tempering, write
          it in Group.
        </p>
        <ul className="mt-5 space-y-3">
          {draft.ingredients.map((ing, i) => (
            <li
              key={i}
              className="grid grid-cols-[64px_84px_1fr_auto] items-center gap-2 rounded-2xl border border-border bg-background p-2.5"
            >
              <input
                value={ing.qty ?? ""}
                inputMode="decimal"
                aria-label={`Quantity ${i + 1}`}
                placeholder="500"
                onChange={(e) => {
                  const qty = parseQtyInput(e.target.value);
                  setDraft((d) => ({
                    ...d,
                    ingredients: d.ingredients.map((x, xi) =>
                      xi === i
                        ? { ...x, qty: e.target.value.trim() === "" ? null : (qty ?? x.qty) }
                        : x,
                    ),
                  }));
                }}
                className="w-full rounded-lg border border-border bg-secondary/40 px-2 py-2.5 text-center text-sm outline-hidden focus:border-primary"
              />
              <input
                value={ing.unit}
                aria-label={`Unit ${i + 1}`}
                placeholder="g"
                list="studio-units"
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    ingredients: d.ingredients.map((x, xi) =>
                      xi === i ? { ...x, unit: e.target.value.slice(0, 20) } : x,
                    ),
                  }))
                }
                className="w-full rounded-lg border border-border bg-secondary/40 px-2 py-2.5 text-center text-sm outline-hidden focus:border-primary"
              />
              <div className="flex min-w-0 flex-col gap-1.5">
                <input
                  value={ing.name}
                  aria-label={`Item ${i + 1}`}
                  placeholder="paneer cubes"
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      ingredients: d.ingredients.map((x, xi) =>
                        xi === i ? { ...x, name: e.target.value.slice(0, 160) } : x,
                      ),
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                />
                <input
                  value={ing.group ?? ""}
                  aria-label={`Group ${i + 1}`}
                  placeholder="Group (e.g. For tempering) — optional"
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      ingredients: d.ingredients.map((x, xi) =>
                        xi === i
                          ? {
                              ...x,
                              group: e.target.value ? e.target.value.slice(0, 60) : undefined,
                            }
                          : x,
                      ),
                    }))
                  }
                  className="w-full rounded-lg border border-transparent bg-transparent px-3 py-1 text-xs text-muted-foreground outline-hidden placeholder:text-muted-foreground/60 focus:border-primary"
                />
              </div>
              <button
                type="button"
                aria-label={`Remove ${i + 1}`}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    ingredients: d.ingredients.filter((_, xi) => xi !== i),
                  }))
                }
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="size-4" strokeWidth={1.7} />
              </button>
            </li>
          ))}
        </ul>
        <datalist id="studio-units">
          {UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </section>

      {/* Steps */}
      <section className="rounded-[2rem] border border-border bg-secondary/30 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Method ({draft.steps.length} steps)</h2>
          <button
            type="button"
            onClick={() =>
              setDraft((d) => ({ ...d, steps: [...d.steps, { text: "", timer: null }] }))
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-tea px-4 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            <Plus className="size-4" strokeWidth={2} /> Add another step
          </button>
        </div>
        <ol className="mt-5 space-y-4">
          {draft.steps.map((s, i) => (
            <li key={i} className="rounded-2xl border border-border bg-background p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tea font-serif text-sm font-semibold text-accent-foreground">
                  {i + 1}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => setDraft((d) => ({ ...d, steps: move(d.steps, i, -1) }))}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={i === draft.steps.length - 1}
                    onClick={() => setDraft((d) => ({ ...d, steps: move(d.steps, i, 1) }))}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() =>
                      setDraft((d) => ({ ...d, steps: d.steps.filter((_, si) => si !== i) }))
                    }
                    className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="size-4" strokeWidth={1.7} />
                  </button>
                </div>
              </div>
              <textarea
                value={s.text}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    steps: d.steps.map((x, si) =>
                      si === i ? { ...x, text: e.target.value.slice(0, 1000) } : x,
                    ),
                  }))
                }
                rows={2}
                placeholder="Describe what to do, clearly…"
                className="mt-2 w-full rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm leading-relaxed outline-hidden focus:border-primary"
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                Timer (min, empty = none)
                <input
                  value={s.timer ?? ""}
                  inputMode="numeric"
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setDraft((d) => ({
                      ...d,
                      steps: d.steps.map((x, si) =>
                        si === i
                          ? {
                              ...x,
                              timer:
                                e.target.value.trim() === ""
                                  ? null
                                  : Math.min(
                                      1440,
                                      Math.max(1, Math.round(Number.isFinite(n) ? n : 0) || 0),
                                    ) || null,
                            }
                          : x,
                      ),
                    }));
                  }}
                  placeholder="10"
                  className="w-20 rounded-lg border border-border bg-secondary/40 px-2 py-1.5 text-center text-sm outline-hidden focus:border-primary"
                />
              </label>
            </li>
          ))}
        </ol>
      </section>

      {/* Notes + FAQ */}
      <section className="grid gap-5 rounded-[2rem] border border-border bg-secondary/30 p-5 sm:p-7">
        <h2 className="font-serif text-2xl">Notes and Q&A (optional)</h2>
        <Field label="Notes" hint="One note per line — e.g.: Serve hot.">
          <textarea
            value={draft.notes.join("\n")}
            onChange={(e) =>
              patch({
                notes: e.target.value
                  .split("\n")
                  .map((n) => n.trim())
                  .filter(Boolean)
                  .slice(0, 10),
              })
            }
            rows={3}
            placeholder={"Serve hot.\nLeftover gravy keeps 2 days in the fridge."}
            className={inputCls}
          />
        </Field>
        <div>
          <div className="flex items-center justify-between">
            <span className={labelCls}>Frequently asked questions</span>
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, faqs: [...d.faqs, { q: "", a: "" }] }))}
              className="inline-flex items-center gap-1 rounded-full bg-tea px-3 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              <Plus className="size-3.5" strokeWidth={2} /> Add a question
            </button>
          </div>
          <ul className="mt-3 space-y-3">
            {draft.faqs.map((f, i) => (
              <li key={i} className="rounded-2xl border border-border bg-background p-3">
                <input
                  value={f.q}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      faqs: d.faqs.map((x, fi) =>
                        fi === i ? { ...x, q: e.target.value.slice(0, 200) } : x,
                      ),
                    }))
                  }
                  placeholder="Question, e.g.: Can it be made without cream?"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm font-medium outline-hidden focus:border-primary"
                />
                <textarea
                  value={f.a}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      faqs: d.faqs.map((x, fi) =>
                        fi === i ? { ...x, a: e.target.value.slice(0, 1000) } : x,
                      ),
                    }))
                  }
                  rows={2}
                  placeholder="Answer…"
                  className="mt-2 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({ ...d, faqs: d.faqs.filter((_, fi) => fi !== i) }))
                  }
                  className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.7} /> Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex">
        <button
          type="button"
          onClick={goPreview}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-deep active:scale-95"
        >
          Preview — see the final look
          <ArrowRight className="size-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min = 0,
  max = 1440,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) =>
    Math.max(min, Math.min(max, Math.round(Number.isFinite(v) ? v : min)));
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label} decrease`}
          onClick={() => onChange(clamp(value - (max <= 60 ? 1 : 5)))}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-lg font-semibold transition-colors hover:border-primary"
        >
          −
        </button>
        <input
          value={value}
          inputMode="numeric"
          aria-label={label}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="w-full rounded-xl border border-border bg-background px-2 py-3 text-center text-lg font-semibold outline-hidden focus:border-primary"
        />
        <button
          type="button"
          aria-label={`${label} increase`}
          onClick={() => onChange(clamp(value + (max <= 60 ? 1 : 5)))}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-lg font-semibold transition-colors hover:border-primary"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ============================== 3 · DEKHO ============================== */

function Preview({
  draft,
  coverPreview,
  warnings,
}: {
  draft: RecipeDraft;
  coverPreview: string | null;
  warnings: string[];
}) {
  const title = draft.title || "Name coming soon";
  const groups = useMemo(() => {
    const out: { group: string; items: DraftIngredient[] }[] = [];
    for (const ing of draft.ingredients) {
      const g = ing.group?.trim() || "";
      const last = out[out.length - 1];
      if (last && last.group === g) last.items.push(ing);
      else out.push({ group: g, items: [ing] });
    }
    return out;
  }, [draft.ingredients]);

  return (
    <div className="overflow-hidden rounded-[2rem] border-2 border-dashed border-primary/50">
      <p className="bg-tea/60 px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
        Preview — this is how it will look on the site
      </p>
      {warnings.length > 0 && (
        <ul className="space-y-1 border-b border-border bg-vanilla/50 px-5 py-3 text-xs text-muted-foreground">
          {warnings.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      )}
      {/* Hero (frontend jaisa dark band) */}
      <div className="bg-[#1c1815] px-5 py-8 text-[#f3ede2] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Recipes / {draft.cuisine}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{title}</h2>
        {draft.blurb && <p className="mt-3 max-w-2xl text-white/70">{draft.blurb}</p>}
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          {[
            ["Time", `${draft.prep + draft.cook} min`],
            ["Serves", String(draft.servings)],
            ["Level", draft.difficulty],
            ["Type", draft.category],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                {k}
              </dt>
              <dd className="mt-1 font-serif text-xl">{v}</dd>
            </div>
          ))}
        </dl>
        {coverPreview && (
          <div className="mt-6 overflow-hidden rounded-[2rem]">
            <img src={coverPreview} alt={title} className="aspect-16/9 w-full object-cover" />
          </div>
        )}
      </div>
      {/* Body */}
      <div className="space-y-10 bg-background px-5 py-8 sm:px-8">
        {draft.story && (
          <section>
            <h3 className="font-serif text-2xl">About this recipe</h3>
            {draft.story.split(/\n\n+/).map((p, i) => (
              <p key={i} className="mt-3 leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        )}
        <section>
          <h3 className="font-serif text-2xl">Ingredients · Serves {draft.servings}</h3>
          {groups.map((g, gi) => (
            <div key={gi} className="mt-4">
              {g.group && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {g.group}
                </p>
              )}
              <ul className="divide-y divide-border rounded-2xl border border-border bg-secondary/40">
                {g.items.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <span className="grid size-4 shrink-0 place-items-center rounded border border-border" />
                    <span>
                      {ing.qty !== null && (
                        <span className="font-semibold">
                          {formatQty(ing.qty)}
                          {ing.unit ? ` ${ing.unit}` : ""}{" "}
                        </span>
                      )}
                      {ing.name || <span className="text-muted-foreground/60">(empty)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
        <section>
          <h3 className="font-serif text-2xl">Instructions</h3>
          <ol className="mt-4 space-y-6">
            {draft.steps.map((s, i) => (
              <li key={i} className="grid grid-cols-[3rem_1fr] gap-3">
                <span className="font-serif text-3xl text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="leading-relaxed">
                    {s.text || <span className="text-muted-foreground/60">(empty step)</span>}
                  </p>
                  {s.timer !== null && (
                    <p className="mt-1 text-xs font-semibold text-primary">⏱ {s.timer} min timer</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
        {draft.notes.length > 0 && (
          <section>
            <h3 className="font-serif text-2xl">Notes</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {draft.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </section>
        )}
        {draft.faqs.length > 0 && (
          <section>
            <h3 className="font-serif text-2xl">Frequently asked</h3>
            <div className="mt-3 grid gap-3">
              {draft.faqs.map((f, i) => (
                <div key={i} className="rounded-2xl border border-border p-4">
                  <p className="font-serif text-lg">{f.q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

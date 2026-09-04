import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, Plus, Sparkles, Trash2 } from "lucide-react";
import { cuisines, diets } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Share a recipe — publish on Spice N Flavors" },
      {
        name: "description",
        content:
          "Publish your recipe: cover image, ingredients, instructions and timings, with an AI assistant to tidy your notes.",
      },
      { property: "og:title", content: "Share a recipe — Spice N Flavors" },
      {
        property: "og:description",
        content: "Publish your recipe with help turning rough notes into a structured recipe.",
      },
    ],
  }),
  component: SharePage,
});

const shell = "mx-auto w-full max-w-[1100px] px-5 sm:px-8";
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drink"];

function SharePage() {
  const [ingredients, setIngredients] = useState(["", "", ""]);
  const [steps, setSteps] = useState(["", ""]);
  const [tags, setTags] = useState<string[]>([]);
  const [meal, setMeal] = useState("Dinner");
  const [notes, setNotes] = useState("");
  const [assisted, setAssisted] = useState(false);

  const helpMeWrite = () => {
    setAssisted(true);
    setIngredients(["400 g pasta", "2 heads garlic", "90 g butter", "60 g parmesan"]);
    setSteps([
      "Roast the garlic until soft and golden.",
      "Cook the pasta one minute short of the package time.",
      "Melt the garlic into butter with pasta water, then toss everything together.",
    ]);
  };

  return (
    <div className={`${shell} pb-8 pt-8`}>
      <header className="max-w-2xl">
        <p className="eyebrow">Publish</p>
        <h1 className="display-lg mt-3">Share a recipe.</h1>
        <p className="mt-5 text-muted-foreground">
          Write it the way you&apos;d tell a friend. We&apos;ll handle the formatting.
        </p>
      </header>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start"
      >
        <div className="space-y-8">
          <Field label="Recipe name">
            <input className={inputCls} placeholder="Roasted Garlic Butter Pasta" />
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              className={cn(inputCls, "resize-none")}
              placeholder="Silky, comforting pasta with roasted garlic, parmesan and herbs."
            />
          </Field>

          <Field label="Cover image">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-secondary/40 px-6 py-12 text-center transition-colors hover:border-primary">
              <ImagePlus className="size-6 text-primary" strokeWidth={1.5} />
              <span className="text-sm font-medium">Drop a photo, or browse</span>
              <span className="text-xs text-muted-foreground">
                Natural light and a plain surface photograph best.
              </span>
              <input type="file" accept="image/*" className="sr-only" />
            </label>
          </Field>

          <Field label="Ingredients">
            <ul className="space-y-2">
              {ingredients.map((val, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    value={val}
                    onChange={(e) =>
                      setIngredients((list) => list.map((v, j) => (j === i ? e.target.value : v)))
                    }
                    aria-label={`Ingredient ${i + 1}`}
                    placeholder="200 g udon noodles"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ingredient ${i + 1}`}
                    onClick={() => setIngredients((l) => l.filter((_, j) => j !== i))}
                    className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                  >
                    <Trash2 className="size-4" strokeWidth={1.6} />
                  </button>
                </li>
              ))}
            </ul>
            <AddRow label="Add ingredient" onClick={() => setIngredients((l) => [...l, ""])} />
          </Field>

          <Field label="Instructions">
            <ol className="space-y-3">
              {steps.map((val, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-2"
                >
                  <span className="pt-3 font-serif text-xl text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <textarea
                    rows={2}
                    value={val}
                    onChange={(e) =>
                      setSteps((list) => list.map((v, j) => (j === i ? e.target.value : v)))
                    }
                    aria-label={`Step ${i + 1}`}
                    placeholder="Roast the garlic until deeply golden."
                    className={cn(inputCls, "resize-none")}
                  />
                  <button
                    type="button"
                    aria-label={`Remove step ${i + 1}`}
                    onClick={() => setSteps((l) => l.filter((_, j) => j !== i))}
                    className="mt-1.5 grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                  >
                    <Trash2 className="size-4" strokeWidth={1.6} />
                  </button>
                </li>
              ))}
            </ol>
            <AddRow label="Add step" onClick={() => setSteps((l) => [...l, ""])} />
          </Field>
        </div>

        {/* sidebar */}
        <aside className="space-y-8 rounded-2xl border border-border bg-secondary/40 p-6 lg:sticky lg:top-24">
          <div className="rounded-xl border border-border bg-vanilla/70 p-4">
            <p className="text-sm font-semibold">✨ Help me write this recipe</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste rough notes and we&apos;ll structure them into ingredients and steps.
            </p>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="roast garlic, boil pasta, butter sauce, parmesan…"
              className="mt-3 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-hidden focus:border-primary"
            />
            <button
              type="button"
              onClick={helpMeWrite}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
            >
              <Sparkles className="size-3.5" strokeWidth={1.8} />
              Structure my notes
            </button>
            {assisted && (
              <p className="mt-3 text-xs text-muted-foreground">
                Draft filled in — edit anything that isn&apos;t right.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prep (min)" small>
              <input type="number" min={0} className={inputCls} placeholder="10" />
            </Field>
            <Field label="Cook (min)" small>
              <input type="number" min={0} className={inputCls} placeholder="35" />
            </Field>
            <Field label="Servings" small>
              <input type="number" min={1} className={inputCls} placeholder="4" />
            </Field>
            <Field label="Cuisine" small>
              <select className={inputCls} defaultValue={cuisines[0]}>
                {cuisines.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Meal type" small>
            <div className="flex flex-wrap gap-2">
              {mealTypes.map((m) => (
                <Pill key={m} active={meal === m} onClick={() => setMeal(m)}>
                  {m}
                </Pill>
              ))}
            </div>
          </Field>

          <Field label="Dietary tags" small>
            <div className="flex flex-wrap gap-2">
              {diets.map((d) => (
                <Pill
                  key={d}
                  active={tags.includes(d)}
                  onClick={() =>
                    setTags((t) => (t.includes(d) ? t.filter((x) => x !== d) : [...t, d]))
                  }
                >
                  {d}
                </Pill>
              ))}
            </div>
          </Field>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
          >
            Publish recipe
          </button>
        </aside>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

function Field({
  label,
  children,
  small,
}: {
  label: string;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className={small ? "eyebrow block" : "eyebrow block"}>{label}</span>
      {children}
    </label>
  );
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
    >
      <Plus className="size-3.5" strokeWidth={1.8} />
      {label}
    </button>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-all duration-200",
        active
          ? "border-primary bg-tea font-semibold text-accent-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

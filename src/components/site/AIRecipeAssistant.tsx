import { useState } from "react";
import { ChefHat, Sparkles } from "lucide-react";

const prompts = [
  "What can I make in 20 minutes?",
  "Make this without onion or garlic",
  "I need a high-protein vegetarian dinner",
  "What can replace ghee?",
];

export function AIRecipeAssistant() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="grid gap-10 rounded-3xl border border-border bg-tea/45 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="max-w-md space-y-4">
        <p className="eyebrow">Sous chef</p>
        <h2 className="display-lg">Your sous chef, whenever you need it.</h2>
        <p className="text-muted-foreground">
          Tell us what you have. We&apos;ll help you figure out what to cook.
        </p>
        <div className="hidden items-center gap-3 pt-2 text-sm text-muted-foreground lg:flex">
          <ChefHat className="size-5 text-primary" strokeWidth={1.5} />
          Trained on 40,000 community recipes.
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = value.trim() || "eggs, spinach, tomatoes and leftover rice";
            setResult(
              `A quick savoury rice bowl: crisp the rice in butter, wilt the spinach with garlic, blister the tomatoes, then fold soft eggs through at the end. Ready in about 18 minutes with ${input}.`,
            );
          }}
          className="space-y-4"
        >
          <label htmlFor="kitchen" className="eyebrow block">
            What do you have in your kitchen?
          </label>
          <textarea
            id="kitchen"
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paneer, tomatoes, cumin and leftover rice"
            className="w-full resize-none rounded-xl border border-border bg-secondary/50 p-4 text-base outline-hidden placeholder:text-muted-foreground/70 focus:border-primary"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-deep active:scale-95"
          >
            <Sparkles className="size-4" strokeWidth={1.8} />
            Create a recipe
          </button>
        </form>

        {result && (
          <p className="mt-5 rounded-xl border border-border bg-vanilla/70 p-4 text-sm leading-relaxed">
            {result}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          {prompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue(p)}
              className="rounded-full border border-border bg-vanilla/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

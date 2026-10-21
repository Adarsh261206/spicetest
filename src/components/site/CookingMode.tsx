import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostBlock } from "@/lib/blocks";

/* ------------------------------------------------------------------ */
/* Cooking Mode — full-screen PPT-style step slider (dark, focused).   */
/* Curated recipes: structured steps + ingredient checklist sidebar.    */
/* Articles / archive: normalized HTML split into slides.              */
/* ------------------------------------------------------------------ */

export type CookIngredient = { name: string; qty?: string };
export type CookStep = { text: string; timer?: number };
export type ArticleSlide = { kicker?: string; html: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Fresh admin blocks -> readable slides (text escaped, never raw). */
export function slidesFromBlocks(blocks: PostBlock[]): ArticleSlide[] {
  const slides: ArticleSlide[] = [];
  for (const b of blocks) {
    if (b.type === "paragraph" && b.text.trim()) {
      slides.push({ html: `<p>${esc(b.text.trim())}</p>` });
    } else if (b.type === "heading" && b.text.trim()) {
      slides.push({ kicker: "Section", html: `<h3>${esc(b.text.trim())}</h3>` });
    } else if (b.type === "quote" && b.text.trim()) {
      slides.push({ html: `<blockquote>${esc(b.text.trim())}</blockquote>` });
    } else if (b.type === "list" && b.items.some((i) => i.trim())) {
      const items = b.items
        .filter((i) => i.trim())
        .map((i) => `<li>${esc(i.trim())}</li>`)
        .join("");
      slides.push({ html: `<${b.style}>${items}</${b.style}>` });
    }
  }
  return slides.slice(0, 30);
}

/** Normalized legacy HTML -> slides split at headings (already sanitized at import). */
export function slidesFromHtml(html: string): ArticleSlide[] {
  // Slides are text-first: photos stay on the page, never inside the overlay.
  const noMedia = html.replace(/<figure>[\s\S]*?<\/figure>/gi, "").replace(/<img\b[^>]*>/gi, "");
  const parts = noMedia.split(/(<h[34]>.*?<\/h[34]>)/gis).filter((p) => p.trim());
  const slides: ArticleSlide[] = [];
  let pendingKicker = "";
  let buf = "";
  const bufText = () =>
    buf
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const flush = () => {
    if (bufText()) {
      slides.push(
        pendingKicker ? { kicker: pendingKicker, html: buf.trim() } : { html: buf.trim() },
      );
    }
    buf = "";
    pendingKicker = "";
  };
  for (const part of parts) {
    const head = part.match(/^<h[34]>(.*?)<\/h[34]>$/is);
    if (head) {
      flush();
      pendingKicker = head[1]!
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 60);
    } else {
      buf += part;
    }
  }
  flush();
  if (slides.length === 0 && noMedia.replace(/<[^>]+>/g, "").trim()) {
    slides.push({ html: noMedia.trim() });
  }
  return slides.slice(0, 30);
}

function StepTimer({ minutes, dark }: { minutes: number; dark?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const id = window.setInterval(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [left, minutes]);
  useEffect(() => setLeft(null), [minutes]);
  const mm = left !== null ? Math.floor(left / 60) : 0;
  const ss = left !== null ? left % 60 : 0;
  return (
    <button
      type="button"
      onClick={() => setLeft(left === null ? minutes * 60 : null)}
      className={cn(
        "mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all active:scale-95",
        dark
          ? "border-white/25 text-white hover:border-white/60"
          : "border-border hover:border-primary",
      )}
    >
      <Play className="size-3.5" strokeWidth={1.8} />
      {left === null
        ? `Start ${minutes} min timer`
        : left <= 0
          ? "Time's up — reset"
          : `${mm}:${String(ss).padStart(2, "0")} remaining`}
    </button>
  );
}

export function CookingMode({
  title,
  steps,
  ingredients,
  slides,
  open,
  onClose,
}: {
  title: string;
  steps?: CookStep[];
  ingredients?: CookIngredient[] | undefined;
  slides?: ArticleSlide[];
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);

  const total = steps?.length ?? slides?.length ?? 0;

  const close = useCallback(() => {
    onClose();
    setIndex(0);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, total - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, total]);

  const progress = useMemo(() => (total > 0 ? ((index + 1) / total) * 100 : 0), [index, total]);

  if (!open || total === 0) return null;

  const step = steps?.[index];
  const slide = !steps ? slides?.[index] : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Cooking mode — ${title}`}
      className="fixed inset-0 z-[80] flex flex-col bg-[#161311] text-[#f3ede2]"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-10">
        <p className="truncate text-xs font-semibold uppercase tracking-[0.25em] text-[#e0a458]">
          Cooking mode · {title}
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Exit cooking mode"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 transition-colors hover:border-white/70"
        >
          <X className="size-5" strokeWidth={1.6} />
        </button>
      </div>
      {/* Progress */}
      <div className="mt-4 h-px w-full bg-white/15" aria-hidden>
        <div
          className="h-px bg-[#c96f4a] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Body */}
      <div className="grid flex-1 gap-10 overflow-y-auto px-5 py-10 sm:px-10 lg:grid-cols-[1fr_320px] lg:overflow-hidden">
        <div className="flex min-h-[40vh] flex-col justify-center lg:overflow-y-auto">
          {step ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Step {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>
              <p className="mt-6 max-w-3xl font-serif text-3xl leading-snug sm:text-4xl lg:text-5xl">
                {step.text}
              </p>
              {step.timer && <StepTimer minutes={step.timer} dark />}
            </>
          ) : (
            slide && (
              <>
                {slide.kicker && (
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    {slide.kicker} · {index + 1} / {total}
                  </p>
                )}
                <div
                  className="cook-slide mt-6 max-w-3xl font-serif text-2xl leading-snug sm:text-3xl lg:text-4xl"
                  dangerouslySetInnerHTML={{ __html: slide.html }}
                />
              </>
            )
          )}
        </div>

        {ingredients && ingredients.length > 0 && (
          <aside className="border-t border-white/15 pt-8 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:pl-8 lg:pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              Ingredients
            </p>
            <ul className="mt-5 space-y-3.5">
              {ingredients.map((ing, i) => {
                const done = checked.includes(i);
                return (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() =>
                          setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))
                        }
                        className="mt-1 size-4 shrink-0 accent-[#c96f4a]"
                      />
                      <span className={cn(done && "text-white/40 line-through")}>
                        {ing.name}
                        {ing.qty && <span className="text-white/60"> — {ing.qty}</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between gap-4 border-t border-white/15 px-5 py-5 sm:px-10">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          className="inline-flex items-center gap-2 rounded-none border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:border-white/60 disabled:opacity-30 sm:px-8"
        >
          <ArrowLeft className="size-4" strokeWidth={1.6} />
          Previous
        </button>
        <p className="hidden text-xs uppercase tracking-[0.2em] text-white/50 sm:block" aria-hidden>
          ← → keys work too
        </p>
        {index < total - 1 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
            className="inline-flex items-center gap-2 bg-[#c96f4a] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#b25f3d] active:scale-95 sm:px-8"
          >
            Next step
            <ArrowRight className="size-4" strokeWidth={1.8} />
          </button>
        ) : (
          <button
            type="button"
            onClick={close}
            className="inline-flex items-center gap-2 bg-[#c96f4a] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#b25f3d] active:scale-95 sm:px-8"
          >
            Done — enjoy!
          </button>
        )}
      </div>

      <style>{`
        .cook-slide h3 { font-size: 0.85em; letter-spacing: 0.15em; text-transform: uppercase; font-family: var(--font-sans); opacity: 0.7; }
        .cook-slide p { margin-top: 0.4em; }
        .cook-slide ul, .cook-slide ol { margin-top: 0.6em; font-size: 0.62em; line-height: 1.7; font-family: var(--font-sans); list-style: disc; padding-left: 1.2em; }
        .cook-slide ol { list-style: decimal; }
        .cook-slide blockquote { border-left: 3px solid #c96f4a; padding-left: 0.8em; font-style: italic; margin-top: 0.5em; }
        .cook-slide a { color: #e0a458; }
      `}</style>
    </div>
  );
}

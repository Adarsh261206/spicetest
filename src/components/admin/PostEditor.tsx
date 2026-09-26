import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Heading,
  ImagePlus,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Trash2,
} from "lucide-react";
import { PostBody } from "@/components/site/PostBody";
import { adminSavePostFn, adminUploadImageFn } from "@/lib/posts.api";
import type { DbPostPublic, PostBlock } from "@/lib/blocks";
import { cn } from "@/lib/utils";

export type EditorInitial = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  tags: string;
  excerpt: string;
  author: string;
  status: "draft" | "published";
  coverUrl: string | null;
  body: PostBlock[];
};

type Row = { key: number; block: PostBlock };

const EMPTY_BODY: PostBlock[] = [{ type: "paragraph", text: "" }];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const ERROR_TEXT: Record<string, string> = {
  TITLE_REQUIRED: "Give the post a title.",
  BODY_REQUIRED: "Add at least one block with content.",
  SLUG_TAKEN: "That URL slug is already used. Change it.",
  COVER_NOT_IMAGE: "The cover must be an image file.",
  COVER_TOO_LARGE: "Images must be under 4 MB.",
  UNAUTHORIZED: "Session expired — sign in again.",
};

let keyCounter = 1;

export function PostEditor({ initial }: { initial?: EditorInitial }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [category, setCategory] = useState(initial?.category ?? "From the kitchen");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "Spice N Flavors");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [rows, setRows] = useState<Row[]>(() =>
    (initial?.body?.length ? initial.body : EMPTY_BODY).map((block) => ({
      key: keyCounter++,
      block,
    })),
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.coverUrl ?? null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);

  const patchRow = (key: number, block: PostBlock) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, block } : r)));

  const moveRow = (key: number, dir: -1 | 1) =>
    setRows((rs) => {
      const i = rs.findIndex((r) => r.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  const addRow = (block: PostBlock) => setRows((rs) => [...rs, { key: keyCounter++, block }]);

  const previewBlocks: PostBlock[] = useMemo(
    () =>
      rows
        .map((r) => r.block)
        .filter((b) => {
          if (b.type === "list") return b.items.some((i) => i.trim());
          if (b.type === "image") return b.src.length > 0;
          return b.text.trim().length > 0;
        }),
    [rows],
  );

  const autoExcerpt = () => {
    const first = rows.map((r) => r.block).find((b) => b.type === "paragraph" && b.text.trim());
    if (first && first.type === "paragraph") setExcerpt(first.text.trim().slice(0, 170));
  };

  const save = async (nextStatus: "draft" | "published") => {
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      if (initial?.id) form.set("id", initial.id);
      form.set("title", title);
      form.set("slug", slug || slugify(title));
      form.set("category", category);
      form.set("tags", tags);
      form.set("excerpt", excerpt);
      form.set("author", author);
      form.set("status", nextStatus);
      form.set(
        "body",
        JSON.stringify(
          rows.map((r) => {
            const b = r.block;
            if (b.type === "list")
              return { ...b, items: b.items.map((i) => i.trim()).filter(Boolean) };
            if (b.type === "image") return b;
            return { ...b, text: b.text.trim() };
          }),
        ),
      );
      if (coverFile) form.set("cover", coverFile);
      await adminSavePostFn({ data: form });
      await navigate({ to: "/admin" });
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      setError(ERROR_TEXT[code] ?? "Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        <div className="space-y-5 rounded-[2rem] border border-border bg-secondary/30 p-6">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Monsoon Masala Chai"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden focus:border-primary"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="URL slug">
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                placeholder="monsoon-masala-chai"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden focus:border-primary"
              />
            </Field>
            <Field label="Category">
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden focus:border-primary"
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tags (comma separated)">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Chai, Monsoon, Drinks"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden focus:border-primary"
              />
            </Field>
            <Field label="Author">
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden focus:border-primary"
              />
            </Field>
          </div>
          <Field
            label="Excerpt"
            hint={
              <button type="button" onClick={autoExcerpt} className="underline underline-offset-2">
                Auto from first paragraph
              </button>
            }
          >
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={300}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-hidden focus:border-primary"
            />
          </Field>
          <Field label="Cover photo">
            <div className="flex flex-wrap items-center gap-4">
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="aspect-4/3 w-40 rounded-xl border border-border object-cover"
                />
              )}
              <div>
                <input
                  ref={coverInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setCoverFile(f);
                    setCoverPreview(URL.createObjectURL(f));
                  }}
                />
                <button
                  type="button"
                  onClick={() => coverInput.current?.click()}
                  className="rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary"
                >
                  {coverPreview ? "Change cover" : "Upload cover"}
                </button>
                <p className="mt-2 text-xs text-muted-foreground">JPG/PNG/WebP, under 4 MB.</p>
              </div>
            </div>
          </Field>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Content blocks</h2>
          <div
            className="flex rounded-full border border-border p-1 text-sm"
            role="tablist"
            aria-label="Editor view"
          >
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-4 py-1.5 capitalize transition-colors",
                  tab === t
                    ? "bg-tea font-semibold text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "preview" ? (
          <article className="legacy-post mt-6 max-w-3xl rounded-[2rem] border border-border bg-background p-6 sm:p-8">
            <h1 className="display-md">{title || "Untitled"}</h1>
            {coverPreview && (
              <img
                src={coverPreview}
                alt=""
                className="mt-6 aspect-16/9 w-full rounded-2xl border border-border object-cover"
              />
            )}
            <div className="mt-6">
              <PostBody blocks={previewBlocks} />
            </div>
          </article>
        ) : (
          <div className="mt-6 space-y-4">
            {rows.map((r, i) => (
              <BlockCard
                key={r.key}
                index={i}
                total={rows.length}
                block={r.block}
                onChange={(b) => patchRow(r.key, b)}
                onMove={(d) => moveRow(r.key, d)}
                onDelete={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
              />
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              <AddBtn
                icon={<Pilcrow className="size-4" />}
                label="Paragraph"
                onClick={() => addRow({ type: "paragraph", text: "" })}
              />
              <AddBtn
                icon={<Heading className="size-4" />}
                label="Heading"
                onClick={() => addRow({ type: "heading", text: "" })}
              />
              <AddBtn
                icon={<List className="size-4" />}
                label="Bullets"
                onClick={() => addRow({ type: "list", style: "ul", items: [""] })}
              />
              <AddBtn
                icon={<ListOrdered className="size-4" />}
                label="Steps"
                onClick={() => addRow({ type: "list", style: "ol", items: [""] })}
              />
              <AddBtn
                icon={<Quote className="size-4" />}
                label="Quote"
                onClick={() => addRow({ type: "quote", text: "" })}
              />
              <AddBtn
                icon={<ImagePlus className="size-4" />}
                label="Photo"
                onClick={() => addRow({ type: "image", src: "", caption: "" })}
              />
            </div>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-3 rounded-[2rem] border border-border bg-secondary/30 p-6">
          <p className="eyebrow">Publish</p>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                status === "published"
                  ? "bg-tea text-accent-foreground"
                  : "bg-vanilla text-accent-foreground",
              )}
            >
              {status === "published" ? "Published" : "Draft"}
            </span>
            <button
              type="button"
              onClick={() => setStatus(status === "published" ? "draft" : "published")}
              className="underline underline-offset-2"
            >
              Switch to {status === "published" ? "draft" : "published"}
            </button>
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <button
            type="button"
            disabled={busy}
            onClick={() => void save(status)}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {busy ? "Saving…" : initial?.id ? "Save changes" : "Create post"}
          </button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Published posts appear on the blog instantly — no redeploy needed.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="eyebrow">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function AddBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
    >
      {icon}
      {label}
    </button>
  );
}

function BlockCard({
  index,
  total,
  block,
  onChange,
  onMove,
  onDelete,
}: {
  index: number;
  total: number;
  block: PostBlock;
  onChange: (b: PostBlock) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const upload = async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.set("image", file);
      const { dataUrl } = await adminUploadImageFn({ data: form });
      if (block.type === "image") onChange({ ...block, src: dataUrl });
    } catch {
      setUploadError("Upload failed (under 4 MB, image only).");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-1">
        <span className="mr-auto rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
          {block.type === "list" ? (block.style === "ol" ? "Steps" : "Bullets") : block.type}
        </span>
        <MiniBtn label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp className="size-4" />
        </MiniBtn>
        <MiniBtn label="Move down" disabled={index === total - 1} onClick={() => onMove(1)}>
          <ArrowDown className="size-4" />
        </MiniBtn>
        <MiniBtn label="Delete block" onClick={onDelete}>
          <Trash2 className="size-4" />
        </MiniBtn>
      </div>

      {(block.type === "paragraph" || block.type === "heading" || block.type === "quote") && (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          rows={block.type === "paragraph" ? 4 : 2}
          placeholder={block.type === "heading" ? "Section heading…" : "Write here…"}
          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-hidden focus:border-primary"
        />
      )}

      {block.type === "list" && (
        <div className="space-y-3">
          <div className="flex gap-2 text-xs">
            {(["ul", "ol"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...block, style: s })}
                className={cn(
                  "rounded-full border px-3 py-1.5 transition-colors",
                  block.style === s
                    ? "border-primary bg-tea font-semibold text-accent-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {s === "ul" ? "Bullets" : "Numbered"}
              </button>
            ))}
          </div>
          <textarea
            value={block.items.join("\n")}
            onChange={(e) => onChange({ ...block, items: e.target.value.split("\n") })}
            rows={Math.max(3, block.items.length + 1)}
            placeholder={"One item per line…"}
            className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-hidden focus:border-primary"
          />
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-3">
          {block.src && (
            <img
              src={block.src}
              alt=""
              className="aspect-16/9 w-full rounded-xl border border-border object-cover"
            />
          )}
          <input
            value={block.src.startsWith("data:") ? "" : block.src}
            onChange={(e) => onChange({ ...block, src: e.target.value })}
            placeholder="…or paste an image URL"
            className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-hidden focus:border-primary"
          />
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary">
              {uploading ? "Uploading…" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                  e.target.value = "";
                }}
              />
            </label>
            <input
              value={block.caption ?? ""}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="Caption (optional)"
              className="min-w-0 flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-hidden focus:border-primary"
            />
          </div>
          {uploadError && <p className="text-xs font-medium text-destructive">{uploadError}</p>}
        </div>
      )}
    </section>
  );
}

function MiniBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export type { DbPostPublic };

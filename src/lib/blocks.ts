/** Content blocks for admin-created posts. Client-safe (no node imports). */

export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; style: "ul" | "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "image"; src: string; caption?: string };

export type DbPostPublic = {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  coverUrl: string | null;
  readingTime: number;
  author: string;
  date: string;
  body: PostBlock[];
  draft: false;
};

export function coverUrlFor(id: string, hasCover: boolean): string | null {
  return hasCover ? `/api/covers/${id}` : null;
}

export function readingTimeFor(blocks: PostBlock[]): number {
  const words = blocks
    .map((b) => {
      if (b.type === "list") return b.items.join(" ");
      if (b.type === "image") return b.caption ?? "";
      return b.text;
    })
    .join(" ")
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

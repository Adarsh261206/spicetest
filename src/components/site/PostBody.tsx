import type { PostBlock } from "@/lib/blocks";

/** Renders admin-created post blocks. Styled via the .legacy-post CSS. */
export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "heading") return <h3 key={i}>{b.text}</h3>;
        if (b.type === "quote") return <blockquote key={i}>{b.text}</blockquote>;
        if (b.type === "image") {
          return (
            <figure key={i}>
              <img src={b.src} alt={b.caption || ""} loading="lazy" decoding="async" />
              {b.caption && <figcaption>{b.caption}</figcaption>}
            </figure>
          );
        }
        if (b.type === "list") {
          const Tag = b.style === "ol" ? "ol" : "ul";
          return (
            <Tag key={i}>
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </Tag>
          );
        }
        return <p key={i}>{b.text}</p>;
      })}
    </>
  );
}

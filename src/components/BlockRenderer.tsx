import Link from "next/link";
import type { ContentBlock } from "@/lib/site-data";

/**
 * Renders the block list authored in the admin panel's page/blog editor
 * (see BlockEditor.tsx) on the public site. A plain switch over a small
 * fixed set of block types — deliberately not raw HTML, so nothing an
 * editor writes can ever break the page's layout or introduce a security
 * issue on the public site.
 */
export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="block-content">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "heading":
            return b.level === 3 ? <h3 key={i}>{b.text}</h3> : <h2 key={i}>{b.text}</h2>;
          case "paragraph":
            return (
              <p key={i} style={{ whiteSpace: "pre-line" }}>
                {b.text}
              </p>
            );
          case "image":
            return b.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={b.url} alt={b.alt || ""} className="block-image" />
            ) : null;
          case "button":
            return b.href ? (
              <Link key={i} href={b.href} className="btn btn-gold block-button">
                {b.text || "לפרטים נוספים"}
              </Link>
            ) : null;
          case "spacer":
            return <div key={i} style={{ height: b.height }} aria-hidden="true" />;
          default:
            return null;
        }
      })}
    </div>
  );
}

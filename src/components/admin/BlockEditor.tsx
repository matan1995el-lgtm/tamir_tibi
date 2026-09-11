"use client";

import type { ContentBlock } from "@/lib/site-data";
import { IconChevronUp, IconChevronDown, IconTrash, IconPlus } from "@/components/Icons";

const BLOCK_LABELS: Record<ContentBlock["type"], string> = {
  heading: "כותרת",
  paragraph: "פסקת טקסט",
  image: "תמונה",
  button: "כפתור/קישור",
  spacer: "רווח",
};

function newBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "heading":
      return { type: "heading", text: "", level: 2 };
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "image":
      return { type: "image", url: "", alt: "" };
    case "button":
      return { type: "button", text: "", href: "" };
    case "spacer":
      return { type: "spacer", height: 40 };
  }
}

/**
 * Editor for an ordered list of content blocks — the shared building block
 * behind both custom pages ("עמודים") and blog posts ("בלוג"). A small
 * fixed set of block types keeps editing reliable (nothing to break, no
 * raw HTML), while the up/down reordering still gives real control over
 * page composition without the complexity/fragility of a full drag-and-
 * drop canvas builder.
 */
export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  function update(i: number, patch: Partial<ContentBlock>) {
    const next = blocks.slice();
    next[i] = { ...next[i], ...patch } as ContentBlock;
    onChange(next);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = blocks.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }

  function add(type: ContentBlock["type"]) {
    onChange([...blocks, newBlock(type)]);
  }

  return (
    <div className="block-editor">
      {blocks.length === 0 && <p className="block-editor-empty">עדיין אין רכיבי תוכן — הוסיפו אחד מהכפתורים מטה.</p>}

      <div className="block-list">
        {blocks.map((b, i) => (
          <div className="block-card" key={i}>
            <div className="block-card-head">
              <span className="block-type-badge">{BLOCK_LABELS[b.type]}</span>
              <div className="block-card-actions">
                <button type="button" className="abtn abtn-ghost abtn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="הזזה למעלה">
                  <IconChevronUp />
                </button>
                <button type="button" className="abtn abtn-ghost abtn-sm" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="הזזה למטה">
                  <IconChevronDown />
                </button>
                <button type="button" className="abtn abtn-danger abtn-sm" onClick={() => remove(i)} aria-label="מחיקת רכיב">
                  <IconTrash />
                </button>
              </div>
            </div>

            {b.type === "heading" && (
              <div className="aform-grid">
                <div className="field full">
                  <label>טקסט הכותרת</label>
                  <input type="text" value={b.text} onChange={(e) => update(i, { text: e.target.value })} />
                </div>
                <div className="field">
                  <label>גודל</label>
                  <select value={b.level} onChange={(e) => update(i, { level: Number(e.target.value) as 2 | 3 })}>
                    <option value={2}>כותרת ראשית (H2)</option>
                    <option value={3}>כותרת משנה (H3)</option>
                  </select>
                </div>
              </div>
            )}

            {b.type === "paragraph" && (
              <div className="field full">
                <label>טקסט</label>
                <textarea rows={4} value={b.text} onChange={(e) => update(i, { text: e.target.value })} />
              </div>
            )}

            {b.type === "image" && (
              <div className="aform-grid">
                <div className="field full">
                  <label>כתובת URL של התמונה</label>
                  <input type="text" dir="ltr" value={b.url} onChange={(e) => update(i, { url: e.target.value })} />
                </div>
                <div className="field full">
                  <label>טקסט חלופי (alt) לנגישות</label>
                  <input type="text" value={b.alt} onChange={(e) => update(i, { alt: e.target.value })} />
                </div>
                {b.url && (
                  <div className="field full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.url} alt="" style={{ maxWidth: 220, borderRadius: 4 }} />
                  </div>
                )}
              </div>
            )}

            {b.type === "button" && (
              <div className="aform-grid">
                <div className="field">
                  <label>טקסט הכפתור</label>
                  <input type="text" value={b.text} onChange={(e) => update(i, { text: e.target.value })} />
                </div>
                <div className="field">
                  <label>קישור (כתובת יעד)</label>
                  <input type="text" dir="ltr" value={b.href} onChange={(e) => update(i, { href: e.target.value })} />
                </div>
              </div>
            )}

            {b.type === "spacer" && (
              <div className="field">
                <label>גובה הרווח (פיקסלים)</label>
                <input type="number" value={b.height} onChange={(e) => update(i, { height: Number(e.target.value) || 0 })} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="block-add-row">
        <span>הוספת רכיב:</span>
        <button type="button" className="abtn abtn-ghost abtn-sm" onClick={() => add("heading")}><IconPlus /> כותרת</button>
        <button type="button" className="abtn abtn-ghost abtn-sm" onClick={() => add("paragraph")}><IconPlus /> פסקה</button>
        <button type="button" className="abtn abtn-ghost abtn-sm" onClick={() => add("image")}><IconPlus /> תמונה</button>
        <button type="button" className="abtn abtn-ghost abtn-sm" onClick={() => add("button")}><IconPlus /> כפתור</button>
        <button type="button" className="abtn abtn-ghost abtn-sm" onClick={() => add("spacer")}><IconPlus /> רווח</button>
      </div>
    </div>
  );
}

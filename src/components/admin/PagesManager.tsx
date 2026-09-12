"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import BlockEditor from "@/components/admin/BlockEditor";
import { findUnsafeBlockHref } from "@/lib/link-safety";
import { RESERVED_SLUGS, type ContentBlock, type CustomPage } from "@/lib/site-data";
import { IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconInboxEmpty } from "@/components/Icons";

type FormState = {
  id: string | null;
  slug: string;
  title: string;
  blocks: ContentBlock[];
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  slug: "",
  title: "",
  blocks: [],
  seo_title: "",
  seo_description: "",
  og_image_url: "",
  published: true,
};

type Toast = { id: number; kind: "ok" | "err"; message: string };
let toastSeq = 0;

export default function PagesManager({ initialPages }: { initialPages: CustomPage[] }) {
  const [rows, setRows] = useState<CustomPage[]>(initialPages);
  const [view, setView] = useState<"list" | "edit">("list");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(kind: "ok" | "err", message: string) {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }

  async function refetch() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("custom_pages")
      .select("id, slug, title, blocks, seo_title, seo_description, og_image_url, published, updated_at")
      .order("updated_at", { ascending: false });
    if (!error && data) setRows(data as CustomPage[]);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setView("edit");
  }

  function openEdit(row: CustomPage) {
    setForm({
      id: row.id,
      slug: row.slug,
      title: row.title,
      blocks: row.blocks,
      seo_title: row.seo_title ?? "",
      seo_description: row.seo_description ?? "",
      og_image_url: row.og_image_url ?? "",
      published: row.published,
    });
    setView("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = form.slug.trim().toLowerCase();
    if (RESERVED_SLUGS.includes(slug)) {
      pushToast("err", `הסלאג "${slug}" שמור לעמוד קיים באתר — יש לבחור סלאג אחר`);
      return;
    }
    const unsafeHref = findUnsafeBlockHref(form.blocks);
    if (unsafeHref) {
      pushToast("err", `הקישור בכפתור "${unsafeHref}" אינו תקין — יש להשתמש בנתיב פנימי, כתובת http(s), או "mailto:"/"tel:"`);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      slug,
      title: form.title.trim(),
      blocks: form.blocks,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      og_image_url: form.og_image_url.trim() || null,
      published: form.published,
      updated_at: new Date().toISOString(),
    };
    try {
      if (form.id) {
        const { error } = await supabase.from("custom_pages").update(payload).eq("id", form.id);
        if (error) throw error;
        pushToast("ok", "העמוד עודכן בהצלחה");
      } else {
        const { error } = await supabase.from("custom_pages").insert(payload);
        if (error) throw error;
        pushToast("ok", "העמוד נוסף בהצלחה");
      }
      setView("list");
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "אירעה שגיאה";
      const friendly = message.includes("duplicate") || message.includes("unique")
        ? "הסלאג הזה כבר קיים במערכת, יש לבחור סלאג אחר"
        : message;
      pushToast("err", friendly);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: CustomPage) {
    if (!window.confirm(`למחוק את העמוד "${row.title}"? הפעולה אינה הפיכה.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("custom_pages").delete().eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", "העמוד נמחק");
    await refetch();
  }

  async function togglePublished(row: CustomPage) {
    const supabase = createClient();
    const { error } = await supabase.from("custom_pages").update({ published: !row.published }).eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    await refetch();
  }

  if (view === "edit") {
    return (
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>{form.id ? "עריכת עמוד" : "עמוד חדש"}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="aform-grid">
            <div className="field full">
              <label>כותרת העמוד</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field full">
              <label>סלאג (כתובת: metaline.co.il/הסלאג-כאן)</label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="לדוגמה: warranty-policy"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div className="field full">
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" style={{ width: "auto" }} checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                פורסם באתר
              </label>
            </div>
          </div>

          <div className="admin-panel-head" style={{ marginTop: 26 }}>
            <h2>תוכן העמוד</h2>
          </div>
          <BlockEditor blocks={form.blocks} onChange={(blocks) => setForm({ ...form, blocks })} />

          <div className="admin-panel-head" style={{ marginTop: 26 }}>
            <h2>SEO לעמוד זה</h2>
          </div>
          <div className="aform-grid">
            <div className="field full">
              <label>כותרת SEO (תגית title — ברירת מחדל: כותרת העמוד)</label>
              <input type="text" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
            </div>
            <div className="field full">
              <label>תיאור SEO (meta description)</label>
              <textarea rows={2} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
            </div>
            <div className="field full">
              <label>תמונת שיתוף (Open Graph) — כתובת URL</label>
              <input type="text" dir="ltr" value={form.og_image_url} onChange={(e) => setForm({ ...form, og_image_url: e.target.value })} />
            </div>
          </div>

          <div className="aform-actions">
            <button type="submit" className="abtn abtn-gold" disabled={saving}>
              <IconCheck /> {saving ? "שומר..." : "שמירה"}
            </button>
            <button type="button" className="abtn abtn-ghost" onClick={() => setView("list")} disabled={saving}>
              <IconX /> ביטול
            </button>
          </div>
        </form>

        <div className="atoast-stack">
          {toasts.map((t) => (
            <div key={t.id} className={`atoast atoast-${t.kind}`}>{t.message}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>עמודים</h2>
        <button className="abtn abtn-gold" onClick={openCreate}>
          <IconPlus /> עמוד חדש
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="aempty">
          <IconInboxEmpty />
          <p>עדיין לא נוספו עמודים מותאמים אישית.</p>
          <button className="abtn abtn-gold" onClick={openCreate}>
            <IconPlus /> הוספת עמוד ראשון
          </button>
        </div>
      ) : (
        <div className="atable-wrap">
          <table className="atable">
            <thead>
              <tr>
                <th>כותרת</th>
                <th>כתובת</th>
                <th>רכיבי תוכן</th>
                <th>סטטוס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-truncate">{row.title}</td>
                  <td className="cell-truncate" dir="ltr">/{row.slug}</td>
                  <td>{row.blocks.length}</td>
                  <td>
                    <button className={`abadge abadge-${row.published ? "published" : "draft"}`} onClick={() => togglePublished(row)} style={{ border: "none", cursor: "pointer" }} title="לחץ להחלפת סטטוס">
                      {row.published ? "פורסם" : "טיוטה"}
                    </button>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button className="abtn abtn-ghost abtn-sm" onClick={() => openEdit(row)}>
                        <IconEdit /> עריכה
                      </button>
                      <button className="abtn abtn-danger abtn-sm" onClick={() => handleDelete(row)}>
                        <IconTrash /> מחיקה
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="atoast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`atoast atoast-${t.kind}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}

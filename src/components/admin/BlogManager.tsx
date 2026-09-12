"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import BlockEditor from "@/components/admin/BlockEditor";
import { findUnsafeBlockHref } from "@/lib/link-safety";
import type { BlogPost, ContentBlock } from "@/lib/site-data";
import { IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconInboxEmpty } from "@/components/Icons";

type FormState = {
  id: string | null;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  blocks: ContentBlock[];
  category: string;
  tags: string;
  author_name: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  slug: "",
  title: "",
  excerpt: "",
  cover_image_url: "",
  blocks: [],
  category: "",
  tags: "",
  author_name: "",
  seo_title: "",
  seo_description: "",
  published: false,
};

type Toast = { id: number; kind: "ok" | "err"; message: string };
let toastSeq = 0;

const SELECT_FIELDS =
  "id, slug, title, excerpt, cover_image_url, blocks, category, tags, author_name, seo_title, seo_description, published, published_at, updated_at";

export default function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [rows, setRows] = useState<BlogPost[]>(initialPosts);
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
    const { data, error } = await supabase.from("blog_posts").select(SELECT_FIELDS).order("updated_at", { ascending: false });
    if (!error && data) setRows(data as BlogPost[]);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setView("edit");
  }

  function openEdit(row: BlogPost) {
    setForm({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? "",
      cover_image_url: row.cover_image_url ?? "",
      blocks: row.blocks,
      category: row.category ?? "",
      tags: row.tags.join(", "),
      author_name: row.author_name ?? "",
      seo_title: row.seo_title ?? "",
      seo_description: row.seo_description ?? "",
      published: row.published,
    });
    setView("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const unsafeHref = findUnsafeBlockHref(form.blocks);
    if (unsafeHref) {
      pushToast("err", `הקישור בכפתור "${unsafeHref}" אינו תקין — יש להשתמש בנתיב פנימי, כתובת http(s), או "mailto:"/"tel:"`);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const existing = rows.find((r) => r.id === form.id);
    const payload = {
      slug: form.slug.trim().toLowerCase(),
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      blocks: form.blocks,
      category: form.category.trim() || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      author_name: form.author_name.trim() || null,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      published: form.published,
      // Stamp published_at the first time a post goes live; keep it fixed
      // afterwards so editing a published post doesn't bump its date.
      published_at: form.published ? existing?.published_at ?? new Date().toISOString() : existing?.published_at ?? null,
      updated_at: new Date().toISOString(),
    };
    try {
      if (form.id) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", form.id);
        if (error) throw error;
        pushToast("ok", "הפוסט עודכן בהצלחה");
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        pushToast("ok", "הפוסט נוסף בהצלחה");
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

  async function handleDelete(row: BlogPost) {
    if (!window.confirm(`למחוק את הפוסט "${row.title}"? הפעולה אינה הפיכה.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", "הפוסט נמחק");
    await refetch();
  }

  if (view === "edit") {
    return (
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>{form.id ? "עריכת פוסט" : "פוסט חדש"}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="aform-grid">
            <div className="field full">
              <label>כותרת</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field full">
              <label>סלאג (כתובת: metaline.co.il/blog/הסלאג-כאן)</label>
              <input type="text" required dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="field full">
              <label>תקציר (מוצג ברשימת הבלוג)</label>
              <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div className="field full">
              <label>תמונת כותרת — כתובת URL</label>
              <input type="text" dir="ltr" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
            </div>
            <div className="field">
              <label>קטגוריה</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="field">
              <label>תגיות (מופרדות בפסיקים)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="field">
              <label>שם הכותב/ת</label>
              <input type="text" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
            </div>
            <div className="field">
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
                <input type="checkbox" style={{ width: "auto" }} checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                פורסם באתר
              </label>
            </div>
          </div>

          <div className="admin-panel-head" style={{ marginTop: 26 }}>
            <h2>תוכן הפוסט</h2>
          </div>
          <BlockEditor blocks={form.blocks} onChange={(blocks) => setForm({ ...form, blocks })} />

          <div className="admin-panel-head" style={{ marginTop: 26 }}>
            <h2>SEO לפוסט זה</h2>
          </div>
          <div className="aform-grid">
            <div className="field full">
              <label>כותרת SEO</label>
              <input type="text" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
            </div>
            <div className="field full">
              <label>תיאור SEO (meta description)</label>
              <textarea rows={2} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
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
        <h2>בלוג</h2>
        <button className="abtn abtn-gold" onClick={openCreate}>
          <IconPlus /> פוסט חדש
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="aempty">
          <IconInboxEmpty />
          <p>עדיין לא נוספו פוסטים.</p>
          <button className="abtn abtn-gold" onClick={openCreate}>
            <IconPlus /> הוספת פוסט ראשון
          </button>
        </div>
      ) : (
        <div className="atable-wrap">
          <table className="atable">
            <thead>
              <tr>
                <th>כותרת</th>
                <th>קטגוריה</th>
                <th>סטטוס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-truncate">{row.title}</td>
                  <td>{row.category || "—"}</td>
                  <td>
                    <span className={`abadge abadge-${row.published ? "published" : "draft"}`}>{row.published ? "פורסם" : "טיוטה"}</span>
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

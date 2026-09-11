"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { IconPlus, IconEdit, IconTrash, IconX, IconPhoto, IconUpload } from "@/components/Icons";

const CATEGORIES = ["שערים חשמליים", "מעקות אלומיניום", "פרגולות", "מחיצות מתכת"] as const;

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

type Toast = { id: number; kind: "ok" | "err"; text: string };

type FormState = {
  id: string | null;
  title: string;
  category: string;
  image_url: string | null;
  sort_order: number;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  category: CATEGORIES[0],
  image_url: null,
  sort_order: 0,
  published: true,
};

export default function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pushToast(kind: "ok" | "err", text: string) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  function openAddModal() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(item: GalleryItem) {
    setForm({
      id: item.id,
      title: item.title,
      category: item.category,
      image_url: item.image_url,
      sort_order: item.sort_order,
      published: item.published,
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving || uploading) return;
    setModalOpen(false);
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { data, error } = await supabase.storage.from("gallery").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("gallery").getPublicUrl(data.path);
      setForm((f) => ({ ...f, image_url: pub.publicUrl }));
      pushToast("ok", "התמונה הועלתה בהצלחה");
    } catch (err) {
      pushToast("err", "שגיאה בהעלאת התמונה");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      pushToast("err", "יש להזין כותרת");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      if (form.id) {
        const { data, error } = await supabase
          .from("gallery_projects")
          .update({
            title: form.title.trim(),
            category: form.category,
            image_url: form.image_url,
            sort_order: form.sort_order,
            published: form.published,
          })
          .eq("id", form.id)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => prev.map((it) => (it.id === form.id ? (data as GalleryItem) : it)));
        pushToast("ok", "הפריט עודכן בהצלחה");
      } else {
        const { data, error } = await supabase
          .from("gallery_projects")
          .insert({
            title: form.title.trim(),
            category: form.category,
            image_url: form.image_url,
            sort_order: form.sort_order,
            published: form.published,
          })
          .select()
          .single();
        if (error) throw error;
        setItems((prev) =>
          [...prev, data as GalleryItem].sort((a, b) => {
            if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
        );
        pushToast("ok", "הפריט נוסף בהצלחה");
      }
      setModalOpen(false);
    } catch (err) {
      pushToast("err", "שגיאה בשמירת הפריט");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: GalleryItem) {
    if (!window.confirm(`למחוק את "${item.title}"? הפעולה אינה הפיכה.`)) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("gallery_projects").delete().eq("id", item.id);
      if (error) throw error;
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      pushToast("ok", "הפריט נמחק");
    } catch (err) {
      pushToast("err", "שגיאה במחיקת הפריט");
      console.error(err);
    }
  }

  return (
    <>
      <style>{`
        .gm-ic { width: 15px; height: 15px; flex: none; }
        .gm-ic-lg { width: 20px; height: 20px; }
        .gm-ic-xl { width: 32px; height: 32px; opacity: .5; margin-bottom: 10px; }
      `}</style>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>פריטי גלריה</h2>
          <button className="abtn abtn-gold" onClick={openAddModal}>
            <IconPlus className="gm-ic" />
            הוסף פריט
          </button>
        </div>

        {items.length === 0 ? (
          <div className="aempty">
            <IconPhoto />
            <p>
              עדיין אין תמונות פרויקטים בגלריה. כשיתקבלו תמונות אמיתיות מהלקוח, אפשר להוסיף כאן את
              הפריט הראשון.
            </p>
            <button className="abtn abtn-gold" onClick={openAddModal}>
              <IconPlus className="gm-ic" />
              הוסף פריט ראשון
            </button>
          </div>
        ) : (
          <div className="atable-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>תמונה</th>
                  <th>כותרת</th>
                  <th>קטגוריה</th>
                  <th>סדר</th>
                  <th>סטטוס</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          style={{
                            width: 52,
                            height: 52,
                            objectFit: "cover",
                            borderRadius: 5,
                            border: "1px solid var(--line-2)",
                          }}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 5,
                              border: "1px dashed var(--line-2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--muted)",
                              flex: "none",
                            }}
                          >
                            <IconPhoto className="gm-ic-lg" />
                          </div>
                          <span style={{ fontSize: 11.5, color: "var(--gold-2)", maxWidth: 90, lineHeight: 1.4 }}>
                            מוצג באתר עם הדמיה — עד שתעלו תמונה
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="cell-truncate">{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.sort_order}</td>
                    <td>
                      <span className={`abadge ${item.published ? "abadge-published" : "abadge-draft"}`}>
                        {item.published ? "מפורסם" : "טיוטה"}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button className="abtn abtn-ghost abtn-sm" onClick={() => openEditModal(item)}>
                          <IconEdit className="gm-ic" />
                        </button>
                        <button className="abtn abtn-danger abtn-sm" onClick={() => handleDelete(item)}>
                          <IconTrash className="gm-ic" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="amodal-overlay" onClick={closeModal}>
          <div className="amodal" onClick={(e) => e.stopPropagation()}>
            <h3>{form.id ? "עריכת פריט" : "הוספת פריט"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="aform-grid">
                <div className="field full">
                  <label htmlFor="gp-title">כותרת</label>
                  <input
                    id="gp-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="gp-category">קטגוריה</label>
                  <select
                    id="gp-category"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="gp-sort">סדר תצוגה</label>
                  <input
                    id="gp-sort"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  />
                </div>

                <div className="field full">
                  <label>תמונה</label>
                  <div className="aupload" onClick={() => fileInputRef.current?.click()}>
                    {form.image_url ? (
                      <img src={form.image_url} alt="תצוגה מקדימה" />
                    ) : (
                      <IconPhoto className="gm-ic-xl" />
                    )}
                    <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <IconUpload className="gm-ic" />
                      {uploading ? "מעלה תמונה…" : form.image_url ? "החלף תמונה" : "לחצו להעלאת תמונה"}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChosen}
                  />
                </div>

                <div className="field full" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <input
                    id="gp-published"
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    style={{ width: "auto" }}
                  />
                  <label htmlFor="gp-published" style={{ margin: 0 }}>
                    פרסם באתר
                  </label>
                </div>
              </div>

              <div className="amodal-actions">
                <button type="submit" className="abtn abtn-gold" disabled={saving || uploading}>
                  {saving ? "שומר…" : "שמירה"}
                </button>
                <button type="button" className="abtn abtn-ghost" onClick={closeModal} disabled={saving}>
                  <IconX className="gm-ic" />
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="atoast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`atoast ${t.kind === "ok" ? "atoast-ok" : "atoast-err"}`}>
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}

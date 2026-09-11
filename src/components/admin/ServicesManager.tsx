"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
  IconInboxEmpty,
} from "@/components/Icons";

type Service = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

type FormState = {
  id: string | null;
  slug: string;
  title: string;
  description: string;
  icon: string;
  sort_order: string;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  slug: "",
  title: "",
  description: "",
  icon: "",
  sort_order: "0",
  published: true,
};

type Toast = { id: number; kind: "ok" | "err"; message: string };

let toastSeq = 0;

export default function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const [rows, setRows] = useState<Service[]>(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(kind: "ok" | "err", message: string) {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }

  async function refetch() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, slug, title, description, icon, sort_order, published, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (!error && data) setRows(data as Service[]);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(row: Service) {
    setForm({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description ?? "",
      icon: row.icon ?? "",
      sort_order: String(row.sort_order ?? 0),
      published: row.published,
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      description: form.description.trim() || null,
      icon: form.icon.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };

    try {
      if (form.id) {
        const { error } = await supabase.from("services").update(payload).eq("id", form.id);
        if (error) throw error;
        pushToast("ok", "השירות עודכן בהצלחה");
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
        pushToast("ok", "השירות נוסף בהצלחה");
      }
      setModalOpen(false);
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

  async function handleDelete(row: Service) {
    if (!window.confirm(`למחוק את השירות "${row.title}"? הפעולה אינה הפיכה.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("services").delete().eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", "השירות נמחק");
    await refetch();
  }

  async function togglePublished(row: Service) {
    const supabase = createClient();
    const { error } = await supabase
      .from("services")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", !row.published ? "השירות פורסם" : "השירות הועבר לטיוטה");
    await refetch();
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>שירותים</h2>
        <button className="abtn abtn-gold" onClick={openCreate}>
          <IconPlus /> הוסף חדש
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="aempty">
          <IconInboxEmpty />
          <p>עדיין לא נוספו שירותים.</p>
          <button className="abtn abtn-gold" onClick={openCreate}>
            <IconPlus /> הוסף שירות ראשון
          </button>
        </div>
      ) : (
        <div className="atable-wrap">
          <table className="atable">
            <thead>
              <tr>
                <th>כותרת</th>
                <th>סלאג</th>
                <th>אייקון</th>
                <th>סדר תצוגה</th>
                <th>סטטוס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-truncate">{row.title}</td>
                  <td className="cell-truncate">{row.slug}</td>
                  <td>{row.icon || "—"}</td>
                  <td>{row.sort_order}</td>
                  <td>
                    <button
                      className={`abadge abadge-${row.published ? "published" : "draft"}`}
                      onClick={() => togglePublished(row)}
                      style={{ border: "none", cursor: "pointer" }}
                      title="לחץ להחלפת סטטוס"
                    >
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

      {modalOpen && (
        <div className="amodal-overlay" onClick={closeModal}>
          <div className="amodal" onClick={(e) => e.stopPropagation()}>
            <h3>{form.id ? "עריכת שירות" : "הוספת שירות חדש"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="aform-grid">
                <div className="field full">
                  <label htmlFor="svc-title">כותרת</label>
                  <input
                    id="svc-title"
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="svc-slug">סלאג (לשימוש בכתובת URL, אותיות אנגליות ומקפים)</label>
                  <input
                    id="svc-slug"
                    type="text"
                    required
                    dir="ltr"
                    placeholder="לדוגמה: sliding-gates"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="svc-desc">תיאור</label>
                  <textarea
                    id="svc-desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="svc-icon">אייקון (תווית חופשית)</label>
                  <input
                    id="svc-icon"
                    type="text"
                    placeholder="לדוגמה: wrench"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="svc-sort">סדר תצוגה</label>
                  <input
                    id="svc-sort"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="svc-published" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      id="svc-published"
                      type="checkbox"
                      style={{ width: "auto" }}
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    />
                    פורסם באתר
                  </label>
                </div>
              </div>
              <div className="amodal-actions">
                <button type="submit" className="abtn abtn-gold" disabled={saving}>
                  <IconCheck /> {saving ? "שומר..." : "שמירה"}
                </button>
                <button type="button" className="abtn abtn-ghost" onClick={closeModal} disabled={saving}>
                  <IconX /> ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="atoast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`atoast atoast-${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

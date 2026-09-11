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

type PricingItem = {
  id: string;
  title: string;
  amount_label: string | null;
  description: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

type FormState = {
  id: string | null;
  title: string;
  amount_label: string;
  description: string;
  sort_order: string;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  amount_label: "",
  description: "",
  sort_order: "0",
  published: true,
};

type Toast = { id: number; kind: "ok" | "err"; message: string };

let toastSeq = 0;

export default function PricingManager({ initialItems }: { initialItems: PricingItem[] }) {
  const [rows, setRows] = useState<PricingItem[]>(initialItems);
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
      .from("pricing_items")
      .select("id, title, amount_label, description, sort_order, published, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (!error && data) setRows(data as PricingItem[]);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(row: PricingItem) {
    setForm({
      id: row.id,
      title: row.title,
      amount_label: row.amount_label ?? "",
      description: row.description ?? "",
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
      title: form.title.trim(),
      amount_label: form.amount_label.trim(),
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };

    try {
      if (form.id) {
        const { error } = await supabase.from("pricing_items").update(payload).eq("id", form.id);
        if (error) throw error;
        pushToast("ok", "פריט המחירון עודכן בהצלחה");
      } else {
        const { error } = await supabase.from("pricing_items").insert(payload);
        if (error) throw error;
        pushToast("ok", "פריט המחירון נוסף בהצלחה");
      }
      setModalOpen(false);
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "אירעה שגיאה";
      pushToast("err", message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: PricingItem) {
    if (!window.confirm(`למחוק את הפריט "${row.title}"? הפעולה אינה הפיכה.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("pricing_items").delete().eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", "הפריט נמחק");
    await refetch();
  }

  async function togglePublished(row: PricingItem) {
    const supabase = createClient();
    const { error } = await supabase
      .from("pricing_items")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", !row.published ? "הפריט פורסם" : "הפריט הועבר לטיוטה");
    await refetch();
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>מחירון</h2>
        <button className="abtn abtn-gold" onClick={openCreate}>
          <IconPlus /> הוסף חדש
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="aempty">
          <IconInboxEmpty />
          <p>עדיין לא נוספו פריטים למחירון.</p>
          <button className="abtn abtn-gold" onClick={openCreate}>
            <IconPlus /> הוסף פריט ראשון
          </button>
        </div>
      ) : (
        <div className="atable-wrap">
          <table className="atable">
            <thead>
              <tr>
                <th>כותרת</th>
                <th>מחיר</th>
                <th>סדר תצוגה</th>
                <th>סטטוס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-truncate">{row.title}</td>
                  <td className="cell-truncate">{row.amount_label || "—"}</td>
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
            <h3>{form.id ? "עריכת פריט מחירון" : "הוספת פריט חדש"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="aform-grid">
                <div className="field full">
                  <label htmlFor="price-title">כותרת</label>
                  <input
                    id="price-title"
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="price-amount">מחיר (טקסט חופשי)</label>
                  <input
                    id="price-amount"
                    type="text"
                    placeholder="[להשלמה] לדוגמה: החל מ-₪2,500"
                    value={form.amount_label}
                    onChange={(e) => setForm({ ...form, amount_label: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="price-desc">תיאור</label>
                  <textarea
                    id="price-desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="price-sort">סדר תצוגה</label>
                  <input
                    id="price-sort"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="price-published" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      id="price-published"
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

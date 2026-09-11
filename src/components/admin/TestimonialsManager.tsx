"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { IconPlus, IconEdit, IconTrash, IconX, IconMessageStar, IconStar } from "@/components/Icons";

type Testimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  rating: number;
  published: boolean;
  created_at: string;
};

type Toast = { id: number; kind: "ok" | "err"; text: string };

type FormState = {
  id: string | null;
  quote: string;
  author_name: string;
  author_role: string;
  rating: number;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  quote: "",
  author_name: "",
  author_role: "",
  rating: 5,
  published: true,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="testi-stars" style={{ marginBottom: 0 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} className={i < rating ? "tm-ic" : "tm-ic tm-ic-dim"} />
      ))}
    </span>
  );
}

export default function TestimonialsManager({ initialItems }: { initialItems: Testimonial[] }) {
  const [items, setItems] = useState<Testimonial[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(kind: "ok" | "err", text: string) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  function openAddModal() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(item: Testimonial) {
    setForm({
      id: item.id,
      quote: item.quote,
      author_name: item.author_name,
      author_role: item.author_role ?? "",
      rating: item.rating,
      published: item.published,
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.quote.trim() || !form.author_name.trim()) {
      pushToast("err", "יש למלא ציטוט ושם ממליץ");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        quote: form.quote.trim(),
        author_name: form.author_name.trim(),
        author_role: form.author_role.trim() || null,
        rating: form.rating,
        published: form.published,
      };
      if (form.id) {
        const { data, error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", form.id)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => prev.map((it) => (it.id === form.id ? (data as Testimonial) : it)));
        pushToast("ok", "ההמלצה עודכנה בהצלחה");
      } else {
        const { data, error } = await supabase.from("testimonials").insert(payload).select().single();
        if (error) throw error;
        setItems((prev) => [data as Testimonial, ...prev]);
        pushToast("ok", "ההמלצה נוספה בהצלחה");
      }
      setModalOpen(false);
    } catch (err) {
      pushToast("err", "שגיאה בשמירת ההמלצה");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Testimonial) {
    if (!window.confirm(`למחוק את ההמלצה של "${item.author_name}"? הפעולה אינה הפיכה.`)) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("testimonials").delete().eq("id", item.id);
      if (error) throw error;
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      pushToast("ok", "ההמלצה נמחקה");
    } catch (err) {
      pushToast("err", "שגיאה במחיקת ההמלצה");
      console.error(err);
    }
  }

  return (
    <>
      <style>{`
        .tm-ic { width: 15px; height: 15px; flex: none; }
        .tm-ic-dim { opacity: .25; }
      `}</style>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>המלצות לקוחות</h2>
          <button className="abtn abtn-gold" onClick={openAddModal}>
            <IconPlus className="tm-ic" />
            הוסף המלצה
          </button>
        </div>

        {items.length === 0 ? (
          <div className="aempty">
            <IconMessageStar />
            <p>
              עדיין אין המלצות אמיתיות מלקוחות. כשיתקבלו המלצות בפועל מהלקוח, אפשר להוסיף כאן את
              ההמלצה הראשונה — אין להזין המלצות לדוגמה.
            </p>
            <button className="abtn abtn-gold" onClick={openAddModal}>
              <IconPlus className="tm-ic" />
              הוסף המלצה ראשונה
            </button>
          </div>
        ) : (
          <div className="atable-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>ציטוט</th>
                  <th>שם</th>
                  <th>תפקיד</th>
                  <th>דירוג</th>
                  <th>סטטוס</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="cell-truncate">{item.quote}</td>
                    <td>{item.author_name}</td>
                    <td>{item.author_role ?? "—"}</td>
                    <td>
                      <StarRating rating={item.rating} />
                    </td>
                    <td>
                      <span className={`abadge ${item.published ? "abadge-published" : "abadge-draft"}`}>
                        {item.published ? "מפורסם" : "טיוטה"}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button className="abtn abtn-ghost abtn-sm" onClick={() => openEditModal(item)}>
                          <IconEdit className="tm-ic" />
                        </button>
                        <button className="abtn abtn-danger abtn-sm" onClick={() => handleDelete(item)}>
                          <IconTrash className="tm-ic" />
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
            <h3>{form.id ? "עריכת המלצה" : "הוספת המלצה"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="aform-grid">
                <div className="field full">
                  <label htmlFor="tm-quote">ציטוט</label>
                  <textarea
                    id="tm-quote"
                    value={form.quote}
                    onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="tm-name">שם הממליץ</label>
                  <input
                    id="tm-name"
                    type="text"
                    value={form.author_name}
                    onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="tm-role">תפקיד / פרטים נוספים</label>
                  <input
                    id="tm-role"
                    type="text"
                    value={form.author_role}
                    onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <label htmlFor="tm-rating">דירוג</label>
                  <select
                    id="tm-rating"
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} כוכבים
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field full" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <input
                    id="tm-published"
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    style={{ width: "auto" }}
                  />
                  <label htmlFor="tm-published" style={{ margin: 0 }}>
                    פרסם באתר
                  </label>
                </div>
              </div>

              <div className="amodal-actions">
                <button type="submit" className="abtn abtn-gold" disabled={saving}>
                  {saving ? "שומר…" : "שמירה"}
                </button>
                <button type="button" className="abtn abtn-ghost" onClick={closeModal} disabled={saving}>
                  <IconX className="tm-ic" />
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

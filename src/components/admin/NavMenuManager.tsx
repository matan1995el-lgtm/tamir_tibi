"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { isSafeHref } from "@/lib/link-safety";
import { IconPlus, IconEdit, IconTrash, IconX, IconCheck, IconInboxEmpty } from "@/components/Icons";

type NavItem = {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  is_visible: boolean;
  open_in_new_tab: boolean;
};

type FormState = {
  id: string | null;
  label: string;
  href: string;
  sort_order: string;
  is_visible: boolean;
  open_in_new_tab: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  label: "",
  href: "",
  sort_order: "0",
  is_visible: true,
  open_in_new_tab: false,
};

type Toast = { id: number; kind: "ok" | "err"; message: string };

let toastSeq = 0;

export default function NavMenuManager({ initialItems }: { initialItems: NavItem[] }) {
  const [rows, setRows] = useState<NavItem[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
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
      .from("nav_menu_items")
      .select("id, label, href, sort_order, is_visible, open_in_new_tab")
      .order("sort_order", { ascending: true });
    if (!error && data) setRows(data as NavItem[]);
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM, sort_order: String(rows.length) });
    setModalOpen(true);
  }

  function openEdit(row: NavItem) {
    setForm({
      id: row.id,
      label: row.label,
      href: row.href,
      sort_order: String(row.sort_order ?? 0),
      is_visible: row.is_visible,
      open_in_new_tab: row.open_in_new_tab,
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      label: form.label.trim(),
      href: form.href.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_visible: form.is_visible,
      open_in_new_tab: form.open_in_new_tab,
    };

    // This href renders as a real link on every page of the public site —
    // block anything but an internal path, a full http(s) URL, or a
    // mailto:/tel: link (e.g. a "javascript:" URI) before it ever reaches
    // the database.
    if (!isSafeHref(payload.href)) {
      pushToast("err", 'הקישור אינו תקין — יש להשתמש בנתיב פנימי (כמו /gallery), כתובת http(s), או "mailto:"/"tel:"');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      if (form.id) {
        const { error } = await supabase.from("nav_menu_items").update(payload).eq("id", form.id);
        if (error) throw error;
        pushToast("ok", "פריט התפריט עודכן");
      } else {
        const { error } = await supabase.from("nav_menu_items").insert(payload);
        if (error) throw error;
        pushToast("ok", "פריט התפריט נוסף");
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

  async function handleDelete(row: NavItem) {
    if (!window.confirm(`למחוק את "${row.label}" מהתפריט? הפעולה אינה הפיכה.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("nav_menu_items").delete().eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", "הפריט נמחק");
    await refetch();
  }

  async function toggleVisible(row: NavItem) {
    const supabase = createClient();
    const { error } = await supabase
      .from("nav_menu_items")
      .update({ is_visible: !row.is_visible })
      .eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", !row.is_visible ? "הפריט מוצג בתפריט" : "הפריט הוסתר מהתפריט");
    await refetch();
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>תפריט ניווט ראשי</h2>
        <button className="abtn abtn-gold" onClick={openCreate}>
          <IconPlus /> הוסף קישור
        </button>
      </div>

      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: -8, marginBottom: 16 }}>
        הקישורים בתפריט העליון של האתר, לפי סדר התצוגה. שינויים כאן משפיעים על התפריט בכל עמודי האתר.
      </p>

      {rows.length === 0 ? (
        <div className="aempty">
          <IconInboxEmpty />
          <p>אין פריטים בתפריט.</p>
          <button className="abtn abtn-gold" onClick={openCreate}>
            <IconPlus /> הוסף קישור ראשון
          </button>
        </div>
      ) : (
        <div className="atable-wrap">
          <table className="atable">
            <thead>
              <tr>
                <th>תווית</th>
                <th>קישור</th>
                <th>סדר תצוגה</th>
                <th>סטטוס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-truncate">{row.label}</td>
                  <td className="cell-truncate" dir="ltr" style={{ textAlign: "right" }}>
                    {row.href}
                    {row.open_in_new_tab && (
                      <span style={{ fontSize: 11, color: "var(--muted)", marginInlineStart: 6 }}>(בכרטיסייה חדשה)</span>
                    )}
                  </td>
                  <td>{row.sort_order}</td>
                  <td>
                    <button
                      className={`abadge abadge-${row.is_visible ? "published" : "draft"}`}
                      onClick={() => toggleVisible(row)}
                      style={{ border: "none", cursor: "pointer" }}
                      title="לחץ להחלפת סטטוס"
                    >
                      {row.is_visible ? "מוצג" : "מוסתר"}
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
            <h3>{form.id ? "עריכת קישור" : "הוספת קישור לתפריט"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="aform-grid">
                <div className="field full">
                  <label htmlFor="nav-label">תווית (הטקסט שיוצג בתפריט)</label>
                  <input
                    id="nav-label"
                    type="text"
                    required
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="nav-href">קישור (נתיב באתר כמו /gallery, או כתובת מלאה)</label>
                  <input
                    id="nav-href"
                    type="text"
                    required
                    dir="ltr"
                    placeholder="/gallery או https://..."
                    value={form.href}
                    onChange={(e) => setForm({ ...form, href: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="nav-sort">סדר תצוגה</label>
                  <input
                    id="nav-sort"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                </div>
                <div className="field" style={{ justifyContent: "center" }}>
                  <label htmlFor="nav-newtab" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      id="nav-newtab"
                      type="checkbox"
                      style={{ width: "auto" }}
                      checked={form.open_in_new_tab}
                      onChange={(e) => setForm({ ...form, open_in_new_tab: e.target.checked })}
                    />
                    פתיחה בכרטיסייה חדשה
                  </label>
                </div>
                <div className="field full">
                  <label htmlFor="nav-visible" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      id="nav-visible"
                      type="checkbox"
                      style={{ width: "auto" }}
                      checked={form.is_visible}
                      onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                    />
                    מוצג בתפריט
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

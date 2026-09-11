"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { IconCheck } from "@/components/Icons";
import type { SeoSettings } from "@/lib/site-data";

type Toast = { id: number; text: string; type: "ok" | "err" };

export default function SeoForm({ initial }: { initial: SeoSettings }) {
  const [form, setForm] = useState({
    default_meta_title: initial.default_meta_title ?? "",
    default_meta_description: initial.default_meta_description ?? "",
    default_og_image_url: initial.default_og_image_url ?? "",
    google_site_verification: initial.google_site_verification ?? "",
    robots_index: initial.robots_index,
  });
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeq = useRef(0);

  function pushToast(text: string, type: Toast["type"]) {
    toastSeq.current += 1;
    const id = toastSeq.current;
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("seo_settings")
        .update({
          default_meta_title: form.default_meta_title.trim() || null,
          default_meta_description: form.default_meta_description.trim() || null,
          default_og_image_url: form.default_og_image_url.trim() || null,
          google_site_verification: form.google_site_verification.trim() || null,
          robots_index: form.robots_index,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);
      if (error) throw error;
      pushToast("הגדרות ה-SEO נשמרו", "ok");
    } catch {
      pushToast("שגיאה בשמירה, נסו שוב", "err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>SEO — הגדרות ברירת מחדל לאתר</h2>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "0 0 20px" }}>
        חלות על כל עמוד שלא הוגדרה לו כותרת/תיאור SEO משלו (אפשר להגדיר כאלה לכל עמוד בנפרד תחת &quot;עמודים&quot; ו&quot;בלוג&quot;).
      </p>
      <div className="aform-grid">
        <div className="field full">
          <label>כותרת ברירת מחדל (meta title)</label>
          <input type="text" value={form.default_meta_title} onChange={(e) => setForm({ ...form, default_meta_title: e.target.value })} />
        </div>
        <div className="field full">
          <label>תיאור ברירת מחדל (meta description)</label>
          <textarea rows={3} value={form.default_meta_description} onChange={(e) => setForm({ ...form, default_meta_description: e.target.value })} />
        </div>
        <div className="field full">
          <label>תמונת שיתוף ברירת מחדל (Open Graph) — כתובת URL</label>
          <input type="text" dir="ltr" value={form.default_og_image_url} onChange={(e) => setForm({ ...form, default_og_image_url: e.target.value })} />
        </div>
        <div className="field full">
          <label>קוד אימות Google Search Console (google-site-verification)</label>
          <input type="text" dir="ltr" placeholder="לדוגמה: AbCdEf123..." value={form.google_site_verification} onChange={(e) => setForm({ ...form, google_site_verification: e.target.value })} />
        </div>
        <div className="field full">
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" style={{ width: "auto" }} checked={form.robots_index} onChange={(e) => setForm({ ...form, robots_index: e.target.checked })} />
            לאפשר למנועי חיפוש לאנדקס את האתר
          </label>
          {!form.robots_index && (
            <p style={{ color: "#f3a5a5", fontSize: 12.5, margin: "6px 0 0" }}>
              כיבוי אפשרות זו יסתיר את כל האתר ממנועי חיפוש (Google וכו&apos;) — להפעיל רק אם האתר עדיין לא מוכן לקהל הרחב.
            </p>
          )}
        </div>
      </div>
      <div className="aform-actions">
        <button type="button" className="abtn abtn-gold" onClick={handleSave} disabled={saving}>
          <IconCheck /> {saving ? "שומר…" : "שמירה"}
        </button>
      </div>
      <div className="atoast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`atoast ${t.type === "ok" ? "atoast-ok" : "atoast-err"}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

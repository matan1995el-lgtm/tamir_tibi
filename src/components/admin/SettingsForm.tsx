"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { IconPhoto, IconUpload } from "@/components/Icons";

type SiteSettings = {
  id: number;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  years_in_business: number | null;
  projects_count: number | null;
  warranty_years: number | null;
  logo_url: string | null;
  updated_at: string | null;
};

type FormState = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  facebook_url: string;
  instagram_url: string;
  years_in_business: string;
  projects_count: string;
  warranty_years: string;
  logo_url: string;
};

type Toast = { id: number; text: string; type: "ok" | "err" };

function toFormState(settings: SiteSettings | null): FormState {
  return {
    phone: settings?.phone ?? "",
    whatsapp: settings?.whatsapp ?? "",
    email: settings?.email ?? "",
    address: settings?.address ?? "",
    hours: settings?.hours ?? "",
    facebook_url: settings?.facebook_url ?? "",
    instagram_url: settings?.instagram_url ?? "",
    years_in_business:
      settings?.years_in_business === null || settings?.years_in_business === undefined
        ? ""
        : String(settings.years_in_business),
    projects_count:
      settings?.projects_count === null || settings?.projects_count === undefined
        ? ""
        : String(settings.projects_count),
    warranty_years:
      settings?.warranty_years === null || settings?.warranty_years === undefined
        ? ""
        : String(settings.warranty_years),
    logo_url: settings?.logo_url ?? "",
  };
}

export default function SettingsForm({ initialSettings }: { initialSettings: SiteSettings | null }) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialSettings));
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialSettings?.updated_at ?? null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(text: string, type: Toast["type"]) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const supabase = createClient();
      const path = `branding/${crypto.randomUUID()}-${file.name}`;
      const { data, error } = await supabase.storage.from("gallery").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("gallery").getPublicUrl(data.path);
      update("logo_url", pub.publicUrl);
      pushToast("הלוגו הועלה בהצלחה — לא לשכוח ללחוץ 'שמירה'", "ok");
    } catch {
      pushToast("שגיאה בהעלאת הלוגו", "err");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  function toIntOrNull(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("site_settings")
        .update({
          phone: form.phone.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          hours: form.hours.trim() || null,
          facebook_url: form.facebook_url.trim() || null,
          instagram_url: form.instagram_url.trim() || null,
          years_in_business: toIntOrNull(form.years_in_business),
          projects_count: toIntOrNull(form.projects_count),
          warranty_years: toIntOrNull(form.warranty_years),
          logo_url: form.logo_url.trim() || null,
          updated_at: nowIso,
        })
        .eq("id", 1);

      if (error) {
        pushToast(`שגיאה בשמירה: ${error.message}`, "err");
      } else {
        setUpdatedAt(nowIso);
        pushToast("ההגדרות נשמרו בהצלחה", "ok");
      }
    } catch {
      pushToast("שגיאה בשמירה, נסו שוב", "err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>פרטי העסק</h2>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
          {updatedAt
            ? `עודכן לאחרונה: ${new Date(updatedAt).toLocaleString("he-IL")}`
            : "טרם עודכן"}
        </span>
      </div>

      <div className="aform-grid">
        <div className="field">
          <label htmlFor="phone">טלפון</label>
          <input
            id="phone"
            type="text"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field">
          <label htmlFor="whatsapp">מספר וואטסאפ</label>
          <input
            id="whatsapp"
            type="text"
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field">
          <label htmlFor="email">אימייל</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field">
          <label htmlFor="address">כתובת</label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field full">
          <label htmlFor="hours">שעות פעילות</label>
          <textarea
            id="hours"
            value={form.hours}
            onChange={(e) => update("hours", e.target.value)}
            placeholder="טרם הוזן"
            rows={4}
          />
        </div>

        <div className="field">
          <label htmlFor="facebook_url">קישור לפייסבוק</label>
          <input
            id="facebook_url"
            type="url"
            value={form.facebook_url}
            onChange={(e) => update("facebook_url", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field">
          <label htmlFor="instagram_url">קישור לאינסטגרם</label>
          <input
            id="instagram_url"
            type="url"
            value={form.instagram_url}
            onChange={(e) => update("instagram_url", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field">
          <label htmlFor="years_in_business">שנות ותק</label>
          <input
            id="years_in_business"
            type="number"
            min={0}
            value={form.years_in_business}
            onChange={(e) => update("years_in_business", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field">
          <label htmlFor="projects_count">מספר פרויקטים שהושלמו</label>
          <input
            id="projects_count"
            type="number"
            min={0}
            value={form.projects_count}
            onChange={(e) => update("projects_count", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field">
          <label htmlFor="warranty_years">שנות אחריות</label>
          <input
            id="warranty_years"
            type="number"
            min={0}
            value={form.warranty_years}
            onChange={(e) => update("warranty_years", e.target.value)}
            placeholder="טרם הוזן"
          />
        </div>

        <div className="field full">
          <style>{`.sf-ic { width: 15px; height: 15px; } .sf-ic-xl { width: 32px; height: 32px; opacity: .5; margin-bottom: 10px; }`}</style>
          <label>לוגו האתר (אופציונלי — אם לא תעלו, יוצג סמל המותג המובנה)</label>
          <div className="aupload" onClick={() => logoInputRef.current?.click()}>
            {form.logo_url ? (
              <img src={form.logo_url} alt="תצוגה מקדימה" style={{ maxHeight: 60, width: "auto" }} />
            ) : (
              <IconPhoto className="sf-ic-xl" />
            )}
            <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <IconUpload className="sf-ic" />
              {uploadingLogo ? "מעלה לוגו…" : form.logo_url ? "החלף לוגו" : "לחצו להעלאת לוגו"}
            </div>
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChosen} />
        </div>
      </div>

      <div className="aform-actions">
        <button type="button" className="abtn abtn-gold" onClick={handleSave} disabled={saving}>
          {saving ? "שומר…" : "שמירה"}
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

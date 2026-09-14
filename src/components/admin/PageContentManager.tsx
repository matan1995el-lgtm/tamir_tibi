"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { validateImageFile } from "@/lib/upload-guards";
import { IconPhoto, IconUpload } from "@/components/Icons";
import type { AboutContent, ContactContent, HomeContent } from "@/lib/site-data";

type PageKey = "home" | "about" | "contact";

type AllContent = {
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
};

type Toast = { id: number; kind: "ok" | "err"; text: string };

const TABS: { key: PageKey; label: string }[] = [
  { key: "home", label: "עמוד הבית" },
  { key: "about", label: "אודות" },
  { key: "contact", label: "צור קשר" },
];

// One shared image-upload control, reused for the two content images
// (home "מי אנחנו" circle + about "הדרך שלנו" circle) — same storage
// bucket/pattern GalleryManager already uses, under a content/ prefix.
function ImageField({
  label,
  value,
  onChange,
  toast,
}: {
  label: string;
  value: string | undefined;
  onChange: (url: string) => void;
  toast: (kind: "ok" | "err", text: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      toast("err", validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `content/${crypto.randomUUID()}-${file.name}`;
      const { data, error } = await supabase.storage.from("gallery").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("gallery").getPublicUrl(data.path);
      onChange(pub.publicUrl);
      toast("ok", "התמונה הועלתה בהצלחה");
    } catch (err) {
      toast("err", "שגיאה בהעלאת התמונה");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="field full">
      <style>{`.pcm-ic { width: 15px; height: 15px; } .pcm-ic-xl { width: 32px; height: 32px; opacity: .5; margin-bottom: 10px; }`}</style>
      <label>{label}</label>
      <div
        className="aupload"
        role="button"
        tabIndex={0}
        aria-label="לחצו להעלאת תמונה"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        {value ? <img src={value} alt="תצוגה מקדימה" /> : <IconPhoto className="pcm-ic-xl" />}
        <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <IconUpload className="pcm-ic" />
          {uploading ? "מעלה תמונה…" : value ? "החלף תמונה" : "לחצו להעלאת תמונה (אופציונלי)"}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChosen} />
    </div>
  );
}

export default function PageContentManager({ initialContent }: { initialContent: AllContent }) {
  const [tab, setTab] = useState<PageKey>("home");
  const [content, setContent] = useState<AllContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(kind: "ok" | "err", text: string) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  function updateField<K extends PageKey>(page: K, key: keyof AllContent[K], value: string) {
    setContent((prev) => ({ ...prev, [page]: { ...prev[page], [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("page_content")
        .update({ data: content[tab], updated_at: new Date().toISOString() })
        .eq("page", tab);
      if (error) throw error;
      pushToast("ok", "התוכן נשמר בהצלחה ויופיע באתר תוך מספר דקות");
    } catch (err) {
      pushToast("err", "לא ניתן היה לשמור את השינויים. בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const home = content.home;
  const about = content.about;
  const contact = content.contact;

  return (
    <>
      <div className="admin-panel">
        <div className="admin-tabs" style={{ display: "flex", gap: 8, marginBottom: 18, borderBottom: "1px solid var(--line-2)", paddingBottom: 12 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`abtn abtn-sm ${tab === t.key ? "abtn-gold" : "abtn-ghost"}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "home" && (
          <div className="aform-grid">
            <div className="field">
              <label htmlFor="h-eyebrow">תווית מעל הכותרת</label>
              <input id="h-eyebrow" type="text" value={home.hero_eyebrow ?? ""} onChange={(e) => updateField("home", "hero_eyebrow", e.target.value)} placeholder="אלומיניום ומתכת בגימור פרימיום" />
            </div>
            <div className="field">
              <label htmlFor="h-accent">מילת הדגשה בכותרת (בזהב)</label>
              <input id="h-accent" type="text" value={home.hero_title_accent ?? ""} onChange={(e) => updateField("home", "hero_title_accent", e.target.value)} placeholder="אחרת" />
            </div>
            <div className="field full">
              <label htmlFor="h-title">כותרת ראשית (ה-Hero)</label>
              <input id="h-title" type="text" value={home.hero_title_main ?? ""} onChange={(e) => updateField("home", "hero_title_main", e.target.value)} placeholder="Metaline — פתרונות אלומיניום ומתכת ברמה" />
            </div>
            <div className="field full">
              <label htmlFor="h-lead">תת-כותרת (ה-Hero)</label>
              <textarea id="h-lead" rows={3} value={home.hero_lead ?? ""} onChange={(e) => updateField("home", "hero_lead", e.target.value)} placeholder="שערים חשמליים, מעקות אלומיניום ופרגולות מתכת…" />
            </div>
            <div className="field full">
              <label htmlFor="h-about-title">כותרת אזור &quot;מי אנחנו&quot;</label>
              <input id="h-about-title" type="text" value={home.about_title ?? ""} onChange={(e) => updateField("home", "about_title", e.target.value)} placeholder="דיוק, אמינות ועבודה שנשארת לאורך שנים" />
            </div>
            <div className="field full">
              <label htmlFor="h-about-body">טקסט אזור &quot;מי אנחנו&quot;</label>
              <textarea id="h-about-body" rows={4} value={home.about_body ?? ""} onChange={(e) => updateField("home", "about_body", e.target.value)} placeholder="Metaline מתמחה בייצור והתקנה…" />
            </div>
            <ImageField label="תמונה במעגל &quot;מי אנחנו&quot; (אופציונלי — אם לא תעלו, יוצג סמל המותג)" value={home.about_image_url} onChange={(url) => updateField("home", "about_image_url", url)} toast={pushToast} />
            <div className="field full">
              <label htmlFor="h-cta-title">כותרת הבאנר התחתון</label>
              <input id="h-cta-title" type="text" value={home.cta_title ?? ""} onChange={(e) => updateField("home", "cta_title", e.target.value)} placeholder="בואו נתכנן יחד את הפרויקט הבא שלכם" />
            </div>
            <div className="field full">
              <label htmlFor="h-cta-body">טקסט הבאנר התחתון</label>
              <textarea id="h-cta-body" rows={2} value={home.cta_body ?? ""} onChange={(e) => updateField("home", "cta_body", e.target.value)} placeholder="השאירו פרטים ונחזור אליכם…" />
            </div>
          </div>
        )}

        {tab === "about" && (
          <div className="aform-grid">
            <div className="field full">
              <label htmlFor="a-title">כותרת ראשית</label>
              <input id="a-title" type="text" value={about.hero_title ?? ""} onChange={(e) => updateField("about", "hero_title", e.target.value)} placeholder="הסיפור שמאחורי Metaline" />
            </div>
            <div className="field full">
              <label htmlFor="a-lead">תת-כותרת</label>
              <textarea id="a-lead" rows={2} value={about.hero_lead ?? ""} onChange={(e) => updateField("about", "hero_lead", e.target.value)} placeholder="עסק משפחתי שהפך לשם דבר…" />
            </div>
            <div className="field full">
              <label htmlFor="a-story-title">כותרת &quot;הדרך שלנו&quot; (השאירו ריק לחישוב אוטומטי משנות הוותק בהגדרות)</label>
              <input id="a-story-title" type="text" value={about.story_title ?? ""} onChange={(e) => updateField("about", "story_title", e.target.value)} placeholder="ריק = חישוב אוטומטי" />
            </div>
            <div className="field full">
              <label htmlFor="a-body1">פסקה ראשונה</label>
              <textarea id="a-body1" rows={4} value={about.story_body_1 ?? ""} onChange={(e) => updateField("about", "story_body_1", e.target.value)} placeholder="Metaline הוקמה מתוך אמונה…" />
            </div>
            <div className="field full">
              <label htmlFor="a-body2">פסקה שנייה</label>
              <textarea id="a-body2" rows={4} value={about.story_body_2 ?? ""} onChange={(e) => updateField("about", "story_body_2", e.target.value)} placeholder="הצוות שלנו מלווה כל פרויקט אישית…" />
            </div>
            <ImageField label="תמונה במעגל (אופציונלי — אם לא תעלו, יוצג סמל המותג)" value={about.story_image_url} onChange={(url) => updateField("about", "story_image_url", url)} toast={pushToast} />
          </div>
        )}

        {tab === "contact" && (
          <div className="aform-grid">
            <div className="field full">
              <label htmlFor="c-title">כותרת ראשית</label>
              <input id="c-title" type="text" value={contact.hero_title ?? ""} onChange={(e) => updateField("contact", "hero_title", e.target.value)} placeholder="צרו קשר" />
            </div>
            <div className="field full">
              <label htmlFor="c-lead">תת-כותרת</label>
              <textarea id="c-lead" rows={2} value={contact.hero_lead ?? ""} onChange={(e) => updateField("contact", "hero_lead", e.target.value)} placeholder="השאירו פרטים ונחזור אליכם…" />
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
              פרטי הטלפון, האימייל, הכתובת ושעות הפעילות בעמוד זה מגיעים מעמוד &quot;הגדרות&quot;.
            </p>
          </div>
        )}

        <div className="aform-actions">
          <button type="button" className="abtn abtn-gold" onClick={handleSave} disabled={saving}>
            {saving ? "שומר…" : "שמירת שינויים"}
          </button>
        </div>
      </div>

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

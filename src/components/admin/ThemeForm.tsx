"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { IconCheck } from "@/components/Icons";
import { FONT_STACKS, type FontPair } from "@/lib/site-data";

type SiteTheme = {
  accent_color: string;
  accent_color_2: string;
  font_pair: string;
  updated_at: string | null;
};

type Toast = { id: number; text: string; type: "ok" | "err" };

const COLOR_PRESETS: { key: string; label: string; accent: string; accent2: string }[] = [
  { key: "gold", label: "זהב קלאסי", accent: "#D4AF37", accent2: "#F0D074" },
  { key: "steel", label: "כחול פלדה", accent: "#3B82F6", accent2: "#93C5FD" },
  { key: "copper", label: "נחושת", accent: "#C2703D", accent2: "#E8A870" },
  { key: "emerald", label: "ירוק אמרלד", accent: "#1F9D6C", accent2: "#6FDBAA" },
];

const FONT_LABELS: Record<FontPair, { label: string; sample: string }> = {
  classic: { label: "קלאסי — Rubik / Heebo", sample: "מטאליין — אלומיניום ומתכת" },
  modern: { label: "מודרני — Assistant", sample: "מטאליין — אלומיניום ומתכת" },
  elegant: { label: "אלגנטי — Secular One / Assistant", sample: "מטאליין — אלומיניום ומתכת" },
};

// Lightens a #rrggbb hex color toward white by `amount` (0–1) — used to
// derive the secondary accent shade automatically when the client picks a
// fully custom color, so they only have to choose one color, not two.
function lighten(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  const [r, g, b] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

function matchesPreset(accent: string): string | null {
  const found = COLOR_PRESETS.find((p) => p.accent.toLowerCase() === accent.toLowerCase());
  return found?.key ?? null;
}

export default function ThemeForm({ initialTheme }: { initialTheme: SiteTheme | null }) {
  const [accent, setAccent] = useState(initialTheme?.accent_color ?? "#D4AF37");
  const [accent2, setAccent2] = useState(initialTheme?.accent_color_2 ?? "#F0D074");
  const [fontPair, setFontPair] = useState<FontPair>(() => {
    const p = initialTheme?.font_pair;
    return p && p in FONT_STACKS ? (p as FontPair) : "classic";
  });
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeq = useRef(0);

  const activePreset = matchesPreset(accent);

  function pushToast(text: string, type: Toast["type"]) {
    toastSeq.current += 1;
    const id = toastSeq.current;
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  function pickPreset(preset: (typeof COLOR_PRESETS)[number]) {
    setAccent(preset.accent);
    setAccent2(preset.accent2);
  }

  function pickCustomColor(hex: string) {
    setAccent(hex);
    setAccent2(lighten(hex, 0.45));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("site_theme")
        .update({ accent_color: accent, accent_color_2: accent2, font_pair: fontPair, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
      pushToast("העיצוב נשמר — יופיע באתר תוך דקה", "ok");
    } catch {
      pushToast("שגיאה בשמירה, נסו שוב", "err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>גוון צבע ראשי</h2>
      </div>

      <div className="theme-swatch-row">
        {COLOR_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`theme-swatch${activePreset === p.key ? " active" : ""}`}
            style={{ background: `linear-gradient(155deg, ${p.accent2}, ${p.accent} 70%)` }}
            onClick={() => pickPreset(p)}
            title={p.label}
          >
            {activePreset === p.key && <IconCheck className="theme-swatch-check" />}
          </button>
        ))}
        <label className="theme-swatch theme-swatch-custom" title="צבע מותאם אישית">
          <input
            type="color"
            value={accent}
            onChange={(e) => pickCustomColor(e.target.value)}
            style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }}
          />
          {!activePreset ? <span style={{ background: accent, width: "100%", height: "100%", borderRadius: "inherit", display: "block" }} /> : "+"}
        </label>
      </div>
      <div className="theme-swatch-labels">
        {COLOR_PRESETS.map((p) => (
          <span key={p.key}>{p.label}</span>
        ))}
        <span>מותאם אישית</span>
      </div>

      <div className="admin-panel-head" style={{ marginTop: 30 }}>
        <h2>גופנים</h2>
      </div>

      <div className="theme-font-grid">
        {(Object.keys(FONT_LABELS) as FontPair[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`theme-font-card${fontPair === key ? " active" : ""}`}
            onClick={() => setFontPair(key)}
          >
            <span className="theme-font-sample" style={{ fontFamily: FONT_STACKS[key].heading }}>
              {FONT_LABELS[key].sample}
            </span>
            <span className="theme-font-label">{FONT_LABELS[key].label}</span>
            {fontPair === key && <IconCheck className="theme-font-check" />}
          </button>
        ))}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type A11yState = {
  fontScale: 0 | 1 | 2 | 3;
  contrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  pauseAnim: boolean;
};

const DEFAULT_STATE: A11yState = {
  fontScale: 0,
  contrast: false,
  grayscale: false,
  underlineLinks: false,
  readableFont: false,
  pauseAnim: false,
};

const STORAGE_KEY = "metaline-a11y";

const CLASS_MAP: Partial<Record<keyof A11yState, string>> = {
  contrast: "a11y-contrast",
  grayscale: "a11y-grayscale",
  underlineLinks: "a11y-underline-links",
  readableFont: "a11y-readable-font",
  pauseAnim: "a11y-pause-anim",
};

function applyState(state: A11yState) {
  const root = document.documentElement;
  (Object.keys(CLASS_MAP) as (keyof A11yState)[]).forEach((key) => {
    const cls = CLASS_MAP[key];
    if (!cls) return;
    root.classList.toggle(cls, Boolean(state[key]));
  });
  if (state.fontScale > 0) {
    root.setAttribute("data-a11y-fontscale", String(state.fontScale));
  } else {
    root.removeAttribute("data-a11y-fontscale");
  }
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // localStorage doesn't exist during server render, so this one-time
    // hydration read can only happen in an effect after mount — there's no
    // way to have this value during the initial render itself.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULT_STATE, ...JSON.parse(raw) } as A11yState;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from a browser-only store, see comment above
        setState(parsed);
        applyState(parsed);
      }
    } catch {
      // localStorage unavailable — proceed with defaults
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyState(state);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // best-effort persistence only
    }
  }, [state, ready]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(key: keyof A11yState) {
    setState((s) => ({ ...s, [key]: !s[key] }));
  }

  function changeFont(dir: 1 | -1) {
    setState((s) => {
      const next = Math.min(3, Math.max(0, s.fontScale + dir)) as A11yState["fontScale"];
      return { ...s, fontScale: next };
    });
  }

  function reset() {
    setState(DEFAULT_STATE);
  }

  return (
    <>
      <button
        type="button"
        className="a11y-fab"
        aria-label="תפריט נגישות"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Standard international accessibility symbol (the ISA wheelchair
            pictogram), built from simple stroked primitives so it stays
            crisp and unmistakably recognizable at this size — deliberately
            the well-known mark rather than a custom one. */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="14" cy="4.5" r="1.7" fill="currentColor" stroke="none" />
          <path d="M13 8v3.2h4.2" />
          <path d="M13 11.2l-2.3 3.8" />
          <path d="M10.7 15c-2 0-3.6 1.6-3.6 3.6s1.6 3.6 3.6 3.6c1.7 0 3.1-1.15 3.5-2.7" />
          <path d="M13 11.2l2 8.6h2.6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="a11y-panel-overlay" onClick={() => setOpen(false)} />
          <div className="a11y-panel" role="dialog" aria-modal="true" aria-label="הגדרות נגישות">
            <div className="a11y-panel-head">
              <h3>הגדרות נגישות</h3>
              <button type="button" className="a11y-panel-close" aria-label="סגירה" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <div className="a11y-row">
              <span>גודל טקסט</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="btn-ghost btn" style={{ padding: "4px 12px", fontSize: 13 }} onClick={() => changeFont(-1)} aria-label="הקטן טקסט">
                  א-
                </button>
                <button type="button" className="btn-ghost btn" style={{ padding: "4px 12px", fontSize: 13 }} onClick={() => changeFont(1)} aria-label="הגדל טקסט">
                  א+
                </button>
              </div>
            </div>

            <div className="a11y-row">
              <span>ניגודיות גבוהה</span>
              <button type="button" className={`a11y-toggle${state.contrast ? " on" : ""}`} role="switch" aria-checked={state.contrast} onClick={() => toggle("contrast")}>
                <span className="knob" />
              </button>
            </div>

            <div className="a11y-row">
              <span>גווני אפור</span>
              <button type="button" className={`a11y-toggle${state.grayscale ? " on" : ""}`} role="switch" aria-checked={state.grayscale} onClick={() => toggle("grayscale")}>
                <span className="knob" />
              </button>
            </div>

            <div className="a11y-row">
              <span>הדגשת קישורים</span>
              <button type="button" className={`a11y-toggle${state.underlineLinks ? " on" : ""}`} role="switch" aria-checked={state.underlineLinks} onClick={() => toggle("underlineLinks")}>
                <span className="knob" />
              </button>
            </div>

            <div className="a11y-row">
              <span>גופן קריא</span>
              <button type="button" className={`a11y-toggle${state.readableFont ? " on" : ""}`} role="switch" aria-checked={state.readableFont} onClick={() => toggle("readableFont")}>
                <span className="knob" />
              </button>
            </div>

            <div className="a11y-row">
              <span>עצירת אנימציות</span>
              <button type="button" className={`a11y-toggle${state.pauseAnim ? " on" : ""}`} role="switch" aria-checked={state.pauseAnim} onClick={() => toggle("pauseAnim")}>
                <span className="knob" />
              </button>
            </div>

            <button type="button" className="a11y-reset" onClick={reset}>
              איפוס הגדרות
            </button>

            <p className="a11y-panel-foot">
              לפרטים נוספים ראו את{" "}
              <Link href="/accessibility">הצהרת הנגישות</Link> שלנו.
            </p>
          </div>
        </>
      )}
    </>
  );
}

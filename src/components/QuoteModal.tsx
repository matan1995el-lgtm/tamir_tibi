"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type QuoteModalContextValue = {
  open: (service?: string) => void;
  close: () => void;
};

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null);

export function useQuoteModal() {
  const ctx = useContext(QuoteModalContext);
  if (!ctx) {
    throw new Error("useQuoteModal must be used within QuoteModalProvider");
  }
  return ctx;
}

const SERVICE_OPTIONS = [
  "שער חשמלי",
  "מעקה אלומיניום",
  "פרגולה",
  "מחיצת מתכת",
  "אחר",
];

type Status = "idle" | "sending" | "ok" | "err";

export function QuoteModalProvider({
  children,
  contactFallback,
}: {
  children: React.ReactNode;
  /** e.g. "בטלפון 03-1234567" — shown in the error message so a visitor whose
   * submission failed has a real way to reach us, instead of a bracket
   * placeholder. Omit when no phone/WhatsApp is set yet in the admin panel. */
  contactFallback?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetService, setPresetService] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Status>("idle");
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((service?: string) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setPresetService(service);
    setStatus("idle");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (status === "sending") return;
    setIsOpen(false);
    triggerRef.current?.focus?.();
  }, [status]);

  // Escape closes the modal, and background scroll is locked while it's
  // open — a modal that lets the page scroll behind it (or that traps you
  // with no keyboard way out) is a real usability paper cut.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [isOpen, close]);

  const value = useMemo(() => ({ open, close }), [open, close]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      service: String(data.get("service") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <QuoteModalContext.Provider value={value}>
      {children}
      {isOpen && (
        <div className="qmodal-overlay" onClick={close} role="presentation">
          <div
            className="qmodal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qmodal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="qmodal-close" aria-label="סגירה" onClick={close}>
              ×
            </button>

            <span className="eyebrow">קבלת הצעת מחיר</span>
            <h3 id="qmodal-title">ספרו לנו על הפרויקט שלכם</h3>
            <p className="qmodal-sub">נחזור אליכם בהקדם עם הצעת מחיר מותאמת אישית, ללא התחייבות.</p>

            {status === "ok" ? (
              <div className="form-status ok" style={{ marginTop: 18 }}>
                תודה! קיבלנו את הפנייה ונחזור אליכם בהקדם.
              </div>
            ) : (
              <form className="contact-form" onSubmit={onSubmit} style={{ marginTop: 18 }}>
                {/* Honeypot — see ContactForm.tsx for the full explanation;
                    checked server-side in /api/contact. */}
                <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
                  <label htmlFor="qm-website">אל תמלאו שדה זה</label>
                  <input id="qm-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="field">
                  <label htmlFor="qm-name">שם מלא *</label>
                  <input ref={firstFieldRef} id="qm-name" name="name" type="text" required placeholder="השם שלכם" />
                </div>
                <div className="field">
                  <label htmlFor="qm-phone">טלפון *</label>
                  <input id="qm-phone" name="phone" type="tel" required placeholder="05X-XXXXXXX" />
                </div>
                <div className="field">
                  <label htmlFor="qm-email">אימייל</label>
                  <input id="qm-email" name="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label htmlFor="qm-service">סוג הפרויקט</label>
                  <select id="qm-service" name="service" defaultValue={presetService ?? ""}>
                    <option value="" disabled>
                      בחרו שירות
                    </option>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="qm-message">ספרו לנו קצת על הפרויקט</label>
                  <textarea id="qm-message" name="message" placeholder="מיקום, מידות משוערות, מועד רצוי..." />
                </div>

                {status === "err" && (
                  <div className="form-status err">
                    משהו השתבש בשליחה. אפשר לנסות שוב{contactFallback ? `, או לפנות אלינו ${contactFallback}` : "."}
                  </div>
                )}

                <button type="submit" className="btn btn-gold" disabled={status === "sending"}>
                  {status === "sending" ? "שולח..." : "שליחת פנייה"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </QuoteModalContext.Provider>
  );
}

/**
 * Drop-in replacement for a <Link className="btn ..."> that instead opens
 * the quote-request modal. Pass `service` to preselect the project type
 * (e.g. from a specific service card).
 */
export function QuoteButton({
  className,
  style,
  service,
  onOpen,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  service?: string;
  /** Extra handler fired alongside opening the modal (e.g. to close a mobile menu). */
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  const { open } = useQuoteModal();
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => {
        open(service);
        onOpen?.();
      }}
    >
      {children}
    </button>
  );
}

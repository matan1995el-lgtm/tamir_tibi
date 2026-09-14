"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isValidPhone } from "@/lib/phone";
import { SERVICE_SLUG_LABELS, isServiceSlug, type ServiceSlug } from "@/lib/service-catalog";

type QuoteModalContextValue = {
  /** Pass a canonical ServiceSlug (see service-catalog.ts) to preselect
   * that service in the form — never a free-text label, which could
   * silently stop matching if a service gets renamed in the admin panel. */
  open: (service?: ServiceSlug) => void;
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

const SERVICE_OPTIONS = [...Object.values(SERVICE_SLUG_LABELS), "אחר"];

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
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  // Stable across retries of the same submit attempt — see ContactForm.tsx
  // for the full explanation of why this prevents duplicate leads.
  const idempotencyKey = useRef<string>(crypto.randomUUID());

  const open = useCallback((service?: ServiceSlug) => {
    triggerRef.current = document.activeElement as HTMLElement;
    // Resolve the canonical slug to the display label the <select> option
    // actually uses — matched by a fixed id, not by the service's
    // editable title, so a rename in the admin panel can't break this.
    setPresetService(isServiceSlug(service) ? SERVICE_SLUG_LABELS[service] : undefined);
    setStatus("idle");
    setPhoneError(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    // Closing while a submission is in flight is allowed — the request
    // already reached the network and isn't aborted just because the
    // dialog closes, so there's no risk of losing the lead. Previously
    // this was blocked while status === "sending", which could trap a
    // visitor in the dialog with no way out if the request hung (slow/
    // flaky connection, no timeout at the time).
    setIsOpen(false);
    triggerRef.current?.focus?.();
  }, []);

  // Escape closes the modal, background scroll is locked while it's open,
  // and Tab is trapped inside the dialog — without the trap, Tab/Shift+Tab
  // eventually walks focus out into the page behind the overlay, which is
  // both confusing (focus visibly leaves the dialog you're still looking
  // at) and a real keyboard-only-user dead end (you can act on background
  // links/buttons you can't see under the overlay).
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function getFocusable(): HTMLElement[] {
      if (!modalRef.current) return [];
      return Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!modalRef.current?.contains(active)) {
        // Focus somehow ended up outside the dialog (e.g. a browser
        // extension or async focus change) — pull it back in.
        e.preventDefault();
        first.focus();
      }
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
    const form = e.currentTarget;
    const data = new FormData(form);
    const phone = String(data.get("phone") ?? "");
    if (!isValidPhone(phone)) {
      setPhoneError("מספר הטלפון לא נראה תקין. אפשר עם או בלי מקף, למשל 054-9499280.");
      return;
    }
    setPhoneError(null);
    setStatus("sending");
    const payload = {
      name: String(data.get("name") ?? ""),
      phone,
      email: String(data.get("email") ?? ""),
      service: String(data.get("service") ?? ""),
      area: String(data.get("area") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
      idempotency_key: idempotencyKey.current,
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
      form.reset();
      idempotencyKey.current = crypto.randomUUID();
    } catch {
      // Key intentionally NOT regenerated — see ContactForm.tsx.
      setStatus("err");
    }
  }

  return (
    <QuoteModalContext.Provider value={value}>
      {children}
      {isOpen && (
        <div className="qmodal-overlay" onClick={close} role="presentation">
          <div
            ref={modalRef}
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
                  <input ref={firstFieldRef} id="qm-name" name="name" type="text" required placeholder="השם שלכם" autoComplete="name" />
                </div>
                <div className="field">
                  <label htmlFor="qm-phone">טלפון *</label>
                  <input
                    id="qm-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="05X-XXXXXXX"
                    autoComplete="tel"
                    aria-invalid={phoneError ? true : undefined}
                    aria-describedby={phoneError ? "qm-phone-error" : undefined}
                    onChange={() => phoneError && setPhoneError(null)}
                  />
                  {phoneError && (
                    <span id="qm-phone-error" className="field-error" role="alert">
                      {phoneError}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="qm-email">אימייל</label>
                  <input id="qm-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
                </div>
                <div className="field">
                  <label htmlFor="qm-area">יישוב / אזור ביצוע</label>
                  <input id="qm-area" name="area" type="text" placeholder="למשל: ראשון לציון" autoComplete="address-level2" />
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
 * the quote-request modal. Pass `service` (a canonical ServiceSlug — see
 * service-catalog.ts) to preselect the project type, e.g. from a specific
 * service page. Not every service in the DB has one of these 4 core
 * slugs (design/installation/maintenance don't) — pass nothing for those
 * and the form falls back to "בחרו שירות" rather than guessing.
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
  service?: ServiceSlug;
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

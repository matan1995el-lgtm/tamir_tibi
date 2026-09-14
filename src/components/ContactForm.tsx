"use client";

import { useRef, useState } from "react";
import { isValidPhone } from "@/lib/phone";
import { SERVICE_SLUG_LABELS } from "@/lib/service-catalog";

type Status = "idle" | "sending" | "ok" | "err";

export default function ContactForm({ contactFallback }: { contactFallback?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  // Stable across retries of the SAME submit attempt (network failure ->
  // user clicks "try again") so the server can recognize a retry instead
  // of saving a second lead — regenerated only after a successful send.
  const idempotencyKey = useRef<string>(crypto.randomUUID());

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
      // Deliberately NOT regenerating the idempotency key here — a retry
      // of this same attempt should carry the same key, so if the first
      // request actually reached the server despite the client seeing a
      // failure/timeout, the retry is recognized server-side instead of
      // creating a second lead.
      setStatus("err");
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      {/* Honeypot — real visitors never see this field (visually hidden,
          skipped by tab order) or fill it; a bot that blindly fills every
          input in the form trips it. Checked server-side in /api/contact. */}
      <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
        <label htmlFor="website">אל תמלאו שדה זה</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="name">שם מלא *</label>
        <input id="name" name="name" type="text" required placeholder="השם שלכם" autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="phone">טלפון *</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="05X-XXXXXXX"
          autoComplete="tel"
          aria-invalid={phoneError ? true : undefined}
          aria-describedby={phoneError ? "phone-error" : undefined}
          onChange={() => phoneError && setPhoneError(null)}
        />
        {phoneError && (
          <span id="phone-error" className="field-error" role="alert">
            {phoneError}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="email">אימייל</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="area">יישוב / אזור ביצוע</label>
        <input id="area" name="area" type="text" placeholder="למשל: ראשון לציון" autoComplete="address-level2" />
      </div>
      <div className="field">
        <label htmlFor="service">סוג הפרויקט</label>
        <select id="service" name="service" defaultValue="">
          <option value="" disabled>
            בחרו שירות
          </option>
          {Object.values(SERVICE_SLUG_LABELS).map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
          <option value="אחר">אחר</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="message">ספרו לנו קצת על הפרויקט</label>
        <textarea id="message" name="message" placeholder="מיקום, מידות משוערות, מועד רצוי..." />
      </div>

      {status === "ok" && (
        <div className="form-status ok">תודה! קיבלנו את הפנייה ונחזור אליכם בהקדם.</div>
      )}
      {status === "err" && (
        <div className="form-status err">
          משהו השתבש בשליחה. אפשר לנסות שוב{contactFallback ? `, או לפנות אלינו ${contactFallback}` : " בעוד רגע, או לפנות אלינו דרך פרטי הקשר שבעמוד זה"}.
        </div>
      )}

      <button type="submit" className="btn btn-gold" disabled={status === "sending"}>
        {status === "sending" ? "שולח..." : "שליחת פנייה"}
      </button>
    </form>
  );
}

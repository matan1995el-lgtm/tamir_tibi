"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "err";

export default function ContactForm({ contactFallback }: { contactFallback?: string }) {
  const [status, setStatus] = useState<Status>("idle");

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
        <input id="name" name="name" type="text" required placeholder="השם שלכם" />
      </div>
      <div className="field">
        <label htmlFor="phone">טלפון *</label>
        <input id="phone" name="phone" type="tel" required placeholder="05X-XXXXXXX" />
      </div>
      <div className="field">
        <label htmlFor="email">אימייל</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="service">סוג הפרויקט</label>
        <select id="service" name="service" defaultValue="">
          <option value="" disabled>
            בחרו שירות
          </option>
          <option value="שער חשמלי">שער חשמלי</option>
          <option value="מעקה אלומיניום">מעקה אלומיניום</option>
          <option value="פרגולה">פרגולה</option>
          <option value="מחיצת מתכת">מחיצת מתכת</option>
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

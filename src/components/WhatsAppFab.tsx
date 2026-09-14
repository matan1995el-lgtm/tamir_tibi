"use client";

import { useEffect, useState } from "react";
import { useQuoteModal } from "@/components/QuoteModal";
import { IconFacebook, IconInstagram } from "@/components/Icons";
import { sanitizeHref } from "@/lib/link-safety";

function buildWaLink(raw: string): string {
  // Normalize an Israeli number (05X-XXXXXXX, 972-..., +972-...) into a
  // wa.me link. Falls back to a best-effort digits-only link for any
  // other format the admin might enter.
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("972")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/972${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2Zm5.8 14.11c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.07.18-.28.36-.23.6-.14.24.09 1.55.73 1.81.86.26.14.44.2.5.31.07.12.07.68-.17 1.36Z" />
  </svg>
);

const PHONE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 4h3.4l1.4 4.2-2 1.6a12.3 12.3 0 0 0 5.9 5.9l1.6-2 4.2 1.4v3.4c0 .9-.75 1.6-1.65 1.53C9.9 19.5 4.5 14.1 3.97 6.65 3.9 5.75 4.6 5 4.5 4Z" />
  </svg>
);

const MAIL_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4.5 7 7.5 5.5L19.5 7" />
  </svg>
);

// Generic "contact us" icon for the floating trigger button — it opens a
// menu of several channels (WhatsApp, phone, email, form), not WhatsApp
// specifically, so showing the WhatsApp glyph there would mislead a
// visitor into expecting a WhatsApp-only action (stage 4.1 of the
// remediation plan). The WhatsApp glyph (WA_ICON) is still used for the
// WhatsApp option inside the opened panel, where it's accurate.
const CONTACT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-4 3.5V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" />
    <circle cx="8.3" cy="11.3" r="1.05" fill="currentColor" stroke="none" />
    <circle cx="12" cy="11.3" r="1.05" fill="currentColor" stroke="none" />
    <circle cx="15.7" cy="11.3" r="1.05" fill="currentColor" stroke="none" />
  </svg>
);

const FORM_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
    <path d="M14 3.5V8h4" />
    <path d="M8.5 12.5h6M8.5 15.5h6M8.5 18h3.5" />
  </svg>
);

export default function WhatsAppFab({
  whatsapp,
  phone,
  email,
  facebookUrl,
  instagramUrl,
}: {
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  /** Both edited from the admin panel's "הגדרות" screen, same source as
   * the header/footer social icons — never hardcoded here. */
  facebookUrl?: string | null;
  instagramUrl?: string | null;
}) {
  const { open: openQuoteModal } = useQuoteModal();
  const [open, setOpen] = useState(false);
  const hasWhatsapp = !!whatsapp && whatsapp.trim().length > 0;
  const hasPhone = !!phone && phone.trim().length > 0;
  const hasEmail = !!email && email.trim().length > 0;
  const hasFacebook = !!facebookUrl && facebookUrl.trim().length > 0;
  const hasInstagram = !!instagramUrl && instagramUrl.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="fab"
        aria-label="דרכי יצירת קשר מהירות"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {CONTACT_ICON}
      </button>

      {open && (
        <>
          <div className="qa-panel-overlay" onClick={() => setOpen(false)} />
          <div className="qa-panel" role="dialog" aria-modal="true" aria-label="דרכי יצירת קשר מהירות">
            <div className="qa-panel-head">
              <h3>איך נוח לכם ליצור קשר?</h3>
              <button type="button" className="a11y-panel-close" aria-label="סגירה" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <div className="qa-grid">
              {hasWhatsapp ? (
                <a
                  className="qa-item qa-wa"
                  href={buildWaLink(whatsapp!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <span className="qa-ic">{WA_ICON}</span>
                  <span>וואטסאפ</span>
                </a>
              ) : (
                <span className="qa-item qa-disabled" title="מספר וואטסאפ טרם הוזן">
                  <span className="qa-ic">{WA_ICON}</span>
                  <span>וואטסאפ</span>
                </span>
              )}

              {hasPhone ? (
                <a className="qa-item qa-phone" href={`tel:${phone!.replace(/[^\d+]/g, "")}`} onClick={() => setOpen(false)}>
                  <span className="qa-ic">{PHONE_ICON}</span>
                  <span>חיוג ישיר</span>
                </a>
              ) : (
                <span className="qa-item qa-disabled" title="מספר טלפון טרם הוזן">
                  <span className="qa-ic">{PHONE_ICON}</span>
                  <span>חיוג ישיר</span>
                </span>
              )}

              {hasEmail ? (
                <a className="qa-item qa-mail" href={`mailto:${email}`} onClick={() => setOpen(false)}>
                  <span className="qa-ic">{MAIL_ICON}</span>
                  <span>מייל</span>
                </a>
              ) : (
                <span className="qa-item qa-disabled" title="כתובת מייל טרם הוזנה">
                  <span className="qa-ic">{MAIL_ICON}</span>
                  <span>מייל</span>
                </span>
              )}

              <button
                type="button"
                className="qa-item qa-form"
                onClick={() => {
                  setOpen(false);
                  openQuoteModal();
                }}
              >
                <span className="qa-ic">{FORM_ICON}</span>
                <span>טופס פנייה</span>
              </button>

              {hasFacebook ? (
                <a
                  className="qa-item qa-fb"
                  href={sanitizeHref(facebookUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <span className="qa-ic">
                    <IconFacebook />
                  </span>
                  <span>פייסבוק</span>
                </a>
              ) : (
                <span className="qa-item qa-disabled" title="קישור לפייסבוק טרם הוזן">
                  <span className="qa-ic">
                    <IconFacebook />
                  </span>
                  <span>פייסבוק</span>
                </span>
              )}

              {hasInstagram ? (
                <a
                  className="qa-item qa-ig"
                  href={sanitizeHref(instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <span className="qa-ic">
                    <IconInstagram />
                  </span>
                  <span>אינסטגרם</span>
                </a>
              ) : (
                <span className="qa-item qa-disabled" title="קישור לאינסטגרם טרם הוזן">
                  <span className="qa-ic">
                    <IconInstagram />
                  </span>
                  <span>אינסטגרם</span>
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

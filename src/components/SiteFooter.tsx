import Link from "next/link";
import Image from "next/image";
import { sanitizeHref } from "@/lib/link-safety";
import type { ServiceRow, SiteSettings } from "@/lib/site-data";

export default function SiteFooter({ settings, services }: { settings: SiteSettings; services: ServiceRow[] }) {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <div className="footer-brand">
            <Image src={settings.logo_url || "/brand/symbol-white.png"} alt="Metaline" width={28} height={28} />
            <span>Metaline</span>
          </div>
          <p className="desc">
            Metaline מתמחה בייצור והתקנה של שערים חשמליים, מעקות אלומיניום,
            פרגולות ומחיצות מתכת בגימור פרימיום — עבודה מדויקת מהתכנון ועד
            ההתקנה.
          </p>
        </div>
        <div>
          <h4>ניווט מהיר</h4>
          <ul>
            <li><Link href="/about">אודות</Link></li>
            <li><Link href="/services">שירותים</Link></li>
            <li><Link href="/gallery">גלריה</Link></li>
            <li><Link href="/contact">צור קשר</Link></li>
          </ul>
        </div>
        <div>
          <h4>שירותים</h4>
          <ul>
            {/* Driven by the real, admin-editable services table (not
                hardcoded slugs) — a service renamed or removed in the admin
                panel must never leave a dead link in the footer. */}
            {services.length > 0 ? (
              services.map((s) => (
                <li key={s.id}>
                  <Link href={`/services/${s.slug}`}>{s.title}</Link>
                </li>
              ))
            ) : (
              <li><Link href="/services">כל השירותים</Link></li>
            )}
          </ul>
        </div>
        <div>
          <h4>יצירת קשר</h4>
          <ul>
            <li className={settings.phone ? undefined : "placeholder"}>
              {settings.phone ? <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{settings.phone}</a> : "[להשלמה: טלפון]"}
            </li>
            <li className={settings.email ? undefined : "placeholder"}>
              {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : "[להשלמה: אימייל]"}
            </li>
            <li className={settings.address ? undefined : "placeholder"}>
              {settings.address ?? "[להשלמה: כתובת]"}
            </li>
            <li className={settings.hours ? undefined : "placeholder"}>
              {settings.hours ?? "[להשלמה: שעות פעילות]"}
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-legal">
        <Link href="/accessibility">הצהרת נגישות</Link>
        <span aria-hidden="true">•</span>
        <Link href="/privacy">מדיניות פרטיות</Link>
        <span aria-hidden="true">•</span>
        <Link href="/cookies">שימוש בעוגיות</Link>
      </div>

      {(settings.facebook_url || settings.instagram_url) && (
        <div className="container footer-social-row">
          <div className="footer-social">
            {settings.facebook_url && (
              <a href={sanitizeHref(settings.facebook_url)} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="#fff"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7C16.6 3.65 15.5 3.5 14.2 3.5c-2.7 0-4.5 1.65-4.5 4.65V10H7v3.1h2.7V21h3.8Z"/></svg>
              </a>
            )}
            {settings.instagram_url && (
              <a href={sanitizeHref(settings.instagram_url)} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r="1"/></svg>
              </a>
            )}
          </div>
        </div>
      )}

      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Metaline. כל הזכויות שמורות. אתר הוקם, עוצב ואופיין ע&quot;י{" "}
          <a href="https://www.panda-il.com" target="_blank" rel="noopener noreferrer">
            פנדה סוכנות דיגיטל
          </a>
        </span>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { IconPhone, IconMail, IconPin, IconClock } from "@/components/Icons";
import { GateDivider } from "@/components/HeroScene";
import { formatContactFallback, getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "צור קשר | Metaline",
  description: "השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת אישית לשער חשמלי, מעקה אלומיניום, פרגולה או מחיצת מתכת.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">בואו נדבר</span>
          <h1>צרו קשר</h1>
          <p>השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת אישית, ללא התחייבות.</p>
        </div>
      </section>

      <GateDivider />

      <section className="section">
        <div className="container contact-grid reveal-stagger">
          <ContactForm contactFallback={formatContactFallback(settings)} />
          <div className="contact-info">
            <div className="info-card">
              <div className="ico">
                <IconPhone />
              </div>
              <div>
                <h4>טלפון</h4>
                {settings.phone ? (
                  <p><a href={`tel:${settings.phone}`}>{settings.phone}</a></p>
                ) : (
                  <p className="placeholder">[להשלמה: מספר טלפון]</p>
                )}
              </div>
            </div>
            <div className="info-card">
              <div className="ico">
                <IconMail />
              </div>
              <div>
                <h4>אימייל</h4>
                {settings.email ? (
                  <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>
                ) : (
                  <p className="placeholder">[להשלמה: כתובת אימייל]</p>
                )}
              </div>
            </div>
            <div className="info-card">
              <div className="ico">
                <IconPin />
              </div>
              <div>
                <h4>כתובת</h4>
                <p className={settings.address ? undefined : "placeholder"}>
                  {settings.address ?? "[להשלמה: כתובת המשרד/המפעל]"}
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="ico">
                <IconClock />
              </div>
              <div>
                <h4>שעות פעילות</h4>
                <p className={settings.hours ? undefined : "placeholder"} style={{ whiteSpace: "pre-line" }}>
                  {settings.hours ?? "[להשלמה: שעות פעילות]"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { IconPhone, IconMail, IconPin, IconClock, IconWhatsapp, IconPhoneCall } from "@/components/Icons";
import { GateDivider } from "@/components/HeroScene";
import { formatContactFallback, getContactContent, getSiteSettings } from "@/lib/site-data";

function buildWaLink(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("972")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/972${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export const revalidate = 60;

export const metadata: Metadata = {
  // Root layout's title.template ("%s | Metaline") appends the brand —
  // a literal "| Metaline" here would double it up.
  title: "צור קשר",
  description: "השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת אישית לשער חשמלי, מעקה אלומיניום, פרגולה או מחיצת מתכת.",
};

export default async function ContactPage() {
  const [settings, content] = await Promise.all([getSiteSettings(), getContactContent()]);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">בואו נדבר</span>
          <h1>{content.hero_title || "צרו קשר"}</h1>
          <p>{content.hero_lead || "השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת אישית, ללא התחייבות."}</p>
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

            <div className="contact-quick">
              <h4>או פנו אלינו ישירות</h4>
              <div className="contact-quick-row">
                {settings.whatsapp ? (
                  <a
                    className="cq-item cq-wa"
                    href={buildWaLink(settings.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconWhatsapp />
                    <span>וואטסאפ</span>
                  </a>
                ) : (
                  <span className="cq-item cq-disabled" title="מספר וואטסאפ טרם הוזן">
                    <IconWhatsapp />
                    <span>וואטסאפ</span>
                  </span>
                )}
                {settings.phone ? (
                  <a className="cq-item cq-call" href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>
                    <IconPhoneCall />
                    <span>חייגו עכשיו</span>
                  </a>
                ) : (
                  <span className="cq-item cq-disabled" title="מספר טלפון טרם הוזן">
                    <IconPhoneCall />
                    <span>חייגו עכשיו</span>
                  </span>
                )}
                {settings.email ? (
                  <a className="cq-item cq-mail" href={`mailto:${settings.email}`}>
                    <IconMail />
                    <span>שלחו מייל</span>
                  </a>
                ) : (
                  <span className="cq-item cq-disabled" title="כתובת מייל טרם הוזנה">
                    <IconMail />
                    <span>שלחו מייל</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { GateDivider } from "@/components/HeroScene";
import { QuoteButton } from "@/components/QuoteModal";
import { getServices } from "@/lib/site-data";
import { getServiceIcon } from "@/lib/service-icons";

export const revalidate = 60;

export const metadata: Metadata = {
  // Root layout's title.template ("%s | Metaline") appends the brand —
  // a literal "| Metaline" here would double it up.
  title: "שירותים",
  description: "שערים חשמליים, מעקות אלומיניום, פרגולות ומחיצות מתכת, עיצוב, התקנה ותחזוקה — כל השירותים של Metaline.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">מה אנחנו עושים</span>
          <h1>שירותים מקצה לקצה</h1>
          <p>מתכנון ראשוני ובחירת חומרים, דרך ייצור מדויק ועד התקנה ותחזוקה שוטפת.</p>
        </div>
      </section>

      <GateDivider />

      <section className="section services">
        <div className="container">
          {services.length === 0 ? (
            <div className="aempty">
              <p>השירותים בדרך לכאן — נעדכן בקרוב. בינתיים אפשר לפנות אלינו ישירות.</p>
              <QuoteButton className="btn btn-gold">קבלו הצעת מחיר</QuoteButton>
            </div>
          ) : (
            <div className="svc-grid reveal-stagger">
              {services.map((s) => {
                const Icon = getServiceIcon(s.icon);
                return (
                  <div className="tilt-wrap" key={s.id}>
                    {/* This listing page's cards were plain <div>s with no
                        link — clicking one did nothing, unlike the identical
                        cards on the homepage, which correctly link through
                        to the service's own page. Matching that pattern here
                        fixes it: the whole card now navigates to
                        /services/[slug], where visitors can still request a
                        quote from that service's own CTA. */}
                    <Link href={`/services/${s.slug}`} className="svc-card">
                      <div className="svc-icon">
                        <Icon />
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.description}</p>
                      <span className="svc-link">לפרטים נוספים ←</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner reveal-stagger">
          <div>
            <span className="eyebrow">לא בטוחים מה מתאים לכם?</span>
            <h2>נשמח לייעץ ולהתאים פתרון לפרויקט שלכם</h2>
            <p>פנייה ראשונית ללא התחייבות — נחזור עם המלצה מקצועית והצעת מחיר.</p>
          </div>
          <div className="cta-actions">
            <QuoteButton className="btn btn-gold">צרו קשר</QuoteButton>
          </div>
        </div>
      </section>
    </>
  );
}

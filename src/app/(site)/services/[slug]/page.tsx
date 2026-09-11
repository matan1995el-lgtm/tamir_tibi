import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GateDivider } from "@/components/HeroScene";
import { QuoteButton } from "@/components/QuoteModal";
import { getServiceBySlug, getServices } from "@/lib/site-data";
import { getServiceIcon } from "@/lib/service-icons";
import { IconCheck } from "@/components/Icons";

export const revalidate = 60;

// Gallery category each service links out to (see /gallery's category
// filter). Services with no direct gallery category (design, installation,
// maintenance) fall back to a link into the unfiltered gallery.
const GALLERY_CATEGORY: Record<string, string> = {
  "electric-gates": "שערים חשמליים",
  "aluminum-railings": "מעקות אלומיניום",
  pergolas: "פרגולות",
  "metal-partitions": "מחיצות מתכת",
};

// Per-service "which type is right for me" comparison — the gate-type
// grid used to live on the homepage; it now lives on the page it's
// actually about. Same idea repeated for railings, on the railings page.
const TYPE_COMPARISON: Record<string, { heading: string; lead: string; items: { n: string; title: string; desc: string }[] }> = {
  "electric-gates": {
    heading: "איזה שער מתאים לי?",
    lead: "שני הפתרונות הנפוצים ביותר — הבחירה תלויה במבנה הפתח ובשטח הפנוי בחצר.",
    items: [
      { n: "01", title: "שער הזזה חשמלי", desc: "מתאים לרוחבי פתח גדולים ולשטחי חצר מוגבלים בעומק — תנועה חלקה על מסילה." },
      { n: "02", title: "שער ציר חשמלי", desc: "פתרון קלאסי לפתחים סימטריים, מראה מסורתי עם הנעה חשמלית שקטה ומהירה." },
    ],
  },
  "aluminum-railings": {
    heading: "איזה מעקה מתאים לי?",
    lead: "שני כיוונים עיצוביים מבוקשים — לפי הסגנון של הבית והתחושה שתרצו ליצור.",
    items: [
      { n: "01", title: "מעקה זכוכית ואלומיניום", desc: "שילוב שקוף ומודרני המדגיש נוף פתוח, עם מסגרת אלומיניום דקה ויציבה." },
      { n: "02", title: "מעקה עמודים אנכי", desc: "עיצוב נקי וקלאסי, עמיד ובטיחותי, מתאים למרפסות ולגגות בכל סגנון בית." },
    ],
  },
};

const ADVANTAGES = [
  "חומרים איכותיים וגימור עמיד לאורך שנים",
  "תכנון מותאם אישית לכל פרויקט",
  "צוות התקנה מקצועי ומנוסה",
  "אחריות מלאה על העבודה",
];

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.title} | Metaline`,
    description: service.description ?? undefined,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = getServiceIcon(service.icon);
  const comparison = TYPE_COMPARISON[slug];
  const galleryCategory = GALLERY_CATEGORY[slug];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="svc-icon" style={{ marginBottom: 20 }}>
            <Icon />
          </div>
          <span className="eyebrow">השירותים שלנו</span>
          <h1>{service.title}</h1>
          <p>{service.description}</p>
          <div className="hero-actions" style={{ marginTop: 28 }}>
            <QuoteButton className="btn btn-gold" service={service.title}>
              בקשו הצעת מחיר
            </QuoteButton>
            {galleryCategory && (
              <Link href={`/gallery?category=${encodeURIComponent(galleryCategory)}`} className="btn btn-ghost">
                לפרויקטים בתחום זה
              </Link>
            )}
          </div>
        </div>
      </section>

      <GateDivider />

      <section className="section tight">
        <div className="container about-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="about-text" style={{ maxWidth: 640 }}>
            <span className="eyebrow">למה Metaline</span>
            <h2>עבודה מדויקת מהתכנון ועד ההתקנה</h2>
            <div className="about-points">
              {ADVANTAGES.map((a) => (
                <div className="about-point" key={a}>
                  <IconCheck />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {comparison && (
        <section className="section tight compare">
          <div className="container">
            <div className="sec-head reveal">
              <span className="eyebrow">התאמה לצרכים שלכם</span>
              <h2>{comparison.heading}</h2>
              <p>{comparison.lead}</p>
            </div>
            <div className="cmp-grid reveal-stagger" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              {comparison.items.map((c) => (
                <div className="cmp-wrap" key={c.n}>
                  <div className="cmp-card">
                    <div className="cmp-num">{c.n}</div>
                    <h4>{c.title}</h4>
                    <p>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <span className="eyebrow">מוכנים להתחיל?</span>
            <h2>נשמח לשמוע על הפרויקט שלכם</h2>
            <p>השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת אישית, ללא התחייבות.</p>
          </div>
          <div className="cta-actions">
            <QuoteButton className="btn btn-gold" service={service.title}>
              קבלו הצעת מחיר
            </QuoteButton>
          </div>
        </div>
      </section>
    </>
  );
}

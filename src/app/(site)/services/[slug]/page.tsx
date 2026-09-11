import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GateDivider } from "@/components/HeroScene";
import { QuoteButton } from "@/components/QuoteModal";
import { getServiceBySlug, getServices, getSeoSettings } from "@/lib/site-data";
import { getServiceIcon } from "@/lib/service-icons";
import { IconCheck } from "@/components/Icons";

export const revalidate = 60;

// Gallery category each service links out to (see /gallery's category
// filter). Services with no dedicated gallery category (design,
// installation, maintenance are process/service offerings rather than a
// physical product category) fall back to no gallery link.
const GALLERY_CATEGORY: Record<string, string> = {
  "electric-gates": "שערים חשמליים",
  "aluminum-railings": "מעקות אלומיניום",
  pergolas: "פרגולות",
  "metal-partitions": "מחיצות מתכת",
};

// Extended, per-service editorial content: an intro paragraph specific to
// that service, a short list of concrete advantages (replacing the old
// one-size-fits-all list), and a small two-item comparison/feature block
// giving visitors a real decision aid (product services) or a clear
// picture of what's included (process services: design/installation/
// maintenance). Written specifically for Metaline, in original wording.
const SERVICE_CONTENT: Record<
  string,
  {
    intro: string;
    advantages: string[];
    compare: { heading: string; lead: string; items: { n: string; title: string; desc: string }[] };
  }
> = {
  "electric-gates": {
    intro:
      "שער חשמלי הוא לרוב קו ההגנה הראשון של הבית, ולכן איכות הייצור וההתקנה שלו משפיעים ישירות גם על הביטחון וגם על חווית השימוש היומיומית. אנו מייצרים ומתקינים שערי הזזה וציר חשמליים מפרופילי אלומיניום עמידים בפני קורוזיה, עם מנועים אמינים ומנגנוני בטיחות תקניים — עצירה אוטומטית במגע במכשול, גיבוי לניתוק חשמל ואפשרות שחרור ידני. ניתן לשלב בקרת גישה חכמה: שלט רחוק, לוח קוד, אפליקציה סלולרית או אינטרקום, בהתאם לצרכים שלכם.",
    advantages: [
      "מנועים אמינים בעלי אחריות יצרן, מותאמים למשקל ולתדירות השימוש בשער",
      "מנגנוני בטיחות תקניים — חיישני מכשול ועצירה אוטומטית",
      "אפשרות לשילוב בקרת גישה חכמה (שלט, קוד, אפליקציה, אינטרקום)",
      "גימור צבע בתנור עמיד לתנאי מזג אוויר ישראליים",
    ],
    compare: {
      heading: "איזה שער מתאים לי?",
      lead: "שני הפתרונות הנפוצים ביותר — הבחירה תלויה במבנה הפתח ובשטח הפנוי בחצר.",
      items: [
        { n: "01", title: "שער הזזה חשמלי", desc: "מתאים לרוחבי פתח גדולים ולשטחי חצר מוגבלים בעומק — תנועה חלקה על מסילה, ללא צורך ברדיוס פתיחה." },
        { n: "02", title: "שער ציר חשמלי", desc: "פתרון קלאסי לפתחים סימטריים, מראה מסורתי עם הנעה חשמלית שקטה ומהירה ואפשרות לפתיחה חלקית." },
      ],
    },
  },
  "aluminum-railings": {
    intro:
      "מעקה איכותי הוא גם אמצעי בטיחות מחייב וגם רכיב עיצובי מרכזי בחזות הבית. אנו מייצרים מעקות אלומיניום למרפסות, גגות, מדרגות ובריכות התואמים לתקן הישראלי לגובה ולעומס, בשילובי זכוכית מחוסמת, פסים אנכיים או עיצוב מותאם אישית — בכל גוון גימור לבחירתכם. אלומיניום נבחר בזכות משקלו הקל, עמידותו בפני חלודה ותחזוקתו הנמוכה יחסית למתכות אחרות, מה שהופך אותו לבחירה מובילה לפרויקטים חיצוניים בישראל.",
    advantages: [
      "עמידה בתקן הישראלי לגובה מעקה ועומס בטיחות",
      "עמידות גבוהה בפני קורוזיה ותנאי מזג אוויר לאורך שנים",
      "שילוב זכוכית מחוסמת, פסים אנכיים או עיצוב מותאם אישית",
      "משטח קל תחזוקה שאינו דורש צביעה חוזרת",
    ],
    compare: {
      heading: "איזה מעקה מתאים לי?",
      lead: "שני כיוונים עיצוביים מבוקשים — לפי הסגנון של הבית והתחושה שתרצו ליצור.",
      items: [
        { n: "01", title: "מעקה זכוכית ואלומיניום", desc: "שילוב שקוף ומודרני המדגיש נוף פתוח, עם מסגרת אלומיניום דקה ויציבה ותחושת מרחב מקסימלית." },
        { n: "02", title: "מעקה עמודים אנכי", desc: "עיצוב נקי וקלאסי, עמיד ובטיחותי, מתאים למרפסות ולגגות בכל סגנון בית — ומאפשר זרימת אוויר טובה." },
      ],
    },
  },
  pergolas: {
    intro:
      "פרגולת אלומיניום מוסיפה לחצר או למרפסת פינת צל מוגנת, נעימה לשימוש לאורך רוב שעות היום ולאורך כל השנה. אנו מציעים הן פרגולות קבועות בעלות גג יציב ותחזוקה מינימלית, והן פרגולות פרופיל נפתח (ביו-קלימטיות), שבהן ניתן לכוון את זווית הלמלים ולשלוט על כמות האור, האוורור וההגנה מגשם בלחיצת כפתור. שני הפתרונות מיוצרים מפרופילי אלומיניום איכותיים, קלים במשקלם ועמידים בפני חלודה, ומתוכננים כדי לשאת עומסי רוח בהתאם לתקן.",
    advantages: [
      "מבנה קל משקל ועמיד בפני קורוזיה, מתאים לאקלים הישראלי",
      "התאמה מלאה למידות ולצורת השטח — מרובע, מוארך או צמוד לקיר",
      "אפשרות לתאורה משולבת, תריסים צדדיים ומסכי הצללה נוספים",
      "עמידות בעומסי רוח בהתאם לתקן הבנייה",
    ],
    compare: {
      heading: "איזו פרגולה מתאימה לי?",
      lead: "שני סוגי הפרגולות המבוקשים ביותר — ההבדל העיקרי הוא רמת השליטה על האור והאוורור.",
      items: [
        { n: "01", title: "פרגולה קבועה", desc: "גג יציב ואחיד המעניק הצללה מלאה וקבועה, פתרון פשוט, עמיד ודורש תחזוקה מינימלית." },
        { n: "02", title: "פרגולה ביו-קלימטית (פרופיל נפתח)", desc: "למלים מתכווננים המאפשרים שליטה בכמות האור והאוורור, ואף אטימות מלאה בעת גשם — בלחיצת כפתור." },
      ],
    },
  },
  "metal-partitions": {
    intro:
      "מחיצת מתכת היא פתרון אלגנטי ליצירת הפרדה בין מגרשים שכנים, בתוך שטח החצר או במרחבים ציבוריים ומסחריים, מבלי לוותר על מראה עדכני ואוורור נעים. אנו מתכננים ומייצרים מחיצות מותאמות אישית — אטומות לפרטיות מרבית, מחוררות לזרימת אוויר ואור, או משולבות בדוגמת דקורציה — כך שהתוצאה תשתלב בסגנון הבית ותענה בדיוק על הצורך: הפרדה, פרטיות, בטיחות או עיצוב.",
    advantages: [
      "פתרון קל משקל ועמיד המחליף בהצלחה קירות בטון או גדרות מסורתיות",
      "אפשרות בחירה בין אטימות מלאה לפרטיות לבין חירור לאוורור ותאורה טבעית",
      "עיצוב מודרני עם מגוון דוגמאות וגימורי צבע",
      "התקנה מהירה יחסית ותחזוקה נמוכה לאורך שנים",
    ],
    compare: {
      heading: "איזו מחיצה מתאימה לי?",
      lead: "שני כיוונים עיקריים — בהתאם לאיזון הרצוי בין פרטיות לבין אור ואוורור.",
      items: [
        { n: "01", title: "מחיצה אטומה לפרטיות מרבית", desc: "חוסמת מבט לחלוטין בין מגרשים או מרחבים סמוכים, פתרון מועדף לחצרות פרטיות וחללי ישיבה." },
        { n: "02", title: "מחיצה מחוררת / דקורטיבית", desc: "מאפשרת מעבר אור ואוויר תוך שמירה על הפרדה חזותית, ומוסיפה נדבך עיצובי בולט לחצר." },
      ],
    },
  },
  design: {
    intro:
      "לפני שמתחילים בייצור, כל פרויקט אצלנו עובר שלב תכנון מדויק: מדידת שטח בפועל, התאמת הפתרון למאפייני החצר או המבנה, ובניית הדמיה ותכנית עבודה מפורטת שמראה לכם בדיוק כיצד תיראה התוצאה הסופית — מידות, גימור, צבע וסגנון — עוד לפני שמתחיל הייצור. כך נמנעים מהפתעות, וכל שינוי או התאמה נעשים בשלב הזול והקל ביותר: על הנייר.",
    advantages: [
      "מדידת שטח מדויקת והתאמת הפתרון למאפייני המקום",
      "הדמיה ותכנית עבודה מפורטת לפני תחילת הייצור",
      "ייעוץ מקצועי בבחירת חומרים, גימור וצבע",
      "אישור סופי שלכם לפני מעבר לשלב הייצור וההתקנה",
    ],
    compare: {
      heading: "מה כולל תהליך התכנון?",
      lead: "שני שלבי המפתח בכל תהליך תכנון אצלנו — לפני שנוגעים בחומר גלם כלשהו.",
      items: [
        { n: "01", title: "הדמיה מפורטת", desc: "המחשה ויזואלית של המוצר המוגמר בהתאמה מלאה לחלל שלכם, כולל מידות, גימור וגוון צבע לבחירה." },
        { n: "02", title: "תכנית ייצור מדויקת", desc: "מסמך טכני מלא המועבר לצוות הייצור וההתקנה, המבטיח שהתוצאה בשטח תואמת במדויק למה שאושר." },
      ],
    },
  },
  installation: {
    intro:
      "גם המוצר האיכותי ביותר תלוי בהתקנה מדויקת כדי לתפקד כראוי לאורך שנים. צוות ההתקנה שלנו מגיע לשטח עם ציוד מקצועי וניסיון רב, עובד בצורה נקייה ומסודרת, ומקפיד על יישור, פילוס וחיזוק מיטביים בהתאם לסוג המשטח והמבנה. בסיום ההתקנה מתבצעות בדיקות כיוונון ובטיחות מלאות, כולל למנועים ולמנגנונים חשמליים, לפני מסירת העבודה.",
    advantages: [
      "צוות מתקינים מיומן ומנוסה, עם ציוד מקצועי מתאים",
      "עבודה נקייה ומתואמת מראש, תוך שמירה על הרכוש הקיים",
      "בדיקות כיוונון ובטיחות מלאות בסיום כל התקנה",
      "ליווי צמוד מרגע ההגעה לשטח ועד למסירת העבודה",
    ],
    compare: {
      heading: "מה מבטיחה התקנה מקצועית?",
      lead: "שני עקרונות היסוד שאנו מקפידים עליהם בכל התקנה, קטנה כגדולה.",
      items: [
        { n: "01", title: "עבודה נקייה ומתואמת", desc: "תיאום מראש על מועד ומשך העבודה, שמירה על ניקיון השטח וצמצום ההפרעה לשגרת הבית." },
        { n: "02", title: "בדיקות כיוונון ובטיחות", desc: "כיוונון סופי של מנגנונים ומנועים, ובדיקת תפקוד ובטיחות מלאה לפני מסירת העבודה ללקוח." },
      ],
    },
  },
  maintenance: {
    intro:
      "מוצרי אלומיניום ומתכת בגימור פרימיום שומרים על מראם ותפקודם לאורך שנים רבות, בתנאי שמקבלים טיפול תקופתי נכון — בעיקר כאשר מדובר במנועים ובמנגנונים חשמליים של שערים. אנו מציעים שירותי תחזוקה מותאמים: ביקורות תקופתיות, שימון וכיוונון מנגנונים, בדיקת מעגלים חשמליים ורכיבי בטיחות, וכן תמיכה טכנית זמינה למקרה של תקלה בלתי צפויה.",
    advantages: [
      "ביקורות תקופתיות לאיתור בלאי לפני שהוא הופך לתקלה",
      "טיפול וכיוונון מנועים, מסילות ומנגנוני שערים חשמליים",
      "בדיקת רכיבי בטיחות ומעגלים חשמליים בהתאם להנחיות היצרן",
      "תמיכה טכנית זמינה וזמן תגובה מהיר למקרי תקלה",
    ],
    compare: {
      heading: "מה כולל שירות התחזוקה?",
      lead: "שני מרכיבי הליבה של שירות התחזוקה שלנו, המותאמים לפי סוג המוצר ותדירות השימוש בו.",
      items: [
        { n: "01", title: "ביקורת תקופתית מקיפה", desc: "בדיקת מצב המנגנון, השימון, ההידוק והחיווט, לאיתור מוקדם של כל סימן לבלאי או שחיקה." },
        { n: "02", title: "תמיכה טכנית זמינה", desc: "מענה מהיר לתקלות, כולל הגעה לשטח לתיקון או כיוונון, כדי לצמצם למינימום את משך ההשבתה." },
      ],
    },
  },
};

const DEFAULT_ADVANTAGES = [
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
  // Just the page-specific part for the <title> tag — the root layout's
  // title.template ("%s | Metaline") appends the brand automatically.
  // og:title has no such template, so it gets the full branded string.
  const pageTitle = service.title;
  const fullTitle = `${service.title} | Metaline`;
  const description = service.description ?? undefined;
  const seo = await getSeoSettings();
  return {
    title: pageTitle,
    description,
    // Always set our own openGraph title/description (rather than leaving
    // the key out entirely, or setting it to `undefined`) so this page's
    // specific title/description show up in link previews instead of the
    // site-wide default. Next.js treats any segment that mentions the
    // `openGraph` key at all — even as `undefined` — as replacing the
    // parent's resolved value, so the previous `openGraph: x ? {...} :
    // undefined` pattern was silently wiping out the root layout's OG
    // image/siteName/locale on every service page. Services have no image
    // field of their own yet, so this falls back to the site-wide default
    // OG image (admin "SEO" screen) when one is set.
    openGraph: {
      title: fullTitle,
      description,
      ...(seo.default_og_image_url ? { images: [seo.default_og_image_url] } : {}),
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = getServiceIcon(service.icon);
  const detail = SERVICE_CONTENT[slug];
  const comparison = detail?.compare;
  const advantages = detail?.advantages ?? DEFAULT_ADVANTAGES;
  const galleryCategory = GALLERY_CATEGORY[slug];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="svc-icon" style={{ marginBottom: 20 }}>
            {/* getServiceIcon is a stable lookup in a static map (same slug
                always returns the same component reference), and this is an
                async Server Component with no client re-renders to worry
                about — safe despite the lint rule's static analysis. */}
            {/* eslint-disable-next-line react-hooks/static-components */}
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
          <div className="about-text" style={{ maxWidth: 720 }}>
            <span className="eyebrow">למה Metaline</span>
            <h2>עבודה מדויקת מהתכנון ועד ההתקנה</h2>
            {detail?.intro && <p>{detail.intro}</p>}
            <div className="about-points">
              {advantages.map((a) => (
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

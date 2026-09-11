import type { Metadata } from "next";
import { IconCheck } from "@/components/Icons";
import { GateDivider } from "@/components/HeroScene";
import { QuoteButton } from "@/components/QuoteModal";
import { getAboutContent, getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "אודות | Metaline",
  description: "Metaline — פתרונות אלומיניום ומתכת בגימור פרימיום. הכירו את הסיפור, הערכים וצוות המומחים שלנו.",
};

export default async function AboutPage() {
  const [settings, content] = await Promise.all([getSiteSettings(), getAboutContent()]);
  const computedStoryTitle = settings.years_in_business
    ? `מאז ${new Date().getFullYear() - settings.years_in_business} — ומאז מדייקים כל פרט`
    : "[להשלמה: שנת ייסוד] — ומאז מדייקים כל פרט";

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">מי אנחנו</span>
          <h1>{content.hero_title || "הסיפור שמאחורי Metaline"}</h1>
          <p>
            {content.hero_lead ||
              "עסק משפחתי שהפך לשם דבר בתחום האלומיניום והמתכת — עבודה מדויקת, חומרים איכותיים וליווי אישי בכל שלב."}
          </p>
        </div>
      </section>

      <GateDivider />

      <section className="section about">
        <div className="container about-grid reveal-stagger">
          <div className="about-visual">
            <div className="about-visual-inner">
              <div className="about-ring a1" aria-hidden="true" />
              <div className="about-ring a2" aria-hidden="true" />
              <div className="about-core">
                {content.story_image_url ? (
                  <img src={content.story_image_url} alt="Metaline" style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "50%" }} />
                ) : (
                  <img src="/brand/symbol-white.png" alt="Metaline" />
                )}
              </div>
              <div className="about-badge">
                <div className="n">{settings.projects_count ? `${settings.projects_count}+` : "[להשלמה]+"}</div>
                <div className="l">פרויקטים</div>
              </div>
            </div>
          </div>
          <div className="about-text">
            <span className="eyebrow">הדרך שלנו</span>
            <h2>{content.story_title || computedStoryTitle}</h2>
            <p>
              {content.story_body_1 ||
                "Metaline הוקמה מתוך אמונה שגם רכיב פונקציונלי כמו שער או מעקה יכול להיות עבודת אמנות. אנחנו עובדים עם ספקי אלומיניום מובילים ומקפידים על כל שלב — מהתכנון ההנדסי ועד הליטוש האחרון בשטח."}
            </p>
            <p>
              {content.story_body_2 ||
                "הצוות שלנו מלווה כל פרויקט אישית: החל מהמפגש הראשון בבית הלקוח, דרך התאמת החומרים והגימור, ועד ההתקנה הסופית ומתן אחריות מלאה."}
            </p>
            <div className="about-points">
              <div className="about-point">
                <IconCheck />
                <span>
                  {settings.years_in_business
                    ? `${settings.years_in_business}+ שנות ניסיון בתחום האלומיניום והמתכת`
                    : "[להשלמה: שנות ניסיון] שנות ניסיון בתחום האלומיניום והמתכת"}
                </span>
              </div>
              <div className="about-point">
                <IconCheck />
                <span>עבודה עם חומרי גלם וגימורים איכותיים בלבד</span>
              </div>
              <div className="about-point">
                <IconCheck />
                <span>ליווי אישי מהתכנון ועד לאחר ההתקנה</span>
              </div>
              <div className="about-point">
                <IconCheck />
                <span>אחריות מלאה על כל פרויקט</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner reveal-stagger">
          <div>
            <span className="eyebrow">מוכנים להתחיל?</span>
            <h2>נשמח להכיר את הפרויקט שלכם</h2>
            <p>השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת אישית.</p>
          </div>
          <div className="cta-actions">
            <QuoteButton className="btn btn-gold">צרו קשר</QuoteButton>
          </div>
        </div>
      </section>
    </>
  );
}

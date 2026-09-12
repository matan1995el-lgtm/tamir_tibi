import Link from "next/link";
import Image from "next/image";
import HeroScene, { LogoEmblem, GateDivider } from "@/components/HeroScene";
import { QuoteButton } from "@/components/QuoteModal";
import { getHomeContent, getServices, getSiteSettings, getTestimonials } from "@/lib/site-data";
import { getServiceIcon } from "@/lib/service-icons";
import { IconCheck, IconStar, IconConsult, IconDesign, IconInstallation, IconQuality } from "@/components/Icons";
import { ArtElectricGate, ArtRailing, ArtPergola, ArtPartition } from "@/components/PlaceholderArt";

export const revalidate = 60;

const PROCESS = [
  { n: "01", title: "פנייה וייעוץ ראשוני", desc: "יוצרים קשר, מבינים את הצורך שלכם ומתאמים בדיקת שטח ללא התחייבות.", Icon: IconConsult },
  { n: "02", title: "תכנון והדמיה", desc: "מתאימים את הפתרון בדיוק לחלל שלכם — מידות, גימור וסגנון לבחירתכם.", Icon: IconDesign },
  { n: "03", title: "ייצור והתקנה מקצועית", desc: "ייצור מדויק והתקנה נקייה בשטח, בליווי צוות מנוסה מתחילת היום ועד סופו.", Icon: IconInstallation },
  { n: "04", title: "אחריות ותמיכה", desc: "אחריות מלאה ותמיכה טכנית זמינה גם אחרי ההתקנה, לאורך שנות השימוש.", Icon: IconQuality },
];

// Category tiles on the homepage link out to a filtered gallery view — the
// illustrations here are the same brand-styled placeholders used for
// gallery items with no photo yet (see PlaceholderArt.tsx).
const GALLERY_PREVIEW = [
  { art: ArtElectricGate, label: "שערים חשמליים" },
  { art: ArtRailing, label: "מעקות אלומיניום" },
  { art: ArtPergola, label: "פרגולות" },
  { art: ArtPartition, label: "מחיצות מתכת" },
];

export default async function Home() {
  const [services, settings, testimonials, content] = await Promise.all([
    getServices(),
    getSiteSettings(),
    getTestimonials(),
    getHomeContent(),
  ]);

  return (
    <>
      <section className="hero">
        <HeroScene />
        <div className="container hero-content">
          <div className="hero-grid">
            <div className="reveal-stagger">
              <span className="eyebrow">{content.hero_eyebrow || "אלומיניום ומתכת בגימור פרימיום"}</span>
              <h1>
                {content.hero_title_main || "Metaline — פתרונות אלומיניום ומתכת ברמה"}
                <br />
                <span>{content.hero_title_accent || "אחרת"}</span>
              </h1>
              <p className="lead">
                {content.hero_lead ||
                  "שערים חשמליים, מעקות אלומיניום ופרגולות מתכת — מתוכננים ומותקנים בדיוק, מהרעיון הראשוני ועד לגימור הסופי בשטח."}
              </p>
              <div className="hero-actions">
                <QuoteButton className="btn btn-gold">קבלו הצעת מחיר</QuoteButton>
                <Link href="/gallery" className="btn btn-ghost">
                  צפו בפרויקטים
                </Link>
              </div>
            </div>
            <LogoEmblem />
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <div className="line" />
          <span>גללו</span>
        </div>
      </section>

      <GateDivider />

      <section className="trust">
        <div className="container trust-inner reveal-stagger">
          <div className="trust-item">
            <div className="trust-num">
              {settings.years_in_business ? (
                <>
                  {settings.years_in_business}
                  <span className="u">+</span>
                </>
              ) : (
                <>[<span className="u">להשלמה</span>]+</>
              )}
            </div>
            <div className="trust-label">שנות ניסיון</div>
          </div>
          <div className="trust-item">
            <div className="trust-num">
              {settings.projects_count ? (
                <>
                  {settings.projects_count}
                  <span className="u">+</span>
                </>
              ) : (
                <>[<span className="u">להשלמה</span>]+</>
              )}
            </div>
            <div className="trust-label">פרויקטים שהושלמו</div>
          </div>
          <div className="trust-item">
            <div className="trust-num">100%</div>
            <div className="trust-label">עבודה מותאמת אישית</div>
          </div>
          <div className="trust-item">
            <div className="trust-num">ליווי אישי</div>
            <div className="trust-label">לאורך כל הפרויקט</div>
          </div>
        </div>
      </section>

      <section className="section services">
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">מה אנחנו עושים</span>
            <h2>שירותים מקצה לקצה</h2>
            <p>מתכנון ראשוני ובחירת חומרים, דרך ייצור מדויק ועד התקנה ותחזוקה — הכל תחת קורת גג אחת.</p>
          </div>
          <div className="svc-grid reveal-stagger">
            {services.map((s) => {
              const Icon = getServiceIcon(s.icon);
              return (
                <div className="tilt-wrap" key={s.id}>
                  <Link href={`/services/${s.slug}`} className="svc-card">
                    <div className="svc-icon">
                      <Icon />
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                    <span className="svc-link">למידע נוסף ←</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">איך זה עובד</span>
            <h2>מהפנייה הראשונה ועד השער הסגור בבית שלכם</h2>
            <p>תהליך ברור ומסודר בארבעה שלבים — כדי שתדעו בדיוק למה לצפות בכל שלב בדרך.</p>
          </div>

          <div className="process-stage">
            <div className="process-track reveal" aria-hidden="true">
              <div className="process-track-fill" />
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="process-track-dot" style={{ insetInlineStart: `${(i / 3) * 100}%` }} />
              ))}
            </div>
            <div className="process-grid reveal-stagger">
              {PROCESS.map((c) => {
                const Icon = c.Icon;
                return (
                  <div className="tilt-wrap process-wrap" key={c.n}>
                    <div className="process-card">
                      <span className="process-card-sheen" aria-hidden="true" />
                      <div className="process-num-3d" aria-hidden="true">
                        <span>{c.n}</span>
                      </div>
                      <div className="process-icon">
                        <Icon />
                      </div>
                      <h4>{c.title}</h4>
                      <p>{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section about">
        <div className="container about-grid reveal-stagger">
          <div className="about-visual">
            <div className="about-visual-inner">
              <div className="about-ring a1" aria-hidden="true" />
              <div className="about-ring a2" aria-hidden="true" />
              <div className="about-core">
                {content.about_image_url ? (
                  <Image
                    src={content.about_image_url}
                    alt="Metaline"
                    fill
                    sizes="210px"
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  <Image src="/brand/symbol-white.png" alt="Metaline" width={108} height={108} />
                )}
              </div>
              <div className="about-badge">
                <div className="n">{settings.projects_count ? `${settings.projects_count}+` : "[להשלמה]+"}</div>
                <div className="l">פרויקטים</div>
              </div>
            </div>
          </div>
          <div className="about-text">
            <span className="eyebrow">מי אנחנו</span>
            <h2>{content.about_title || "דיוק, אמינות ועבודה שנשארת לאורך שנים"}</h2>
            <p>
              {content.about_body ||
                "Metaline מתמחה בייצור והתקנה של שערים חשמליים, מעקות אלומיניום ופרגולות מתכת בגימור פרימיום. אנחנו מלווים כל פרויקט מהמפגש הראשון ועד הרגע שהשער נסגר בפעם הראשונה בבית שלכם."}
            </p>
            <div className="about-points">
              <div className="about-point">
                <IconCheck />
                <span>חומרים איכותיים וגימור עמיד לאורך שנים</span>
              </div>
              <div className="about-point">
                <IconCheck />
                <span>תכנון מותאם אישית לכל פרויקט</span>
              </div>
              <div className="about-point">
                <IconCheck />
                <span>צוות התקנה מקצועי ומנוסה</span>
              </div>
            </div>
            <Link href="/about" className="btn btn-ghost">
              עוד עלינו
            </Link>
          </div>
        </div>
      </section>

      <section className="section tight gallery-t">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow">עבודות נבחרות</span>
            <h2>מהשטח</h2>
          </div>
          <div className="gal-grid reveal-stagger">
            {GALLERY_PREVIEW.map((g) => (
              <Link href={`/gallery?category=${encodeURIComponent(g.label)}`} className="gal-wrap" key={g.label}>
                <div className="gal-tile">
                  <g.art className="art-placeholder" />
                  <div className="scrim" />
                  <span className="lbl">{g.label}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="gal-cta">
            <Link href="/gallery" className="btn btn-ghost">
              לכל הגלריה
            </Link>
          </div>
        </div>
      </section>

      <section className="section testi">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow">לקוחות מספרים</span>
            <h2>מה אומרים עלינו</h2>
          </div>
          <div className="testi-grid reveal-stagger">
            {testimonials.map((t) => (
              <div className="testi-card" key={t.id}>
                <div className="testi-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} className={i >= t.rating ? "dim" : undefined} />
                  ))}
                </div>
                <p className="testi-quote">{t.quote}</p>
                <div className="testi-name">{t.author_name}</div>
                {t.author_role && <div className="testi-role">{t.author_role}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner reveal-stagger">
          <div>
            <span className="eyebrow">מוכנים להתחיל?</span>
            <h2>{content.cta_title || "בואו נתכנן יחד את הפרויקט הבא שלכם"}</h2>
            <p>{content.cta_body || "השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת אישית, ללא התחייבות."}</p>
          </div>
          <div className="cta-actions">
            <QuoteButton className="btn btn-gold">קבלו הצעת מחיר</QuoteButton>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { GateDivider } from "@/components/HeroScene";
import { getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "מדיניות עוגיות | Metaline",
  description: "מדיניות השימוש בעוגיות (Cookies) באתר Metaline.",
};

export default async function CookiesPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">עוגיות</span>
          <h1>מדיניות שימוש בעוגיות</h1>
          <p>מסמך זה מסביר מהן עוגיות (Cookies) וכיצד אנו עושים בהן שימוש באתר.</p>
        </div>
      </section>

      <GateDivider />

      <section className="section">
        <div className="container legal-content reveal-stagger">
          <p className="updated">עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}</p>

          <h2>מהן עוגיות?</h2>
          <p>
            עוגיות (Cookies) הן קבצי טקסט קטנים הנשמרים בדפדפן שלכם בעת גלישה באתר. הן מסייעות לאתר לזכור
            מידע על הביקור שלכם ולתפקד בצורה תקינה ויעילה יותר.
          </p>

          <h2>כיצד אנו משתמשים בעוגיות</h2>
          <ul>
            <li>עוגיות חיוניות לתפעול תקין של האתר ולשמירה על אבטחת המידע.</li>
            <li>עוגיות המשמשות לזכירת העדפות תצוגה שבחרתם (כגון הגדרות בווידג&apos;ט הנגישות).</li>
            <li>עוגיות אנליטיות, ככל שבשימוש, המסייעות לנו להבין כיצד גולשים משתמשים באתר לצורך שיפורו.</li>
          </ul>

          <h2>ניהול עוגיות</h2>
          <p>
            ניתן לחסום או למחוק עוגיות בכל עת דרך הגדרות הדפדפן שלכם. שימו לב כי חסימת עוגיות מסוימות עלולה
            להשפיע על תפקוד תקין של חלק מהתכונות באתר.
          </p>

          <h2>יצירת קשר</h2>
          <p>
            לשאלות בנוגע למדיניות זו, ניתן לפנות אלינו:{" "}
            {settings.email ? (
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            ) : (
              <span className="placeholder">[להשלמה: כתובת אימייל]</span>
            )}
          </p>
        </div>
      </section>
    </>
  );
}

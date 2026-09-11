import type { Metadata } from "next";
import { GateDivider } from "@/components/HeroScene";
import { getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "מדיניות פרטיות | Metaline",
  description: "מדיניות הפרטיות של אתר Metaline — כיצד אנו אוספים, משתמשים ושומרים על המידע שלכם.",
};

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">פרטיות</span>
          <h1>מדיניות פרטיות</h1>
          <p>הפרטיות שלכם חשובה לנו. מסמך זה מסביר אילו נתונים אנו אוספים וכיצד אנו משתמשים בהם.</p>
        </div>
      </section>

      <GateDivider />

      <section className="section">
        <div className="container legal-content reveal-stagger">
          <p className="updated">עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}</p>

          <h2>איזה מידע אנו אוספים</h2>
          <p>
            כאשר אתם משאירים פרטים באתר (לדוגמה באמצעות טופס יצירת קשר, חלונית בקשת הצעת מחיר, או פנייה
            בוואטסאפ), אנו אוספים את הפרטים שמסרתם — לרבות שם, טלפון, כתובת אימייל ותוכן הפנייה. בנוסף,
            כמקובל באתרי אינטרנט, ייתכן שנאסוף מידע טכני בסיסי (כגון סוג דפדפן ומכשיר) לצורך תפעול תקין
            של האתר.
          </p>

          <h2>כיצד אנו משתמשים במידע</h2>
          <ul>
            <li>יצירת קשר חוזר עמכם ומתן מענה לפנייתכם או להצעת המחיר שביקשתם.</li>
            <li>ניהול פניות במערכת הניהול הפנימית של העסק.</li>
            <li>שיפור השירות והתכנים באתר.</li>
          </ul>
          <p>
            אנו לא מוכרים ולא משכירים את המידע האישי שלכם לצדדים שלישיים. המידע שאתם משאירים בטופסי האתר
            עשוי להישלח ולהישמר גם באמצעות ספקי שירות חיצוניים המשמשים אותנו לניהול פניות (כגון שירותי
            טפסים מקוונים ואחסון נתונים), אשר מחויבים לשמור על סודיות המידע.
          </p>

          <h2>אבטחת מידע</h2>
          <p>
            אנו נוקטים באמצעים סבירים ומקובלים כדי להגן על המידע שנמסר לנו מפני גישה, שימוש או חשיפה
            בלתי מורשים. יחד עם זאת, אין אפשרות להבטיח הגנה מוחלטת מפני כל סיכון הכרוך בהעברת מידע
            באינטרנט.
          </p>

          <h2>זכויותיכם</h2>
          <p>
            באפשרותכם לפנות אלינו בכל עת בבקשה לעיין במידע שנשמר אודותיכם, לתקנו או לבקש את מחיקתו,
            בכפוף לכל דין.
          </p>

          <h2>יצירת קשר</h2>
          <p>
            לשאלות או בקשות בנוגע למדיניות פרטיות זו, ניתן לפנות אלינו:{" "}
            {settings.email ? (
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            ) : (
              <span className="placeholder">[להשלמה: כתובת אימייל]</span>
            )}
            {settings.phone ? (
              <>
                {" "}או בטלפון <a href={`tel:${settings.phone}`}>{settings.phone}</a>.
              </>
            ) : (
              <> או בטלפון <span className="placeholder">[להשלמה: מספר טלפון]</span>.</>
            )}
          </p>
        </div>
      </section>
    </>
  );
}

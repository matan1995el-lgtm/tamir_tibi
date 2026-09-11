import type { Metadata } from "next";
import { GateDivider } from "@/components/HeroScene";
import { getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "הצהרת נגישות | Metaline",
  description: "הצהרת הנגישות של אתר Metaline ופרטי יצירת קשר בנושאי נגישות.",
};

export default async function AccessibilityPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">נגישות</span>
          <h1>הצהרת נגישות</h1>
          <p>אתר Metaline פועל להנגשת התכנים והשירותים שלו לכלל הגולשים, ובכלל זה אנשים עם מוגבלות.</p>
        </div>
      </section>

      <GateDivider />

      <section className="section">
        <div className="container legal-content reveal-stagger">
          <p className="updated">עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}</p>

          <div className="note-box">
            <p>
              אנו משקיעים מאמצים מתמשכים בהנגשת האתר. בשלב זה בוצעו התאמות ראשוניות (ובכללן ווידג&apos;ט הנגשה
              הזמין בפינת המסך), אך האתר טרם עבר בדיקת התאמה מקיפה על ידי גורם מוסמך חיצוני. אנו ממשיכים
              לעבוד על שיפור הנגישות באופן שוטף.
            </p>
          </div>

          <h2>מחויבותנו לנגישות</h2>
          <p>
            חוק שוויון זכויות לאנשים עם מוגבלות, התשנ&quot;ח-1998, ותקנות הנגישות מכוחו, קובעים דרישות להנגשת
            שירותים ומידע — לרבות אתרי אינטרנט — לאנשים עם מוגבלות. אנו רואים חשיבות רבה במתן שירות שוויוני
            ונגיש לכלל לקוחותינו, ופועלים בהתאם לעקרונות תקן הנגישות הישראלי ת&quot;י 5568 (המבוסס על הנחיות
            WCAG 2.0 ברמה AA) ככל הניתן.
          </p>

          <h2>ההתאמות שבוצעו באתר</h2>
          <ul>
            <li>מבנה סמנטי וניווט מותאם למקלדת ולקוראי מסך.</li>
            <li>ווידג&apos;ט נגישות המאפשר הגדלת טקסט, ניגודיות גבוהה, גווני אפור, הדגשת קישורים, גופן קריא ועצירת אנימציות.</li>
            <li>תיאורי טקסט חלופי (alt) לתמונות מרכזיות באתר.</li>
            <li>ניגודיות צבעים נבחרת בהתאם לעקרונות הנגישות.</li>
          </ul>

          <h2>שימוש בווידג&apos;ט הנגישות</h2>
          <p>
            בפינת המסך מופיע כפתור נגישות (סמל דמות) המפתח תפריט הגדרות המאפשר להתאים את תצוגת האתר לצרכיכם.
            ניתן לאפס את ההגדרות בכל עת באמצעות כפתור &quot;איפוס הגדרות&quot; שבתפריט.
          </p>

          <h2>פניות בנושא נגישות</h2>
          <p>
            נתקלתם בבעיית נגישות באתר, או שיש לכם הצעות לשיפור? נשמח שתפנו אלינו ונטפל בפנייה בהקדם.
          </p>
          <ul>
            <li>
              רכז/ת נגישות: <span className="placeholder">[להשלמה: שם רכז/ת הנגישות]</span>
            </li>
            <li>
              טלפון:{" "}
              {settings.phone ? (
                <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              ) : (
                <span className="placeholder">[להשלמה: מספר טלפון]</span>
              )}
            </li>
            <li>
              אימייל:{" "}
              {settings.email ? (
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              ) : (
                <span className="placeholder">[להשלמה: כתובת אימייל]</span>
              )}
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

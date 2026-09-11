import Link from "next/link";
import { QuoteButton } from "@/components/QuoteModal";

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="container">
        <div className="notfound-inner">
          <div className="notfound-code">404</div>
          <h1>העמוד לא נמצא</h1>
          <p>
            ייתכן שהקישור השתנה או שהעמוד הוסר. אפשר לחזור לעמוד הבית, לעיין
            בשירותים שלנו, או לפנות אלינו ישירות לקבלת הצעת מחיר.
          </p>
          <div className="notfound-actions">
            <Link href="/" className="btn btn-gold">
              חזרה לעמוד הבית
            </Link>
            <Link href="/services" className="btn btn-ghost">
              לכל השירותים
            </Link>
            <QuoteButton className="btn btn-ghost">קבלו הצעת מחיר</QuoteButton>
          </div>
        </div>
      </div>
    </section>
  );
}

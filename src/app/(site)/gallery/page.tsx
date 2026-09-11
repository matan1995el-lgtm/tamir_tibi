import type { Metadata } from "next";
import { Suspense } from "react";
import { GateDivider } from "@/components/HeroScene";
import { QuoteButton } from "@/components/QuoteModal";
import { getGalleryProjects } from "@/lib/site-data";
import GalleryClient from "./GalleryClient";

export const revalidate = 60;

export const metadata: Metadata = {
  // Root layout's title.template ("%s | Metaline") appends the brand —
  // a literal "| Metaline" here would double it up.
  title: "גלריית פרויקטים",
  description: "פרויקטים נבחרים של שערים חשמליים, מעקות אלומיניום, פרגולות ומחיצות מתכת מבית Metaline.",
};

export default async function GalleryPage() {
  const projects = await getGalleryProjects();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">עבודות נבחרות</span>
          <h1>גלריית הפרויקטים שלנו</h1>
          <p>סקירה של הפרויקטים שביצענו לפי סוג — סננו לפי התחום שמעניין אתכם.</p>
        </div>
      </section>

      <GateDivider />

      <Suspense fallback={null}>
        <GalleryClient projects={projects} />
      </Suspense>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <span className="eyebrow">אהבתם מה שראיתם?</span>
            <h2>בואו ניצור משהו דומה בשבילכם</h2>
            <p>ספרו לנו על הפרויקט ונחזור אליכם עם הצעת מחיר מותאמת אישית.</p>
          </div>
          <div className="cta-actions">
            <QuoteButton className="btn btn-gold">צרו קשר</QuoteButton>
          </div>
        </div>
      </section>
    </>
  );
}

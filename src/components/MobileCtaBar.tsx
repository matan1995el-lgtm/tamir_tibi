"use client";

import { QuoteButton } from "@/components/QuoteModal";
import { IconPhone } from "@/components/Icons";

/**
 * Fixed bottom action bar shown on mobile only (see .mcta-bar / @680px in
 * globals.css). Most visitors on a contractor-type site are on their phone
 * and want a one-tap way to call or ask for a quote without hunting for the
 * contact page — this keeps that action reachable from anywhere on the site.
 * The WhatsApp + accessibility floating buttons shift up above it on mobile
 * (see the .fab / .a11y-fab rules in the same media query) so nothing overlaps.
 */
export default function MobileCtaBar({ phone }: { phone: string | null }) {
  const hasPhone = !!phone && phone.trim().length > 0;

  return (
    <div className="mcta-bar" role="region" aria-label="פעולות מהירות">
      <div className="mcta-row">
        {hasPhone && (
          <a href={`tel:${phone}`} className="btn btn-ghost">
            <IconPhone />
            התקשרו עכשיו
          </a>
        )}
        <QuoteButton className="btn btn-gold">קבלו הצעת מחיר</QuoteButton>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { QuoteButton } from "@/components/QuoteModal";
import { IconPhone } from "@/components/Icons";

/**
 * Fixed bottom action bar shown on mobile only (see .mcta-bar / @680px in
 * globals.css). Most visitors on a contractor-type site are on their phone
 * and want a one-tap way to call or ask for a quote without hunting for the
 * contact page — this keeps that action reachable from anywhere on the site.
 * The WhatsApp + accessibility floating buttons shift up above it on mobile
 * (see the .fab / .a11y-fab rules in the same media query) so nothing overlaps.
 *
 * The bar's real rendered height varies by device (the iOS home-indicator
 * safe area, a wrapped button label on very narrow screens, font-scaling
 * from the accessibility widget) — a hardcoded CSS fallback can't account
 * for that, so it measures itself and publishes the real height as a CSS
 * custom property the two floating buttons read to clear it. Without this
 * they clip under the bar by a few pixels on the affected devices, showing
 * only a sliver of each button instead of the full circle.
 */
export default function MobileCtaBar({ phone }: { phone: string | null }) {
  const hasPhone = !!phone && phone.trim().length > 0;
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty("--mcta-h", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--mcta-h");
    };
  }, []);

  return (
    <div className="mcta-bar" role="region" aria-label="פעולות מהירות" ref={barRef}>
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

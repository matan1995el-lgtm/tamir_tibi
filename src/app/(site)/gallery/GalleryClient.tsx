"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { GalleryProject } from "@/lib/site-data";
import { ArtElectricGate, ArtRailing, ArtPergola, ArtPartition } from "@/components/PlaceholderArt";

const CATEGORIES = ["הכל", "שערים חשמליים", "מעקות אלומיניום", "פרגולות", "מחיצות מתכת"];

// Brand-styled illustration shown in place of a real photo until one is
// uploaded for this project in the admin panel's gallery manager.
const CATEGORY_ART: Record<string, React.ComponentType<{ className?: string }>> = {
  "שערים חשמליים": ArtElectricGate,
  "מעקות אלומיניום": ArtRailing,
  "פרגולות": ArtPergola,
  "מחיצות מתכת": ArtPartition,
};

// Maps a gallery category back to the matching service page, so someone
// browsing a filtered category can jump straight to that service's page.
const CATEGORY_SERVICE_SLUG: Record<string, string> = {
  "שערים חשמליים": "electric-gates",
  "מעקות אלומיניום": "aluminum-railings",
  "פרגולות": "pergolas",
  "מחיצות מתכת": "metal-partitions",
};

export default function GalleryClient({ projects }: { projects: GalleryProject[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [active, setActive] = useState(
    initialCategory && CATEGORIES.includes(initialCategory) ? initialCategory : "הכל"
  );
  // Ids whose real photo failed to load (broken URL, deleted Storage
  // object, etc.) — fall back to the category illustration instead of
  // showing a broken-image icon or an empty tile.
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<GalleryProject | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const filtered = useMemo(
    () => (active === "הכל" ? projects : projects.filter((p) => p.category === active)),
    [projects, active]
  );

  const serviceSlug = CATEGORY_SERVICE_SLUG[active];

  function openLightbox(item: GalleryProject, e: React.MouseEvent<HTMLElement>) {
    triggerRef.current = e.currentTarget;
    setExpanded(item);
  }

  // Same Escape-to-close + Tab focus-trap pattern as QuoteModal/
  // AccessibilityWidget: without it, Tab walks focus out of the dialog into
  // the page hidden behind the overlay. Also moves focus into the dialog on
  // open and back to the tile that opened it on close.
  useEffect(() => {
    if (!expanded) return;
    const trigger = triggerRef.current;
    function getFocusable(): HTMLElement[] {
      if (!lightboxRef.current) return [];
      return Array.from(
        lightboxRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setExpanded(null);
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!lightboxRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      trigger?.focus();
    };
  }, [expanded]);

  return (
    <section className="section gallery-t">
      <div className="container">
        <div className="gal-filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={c === active ? "active" : ""}
              onClick={() => setActive(c)}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>

        {serviceSlug && (
          <div style={{ marginBottom: 28 }}>
            <Link href={`/services/${serviceSlug}`} className="btn btn-ghost">
              למידע נוסף על השירות ←
            </Link>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="aempty">
            <p>עדיין אין פרויקטים בקטגוריה הזו.</p>
          </div>
        ) : (
          <div className="gal-grid reveal-stagger">
            {filtered.map((item) => {
              const Art = CATEGORY_ART[item.category] ?? ArtPartition;
              const hasPhoto = !!item.image_url && !failedImages.has(item.id);
              return (
                <div className="gal-wrap" key={item.id}>
                  <button
                    type="button"
                    className="gal-tile gal-tile-btn"
                    onClick={(e) => openLightbox(item, e)}
                    aria-label={`הגדלת תמונה: ${item.title}`}
                  >
                    {hasPhoto ? (
                      <Image
                        className="photo"
                        src={item.image_url!}
                        alt={item.title}
                        fill
                        sizes="(max-width: 620px) 100vw, (max-width: 980px) 50vw, 25vw"
                        onError={() =>
                          setFailedImages((prev) => new Set(prev).add(item.id))
                        }
                      />
                    ) : (
                      <>
                        <Art className="art-placeholder" />
                        <span className="art-badge">הדמיה</span>
                      </>
                    )}
                    <div className="scrim" />
                    <span className="lbl">{item.title}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {expanded && (
        <div className="gal-lightbox-overlay" onClick={() => setExpanded(null)} role="presentation">
          <div ref={lightboxRef} className="gal-lightbox" role="dialog" aria-modal="true" aria-label={expanded.title} onClick={(e) => e.stopPropagation()}>
            <button ref={closeBtnRef} type="button" className="gal-lightbox-close" aria-label="סגירה" onClick={() => setExpanded(null)}>
              ×
            </button>
            {expanded.image_url && !failedImages.has(expanded.id) ? (
              <Image
                src={expanded.image_url}
                alt={expanded.title}
                width={1200}
                height={1500}
                className="gal-lightbox-img"
                sizes="90vw"
              />
            ) : (
              (() => {
                const Art = CATEGORY_ART[expanded.category] ?? ArtPartition;
                return (
                  <div className="gal-lightbox-art">
                    <Art className="art-placeholder" />
                  </div>
                );
              })()
            )}
            <div className="gal-lightbox-caption">
              <span>{expanded.title}</span>
              {(!expanded.image_url || failedImages.has(expanded.id)) && (
                <span className="art-badge" style={{ position: "static" }}>
                  הדמיה
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

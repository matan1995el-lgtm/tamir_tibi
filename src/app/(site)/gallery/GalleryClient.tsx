"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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

  const filtered = useMemo(
    () => (active === "הכל" ? projects : projects.filter((p) => p.category === active)),
    [projects, active]
  );

  const serviceSlug = CATEGORY_SERVICE_SLUG[active];

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
              return (
                <div className="gal-wrap" key={item.id}>
                  <div className="gal-tile">
                    {item.image_url ? (
                      <img className="photo" src={item.image_url} alt={item.title} loading="lazy" decoding="async" />
                    ) : (
                      <>
                        <Art className="art-placeholder" />
                        <span className="art-badge">הדמיה</span>
                      </>
                    )}
                    <div className="scrim" />
                    <span className="lbl">{item.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

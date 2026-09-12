"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { QuoteButton } from "@/components/QuoteModal";
import { IconFacebook, IconInstagram } from "@/components/Icons";
import { sanitizeHref } from "@/lib/link-safety";
import type { NavMenuItem } from "@/lib/site-data";

export default function SiteHeader({
  navItems,
  logoUrl,
  facebookUrl,
  instagramUrl,
}: {
  navItems: NavMenuItem[];
  logoUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
}) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`site-header${solid ? " solid" : ""}`}>
      <div className="container header-inner">
        <Link href="/" className="brand">
          <Image src={logoUrl || "/brand/symbol-white.png"} alt="Metaline" width={36} height={36} priority />
          <span className="brand-name">Metaline</span>
        </Link>
        <nav className="nav">
          {navItems.map((n) => (
            <Link key={n.id} href={sanitizeHref(n.href)} target={n.open_in_new_tab ? "_blank" : undefined} rel={n.open_in_new_tab ? "noopener noreferrer" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-cta">
          {(facebookUrl || instagramUrl) && (
            <div className="header-social">
              {facebookUrl && (
                <a href={sanitizeHref(facebookUrl)} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <IconFacebook />
                </a>
              )}
              {instagramUrl && (
                <a href={sanitizeHref(instagramUrl)} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <IconInstagram />
                </a>
              )}
            </div>
          )}
          <QuoteButton className="btn btn-gold">קבלו הצעת מחיר</QuoteButton>
        </div>
        <button
          className="nav-toggle"
          aria-label="פתיחת תפריט"
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
      </div>
      <div className={`mobile-nav${open ? " open" : ""}`} aria-hidden={!open}>
        <button className="close-x" aria-label="סגירת תפריט" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          ×
        </button>
        <div className="mobile-nav-brand">
          <Image src={logoUrl || "/brand/symbol-white.png"} alt="Metaline" width={30} height={30} />
          <span>Metaline</span>
        </div>
        {navItems.map((n) => (
          <Link
            key={n.id}
            href={sanitizeHref(n.href)}
            target={n.open_in_new_tab ? "_blank" : undefined}
            rel={n.open_in_new_tab ? "noopener noreferrer" : undefined}
            onClick={() => setOpen(false)}
          >
            {n.label}
          </Link>
        ))}
        <QuoteButton className="btn btn-gold" style={{ marginTop: 20 }} onOpen={() => setOpen(false)}>
          קבלו הצעת מחיר
        </QuoteButton>
        {(facebookUrl || instagramUrl) && (
          <div className="header-social mobile">
            {facebookUrl && (
              <a href={sanitizeHref(facebookUrl)} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <IconFacebook />
              </a>
            )}
            {instagramUrl && (
              <a href={sanitizeHref(instagramUrl)} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <IconInstagram />
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

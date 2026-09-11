"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuoteButton } from "@/components/QuoteModal";

const NAV = [
  { href: "/", label: "בית" },
  { href: "/about", label: "אודות" },
  { href: "/services", label: "שירותים" },
  { href: "/gallery", label: "גלריה" },
  { href: "/contact", label: "צור קשר" },
];

export default function SiteHeader() {
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
          <img src="/brand/symbol-white.png" alt="Metaline" />
          <span className="brand-name">Metaline</span>
        </Link>
        <nav className="nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-cta">
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
      <div className={`mobile-nav${open ? " open" : ""}`}>
        <button className="close-x" aria-label="סגירת תפריט" onClick={() => setOpen(false)}>
          ×
        </button>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </Link>
        ))}
        <QuoteButton className="btn btn-gold" style={{ marginTop: 20 }} onOpen={() => setOpen(false)}>
          קבלו הצעת מחיר
        </QuoteButton>
      </div>
    </header>
  );
}

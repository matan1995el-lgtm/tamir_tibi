"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Global interaction layer for the public site:
 * - scroll progress bar
 * - custom cursor (ring + dot, fine pointers only)
 * - scroll-triggered reveal animations (.reveal / .reveal-stagger)
 * - pointer-tracked 3D tilt for .tilt-wrap / .gal-wrap / .cmp-wrap cards
 *
 * Mounted once in the (site) layout, which — by design — does NOT remount
 * on client-side navigation between site pages (that's what lets the
 * header/footer persist). The reveal/tilt behaviour, though, targets DOM
 * nodes that belong to whichever page is currently rendered, so it has to
 * re-scan every time the route changes, not just once on first load —
 * otherwise every page reached via a nav click (as opposed to a hard
 * refresh) would have its content permanently stuck at opacity:0. That
 * effect is keyed on `pathname` below for exactly this reason.
 */
export default function ScrollFX() {
  const progressRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // ---- scroll progress + custom cursor: page-independent, once ----
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    function onScroll() {
      const bar = progressRef.current;
      if (!bar) return;
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let cursorRaf = 0;
    let cleanupCursor: (() => void) | null = null;
    if (fine && !reducedMotion && wrapRef.current) {
      wrapRef.current.classList.add("cursor-active");
      const onMove = (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
        if (dotRef.current) {
          dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        }
        const target = e.target as HTMLElement | null;
        const isInteractive = !!target?.closest(
          "a, button, .tilt-wrap, .gal-wrap, .cmp-wrap, input, textarea, select, [role='button']"
        );
        wrapRef.current?.classList.toggle("cursor-hover", isInteractive);
      };
      const tick = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        }
        cursorRaf = requestAnimationFrame(tick);
      };
      window.addEventListener("mousemove", onMove);
      cursorRaf = requestAnimationFrame(tick);

      cleanupCursor = () => {
        window.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(cursorRaf);
      };
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cleanupCursor?.();
    };
  }, []);

  // ---- reveal-on-scroll + pointer tilt: re-scan on every route change ----
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const cleanupRef = { current: { revealObserver: null as IntersectionObserver | null, tiltCleanups: [] as Array<() => void> } };

    // Run after paint so the new page's DOM (and its real layout/size) is
    // actually in place before we measure it.
    const raf = requestAnimationFrame(() => {
      const revealEls = Array.from(document.querySelectorAll(".reveal, .reveal-stagger, .gate-divider"));
      let revealObserver: IntersectionObserver | null = null;
      if (revealEls.length) {
        revealObserver = new IntersectionObserver(
          (entries, obs) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                obs.unobserve(entry.target);
              }
            }
          },
          // threshold 0 + a generous bottom margin: a section should start
          // revealing as soon as it's approaching the viewport, not only
          // once 15% of it has scrolled into view. With near-full-height
          // hero sections, a stricter threshold left the very next
          // section sitting at opacity:0 (invisible, not just faded) on
          // first paint — on short pages it never crossed the threshold
          // at all without the visitor manually scrolling, which read as
          // "the page is empty".
          { threshold: 0, rootMargin: "0px 0px 15% 0px" }
        );
        revealEls.forEach((el) => revealObserver!.observe(el));

        // Belt-and-suspenders: anything already in (or overlapping) the
        // viewport right now should be visible immediately, not wait a
        // frame for the observer's first callback.
        const vh = window.innerHeight || document.documentElement.clientHeight;
        revealEls.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            el.classList.add("in-view");
            revealObserver?.unobserve(el);
          }
        });
      }
      cleanupRef.current.revealObserver = revealObserver;

      const tiltCleanups: Array<() => void> = [];
      if (fine && !reducedMotion) {
        const hosts = Array.from(document.querySelectorAll<HTMLElement>(".tilt-wrap, .gal-wrap, .cmp-wrap"));
        hosts.forEach((host) => {
          const card = host.firstElementChild as HTMLElement | null;
          if (!card) return;
          const onMove = (e: MouseEvent) => {
            const r = host.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg) translateZ(18px) translateY(-6px)`;
          };
          const onLeave = () => {
            card.style.transform = "";
          };
          host.addEventListener("mousemove", onMove);
          host.addEventListener("mouseleave", onLeave);
          tiltCleanups.push(() => {
            host.removeEventListener("mousemove", onMove);
            host.removeEventListener("mouseleave", onLeave);
          });
        });
      }
      cleanupRef.current.tiltCleanups = tiltCleanups;
    });

    return () => {
      cancelAnimationFrame(raf);
      cleanupRef.current.revealObserver?.disconnect();
      cleanupRef.current.tiltCleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return (
    <div ref={wrapRef}>
      <div id="scroll-progress" aria-hidden="true">
        <div className="bar" ref={progressRef} />
      </div>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </div>
  );
}

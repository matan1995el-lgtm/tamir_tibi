"use client";

import { useEffect, useRef } from "react";

/**
 * Global interaction layer for the public site:
 * - scroll progress bar
 * - custom cursor (ring + dot, fine pointers only)
 * - scroll-triggered reveal animations (.reveal / .reveal-stagger)
 * - pointer-tracked 3D tilt for .tilt-wrap / .gal-wrap / .cmp-wrap cards
 *
 * Mounted once in the (site) layout. No visible markup beyond the
 * progress bar + cursor elements — everything else attaches behavior
 * to existing DOM via class names, so pages stay server components.
 */
export default function ScrollFX() {
  const progressRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    // ---- scroll progress ----
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

    // ---- custom cursor ----
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

    // ---- reveal on scroll ----
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
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => revealObserver!.observe(el));
    }

    // ---- pointer tilt ----
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

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cleanupCursor?.();
      revealObserver?.disconnect();
      tiltCleanups.forEach((fn) => fn());
    };
  }, []);

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

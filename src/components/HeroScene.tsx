"use client";

import { useEffect, useRef } from "react";
import { ArtHeroMotif } from "@/components/PlaceholderArt";

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let particles: { x: number; y: number; r: number; vy: number; vx: number; o: number; phase: number; speed: number }[] = [];

    function resize() {
      const parent = canvas!.parentElement;
      w = canvas!.width = parent ? parent.clientWidth : window.innerWidth;
      h = canvas!.height = parent ? parent.clientHeight : window.innerHeight;
      const count = Math.min(80, Math.floor((w * h) / 20000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.7 + 0.4,
        vy: Math.random() * 0.25 + 0.05,
        vx: (Math.random() - 0.5) * 0.08,
        o: Math.random() * 0.45 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.4,
      }));
    }

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let t = 0;
    function draw() {
      if (!ctx) return;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        // gentle twinkle — sine-modulated opacity so the dust reads as
        // fine drifting metal filings catching light, not flat dots
        const twinkle = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * p.speed + p.phase);
        ctx.beginPath();
        ctx.fillStyle = `rgba(212,175,55,${(p.o * twinkle).toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduced) {
          p.y -= p.vy;
          p.x += p.vx;
          if (p.y < -4) p.y = h + 4;
          if (p.x < -4) p.x = w + 4;
          if (p.x > w + 4) p.x = -4;
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <ArtHeroMotif className="hero-motif" />
      <canvas id="dust" ref={canvasRef} aria-hidden="true" />
    </>
  );
}

export function LogoEmblem() {
  const ticks = [0, 60, 120, 180, 240, 300];
  const sparks = [0, 1, 2];
  const layers = ["L1", "L2", "L3", "L4", "L5", "Ltop"];
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Pointer-tracked parallax: the emblem leans gently toward the cursor,
  // on top of (not instead of) its own continuous ambient sway keyframe —
  // the sway lives on .logo-wrap, this tilt lives one level up on
  // .orbit-parallax, so the two transforms never collide.
  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0, ty = 0, rafId = 0;
    function onMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      tx = Math.max(-1, Math.min(1, nx)) * 10;
      ty = Math.max(-1, Math.min(1, ny)) * -7;
    }
    let curX = 0, curY = 0;
    function tick() {
      curX += (tx - curX) * 0.06;
      curY += (ty - curY) * 0.06;
      el!.style.setProperty("--tilt-x", `${curX.toFixed(2)}deg`);
      el!.style.setProperty("--tilt-y", `${curY.toFixed(2)}deg`);
      rafId = requestAnimationFrame(tick);
    }
    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="orbit-parallax" ref={parallaxRef}>
      <div className="orbit-stage" role="img" aria-label="Metaline — סמל תלת ממדי">
        <div className="logo-halo" aria-hidden="true" />
        <div className="ring-deco r1" aria-hidden="true">
          {ticks.map((deg) => (
            <span key={deg} className="tick" style={{ transform: `rotate(${deg}deg) translateY(-160px)` }} />
          ))}
        </div>
        <div className="ring-deco r2" aria-hidden="true" />
        {sparks.map((i) => (
          <div
            key={i}
            className="spark"
            aria-hidden="true"
            style={{
              animationDuration: `${9 + i * 3}s`,
              animationDelay: `${i * -3}s`,
            }}
          />
        ))}
        <div className="logo-wrap">
          <div className="logo-plaque">
            <div className="sheen" />
            <div className="logo-extrude">
              {layers.map((cls) => (
                <img key={cls} className={cls} src="/brand/symbol-white.png" alt={cls === "Ltop" ? "Metaline" : ""} />
              ))}
            </div>
            <div className="corner-frame" aria-hidden="true">
              <i /><i /><i /><i />
            </div>
          </div>
          <div className="logo-floor" />
        </div>
        <div className="logo-reflection" aria-hidden="true">
          <img src="/brand/symbol-white.png" alt="" />
        </div>
      </div>
    </div>
  );
}

export function GateDivider() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="gate-divider" ref={ref} aria-hidden="true">
      <div className="gd-panel l" />
      <div className="gd-panel r" />
      <div className="gd-seam" />
    </div>
  );
}

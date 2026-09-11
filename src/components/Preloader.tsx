"use client";

import { useEffect, useState } from "react";

/**
 * Gate-open intro: two panels slide apart to reveal the site, once per
 * browser session (not replayed on client-side route navigations, since
 * the (site) layout persists across those — and not replayed on repeat
 * visits within the same tab via sessionStorage).
 */
export default function Preloader() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("metaline-intro-seen") === "1";
    } catch {
      seen = false;
    }

    if (reduced || seen) {
      // sessionStorage/matchMedia are browser-only — this can't be known
      // during server render, so the check has to happen in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(true);
      return;
    }

    const openTimer = setTimeout(() => setOpen(true), 250);
    const doneTimer = setTimeout(() => {
      setDone(true);
      try {
        sessionStorage.setItem("metaline-intro-seen", "1");
      } catch {
        /* ignore */
      }
    }, 1500);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (done) return null;

  return (
    <div id="preloader" className={open ? "open" : ""} aria-hidden="true">
      <div className="pl-panel l" />
      <div className="pl-panel r" />
      <img className="pl-mark" src="/brand/symbol-white.png" alt="" />
    </div>
  );
}

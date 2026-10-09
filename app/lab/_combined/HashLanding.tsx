"use client";

import { useEffect } from "react";

// Opening the page on a section link (/#results): the browser jumps once,
// early, and parts above the section can still change height after it
// (Method 03's chart measures its width and, on phones, stacks its two
// plots). Until the visitor scrolls, taps or types, or 3 s pass, keep the
// section at the top whenever the page's height changes (bug found
// 2026-10-09: phones landed 400-650 px short).
const STOP = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

export default function HashLanding() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    const ro = new ResizeObserver(() => el.scrollIntoView({ block: "start" }));
    const stop = () => {
      ro.disconnect();
      clearTimeout(timer);
      STOP.forEach((e) => removeEventListener(e, stop));
    };
    const timer = setTimeout(stop, 3000);
    STOP.forEach((e) => addEventListener(e, stop, { passive: true }));
    ro.observe(document.body);
    return stop;
  }, []);
  return null;
}

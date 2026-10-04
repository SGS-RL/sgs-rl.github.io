"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

// Content width of an element, floored to whole pixels.
export function useWidth<T extends HTMLElement>(): [
  RefObject<T | null>,
  number,
] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setWidth(Math.floor(e.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

// Viewport height, for capping chart heights on short, wide screens.
export function useViewportHeight() {
  const [h, setH] = useState(900);
  useEffect(() => {
    const on = () => setH(window.innerHeight);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return h;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

// True while the element is on screen (or within `margin` of it).
export function useInView(
  ref: RefObject<Element | null>,
  {
    threshold = 0,
    margin = "0px",
  }: { threshold?: number; margin?: string } = {},
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold,
      rootMargin: margin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, margin]);
  return inView;
}

// The value, once it has stopped changing for `ms`. Sweeping a pointer
// across a chart then loads only the clip it comes to rest on.
export function useSettled<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return settled;
}

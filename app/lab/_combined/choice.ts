"use client";

import { useSyncExternalStore } from "react";

// A choice the owner flips with a switch while comparing versions in place
// (header layout, summary size, width, stroke). Read from the address
// first (?param=value, so a link or a screenshot can name a version), then
// from this browser's memory; the static HTML always renders the fallback.
// Choosing writes both.
export function makeChoice<T extends string>(
  key: string,
  options: readonly T[],
  fallback: T,
  param?: string,
) {
  const listeners = new Set<() => void>();
  const valid = (v: string | null): v is T =>
    v !== null && options.includes(v as T);
  const read = (): T => {
    try {
      const fromUrl = param
        ? new URLSearchParams(window.location.search).get(param)
        : null;
      if (valid(fromUrl)) return fromUrl;
      const v = localStorage.getItem(key);
      return valid(v) ? v : fallback;
    } catch {
      return fallback;
    }
  };
  const subscribe = (fn: () => void) => {
    listeners.add(fn);
    window.addEventListener("storage", fn);
    return () => {
      listeners.delete(fn);
      window.removeEventListener("storage", fn);
    };
  };
  return {
    options,
    choose(v: T) {
      try {
        localStorage.setItem(key, v);
        if (param) {
          const url = new URL(window.location.href);
          url.searchParams.set(param, v);
          window.history.replaceState(null, "", url);
        }
      } catch {}
      listeners.forEach((fn) => fn());
    },
    useValue() {
      return useSyncExternalStore(subscribe, read, () => fallback);
    },
  };
}

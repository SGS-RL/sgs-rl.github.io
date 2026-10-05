"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Item } from "../library";
import { holdMedia } from "../_gallery/media";
import { groupItems, type Group } from "./data";
import Player from "./Player";
import "../_gallery/gallery.css";

// Copy of _gallery/ClipGallery for the owner's footage: items carry their
// own aspect (pairs are 32:9), and groups split each robot into simulation
// and hardware. Swiss skin only.

export type Gallery = {
  items: Item[];
  groups: Group[];
  // Play order: the collection grouped by robot and domain.
  order: Item[];
  num: (c: Item) => string;
  open: (c: Item, trigger?: HTMLElement | null) => void;
  current: Item | null;
};

const Ctx = createContext<Gallery | null>(null);

export function useGallery() {
  const g = useContext(Ctx);
  if (!g) throw new Error("Gallery parts must sit inside <Gallery>.");
  return g;
}

// The open clip lives in the URL hash (#clip-007), so a clip can be linked
// and the browser's Back button closes the player.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("popstate", cb);
  window.addEventListener("hashchange", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("popstate", cb);
    window.removeEventListener("hashchange", cb);
  };
}
const readHash = () => window.location.hash;
function writeHash(hash: string, mode: "push" | "replace") {
  const url = hash || window.location.pathname + window.location.search;
  if (mode === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
  listeners.forEach((l) => l());
}

export default function Gallery({
  items,
  children,
}: {
  items: Item[];
  children: ReactNode;
}) {
  const groups = useMemo(() => groupItems(items), [items]);
  const order = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const digits = Math.max(3, String(items.length).length);
  const num = useCallback(
    (c: Item) => String(items.indexOf(c) + 1).padStart(digits, "0"),
    [items, digits],
  );
  const hashOf = useCallback((c: Item) => `#clip-${num(c)}`, [num]);

  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const current = order.find((c) => hashOf(c) === hash) ?? null;
  const index = current ? order.indexOf(current) : -1;

  const pushed = useRef(false);
  const trigger = useRef<HTMLElement | null>(null);
  const lastId = useRef<string | null>(null);
  const anchor = useRef<HTMLSpanElement>(null);

  const open = useCallback(
    (c: Item, t?: HTMLElement | null) => {
      trigger.current = t ?? (document.activeElement as HTMLElement | null);
      const replace = Boolean(document.querySelector("[data-gal-player]"));
      if (!replace) pushed.current = true;
      writeHash(hashOf(c), replace ? "replace" : "push");
    },
    [hashOf],
  );

  const move = useCallback(
    (i: number) =>
      writeHash(hashOf(order[(i + order.length) % order.length]), "replace"),
    [hashOf, order],
  );

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else writeHash("", "replace");
  }, []);

  // Hold page media while open; on close, return focus to the tile.
  useEffect(() => {
    if (current) {
      lastId.current = current.id;
      holdMedia(true);
      return;
    }
    holdMedia(false);
    pushed.current = false;
    const id = lastId.current;
    if (!id) return;
    lastId.current = null;
    const t = trigger.current;
    trigger.current = null;
    if (t?.isConnected && t !== document.body) {
      t.focus({ preventScroll: true });
      return;
    }
    // Opened from a link: land on the clip's tile in the collection.
    const tile =
      document.querySelector<HTMLElement>(
        `[data-gal-primary][data-gal-clip="${id}"]`,
      ) ?? document.querySelector<HTMLElement>(`[data-gal-clip="${id}"]`);
    if (tile) {
      tile.focus({ preventScroll: true });
      tile.scrollIntoView({ block: "center" });
    }
  }, [current]);

  const value = useMemo(
    () => ({ items, groups, order, num, open, current }),
    [items, groups, order, num, open, current],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <span ref={anchor} hidden />
      {current && (
        <Player
          order={order}
          groups={groups}
          index={index}
          num={num}
          anchor={anchor}
          onMove={move}
          onClose={close}
        />
      )}
    </Ctx.Provider>
  );
}

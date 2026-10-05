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
import "../_gallery/gallery.css";
import Player from "./Player";
import { groupItems, type ItemGroup } from "./items";

// A copy of _gallery/ClipGallery for the owner's footage (LIBRARY). Same
// behaviour (the open clip lives in the URL hash, Back closes the player,
// page media is held while it is open); the differences are in the player,
// which keeps each clip's own aspect (the UR5e pairs are 32:9) and labels
// the two sides of a pair.

export type Gallery3 = {
  clips: Item[];
  groups: ItemGroup[];
  // Play order: the collection grouped by robot.
  order: Item[];
  num: (c: Item) => string;
  open: (c: Item, opts?: { trigger?: HTMLElement | null }) => void;
};

const Ctx = createContext<Gallery3 | null>(null);

export function useGallery() {
  const g = useContext(Ctx);
  if (!g) throw new Error("Gallery parts must sit inside <Gallery>.");
  return g;
}

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
  clips,
  children,
}: {
  clips: Item[];
  children: ReactNode;
}) {
  const groups = useMemo(() => groupItems(clips), [clips]);
  const order = useMemo(() => groups.flatMap((g) => g.clips), [groups]);
  const num = useCallback(
    (c: Item) => String(order.indexOf(c) + 1).padStart(3, "0"),
    [order],
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
    (c: Item, opts?: { trigger?: HTMLElement | null }) => {
      trigger.current =
        opts?.trigger ?? (document.activeElement as HTMLElement | null);
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
    () => ({ clips, groups, order, num, open }),
    [clips, groups, order, num, open],
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

"use client";

// Copy of _gallery/ClipGallery for /lab/poster-3, for the owner's footage
// (LIBRARY items). Changes: items carry their aspect and kind, and the
// player is the aspect-aware copy in ./Player (UR5e simulation pairs are
// 32:9 and are never cropped). Media playback still goes through
// _gallery/media, so tiles from either gallery share one set of observers.

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
import { groupByRobot, type Group } from "./data";
import Player from "./Player";
import "../_poster/poster.css";
import "../_gallery/gallery.css";

export type GalleryContext = {
  clips: Item[];
  groups: Group[];
  // Play order: the collection grouped by robot.
  order: Item[];
  num: (c: Item) => string;
  open: (c: Item, trigger?: HTMLElement | null) => void;
  current: Item | null;
};

const Ctx = createContext<GalleryContext | null>(null);

export function useGallery() {
  const g = useContext(Ctx);
  if (!g) throw new Error("Poster 3 parts must sit inside <Gallery>.");
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
  clips,
  hashPrefix = "clip-",
  children,
}: {
  clips: Item[];
  hashPrefix?: string;
  children: ReactNode;
}) {
  const groups = useMemo(() => groupByRobot(clips), [clips]);
  const order = useMemo(() => groups.flatMap((g) => g.clips), [groups]);
  const digits = Math.max(3, String(clips.length).length);
  const num = useCallback(
    // By id: items may be copies (props from a server component).
    (c: Item) =>
      String(clips.findIndex((k) => k.id === c.id) + 1).padStart(digits, "0"),
    [clips, digits],
  );
  const hashOf = useCallback(
    (c: Item) => `#${hashPrefix}${num(c)}`,
    [hashPrefix, num],
  );

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

  // Hold page media while open; on close, return focus to the trigger.
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
    // Opened from a link: land on the clip's first tile on the page.
    const tile = document.querySelector<HTMLElement>(`[data-gal-clip="${id}"]`);
    if (tile) {
      tile.focus({ preventScroll: true });
      tile.scrollIntoView({ block: "center" });
    }
  }, [current]);

  const value = useMemo(
    () => ({ clips, groups, order, num, open, current }),
    [clips, groups, order, num, open, current],
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

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { CLIPS, type Clip } from "../content";
import { groupByRobot, type RobotGroup, type Skin } from "./data";
import { holdMedia } from "./media";
import Player from "./Player";
import "../_poster/poster.css";
import "./gallery.css";

export type OpenOptions = {
  // Skin of the player; defaults to the gallery's skin.
  skin?: Skin;
  // Element to focus when the player closes; defaults to the focused one.
  trigger?: HTMLElement | null;
};

export type GalleryContext = {
  clips: Clip[];
  groups: RobotGroup[];
  // Play order: the collection grouped by robot.
  order: Clip[];
  skin: Skin;
  num: (c: Clip) => string;
  open: (c: Clip, opts?: OpenOptions) => void;
  current: Clip | null;
};

const Ctx = createContext<GalleryContext | null>(null);

export function useClipGallery() {
  const g = useContext(Ctx);
  if (!g) throw new Error("Gallery components must sit inside <ClipGallery>.");
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

// Provider for the wall, grid and quilt: numbers the clips, holds the open
// clip and renders the player. Use one per page.
export default function ClipGallery({
  clips = CLIPS,
  skin = "swiss",
  hashPrefix = "clip-",
  children,
}: {
  clips?: Clip[];
  skin?: Skin;
  hashPrefix?: string;
  children: ReactNode;
}) {
  const groups = useMemo(() => groupByRobot(clips), [clips]);
  const order = useMemo(() => groups.flatMap((g) => g.clips), [groups]);
  const digits = Math.max(3, String(clips.length).length);
  const num = useCallback(
    (c: Clip) => String(clips.indexOf(c) + 1).padStart(digits, "0"),
    [clips, digits],
  );
  const hashOf = useCallback(
    (c: Clip) => `#${hashPrefix}${num(c)}`,
    [hashPrefix, num],
  );

  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const current = order.find((c) => hashOf(c) === hash) ?? null;
  const index = current ? order.indexOf(current) : -1;

  const [openSkin, setOpenSkin] = useState<Skin | null>(null);
  const pushed = useRef(false);
  const trigger = useRef<HTMLElement | null>(null);
  const lastId = useRef<string | null>(null);
  const anchor = useRef<HTMLSpanElement>(null);

  const open = useCallback(
    (c: Clip, opts?: OpenOptions) => {
      trigger.current =
        opts?.trigger ?? (document.activeElement as HTMLElement | null);
      setOpenSkin(opts?.skin ?? null);
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
    () => ({ clips, groups, order, skin, num, open, current }),
    [clips, groups, order, skin, num, open, current],
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
          skin={openSkin ?? skin}
          anchor={anchor}
          onMove={move}
          onClose={close}
        />
      )}
    </Ctx.Provider>
  );
}

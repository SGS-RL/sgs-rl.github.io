// Playback for every tile video in the gallery, through two shared
// IntersectionObservers rather than one per tile, so a collection of 40–80
// clips stays cheap:
//
// - near the viewport (one screen above or below): poster and source are
//   attached; further away the source is dropped again to free decoders;
// - on screen: the video plays; off screen it pauses.
//
// While the player is open everything here is held (paused, nothing new
// loads), so only the player's video downloads.

type Entry = {
  video: HTMLVideoElement;
  src: string;
  poster?: string;
  near: boolean;
  visible: boolean;
  attached: boolean;
};

const entries = new Map<Element, Entry>();
let nearIO: IntersectionObserver | null = null;
let seenIO: IntersectionObserver | null = null;
let held = false;
let reduce: boolean | null = null;

export function prefersReducedMotion() {
  if (reduce === null)
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduce;
}

function sync(e: Entry) {
  const v = e.video;
  if (e.near && !e.attached && !held) {
    if (e.poster) v.poster = e.poster;
    // Reduced motion: posters only. The player shows controls instead.
    if (!prefersReducedMotion()) {
      v.preload = "auto";
      v.src = e.src;
    }
    e.attached = true;
  } else if (!e.near && e.attached) {
    v.pause();
    if (v.hasAttribute("src")) {
      v.removeAttribute("src");
      v.load();
    }
    e.attached = false;
  }
  const play = e.attached && e.visible && !held && !prefersReducedMotion();
  if (play && v.paused) v.play().catch(() => {});
  else if (!play && !v.paused) v.pause();
}

function observers() {
  if (nearIO && seenIO) return { nearIO, seenIO };
  nearIO = new IntersectionObserver(
    (list) =>
      list.forEach((x) => {
        const e = entries.get(x.target);
        if (!e) return;
        e.near = x.isIntersecting;
        sync(e);
      }),
    { rootMargin: "100% 0px 100% 0px" },
  );
  seenIO = new IntersectionObserver(
    (list) =>
      list.forEach((x) => {
        const e = entries.get(x.target);
        if (!e) return;
        e.visible = x.isIntersecting;
        sync(e);
      }),
    { threshold: 0.1 },
  );
  return { nearIO, seenIO };
}

// Register a muted looping <video> (rendered without src). Returns the
// cleanup function, for use straight from useEffect.
export function registerVideo(
  video: HTMLVideoElement,
  src: string,
  poster?: string,
) {
  const e: Entry = {
    video,
    src,
    poster,
    near: false,
    visible: false,
    attached: false,
  };
  entries.set(video, e);
  const io = observers();
  io.nearIO.observe(video);
  io.seenIO.observe(video);
  return () => {
    io.nearIO.unobserve(video);
    io.seenIO.unobserve(video);
    entries.delete(video);
    video.pause();
  };
}

// Videos outside the gallery (a reel, a hero) that were playing when the
// player opened; they resume when it closes.
let pausedOthers: HTMLVideoElement[] = [];

export function holdMedia(on: boolean) {
  if (on === held) return;
  held = on;
  entries.forEach(sync);
  if (on) {
    pausedOthers = [...document.querySelectorAll("video")].filter(
      (v) => !v.paused && !entries.has(v) && !v.closest("[data-gal-player]"),
    );
    pausedOthers.forEach((v) => v.pause());
  } else {
    pausedOthers.forEach((v) => v.isConnected && v.play().catch(() => {}));
    pausedOthers = [];
  }
}

export const mediaHeld = () => held;

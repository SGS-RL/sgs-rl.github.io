// Pieces shared by the page's own video players (ClipsViews.tsx,
// RunPlayer.tsx): the icons, full screen, and where the 1080p downloads
// are. Locally and on the Cloudflare preview they are files of the site;
// on GitHub Pages they are assets of the media release, and the deploy
// workflow sets NEXT_PUBLIC_DOWNLOAD_BASE to it
// (scripts/lab/release_media.sh).

export const DOWNLOAD_BASE =
  process.env.NEXT_PUBLIC_DOWNLOAD_BASE ?? "/lab/media/library/download";

export type Kind =
  "play" | "pause" | "full" | "prev" | "next" | "close" | "down";
const PATHS: Record<Kind, string> = {
  play: "M2 0.8 11.2 6 2 11.2Z",
  pause: "M1.5 1h3.2v10H1.5zM7.3 1h3.2v10H7.3z",
  full: "M0.5 0.5h4.5v1.6H2.1v2.9H0.5zM7 0.5h4.5v4.5H9.9V2.1H7zM0.5 7h1.6v2.9H5v1.6H0.5zM9.9 7h1.6v4.5H7V9.9h2.9z",
  prev: "M8.6 0.6 9.9 1.9 5.8 6l4.1 4.1-1.3 1.3L3.2 6z",
  next: "M3.4 0.6 8.8 6l-5.4 5.4-1.3-1.3L6.2 6 2.1 1.9z",
  close: "M2 0.7 6 4.7 10 0.7 11.3 2 7.3 6l4 4-1.3 1.3-4-4-4 4L0.7 10l4-4-4-4z",
  down: "M5.1 0.5h1.8v6.3l2.3-2.3 1.3 1.3L6 10.3 1.5 5.8l1.3-1.3 2.3 2.3zM0.8 10.6h10.4v1.4H0.8z",
};
export function Glyph({ k }: { k: Kind }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="kv-glyph">
      <path d={PATHS[k]} />
    </svg>
  );
}

export type FsVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

// Full screen for the video's frame; on iPhone (no full screen for other
// elements) the browser's own video player. Again to leave it.
export function fullscreen(box: HTMLElement | null, v: FsVideo | null) {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
    return;
  }
  if (box?.requestFullscreen)
    box.requestFullscreen().catch(() => v?.webkitEnterFullscreen?.());
  else v?.webkitEnterFullscreen?.();
}

"use client";

import { useEffect } from "react";
import { CODE_URL, PAPER_URL } from "../lab/_combined/content";
import { SECTIONS } from "../lab/_combined/sections";

// Visitor stats (owner, 2026-10-09), with Umami Cloud
// (https://cloud.umami.is): no cookies, so no consent banner. Mounted by
// app/page.tsx only, so the /lab/ pages are not counted, and the script
// counts on sgs-rl.github.io only, not on localhost or the Cloudflare
// preview. Nothing loads until UMAMI_WEBSITE_ID is set.
//
// Umami counts visitors, page views, referrers, countries and devices by
// itself. This adds events, all read from the page from outside (clicks
// on the document, an observer on the sections), so the page's
// components need no changes:
//   Reached <part>       a section or part sat mid-screen for a second
//                        (Summary, Overview, the Method's and the Results'
//                        parts, Clips, BibTeX, End of page); once each
//   Arrived at <section> the page opened on a link to a section (#clips)
//   Paper link, Code link        { place: bar | menu | header }
//   Menu link            the bar's or the phone menu's sections { to }
//   Outbound link        any other link off the site { url }
//   Highlights chapter   a chapter picked in the list { chapter }
//   Opened clip          a tile in Clips { clip }
//   Opened run           a continuous run opened large { run }
//   Full screen          { video } (the reel, a clip or a run)
//   Downloaded           a 1080p file { file }
//   Copied BibTeX
//   Used figure          the first tap in a Method or Results figure
//                        { figure }; once each
// Ids are the library's (app/lab/library.ts), taken from the video's file.
//
// ?analytics=off stops counting this browser (for the authors' own
// visits; Umami's "umami.disabled" switch), ?analytics=on counts it again.

export const UMAMI_WEBSITE_ID = "2231cf87-d8c2-4e97-a916-15608196ec74";
const UMAMI_SRC = "https://cloud.umami.is/script.js";
const DOMAINS = "sgs-rl.github.io";

type Data = Record<string, string>;
declare global {
  interface Window {
    umami?: { track: (name: string, data?: Data) => unknown };
  }
}

// Events from before the script has loaded wait for it.
const queue: [string, Data | undefined][] = [];
const ready = () => typeof window.umami?.track === "function";
function track(name: string, data?: Data) {
  if (ready()) window.umami!.track(name, data);
  else if (queue.length < 50) queue.push([name, data]);
}
function flush() {
  while (ready() && queue.length) {
    const [name, data] = queue.shift()!;
    window.umami!.track(name, data);
  }
}

// Parts counted as reached: the nav's sections, with the Method and the
// Results by part. Highlights is the first screen, so it is left out.
const PARTS: [string, string][] = [
  ["summary", "Summary"],
  ["overview", "Overview"],
  ["method-ppo", "Method: The change to PPO"],
  ["method-configurations", "Method: Task configurations"],
  ["method-during", "Method: Sampling during training"],
  ["results-scaling", "Results: Scaling"],
  ["results-real", "Results: Real world"],
  ["results-runs", "Results: Continuous runs"],
  ["clips", "Clips"],
  ["bibtex", "BibTeX"],
];
const FIGURES: Record<string, string> = {
  "method-configurations": "Task configurations",
  "method-during": "Sampling during training",
  "results-scaling": "Scaling",
};

// "…/clips/ur5e-real-nut-4.jpg", "…/runs/anymal-c-1m-fast.mp4" → the id.
function mediaId(url: string | null | undefined) {
  const m = url?.match(/\/([^/?#]+?)(?:-fast)?\.(?:jpg|mp4)(?:[?#]|$)/);
  return m?.[1];
}
const videoIn = (el: Element | null) =>
  mediaId(el?.querySelector("video")?.getAttribute("poster"));

function onClick(e: MouseEvent) {
  const t = e.target as Element | null;
  if (!t?.closest) return;

  const a = t.closest<HTMLAnchorElement>("a[href]");
  if (a) {
    const href = a.getAttribute("href")!;
    const place = a.closest('[role="dialog"]')
      ? "menu"
      : a.closest("header")
        ? "header"
        : "bar";
    if (a.hasAttribute("download"))
      track("Downloaded", { file: mediaId(a.href) ?? a.href });
    else if (href === PAPER_URL) track("Paper link", { place });
    else if (href === CODE_URL) track("Code link", { place });
    else if (href.startsWith("#")) {
      if (a.closest("nav") || href === "#top")
        track("Menu link", { to: a.textContent?.trim() || href });
    } else if (a.origin !== location.origin)
      track("Outbound link", { url: a.href });
    return;
  }

  const chapter = t.closest(
    "#highlights :is(.cb-list-chip, .cb-list-row, .cb-index-row, .cb-reel-chap)",
  );
  if (chapter) {
    const num = chapter.querySelector(".pz-num")?.textContent ?? "";
    const name = (chapter.textContent ?? "").replace(num, "").trim();
    const n =
      num ||
      String(
        [...(chapter.parentElement?.children ?? [])].indexOf(chapter) + 1,
      ).padStart(2, "0");
    track("Highlights chapter", { chapter: `${n} ${name}` });
    return;
  }

  const tile = t.closest(".kv-tile");
  if (tile) {
    track("Opened clip", { clip: videoIn(tile) ?? "?" });
    return;
  }
  if (t.closest('.kv-frame-open, button[aria-label="Open large"]')) {
    track("Opened run", { run: videoIn(t.closest(".kv-stage")) ?? "?" });
    return;
  }
  if (t.closest('button[aria-label="Full screen"]')) {
    const video = t.closest("#highlights")
      ? "Highlights"
      : (videoIn(t.closest(".kv-stage")) ?? "?");
    track("Full screen", { video });
    return;
  }
  if (t.closest(".cb-bib-copy")) track("Copied BibTeX");
}

export default function Analytics() {
  useEffect(() => {
    try {
      const v = new URLSearchParams(location.search).get("analytics");
      if (v === "off") localStorage.setItem("umami.disabled", "1");
      if (v === "on") localStorage.removeItem("umami.disabled");
    } catch {}

    // Not id="umami": an element's id becomes a window property, and the
    // script then finds window.umami taken and leaves its API out.
    if (UMAMI_WEBSITE_ID && !document.getElementById("umami-script")) {
      const s = document.createElement("script");
      s.id = "umami-script";
      s.defer = true;
      s.src = UMAMI_SRC;
      s.dataset.websiteId = UMAMI_WEBSITE_ID;
      s.dataset.domains = DOMAINS;
      // One page in the stats, not one per #section.
      s.dataset.excludeHash = "true";
      s.onload = flush;
      document.head.appendChild(s);
    }

    const label = new Map(SECTIONS);
    const arrived = location.hash.slice(1);
    if (label.has(arrived)) track(`Arrived at ${label.get(arrived)}`);

    // Reached: the part covers the middle tenth of the screen for a
    // second, so a jump from the menu does not count what it scrolls past.
    const seen = new Set<string>();
    const timers = new Map<Element, number>();
    const names = new Map<Element, string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const name = names.get(e.target)!;
          if (e.isIntersecting && !seen.has(name)) {
            timers.set(
              e.target,
              window.setTimeout(() => {
                seen.add(name);
                io.unobserve(e.target);
                track(`Reached ${name}`);
              }, 1000),
            );
          } else if (!e.isIntersecting) {
            clearTimeout(timers.get(e.target));
            timers.delete(e.target);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    const watch = (el: Element | null, name: string) => {
      if (!el) return;
      names.set(el, name);
      io.observe(el);
    };
    for (const [id, name] of PARTS) {
      const el = document.getElementById(id);
      // The Results' bands carry the id; count their whole part.
      watch(el?.closest(".cb-part") ?? el, name);
    }
    watch(document.querySelector(".cb-end"), "End of page");

    // Used figure: the first tap or click on a control or chart.
    const used = new Set<string>();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest?.("button, [role], svg, canvas, input")) return;
      const part = t.closest(".cb-part");
      const id = Object.keys(FIGURES).find(
        (k) => part === document.getElementById(k)?.closest(".cb-part"),
      );
      if (id && !used.has(id)) {
        used.add(id);
        track("Used figure", { figure: FIGURES[id] });
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      io.disconnect();
      timers.forEach((t) => clearTimeout(t));
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, []);
  return null;
}

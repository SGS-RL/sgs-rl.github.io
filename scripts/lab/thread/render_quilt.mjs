// Twitter thread video 3: the Results quilt, rendered frame by frame, so
// every frame is complete: for each frame at 30 fps, the page's clock
// (window.__quiltT, which sets each cell's halftone or video) moves on,
// every clip is seeked to that moment of its loop, and the frame is
// captured once all have been redrawn. 12 seconds: one full cycle of the
// cells changing, so it loops. Versions: a, the site's nine clips
// (/lab/thread/quilt/); b, c and d, more footage each (/lab/thread/quilt-b/
// to -d/, after scripts/lab/thread/prep_quilt_clips.py).
//
//   npx next dev -p 3100 &
//   PLAYWRIGHT_MODULE=/path/to/node_modules/playwright-core/index.mjs \
//   node scripts/lab/thread/render_quilt.mjs [a|b|c|d] [out.mp4] [seconds]
//
// Uses the system Chrome (H.264, and WebGL for the halftone) and ffmpeg.
// Writes 1920 x 1080, 30 fps, H.264 high, CRF 14, no audio; default
// ~/Downloads/sgs-thread/3-results-quilt-{version}.mp4.
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright-core"
);
const base = process.env.BASE_URL ?? "http://localhost:3100";
const version = process.argv[2] ?? "a";
const route =
  version === "a" ? "/lab/thread/quilt/" : `/lab/thread/quilt-${version}/`;
const out =
  process.argv[3] ??
  path.join(
    os.homedir(),
    `Downloads/sgs-thread/3-results-quilt-${version}.mp4`,
  );
const seconds = Number(process.argv[4] ?? 12);
const FPS = 30;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1024, height: 576 },
  deviceScaleFactor: 1.875,
});
await page.goto(base + route, { waitUntil: "load" });
await page.waitForFunction(
  () => {
    const vs = [...document.querySelectorAll(".gal-quilt-grid video")];
    return vs.length > 0 && vs.every((v) => v.readyState >= 2 && v.duration);
  },
  null,
  { timeout: 120000 },
);
const gl = await page.evaluate(
  () => document.querySelector(".gal-quilt-grid")?.dataset.gl,
);
if (gl !== "1") throw new Error("no WebGL: the halftone would be a fallback");

const ff = spawn(
  "ffmpeg",
  [
    "-v",
    "error",
    "-y",
    "-f",
    "image2pipe",
    "-framerate",
    String(FPS),
    "-c:v",
    "png",
    "-i",
    "-",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-profile:v",
    "high",
    "-crf",
    "14",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    out,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);
const done = new Promise((ok, no) =>
  ff.on("close", (code) => (code ? no(new Error(`ffmpeg ${code}`)) : ok())),
);

const frames = Math.round(seconds * FPS);
for (let f = 0; f < frames; f++) {
  await page.evaluate(async (t) => {
    window.__quiltT = t;
    const vs = [...document.querySelectorAll(".gal-quilt-grid video")];
    await Promise.all(
      vs.map(
        (v) =>
          new Promise((ok) => {
            const at = Math.min(t % v.duration, v.duration - 0.02);
            const timer = setTimeout(ok, 2000);
            v.addEventListener(
              "seeked",
              () => {
                clearTimeout(timer);
                ok();
              },
              { once: true },
            );
            v.pause();
            v.currentTime = at;
          }),
      ),
    );
    // Two frames: the quilt redraws its halftones and states on the next.
    await new Promise((ok) =>
      requestAnimationFrame(() => requestAnimationFrame(ok)),
    );
  }, f / FPS);
  const png = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(png))
    await new Promise((ok) => ff.stdin.once("drain", ok));
  if (f % 30 === 0) console.log(`frame ${f}/${frames}`);
}
ff.stdin.end();
await done;
await browser.close();
console.log("wrote", out);

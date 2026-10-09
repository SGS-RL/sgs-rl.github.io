// Steps a page's video frame by frame and screenshots each frame, for the
// Twitter thread videos (sampling_video.py, sampling_overlay.py). The
// page shows one <video> (paused here) whose 'seeked' event updates the
// rest of the page.
//
//   PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs \
//   node scripts/lab/thread/frames.mjs /lab/thread/sampling/ 677 /tmp/frames [alpha]
//
// Writes 00000.png ... at 1920 x 1080 (1200 x 675 CSS px at 1.6x), 30 fps.
// With "alpha": the video hidden (it still drives the page) and the page
// transparent, so the PNGs hold only what is drawn over it.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright-core"
);

const [path, count, dir, alpha] = process.argv.slice(2);
const base = process.env.BASE_URL ?? "http://localhost:3100";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1200, height: 675 },
  deviceScaleFactor: 1.6,
});
await page.goto(base + path, { waitUntil: "load" });
await page.waitForFunction(() => {
  const v = document.querySelector("video");
  return v && v.readyState >= 2;
});
await page.evaluate(() => document.fonts.ready);
if (alpha === "alpha")
  await page.addStyleTag({
    content:
      "video { visibility: hidden !important } html, body, .ov { background: transparent !important }",
  });

for (let f = 0; f < Number(count); f++) {
  await page.evaluate(async (f) => {
    const v = document.querySelector("video");
    v.pause();
    // Wait for the seek and for the new frame on screen (or 500 ms), then
    // two animation frames for the page to update.
    const shown = new Promise((res) => {
      const t = setTimeout(res, 500);
      v.requestVideoFrameCallback(() => {
        clearTimeout(t);
        res();
      });
    });
    const seeked = new Promise((res) =>
      v.addEventListener("seeked", res, { once: true }),
    );
    v.currentTime = (f + 0.5) / 30;
    await seeked;
    await shown;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  }, f);
  await page.screenshot({
    path: `${dir}/${String(f).padStart(5, "0")}.png`,
    omitBackground: alpha === "alpha",
  });
  if (f % 100 === 0) console.log("frame", f);
}
await browser.close();

// Screenshots of the built site at phone and desktop sizes, for reviewing
// designs without a deploy. Serve out/ first with a server that supports
// range requests (video seeking needs them; python's http.server does not):
//
//   npm run build && scripts/lab/webm-standins.sh
//   npx http-server out -p 4173 -s -c-1 &
//   node scripts/lab/shoot.mjs previews '[{"name":"site","size":"m","url":"/lab/site/"}]'
//
// Job fields: name, size ("m" 390x844 @2x | "d" 1440x900), url, and
// optionally hero (0..1, scroll position within #top's scrub), click
// (selector), sel (selector to scroll to), dy (extra scroll px), wait (ms),
// full (full-page shot).
import fs from "node:fs";

const { chromium } = await import("playwright").catch(
  () =>
    import(
      process.env.PLAYWRIGHT_MODULE ??
        "/opt/node22/lib/node_modules/playwright/index.mjs"
    ),
);

const out = process.argv[2] ?? "previews";
const jobs = JSON.parse(
  process.argv[3] ??
    '[{"name":"site-m","size":"m","url":"/lab/site/"},{"name":"site-d","size":"d","url":"/lab/site/"}]',
);
const base = process.env.BASE_URL ?? "http://localhost:4173";
const sizes = {
  m: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  d: { viewport: { width: 1440, height: 900 } },
};

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
for (const j of jobs) {
  const ctx = await browser.newContext(sizes[j.size]);
  // Swap MP4s for the VP9 stand-ins from webm-standins.sh, served by the
  // same range-capable server so seeking works.
  await ctx.route("**/*.mp4", (route) => {
    const u = new URL(route.request().url());
    const name = u.pathname.slice(1).replace(/\//g, "_") + ".webm";
    if (fs.existsSync(`out/__webm/${name}`))
      return route.continue({ url: `${u.origin}/__webm/${name}` });
    return route.continue();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + j.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  if (j.hero !== undefined) {
    const total = await page.evaluate(
      () => document.getElementById("top").offsetHeight - innerHeight,
    );
    await page.evaluate((y) => scrollTo(0, y), Math.round(total * j.hero));
  }
  if (j.click) {
    await page.click(j.click);
    await page.waitForTimeout(400);
  }
  if (j.sel)
    await page.evaluate(
      (s) => document.querySelector(s).scrollIntoView(),
      j.sel,
    );
  if (j.dy) await page.evaluate((d) => scrollBy(0, d), j.dy);
  await page.waitForTimeout(j.wait ?? 2500);
  await page.screenshot({ path: `${out}/${j.name}.png`, fullPage: !!j.full });
  console.log(`${out}/${j.name}.png`, errors.length ? errors : "");
  await ctx.close();
}
await browser.close();

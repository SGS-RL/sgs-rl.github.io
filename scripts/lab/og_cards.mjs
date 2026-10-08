// Screenshots of the link-preview cards and icons on /lab/og/
// (app/lab/_combined/OgCards.tsx): each card at exactly 1200 x 630, each
// icon at 512 x 512, as PNGs in the output folder. Run against `next dev`
// (or a static server of out/), with playwright-core as for shoot.mjs:
//
//   PLAYWRIGHT_MODULE=/path/to/node_modules/playwright-core/index.mjs \
//   PLAYWRIGHT_CHANNEL=chrome BASE_URL=http://localhost:3100 \
//   node scripts/lab/og_cards.mjs out-dir [o1 o2 ... i1 ...]
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright-core"
);

const out = process.argv[2] ?? "og";
const only = process.argv.slice(3);
const base = process.env.BASE_URL ?? "http://localhost:3100";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL,
});
const page = await browser.newPage({
  viewport: { width: 1400, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`${base}/lab/og/`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await page.evaluate(() => document.fonts.ready);
const ids = await page.$$eval("[id^=og-]", (els) => els.map((e) => e.id));
for (const id of ids) {
  const name = id.slice(3);
  if (only.length && !only.includes(name)) continue;
  await page.locator(`#${id}`).screenshot({ path: `${out}/${name}.png` });
  console.log(`${out}/${name}.png`);
}
await browser.close();

import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "SGS lab" } };

type Study = [href: string, name: string, note: string];

const GROUPS: [string, Study[]][] = [
  [
    "Combined site, built section by section",
    [
      [
        "/lab/combined/",
        "Combined",
        "The parts the owner picked from the studies, added one approved section at a time: header, highlights, summary, overview, method.",
      ],
      [
        "/lab/combined-draft/",
        "Combined, draft",
        "The combined page with sections 6–12 (configurations to clips), set up but not yet reviewed; parked here and taken back one at a time.",
      ],
      [
        "/lab/method-parts/",
        "Method in parts",
        "The Method split into three parts (task configurations, a toy example, the weighting), with four ways to show they sit within the Method.",
      ],
      [
        "/lab/method-flow/",
        "Method, in order",
        "A mock-up of the Method in five parts with band subtitles: the change to PPO, task configurations, the weighting on the toy example, sampling, training.",
      ],
      [
        "/lab/method-flow-2/",
        "Method, in order, 2",
        "The Method numbered 01–05, “task configurations” in full, the text across the page above each figure, in two text styles.",
      ],
      [
        "/lab/combined-f-sizes/",
        "Combined + summary F, sizes",
        "Summary F with switches for size (F–F3), width (capped, full, as wide as the video) and stroke (regular, light, key words bold).",
      ],
      [
        "/lab/combined-c/",
        "Combined + summary C",
        "The combined page with summary C (the paragraph alone, no label).",
      ],
      [
        "/lab/combined-d/",
        "Combined + summary D",
        "The combined page with summary D (a rule above the paragraph).",
      ],
      [
        "/lab/combined-f/",
        "Combined + summary F",
        "The combined page with summary F (a big Summary title band).",
      ],
      [
        "/lab/summaries/",
        "Summaries",
        "The serious summary and the one in the combined page's style, after the S4 header and the R1 highlights.",
      ],
      [
        "/lab/reel-layouts/",
        "Highlights layouts",
        "The Highlights section in five layouts under the S6 or S4 header: list or index beside the video, a mint band, centred, title beside.",
      ],
      [
        "/lab/header-sizes/",
        "Header sizes",
        "The H4 header with a smaller SGS and the authors moved away from it, in six layouts.",
      ],
      [
        "/lab/header-colors/",
        "Header colours",
        "The combined page's header in twelve colour schemes: the mark in colour on white, light grounds, strong grounds.",
      ],
      [
        "/lab/highlights/",
        "Highlights",
        "Where the highlight reel goes relative to the header (A–E), and three quiet sets of controls (1–3).",
      ],
      [
        "/lab/opening/",
        "Opening",
        "Openings A and B from Highlights, each followed by Site 3's colourful Overview or the serious summary paragraph.",
      ],
      [
        "/lab/serious-start/",
        "Serious start",
        "A page that starts serious (Swiss, no wordmark; four ways to say SGS) and turns colourful at the Overview.",
      ],
    ],
  ],
  [
    "Round 3: pages with the real footage",
    [
      [
        "/lab/swiss-3/",
        "Serious 3",
        "Serious, with the real clips: the mock reel, clips by robot, sim runs in pairs, continuous runs on request.",
      ],
      [
        "/lab/site-3/",
        "Site 3",
        "Site, with the real clips: entries rebuilt around the footage, reel, clip index, continuous runs.",
      ],
      [
        "/lab/poster-3/",
        "Poster 3",
        "Poster, with the real clips: reel after the cover, unaltered manipulation videos, quilt, continuous runs.",
      ],
    ],
  ],
  [
    "Round 2: pages",
    [
      [
        "/lab/swiss-2/",
        "Serious",
        "Swiss, light, reworked: title first, the highlight reel as a plain video, fuller method and setup, interactive results, clip collection.",
      ],
      [
        "/lab/site-2/",
        "Site 2",
        "Site, reworked: new wordmark, better entries and method, unaltered clips, checked from phone to ultrawide.",
      ],
      [
        "/lab/poster-2/",
        "Poster 2",
        "Poster, reworked: a static cover, the reel right after it, a paper-accurate method, real videos, a quilt separator.",
      ],
    ],
  ],
  [
    "Round 2: parts",
    [
      [
        "/lab/method-nav/",
        "Method as navigation",
        "The method on a maze, after Rosario's explainer: three steps (A), or one live figure with a link out (B).",
      ],
      [
        "/lab/title/",
        "Full title",
        "Six ways to set the full title, Exploration Bottleneck emphasised: three serious, three playful.",
      ],
      [
        "/lab/reel/",
        "Highlight reel",
        "The short reel as a standard video with chapters by robot.",
      ],
      [
        "/lab/cover/",
        "Wordmark and covers",
        "SGS with the name set in its counters, and static poster covers.",
      ],
      [
        "/lab/method/",
        "Method",
        "The sampling loop as the paper describes it, in both styles, with a fuller setup.",
      ],
      [
        "/lab/scaling/",
        "Scaling",
        "The results chart with the policy's clip at each method and scale.",
      ],
      [
        "/lab/gallery/",
        "Clip gallery",
        "Clips grouped by robot, a player mode, a wall, and a quilt that turns into the real videos.",
      ],
    ],
  ],
  [
    "Earlier studies",
    [
      [
        "/lab/swiss/",
        "Swiss, light",
        "Full redesign. Scroll-scrubbed 20 s intro with no locked scrolling, factual captions in place of the slide text.",
      ],
      [
        "/lab/swiss-dark/",
        "Swiss, dark",
        "Same page, inverted, with the 20 s intro as a plain autoplaying loop instead of scroll-scrubbing.",
      ],
      [
        "/lab/site/",
        "Site",
        "The poster system worked out as a website, after the NOF site: sticky section bands, listing entries, a clip index, citation.",
      ],
      [
        "/lab/poster/",
        "Poster",
        "A poster series after Neo Neo's NOF identity: one typeface, three inks per section, every video shown as a live halftone raster.",
      ],
      [
        "/lab/clips/",
        "Clip layouts",
        "Four ways to show many short task and robot clips: grid, rows, player, wall.",
      ],
      ["/", "Current site", "The live homepage, for comparison."],
    ],
  ],
];

export default function LabIndex() {
  return (
    <div className="swiss" data-theme="light">
      <div className="sw-grid gap-y-3 pb-16 pt-6 md:pt-10">
        <p className="sw-label col-span-full font-medium">SGS</p>
        <div className="col-span-full h-px bg-sw-rule" />
        <h1 className="sw-display col-span-full pt-2 text-[22vw] md:col-span-8 md:text-[12vw]">
          Lab
        </h1>
        <p className="sw-label col-span-full self-end text-sw-mute md:col-span-4">
          Design studies for the project site. These pages are not linked from
          the site and are excluded from search engines.
        </p>
      </div>
      {GROUPS.map(([group, studies]) => (
        <section key={group} className="sw-grid pb-16">
          <h2 className="sw-label col-span-full pb-3 font-medium">{group}</h2>
          <ol className="col-span-full">
            {studies.map(([href, name, note], i) => (
              <li key={href}>
                <a
                  href={href}
                  className="group grid grid-cols-4 gap-x-4 border-t border-sw-rule py-4 md:grid-cols-12 md:gap-x-6"
                >
                  <span className="sw-label sw-num col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-3 text-2xl font-semibold tracking-[-0.03em] group-hover:text-sw-accent md:col-span-4 md:text-4xl">
                    {name}
                  </span>
                  <span className="sw-label col-span-3 col-start-2 mt-1 text-sw-mute md:col-span-5 md:col-start-auto md:mt-0 md:pt-2">
                    {note}
                  </span>
                  <span className="sw-label hidden text-right md:col-span-2 md:block md:pt-2">
                    {href} →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

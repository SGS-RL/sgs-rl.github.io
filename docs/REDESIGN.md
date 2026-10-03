# Site redesign: working notes

Notes for anyone (person or agent) picking up the redesign of the SGS
project site. Branch: `claude/website-redesign-brainstorm-hz3x4c`.

## Why

The owner's starting brief, in short:

1. The intro video on the homepage is too long (60 s). Visitors reach for
   the skip button. 15–30 s at most, or rethink the intro entirely.
2. Scrolling past the intro does not work; only the skip button does.
3. The text that appears over the intro reads like AI slop.
4. The owner is a big fan of Swiss design and wants a full redesign in
   that style, built as hidden pages on the live site so it can be
   checked from a phone.
5. There will be many short clips of different robots and tasks; the
   site needs a way to show them.

## Status

| What                                     | Where                               | State            |
| ---------------------------------------- | ----------------------------------- | ---------------- |
| Scroll-past fix for the current homepage | `app/components/VideoNarrative.tsx` | Done, not live   |
| Lab index                                | `/lab/`                             | Done             |
| Swiss, light (first study)               | `/lab/swiss/`                       | Earlier study    |
| Swiss, dark (first study)                | `/lab/swiss-dark/`                  | Earlier study    |
| Clip layout studies                      | `/lab/clips/`                       | Earlier study    |
| Poster series (NOF style)                | `/lab/poster/`                      | Earlier study    |
| **Website (NOF style)**                  | **`/lab/site/`**                    | **Latest study** |

Nothing on this branch is live. GitHub Pages deploys from `main` only
(`.github/workflows/deploy.yml`). Once merged, the lab pages are at
`https://sgs-rl.github.io/lab/`. They are not linked from the site and
carry `noindex, nofollow`. Merging also ships the homepage scroll fix; the
homepage otherwise stays as it is (60 s video, old slide text) until a
direction is chosen and promoted.

## Design direction

The latest and most developed study is `/lab/site/`; the owner has not
picked a direction yet. It follows Neo Neo's identity for Nouvel Opéra
Fribourg (NOF): the posters and, above all, the NOF website.
Neo Neo described that system as "one typeface, a three colour palette and
a raster system", set in Neue Haas Grotesk, with a rough halftone raster
that lets low-quality images look intentional.

Rules the pages follow:

- **One typeface, one weight.** Regular weight at every size, tight
  tracking at large sizes. No bold. Hierarchy comes from size and position.
- **Strict grid.** 6 columns on phones, 12 on desktop
  (`.pz-grid` in `app/lab/_poster/poster.css`), small margins.
- **Three inks per section.** Ground, type, raster. Bands of flat colour on
  white, as on the NOF site. Yellow and red come from the simulation itself
  (the goal marker and the robot).
- **Raster images.** Video and stills are drawn as a coarse halftone in one
  ink. The video is supporting imagery, not the feature.
- **Plain, factual copy.** Captions and labels state what is shown. No
  slogans, no taglines over video.
- **No big hero numbers.** The owner reads large bold stats as AI slop.
  Results live in the chart and in running text.
- **Website first.** Navigation, structure and content matter more than
  video effects.

What `/lab/site/` contains, top to bottom:

- Black bar with section links. The section in view is underlined; on
  phones the links move to a full-screen menu.
- Header: "SGS" wordmark filling the width, with "Success-Guided Sampling"
  set inside the G's counter, then title, authors, affiliations and links.
- Heading bands (Overview, Method, Results, Clips, Cite): white, between
  rules, pinned under the bar while their section is on screen.
- Overview: listing entries like the events on the NOF site. One colour
  band per entry, three columns (name, key fact, description) and a row of
  rastered stills.
- Method: one-sentence summary, the four steps, an animated schematic of
  the sampling loop, and the setup table.
- Results: success rate against parallel environments, both tasks.
- Clips: a typographic index (No., clip, robot, domain, speed), grouped by
  task. On desktop the hovered clip shows beside the list; on phones a tap
  expands it inline.
- Cite: BibTeX with a copy button.

## Decisions and why

- **Hidden pages under `/lab`, deployed with the site.** The owner reviews
  on a phone and asked for hidden URLs on the real site. Until merging is
  convenient, review happens through screenshots (see below).
- **`trailingSlash: true` in `next.config.ts`.** A static export with both
  `lab.html` and a `lab/` folder does not resolve `/lab` on GitHub Pages.
  With trailing slashes every page is `folder/index.html`. The homepage
  output is unchanged.
- **Homepage scroll bug.** The pinned intro only released on wheel events
  of 70 px or less. Mouse wheels send about 100 px per notch, so it never
  released; arrow keys, PageDown and Space did nothing because the page is
  scroll-locked. The fix counts all downward scroll past the end and lets
  those keys move on. Reproduced before and after in a headless browser.
- **20 s intro.** `public/lab/media/intro.mp4` is the 60 s locomotion run
  at 3× (4 MB, was 26 MB), labelled as 3× wherever it appears. The lab
  pages scrub it with native sticky scroll, so the page never locks and a
  fast flick goes straight past.
- **Font.** Inter Tight stands in for Neue Haas Grotesk; the owner cut
  the font search short. Swapping is one variable
  (`--font-swiss-display`, loaded in `app/lab/layout.tsx`).
- **Halftone rendering.** One shared WebGL context renders every halftone
  and copies the result into each element's canvas
  (`app/lab/_poster/halftone.ts`). Browsers cap live WebGL contexts at
  about 16, which a clip grid would exceed with one context per video.
  Without WebGL the plain video shows instead.
- **Placeholder clips.** 15 clips cut from the existing videos
  (`public/lab/media/clips/`, 960 px; `clips-sm/`, 384 px for grids) so
  layouts can be judged with real footage. The manifest is `CLIPS` in
  `app/lab/content.ts`.
- **Chart redrawn natively.** The scaling results are redrawn as SVG
  instead of the animated video, so the type matches. Baselines share one
  ink and differ by dash pattern. There is a hover readout and a data
  table.
- **Method schematic.** Each dot is a task configuration sized by success
  rate; ringed dots are the ones sampled. It is labelled a schematic: the
  sampling weight in `MethodRaster.tsx` is an illustrative curve that
  peaks at intermediate success, not the paper's function.

## Needs the owner's attention

Inputs only the owner can give:

- [ ] **Pick a direction.** `/lab/site/` is the latest study; say what to
      keep from `/lab/poster/` and the Swiss studies.
- [ ] **Real content.** Authors, affiliations, venue and BibTeX
      (placeholders in `app/lab/_site/SitePage.tsx`). Paper and code links
      (`LINKS` in `app/lab/content.ts`, currently `#`).
- [ ] **Facts to check** (all in `app/lab/content.ts` unless noted):
  - Terrain names (`TERRAINS`), guessed from the footage.
  - Robot names: ANYmal, Franka, "UR arm". Guessed from the footage.
  - Scaling values: the labelled endpoints (0.72, 0.60, 0.62, 0.08, 0.00)
    are read off the figure exactly; intermediate points are read by eye.
    Replace with numbers from the paper.
  - "Prior work ≈ 64K" and "16×" come from the figure.
  - The method animation marks `t = 0.66` on its sampling-weight curve,
    while the old site says configurations solved "about half the time".
    The lab copy says "intermediate success"; confirm the right phrasing.
  - The summary paragraph and entry descriptions are drafts built from the
    old site's own claims.
- [ ] **Real clips.** Supply the actual clip collection; each clip needs an
      entry in `CLIPS` plus a 960 px MP4, a 384 px MP4 and a poster JPG.
- [ ] **Font licence**, if the real Neue Haas Grotesk is wanted.
- [ ] **Merge to `main`** when ready to see the lab pages live.
- [ ] **CI Node version.** The deploy workflow runs Node 20, now past end
      of life; bump it to 22 (see Deploying).

## Unexplored

- The real neoneo.ch site. The environment's network policy blocks the
  domain, so the design works from the owner's screenshots of NOF posters
  and the NOF website. Allow `www.neoneo.ch` in the environment's network
  settings to study the source.
- Testing on a real iPhone. Everything was checked in headless Chromium
  only. Scroll scrubbing and WebGL halftones on iOS Safari are untested on
  a device.
- Promoting a design to the homepage (replace `app/page.tsx`, retire the
  old components and the 60 s video).
- Media pipeline for many clips: a script to cut, encode and poster new
  clips; Git LFS or external hosting if the collection grows (lab media
  already adds about 14 MB to the repo).
- Clip index filters and per-clip metadata beyond robot, domain and speed.
- Social card (Open Graph image), favicon, page titles for the final site.
- Accessibility pass: contrast of text on coloured bands, keyboard paths
  through the clip index, screen-reader labels for the schematic.
- Dark mode, phone landscape, very short screens.

## Code map

```
app/
  components/VideoNarrative.tsx  homepage intro (scroll fix only)
  lab/
    layout.tsx                   lab font, noindex metadata
    page.tsx                     /lab/ index of studies
    content.ts                   shared content, placeholders, clip list
    lab.css                      Swiss study styles
    _components/                 Swiss studies and /lab/clips layouts
    _poster/                     NOF poster system
      halftone.ts                shared WebGL halftone renderer
      HalftoneVideo.tsx          video or poster drawn as halftone
      PosterHero.tsx             scroll-scrubbed hero for /lab/poster
      MethodRaster.tsx           animated method schematic
      PosterChart.tsx            scaling chart ("poster" and "web" variants)
      ClipQuilt.tsx              mosaic clip grid
      PosterPage.tsx, poster.css, palettes.ts
    _site/                       /lab/site (latest study)
      SitePage.tsx               page composition and placeholders
      SiteNav.tsx                top bar, section tracking, phone menu
      ClipIndex.tsx              typographic clip index with preview
      CopyBlock.tsx, site.css
    swiss/ swiss-dark/ clips/ poster/ site/   route entry points
public/lab/media/                intro, clips, clips-sm, 960 px videos
scripts/lab/                     review tooling (below)
```

## Set up a development environment

Works on macOS and Ubuntu (22.04 or newer).

| Tool                | Version                                  | Needed for                                     |
| ------------------- | ---------------------------------------- | ---------------------------------------------- |
| git                 | any                                      | getting the code                               |
| Node.js and npm     | 20.9 or newer; 22 recommended (`.nvmrc`) | everything                                     |
| ffmpeg              | any recent build with libvpx             | cutting video, screenshot stand-ins (optional) |
| Playwright Chromium | 1.56                                     | phone and desktop screenshots (optional)       |

### macOS

```sh
# Homebrew first, if missing: https://brew.sh
brew install git ffmpeg

# Node through nvm (or `brew install node@22` and put it on PATH)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# open a new terminal, then:
nvm install 22
```

### Ubuntu

```sh
sudo apt update
sudo apt install -y git curl ffmpeg

# Ubuntu's own nodejs package is too old for Next.js 16, so use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# open a new terminal, then:
nvm install 22
```

### Get the code

```sh
git clone https://github.com/SGS-RL/sgs-rl.github.io.git
cd sgs-rl.github.io
git checkout claude/website-redesign-brainstorm-hz3x4c
nvm use        # Node 22, from .nvmrc
npm ci         # exact versions from package-lock.json
```

### Screenshot tooling (optional)

Playwright is not a project dependency, which keeps the deploy lean.
Install it into `node_modules` without touching `package.json`:

```sh
npm install --no-save playwright@1.56.1
npx playwright install chromium               # macOS
npx playwright install --with-deps chromium   # Ubuntu: also installs system libraries (asks for sudo)
```

`npm ci` removes it again; re-run the first line afterwards.

## Run the website

### Development server

```sh
npm run dev
```

Open http://localhost:3000/ for the current homepage and
http://localhost:3000/lab/ for the design studies. Pages reload on save.

### Production build

This is exactly what GitHub Pages serves:

```sh
npm run build                         # static site into out/
npx http-server out -p 4173 -s -c-1   # http://localhost:4173/lab/site/
```

Serve `out/` with a server that supports range requests, like
`http-server` above. `python3 -m http.server` does not, and video seeking
breaks without them.

`npm run build` downloads Google Fonts. It occasionally fails with
"next/font/google queries have exactly one entry"; running it again fixes
it.

### On a phone, over Wi-Fi

Serve the production build as above, find the computer's address, and
open `http://<address>:4173/lab/site/` on a phone on the same network:

```sh
ipconfig getifaddr en0   # macOS, Wi-Fi
hostname -I              # Ubuntu, first address
```

On macOS, allow incoming connections if the firewall asks. Prefer this to
the dev server: Next.js 16 blocks dev-only assets requested from any host
other than `localhost`, unless that host is listed in `allowedDevOrigins`
in `next.config.ts`.

### Checks before committing

```sh
npm run lint
npx tsc --noEmit
npx prettier --check app/lab scripts/lab docs
npm run build
```

### Deploying

Pushing to `main` runs the "Deploy to GitHub Pages" workflow, which builds
and publishes `out/` to https://sgs-rl.github.io/ (studies at
https://sgs-rl.github.io/lab/). No other branch deploys. The workflow runs
Node 20, which reached end of life in April 2026; moving
`node-version` to `"22"` in `.github/workflows/deploy.yml` would match
`.nvmrc`.

### Screenshots (how designs get reviewed)

The owner reviews from a phone, and nothing deploys until `main`, so each
round ends with phone and desktop screenshots sent to them. With the
optional tooling and ffmpeg installed:

```sh
npm run build
scripts/lab/webm-standins.sh        # VP9 copies; Playwright's Chromium has no H.264
npx http-server out -p 4173 -s -c-1 &
node scripts/lab/shoot.mjs previews '[
  {"name":"site-top","size":"m","url":"/lab/site/"},
  {"name":"site-clips","size":"d","url":"/lab/site/","sel":"#clips"},
  {"name":"poster-mid","size":"m","url":"/lab/poster/","hero":0.5}
]'
```

`shoot.mjs` documents the job fields at the top. Shots land in `previews/`
(git-ignored). Re-run `webm-standins.sh` after every build, since the
build wipes `out/`; its transcodes are cached, so later runs are quick. If
Playwright lives somewhere other than the project's `node_modules`, set
`PLAYWRIGHT_MODULE` to its entry point.

## Feedback so far

What the owner has said, to keep later work on course:

- Likes video scrolling, but the intro was too long.
- "I really don't like any of the text that comes up during the first
  video. It sounds like ai slop."
- "I am a huge fan of Swiss design."
- Liked the NOF posters and the neoneo.ch site. "I don't care for having
  these big bold stats, as that seems like ai slop these days."
- "I like the screenshot way for now." Review through screenshots.
- "Don't focus too much on the video part, it's more important to nail
  the website design."
- Cut short a search for a Helvetica-like font ("don't focu…"), read as:
  don't spend time on fonts.

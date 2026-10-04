# Site redesign: working notes

Notes for anyone (person or agent) picking up the redesign of the SGS
project site. Branch: `claude/website-redesign-brainstorm-hz3x4c`.

## Start here

- **Where things stand (2026-10-04).** Two tracks are being polished in
  parallel: a _serious_ one (Swiss, light: `/lab/swiss-2/`) and a
  _playful_ one (NOF poster system: `/lab/site-2/` and `/lab/poster-2/`).
  The owner picks one later with labmates. Round 2 also produced parts
  studied on their own pages (reel, wordmark and covers, method, scaling,
  gallery, full title, method as navigation).
- **Plan.** (1) The owner is preparing the real clips and will hand them
  over. (2) Iterate the serious version with them. (3) Then the playful
  version. (4) The owner decides with labmates. (5) Promote the chosen
  design to the homepage.
- **Ground rule.** Never change a study the owner has already seen,
  unless they ask for a change to that study. Make a new route next to it
  so versions can be compared (owner, 2026-10-04:
  "don't modify the ones that were already there, make new ones so I can
  compare"). The same goes for shared content: a change for one study must
  not leak into the others (see `SUBTITLE` versus `FULL_SUBTITLE`).
- **How to look at everything.** `npm run dev`, then open
  http://localhost:3000/lab/. That index links every study below. To
  review the way the owner does, take phone, iPad, laptop and ultrawide
  screenshots (see "Screenshots").
- **Before writing anything,** read "Feedback so far" at the end: the owner's
  taste is specific, and most of it is recorded there in their words.

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

Every study is linked from `/lab/` (`app/lab/page.tsx`), grouped the same
way as below.

| What                                     | Where                | State                        |
| ---------------------------------------- | -------------------- | ---------------------------- |
| Scroll-past fix for the current homepage | `VideoNarrative.tsx` | Done, not live               |
| **Serious page, round 2** (`_swiss2/`)   | **`/lab/swiss-2/`**  | **Latest, serious track**    |
| **Site page, round 2** (`_site2/`)       | **`/lab/site-2/`**   | **Latest, playful track**    |
| **Poster page, round 2** (`_poster2/`)   | **`/lab/poster-2/`** | **Latest, playful track**    |
| Method as navigation (`_nav/`)           | `/lab/method-nav/`   | Part, round 3, see below     |
| Full title, six settings (`_title/`)     | `/lab/title/`        | Part, round 3, owner to pick |
| Highlight reel (`_reel/`)                | `/lab/reel/`         | Part, round 2                |
| Wordmark and covers (`_cover/`)          | `/lab/cover/`        | Part, round 2                |
| Method, paper-accurate (`_method/`)      | `/lab/method/`       | Part, round 2                |
| Scaling with clips (`_scaling/`)         | `/lab/scaling/`      | Part, round 2, needs clips   |
| Clip gallery and player (`_gallery/`)    | `/lab/gallery/`      | Part, round 2, needs clips   |
| Swiss, light (first study)               | `/lab/swiss/`        | Earlier study, frozen        |
| Swiss, dark (first study)                | `/lab/swiss-dark/`   | Earlier study, frozen        |
| Website, NOF style (`_site/`)            | `/lab/site/`         | Round 1, frozen              |
| Poster series, NOF style (`_poster/`)    | `/lab/poster/`       | Earlier study, keep intact   |
| Clip layout studies (`_components/`)     | `/lab/clips/`        | Earlier study, frozen        |

"Part" pages show one piece in several variants, so it can be judged on
its own before it goes into a page. The round 2 pages import some of them
(`Swiss2Page` uses `MethodSwiss`, `ScaleCompare`, the gallery and the reel).
The round 3 parts (`/lab/method-nav/`, `/lab/title/`) are not in any page
yet.

Nothing on this branch is live. GitHub Pages deploys from `main` only
(`.github/workflows/deploy.yml`). Once merged, the lab pages are at
`https://sgs-rl.github.io/lab/`. They are not linked from the site and
carry `noindex, nofollow`. Merging also ships the homepage scroll fix; the
homepage otherwise stays as it is (60 s video, old slide text) until a
direction is chosen and promoted.

## Design direction

There are two tracks, and each has its own system.

**Serious track: Swiss, light.** Styles in `app/lab/lab.css` (`.swiss`,
`sw-*` classes, colour tokens `--sw-*`), plus `app/lab/_swiss2/swiss2.css`
for the round 2 page (`.s2`, page width capped at 1840 px for ultrawide).
Inter Tight in several weights, near-black on paper (`#fafaf7`), one red
accent (`--sw-accent: #e4321b`), a 4-column phone grid and a 12-column
desktop grid (`.sw-grid`), hairline rules, numbered sections ("01
Summary"), fixed text measures after Kunstmuseum Bern. The owner loves the
title, the summary layout, the type and the guides and rules of the first
Swiss study.

**Playful track: the NOF poster system.** It follows Neo Neo's identity
for Nouvel Opéra Fribourg (NOF): the posters and, above all, the NOF website.
Neo Neo described that system as "one typeface, a three colour palette and
a raster system", set in Neue Haas Grotesk, with a rough halftone raster
that lets low-quality images look intentional. Styles in
`app/lab/_poster/poster.css` (`.pz`) and `app/lab/_site/site.css` (`.st`).

Rules the playful pages follow:

- **One typeface, one weight.** Regular weight at every size, tight
  tracking at large sizes. No bold. Hierarchy comes from size and position.
- **Strict grid.** 6 columns on phones, 12 on desktop
  (`.pz-grid` in `app/lab/_poster/poster.css`), small margins.
- **Three inks per section.** Ground, type, raster. Bands of flat colour on
  white, as on the NOF site. Yellow and red come from the simulation itself
  (the goal marker and the robot).
- **Raster images, except evidence.** Stills and decorative video are drawn
  as a coarse halftone in one ink. Clips that show results are shown
  unaltered (round 2 feedback).

Rules for both tracks:

- **Plain, factual copy.** Captions and labels state what is shown. No
  slogans, no taglines over video.
- **No big hero numbers.** The owner reads large bold stats as AI slop.
  Results live in the chart and in running text.
- **Website first.** Navigation, structure and content matter more than
  video effects.
- **Clarity over design.** On the method in particular: "We must not let
  the design get in the way of the clarity of the content."
- **Every screen size.** Phone, iPad portrait and landscape, laptop and
  ultrawide (`shoot.mjs` sizes `m`, `t`, `tl`, `d`, `w`).
- **Co-first authors keep their asterisk** wherever names appear, including
  the poster's one-line author list (`AUTHOR_LINE`).

For reference, round 1's `/lab/site/` contains, top to bottom:

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
  at 3× (4 MB, was 26 MB), labelled as 3× wherever it appears. The first
  lab pages scrub it with native sticky scroll. Round 2 replaced it with a
  highlight reel played as a standard video (`HIGHLIGHTS`, `_reel/`): the
  owner found that readers flick past scroll-scrubbed video.
- **Font.** Inter Tight stands in for Neue Haas Grotesk; the owner cut
  the font search short, but worth reconsidering in the future. Swapping is one variable
  (`--font-swiss-display`, loaded in `app/lab/layout.tsx`).
- **Halftone rendering.** One shared WebGL context renders every halftone
  and copies the result into each element's canvas
  (`app/lab/_poster/halftone.ts`). Browsers cap live WebGL contexts at
  about 16, which a clip grid would exceed with one context per video.
  Without WebGL the plain video shows instead. Static covers use a 2D
  canvas (`_cover/HalftoneStill.tsx`).
- **Placeholder clips.** 15 clips cut from the existing videos
  (`public/lab/media/clips/`, 960 px; `clips-sm/`, 384 px for grids) so
  layouts can be judged with real footage. The manifest is `CLIPS` in
  `app/lab/content.ts`. The highlight reel (`public/lab/media/highlights.mp4`)
  is cut from the same footage. All of it is replaced when the owner's
  clips arrive.
- **Chart redrawn natively.** The scaling results are redrawn as SVG
  instead of the animated video, so the type matches. Baselines share one
  ink and differ by dash pattern. There is a hover readout and a data
  table.
- **Shared content in one file.** `app/lab/content.ts` holds the title,
  authors, affiliations, venue, links, BibTeX, clips and reel chapters.
  `TITLE` and `SUBTITLE` ("Mega-Scale RL for Robot Control") are what the
  existing pages show. The paper's full subtitle is `FULL_SUBTITLE` (parts
  in `SUBTITLE_PARTS`); only `/lab/title/` uses it, so it can be compared
  without changing the other pages. `BIBTEX` cites the full title.
  `AUTHOR_LINE` adds the co-first asterisk to names.
- **Method facts.** Taken from the explainer by Rosario Scalise (a
  co-author; see References), not yet checked against the paper text: a fixed set of
  N task configurations (N = 32,768), a sliding window of the last H = 100
  outcomes per configuration giving p̂ (unvisited reads 0), the kernel
  w = (p̂+ε)^(κt)·(1−p̂+ε)^(κ(1−t)), ℓ = log(w+ε), P = softmax(ℓ/T). The paper
  uses κ = 1, t = 0.5; locomotion κ = 5, t = 0.66; manipulation ε = 1e-4.
  The paper's T is not confirmed; the figures use T = 2, the explainer's
  value. Code: `KERNELS` in `app/lab/_method/sgs.ts`.
- **"Signal ∝ p(1 − p)" is not a paper claim.** It comes from the
  explainer, as motivation. The owner found it confusing next to the
  sampling weight, because it read as if SGS weights by p(1 − p), and it
  was removed from `/lab/method-nav/`. It is still in `/lab/method/`
  (`MethodSwiss`, part "where learning happens"), which is frozen; drop it
  there too if that part is reused.
- **Method schematic (round 1).** In `/lab/poster/` each dot is a task
  configuration sized by success rate; ringed dots are the ones sampled.
  It is labelled a schematic: the sampling weight in `MethodRaster.tsx` is
  an illustrative curve that peaks at intermediate success, not the
  paper's function. Round 2's `_method/` replaced it with the paper's
  kernel.
- **Method as navigation (`/lab/method-nav/`, `app/lab/_nav/`).** The
  owner asked for the method as the explainer frames it: a navigation task
  with walls, one start, and goals as the task configurations, instead of
  abstract dots. A: three parts (the task; how SGS picks; training live).
  B: one live figure and a link to the explainer. Choices behind it:
  - Own code and own maze (18 × 10, three rooms, 158 goals). Only the
    explainer's setup and the paper's sampler carry over.
  - The learner is a stand-in for PPO, stated on the page: each goal has a
    success rate σ(z) that starts high near the start and falls with path
    length; an episode moves its goal's z by rate · |o − p| and its maze
    neighbours' by a share of that. This keeps a sharp edge between
    reached and unreached goals, which reads well.
  - The figures use κ = 10 (`TOY` in `_nav/nav.ts`): on 158 goals the
    paper's κ = 1 prefers the frontier too gently to see. The page says so.
  - ε = 1e-6, raised from 1e-8 at the owner's request, so the picking
    figure shows that goals off the frontier are still sampled (a goal
    always or never reached is about 22× less likely than one at the
    target; together they get about half the picks).
  - No live SGS-versus-uniform race. In a maze this small the outcome
    depends on the toy's settings, and uniform won in several. The page
    compares where each sampler's picks go on one snapshot instead. The
    real comparison is the Results chart.
  - The robots' motion is scripted, not simulated: the outcome is a coin
    flip with the goal's success rate; a failing robot slides to a random
    point 30–95% along its path and jiggles. The owner noticed it looks
    unnatural. A fix (point-mass motion with noise, outcome unchanged) is
    proposed but deferred until after the clips.
- **Full title (`/lab/title/`).** Six ways to fit "A Balanced Data Diet:
  Addressing the Exploration Bottleneck in Mega-Scale RL for Robot
  Control" on a first screen, emphasising "Exploration Bottleneck": T1–T3
  serious (two tiers, one block in two weights, split), T4–T5 poster (four
  sizes, vertical), T6 Site header. Font sizes are capped by both viewport
  width and height so each holds from phone to ultrawide.

## Needs the owner's attention

Inputs only the owner can give:

- [ ] **Real clips (in progress: the owner is preparing them).** Where
      they go:
  - Clip collection (gallery, clip index, quilt): one entry per clip in
    `CLIPS` in `app/lab/content.ts`, plus a 960 px MP4 in
    `public/lab/media/clips/`, a 384 px MP4 in `clips-sm/` and a poster
    JPG. Encoding commands: top of `app/lab/_scaling/clips.ts` (same
    settings).
  - Scaling clips: one ~5 s clip per task × method × scale shown in the
    results chart, 27 in all, named `{task}-{method}-{scale}.mp4` in
    `public/lab/media/scaling/`. Convention and list in
    `app/lab/_scaling/clips.ts`; add each id to `RECORDED` when it lands.
  - Highlight reel: 15–30 s, 1–5 s per robot, as one MP4 plus its chapter
    list (`HIGHLIGHTS` in `content.ts`: start time, robot, title, clip).
- [ ] **Pick a direction**, after both tracks are iterated with the real
      clips: serious (`/lab/swiss-2/`) or playful (`/lab/site-2/`,
      `/lab/poster-2/`), with labmates' feedback.
- [ ] **Pick a full-title setting** from `/lab/title/` (T1–T6), or none.
- [ ] **Method on the site:** version A or B from `/lab/method-nav/`, the
      round 2 method, or a link to the explainer.
- [ ] **Paper and code links** (`LINKS` in `app/lab/content.ts`, still `#`).
- [ ] **Facts to check** (in `app/lab/content.ts` unless noted):
  - The paper's softmax temperature T, N for each task, and κ and t for
    manipulation (`KERNELS` in `app/lab/_method/sgs.ts`).
  - Whether the paper says anything like "signal ∝ p(1 − p)" (see
    Decisions).
  - Terrain names (`TERRAINS`) and robot names (ANYmal, Franka, "UR arm"),
    guessed from the footage.
  - Wording of "keeps improving past one million parallel environments"
    and "transferred to a physical arm".
  - Scaling values: the labelled endpoints (0.72, 0.60, 0.62, 0.08, 0.00)
    are read off the figure exactly; intermediate points are read by eye.
    Replace with numbers from the paper. "Prior work ≈ 64K" and "16×" come
    from the figure.
  - The list of facts on `/lab/poster-2/` (the owner may hand-curate it).
  - The summary paragraph and entry descriptions are drafts built from the
    old site's own claims.
- [x] **Authors, affiliations, venue (CoRL 2026), BibTeX**: `AUTHORS`,
      `AFFILIATIONS`, `VENUE`, `BIBTEX` in `app/lab/content.ts`.
- [ ] **Font licence**, if the real Neue Haas Grotesk is wanted.
- [ ] **Merge to `main`** when ready to see the lab pages live.
- [ ] **CI Node version.** The deploy workflow runs Node 20, now past end
      of life; bump it to 22 (see Deploying).

## References

- **Swiss and NOF references.** `docs/research/swiss-references.md`
  covers Neo Neo's projects (NOF, Faire, Théâtre Public Montreuil, ON,
  Act–Art), the NOF website as Neo Neo built it (no longer live; studied
  through the Wayback Machine) and three Swiss museum sites (Kunsthaus
  Zürich, Kunstmuseum Basel, Kunstmuseum Bern), with measured type sizes,
  colours and techniques. The images it cites are local only, under
  `previews/research/` (git-ignored); on a machine without them, rerun the
  research from the URLs in the doc.
- **The method explainer.** Rosario Scalise, "Success Guided Sampling",
  https://rosarioscalise.com/garage-success-guided-sampling (source:
  https://github.com/romesco/portfolio, `website/pages/garage-success-guided-sampling.md`).
  A point robot in a gridworld: one start, every free cell a goal, the
  paper's kernel, with interactive figures. Rosario is a co-author and the
  owner works with him daily; the owner cleared using it. His repository's
  licence asks to be asked before reusing its design or code, so the lab
  pages take only its content (the setup and the paper's sampler) and
  reuse none of its code or styling. Keep it that way.

## Unexplored

- Testing on a real iPhone. Everything was checked in headless Chromium
  and desktop Chrome only. Scroll behaviour and WebGL halftones on iOS
  Safari are untested on a device.
- Physical motion for the navigation toy (see Decisions).
- Promoting a design to the homepage (replace `app/page.tsx`, retire the
  old components and the 60 s video).
- Media pipeline for many clips: a script to cut, encode and poster new
  clips; Git LFS or external hosting if the collection grows (lab media
  already adds about 16 MB to the repo).
- Clip index filters and per-clip metadata beyond robot, domain and speed.
- Social card (Open Graph image), favicon, page titles for the final site.
- Accessibility pass: contrast of text on coloured bands, keyboard paths
  through the clip index, screen-reader labels for the method figures.
- Dark mode for the round 2 pages, phone landscape, very short screens.

## Code map

```
app/
  components/VideoNarrative.tsx  homepage intro (scroll fix only)
  lab/
    layout.tsx                   lab fonts, noindex metadata
    page.tsx                     /lab/ index of studies (add new ones here)
    content.ts                   shared content: title, authors, links,
                                 BibTeX, clips, reel chapters
    lab.css                      Swiss system (.swiss, sw-*)
    _components/                 first Swiss studies, /lab/clips layouts
    _poster/                     NOF poster system (round 1)
      halftone.ts                shared WebGL halftone renderer
      HalftoneVideo.tsx          video or poster drawn as halftone
      MethodRaster.tsx           method schematic (illustrative)
      PosterChart.tsx            scaling chart ("poster" and "web")
      ClipQuilt.tsx              mosaic clip grid
      PosterPage.tsx, poster.css, palettes.ts
    _site/                       /lab/site (round 1)
    _swiss2/                     /lab/swiss-2 page, Section, Nav, swiss2.css
    _site2/                      /lab/site-2 page
    _poster2/                    /lab/poster-2 page
    _reel/                       HighlightReel: plain video with chapters
    _cover/                      Wordmark (v1–v6), Cover (c1–c5),
                                 HalftoneStill, SiteHeader
    _method/                     paper method: sgs.ts (simulation and
                                 kernel), MethodSwiss/Site/Poster, figures
    _scaling/                    ScaleCompare, PointToClip, ClipMatrix,
                                 clips.ts (scaling clip list)
    _gallery/                    ClipGallery, RobotGrid, ClipWall,
                                 QuiltSeparator, player
    _title/                      TitleStudy, title.css (/lab/title)
    _nav/                        method as navigation (/lab/method-nav):
                                 nav.ts (maze, learner, sampler), draw.ts,
                                 TaskFigure, SnapshotFigure, TrainFigure
    <route>/page.tsx             one folder per study route
public/lab/media/                intro, highlights, clips, clips-sm, covers
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
If port 3000 is taken, pick another: `npx next dev -p 3100`.

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

Quicker on a Mac with Google Chrome: shoot the dev server with the system
browser, which plays H.264, so no build and no WebM copies are needed.
`playwright-core` can live anywhere (here in a scratch folder):

```sh
npm install --prefix /tmp/pw playwright-core@1.63.0
npx next dev -p 3100 &
PLAYWRIGHT_MODULE=/tmp/pw/node_modules/playwright-core/index.mjs \
PLAYWRIGHT_CHANNEL=chrome BASE_URL=http://localhost:3100 \
node scripts/lab/shoot.mjs previews/round '[
  {"name":"swiss2-m","size":"m","url":"/lab/swiss-2/"},
  {"name":"swiss2-w","size":"w","url":"/lab/swiss-2/"},
  {"name":"nav-step2-d","size":"d","url":"/lab/method-nav/","sel":"#step-2"}
]'
```

Sizes: `m` phone 390×844, `t` iPad portrait 820×1180, `tl` iPad landscape
1180×820, `d` laptop 1440×900, `w` ultrawide 2560×1080. Animated figures
(method, training) only run while on screen, so shoot them with `sel`
rather than as part of a full-page shot. Useful anchors: `#step-1` to
`#step-3` and `#b` on `/lab/method-nav/`, `#t1` to `#t6` on `/lab/title/`.
Look at every shot before sending it.

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

### Round 2 (owner on a laptop, 2026-10-04)

Two tracks, both to be polished toward a final version; the owner picks
one later with feedback from labmates.

**Serious track** (from `/lab/swiss/`):

- Loves the title, the summary layout, its type and its guides/rules.
- Likes the numbered list beside the video ("01 Pit" with timestamps).
- Does not want the video first, nor scroll-scrubbed: impatient readers
  flick past it and skip the best content. Plan: a 15–30 s highlight reel,
  1–5 s per robot, played as a standard video that scrolling cannot speed
  up. Placeholder reel: `HIGHLIGHTS` in `app/lab/content.ts`.
- Setup and Method feel thin ("not enough meat").
- Big stat numbers are out. The interactive plot is in. Idea: let readers
  see the policies at each scale and for each method (owner can supply a
  ~5 s clip per method and scale).
- Clip collection, from `/lab/clips/`: likes Grid (everything playing,
  click to see larger); likes the organisation of Rows but not the sideways
  scroll, so a grid grouped in rows by robot; loves Player and wants a click
  on a grid tile to open Player mode instead of a single large video; Wall
  looks clean, possibly as a transition between method/results and the clip
  collection.

**Playful track** (from `/lab/site/` and `/lab/poster/`):

- Site: loves the big SGS with "Success-Guided Sampling" inside it, and the
  palette. Wants a variant with "Success" in the top counter of the first S,
  "Guided" under the G's inward bar, "Sampling" in a counter of the last S,
  slightly offset in a Swiss way.
- Site: loves the opening page as a way to show all the information.
  Overview, Manipulation and Scaling entries: colours, type and layout are
  right; text and clip choices need work. Method: loves the type and style;
  the explanation should improve, along the lines of a labmate's explainer
  (https://rosarioscalise.com/garage-success-guided-sampling). Results:
  titles, rules, sizes and layout are particularly good.
- Site: loves the Clips index, but the clips must be shown unaltered (no
  halftone, no recolouring); here the footage is the evidence.
- Site: keep the big SGS at the end.
- Check phone, iPad, laptop and ultrawide, not just phone and laptop.
- Poster: the first page may be the favourite, but the video in it is
  choppy and must go: make it a static designed poster, drop unneeded text,
  give the full title more weight. Keep `/lab/poster/` as it is and iterate
  in a new page.
- Poster: summary and the "Success-Guided Sampling" sections are loved; the
  list of facts needs better content (owner may hand-curate).
- Poster: show the highlight reel sooner, right after the cover or right
  after the summary.
- Poster: Method is "amazing" and close to the labmate's explainer; make the
  animation more faithful to the paper in the same style.
- Poster: full-page pink locomotion/manipulation plots are good. The
  "Manipulation / NIST Taskboard" titles and colours are great, but the real
  videos need room, unaltered.
- Poster: loves the Index quilt. Idea: use a quilt like it (mixed cell
  sizes, an Index cell spanning two) as a page separator that turns from
  flat colour rasters into the real videos while scrolling, or vice versa.
- Study neoneo.ch (NOF, Faire, Théâtre Public Montreuil, ON catalogue, Act
  Art) and Swiss museum sites (Kunsthaus Zürich, Kunstmuseum Basel,
  Kunstmuseum Bern), the neoneo work above all.

### Round 3 (owner on a laptop, 2026-10-04, after round 2)

- Real authors and affiliations, venue CoRL 2026. Co-first authors always
  carry their asterisk, "even if you don't mention it, e.g. in the Poster
  version".
- Asked whether the full title fits ("A Balanced Data Diet: Addressing the
  Exploration Bottleneck in Mega-Scale RL for Robot Control", possibly
  emphasising "exploration" or "Exploration Bottleneck"): "find one or
  multiple ways to make this work, before we settle down on some options".
  Built as `/lab/title/`; no pick yet.
- "Don't modify the ones that were already there, make new ones so I can
  compare." (The ground rule in "Start here".)
- Method: look at Rosario's explainer. It is a navigation example, with
  walls, one start, and goals as what is picked, not random dots. The
  round 2 method figures are "a bit too crowded" and do not show that it
  is navigation. "We must not let the design get in the way of the
  clarity of the content." Undecided between putting the method on the
  site and linking to the explainer; asked for a Swiss version. Built as
  `/lab/method-nav/`.
- On `/lab/method-nav/`: drop the p(1 − p) part (it read as the sampling
  weight); raise ε so the figure shows that not only the frontier is
  sampled; say "target success rate" in words instead of "p̂ = t". All
  done.
- Noticed that failing robots slide most of the way and then stall in a
  scripted way. Explained (see Decisions); a physical-motion fix is
  deferred.
- Next: the owner hands over all the clips; then iterate the serious
  version, then the playful one.

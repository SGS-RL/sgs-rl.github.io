# Site redesign: working notes

Notes for anyone (person or agent) picking up the redesign of the SGS
project site. Branch: `claude/website-redesign-brainstorm-hz3x4c`.

## Start here

- **Update (2026-10-07, evening).** `/lab/combined/` is the approved
  page with the new Method (`MethodFlow2`), ending after the Method, in
  text style **W1** (the owner's pick after comparing W1, W2 and a
  smaller W3 in place; W2 read too large). Parts 03–05 set their maze on
  the left at one shared, smaller width (`--cb-maze-w`, about half the
  page) with the explanation beside it; on phones the text comes first
  (Step `beside` in `MethodFlow2.tsx`; part 03's text sits at the top of
  the Beta explorer's side column, `lead`). Owner: the mazes were "too
  large, and not uniform". The PPO block (part 01) read "a bit dull": six
  styles at `/lab/ppo-styles/` (`_combined/AlgoStyles.tsx`, `algo.css`;
  IBM Plex Mono and Geist Mono loaded in `algoFonts.ts`): A as now, B
  typeset in the page's face with numbered lines, C JetBrains Mono with a
  red bar, D one diff block, E Geist Mono on a panel, F the loop as steps.
  Picked: **C** (JetBrains Mono), now on the combined page
  (`MethodFlow2` `algo="c"`); the method-flow studies keep A. Copy edited
  part by part with the owner (2026-10-07): part 02 "initial state",
  "SGS samples"; part 03 "This navigation toy example ...", the
  possessive "a task configuration's success rate"; parts 04 and 05
  merged into "04 Sampling during training" beside the live maze, without
  numbers (no draw counts in the text, no episode counter; `TrainFigure`
  `counter={false}`). The separate sampling figure (`SamplingFigure.tsx`,
  rounds of draws, SGS or uniform) is no longer on the page. Then (2026-10-08): parts 03 and 04 (the toy example)
  are parked at `/lab/method-toy/` (`_combined/MethodToy.tsx`,
  `MethodFlow2` `parts`), with their edited copy; the combined page's
  Method ends at 02 Task configurations, whose "To come" box waits for
  the owner's task-configuration visuals from the real robot setups.
  Then: the Method gets a third part, "03 Sampling during training", a
  placeholder ("To come") until visuals from real training exist
  (`MethodFlow2` part `during`; the draft fills it with paper Figure 7,
  `OverTrainingBody`). Under the Method, `/lab/combined/` now has a
  Results section: the quilt divider (`QuiltDivider`, "Results" in its
  big cell), with "Results" in the nav. The draft continues under it with
  the scaling chart, Footage and Clips; its separate "Over training"
  section is gone.
  Results, part 01 Scaling (2026-10-08, `_combined/ResultsScaling.tsx`,
  `ScalingChart.tsx`, data in `scalingData.ts`): kept minimal and without
  per-checkpoint clips, at the owner's request. The owner supplied the
  numbers: three seeds per point, mean ± 95% CI half-width (a t interval,
  as the paper shades). Locomotion is ANYmal D's overall success rate,
  manipulation Franka nut-and-bolt's hardest-spawn success rate; the UR5e
  rod-in-hole plot (paper 5c) is left out. As in the paper: mean lines,
  seed dots, CI bands; SGS in the page's red, baselines gray with the
  paper's marker shapes (diamond PLR, square uniform, triangle linear);
  end labels, a legend, a hover readout per scale and a screen-reader
  table. The draft's older scaling chart with clips (`Results`,
  `ScaleCompare`) is no longer on either page; `SCALING` in `content.ts`
  still has the earlier read-off values for the older studies.
  Results 02 Real world and 03 Continuous runs (2026-10-08,
  `_combined/ResultsFootage.tsx`), a first layout for the owner to pick
  clips into; everything at 1×, and nut-on-bolt, "the most impressive
  task", always first. 02: one sentence, then a block per task (name, a
  plain line, clips): nut on bolt two to a row with two empty frames for
  two more runs the owner has, then rod in hole and gear mesh three to a
  row; no numbers (no Table 2). 03: the one-take runs, each video on the
  left (muted, 1×, browser controls) with its name, a sentence and
  "m:ss, one take, real time" beside it: Franka nut-and-bolt in
  simulation, ANYmal C on all terrains, UR5e gear mesh on hardware.
  **Missing footage:** the one-minute Franka nut-and-bolt run (the drive
  folder has a 30 s run, `franka_nut_continuous_run.mp4`) and the two
  extra nut-on-bolt hardware runs. The draft no longer repeats the older
  runs and hardware blocks.
  Then, a copy rule for the whole site (owner, 2026-10-08): **no small
  filler text**. No captions like "run 3" or "a fourth run", no
  timestamps or durations, no small grey one-line notes under headings.
  Removed from Results 02 and 03 (clip captions, task notes, "m:ss, one
  take, real time", the Franka "To come" note) and the line under the
  scaling charts. Empty frames for missing clips keep only "To come". Then: the
  manipulation axis reads "Success rate"; 03 lost its opening line and
  the sentences beside the runs, leaving only names, and three layouts
  are switched on the page (`?runs=`): Large (one run per row, the name
  above a video as wide as the screen height allows; the default), Row
  (the three side by side from 1024 px, names underneath) and Side (the
  earlier video left, name right). Picked: **Row** (the switch is gone). The
  short gear-mesh clips were cut from the one-minute gear-mesh run, so
  the Gear mesh block is gone from 02 Real world; gear mesh appears only
  in 03. Then (2026-10-08): the header is S4 only on `/lab/combined/`
  (the S4/S6 switch is gone there, `?header=` is ignored; the comparison
  pages keep it). The page scrolled sideways on phones, showing a black
  strip on the right: the scaling charts' screen-reader table had
  `sr-only` on the `<table>` itself, and a table grows to fit its cells
  rather than staying 1 px wide. The `sr-only` box is now a `<div>`
  around the table; check new hidden tables the same way.
  Then: a **Clips** section after the Results (`_combined/Clips.tsx`, in
  the nav), every clip grouped in the owner's order: UR5e real world
  (Nut on bolt with two "To come" frames for the two nut runs still to
  come, Rod in hole, Gear mesh), UR5e simulation, ANYmal C (the 6 s
  excerpt and three "To come" frames for the per-terrain clips), ANYmal
  D (12 terrains and "Jump box" to come), Franka (Nut on bolt). Task names
  only, two clips across on phones, three on tablets, four on laptops,
  videos load near the screen and play only on screen. UR5e simulation
  is one clip per task: the owner's two picked runs **one after the
  other**, the more interesting first, then the nominal (static
  close-up, hard cut, no labels; `ur5e-sim-{task}-seq`, `SIM_SEQ` in
  `app/lab/library.ts`, `seq_jobs` in `encode_library.py`). Never side
  by side, never labelled "Nominal" (the owner's correction: the old
  pairs were). The real gear mesh, ANYmal C and Franka clips are
  excerpts of their continuous runs (owner: "the franka short clips are
  the same as the long clip but chopped up"); they are in Clips for now,
  to be confirmed. Clips replaces the draft's Footage section and the
  Poster 3 clip index, so `/lab/combined-draft/` differs from the
  combined page only by paper Figure 7 under "Sampling during training".
  Then, from labmates' feedback on the first sections: the reel leads
  with the nut and shows it picked up (else it looks as if only the
  screwing were solved), order nut, gear mesh, rod (the rod "kickflip" no
  longer first). The owner: use the hardware clips whole at 1×, untrimmed.
  New reel `reel4.mp4` (53.1 s; `REEL4` in `encode_library.py` and
  `library.ts`, `COMBINED_REEL` in `_combined/reelSource.ts`), on the
  combined page only; the reel studies keep `reel.mp4`. Also flagged: the
  Summary's "a policy solves only some of the time" reads as if SGS spent
  simulation only some of the time; rewrites offered to the owner.
  Then: the Results divider leads with the real nut (nine clips), and its
  robot labels no longer stack in one column ("the titles in that divider
  all line up vertically, which kinda makes it lose a bit of touch"). A
  switch at the bottom left (`?quilt=`, `_combined/QuiltChosen.tsx`):
  Now (as reviewed), Q1 staggered (each cell 1 or 2 wide, chosen per
  width by a seeded search in `_combined/quiltStagger.ts` so no label sits
  under the one before it, few filler cells; the default), Q2 (Q1 with
  one or two big 2 × 2 clips) and Q3 (Q2 with clip names and label text
  at varying corners). Cell spans per container step are CSS variables
  (`_combined/quilt.css`). Picked: **Q1**; the switch is gone
  (`variant="q1"`).
  Summary copy, picked by the owner (2026-10-08, the combined page only,
  `SummaryPlain` `copy={2}`; the studies keep the first copy): "Success-Guided
  Sampling (SGS) **trains on the task configurations that are neither too
  easy nor too hard for the current policy**. With it, reinforcement
  learning **scales much more effectively, to over a million simulated
  robots at once**, in legged locomotion and contact-rich manipulation."
  (Second sentence from the abstract's "much more effective scaling",
  2026-10-08; "keeps improving up to over a million" read clumsily, and
  the owner wants the order kept: "With it, reinforcement learning …".) Words to
  avoid in the copy: "spends", "parallel environments", "parallel
  simulation", "moderate success rate".
  Author names in the combined page's header link to each author's page
  (`AUTHOR_PAGES` in `_combined/content.ts`, `Top links`), with a faint
  underline (`.cb-author`). Ignacio's link is his LinkedIn. His surname is
  Dagnino (owner, 2026-10-08), corrected everywhere from "Dagnigo".
  Method part 02 (2026-10-08): the "To come" box gave way to the three
  reset strategies of the Franka nut on bolt, the paper's names (appendix
  A.2) in its order, hardest first: **Reaching** (owner's `spawn0_wide`),
  **Stable Grasp** (`spawn2_wide`), **Near-Goal** (`spawn1_wide`); checked
  against the frames. Each video holds 20 task configurations for a second
  each, cropped closer (2880 × 1620 of the 4K render), 1600 px, about
  0.8 MB (`scripts/lab/encode_resets.py`, from the owner's
  `franka_reset_tour_4k` folder; `reset_tour.mp4` is not used; files in
  `public/lab/media/library/resets/`). `_combined/ResetStrategies.tsx`
  and `resets.css`, a lead sentence ("For assembly, the task
  configurations come in equal parts from three reset strategies") and a
  one-sentence description per strategy, in three layouts on a switch
  (`?resets=`): R1 the list beside the video as the Highlights chapter
  list, the chosen strategy's description open under its name (the
  default), R2 tabs above the video with the description under it, R3 all
  three side by side. The lead and the descriptions are new copy for the
  owner to review. Picked: **R1** (the switch is gone, `layout` prop). The
  widget is passed in by the combined page
  (`MethodFlow2` `configurations`); `/lab/method-flow-2/` keeps its "To
  come" box.
  Method part 03, Sampling during training (2026-10-08), from Patrick's
  learning-progress bundle (`mateo_sgs_learning_progress_repro_20261007.zip`
  and `INTERACTIVE_VIEWER_HANDOFF.md` in the owner's Downloads; the bundle
  is read only). Per UR5e task, one fixed reset (a task configuration)
  through training: 64 trials per checkpoint, 95% Wilson intervals, clips
  of the policy at four or five checkpoints, and the SGS rule's weight for
  each success count (manipulation preset: target 0.5, κ 1, T 2, ε 1e-4;
  an illustration of the rule, not measured sampling frequency).
  `scripts/lab/encode_learning.py <bundle>` cuts the ledger's frames from
  each raw render in order (crop x 320–1600, 960 px, 30 fps, 1×, keyframe
  every 10 frames; 0.9–1.6 MB each, `public/lab/media/library/learning/`),
  asserts frame counts and the frame-to-checkpoint mapping, and writes
  `_combined/learningData.ts`. `_combined/LearningProgress.tsx` and
  `learning.css`: a W1 sentence, the six tasks as names (nut first), the
  video with a bar split by checkpoint (drag, click, arrow keys one frame,
  Page Up/Down one checkpoint), and the chart: success over training
  (footage checkpoints black and clickable, others grey, Nut's early
  separate-batch rows hollow, the current checkpoint red), and beside it
  on the same success axis the SGS weight curve in red with the current
  weight marked, joined by a dashed guide (Rail). The owner did not love
  the sideways curve; views tried (`LearningProgress` `view`): Rail, Both
  (Rail plus Patrick's band where the weight is at least 0.9× peak), Band
  (the band alone), Time (the weight at each checkpoint in a panel under
  the chart), Curve (the weight curve upright, success rate across).
  Picked: the band and the curve together, **bandcurve** (the curve beside
  the chart on laptops, under it on phones, the same band across its
  success axis); no switch. The 95% interval bars are off the chart
  (owner: not sure they are needed; `ci` prop), still in the hover details
  and the screen-reader table. Bundle caveats kept: exact counts ("57 of 64" for waterproof),
  64 trials per checkpoint stated in the text, clips at 1×.
  Clips, ways to watch a clip large (2026-10-08; owner: Clips had no way
  to open a video full screen, and videos should be downloadable "at high
  resolution"). `_combined/ClipsViews.tsx` (+ `clipsViews.css`, the
  groups as data in `clipsData.ts`, which must stay in step with
  `Clips.tsx`), on a switch (`?clips=`, `_combined/ClipsChosen.tsx`): Now
  (`Clips.tsx` as reviewed), K1 (the grid; a tile opens a player over the
  page, previous and next, arrow keys, Esc, playing on through the
  collection; the default), K2 (one viewer and the whole collection as a
  numbered list beside it, under it on phones with the viewer pinned), K3
  (the grid; a tile opens in place across the grid). Each player has full
  screen (the iPhone's own player on iOS) and Download. Downloads:
  `scripts/lab/encode_downloads.py <SGS> --limits <trimmed limits>` reuses
  `encode_library.py`'s sources and cuts read-only (it swaps in its own
  encoders) and writes 1080p files, 30 fps, CRF 20 with a bitrate cap
  (runs CRF 23), each under Cloudflare's 25 MiB per-file limit, to
  `public/lab/media/library/download/` (55 files, 216 MB; pass `--premiere`
  as for `encode_library.py` for the clips added 2026-10-08), and the list
  the page offers to `_combined/downloads.ts`. On the final site the
  `download` attribute only works same-origin, so a media host on another
  origin must send `Content-Disposition: attachment` for these files.
  Then: the owner is torn between K1 and K2, and asked for the Highlights
  reel's controls and status bar. Every player now has the reel's bar: one
  2 px segment per clip of the current group (widths by length), earlier
  ones full, the current one filling in red as it plays; drag in it to
  scrub, click another segment to jump to that clip, arrow keys seek a
  second, Page Up/Down change clip; play/pause and full screen at its end
  (and close, in K1). Previous and next sit on the video's edges (on hover,
  always on touch screens). Under it: the name, the setting, Download.
  Hosting (owner, 2026-10-08: "always free and hassle-free", on GitHub):
  the plan is the site and the streaming videos on GitHub Pages, with the
  videos kept out of git history as assets of a GitHub Release that the
  deploy workflow downloads into the build; the 1080p downloads linked
  straight to the release's asset URLs (no limit on a release's total size
  or bandwidth, up to 1,000 files of up to 2 GiB each; they do not count
  toward Pages' 1 GB site and 100 GB/month soft bandwidth). Not set up
  yet: needs the owner's go-ahead to create the release and change
  `.github/workflows/deploy.yml`.
  Picked: **K1** (the switch and `ClipsChosen.tsx` are gone; the page
  renders `ClipsViews view="k1"` from `clipsData.ts`, now the list the page
  uses; `Clips.tsx` is the earlier grid, unused). Franka in Clips is only
  the whole one-minute continuous run (`franka-sim-nut-1m-full`, from
  `franka_nut_1m.mp4` in the owner's Premiere folder, ADDED in
  `encode_library.py`; 1.4 MB on the page, 7.1 MB download): the shorter
  Franka clips are cut from it. Downloads longer than 30 s get the runs'
  settings in `encode_downloads.py`. 03 Continuous runs still shows the
  earlier 30 s Franka run (`run-franka-sim-nut`).
  03 Continuous runs now shows the whole one-minute Franka run
  (`franka-sim-nut-1m-full`) in place of the 30 s one. Paper and Code: no
  links until the paper is on arXiv and the code is out; both show as
  plain text, Code as "Code (coming soon)", in the header, the bar and the
  phone menu (`_combined/PaperCode.tsx`; set `PAPER_URL` and `CODE_URL` in
  `_combined/content.ts` to turn them into links). GitHub hosting: wanted,
  but not until the design is done (owner).
  Link previews (2026-10-08): the page shared with the starter template's
  triangle icon and no image. `/lab/og/` (`_combined/OgCards.tsx`,
  `og.css`) sets four 1200 × 630 cards from the page's own wordmark and
  type: O1 the header (mark and title), O2 the first frame of the first
  highlight (nut run 4) beside the mark and title, O3 that frame across
  with the mark and title on a white band, O4 one frame per robot around
  the mark; and three icons: I1 a black S, I2 "SGS" on black, I3 a black S
  with a red square. `scripts/lab/og_cards.mjs` screenshots them; the
  cards are `public/og/sgs-o1…o4.jpg` (53–102 KB, under WhatsApp's
  ~300 KB). The combined page's metadata (`_combined/share.ts`,
  `shareMetadata`): the full title, the summary as description, Open
  Graph and Twitter large-image cards with `CARD` (O2 for now), absolute
  URLs from `SITE_URL` (default https://sgs-rl.github.io; build the
  Cloudflare preview with `SITE_URL=https://sgs-rl-lab.mateogc.workers.dev`).
  Icons: `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`: I4,
  "SGS" white on black as in the bar (owner: "can we make the little icon
  that appears on the tab say SGS?"), the favicon's 16, 32 and 48 px
  images each set as text at that size on `/lab/og/` rather than shrunk
  (the ICO's images must be RGBA or Next fails). The stills for the
  cards are in `public/lab/media/library/og/` (git-ignored, fetched with
  the library). When the site moves to the root, use `shareMetadata("/")`.
  Owner's text edits (2026-10-08): Overview, Manipulation ends "with zero
  demonstrations and the same reward function across all tasks"; Method 01
  drops "The PPO policy update stays the same"; Method 02 ends "SGS
  samples a large, **fixed** set of task configurations before training"
  (no counts); Method 03 reads "We follow **one fixed task configuration**
  of each UR5e task through the course of training. SGS gives it **small
  weight while the policy never solves it**, **large weight when it's
  getting better but not perfect**, and **small weight again once the
  policy has mastered it**." (the 64 trials are left to the chart).
  The 1× note (owner: "very early on, maybe even before the highlights ...
  in a very clean way"): three placements on a switch (`?speed=`,
  `_combined/speedNote.tsx`, opt-in props so the reel studies are
  unchanged): S1 "All videos at 1×" at the right end of the Highlights
  title band (the default), S2 the same after "SGS" in the black bar, S3
  "1×" in the Highlights and Clips players' controls.
  Picked: **S1** for the 1× note (the switch is gone; `useSpeedNote`
  returns "s1", S2 and S3 stay in the code). The Clips viewer's close is
  a black "Close ×" at the top right (owner: on a phone it was not clear
  how to close); a tap outside the clip and Esc close too. Continuous
  runs use the page's own player (`_combined/RunPlayer.tsx`: the bar,
  play/pause, full screen, the name and Download under it), not the
  browser's controls, which lay over the video on phones; the icons and
  full screen are shared in `_combined/playerKit.tsx`.
  The end of the page (owner, 2026-10-08): a **BibTeX** section (in the
  nav), the paper's entry under the key `zhang2026balanced` in the PPO
  block's mono face, with Copy; then the mark across a full black screen,
  white with the words in red, as the header inverted
  (`_combined/Closing.tsx`, `.cb-bib`, `.cb-end`).
  **Live (2026-10-09).** The combined page is the site: `app/page.tsx`
  renders `CombinedPage` at https://sgs-rl.github.io/ (with Inter Tight and
  the lab styles, as the lab layout gives the lab pages, and
  `shareMetadata("/")`); `main` was fast-forwarded to this branch and the
  Pages workflow deployed it. The earlier site's `app/components` are
  unused. The lab studies are published too, under /lab/ (unlisted,
  noindex). Videos are not in git: they are assets of the GitHub release
  `media-v1` (https://github.com/SGS-RL/sgs-rl.github.io/releases/tag/media-v1):
  `sgs-media-library.tar` (the library without downloads, 72 MB), which
  `.github/workflows/deploy.yml` unpacks into `public/lab/media/` before
  building, and the 56 downloads as `{id}.mp4`, which the Download buttons
  link to (`NEXT_PUBLIC_DOWNLOAD_BASE`, set by the workflow; GitHub serves
  them as attachments). To change footage: encode it
  (`encode_library.py`, `encode_downloads.py`), run
  `scripts/lab/release_media.sh` (replaces the assets of `media-v1`), then
  re-run the workflow (`gh workflow run deploy.yml`) or push to `main`. The
  workflow retries the build (flaky Google Fonts fetch). Its actions run on
  Node 20, which GitHub has deprecated: move them to newer majors when it
  becomes an error.
  Then (2026-10-09): continuous runs open large like Clips (owner: "the
  same full screen behavior as the ones in Clips"): on the page the bar,
  pause and full screen, no download; full screen or a tap on the video
  opens the Clips viewer (`ViewerShell` in `_combined/playerKit.tsx`, now
  shared by both) from the same moment, with true full screen and
  Download; closing carries on from the viewer's time. The scaling
  charts' tooltip opens beside the hovered scale on the side with room,
  rows unwrapped (at 1M, "Uniform" wrapped against the chart's edge).
  Then (2026-10-09, tried on the Cloudflare preview first; owner: "don't
  make these changes on the released website, for now let's test locally
  or on cloudfare"): Paper links to https://arxiv.org/abs/2610.12465
  (`PAPER_URL`). Below 1024 px the bar drops "(coming soon)" after Code,
  which had wrapped and been cut off on tablets. And the first screen
  (owner: "make the SGS and the title, and maybe the text everywhere else
  if needed, slightly smaller so that the highlight videos show on the
  first page without the need to scroll", laptops first), three versions
  of the whole page at `/lab/fold-1/` to `-3/` (`CombinedPage fold`,
  `_combined/fold.css`): F1 the mark on 4 of 12 columns, a smaller title
  and 4rem section titles; F2 the mark on 4 columns, "Highlights" and the
  1× note over the chapter list beside the video (Highlights layout r6,
  the band kept below 1024 px); F3 F2 with the mark on 5 columns. From
  1024 px the video is as tall as what is left of the first screen,
  controls included (at least 18rem). Phones are the same in all three:
  tighter spacing, a smaller title and section titles, the video's bottom
  edge on the first screen at 390 × 664.
  The owner liked F2 most, but not that the chapter list ran longer than
  the video. Three fits of the list to the height of the video and its
  controls, on F2 at `/lab/list-1/` to `-3/` (`ListFit` in
  `_combined/HighlightsLayouts.tsx`, from 1024 px): L1 the groups in two
  columns (UR5e on the left, Franka and the ANYmals on the right), at the
  foot, level with the controls; L2 one column that scrolls, each group's
  heading pinned while its rows pass, the current chapter kept in view;
  L3 run-in, each group's chapters on wrapping lines without times. On
  short screens (1280 × 650) L1 and L3 scroll too, with a fade at the
  foot while there is more below. The owner picked L3, and deployed it
  with the rest of this round: the site and `/lab/combined/` render
  `CombinedPage fold="f2" fit="runin"`.
  Before Clips, `/lab/combined-draft/` was the whole-site mock-up: the same
  page, then Over training (paper Figure 7), the quilt divider, Results,
  Footage and Clips; the parked "Just PPO" and "Task configurations"
  are gone, since Method parts 01 and 02 cover them. The quilt divider
  is a small "Results" band (`_combined/QuiltDivider.tsx`, a copy of the
  Poster 3 quilt): eight clips, one per task, nothing to click, cells in
  order (row flow with flat cells filling row ends, so each robot's label
  stays before its clips; Poster 3's dense packing had moved labels away
  from their robots). It stands in for the Results heading band and
  carries the `#results` anchor. The preview moved from Netlify to
  Cloudflare: https://sgs-rl-lab.mateogc.workers.dev/lab/ (see "Sharing a
  preview").
  ANYmal C and D per terrain in Clips (2026-10-08). The owner's limit
  renders (`~/Downloads/anymal_limits`, read only: per robot, terrain,
  setting and seed, `videos/course_chase_3q.mp4`, and a
  `limits_summary.txt`) were cut by `scripts/lab/trim_anymal_limits.py`
  into `~/Downloads/anymal_limits_trimmed/`, with a picking page
  (`index.html`) and `trims.csv`. Each run walks to a yellow marker that
  jumps ahead when reached; a clip runs from the first jump (about 2 s in)
  to the second (obstacle crossed). Runs that start at the bottom (configs
  named `inside`: stairs, pit, inverted slope) keep their start and are cut
  at the one jump (owner: "no need to trim the beginning, just the end").
  The summary's "Course complete" is not trusted alone (ANYmal D
  `gap_d1.0_b0` seed5 says complete but falls); a run needs the robot in
  view at the end. When the second jump happens out of view, its time is
  the end of the video minus the walk to the final marker, the same on
  every run (99 frames on C at 25 fps, 69 on D at 20 fps). The owner
  picked one run per terrain (`LIMITS` in `encode_library.py`, encoded
  with `--limits`; `LIMITS` in `library.ts`, ids `anymal-{c,d}-limit-*`,
  at the source frame rate) and asked to "replace all radiating beams with
  the rotated ones": radiating beam is the `radiating_beam_offset` layout
  on both robots. In Clips, both ANYmals list the terrains in one order
  (climbing box, stepping stones, gap, then by name); ANYmal C keeps the
  "All terrains" excerpt first, ANYmal D keeps the earlier maze clip (no
  new maze render), and the "Jump box" frame is filled. The round 3 pages,
  the Overview and the quilt keep the earlier ANYmal D clips.
  Then a new Highlights reel, `reel5.mp4` (124 s, 13 chapters; `REEL5` in
  `encode_library.py` and `library.ts`, `COMBINED_REEL` in
  `_combined/reelSource.ts`, which falls back to `reel4.mp4`, then the
  stand-in). The owner's order: UR5e hardware, the two new nut runs
  (`sgs_nut_real_cleanaf.novoice.mp4`, then
  `sgs_nutreal_gentle_place_bettercolors.mp4`), the gear spin
  (`gear_spin.novoice.mp4`, which opens with a hand placing the gear), gear
  mesh clip 1 and rod clip 5, all whole; UR5e simulation rod and BNC as
  before plus waterproof (clip 1, the interesting run of the pair, whole);
  Franka nut, 0–16 s of `franka_nut_1m.mp4` (the one-minute run, which
  cuts to a close-up and back); ANYmal C, 28–50 s of its one-minute run
  ("Several terrains", as in the Overview); ANYmal D climbing box,
  floating island and stepping stones, the picked crossings from Clips,
  whole. The owner's message said "the first rod video" for the first nut
  run, read as the first video. Sources: paths in the drive folder "SGS"
  (the owner uploaded the new files there, byte for byte the same:
  `UR5e Real/nut/clip4/sgs_nut_real_cleanaf.novoice.mp4`,
  `UR5e Real/nut/clip5/sgs_nutreal_gentle_place_bettercolors.mp4`,
  `UR5e Real/gear_mesh/spin_gear/gear_spin.novoice.mp4`,
  `Franka Sim/one_min_continuous_run/franka_nut_1m.mp4`), or with
  `--premiere` the same files by name from the owner's flat Premiere Pro
  folder (`~/Documents/Adobe/Premiere Pro/25.0`, used on the owner's Mac,
  where no unzipped SGS folder has the new files); the ANYmal D crossings
  from `--limits`. `encode_library.py` prints each chapter's start frame
  at 30 fps (`reel_jobs(..., frames=True)`); `REEL5_CHAPTERS` holds them.
  `reel4.mp4` and `REEL4` stay as they were.
  Then the reel's new footage as single clips (`ADDED` in
  `encode_library.py` and `library.ts`: `ur5e-real-nut-4` and `-5` for
  drive clip4 and clip5, `ur5e-real-gear-spin`, `franka-sim-nut-1m` for
  0–16 s of the one-minute run). Results 02 Real world: Nut on bolt shows
  the two new runs first, then the earlier two (nut 3, nut 1), in place of
  the two "To come" frames. Clips (`Clips.tsx` and `clipsData.ts` alike):
  the same four nut runs, the gear spin first under Gear mesh, the 16 s
  Franka clip first under Franka. Not added: the ANYmal C 28–50 s excerpt
  (owner: "don't add the ANymal C expert, it's already there", the "All
  terrains" excerpt stands for it). The one-minute Franka run now exists,
  so Results 03 could show it instead of the 30 s run (not done; owner to
  say).
- **Where we're at (end of 2026-10-07, for picking up remotely).**
  `/lab/combined/` is the site being assembled; it is live at
  https://sgs-rl-lab.mateogc.workers.dev/lab/combined/. Approved so far: header
  (H4 colours, S4 layout; S6 no longer offered on this page), Highlights (R1), Summary (F1,
  full width, thin + bold), Overview (O1, one sentence and one row of
  clips per band), Method (version B of `/lab/method-nav` plus the Beta
  explorer; the owner is still choosing how the live maze shows sampling
  chances: `?chance=dots|heat|trail|bar`, `?floor=1e-6|1e-8`, and may want
  a broader κ). Set up but not yet reviewed: Task configurations, Just
  PPO, Over training, the quilt divider, Results, Footage, Clips (see
  Decisions, "Sections 6–12", for what is still "To come"). Not yet on
  the page: Cite and the footer.
- **Parked draft (2026-10-07, later).** The owner asked to park the draft
  with all the additional sections and come back to the approved ones
  only, taking the rest one at a time. `/lab/combined/` now ends at the
  Method (nav: Highlights, Summary, Overview, Method); the full draft is
  at `/lab/combined-draft/` (`CombinedPage` with `draft`;
  `DRAFT_SECTIONS` in `_combined/sections.ts`). Bring a section back by
  moving it above the `draft` guard in `CombinedPage.tsx` and its entry
  from `DRAFT_SECTIONS` into `SECTIONS`.
- **Method in parts (2026-10-07, later).** The owner asked to split the
  Method under subtitles that still read as part of the Method.
  `/lab/method-parts/` (`_combined/MethodParts.tsx`) regroups the
  approved Method's text and figures, unchanged, into three parts: 1 Task
  configurations (the definition paragraph), 2 A toy example (the live
  maze, its paragraph, the explainer link), 3 The weighting (the Beta
  explorer). Four ways to set the subtitles: M1 Rules (hairline, number,
  name), M2 Path ("Method / …" at the entry size), M3 Bands (smaller white
  bands, "Method" beside the name), M4 Pinned (as M1, and the Method band
  stays at the top naming the part on screen, `PinnedBand.tsx`). The
  combined page keeps the one-piece Method until the owner picks; its
  paragraphs now come from `ConfigurationText`, `ToyExampleText` and
  `ExplainerLink` in `Method.tsx` (same output).
- **Method, in order (2026-10-07, later).** The owner liked Path and
  Bands best and chose **Bands (M3) for now**, and set an order for the
  Method: the minimal diff with PPO (naming task configurations without
  explaining them); task configurations as (s₀, g, e), brief for now,
  videos or something interactive later; the weighting with the Beta
  distribution on the toy task, which introduces the toy example; the
  sampling; the sampling during training. Mocked up at
  `/lab/method-flow/` (`_combined/MethodFlow.tsx`): parts 1 (the parked
  `AlgorithmPair`), 2 (new text and a "To come"), 3 (the Beta explorer,
  starting at the toy example's own setting, `fromToy`), 4
  (`SamplingFigure.tsx`, new: the toy snapshot with each configuration's
  chance as a dot and a round of 48 draws, one per robot, every 1.6 s;
  SGS or uniform; counts per round), 5 (the live maze). Part 4's numbers
  are computed from the snapshot: 15 of 158 configurations are reached
  10–90% of the time and get about 48% of SGS's draws, 9% of uniform's.
  The pseudocode now wraps long lines under themselves on phones instead
  of scrolling sideways (also in the parked draft). Not on
  `/lab/combined/` yet.
- **Method, in order, second version (2026-10-07, later).** Owner:
  always say "task configurations", never just "tasks" or
  "configurations" (applied everywhere the combined pages say it,
  including the approved Method on `/lab/combined/`, the Beta explorer,
  the pseudocode and the parked draft); number the Method's steps in
  their bands instead of repeating "Method" ("more Swiss"); let the text
  span the full width. `/lab/method-flow-2/` (`_combined/MethodFlow2.tsx`):
  bands read "01 The change to PPO" … "05 Training"; each step's text runs
  across the page above its figure, at a larger size so the lines stay
  readable, in two styles: W1 the summary's next size down (F2), regular
  with bold key phrases; W2 the summary's own size and stroke (F1, thin,
  key phrases bold). The weighting's paragraph moves from beside the
  curve to the full-width text (`BetaExplorer` `withText={false}`); the
  sampling and training mazes are as wide as the screen height allows.
  Then: "use big numbers for the subtitles, then we'll decide on size":
  the numbers are now set at the titles' size ("01 The change to PPO"),
  in a fixed column so the titles line up. W1 or W2 still to pick.
  Then: "don't use semicolons" (copy rule for the whole site, like "task
  configurations": rewritten wherever the combined pages, the method
  studies and the parked draft said one; left only in Poster 3's Runs
  text, which the draft imports from `_poster3` and is fixed when that
  section is copied in) and "do we need this mix of thin and bold
  everywhere? can we try just thin for now?": the Method's text is now
  thin throughout in both sizes, with no bold key phrases (reverted, see
  below). In JSX, a line whose text holds `&nbsp;` lost its leading
  space ("s₀and"); write the no-break space as a string,
  `{"goal\u00a0g."}`.
  Then: "i don't like just light actually, let's bring back light and
  bold". Both sizes (W1, W2) are now thin with bold key phrases (weights
  200 and 500), the approved summary's stroke. Thin only is dropped.
  **Picked: W1** ("whatever you showed me on the phone renders", which
  were W1). Next the owner edits the copy section by section: the text of
  each is printed in the chat, one at a time, for them to edit and paste
  back.
- **Netlify (gone).** The Netlify preview was deleted on 2026-10-07
  after its free credits ran out; the preview is on Cloudflare now. A
  cloud session found Netlify blocked by its network policy; check the
  same for `*.workers.dev` and `api.cloudflare.com` before relying on it.
- **Footage on a new machine.** The encoded videos are git-ignored. Run
  `scripts/lab/fetch_library.sh` to download them from the Cloudflare
  preview (list in `scripts/lab/library-files.txt`), or encode them from
  the owner's Google Drive folder "SGS" with
  `scripts/lab/encode_library.py`. The ANYmal per-terrain clips
  (`anymal-{c,d}-limit-*`) come from the owner's limit renders in two
  steps, trim (about 3 minutes; a re-run re-encodes only clips whose cut
  changed, and `--pad 0.5` keeps half a second each side) and encode,
  then the file list is rewritten:

  ```sh
  python3 scripts/lab/trim_anymal_limits.py ~/Downloads/anymal_limits
  python3 scripts/lab/encode_library.py <SGS folder> \
    --limits ~/Downloads/anymal_limits_trimmed
  (cd public/lab/media/library && find . -type f -not -name .DS_Store |
    sed 's|^\./||' | LC_ALL=C sort) > scripts/lab/library-files.txt
  ```

  Deploying the preview from a cloud session needs a
  `CLOUDFLARE_API_TOKEN` in the environment.

- **Where things stand (2026-10-06).** The owner is assembling one site
  from the parts they like, at `/lab/combined/` (`app/lab/_combined/`),
  one section at a time: they describe a section, it is built and
  screenshotted, they review, and only after they approve does the next
  section start. See "Combined site" under Decisions.
- **Before that (2026-10-05).** Two tracks are being polished in
  parallel: a _serious_ one (Swiss, light: `/lab/swiss-3/`) and a
  _playful_ one (NOF poster system: `/lab/site-3/` and `/lab/poster-3/`).
  The round 3 pages carry the owner's real footage; round 2 (`-2` routes)
  keeps the placeholders for comparison.
  The owner picks one later with labmates. Round 2 also produced parts
  studied on their own pages (reel, wordmark and covers, method, scaling,
  gallery, full title, method as navigation).
- **Plan.** (1) The owner hands over the real clips (most arrived
  2026-10-05; see "Needs the owner's attention"). (2) Iterate the serious version with them. (3) Then the playful
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

| What                                     | Where                 | State                        |
| ---------------------------------------- | --------------------- | ---------------------------- |
| **Combined site** (`_combined/`)         | **`/lab/combined/`**  | **Being built, by section**  |
| Header colours (`_combined/inks.ts`)     | `/lab/header-colors/` | Part, owner to pick          |
| Highlights placement and controls        | `/lab/highlights/`    | Part, owner to pick          |
| Opening: A or B × Overview or Summary    | `/lab/opening/`       | Part, owner to pick          |
| Serious start, colour later (O1–O4)      | `/lab/serious-start/` | Part, owner to pick          |
| Scroll-past fix for the current homepage | `VideoNarrative.tsx`  | Done, not live               |
| **Serious page, round 3** (`_swiss3/`)   | **`/lab/swiss-3/`**   | **Latest, serious track**    |
| **Site page, round 3** (`_site3/`)       | **`/lab/site-3/`**    | **Latest, playful track**    |
| **Poster page, round 3** (`_poster3/`)   | **`/lab/poster-3/`**  | **Latest, playful track**    |
| Serious page, round 2 (`_swiss2/`)       | `/lab/swiss-2/`       | Round 2, placeholders        |
| Site page, round 2 (`_site2/`)           | `/lab/site-2/`        | Round 2, placeholders        |
| Poster page, round 2 (`_poster2/`)       | `/lab/poster-2/`      | Round 2, placeholders        |
| Method as navigation (`_nav/`)           | `/lab/method-nav/`    | Part, round 3, see below     |
| Full title, six settings (`_title/`)     | `/lab/title/`         | Part, round 3, owner to pick |
| Highlight reel (`_reel/`)                | `/lab/reel/`          | Part, round 2                |
| Wordmark and covers (`_cover/`)          | `/lab/cover/`         | Part, round 2                |
| Method, paper-accurate (`_method/`)      | `/lab/method/`        | Part, round 2                |
| Scaling with clips (`_scaling/`)         | `/lab/scaling/`       | Part, round 2, needs clips   |
| Clip gallery and player (`_gallery/`)    | `/lab/gallery/`       | Part, round 2, needs clips   |
| Swiss, light (first study)               | `/lab/swiss/`         | Earlier study, frozen        |
| Swiss, dark (first study)                | `/lab/swiss-dark/`    | Earlier study, frozen        |
| Website, NOF style (`_site/`)            | `/lab/site/`          | Round 1, frozen              |
| Poster series, NOF style (`_poster/`)    | `/lab/poster/`        | Earlier study, keep intact   |
| Clip layout studies (`_components/`)     | `/lab/clips/`         | Earlier study, frozen        |

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
  `AUTHOR_LINE` adds the co-first asterisk to names, and the equal-advising
  dagger (Rosario Scalise, Byron Boots; legend `ADVISING`, owner,
  2026-10-06), on every page.
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
- **The owner's footage (2026-10-05).** Delivered as a zip of the drive
  folder "SGS" (Anymal-C, Anymal-D PACE, Franka Sim, UR5e Real, UR5e Sim),
  2.1 GB, plus a spreadsheet ("SGS Clip Selector") rating each UR5e sim
  clip. Neither is in the repo. `scripts/lab/encode_library.py <SGS
folder>` turns it into `public/lab/media/library/` (27 MB); the
  manifest is `app/lab/library.ts` (`LIBRARY`, `RUNS`, `REEL3`). Add new
  footage by adding entries to both. The encoded media is git-ignored (the
  owner's call, 2026-10-05): on a fresh checkout, get the drive folder and
  run the script, or the round 3 pages show empty video frames. Choices
  behind it:
  - UR5e sim tasks are shown as pairs, as the owner asked: the most
    interesting run and a nominal one side by side in one video (1288 ×
    360, 8 px white gap; the shorter run holds its last frame). Picks from
    the spreadsheet: BNC 5 + 2, gear mesh 1 + 3, nut 1 + 3, rod 1 + 2,
    waterproof 1 + 2, rectangular peg 3 + 1 (all its runs are nominal).
    Each sim clip comes in three cameras (follow, mixed, static close-up);
    the owner wants only the static close-up for now (2026-10-05), for
    the pairs and the reel alike.
  - Continuous runs (ANYmal C 60 s, UR5e hardware gear mesh 64 s, Franka
    30 s): the owner wants them shown in full but not forced on viewers.
    Each gets the full run (960 px) and a sped-up preview of about 10 s
    (`-fast`, 6× or 3×), so a page can loop the preview and play the full
    run only on request.
  - The Franka footage arrived as one 30 s run with camera cuts at 12.8 s
    and 18.4 s; three excerpts are cut from it for the collection.
  - Mock highlight reel (28.3 s, `reel.mp4`), in the owner's order: UR5e
    hardware rod (clip 5), nut (clip 3, at 3×), gear mesh (clip 1, at 2×);
    UR5e sim rod and BNC; Franka close-up; ANYmal D climbing box, stepping
    stones, gap. Segment times are in `REEL` in the script.
  - Hardware clips are assumed to be real time; the nut clips are 4K at
    60 fps and slow, hence the speed-up in the reel.
  - The earlier studies keep the placeholder `CLIPS` and `HIGHLIGHTS` in
    `content.ts`, so they still look as they did when reviewed. Round 3
    pages use the library.
- **Round 3 pages (2026-10-05).** Each copies its round 2 page into a new
  folder and swaps in the library footage; shared components were copied,
  not edited, where pairs or runs needed changes (each folder has its own
  `Player`, gallery and clip list that keep a clip's aspect). All three:
  the mock reel (`REEL3`) as a plain video with the speed of every chapter
  shown; UR5e sim pairs never cropped, their two sides labelled; a new
  continuous-runs section that loops the sped-up preview (muted, speed
  labelled) and plays the full run at 1× only on "Watch the full run"; the
  scaling chart keeps the old placeholder clips, labelled as such, until
  the scaling clips exist. Per page:
  - `/lab/swiss-3/`: sections 01 Summary … 05 Runs, 06 Clips, 07 Cite;
    clips grouped by robot and sim/hardware; Wall kept as the band into the
    collection (pairs take two cells); the sim-to-hardware comparison in
    Results shows the UR5e pairs over two hardware runs (rod, nut, gear
    mesh); on phones, Player stacks a pair's two runs.
  - `/lab/site-3/`: Highlights right after the header; Overview entries
    rebuilt on the footage (Locomotion yellow, Manipulation pink with the
    pairs, Hardware blue with white type, Scaling mint); Runs after the
    Overview; the clip index lists all 34 clips with a preview that keeps
    each clip's aspect.
  - `/lab/poster-3/`: reel after the cover; Manipulation in three blocks
    (UR5e hardware by task, UR5e sim pairs, Franka); a new blue Locomotion
    page with all 12 ANYmal D terrains; a red Runs page; the Index quilt
    rebuilt from the real 16:9 clips (pairs left out: a square cell would
    crop them); a plain clip list in place of the video grid; facts
    redrafted from the footage (rows to confirm listed in
    `_poster3/facts.ts`).
- **Combined site (`/lab/combined/`, 2026-10-06).** One page assembled
  from the studies, section by section, each approved before the next.
  Parts are copied into `app/lab/_combined/` rather than imported from
  their study, so the studies stay as the owner reviewed them; shared
  pieces that do not change (`content.ts`, `library.ts`, the `Wordmark`,
  `poster.css`, `site.css`) are imported. When a shared piece needs a
  change for this page, copy it into `_combined/` first. The nav bar
  (`_combined/Nav.tsx`) lists only the sections already on the page
  (`SECTIONS`); add each new section there. Sections so far: 0. Current state (2026-10-06, later): header in colour scheme H4
  (black mark, red words) and layout S4 from `/lab/header-sizes/`
  (`_combined/Top.tsx`; the "Copy title" button is gone, "that is
  stupid"); then the highlight reel as placement A with controls 2
  (`_combined/Highlights.tsx`), with REEL3 when the encoded library is
  present. Rosario Scalise and Byron Boots carry a dagger for equal
  advising everywhere.
  Then (2026-10-07): the owner also likes S6, so both stay: a switch at
  the bottom left of the page flips the header between S4 (the default
  since 2026-10-07: "this one actually works better") and S6 (`_combined/HeaderChoice.tsx`, remembered in the browser), on the
  combined page and on every comparison page from now on. On the reel:
  in S4 the first screen showed only half the video; the video should
  not sit alone on one side; liked the numbered chapter list of
  `/lab/swiss` and reel A of `/lab/reel` but on the right, so the video
  shows first; reel C's colour band and big "Highlights" title ("a big
  fan of these big titles"); the Clips index of `/lab/site`. Five
  layouts at `/lab/reel-layouts/` (`_combined/HighlightsLayouts.tsx`,
  `reels.css`): R1 list on the right, R2 the same on a mint band, R3 the
  chapters as a Clips-style index with the current row yellow, R4
  centred with titles under the bar, R5 the big title and list beside
  the video. Picked (2026-10-07): S4 with R1 ("I really like s4 r1 and
  s4 r5, let's proceed with s4 r1 for now"); S4 is the default header.
  Highlights reel at 1× throughout ("All the videos will be 1x"): the
  nut and gear mesh chapters are now 4.5 s at real time, no speed labels.
  Summary: `/lab/summaries/` (`_combined/SummaryStudy.tsx`). A (Serious
  3's, Swiss) and B (single weight, label column) were not liked: "I like
  the text of B better, but I don't like the sidebar thing". C–F set B's
  paragraph across the page with no label column: C plain, D under a
  rule, E larger, F under a big "Summary" title band. C, D and F are also
  shown as full pages after the header and reel: `/lab/combined-c/`,
  `-d/`, `-f/` (`CombinedPage` takes `summary`; the nav's sections live in
  `_combined/sections.ts`, since a server page cannot read a constant
  from the client `Nav.tsx`). The owner liked F and asked for a smaller
  paragraph: `/lab/combined-f-sizes/` switches it between F (as it was),
  F1 and F2 (one and two steps down), F3 (the chapter list's size) and F4
  (that size in two columns); switches are built on `_combined/choice.ts`.
  Then (owner: "the only good options are F, F1, F2, and F3"): F4 dropped;
  two more switches, width (capped at a reading measure, full width, or
  as wide as the R1 video above, which keeps its edge on ultrawide) and
  stroke (regular 400, light 300, light with key phrases at 600, thin 200
  with key phrases at 500; the lab now loads Inter Tight 200 and 300).
  Every switch can be set in the address, e.g.
  `/lab/combined-f-sizes/?size=f2&width=video&stroke=light-key`;
  `previews/summary-matrix/sheet-*.png` are the renders (git-ignored).
  Picked (2026-10-07): F1, full width, thin + bold ("it doesn't bother me
  for ultrawide so far", where it runs to two long lines). It is section
  3 of `/lab/combined/`, and "Summary" is in the nav.
  Overview (2026-10-07), section 4 (`_combined/OverviewPanes.tsx`), copy
  drawn from the paper with the owner ("I don't want to have a bunch of
  stats ... the simplest and most concise description of the most
  important facts about our setup"): four colour bands, each a name, a
  headline and a short table (robots; task; what it does without, or what
  is notable), then clips at 1×. Locomotion: one policy for every
  terrain, ANYmal C and D, no per-terrain experts, distillation or
  demonstrations. Manipulation: contact-rich assembly from the NIST
  Assembly Task Board 1, UR5e and Franka Panda, one reward. Real world:
  zero-shot to a UR5e from camera images, with emergent recoveries.
  Scale: up to a million parallel environments. ANYmal C appears through a
  6 s excerpt of its run (`anymal-c-terrains`, `RUN_EXCERPTS` in the
  encoder). Paper facts used: 13 terrains, ANYmal-D in the paper's
  locomotion experiments, six UR5e ATB1 tasks plus Franka Panda
  nut-and-bolt, RGB distillation with DAgger, zero-shot hardware on three
  tasks, up to 2^20 environments. The summary's "past one million" was
  corrected to "up to one million" on every page.
  Then: "I don't like the right-most columns, too much text and too
  small. Let's assume that we have about 1 sentence per color that the
  reader will actually read." The owner rewrote the four sentences
  (italic "single", key phrases bold); the panes now carry one sentence
  each, in four layouts switched on the page (`?overview=o1`…`o4`,
  `_combined/OverviewChosen.tsx`): O1 name beside the sentence, O2 the
  summary's thin stroke across the page, O3 a large statement, O4 the
  clips left and the text right. Picked: O1 ("I like O1 the most"); the switch is gone
  from the page, the others stay reachable by `?overview=`. Each band
  now has one row of clips captioned with robot and task only ("a single
  row of videos for each of these colors ... the pink one has too much
  going on"): Manipulation shows single runs, the interesting rod (clip
  1. and BNC (clip 5) runs and the nominal gear mesh run (clip 3),
     encoded as `ur5e-sim-{task}-{n}` (`SINGLES` in the encoder), plus the
     Franka wide shot. On phones the rows wrap two to a line.
     Method (2026-10-07), section 5 (`_combined/Method.tsx`). Three layouts
     were tried and dropped the same day; the owner asked instead for "B
     from /lab/method-nav/, plus an explanation of the beta weighting ...
     maybe even interactive and to show how the parameters of it affect
     where the samples get sampled from". So: version B's text and the live
     maze (../\_nav TrainFigure) beside it, with the explainer link; then
     `_combined/BetaExplorer.tsx`, sliders for t, κ, T and the floor ε (log
     scale) with presets (paper locomotion, paper manipulation, the maze's
     sharp setting, uniform), the curve of the chance of being picked, the
     maze partway through training with a red dot per goal sized by that
     chance, and a bar of where the picks go. The floor matters: with a
     large κ the weight's peak is tiny, so the paper's ε = 1e-4 flattens a
     sharp κ. The paper settles several open facts: T = 2 and ε = 1e-4
     throughout; t = 0.66, κ = 5 for locomotion and t = 0.5, κ = 1 for
     manipulation; N = 104,000 configurations for locomotion and 32,768 for
     manipulation; H = 100. The maze figures draw with the `--sw-*` tokens,
     so `.cb-method` defines them in this page's inks.
     Revised the same day: a plain definition of a task configuration (where
     an episode starts, the goal, and the terrain or object), tied to the
     maze, where each cell is one and the red squares are the
     configurations being tried; "toy example", never "toy"; "success rate",
     no p̂; no average-success readout (`TrainFigure` gained `labels` and
     `average` props, defaults unchanged for /lab/method-nav); in the Beta
     figure, T fixed at 2 (it rescales the log weights like κ) and no
     presets named after the paper (left: the maze's setting, uniform).
     Apostrophes in `_combined` JSX are typographic (’): an escaped
     `&apos;` makes the compiler drop spaces elsewhere in the paragraph.
     Then the owner pointed out that the red squares looked drawn almost
     uniformly, since the chances behind them were not shown. The live maze
     now shows each configuration's chance in one of four styles, switched
     at the bottom left (`_combined/MethodMaze.tsx`, `?chance=`): dots (a
     faint red dot, its area the chance), tint (the cell tinted red), trail
     (each pick lights its cell, fading over a few seconds) and dots with a
     live bar of where the picks go. A second row sets the maze's floor ε
     (`?floor=1e-6`, the toy example's value so far, or `1e-8`). Even at
     1e-8 about a third of the picks land on configurations with success
     rate 0: κ = 10 is narrow for an 8-outcome window, whose rates step by
     1/8, so few configurations sit near the target. A broader κ (about 5)
     would concentrate the picks; not changed yet.
     Sections 6–12 (2026-10-07, the owner's list before stopping for the
     day: "If the content already exists, populate it ... Otherwise ...
     placeholders"), all on `/lab/combined/` in this order:
  2. Task configurations (`_combined/MoreSections.tsx`): what one is in
     real training, the counts from the paper, paper Figure 2 (cropped
     from the PDF into `public/lab/media/paper/`). To come: a video of
     the configurations sampled in a real run.
  3. Just PPO: PPO next to PPO with SGS as pseudocode, the two added and
     one changed lines marked.
  4. Over training: paper Figure 7 (floating islands, early, mid and late
     sampling). To come: the same as a video.
  5. A divider: the Index quilt of `/lab/poster-3` (`_poster3/Quilt.tsx`),
     not interactive, before the results.
  6. Results: the scaling chart with a policy clip per scale
     (`_scaling/ScaleCompare`, poster skin, pink). To come: the paper's
     values (the chart still uses `SCALING` in `content.ts`, read off an
     earlier figure: the paper reports 0.73 for SGS and 0.54 for PLR in
     locomotion at 1M, 0.70 for SGS, 0.06 uniform and 0.05 PLR on Franka
     nut-and-bolt) and the clips at each scale.
  7. Footage, in the owner's order: continuous runs (`_poster3/Runs`),
     real world, UR5e simulation (pairs), ANYmal D (`_poster3/Locomotion`)
     and Franka (`_combined/Footage.tsx`, split from
     `_poster3/Manipulation`).
  8. Clips: the clip index of `/lab/poster-3`.
     The clips cut for the Overview (the ANYmal C excerpt and single UR5e
     simulation runs) are `EXTRA` in `library.ts`, not `LIBRARY`, so the
     round 3 pages keep the collection they were reviewed with.
     Method (2026-10-07), section 5 (`_combined/Method.tsx`), three layouts
     switched on the page (`?method=m1`…`m3`): M1 one sentence, the live
     maze (../\_nav TrainFigure) and what it shows beside it; M2 four
     numbered steps from the paper (configurations, last 100 outcomes,
     Beta-shaped weight with a floor, draw on every reset) and the paper's
     weight for both domains; M3 the sentence, the maze on the left and
     the steps on the right. The maze figure draws with the `--sw-*`
     tokens, so `.cb-method` defines them in this page's inks. The paper
     settles several open facts: T = 2 and ε = 1e-4 throughout; t = 0.66,
     κ = 5 for locomotion and t = 0.5, κ = 1 for manipulation; N = 104,000
     configurations for locomotion and 32,768 for manipulation; H = 100.
  1) Header, from Site 2 and Site 3 (identical in both): wordmark,
     title, authors, affiliations, venue, Paper and Code. The "Cite ↓"
     link is left out until there is a Cite section. Changed in round 2
     of the section, at the owner's request:
     - The paper's full title (`FULL_TITLE` in `_combined/content.ts`).
       It breaks after the colon with CSS generated content, so selecting
       and copying it gives one line; the space before the break is a
       no-break space, since an ordinary one at the start of the next line
       is dropped from the copy (Chrome turns it back into a plain space
       on copy). "Mega-Scale" never breaks at its hyphen. A "Copy title"
       button (`CopyTitle.tsx`) sits next to Paper and Code.
     - Ignacio Dagnino's affiliation is the University of Washington, so
       "Independent Researcher" is gone (`AUTHORS`, `AFFILIATIONS` in
       `_combined/content.ts`; the shared `content.ts` still has the old
       one).
     - "Guided" is centred in the G's counter at its old height
       (`_combined/Wordmark.tsx`, a copy of the V6 wordmark): x 0.846em,
       the middle of the counter (0.637–1.056em) measured at mid-word from
       a render with the inset words hidden.
     - The wordmark ignores pointer events and selection. At its size the
       text box of "SGS" reaches well below the letters and covered the
       title and the header links: clicking the title selected "SGS", and
       on a laptop the Paper and Code links under the mark could not be
       clicked. Site 2 and Site 3 still have this.
     - Colour: the owner finds the coral "decent" and asked for
       alternatives. `/lab/header-colors/` shows the header in twelve
       schemes of three inks (ground, mark, type), in three groups: the
       mark in colour on white (H1 coral, the current one; H2 red; H3
       blue; H4 black with red words), light grounds (H5–H8, pairs from
       the poster palettes and Site 3 bands) and strong grounds (H9–H12).
       Schemes are `SCHEMES` in `_combined/inks.ts`; the page uses
       `HEADER_INKS` (H1) until the owner picks. The owner deferred the
       choice (2026-10-06) to get on with the rest of the site.
  2) Highlights (not yet on the page). **Narrowed to A or B, with
     controls 2 (titles under the bar)**; the owner will pick once the
     next section exists, since the choice depends on what follows
     (2026-10-06).
  3) Overview or Summary (not yet on the page). The owner "really liked
     the colorful overview from site 3" and asked for it and the serious
     summary paragraph, each after both openings. `/lab/opening/` shows
     A + Overview, A + Summary, B + Overview, B + Summary (openings in
     `_combined/Opening.tsx`):
     - Overview (`_combined/Overview.tsx`): Site 3's four entries with its
       text, copied; the clip rows and the player are imported unchanged
       from `_site3` (`Row`, `Gallery`); copy them in if they need to
       change. Its links point at sections the page does not have yet.
       Missing footage falls back at build time: single UR5e simulation
       runs (`STANDIN_CLIPS` in `library.ts`) stand in for the pairs, said
       so in the entry; the hardware frames are drawn empty and marked
       "not available here".
     - Summary (`_combined/Summary.tsx`): Serious 3's "01 Summary" (rule,
       small label, the lead paragraph on columns 4–12) in the page's
       single weight, without the section number.
  4) Serious start (`/lab/serious-start/`, `_combined/SeriousStart.tsx`).
     Before committing to the wordmark opening, the owner asked for a page
     that "starts off a bit more serious" and turns "more colorful and
     playful as we scroll down", with no SGS logotype but still making
     clear it is SGS, since the title does not say it; then highlights,
     summary, and the colourful Overview. The top uses the Swiss system
     of `/lab/swiss` (`.swiss`, `sw-*`: paper, display type at weight
     600, hairline rules, small labels, the red accent) and a Swiss bar
     that names "SGS Success-Guided Sampling"; four openings say SGS:
     O1 the name at display size with S, G, S in red; O2 an acrostic of
     large red letters with the words beside them; O3 a red "SGS" tag
     and the name, then "A Balanced Data Diet:" at display size; O4
     "SGS" in plain display letters with the name beside it. After each:
     the reel (titles under the bar) and the summary as Swiss sections
     (rule, label, content on columns 4–12), then the Overview's white
     heading band and colour bands, on the Swiss margins (`.cb-ss-colour`
     sets the poster grid's `--m` and `--g` to the Swiss values). The owner liked the round 3 reel
     as a plain video with progress bars and chapters, but wants no
     unneeded text, the controls as undistracting as possible, and asked
     whether the reel can come first or share the first screen with the
     title. `/lab/highlights/` compares five placements and three sets of
     controls:
     - A after the header (the reel across the measure, no heading or
       caption; on phones it is already on the first screen), B side by
       side from 1024 px (mark, title and authors in 5 columns, the reel
       in 7), C a mark at 27svh with the authors beside it, then the title
       beside the reel (phones as A), D the reel first, filling the first
       screen, E the title and authors, the reel, then the mark.
     - Controls (`_combined/Reel.tsx`, on the shared `_reel/engine`): a
       2 px segmented bar that grows on hover and stays scrubbable, play
       and full screen as icons at its end, and the chapter names in the
       small size; 1 names the chapter on screen ("UR5e, Nut" and
       "Simulation" or "Hardware, 3×"), 2 sets every title under its
       segment with the robot and domain under them (phones as 1), 3 runs
       every title in one wrapping line grouped by robot and domain.
       Gone from round 3: the caption paragraph, chapter numbers, start
       times, the time readout, column heads, the "Play" and "Full
       screen" words, the Highlights heading band.
     - The reel there is a stand-in (`STANDIN_REEL` in `library.ts`,
       `standin-reel.mp4` from `STANDIN` in `encode_library.py`): five
       UR5e simulation close-ups and four ANYmal D terrains, the only
       footage a cloud session could fetch. The page switches to `REEL3`
       by itself when `public/lab/media/library/reel.mp4` exists at build
       time.
- **Footage through the Google Drive connector (2026-10-06).** The owner's
  drive folder is "Research Media/SGS"; it also has a `highlights` folder
  with four ~150 MB cuts (`sgs_highlights`, `sgs_highlights_annotated`,
  `sgs_things_you_can_do`, `sgs_3030_dank_cut`) not used yet. The Drive
  connector returns files as base64 and refuses anything over 10 MB; in
  practice files over about 6.5 MB also fail (the message is too large
  for the client). That brought in 17 of the 40 source files
  `encode_library.py` needs (all ANYmal D terrains, 5 of the 12 UR5e sim
  close-ups); every UR5e hardware clip and the continuous runs are too
  large. Fetching them needs `drive.google.com` and
  `drive.usercontent.google.com` allowed in the cloud environment's
  network settings and a share link, or the encoded library handed over
  some other way.
- **Full title (`/lab/title/`).** Six ways to fit "A Balanced Data Diet:
  Addressing the Exploration Bottleneck in Mega-Scale RL for Robot
  Control" on a first screen, emphasising "Exploration Bottleneck": T1–T3
  serious (two tiers, one block in two weights, split), T4–T5 poster (four
  sizes, vertical), T6 Site header. Font sizes are capped by both viewport
  width and height so each holds from phone to ultrawide.

## Needs the owner's attention

Inputs only the owner can give:

- [ ] **Remaining clips.** Delivered 2026-10-05 (see Decisions); ANYmal
      C per terrain and ANYmal D jump box on 2026-10-08 (see Start
      here). Still to come: the scaling clips. Also check: real-time speed of
      the hardware clips, task and terrain names (from folder names), the
      reel cut. Where new footage goes: add it to
      `scripts/lab/encode_library.py` and `app/lab/library.ts` and rerun
      the script. The older placeholder layout, for reference:
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
- [ ] **Round 3 choices the agents flagged:** where the Runs section
      goes (before or after Clips), Site 3's solid blue Hardware band, the
      clips picked for the Site 3 entries, Poster 3's blue Locomotion and
      red Runs grounds, and the new copy ("policies trained in simulation
      run on a physical UR5e", the Setup robot rows, Poster 3's facts).
      `/lab/swiss-3/` still has the p(1 − p) passage in its method.
- [ ] **Combined page, pending picks:** header colour
      (`/lab/header-colors/`, H1–H12); highlights placement A or B with
      controls 2 (`/lab/highlights/`), to be decided after the next
      section.
- [ ] **Pick a full-title setting** from `/lab/title/` (T1–T6), or none.
- [ ] **Method on the site:** version A or B from `/lab/method-nav/`, the
      round 2 method, or a link to the explainer.
- [x] **Affiliations** (2026-10-07, every page): University of
      Washington is 1, NVIDIA 2; Octi Zhang is at both ("1,2\*"); Ignacio
      Dagnino is at UW.
- [ ] **Paper and code links** (`LINKS` in `app/lab/content.ts`, still `#`).
- [ ] **Facts to check** (in `app/lab/content.ts` unless noted):
  - ~~The paper's softmax temperature T, N for each task, and κ and t for
    manipulation~~: settled from the paper (see Decisions, Method);
    `KERNELS` in `app/lab/_method/sgs.ts` still uses ε = 1e-8 for the
    older studies.
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
                                 BibTeX, placeholder clips and reel
    library.ts                   the owner's footage: LIBRARY, RUNS, REEL3
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
    _swiss3/ _site3/ _poster3/   round 3 pages (real footage)
    _title/                      TitleStudy, title.css (/lab/title)
    _combined/                   /lab/combined: the site assembled section
                                 by section (CombinedPage, Header, Nav);
                                 inks.ts and HeaderColors for
                                 /lab/header-colors; Reel (quiet reel) and
                                 HighlightsStudy for /lab/highlights;
                                 Opening, Overview, Summary and
                                 OpeningStudy for /lab/opening;
                                 SeriousStart for /lab/serious-start
    _nav/                        method as navigation (/lab/method-nav):
                                 nav.ts (maze, learner, sampler), draw.ts,
                                 TaskFigure, SnapshotFigure, TrainFigure
    <route>/page.tsx             one folder per study route
public/lab/media/                intro, highlights, clips, clips-sm, covers
  library/                       the owner's footage, encoded (round 3)
scripts/lab/                     review tooling (below);
                                 encode_library.py builds media/library;
                                 trim_anymal_limits.py cuts the ANYmal
                                 limit renders for it
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

### Sharing a preview (Cloudflare)

The lab pages, with the encoded footage, are published from this Mac to
https://sgs-rl-lab.mateogc.workers.dev/lab/ for the owner's teammates: a
Cloudflare Worker with static assets (account of the owner's Gmail,
workers.dev subdomain `mateogc`, set up 2026-10-07). Anyone with the link
can open it; it is not linked anywhere and the pages are `noindex`. To
publish the current state, after `npx wrangler login` once:

```sh
npm run build
cd scripts/lab/cloudflare && npx wrangler deploy
```

Run Wrangler from `scripts/lab/cloudflare/`, never the repo root: at the
root it detects the Next.js app, tries to convert it into a Cloudflare app
and edits `package.json`. `worker.js` there answers byte-range requests
for the videos: static assets alone return whole files, and Safari on
iPhone will not play a video without ranges. The footage is not in git,
so deploy from a machine that has `public/lab/media/library/` (or run
`scripts/lab/fetch_library.sh` first). A cloud session deploying needs a
Cloudflare API token in `CLOUDFLARE_API_TOKEN`.

The preview was on Netlify (sgs-rl-lab.netlify.app) until 2026-10-07,
when the free plan's monthly credits ran out after about 20 deploys and
deploys were blocked; the owner had the Netlify site deleted. Cloudflare
Pages was tried first and dropped: it also ignores byte ranges.

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

### Round 4 (owner, 2026-10-05)

- Handed over most of the footage (see Decisions, "The owner's footage").
  Still missing: one ANYmal D clip (random jump box); ANYmal C per-terrain
  clips are coming.
- Continuous one-minute runs "are very nice, and I want to show them in
  full, but they are a bit too long to be forced upon the person watching".
- UR5e sim: show the most interesting run and a nominal one next to each
  other, combined into one video. "I only want to use the static close up
  shots for now."
- Reel order: hardware first (rod clip 5, nut clip 3, gear mesh clip 1),
  then a few UR5e sim, a few Franka, a few ANYmal. Mock it for now; it will
  be polished.
- Asked to iterate on all the designs with the content populated. Built as
  `/lab/swiss-3/`, `/lab/site-3/`, `/lab/poster-3/`.

### Round 5 (owner, 2026-10-06)

- "Now I'm gonna build section by section a combined website which has
  all the parts I like." Process: the owner describes a section, it is
  built, they review and iterate, and the next section starts only after
  they approve. Built at `/lab/combined/`.
- Section 1: the title page from Site 2/3 (the header with the big SGS).
  Asked for: Ignacio's affiliation as University of Washington; the whole
  paper title, easy to copy and paste; "Guided" more centred in the G at
  the same height.
- Then: "can we try different colors for this? I think the current one is
  decent, but I'd like to explore different alternatives." Built as
  `/lab/header-colors/`.
- Next, after deferring the colour call: a Highlights section. "Having
  the video like we did was good, but we should make sure that there's no
  unnecessary details/text. The sliders that showed progress and the
  interactiveness was nice, but we should keep them as not distracting as
  possible. And I wonder if there is a way to show this either first, or
  on the same page as the title. Let's try a bunch of different
  variations." Built as `/lab/highlights/`.
- On it: "it's gonna be A or B with titles under bar, not sure which one
  yet, I think it will depend on the next section. But let's keep both,
  with the pending decision to choose, and let's proceed to the next
  part."
- Next section: "oh I really liked the colorful overview from site 3, but
  yeah I agree let's try both this and the more serious summary paragraph
  and show me both with both combos for the first page so I can compare."
  Built as `/lab/opening/`.
- Before choosing: "If I still wanted a very clean look, but have it so
  that it starts off a bit more serious, and the design starts to become
  a bit more colorful and playful as we scroll down, I am wondering if we
  can start with something that is not the SGS logo type of thing, but we
  still somehow emphasize that this is SGS, since it's not in the title.
  Then, we do highlights video, then summary, and then start having a
  colorful overview like we have now." Built as `/lab/serious-start/`.

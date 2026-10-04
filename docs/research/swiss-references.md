# Swiss references: research notes for round 2

Study of the references the owner named on 2026-10-04: Neo Neo's project
pages and site source, the NOF website Neo Neo built, and three Swiss
museum sites. Written for the agents building the next round. Every
number below was measured from source CSS, computed styles or the images
themselves; colour values from photographs are marked "photo", the rest
are exact.

Images and screenshots are local only (`previews/` is git-ignored):

```
previews/research/neoneo/<project>/   Neo Neo gallery images, 1200 px
previews/research/neoneo-site/        neoneo.ch screenshots (index, project page, hover)
previews/research/nof-2022/           NOF website as archived (2020, 2022, 2023)
previews/research/nof-live/           nof.ch today (not Neo Neo's)
previews/research/museums/            Kunsthaus, Kunstmuseum Basel, Kunstmuseum Bern
previews/research/lab/                /lab/site/ at d, w, m for comparison
```

Long full-page shots are split into `*-full-0.png`, `-1`, `-2`.

---

## 1. Neo Neo project pages

### 1.1 NOF 2021–22 (owner's favourite)

https://www.neoneo.ch/graphicdesign/nof-2/ — posters (895 × 1280 mm,
screenprinted) and season journal; `neoneo/nof-2/`.

**Posters** (`00-dragon_dor`, `01-cosi-1`, `02-don_pasquale-1`;
straightened crop `zz-don_pasquale-poster.png`):

- Three inks: paper ground, type, image. Don Pasquale: pink paper (photo
  ≈ `#f2d3d8`), red type (≈ `#e1262f`), green raster (≈ `#2f6b55`).
  Dragon d'Or: olive / yellow / black-olive. Così: silver / pink / black.
- Four type sizes, one weight (Neue Haas Grotesk Text 55): NOF ≈ 23 % of
  poster height (cap height), title ≈ 10 %, info in the O ≈ 3 %,
  credits ≈ 1.3 %. Nothing in between.
- NOF spans the measure on the bottom margin. **Words in counters:**
  "Neue Oper Freiburg" in the N's lower-left notch, last baseline on the
  letters' baseline, about half a stem width from the left stem; "Nouvel
  Opéra Fribourg" top-left in the F's upper counter, against the stem and
  under the arm; date and venue in the O, left-aligned, vertically
  centred. Each block: 3 lines at ≈ 1/10 of the NOF cap height, line-height
  ≈ 1.0. Logos fill the F's lower counter.
- The title gets one poster-wide gesture: "Pasquale" rotated 90° down the
  whole right edge; "Le Dragon / d' Or" justified to both margins; "Così
  fan tutte" on an arc.
- Raster: round dot, 45°, pitch ≈ 5–6 mm on 895 mm (≈ 160 dots across;
  `zz-don_pasquale-halftone-crop.png`). Cut-out objects or plain
  rectangles, no frames or shadows.

**Journal** (`03`–`07`, newsprint, one ink): cover = one-ink photo, then
"Saison 21/22" at ≈ 4 % of page height, then the NOF mark with words in
counters. **The intro paragraph is the table of contents**
(`04-nof_journal_6`, `07-nof_journal_7`): set very large, each production
title underlined by hand and followed by a glyph-sized raster thumbnail,
"21/22" ringed by hand. Spreads (`05`): title top-left, facts in narrow
columns, one-ink image, body in two columns, page number at lead size.

### 1.2 NOF 2019–20

https://www.neoneo.ch/graphicdesign/nof-nouvel-opera-fribourg-2/

- `01-…3577` **Laïka**: the title is set _as large as NOF_ and stacked
  above it, both filling the width; blue-on-blue raster in the top half;
  credits in 5 small columns just above the title. The model for "give
  the full title more weight".
- `02-IMG_3581` **Mélisande et Pelléas**: the pink raster is cut by mint
  gutters into 6 grid panels; title words sit on mint cells knocked out of
  it, stepping down the grid. Where NOF overprints the raster a fourth
  colour appears.
- `00-IMG_6095` Barbiere: red / mint / two-ink raster; NOF's tops overlap
  the image. The 2019 journal intro switches ink halfway (blue, then green).

### 1.3 Faire (Fondation Pavillon Sicli, 2024)

`neoneo/faire/`. Dusty pink-brown ground (photo ≈ `#c9a090`), black tool
as a hard threshold image, "Faire" in white along the bottom (≈ 15 % of
height). The "o"s of "Fondation Pavillon" are die-cut holes: counters as
windows. Web analogue: a wordmark whose counters show real footage.
Flyers put date · day · time on one baseline row in 3 columns.

### 1.4 Théâtre Public Montreuil (2022–24)

`neoneo/theatre-public-montreuil/`, 24 images.

- **Fixed frame, variable middle** (`02`, `03`, `08`–`10`, `13`): every
  poster has the same top strip (dates · author) and footer strip (TPM ·
  name · logos); only the middle changes.
- **Word cells and image cells on one grid** (`04-ecriresavie`): "Écrire /
  sa / vie" one word per cell, photos in other cells. Closest reference
  for the quilt separator. `02-austerlitz`: image cut into 4 strips.
- Programme book (`17`–`23`): info strip in 4 columns (dates, room,
  genre, times), title, lead paragraph, body, credits column with names
  indented under roles; facing page an unaltered B/W photo and a flat
  fluorescent block. A model for a meatier Setup/Method.
- Signage (`06`, `12`, `14`): a long list of P-adjectives under "Théâtre
  Public Montreuil" and a huge TPM.

### 1.5 ON catalogue (SS22) and 1.6 Act–Art

- ON (`neoneo/on-catalogue/`): numbered contents small at bottom-right of
  the cover; chapter openers with the name small top-left and the numeral
  huge top-right (navigation, not data); product spreads with a 1 px-rule
  spec table of 8 columns (`03`); full-colour, unaltered photos on a
  2-column module with lots of white (`07`–`09`).
- Act–Art (`neoneo/act-art/`): the logo as an equation, "fig.1 = fig.2 +
  fig.3 + fig.4", with a figure legend (`01`); invitation cards in one
  pastel each, thick rules framing numbered sections, artwork photo
  unaltered on its own card.

### 1.7 neoneo.ch itself (source)

WordPress theme, jQuery, Isotope, lazysizes (`master.css`,
`functions.js`).

- System Helvetica/Arial, regular only; `html` 22 px at ≥ 1200 px wide,
  18 px from 768 to 1199; line-height 1.0 in bars, 1.15–1.2 in text.
- Fixed white bar, 1 px black rule; logo takes 33 %, five sections spread
  with `space-between`. Active and hover are grey `#808080`.
- **Index** (`neoneo-site/index-d.png`, `index-hover2-d.png`): 3-column
  list (Project / Client / Year), ≈ 42 px rows between 1 px rules. On
  hover the row greys, its rule stops at 75 % and the image appears in
  the right quarter, top-aligned to the row. Phones: 2 columns. This is
  the clip-index pattern. A bottom "Categories" bar slides up into a
  filter list (250 ms).
- **Project page** (`nof2-d.png`, `nof2-m.png`): info row in 25 / 25 / 50 %
  columns, labels underlined; gallery blocks named by their 6-column
  split (`6`, `3-3`, `4-2`, `2-4`, `2-2-2`, `22-4`), gutter 0.4 rem. On
  phones the info moves below the images and images go full-bleed
  between 1 px rules. A circled × returns to the index.
- Images fade in over 250 ms (lazysizes, `expand: 800`). No max width:
  at 2560 px images crop the first screen (`nof2-w.png`).

---

## 2. The NOF website (Neo Neo, 2019–2023)

**Finding:** `nof.ch` today is a different site (Cormorant Garamond + DM
Sans, photo carousel, blue "Tickets" button; `nof-live/home-d.png`). Neo
Neo's site survives only on the Wayback Machine, snapshots from early
2019 to mid 2024 (`web.archive.org/web/20220125043218/https://www.nof.ch/`).
Same theme skeleton as neoneo.ch. Studied from archived HTML, CSS
(`themes/nof/css/master.css`) and `functions.js`; screenshots via
`if_` URLs (no Wayback toolbar).

**Type:** Neue Haas Grotesk Text Pro 55 Roman and 56 Italic only
(MyFonts web licence). Letter-spacing 0 everywhere. Italic appears only
for role names in credits.

| Element                       | Desktop (1440)            | Phone (≤ 767)               |
| ----------------------------- | ------------------------- | --------------------------- |
| `html`                        | 15 px (12 / 10 px tablet) | 15 px                       |
| Bar text                      | 22 px, bar 45 px tall     | same                        |
| Heading band (h3)             | 5vw = 72 px, lh 1.0       | 2.8rem = 42 px, lh 1.05     |
| Listing title (h2)            | 10vw = 144 px, lh 1.0     | 12.5vw                      |
| Page title                    | 5.5–6vw                   | 12.5vw                      |
| Dates, venues, menu, h3 small | 2.75vw = 39.6 px, lh 1.1  | 1.25rem = 18.75 px, lh 1.15 |
| Body                          | 1.4rem = 21 px, lh 1.15   | 0.9rem = 13.5 px, lh 1.25   |
| Credits                       | 1rem = 15 px              | 0.9rem                      |
| Side margin                   | 2rem = 30 px              | 1.25rem                     |
| Rules                         | 3 px black (2 px < 1200)  | 2 px                        |

So: two display sizes in vw, one meta size in vw, body in rem. No clamp,
no max width.

**First screen** (`nof-2022/home-d.png`, `home2020-d.png`,
`home2023-d.png`): black bar (NOF left, FR/DE, hamburger), then the NOF
wordmark as one SVG (`841.9 × 327.5`, fill `#FF7175`, words outlined
inside it) stretched to the full measure in a box `100% − 4rem` wide and
`37.25vw` tall. "Neue Oper Freiburg" bottom-left in the N, last line on
the baseline, ≈ 19 px (0.3 stem) from the stem; "Nouvel Opéra Fribourg"
in the F's upper counter, ≈ 27 px from the stem and 22 px under the arm;
word size ≈ 3.6vw ≈ 1/10 of the cap height. The O stays empty. By 2023
the mark was black and every band white.

**Squeeze on scroll** (`squeeze-150-d.png`, `squeeze-350-d.png`): the
logo is `position: fixed`; ScrollMagic tweens `scaleY` from 1 to 0 with
`transform-origin: top` over a scroll distance equal to its own height,
so it flattens like a closing blind while the content scrolls over it
(the SVG uses `preserveAspectRatio="none"`, words squash with it). A
second copy anchored at the bottom fills the gap; both fade out after
1000 px. Hidden entirely on phones: the phone page opens on the first
heading band.

**Heading bands:** white, 3 px rule top and bottom, h3 at 5vw, ≈ 14 px
padding. They are _not_ sticky on NOF; they scroll under the bar.

**Listing bands** (`home-d-full-1.png`, `home-m-bands.png`): one flat
colour per production, 2rem padding, 3 px rule between bands. Row 1:
dates left, venue right (2.75vw). Row 2: title 10vw. Row 3: composer
(2.75vw, max 60 % width) and a 5rem circled "+" (3 px stroke) bottom-right.
On phones: title first, then dates and venues stacked, then composer.
Exact colours (inline `background-color`):

- 2021–22: Così `#898c8d`, Powder Her Face `#b5a386`, Don Pasquale
  `#f6e0e2`, Opéra Dada `#edece5`, Dragon d'Or `#85754e`, Bohemien
  `#fce5f1`.
- 2019–20: Guillaume Tell `#fff042`, Laïka `#009fe3`, La Voix humaine
  `#b0b5bb`, Pelléas `#69d2c2`.
- Agenda month band `#e64944`; logo `#ff7175`.

**A band's colour is that production's poster ground** (Laïka blue,
Pelléas mint, Don Pasquale pink). The site is the poster system reduced
to one ink per item.

**Hover** (`band-hover-d.png`): a transparent animated GIF of the
production's one-ink raster fades in over the band in 100 ms, behind the
type. Disabled on touch.

**Production page** (`prod-d-full-0.png`, `prod-m.png`): the top block
takes the production colour: title 5.5vw top-left, dates/venue at 2.75vw,
credits summary in columns 7–12; the raster image (transparent, one ink)
sits on the band's ground in the left half; the description (21 px)
fills the right half. Below, on white: credits as two columns, roles in
italic, names in roman; then agenda rows (venue · date · time ·
outlined "Billetterie").

**Répertoire** (`repertoire-d.png`): rows with a thumbnail in the left
quarter and a 5.85vw title. _Acis and Galatea is a full-colour,
untreated stage photo next to rasters of the others_: NOF mixed unaltered
photos and rasters in one list without ceremony.

**Agenda** (`agenda-d.png`): season switcher with circled arrows, month
bands in red (month left, year right), rows of date · time · title ·
venue in four columns at 2.75vw.

**Menu** (`menu-open-d.png`): a black panel drops from under the bar
(`top` 250 ms, opacity 600 ms), 1 px white top rule, 8 links in 4 columns
× 2 rows at 2.75vw. Phones: full-height black panel, links at 1.4rem.

**Ultrawide** (`home-w.png`, `home-w-bands.png`): every size scales with
vw, so at 2560 × 1080 the logo is 954 px tall and fills the first screen;
"Così fan tutte" is 256 px. Copy the proportions, not the missing caps.

---

## 3. Swiss museum sites (lighter pass)

**Kunsthaus Zürich** (`museums/kunsthaus-*`): DIN Next LT Pro in four
weights; titles 70 px, weight 900, uppercase, +2.6 px tracking, centred
over full-bleed photos with a text shadow and an outlined "TO THE
EXHIBITION" button; then full-bleed colour bands (charcoal, aubergine,
slate) with content capped at 990 px, image and text alternating sides.
Useful: full-bleed bands around a capped column. Consent was set to
necessary-only through Cookiebot's API (the banner offers only "Accept").

**Kunstmuseum Basel** (`museums/basel-*`): lowercase wordmark in a black
box, four equal grey tabs (Visit, Exhibitions, Event calendar, Tickets;
2 × 2 on phones), carousels with translucent captions. Useful: the
equal-tab primary nav. Otherwise generic.

**Kunstmuseum Bern** (`bern-d.png`, `-m`, `-d-full-*`), best of the
three for the serious track. Suisse Int'l 450/500. H1 80/104 px, section
titles 40/56 px, card titles 60/60 px, lead 30/45 px, body 20/30 px;
phone: 36/40, 30/36, 20/30, 16/24. Fixed px sizes; the page centres at
large widths (text measure capped at 900 px, cards about 1824 px wide at
2560). Exhibitions as a half/half checkerboard: square photo in one half,
date small at top, title large, underlined "Read more" at the bottom,
1 px rules above and below. Events as rows between 1 px rules: date+time ·
category over title · languages/meeting point · calendar icon, with
filter chips (All / Deutsch / Français / English / Italiano; 1 px border,
selected chip filled black). Photos unaltered.

---

## 4. Synthesis

### For the playful track (Site/Poster)

1. **Wordmark with words in counters.** Follow NOF's geometry, not a
   floating caption (today's lab version floats "Success-Guided Sampling"
   at about 1/16 of the cap height in the middle of the G; `lab/site-d.png`).
   - Each word hugs a stroke: left edge about half a stem width from the
     nearest vertical stroke, top or baseline on a stroke edge.
   - Owner's variant, read as a descending diagonal: "Success" in the
     first S's upper counter, top-aligned under the top terminal;
     "Guided" in the G, top-aligned to the underside of the crossbar,
     left edge on the bar's left end; "Sampling" in the last S's lower
     counter, last baseline on the letters' baseline. Three heights,
     three stroke edges: that is the Swiss offset.
   - Words at ≈ 1/10 of the cap height (NOF), one weight, line-height
     ≈ 1.0, same ink as the letters.
   - Build it as one SVG with a fixed viewBox (letters and words
     together) so the words scale with the mark. On phones either raise
     the word ratio to ≈ 1/7 or move the words under the mark; NOF simply
     hid the big mark on phones.
   - Optional: the NOF squeeze (scaleY → 0 from the top over the mark's
     own height) as the hand-off into the black bar. Drive it with a
     scroll listener or CSS scroll-driven animation; skip it under
     `prefers-reduced-motion`.
2. **Static poster cover.** Use the Laïka structure: the full title
   ("A Balanced Data Diet: Mega-Scale RL for Robot Control") set as large
   as the SGS wordmark and stacked above it, both filling the measure;
   four sizes only (mark ≈ 23 % of height, title ≈ 10 %, counter info
   ≈ 3 %, credits ≈ 1.3 %); authors and venue in a strip of 4–5 small
   columns; one still as a one-ink raster in the open field, or none.
   Three inks. Drop everything else.
3. **Colour bands.** One flat colour per entry (task, robot or scale),
   taken from that entry's poster ground so the site and posters share
   a key; 3 px black rules between bands at ≥ 1200 px, 2 px below; dates
   and venue become facts (task · robot · count); title at the large
   size; a circled + or arrow bottom-right.
4. **Heading bands.** White, 3 px rules, title at 5vw (clamped).
   Pinning them under the bar is our addition, not NOF's; keep it only
   if it doesn't stack up with the bar on short phones.
5. **Navigation.** Black bar ≈ 45 px with 22 px type: mark left, links,
   hamburger right. Menu = black panel dropping from the bar with links
   in 4 columns at the meta size. Active and hover: grey `#808080` or an
   underline, nothing else.
6. **Clip index.** neoneo.ch's archive list: rows between 1 px rules,
   2–4 text columns (No. · clip · robot · domain); on hover the row
   greys and the clip plays unaltered in the right quarter, top-aligned
   to the row, with the row's rule stopping where the preview begins;
   on phones, two columns and tap to expand. Add Bern-style filter chips
   (robot, task) above it.
7. **Quilt separator.** Use TPM "Écrire sa vie" (words and images in
   cells of one grid) and NOF Mélisande (a raster cut into grid panels by
   gutters, words on knocked-out cells). Mixed cell sizes on the 12-column
   grid; cells start as flat ink or one-ink raster and resolve into the
   real clip as they enter the viewport. The "Index" cell spans two.
8. **Raster vs unaltered.** NOF rasterises key art and some thumbnails
   but showed real production photos untouched when they were the
   record (Répertoire). For SGS: raster only on decorative surfaces
   (cover still, separators, hover backdrops); every result clip, reel
   and comparison video stays untouched, full colour, uncropped where
   possible. Rasters are one ink on the band's ground (transparent
   background), as on NOF's production pages.
9. **Method text with inline clips.** Borrow the journal intro: a
   paragraph at lead size where each task or robot name is underlined
   and followed by a glyph-sized still or looping clip. It explains and
   indexes at once.
10. **Responsive, phone to ultrawide.** NOF's vw sizes are right
    from 768 to ~1600 px and wrong beyond. Clamp every vw size, e.g.
    `font-size: clamp(2.75rem, 10vw, 10rem)` for listing titles and
    `min(37.25vw, 100svh - 7rem)` for the mark's height, or cap the
    content at ≈ 1920 px and let bands stay full-bleed. On phones, follow
    NOF: title first, facts stacked, body at 13.5–16 px with lh 1.25,
    margins ≈ 19 px.

### For the serious track (Swiss light)

1. **Kunstmuseum Bern as the template.** One family in two weights, a
   capped text measure (≈ 900 px), large titles (60–80 px desktop,
   30–36 px phone), lead 30/45, body 20/30, 1 px rules. Px sizes with a
   centred container: stable on ultrawide without clamping tricks.
2. **Checkerboard for results and clips.** Square clip in one half,
   label top, title large, a plain text link at the bottom, alternating
   sides; collapses to stacked on phones. Fits "a grid grouped in rows by
   robot".
3. **Event-list rows for the clip collection or experiments.** Bern's
   rows (date · category/title · details · icon) map to clip · robot ·
   task · duration; chips filter by robot. A click opens Player mode.
4. **Setup and Method with more substance.** TPM programme page: an info
   strip in 4 columns (task, robot, simulator, compute; mark unknowns
   "(check)"), a lead paragraph, body text, and a narrow credits-style
   column of hyperparameters with names indented under group labels
   (N = 32,768, H = 100, κ, t, ε, T). ON's spec table (1 px rules, 6–8
   columns) for the setup table.
5. **Figures labelled like figures.** Act–Art's "fig." idiom: numbered
   figures with a small legend ("Fig. 3 Success rate against parallel
   environments"), equations set as typography.
6. **Numbers as navigation only.** ON's huge chapter numerals and the
   numbered list beside the video ("01 Pit") are fine; results figures
   stay in the plot and running text.
7. **Colour sparingly.** Kunsthaus-style full-bleed bands with a capped
   inner column can separate Method / Results / Clips, in one or two
   quiet colours; the type does the work.

---

## 5. Patterns to avoid

- Centred uppercase heavy titles over full-bleed photos, with text
  shadow and an outlined "TO THE EXHIBITION" button (Kunsthaus).
- "Welcome to …" hero sentences (Bern) and adjective lists used as
  identity (TPM's signage works for a theatre; for a paper it reads as a
  slogan).
- Photo carousels with dots and arrows, translucent caption boxes over
  photos (Basel, today's nof.ch).
- Pill buttons, coloured CTA buttons, "Tickets"-style calls to action;
  for us "Paper", "Code", "Cite" stay plain links.
- Huge numerals that carry data ("16×", "32,768") at display size.
- Pure vw sizing with no cap (NOF at 2560 px) and full-bleed images with
  no max width (neoneo.ch project pages).
- Treating result footage like poster art: halftoning, recolouring or
  cropping the clips that are the evidence.
- Serif/sans pairings, more than two weights, letter-spaced caps.
- Hover-only information with no touch equivalent (NOF's band hover and
  neoneo's index preview are both disabled or absent on phones; give a
  tap state).

---

## 6. Image index (most useful first)

| Path (under `previews/research/`)                                       | Shows                                                                 |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `nof-2022/home-d.png`                                                   | NOF site first screen: bar, mark with words in counters, heading band |
| `nof-2022/home-d-full-1.png`                                            | Listing bands, exact colours, title/meta sizes                        |
| `nof-2022/band-hover-d.png`                                             | One-ink raster appearing behind a band's type on hover                |
| `nof-2022/squeeze-350-d.png`                                            | Wordmark squeezed by scroll                                           |
| `nof-2022/prod-d-full-0.png`, `prod-m.png`                              | Production page: raster on band ground, credits                       |
| `nof-2022/repertoire-d.png`                                             | Unaltered photo next to rasters in one list                           |
| `nof-2022/home-w.png`                                                   | What uncapped vw does at 2560 px                                      |
| `neoneo/nof-2/zz-don_pasquale-poster.png`                               | Poster: words in counters, title gesture, 4 sizes                     |
| `neoneo/nof-nouvel-opera-fribourg-2/01-newIMG_3577bis2_2-1200x1500.jpg` | Laïka: title as large as the mark (cover model)                       |
| `neoneo/nof-nouvel-opera-fribourg-2/02-IMG_3581-1200x1500.jpg`          | Raster cut into grid panels, words on knock-outs                      |
| `neoneo/nof-2/04-nof_journal_6-1200x1800.jpg`                           | Running text with underlined titles and inline thumbnails             |
| `neoneo/theatre-public-montreuil/04-ecriresavie-1200x852.jpg`           | Word cells and image cells on one grid (quilt)                        |
| `neoneo-site/index-hover2-d.png`                                        | Index row hover with preview in the right quarter                     |
| `museums/bern-d-full-0.png`, `bern-d-full-1.png`                        | Serious track: checkerboard, rows, filter chips                       |
| `neoneo/on-catalogue/03-ON_4-1200x776.jpg`                              | Spec table with 1 px rules                                            |
| `neoneo/act-art/01-act_art3-1200x720.jpg`                               | "fig." labelling idiom                                                |

import type { ReactNode } from "react";
import {
  AFFILIATIONS,
  AUTHOR_LINE,
  AUTHORS,
  EQUAL,
  LINKS,
  SUBTITLE_PARTS as S,
  TITLE,
  VENUE,
} from "../content";
import HalftoneStill from "../_cover/HalftoneStill";
import Wordmark from "../_cover/Wordmark";
import "../_cover/cover.css";
import "../_poster/poster.css";
import "./title.css";

// Ways to set the full title: "A Balanced Data Diet: Addressing the
// Exploration Bottleneck in Mega-Scale RL for Robot Control". Each study is
// a whole first screen, so the title is judged with what shares it.

const STUDIES: [id: string, name: string, note: string][] = [
  [
    "t1",
    "Serious: two tiers",
    "The current title, with the subtitle as a second tier at lead size. Exploration Bottleneck in the accent colour.",
  ],
  [
    "t2",
    "Serious: one block",
    "The whole title as one paragraph at display size. The two phrases that carry it are set heavy and black, the rest light and grey.",
  ],
  [
    "t3",
    "Serious: split",
    "A Balanced Data Diet on the left; the subtitle stacked on the right, its last line on the title's baseline, Exploration Bottleneck one size up.",
  ],
  [
    "t4",
    "Poster: focus",
    "Four sizes, after the NOF posters. Exploration Bottleneck is the largest thing on the page; the rest reads around it in order.",
  ],
  [
    "t5",
    "Poster: vertical",
    "After Don Pasquale: Exploration Bottleneck runs down the right edge, the rest reads across.",
  ],
  [
    "t6",
    "Site: header",
    "The Site header with the full title under the wordmark. Exploration Bottleneck takes the wordmark's coral.",
  ],
];

function Frame({ id, children }: { id: string; children: ReactNode }) {
  const i = STUDIES.findIndex((s) => s[0] === id);
  const [, name, note] = STUDIES[i];
  return (
    <section id={id} className="tt-frame">
      <div className="tt-label pz-grid pz-small items-center">
        <span className="col-span-2 md:col-span-3">
          T{i + 1} {name}
        </span>
        <span className="col-span-4 hidden truncate md:col-span-9 md:block">
          {note}
        </span>
      </div>
      {children}
    </section>
  );
}

function Focus() {
  return <em className="tt-focus">{S.focus}</em>;
}

function SwissAuthors() {
  return (
    <div className="col-span-full md:col-span-8 lg:col-span-7">
      <p className="text-base leading-snug md:text-lg">
        {AUTHORS.map(([name, aff]) => (
          <span key={name} className="inline-block whitespace-nowrap pr-4">
            {name}
            <sup className="sw-num pl-px text-[0.6em]">{aff}</sup>
          </span>
        ))}
      </p>
      <p className="sw-label mt-2 text-sw-mute">
        {AFFILIATIONS.map((a, i) => (
          <span key={a} className="inline-block whitespace-nowrap pr-4">
            <sup>{i + 1}</sup>
            {a}
          </span>
        ))}
        <span className="inline-block whitespace-nowrap pr-4">{EQUAL}</span>
        <span className="inline-block whitespace-nowrap">{VENUE}</span>
      </p>
    </div>
  );
}

function SwissLinks() {
  return (
    <p className="col-span-full flex gap-5 text-base md:col-span-4 md:col-start-auto md:justify-end md:text-lg lg:col-span-5">
      <a href={LINKS.paper} className="sw-link">
        Paper ↗
      </a>
      <a href={LINKS.code} className="sw-link">
        Code ↗
      </a>
      <a href="#t1" className="sw-link">
        Cite ↓
      </a>
    </p>
  );
}

function SwissBar() {
  return (
    <div className="sw-grid items-baseline py-3 md:py-4">
      <span className="col-span-2 text-lg font-semibold tracking-[-0.03em] md:col-span-3">
        SGS
      </span>
      <span className="sw-label col-span-2 text-right text-sw-mute md:col-span-9">
        Success-Guided Sampling
      </span>
    </div>
  );
}

function PosterTop({ ink }: { ink: string }) {
  return (
    <div className="tt-ptop pz-small" style={{ color: ink }}>
      <span>{AUTHOR_LINE}</span>
      <span className="hidden md:inline">{VENUE}</span>
      <span className="flex gap-3">
        <a href={LINKS.paper} className="pz-u">
          Paper ↗
        </a>
        <a href={LINKS.code} className="pz-u">
          Code ↗
        </a>
      </span>
    </div>
  );
}

export default function TitleStudy() {
  return (
    <div className="pz tt">
      <header className="tt-intro pz-grid gap-y-3 pb-6 pt-4">
        <p className="pz-small col-span-6 md:col-span-3">SGS lab: full title</p>
        <h1 className="tt-intro-title col-span-6 md:col-span-9">
          {TITLE}: {S.pre} {S.focus} {S.post}
        </h1>
        <ol className="pz-small col-span-6 md:col-span-9 md:col-start-4">
          {STUDIES.map(([id, name], i) => (
            <li key={id} className="inline-block pr-4">
              <a href={`#${id}`} className="pz-u">
                T{i + 1} {name}
              </a>
            </li>
          ))}
        </ol>
      </header>

      <Frame id="t1">
        <div className="swiss tt-screen" data-theme="light">
          <SwissBar />
          <div className="sw-grid gap-y-6 pb-10">
            <h2 className="col-span-full border-t border-sw-rule pt-3">
              <span className="sw-display tt-t1-lead block">{TITLE}</span>
              <span className="tt-t1-sub block">
                {S.pre} <Focus /> {S.post}
              </span>
            </h2>
            <SwissAuthors />
            <SwissLinks />
          </div>
        </div>
      </Frame>

      <Frame id="t2">
        <div className="swiss tt-screen" data-theme="light">
          <SwissBar />
          <div className="sw-grid gap-y-8 pb-10">
            <h2 className="tt-t2 col-span-full border-t border-sw-rule pt-3">
              <b>{TITLE}:</b> {S.pre} <b>{S.focus}</b> {S.post}
            </h2>
            <SwissAuthors />
            <SwissLinks />
          </div>
        </div>
      </Frame>

      <Frame id="t3">
        <div className="swiss tt-screen" data-theme="light">
          <SwissBar />
          <div className="sw-grid gap-y-6 pb-10">
            <h2 className="col-span-full grid grid-cols-subgrid items-end gap-y-4 border-t border-sw-rule pt-3">
              <span className="sw-display tt-t3-lead col-span-full md:col-span-7">
                A Balanced
                <br />
                Data Diet:
              </span>
              <span className="tt-t3-sub col-span-full md:col-span-5">
                <span className="tt-t3-pre block">{S.pre}</span>
                <span className="tt-t3-focus block">
                  Exploration
                  <br />
                  Bottleneck
                </span>
                <span className="tt-t3-post block">
                  in Mega-Scale RL
                  <br />
                  for Robot Control
                </span>
              </span>
            </h2>
            <SwissAuthors />
            <SwissLinks />
          </div>
        </div>
      </Frame>

      <Frame id="t4">
        <div className="tt-screen tt-poster tt-p4">
          <HalftoneStill
            src="/lab/media/cover/pit-climb.jpg"
            ink="#b9a312"
            pitch={6}
            angle={15}
            focus={[0.37, 0.72]}
            place={[0.7, 0.42]}
            lo={0.12}
            hi={0.95}
            gamma={1.8}
            className="!absolute inset-0"
          />
          <div className="tt-pin">
            <PosterTop ink="#e8412b" />
            <h2 className="tt-p4-title">
              <span className="tt-s2 block">{TITLE}:</span>
              <span className="tt-s3 block">{S.pre}</span>
              <span className="tt-s1 block">
                Exploration
                <br />
                Bottleneck
              </span>
              <span className="tt-s3b block">{S.post}</span>
            </h2>
          </div>
        </div>
      </Frame>

      <Frame id="t5">
        <div className="tt-screen tt-poster tt-p5">
          <HalftoneStill
            src="/lab/media/cover/robot-cutout.jpg"
            ink="#2f7d5b"
            pitch={5}
            angle={20}
            focus={[0.5, 0.5]}
            zoom={0.72}
            lo={0.1}
            hi={0.92}
            gamma={1.5}
            className="tt-p5-raster !absolute"
          />
          <div className="tt-pin">
            <PosterTop ink="#e2231a" />
            <h2 className="tt-p5-title">
              <span className="tt-p5-lead block">
                A Balanced
                <br />
                Data Diet:
              </span>
              <span className="tt-p5-pre block">{S.pre}</span>
              <span className="tt-p5-vert" aria-hidden="false">
                <span>Exploration</span> <span>Bottleneck</span>
              </span>
              <span className="tt-p5-post block">
                in Mega-Scale RL
                <br />
                for Robot Control
              </span>
            </h2>
          </div>
        </div>
      </Frame>

      <Frame id="t6">
        <div className="tt-screen st bg-white text-black">
          <div className="px-[var(--m)] pt-2">
            <Wordmark
              variant="v6"
              color="#ff6464"
              cap="calc((100svh - 60px - 15rem) / 0.7275)"
            />
          </div>
          <div className="pz-grid gap-y-5 pb-8 pt-4">
            <h2 className="tt-p6-title col-span-6 md:col-span-8">
              {TITLE}:
              <br />
              {S.pre} <span className="tt-coral">{S.focus}</span> {S.post}
            </h2>
            <div className="pz-small col-span-6 flex flex-col gap-3 md:col-span-4 md:pt-1">
              <p>
                {AUTHORS.map(([name, aff]) => (
                  <span
                    key={name}
                    className="inline-block whitespace-nowrap pr-3"
                  >
                    {name}
                    <sup>{aff}</sup>
                  </span>
                ))}
              </p>
              <p className="text-black/60">
                {AFFILIATIONS.map((a, i) => (
                  <span key={a} className="inline-block whitespace-nowrap pr-3">
                    <sup>{i + 1}</sup>
                    {a}
                  </span>
                ))}
                <span className="inline-block whitespace-nowrap">{EQUAL}</span>
              </p>
              <p className="flex gap-4">
                <a href={LINKS.paper} className="pz-u">
                  Paper ↗
                </a>
                <a href={LINKS.code} className="pz-u">
                  Code ↗
                </a>
              </p>
            </div>
          </div>
        </div>
      </Frame>
    </div>
  );
}

import type { ReactNode } from "react";
import { CLIPS } from "../content";
import ClipGallery from "./ClipGallery";
import ClipWall from "./ClipWall";
import QuiltSeparator from "./QuiltSeparator";
import RobotGrid from "./RobotGrid";
import "../_poster/poster.css";
import "../_site/site.css";

const robots = new Set(CLIPS.map((c) => c.robot)).size;

const VARIANTS = [
  ["a", "A", "Serious: wall, grid by robot"],
  ["b", "B", "Playful: quilt, raster to real; grid in the Site style"],
  ["c", "C", "Playful: quilt, real to raster"],
] as const;

// Study label for the playful variants: a white band between rules.
function PzLabel({
  id,
  letter,
  title,
  children,
}: {
  id: string;
  letter: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-0 border-t border-black bg-white">
      <div className="pz-grid gap-y-2 pb-6 pt-2 md:pb-10">
        <p className="st-head col-span-6 md:col-span-5">
          <span className="pz-num mr-[0.3em]">{letter}</span>
          {title}
        </p>
        <div className="pz-small col-span-6 flex max-w-[56ch] flex-col gap-2 md:col-span-6 md:col-start-7 md:pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function GalleryStudy() {
  return (
    <ClipGallery skin="swiss">
      <div className="swiss" data-theme="light">
        <header
          id="top"
          className="sw-grid sw-label items-baseline py-3 md:py-4"
        >
          <a href="/lab/" className="col-span-2 md:col-span-3">
            <span className="text-lg font-semibold tracking-[-0.03em]">
              SGS
            </span>
            <span className="text-sw-mute"> lab</span>
          </a>
          <nav className="col-span-2 flex justify-end gap-5 md:col-span-9">
            {VARIANTS.map(([id, letter]) => (
              <a key={id} href={`#${id}`} className="sw-link">
                {letter}
              </a>
            ))}
            <a href="/lab/clips/" className="sw-link">
              Earlier layouts
            </a>
          </nav>
        </header>

        <div className="sw-grid gap-y-6 pb-16 pt-4 md:pb-24 md:pt-8">
          <div className="col-span-full h-px bg-sw-rule" />
          <h1 className="sw-display col-span-full pt-1 text-[17vw] md:col-span-7 md:text-[min(9vw,9rem)]">
            Gallery
          </h1>
          <p className="sw-label sw-num col-span-full self-end text-sw-mute md:col-span-5 md:text-right">
            {CLIPS.length} clips · {robots} robots · placeholders cut from the
            current videos
          </p>
          <div className="col-span-full flex max-w-[62ch] flex-col gap-3 md:col-span-6">
            <p>
              One clip collection in two skins. Every clip on screen plays,
              muted. Selecting any clip opens the player: the clip large and
              unaltered, beside a numbered list of every clip grouped by robot.
              It advances on its own; ← and → step through, Esc or the
              browser&apos;s Back button closes it. The address carries the clip
              number (for example{" "}
              <a href="#clip-007" className="sw-link">
                #clip-007
              </a>
              ), so a single clip can be linked.
            </p>
          </div>
          <ol className="sw-label col-span-full md:col-span-5 md:col-start-8">
            {VARIANTS.map(([id, letter, name]) => (
              <li key={id} className="border-t border-sw-hair py-2">
                <a href={`#${id}`} className="grid grid-cols-[2rem_1fr]">
                  <span className="sw-num text-sw-mute">{letter}</span>
                  <span className="sw-link justify-self-start">{name}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <section id="a" className="pb-24 md:pb-36">
          <div className="sw-grid gap-y-3 pb-8 md:pb-12">
            <div className="col-span-full h-[3px] bg-sw-rule" />
            <p className="sw-label sw-num col-span-1 pt-2 md:col-span-1">A</p>
            <h2 className="sw-label col-span-3 pt-2 font-medium md:col-span-2">
              Serious skin
            </h2>
            <div className="sw-label col-span-full flex max-w-[62ch] flex-col gap-2 text-sw-mute md:col-span-6 md:col-start-7 md:pt-2">
              <p>
                The wall closes the Results section: a short band of clips edge
                to edge, without captions, two rows on larger screens and three
                on phones. It never leaves a gap; with 40 or more clips it shows
                an excerpt that cycles through the robots rather than the whole
                collection.
              </p>
              <p>
                Below it, the collection as a grid with one block per robot.
                Columns follow the page grid: 2 on phones, 3 on iPad portrait, 4
                on laptops, 6 on ultrawide screens.
              </p>
            </div>
          </div>

          <ClipWall allHref="#a-clips" />

          <div id="a-clips" className="sw-grid gap-y-3 pt-20 md:pt-28">
            <div className="col-span-full h-px bg-sw-rule" />
            <p className="sw-label sw-num col-span-1 pt-3">06</p>
            <h2 className="sw-label col-span-3 pt-3 font-medium md:col-span-2">
              Clips
            </h2>
            <p className="sw-label col-span-full text-sw-mute md:col-span-6 md:col-start-7 md:pt-3">
              Every clip in the collection, by robot. Hardware clips are sped up
              and say so.
            </p>
          </div>
          <div className="px-4 pt-10 md:px-10 md:pt-14">
            <RobotGrid />
          </div>
        </section>
      </div>

      <div className="pz st">
        <PzLabel id="b" letter="B" title="Playful skin">
          <p>
            The quilt separates two sections, after the NOF posters: an Index
            cell two squares wide, a white cell per robot, flat colour cells and
            clips, some two squares wide. Clips start as black rasters on flat
            colour and turn into the real footage one by one as the band moves
            up the screen. Scrolling back turns them back.
          </p>
          <p>
            Below it, the same grid by robot in the Site style: white, black
            rules, one weight. The player shows every clip unaltered.
          </p>
        </PzLabel>

        <QuiltSeparator direction="toReal" />

        <h2 className="st-head border-y border-black bg-white px-[var(--m)]">
          Clips
        </h2>
        <div className="bg-white px-[var(--m)] pb-24 pt-8 md:pb-36 md:pt-10">
          <RobotGrid skin="pz" />
        </div>

        <PzLabel id="c" letter="C" title="Quilt, reversed">
          <p>
            The same quilt in the other direction: clips enter as the real
            footage and turn into rasters as the band moves up the screen.
          </p>
        </PzLabel>

        <QuiltSeparator direction="toRaster" />

        <div className="flex min-h-[70svh] flex-col justify-between border-t border-black bg-white">
          <p className="st-head px-[var(--m)]">End of the study</p>
          <p className="pz-small flex gap-4 px-[var(--m)] pb-4">
            <a href="#top" className="st-link">
              Top ↑
            </a>
            <a href="/lab/" className="st-link">
              Lab
            </a>
          </p>
        </div>
      </div>
    </ClipGallery>
  );
}

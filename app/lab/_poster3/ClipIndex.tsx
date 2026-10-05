"use client";

import { RUNS, type Item } from "../library";
import { useGallery } from "./Gallery";
import { groupBySetting, mss, plural, secs } from "./data";

const settingWord = (d: Item["domain"]) =>
  d === "Real" ? "hardware" : "simulation";

function Head({ left, right }: { left: string; right: string }) {
  return (
    <p className="pz-small flex justify-between gap-4 border-t border-black px-1 py-1">
      <span>{left}</span>
      <span className="pz-num">{right}</span>
    </p>
  );
}

// Every clip as one typographic list, by robot and setting (two columns
// from 1024 px): number, clip, length, speed. A row opens the player; the
// continuous runs at the end jump to their poster instead, since they are
// never played on their own.
export default function ClipIndex() {
  const g = useGallery();
  const groups = groupBySetting(g.clips);
  return (
    <div className="p3-list lg:columns-2 lg:gap-x-[var(--g)]">
      {groups.map((s) => (
        <section
          key={s.key}
          aria-label={`${s.robot}, ${settingWord(s.domain)}`}
          className="mb-8 break-inside-avoid"
        >
          <Head
            left={`${s.robot}, ${settingWord(s.domain)}`}
            right={plural(s.clips.length, "clip")}
          />
          <ol>
            {s.clips.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="p3-index-row"
                  onClick={(e) => g.open(c, e.currentTarget)}
                >
                  <span className="pz-num">{g.num(c)}</span>
                  <span className="min-w-0">
                    {c.title}
                    {c.kind === "pair" && ", two runs"}
                  </span>
                  <span className="pz-num text-right">{secs(c.duration)}</span>
                  <span className="pz-num text-right">{c.speed}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <section aria-label="Continuous runs" className="mb-8 break-inside-avoid">
        <Head left="Continuous runs" right={plural(RUNS.length, "run")} />
        <ol>
          {RUNS.map((r, i) => (
            <li key={r.id}>
              <a href={`#${r.id}`} className="p3-index-row">
                <span className="pz-num">R{i + 1}</span>
                <span className="min-w-0">
                  {r.robot}, {r.title.toLowerCase()}
                </span>
                <span className="pz-num text-right">{mss(r.duration)}</span>
                <span className="pz-num text-right">{r.speed}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

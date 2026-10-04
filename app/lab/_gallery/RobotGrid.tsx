"use client";

import type { Clip } from "../content";
import { useClipGallery } from "./ClipGallery";
import {
  describeGroup,
  domainWord,
  groupByRobot,
  plural,
  smallSrc,
  type Skin,
} from "./data";
import TileVideo from "./TileVideo";

const SK = {
  swiss: {
    root: "gal-skin-swiss",
    small: "sw-label",
    num: "sw-num",
    name: "text-3xl font-semibold leading-none tracking-[-0.035em] md:text-4xl",
    cap: "sw-label",
    title: "font-medium",
    meta: "gal-mute",
    link: "sw-link",
  },
  pz: {
    root: "gal-skin-pz",
    small: "pz-small",
    num: "pz-num",
    name: "gal-pz-entry",
    cap: "gal-pz-row",
    title: "",
    meta: "pz-small pt-0.5",
    link: "underline decoration-1 underline-offset-[0.18em] hover:decoration-2",
  },
} as const;

// Every clip, one block per robot. Tiles wrap (2 columns on phones, 3 on
// iPad portrait, 4 on laptops, 6 on ultrawide); the columns line up with
// the page grid when the grid fills the page's content width. All tiles on
// screen play; a click opens the player.
export default function RobotGrid({
  clips,
  skin,
  notes = {},
  className = "",
}: {
  // Defaults to the gallery's whole collection.
  clips?: Clip[];
  skin?: Skin;
  // Line beside each robot's name, by robot; defaults to the clips'
  // categories and domains ("Locomotion · Simulation").
  notes?: Record<string, string>;
  className?: string;
}) {
  const g = useClipGallery();
  const s = skin ?? g.skin;
  const k = SK[s];
  const groups = clips ? groupByRobot(clips) : g.groups;

  return (
    <div className={`gal gal-grid ${k.root} ${className}`}>
      {groups.map((group) => (
        <section
          key={group.robot}
          aria-label={group.robot}
          className="gal-group"
        >
          <header className="gal-group-head">
            <h3 className={`gal-group-name ${k.name}`}>{group.robot}</h3>
            <p className={`gal-group-desc ${k.small} gal-mute`}>
              {notes[group.robot] ?? describeGroup(group)}
            </p>
            <p className={`gal-group-count ${k.small} ${k.num}`}>
              <span className="gal-mute">
                {plural(group.clips.length, "clip")}
              </span>
              <button
                type="button"
                className={`ml-3 ${k.link}`}
                onClick={(e) =>
                  g.open(group.clips[0], { skin: s, trigger: e.currentTarget })
                }
              >
                Play
              </button>
            </p>
          </header>
          <ul className="gal-tiles">
            {group.clips.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  data-gal-clip={c.id}
                  data-gal-primary=""
                  onClick={(e) =>
                    g.open(c, { skin: s, trigger: e.currentTarget })
                  }
                  className="gal-tile group"
                >
                  <span className="gal-frame">
                    <TileVideo
                      src={smallSrc(c)}
                      poster={c.poster}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </span>
                  <span className={`gal-cap ${k.cap}`}>
                    <span className={`${k.num} gal-mute`}>{g.num(c)}</span>
                    <span className="min-w-0">
                      <span className={`gal-cap-title block ${k.title}`}>
                        {c.title}
                      </span>
                      <span className={`block ${k.meta}`}>
                        {domainWord(c)} · {c.speed}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

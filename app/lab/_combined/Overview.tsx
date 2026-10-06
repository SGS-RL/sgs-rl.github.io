import fs from "node:fs";
import path from "node:path";
import type { CSSProperties, ReactNode } from "react";
import { LIBRARY, RUNS, STANDIN_CLIPS, type Item } from "../library";
import { Row } from "../_site3/Media";
import { byId, groupItems } from "../_site3/items";
import type { Band } from "../_site3/Runs";
import "../_site3/site3.css";

// The Overview of /lab/site-3: one listing entry per kind of footage, as
// the productions on the NOF website: a band of flat colour, three columns
// of text (name, the facts, a plain description and links) and the clips
// under them, as recorded. Copied from Site3Page with its text; its clip
// rows (Row) and the player they open (Gallery) are imported unchanged
// from ../_site3. The links point at sections the combined page does not
// have yet.
//
// Clips a cloud session could not build fall back at build time: single
// UR5e simulation runs stand in for the pairs; the hardware frames stay
// empty.

const LOCO: Band = { ground: "#f6ee1f", type: "#111" };
const MANIP: Band = { ground: "#f5a3b7", type: "#111" };
const REAL: Band = { ground: "#1f61d6", type: "#fff" };
const SCALE: Band = { ground: "#a3e4d7", type: "#111" };

const built = (c: Item) =>
  fs.existsSync(path.join(process.cwd(), "public", c.src));
const clip = (id: string) => byId(LIBRARY, id);
const stand = (id: string) => byId(STANDIN_CLIPS, `standin-ur5e-sim-${id}`);
// The real clips when all of them are built, otherwise the stand-ins.
const pick = (ids: string[], standins: Item[]) => {
  const real = ids.map(clip);
  return real.every(built) ? real : standins;
};

const groups = groupItems(LIBRARY);
const group = (robot: string, domain: string) =>
  groups.find((g) => g.robot === robot && g.domain === domain)!;
const ANYMAL_D = group("ANYmal D", "Simulation");
const UR5E_REAL = group("UR5e", "Hardware");
const UR5E_SIM = group("UR5e", "Simulation");
const sim = LIBRARY.filter(
  (c) => c.category === "Manipulation" && c.domain === "Sim",
).length;
const run = (robot: string) => RUNS.find((r) => r.robot === robot)!;

const LOCO_ROW = ["stairs", "balancing-beam", "radiating-beam"].map((t) =>
  clip(`anymal-d-${t}`),
);
const MANIP_ROWS = [
  pick(
    ["ur5e-sim-rod", "ur5e-sim-bnc"],
    [stand("rod"), stand("nut"), stand("gear-mesh")],
  ),
  pick(
    ["ur5e-sim-gear-mesh", "franka-sim-nut-2", "franka-sim-nut-1"],
    [stand("waterproof"), stand("rectangular-peg")],
  ),
];
const REAL_ROW = [
  "ur5e-real-rod-1",
  "ur5e-real-nut-1",
  "ur5e-real-gear-mesh-4",
].map(clip);
const STANDING_IN = !MANIP_ROWS[0].every((c) => LIBRARY.includes(c));
const REAL_BUILT = REAL_ROW.every(built);

// Frames for clips that were not built here: the row's layout, no media.
function MissingRow({ clips }: { clips: Item[] }) {
  return (
    <div className="s3-row">
      {clips.map((c, i) => (
        <div
          key={c.id}
          className="s3-tile"
          data-kind={c.kind}
          data-lead={i === 0 ? "" : undefined}
          style={{ "--a": String(c.aspect) } as CSSProperties}
        >
          <span className="s3-frame" />
          <span className="pz-small mt-1.5 block">
            {c.title} <span className="opacity-60">(not available here)</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// Every clip the entries show, for the player.
export const OVERVIEW_CLIPS: Item[] = [
  ...LOCO_ROW,
  ...MANIP_ROWS.flat(),
  ...(REAL_BUILT ? REAL_ROW : []),
];

// One listing entry: colour band, name, facts, text and links, clips.
function Entry({
  band,
  title,
  facts,
  text,
  links,
  children,
}: {
  band: Band;
  title: string;
  facts: ReactNode;
  text: ReactNode;
  links?: [string, string][];
  children?: ReactNode;
}) {
  return (
    <article
      className="s3-entry border-t border-black"
      style={{ background: band.ground, color: band.type }}
    >
      <div className="pz-grid gap-y-2 pb-5 pt-1.5">
        <h3 className="st-entry col-span-6 md:col-span-4">{title}</h3>
        <p className="st-entry col-span-6 md:col-span-4">{facts}</p>
        <div className="pz-small col-span-6 flex max-w-[46ch] flex-col gap-2 md:col-span-4">
          <p>{text}</p>
          {links && (
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              {links.map(([href, label]) => (
                <a key={href} href={href} className="st-link">
                  {label}
                </a>
              ))}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex flex-col gap-y-4 px-[var(--m)] pb-[var(--m)] md:gap-y-5">
          {children}
        </div>
      )}
    </article>
  );
}

// The heading band pins under the page's sticky bar (top: the bar's
// height); a study page without a sticky bar passes "top-0".
export default function Overview({
  id = "overview",
  stick = "top-[var(--bar)]",
}: {
  id?: string;
  stick?: string;
}) {
  return (
    <section id={id} className="s3 scroll-mt-[var(--bar)]">
      <h2
        className={`st-head sticky ${stick} z-40 border-y border-black bg-white px-[var(--m)] text-black`}
      >
        Overview
      </h2>
      <Entry
        band={LOCO}
        title="Locomotion"
        facts="ANYmal D and ANYmal C over rough terrain, in simulation"
        text={
          <>
            The policy walks the robot to a goal, the yellow marker, over
            terrain it sees as a heightmap. It is an MLP trained with a sparse
            success reward and generic regularizers: no demonstrations, no
            distillation. ANYmal D is shown on twelve terrains, one clip each;
            ANYmal C in one continuous minute.
          </>
        }
        links={[
          [`#${ANYMAL_D.id}`, `All ${ANYMAL_D.clips.length} ANYmal D clips ↓`],
          [`#${run("ANYmal C").id}`, "ANYmal C, the full minute ↓"],
        ]}
      >
        <Row lead clips={LOCO_ROW} />
      </Entry>
      <Entry
        band={MANIP}
        title="Manipulation"
        facts="UR5e and Franka on an assembly task board, in simulation"
        text={
          <>
            Contact-rich insertion on a task board modelled on the NIST assembly
            task board, trained with the same recipe and no demonstrations.
            UR5e: rod, nut, gear mesh, BNC connector, waterproof connector and
            rectangular peg. Franka: nut. Each UR5e clip shows two runs of one
            task side by side, the most interesting on the left and a nominal
            one on the right.
            {STANDING_IN && (
              <>
                {" "}
                <span className="opacity-60">
                  (Here, single runs stand in for the pairs.)
                </span>
              </>
            )}
          </>
        }
        links={[
          [`#${UR5E_SIM.id}`, `All ${sim} clips in simulation ↓`],
          [`#${run("Franka").id}`, "Franka, a 30 s run ↓"],
        ]}
      >
        {MANIP_ROWS.map((clips, i) => (
          <Row key={i} withRobot lead={STANDING_IN && i === 0} clips={clips} />
        ))}
      </Entry>
      <Entry
        band={REAL}
        title="Hardware"
        facts="UR5e on a physical task board: rod, nut and gear mesh"
        text={
          <>
            Policies trained in simulation, run on a UR5e arm and a physical
            board. The clips play as recorded, at 1×.
          </>
        }
        links={[
          [
            `#${UR5E_REAL.id}`,
            `All ${UR5E_REAL.clips.length} hardware clips ↓`,
          ],
          [`#${run("UR5e").id}`, "Gear mesh, a one-minute run ↓"],
        ]}
      >
        {REAL_BUILT ? (
          <Row lead clips={REAL_ROW} />
        ) : (
          <MissingRow clips={REAL_ROW} />
        )}
      </Entry>
      <Entry
        band={SCALE}
        title="Scaling"
        facts="Past one million parallel environments"
        text={
          <>
            With 1M parallel environments SGS reaches a success rate of 0.72 in
            locomotion and 0.62 in manipulation. The best baseline at that scale
            reaches 0.60 and 0.08. Prior work stopped near 64K environments.
          </>
        }
        links={[["#results", "Results ↓"]]}
      />
    </section>
  );
}

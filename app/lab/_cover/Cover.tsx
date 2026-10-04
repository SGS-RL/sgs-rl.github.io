import type { CSSProperties, ReactNode } from "react";
import { LINKS, AUTHOR_LINE, VENUE } from "../content";
import HalftoneStill from "./HalftoneStill";
import Wordmark from "./Wordmark";
import "./cover.css";

export type CoverVariant = "c1" | "c2" | "c3" | "c4" | "c5";

// Static stills, cut from the original 1920x1080 locomotion run.
export const STILLS = {
  // 1.3 s: the robot climbs out of the first pit, goal marker behind it.
  pit: { src: "/lab/media/cover/pit-climb.jpg", robot: [0.37, 0.72] },
  // 29.1 s: the robot climbs a block beside the goal marker.
  goal: { src: "/lab/media/cover/goal-climb.jpg", robot: [0.4, 0.62] },
  // 1.7 s: the robot at the pit edge, facing the camera, goal behind.
  edge: { src: "/lab/media/cover/pit-edge.jpg", robot: [0.37, 0.72] },
  // The robot from the pit frame, cut out onto white.
  cutout: { src: "/lab/media/cover/robot-cutout.jpg", robot: [0.5, 0.5] },
} as const satisfies Record<string, { src: string; robot: [number, number] }>;

type Inks = { ground: string; type: string; raster: string };

export const COVERS: Record<
  CoverVariant,
  { label: string; note: string; inks: Inks }
> = {
  c1: {
    label: "Close to the current cover",
    note: "The current first poster without the video and the running captions. The subtitle joins the title, the SGS carries Success-Guided Sampling, links move to the top line.",
    inks: { ground: "#f3e21d", type: "#e8412b", raster: "#b9a312" },
  },
  c2: {
    label: "Journal",
    note: "After the NOF season journal: the whole title set as one large paragraph in two inks on paper, small rastered stills inline, SGS at the foot.",
    inks: { ground: "#f4f2ee", type: "#1e7fd0", raster: "#109a55" },
  },
  c3: {
    label: "Split",
    note: "After the Laïka poster, in reverse: a light raster above, flat dark ground below, the full title in one size stacked with the SGS. Line breaks change with the screen shape; on landscape screens title and SGS sit side by side.",
    inks: { ground: "#2b36a6", type: "#ff6a55", raster: "#55bbef" },
  },
  c4: {
    label: "Panels",
    note: "After the Mélisande poster: the raster cut into panels by the grid, the title words in boxes of ground colour that keep clear of the robot, SGS below.",
    inks: { ground: "#a3e4d7", type: "#1d5ccf", raster: "#ef5a9d" },
  },
  c5: {
    label: "Object",
    note: "After the Don Pasquale poster: the robot cut out as a single object, the title across the top and down the right edge, SGS below.",
    inks: { ground: "#f6c9d0", type: "#e2231a", raster: "#1f4f4f" },
  },
};

const inkVars = (i: Inks) =>
  ({
    "--ground": i.ground,
    "--type": i.type,
    "--raster": i.raster,
  }) as CSSProperties;

function Links({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-4 ${className}`}>
      <a href={LINKS.paper} className="cv-link">
        Paper ↗
      </a>
      <a href={LINKS.code} className="cv-link">
        Code ↗
      </a>
    </span>
  );
}

// C1: the current cover, still and with less text.
function CoverClose({ inks }: { inks: Inks }) {
  return (
    <>
      {/* The raster box differs per screen shape (see cover.css) so the
          robot lands in the gap between the title and the SGS. */}
      <HalftoneStill
        src={STILLS.pit.src}
        ink={inks.raster}
        pitch={6}
        angle={15}
        focus={STILLS.pit.robot}
        lo={0.12}
        hi={0.95}
        gamma={1.8}
        className="cv-c1-raster cv-c1-raster-p !absolute"
      />
      <HalftoneStill
        src={STILLS.pit.src}
        ink={inks.raster}
        pitch={6}
        angle={15}
        focus={[0.3, 0.68]}
        zoom={1.15}
        lo={0.12}
        hi={0.95}
        gamma={1.8}
        className="cv-c1-raster cv-c1-raster-l !absolute"
      />
      <div className="cv-c1-top pz-grid pz-small relative">
        <p className="col-span-4 md:col-span-6">{AUTHOR_LINE}</p>
        <p className="hidden md:col-span-3 md:block">{VENUE}</p>
        <p className="col-span-2 text-right md:col-span-3">
          <Links />
        </p>
      </div>
      <h1 className="cv-c1-title pz-overprint relative px-[var(--m)]">
        <span className="cv-c1-big block">
          A<br />
          Balanced
          <br />
          Data
          <br />
          Diet:
        </span>
        <span className="cv-c1-sub block">
          Mega-Scale RL
          <br />
          for Robot Control
        </span>
      </h1>
      <div className="cv-c1-mark pz-overprint">
        <Wordmark variant="v1" measure="var(--mk)" />
      </div>
    </>
  );
}

// C2: the title as one paragraph, as on the NOF journal's front page.
function Thumb({
  src,
  focus,
  ink,
  zoom = 1,
}: {
  src: string;
  focus: readonly [number, number];
  ink: string;
  zoom?: number;
}) {
  return (
    <HalftoneStill
      src={src}
      ink={ink}
      pitch={3.5}
      angle={15}
      focus={[focus[0], focus[1]]}
      zoom={zoom}
      lo={0.1}
      hi={0.97}
      gamma={1.3}
      className="cv-c2-thumb"
    />
  );
}

function CoverJournal({ inks }: { inks: Inks }) {
  return (
    <div className="cv-c2-page">
      <h1 className="cv-c2-text">
        <span style={{ color: inks.type }}>
          A Balanced Data Diet:{" "}
          <Thumb
            src={STILLS.goal.src}
            focus={STILLS.goal.robot}
            ink={inks.type}
            zoom={1.6}
          />{" "}
        </span>
        <span style={{ color: inks.raster }}>
          Mega-Scale RL for Robot{" "}
          <Thumb
            src={STILLS.pit.src}
            focus={STILLS.pit.robot}
            ink={inks.raster}
            zoom={2.2}
          />{" "}
          Control
        </span>
      </h1>
      <div className="cv-c2-foot">
        <p className="cv-c2-meta pz-small">
          <span>{AUTHOR_LINE}</span>
          <Links />
        </p>
        <div className="cv-c2-mark" style={{ color: inks.raster }}>
          <Wordmark variant="v3" measure="var(--mk)" />
        </div>
      </div>
    </div>
  );
}

// C3: raster above, flat ground and the title below.
function CoverSplit({ inks }: { inks: Inks }) {
  return (
    <div className="cv-c3-page">
      <HalftoneStill
        src={STILLS.edge.src}
        ink={inks.raster}
        pitch={5}
        angle={15}
        focus={[0.42, 0.66]}
        invert
        lo={0.04}
        hi={0.8}
        gamma={1.25}
        className="cv-c3-raster"
      />
      <div className="cv-c3-row pz-grid pz-small">
        <p className="col-span-3 md:col-span-3">
          Success-Guided Sampling (SGS)
        </p>
        <p className="hidden md:col-span-6 md:block">{AUTHOR_LINE}</p>
        <p className="col-span-3 text-right md:col-span-3">
          <Links />
        </p>
      </div>
      <div className="cv-c3-base">
        {/* One size for the whole title; the line breaks change with the
            screen shape (4, 3 or 2 lines) so it always fills its measure. */}
        <h1 className="cv-c3-title">
          A Balanced <br className="cv-br cv-br-4" />
          Data Diet:
          <br />
          Mega-Scale RL <br className="cv-br cv-br-4 cv-br-3" />
          for Robot Control
        </h1>
        <div className="cv-c3-mark">
          <Wordmark variant="v6" measure="var(--mk)" />
        </div>
      </div>
    </div>
  );
}

// C4: raster in panels, title words in boxes of ground colour.
function CoverPanels({ inks }: { inks: Inks }) {
  return (
    <>
      <div className="cv-c4-image">
        <HalftoneStill
          src={STILLS.pit.src}
          ink={inks.raster}
          pitch={4}
          angle={15}
          focus={[0.4, 0.66]}
          lo={0.12}
          hi={0.96}
          gamma={1.5}
          className="cv-c4-raster-p !absolute inset-0"
        />
        <HalftoneStill
          src={STILLS.pit.src}
          ink={inks.raster}
          pitch={4.5}
          angle={15}
          focus={[0.3, 0.68]}
          lo={0.12}
          hi={0.96}
          gamma={1.5}
          className="cv-c4-raster-l !absolute inset-0"
        />
        <span className="cv-c4-gv" />
        <span className="cv-c4-gh" />
        <h1 className="cv-c4-title">
          <span className="cv-c4-w cv-c4-w1">A Balanced</span>{" "}
          <span className="cv-c4-w cv-c4-w2">Data Diet:</span>{" "}
          <span className="cv-c4-w cv-c4-w3">Mega-Scale RL</span>{" "}
          <span className="cv-c4-w cv-c4-w4">for Robot Control</span>
        </h1>
      </div>
      <div className="cv-c4-foot">
        <p className="cv-c4-meta pz-small">
          <span>{AUTHOR_LINE}</span>
          <Links />
        </p>
        <div className="cv-c4-mark">
          <Wordmark variant="v4" measure="var(--mk)" />
        </div>
      </div>
    </>
  );
}

// C5: one object on a flat ground.
function CoverObject({ inks }: { inks: Inks }) {
  return (
    <div className="cv-c5-page">
      <div className="cv-c5-top">
        <HalftoneStill
          src={STILLS.cutout.src}
          ink={inks.raster}
          pitch={4}
          angle={15}
          focus={[0.5, 0.5]}
          lo={0.06}
          hi={0.985}
          gamma={2}
          className="cv-c5-object !absolute"
        />
        <h1 className="cv-c5-title">
          <span className="cv-c5-big">
            A Balanced
            <br />
            Data Diet:
          </span>
          <span className="cv-c5-side">Mega-Scale RL for Robot Control</span>
        </h1>
      </div>
      <div className="cv-c5-foot">
        <p className="cv-c5-meta pz-small">
          <span>{AUTHOR_LINE}</span>
          <span>{VENUE}</span>
          <Links />
        </p>
        <div className="cv-c5-mark">
          <Wordmark variant="v3" measure="var(--mk)" />
        </div>
      </div>
    </div>
  );
}

const BODY: Record<CoverVariant, (p: { inks: Inks }) => ReactNode> = {
  c1: CoverClose,
  c2: CoverJournal,
  c3: CoverSplit,
  c4: CoverPanels,
  c5: CoverObject,
};

// A full first screen: fills the viewport below the black bar (--bar).
// Each variant recomposes by the cover's own aspect ratio (container
// queries), not by scaling one layout.
export default function Cover({
  variant = "c1",
  id,
  className = "",
}: {
  variant?: CoverVariant;
  id?: string;
  className?: string;
}) {
  const c = COVERS[variant];
  const Body = BODY[variant];
  return (
    <section
      id={id}
      className={`cv-cover cv-${variant} pz-poster ${className}`}
      style={inkVars(c.inks)}
    >
      <Body inks={c.inks} />
    </section>
  );
}

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { geistMono, plexMono } from "./algoFonts";
import { AlgorithmPair, PPO, SGS, type Line } from "./MoreSections";

// Ways to set "01 The change to PPO" (owner, 2026-10-07: "the PPO block
// looks a bit dull. What can we do to make it prettier? maybe a different
// font?"), compared on /lab/ppo-styles/. Same pseudocode in each.
//   a  as now: system monospace, two columns, tinted changed lines
//   b  typeset like a paper's algorithm: the page's face, numbered lines,
//      keywords bold, changes in red with a gutter mark
//   c  JetBrains Mono, numbered, keywords bold, a solid red bar on changes
//   d  one block, as a diff: the uniform reset struck out, SGS's lines in
//      red (IBM Plex Mono)
//   e  Geist Mono on a light panel, changes in red, no tint
//   f  no code: the loop as a row of steps, SGS's steps in red

export type AlgoStyle = "a" | "b" | "c" | "d" | "e" | "f";

const indent = (t: string) => (t.length - t.trimStart().length) / 4;

// Bold the control words at the start of a line.
function Keyed({ text }: { text: string }) {
  const m = /^(for each|if|initialize|update|reset|record|fix|step)\b/.exec(
    text,
  );
  if (!m) return <>{text}</>;
  return (
    <>
      <strong>{m[1]}</strong>
      {text.slice(m[1].length)}
    </>
  );
}

function Numbered({
  title,
  lines,
  className,
  font,
}: {
  title: string;
  lines: Line[];
  className: string;
  font?: string;
}) {
  let n = 0;
  return (
    <figure className={`al ${className} ${font ?? ""}`}>
      <figcaption className="al-title">{title}</figcaption>
      <ol className="al-code">
        {lines.map(([t, m], i) => {
          const blank = !t.trim();
          if (!blank) n++;
          return (
            <li
              key={i}
              className="al-line"
              data-mark={m}
              data-blank={blank ? "" : undefined}
              style={{ "--i": indent(t) } as CSSProperties}
            >
              <span className="al-n">{blank ? "" : n}</span>
              <span className="al-t">
                <Keyed text={t.trim()} />
              </span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

function Pair({ className, font }: { className: string; font?: string }) {
  return (
    <div className="al-pair">
      <Numbered title="PPO" lines={PPO} className={className} font={font} />
      <Numbered
        title="PPO with SGS"
        lines={SGS}
        className={className}
        font={font}
      />
    </div>
  );
}

// D: one block. PPO's line that SGS changes is struck out, SGS's added and
// changed lines follow in red.
function Diff() {
  const rows: [string, "keep" | "del" | "add"][] = [];
  SGS.forEach(([t, m]) => {
    if (m === "~") {
      const old = PPO.find(([p]) => p.includes("drawn uniformly"))!;
      rows.push([old[0], "del"]);
      rows.push([t, "add"]);
    } else rows.push([t, m ? "add" : "keep"]);
  });
  return (
    <figure className={`al al-d ${plexMono.variable}`}>
      <figcaption className="al-title">PPO, with what SGS changes</figcaption>
      <ol className="al-code">
        {rows.map(([t, k], i) => (
          <li
            key={i}
            className="al-line"
            data-k={k}
            style={{ "--i": indent(t) } as CSSProperties}
          >
            <span className="al-n">
              {k === "add" ? "+" : k === "del" ? "−" : ""}
            </span>
            <span className="al-t">
              <Keyed text={t.trim()} />
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

// F: the loop as steps.
function Steps({ steps }: { steps: [string, boolean][] }) {
  return (
    <ol className="al-steps">
      {steps.map(([s, sgs], i) => (
        <li key={i} className="al-step" data-sgs={sgs ? "" : undefined}>
          {s}
        </li>
      ))}
    </ol>
  );
}

function Flow() {
  return (
    <div className="al-flow">
      <div>
        <p className="al-title">PPO</p>
        <Steps
          steps={[
            ["Reset to a task configuration drawn uniformly", false],
            ["Roll out π", false],
            ["Update π with PPO", false],
          ]}
        />
      </div>
      <div>
        <p className="al-title">PPO with SGS</p>
        <Steps
          steps={[
            ["Reset to a task configuration drawn by success rate", true],
            ["Roll out π", false],
            ["Record each episode’s success", true],
            ["Update π with PPO", false],
          ]}
        />
      </div>
      <p className="pz-small">
        Each row repeats until training ends. Red: what SGS adds or changes.
        Before training, SGS also fixes the set of task configurations.
      </p>
    </div>
  );
}

const KEY = (
  <p className="pz-small">
    <span className="al-key" data-mark="+" /> added{" "}
    <span className="al-key ml-4" data-mark="~" /> changed
  </p>
);

export function AlgoStyleBlock({ style }: { style: AlgoStyle }) {
  const body: Record<AlgoStyle, ReactNode> = {
    a: <AlgorithmPair />,
    b: (
      <>
        <Pair className="al-b" />
        {KEY}
      </>
    ),
    c: (
      <>
        <Pair className="al-c" />
        {KEY}
      </>
    ),
    d: <Diff />,
    e: (
      <>
        <Pair className="al-e" font={geistMono.variable} />
        {KEY}
      </>
    ),
    f: <Flow />,
  };
  return <Fragment>{body[style]}</Fragment>;
}

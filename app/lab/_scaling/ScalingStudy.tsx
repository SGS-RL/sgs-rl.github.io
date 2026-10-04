import type { ReactNode } from "react";
import Section from "../_components/Section";
import { P, vars } from "../_poster/palettes";
import "../_poster/poster.css";
import "../_site/site.css";
import ClipMatrix from "./ClipMatrix";
import { MANIFEST, SCALE_LABELS, TO_RECORD } from "./clips";
import PointToClip from "./PointToClip";
import ScaleCompare from "./ScaleCompare";
import type { Skin } from "./skins";

// /lab/scaling: three ways to tie the scaling chart to clips of the
// policies, each shown in the serious (Swiss) skin and both playful skins.

const VARIANTS: {
  id: string;
  n: string;
  name: string;
  how: string;
  C: (p: { skin: Skin }) => ReactNode;
}[] = [
  {
    id: "v1",
    n: "V1",
    name: "Point → clip",
    how: "Hover, tap or drag across a chart, or focus it and use the arrow keys: the nearest data point is ringed and the monitor beside the chart plays that policy's clip.",
    C: PointToClip,
  },
  {
    id: "v2",
    n: "V2",
    name: "Pick a scale, compare methods",
    how: "Choose a scale with the x-axis labels, the arrows above the clips, or a drag across the chart: one clip per method at that scale plays below, all starting and restarting together.",
    C: ScaleCompare,
  },
  {
    id: "v3",
    n: "V3",
    name: "Clip matrix",
    how: "Every method at every scale as a still beside the chart. Choose a cell or a point to play that clip; pointing at a cell rings its point on the chart.",
    C: ClipMatrix,
  },
];

const SKINS: { skin: Skin; name: string }[] = [
  { skin: "swiss", name: "Serious: Swiss, light" },
  { skin: "web", name: "Playful: site, on white" },
  { skin: "poster", name: "Playful: pink poster" },
];

const ABOUT =
  "Success rate, from 0 to 1, against parallel environments, 4K to 1M on a log scale. Prior methods were run up to about 64K.";

function Frame({
  id,
  skin,
  children,
}: {
  id: string;
  skin: Skin;
  children: ReactNode;
}) {
  if (skin === "swiss")
    return (
      <div className="swiss pt-8" data-theme="light" style={{ minHeight: 0 }}>
        <Section id={`${id}-s`} n="04" label="Scaling">
          <p className="sw-label col-span-full max-w-[60ch] text-sw-mute">
            {ABOUT}
          </p>
          <div className="col-span-full">{children}</div>
        </Section>
      </div>
    );
  if (skin === "web")
    return (
      <div className="pz st">
        <h2 className="st-head border-y border-black bg-white px-[var(--m)] text-black">
          Results
        </h2>
        <div className="pz-grid gap-y-4 pb-12 pt-3">
          <p className="pz-small col-span-6 max-w-[52ch]">{ABOUT}</p>
          <div className="col-span-6 mt-4 md:col-span-12">{children}</div>
        </div>
      </div>
    );
  return (
    <div className="pz">
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em] text-black">
        Scaling
      </h2>
      <section className="pz-poster pb-12 pt-3" style={vars(P.scaling)}>
        <div className="pz-grid pz-small gap-y-3 pb-8">
          <p className="col-span-3 md:col-span-3">
            Success rate by parallel environments
          </p>
          <p className="col-span-3 md:col-span-5">{ABOUT}</p>
        </div>
        <div className="px-[var(--m)]">{children}</div>
      </section>
    </div>
  );
}

export default function ScalingStudy() {
  return (
    <div className="swiss" data-theme="light">
      <header className="sw-grid gap-y-3 pb-12 pt-6 md:pb-16 md:pt-10">
        <p className="sw-label col-span-full font-medium">SGS lab</p>
        <div className="col-span-full h-px bg-sw-rule" />
        <h1 className="sw-display col-span-full pt-2 text-[17vw] md:col-span-8 md:text-[min(9vw,9rem)]">
          Scaling, with clips
        </h1>
        <div className="sw-label col-span-full flex flex-col gap-3 self-end text-sw-mute md:col-span-4">
          <p>
            Studies for showing the trained policies at each scale and for each
            method next to the scaling results. Every clip here is a{" "}
            <span className="text-sw-fg">placeholder</span> cut from the
            existing footage and is labelled as one; the{" "}
            <a href="#record" className="sw-link text-sw-fg">
              {TO_RECORD.length} clips to record
            </a>{" "}
            are listed at the end.
          </p>
        </div>
        <nav
          aria-label="Studies"
          className="sw-label col-span-full mt-6 grid grid-cols-1 gap-y-4 md:grid-cols-3 md:gap-x-6"
        >
          {VARIANTS.map((v) => (
            <div key={v.id} className="border-t border-sw-rule pt-2">
              <p className="mb-1 font-medium">
                <span className="sw-num mr-3">{v.n}</span>
                {v.name}
              </p>
              <ul className="flex flex-wrap gap-x-4">
                {SKINS.map((s) => (
                  <li key={s.skin}>
                    <a
                      href={`#${v.id}-${s.skin}`}
                      className="sw-link text-sw-mute"
                    >
                      {s.skin === "swiss"
                        ? "Swiss"
                        : s.skin === "web"
                          ? "Site"
                          : "Poster"}{" "}
                      ↓
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </header>

      {VARIANTS.map((v) => (
        <div key={v.id}>
          <div className="bg-[#111] pb-6 pt-3 text-[#f0efea]">
            <div className="sw-grid gap-y-2">
              <h2 className="col-span-full text-[clamp(1.75rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.035em] md:col-span-5">
                <span className="sw-num mr-4 text-[#8e8e88]">{v.n}</span>
                {v.name}
              </h2>
              <p className="sw-label col-span-full max-w-[62ch] md:col-span-6 md:col-start-7 md:pt-1">
                {v.how}
              </p>
            </div>
          </div>
          {SKINS.map((s) => (
            <div key={s.skin} id={`${v.id}-${s.skin}`} className="scroll-mt-0">
              <p className="sw-label sw-grid border-t border-[#444] bg-[#111] py-1.5 text-[#c9c9c4]">
                <span className="sw-num col-span-1">{v.n}</span>
                <span className="col-span-3 md:col-span-8">{s.name}</span>
              </p>
              <Frame id={`${v.id}-${s.skin}`} skin={s.skin}>
                <v.C skin={s.skin} />
              </Frame>
            </div>
          ))}
        </div>
      ))}

      <section id="record" className="pt-16">
        <Section id="record-s" n="—" label="Clips to record">
          <div className="sw-label col-span-full flex flex-col gap-3 md:col-span-6">
            <p>
              One clip of about 5 s per task, method and scale in the figure;
              scales a method was not run at are skipped. Save each as{" "}
              <code className="sw-num">
                public/lab/media/scaling/{"{task}-{method}-{scale}"}.mp4
              </code>{" "}
              (960 px), with a 384 px copy ending in <code>-sm.mp4</code> and a
              poster <code>.jpg</code>; the encoding commands are at the top of{" "}
              <code>app/lab/_scaling/clips.ts</code>.
            </p>
          </div>
          <table className="sw-label sw-num col-span-full w-full border-collapse text-left md:col-span-7">
            <thead>
              <tr className="border-b border-sw-rule">
                <th className="py-1 pr-3 font-normal text-sw-mute">Task</th>
                <th className="py-1 pr-3 font-normal text-sw-mute">Method</th>
                <th className="py-1 pr-3 font-normal text-sw-mute">Scale</th>
                <th className="py-1 pr-3 font-normal text-sw-mute">File</th>
                <th className="hidden py-1 font-normal text-sw-mute md:table-cell">
                  Now
                </th>
              </tr>
            </thead>
            <tbody>
              {TO_RECORD.map((r) => (
                <tr key={r.id} className="border-b border-sw-hair">
                  <td className="py-1 pr-3">{r.task}</td>
                  <td className="py-1 pr-3">{r.method}</td>
                  <td className="py-1 pr-3">{SCALE_LABELS[r.scale]}</td>
                  <td className="py-1 pr-3">{r.id}</td>
                  <td className="hidden py-1 text-sw-mute md:table-cell">
                    {MANIFEST[r.id]?.placeholder
                      ? `placeholder (${MANIFEST[r.id]?.standIn})`
                      : "recorded"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </section>
    </div>
  );
}

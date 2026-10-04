import { P } from "../_poster/palettes";

// Three skins for the same interactions:
//   swiss   the serious track (.swiss, light theme tokens)
//   web     the playful site on white (.pz .st), as /lab/site Results
//   poster  the playful pink full-page plot (.pz-poster), as /lab/poster
export type Skin = "swiss" | "web" | "poster";

export type Inks = {
  fg: string; // type, axes, selected rings
  sgs: string; // the SGS line
  base: string; // every baseline line (they differ by marker or dash)
  band: string; // "Prior work" band
  bandOpacity: number;
  surface: string; // ground; also the ring that separates markers
  mute: string; // secondary text
  hair: string; // inner rules
  hi: string; // band behind the selected scale
  hiText: string;
  frame: string; // empty video frame
};

export type PosterInks = { ground: string; type: string; raster: string };

export function inksFor(skin: Skin, poster: PosterInks = P.scaling): Inks {
  if (skin === "swiss")
    return {
      fg: "var(--sw-fg)",
      sgs: "var(--sw-accent)",
      base: "var(--sw-baseline)",
      band: "var(--sw-panel)",
      bandOpacity: 1,
      surface: "var(--sw-bg)",
      mute: "var(--sw-mute)",
      hair: "var(--sw-hair)",
      hi: "var(--sw-fg)",
      hiText: "var(--sw-bg)",
      frame: "var(--sw-panel)",
    };
  if (skin === "web")
    return {
      fg: "#111111",
      sgs: "#111111",
      base: "#8c8c87",
      band: "#111111",
      bandOpacity: 0.07,
      surface: "#ffffff",
      mute: "rgba(17,17,17,0.6)",
      hair: "rgba(17,17,17,0.25)",
      hi: "#f6ee1f",
      hiText: "#111111",
      frame: "#efefea",
    };
  return {
    fg: poster.type,
    sgs: poster.type,
    base: poster.raster,
    band: poster.type,
    bandOpacity: 0.07,
    surface: poster.ground,
    mute: poster.type,
    hair: `color-mix(in srgb, ${poster.type} 35%, transparent)`,
    hi: poster.type,
    hiText: poster.ground,
    frame: `color-mix(in srgb, ${poster.type} 10%, ${poster.ground})`,
  };
}

// Type classes per track: Swiss uses weights, the poster system does not.
export const text = (skin: Skin) =>
  skin === "swiss"
    ? { small: "sw-label", num: "sw-num", strong: "font-medium" }
    : { small: "pz-small", num: "pz-num", strong: "" };

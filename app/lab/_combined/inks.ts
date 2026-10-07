// Colour schemes for the header, compared on /lab/header-colors/. Three
// inks each, as in the poster system: the ground, the mark (and the words
// set in it, unless `words` differs) and the type. `mute` is the
// affiliations line. Pairs on coloured grounds are taken from the poster
// palettes (../_poster/palettes.ts) and the Site 3 bands.
export type Inks = {
  ground: string;
  mark: string;
  words?: string;
  type: string;
  mute: string;
};

export type Scheme = {
  id: string;
  group: string;
  name: string;
  note?: string;
  inks: Inks;
};

const BLACK = "#111111";
const MUTE = "rgb(0 0 0 / 0.6)";
const WHITE_MUTE = "rgb(255 255 255 / 0.78)";

// H1, the Site 2/3 header.
const CORAL: Inks = {
  ground: "#ffffff",
  mark: "#ff6464",
  type: BLACK,
  mute: MUTE,
};

// H4, picked by the owner for the combined page (2026-10-06).
export const HEADER_INKS: Inks = {
  ground: "#ffffff",
  mark: BLACK,
  words: "#e4321b",
  type: BLACK,
  mute: MUTE,
};

export const SCHEMES: Scheme[] = [
  {
    id: "h1",
    group: "On white",
    name: "Coral on white",
    note: "The Site 2/3 header",
    inks: CORAL,
  },
  {
    id: "h2",
    group: "On white",
    name: "Red on white",
    note: "The serious track's accent",
    inks: { ground: "#ffffff", mark: "#e4321b", type: BLACK, mute: MUTE },
  },
  {
    id: "h3",
    group: "On white",
    name: "Blue on white",
    note: "The blue of Site 3's hardware band",
    inks: { ground: "#ffffff", mark: "#1f61d6", type: BLACK, mute: MUTE },
  },
  {
    id: "h4",
    group: "On white",
    name: "Black on white, red words",
    note: "The combined page's header",
    inks: HEADER_INKS,
  },
  {
    id: "h5",
    group: "Light ground",
    name: "Black on yellow",
    note: "Site 3's locomotion band",
    inks: { ground: "#f6ee1f", mark: BLACK, type: BLACK, mute: MUTE },
  },
  {
    id: "h6",
    group: "Light ground",
    name: "Red on yellow",
    note: "The poster cover",
    inks: { ground: "#f3e21d", mark: "#e8412b", type: BLACK, mute: MUTE },
  },
  {
    id: "h7",
    group: "Light ground",
    name: "Blue on mint",
    note: "The poster's method page",
    inks: { ground: "#a3e4d7", mark: "#1d5ccf", type: BLACK, mute: MUTE },
  },
  {
    id: "h8",
    group: "Light ground",
    name: "Blue on pink",
    note: "The poster's results page",
    inks: { ground: "#f5a3b7", mark: "#1f61d6", type: BLACK, mute: MUTE },
  },
  {
    id: "h9",
    group: "Strong ground",
    name: "White on blue",
    inks: {
      ground: "#1f61d6",
      mark: "#ffffff",
      type: "#ffffff",
      mute: WHITE_MUTE,
    },
  },
  {
    id: "h10",
    group: "Strong ground",
    name: "White on coral",
    inks: { ground: "#ff6464", mark: "#ffffff", type: BLACK, mute: MUTE },
  },
  {
    id: "h11",
    group: "Strong ground",
    name: "White on red",
    inks: {
      ground: "#e4321b",
      mark: "#ffffff",
      type: "#ffffff",
      mute: WHITE_MUTE,
    },
  },
  {
    id: "h12",
    group: "Strong ground",
    name: "Coral on black",
    note: "The black of the Site footer, with the coral mark",
    inks: {
      ground: "#000000",
      mark: "#ff6464",
      type: "#ffffff",
      mute: WHITE_MUTE,
    },
  },
];

// Three inks per poster: ground, type, raster. Picked from the NOF series
// and from the simulation itself (the yellow goal marker, the red robot).
export const P = {
  hero: { ground: "#f3e21d", type: "#e8412b", raster: "#b9a312" },
  listing: { ground: "#f6ee1f", type: "#111111", raster: "#ff4b1f" },
  method: { ground: "#a3e4d7", type: "#1d5ccf", raster: "#ef5a9d" },
  scaling: { ground: "#f5a3b7", type: "#1f61d6", raster: "#b8955a" },
  manip: { ground: "#ffffff", type: "#ff6464", raster: "#ff6464" },
  quilt: [
    "#f3d400",
    "#e2231a",
    "#1e9ad6",
    "#ffffff",
    "#c9ab6b",
    "#0f9d58",
    "#f5a3b7",
  ],
} as const;

export const vars = (p: { ground: string; type: string; raster: string }) =>
  ({
    "--ground": p.ground,
    "--type": p.type,
    "--raster": p.raster,
  }) as React.CSSProperties;

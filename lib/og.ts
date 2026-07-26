// Geometry and timing of the social card, shared by the poster route that draws
// it (components/og-poster) and the CLI that screenshots it
// (scripts/generate-og). Kept free of React and three so the Node script can
// import it directly.

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// The shot is taken at 2x: crisp on retina timelines, still a small JPEG.
export const OG_SCALE = 2;

// The graph inks itself over ~2.4s and the camera damps toward its rest pose;
// the shot waits this long before firing.
export const OG_SETTLE_MS = 3200;

// Where the bright routing bead sits along the graph, 0-1 in draw order. 0.72
// lands it on the director->post edge: the top-right run home, in clear air
// above the receipt.
export const OG_PULSE = 0.72;

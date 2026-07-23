// The approval graph, authored as data. Single source of truth for the 3D
// hero drawing: node positions and hand-routed edge polylines in a design
// space centered on the origin (world units). The slight jitter and Z
// undulation are what make the wires read hand-inked instead of CAD.

export type GraphNode = {
  id: string;
  position: [number, number, number];
};

export type GraphEdge = {
  from: string;
  to: string;
  // Intermediate waypoints between the endpoints (hand-routed bends).
  via: [number, number, number][];
  // Share of the global draw progress this edge occupies, in draw order.
  draw: [number, number];
};

export const graphNodes: GraphNode[] = [
  { id: "intake", position: [-3.4, 0.15, 0] },
  { id: "manager", position: [-1.5, 0.85, 0.12] },
  { id: "director", position: [0.35, 1.25, -0.1] },
  { id: "dept", position: [0.15, -0.85, 0.14] },
  { id: "controller", position: [1.75, -0.35, -0.08] },
  { id: "post", position: [3.3, 0.45, 0.05] },
];

export const graphEdges: GraphEdge[] = [
  { from: "intake", to: "manager", via: [[-2.6, 0.2, 0.1]], draw: [0, 0.18] },
  { from: "manager", to: "director", via: [[-0.7, 1.15, 0]], draw: [0.18, 0.36] },
  {
    from: "manager",
    to: "dept",
    via: [
      [-0.9, 0.1, 0.16],
      [-0.5, -0.7, 0.1],
    ],
    draw: [0.22, 0.44],
  },
  { from: "director", to: "controller", via: [[1.1, 0.55, -0.12]], draw: [0.36, 0.58] },
  { from: "dept", to: "controller", via: [[0.95, -0.75, 0.05]], draw: [0.44, 0.64] },
  { from: "director", to: "post", via: [[1.9, 1.15, -0.05]], draw: [0.58, 0.82] },
  { from: "controller", to: "post", via: [[2.6, -0.15, 0]], draw: [0.64, 1] },
];

export const nodeById = (id: string): GraphNode => {
  const node = graphNodes.find((candidate) => candidate.id === id);
  if (node === undefined) throw new Error(`unknown graph node: ${id}`);
  return node;
};

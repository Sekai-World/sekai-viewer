import type { MultiDirectedGraph } from "graphology";
import type { GraphNode } from "../types";
import { rankFocus } from "../scoring/focus";

export interface VisibleGraphStats {
  nodes: number;
  edges: number;
}

export interface GraphFocusState {
  visible: Set<string> | null;
  relationFades: Map<string, number>;
  stats: VisibleGraphStats;
}

export const getGraphFocusState = (
  graph: MultiDirectedGraph,
  allNodes: Map<string, GraphNode>,
  selectedNodes: string[],
  focusNodes?: Set<string>
): GraphFocusState => {
  const metrics =
    selectedNodes.length > 0
      ? rankFocus(graph, selectedNodes, allNodes, focusNodes)
      : null;
  const visible = focusNodes
    ? focusNodes
    : metrics
      ? new Set(metrics.depths.keys())
      : null;
  const nodes = visible
    ? graph.nodes().filter((node) => visible.has(node)).length
    : graph.order;
  let edges = 0;
  graph.forEachEdge((_edge, _attributes, source, target) => {
    if (!visible || (visible.has(source) && visible.has(target))) edges += 1;
  });

  return {
    visible,
    relationFades: metrics?.relationFades ?? new Map<string, number>(),
    stats: { nodes, edges },
  };
};

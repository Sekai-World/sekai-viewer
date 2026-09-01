import type { MultiDirectedGraph } from "graphology";
import { combineScores } from "./weights";
import type { GraphNode } from "../types";
import { traverseGraphology } from "./traversal";

export interface FocusRanking {
  depths: Map<string, number>;
  relationRatios: Map<string, number>;
  relationFades: Map<string, number>;
}

// Traverse relationships without considering edge direction.
export const rankFocus = (
  graph: MultiDirectedGraph,
  roots: string[],
  allNodes: Map<string, GraphNode>,
  rankedNodeIds?: Set<string>
): FocusRanking => {
  const adjacency = new Map<string, string[]>();
  graph.forEachNode((node) => adjacency.set(node, []));
  graph.forEachEdge((_edge, _attributes, source, target) => {
    adjacency.get(source)?.push(target);
    adjacency.get(target)?.push(source);
  });

  const traversal = traverseGraphology(graph, roots, allNodes);
  const reachable = new Set(traversal.map((result) => result.nodeId));
  const depths = new Map<string, number>();
  for (const result of traversal) {
    const previous = depths.get(result.nodeId);
    if (previous === undefined || result.depth < previous) {
      depths.set(result.nodeId, result.depth);
    }
  }

  const rootIds = new Set(roots.filter((root) => adjacency.has(root)));
  const focusDegree = [...rootIds].reduce((sum, root) => {
    return (
      sum +
      (adjacency.get(root) ?? []).filter((neighbor) => !rootIds.has(neighbor))
        .length
    );
  }, 0);

  const indirectScores = new Map<string, number>();
  const currentScores = new Map<string, number>();
  for (const root of rootIds)
    currentScores.set(root, 1 / Math.max(rootIds.size, 1));
  const maxDepth = Math.max(...depths.values(), 0);
  for (let step = 0; step < maxDepth; step++) {
    const nextScores = new Map<string, number>();
    for (const [node, score] of currentScores) {
      const nodeType = allNodes.get(node)?.type;
      if (
        !rootIds.has(node) &&
        (nodeType === "character" || nodeType === "group")
      ) {
        continue;
      }
      const neighbors = adjacency.get(node) ?? [];
      if (neighbors.length === 0) continue;
      const share = score / neighbors.length;
      for (const neighbor of neighbors) {
        nextScores.set(neighbor, (nextScores.get(neighbor) ?? 0) + share);
      }
    }
    for (const [node, score] of nextScores) {
      indirectScores.set(
        node,
        (indirectScores.get(node) ?? 0) + score * Math.pow(0.55, step + 1)
      );
    }
    currentScores.clear();
    nextScores.forEach((score, node) => currentScores.set(node, score));
  }

  const ratios = new Map<string, number>();
  for (const node of reachable) {
    const totalEdges = adjacency.get(node)?.length ?? 0;
    const nodeDepth = depths.get(node) ?? 0;
    const directEdges =
      nodeDepth === 0
        ? 0
        : (adjacency.get(node) ?? []).filter((neighbor) =>
            rootIds.has(neighbor)
          ).length;
    const directDice =
      nodeDepth === 0
        ? 1
        : (2 * directEdges) / Math.max(focusDegree + totalEdges, 1);
    const indirectScore = indirectScores.get(node) ?? 0;
    ratios.set(
      node,
      nodeDepth === 0 ? 1 : combineScores(directDice, indirectScore)
    );
  }

  const relationFades = new Map<string, number>();
  const rankedNodes = [...depths]
    .filter(
      ([id, depth]) => depth > 0 && (!rankedNodeIds || rankedNodeIds.has(id))
    )
    .map(([id]) => ({ id, ratio: ratios.get(id) ?? 0 }))
    .sort((a, b) => b.ratio - a.ratio || a.id.localeCompare(b.id));
  const distinctRatios = [...new Set(rankedNodes.map(({ ratio }) => ratio))];
  const rankByRatio = new Map(
    distinctRatios.map((ratio, rank) => [ratio, rank])
  );
  const maxRank = Math.max(distinctRatios.length - 1, 1);

  for (const [node, depth] of depths) {
    if (depth === 0) {
      relationFades.set(node, 0);
      continue;
    }
    const rank = rankByRatio.get(ratios.get(node) ?? 0) ?? maxRank;
    relationFades.set(node, (rank / maxRank) * 0.9);
  }

  return { depths, relationRatios: ratios, relationFades };
};

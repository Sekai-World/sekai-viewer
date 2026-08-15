import type { GraphEdge, GraphNode } from "./types";

export const getSharedSemanticNodeIds = (
  characterAId: string,
  characterBId: string,
  allNodes: Map<string, GraphNode>,
  allEdges: GraphEdge[]
): Set<string> => {
  const linkedTo = (characterId: string): Set<string> => {
    const nodes = new Set<string>();
    for (const edge of allEdges) {
      const otherId =
        edge.sourceId === characterId
          ? edge.targetId
          : edge.targetId === characterId
            ? edge.sourceId
            : null;
      if (!otherId) continue;
      const node = allNodes.get(otherId);
      if (
        node?.type === "event" ||
        node?.type === "group" ||
        node?.type === "term"
      ) {
        nodes.add(otherId);
      }
    }
    return nodes;
  };

  const sharedWithA = linkedTo(characterAId);
  const sharedWithB = linkedTo(characterBId);
  return new Set([
    characterAId,
    characterBId,
    ...[...sharedWithA].filter((nodeId) => sharedWithB.has(nodeId)),
  ]);
};

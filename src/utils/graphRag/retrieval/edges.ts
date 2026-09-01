import type {
  RetrievalScoreInput,
  RetrievalScoreResult,
} from "../scoring/contextual";
import {
  selectDirectCharacterRelations,
  selectTraversalResults,
} from "../scoring/retrieval";
import {
  traverseIndexedDb,
  type IndexedDbTraversalStore,
} from "../scoring/traversal";
import type { GraphEdge, GraphNode } from "../types";

type ScoreEdge = (input: RetrievalScoreInput) => Promise<RetrievalScoreResult>;

export const edgeKeyFor = (edge: GraphEdge): string =>
  edge.id === undefined
    ? `${edge.sourceId}-${edge.targetId}-${edge.type}-${edge.identifier}`
    : String(edge.id);

export async function collectTraversalEdges(
  store: IndexedDbTraversalStore,
  seedIds: string[],
  scoreEdge: ScoreEdge,
  limit: number,
  addNodeToContext: (node: GraphNode) => void,
  seenEdgeKeys: Set<string>,
  collectedEdges: GraphEdge[]
): Promise<void> {
  const traversal = await traverseIndexedDb(store, seedIds);
  const selectedTraversal = await selectTraversalResults(
    traversal,
    scoreEdge,
    limit
  );

  for (const result of selectedTraversal) {
    for (const nodeId of result.path.slice(1)) {
      const node = await store.getNode(nodeId);
      if (node) addNodeToContext(node);
    }
    for (const edge of result.edges) {
      if (edge.type === "CHARACTER_RELATION") continue;
      const key = edgeKeyFor(edge);
      if (seenEdgeKeys.has(key)) continue;
      seenEdgeKeys.add(key);
      collectedEdges.push(edge);
    }
  }
}

export async function collectDirectCharacterRelations(
  store: Pick<IndexedDbTraversalStore, "getEdgesBySource">,
  characterIds: Set<string>,
  getEdgeSimilarity: (edge: GraphEdge) => Promise<number>,
  limit: number,
  seenEdgeKeys: Set<string>,
  collectedEdges: GraphEdge[]
): Promise<void> {
  const candidates: GraphEdge[] = [];
  for (const characterId of characterIds) {
    const edges = await store.getEdgesBySource(characterId);
    for (const edge of edges) {
      if (
        edge.type === "CHARACTER_RELATION" &&
        characterIds.has(edge.targetId) &&
        !seenEdgeKeys.has(edgeKeyFor(edge))
      ) {
        candidates.push(edge);
      }
    }
  }

  const selected = await selectDirectCharacterRelations(
    characterIds,
    candidates,
    getEdgeSimilarity,
    limit
  );
  for (const edge of selected) {
    const key = edgeKeyFor(edge);
    if (seenEdgeKeys.has(key)) continue;
    seenEdgeKeys.add(key);
    collectedEdges.push(edge);
  }
}

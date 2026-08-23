import type { RetrievalScoreInput, RetrievalScoreResult } from "./contextual";
import type { TraversalResult } from "./traversal";
import type { GraphEdge } from "../types";

type ScoreEdge = (input: RetrievalScoreInput) => Promise<RetrievalScoreResult>;

export async function selectTraversalResults(
  traversal: TraversalResult<GraphEdge>[],
  scoreEdge: ScoreEdge,
  limit: number
): Promise<TraversalResult<GraphEdge>[]> {
  const scoredBySeed = new Map<
    string,
    Array<{ result: TraversalResult<GraphEdge>; score: number }>
  >();

  for (const result of traversal) {
    if (result.depth === 0 || result.edges.length === 0) continue;
    const edge = result.edges[result.edges.length - 1];
    const score = (await scoreEdge({ edge, depth: result.depth })).score;
    const entries = scoredBySeed.get(result.seedId) ?? [];
    entries.push({ result, score });
    scoredBySeed.set(result.seedId, entries);
  }

  return [...scoredBySeed.values()].flatMap((entries) =>
    entries
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.result.depth - b.result.depth ||
          a.result.nodeId.localeCompare(b.result.nodeId)
      )
      .slice(0, Math.max(0, limit))
      .map(({ result }) => result)
  );
}

export async function selectDirectCharacterRelations(
  characterIds: Iterable<string>,
  candidates: GraphEdge[],
  getEdgeSimilarity: (edge: GraphEdge) => Promise<number>,
  limit: number
): Promise<GraphEdge[]> {
  const ranked = await Promise.all(
    candidates.map(async (edge) => ({
      edge,
      similarity: await getEdgeSimilarity(edge),
    }))
  );

  return [...characterIds].flatMap((characterId) =>
    ranked
      .filter(
        ({ edge }) =>
          edge.sourceId === characterId || edge.targetId === characterId
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Math.max(0, limit))
      .map(({ edge }) => edge)
  );
}

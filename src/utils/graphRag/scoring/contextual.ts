import { embeddingService } from "../embeddings";
import { combineScores } from "./weights";
import { graphRAGStore } from "../storage";
import type { GraphEdge } from "../types";

export interface NodeStats {
  totalEdges: number;
  exactMatchCount: number;
}

interface RelevanceBounds {
  maxTotalEdges: number;
  maxExactMatchCount: number;
}

export interface RetrievalScoreInput {
  edge: GraphEdge;
  depth: number;
}

export interface RetrievalScoreResult {
  depth: number;
  similarity: number;
  relevance: number;
  combinedScore: number;
  score: number;
}

export async function collectNodeStats(
  nodeIds: Iterable<string>,
  matchedNodeIds: Set<string>
): Promise<{
  nodeStatsMap: Map<string, NodeStats>;
  bounds: RelevanceBounds;
}> {
  const nodeStatsMap = new Map<string, NodeStats>();
  let maxTotalEdges = 0;
  let maxExactMatchCount = 0;

  for (const nodeId of nodeIds) {
    const edges = await graphRAGStore.getEdgesBySource(nodeId);
    const nonRelEdges = edges.filter(
      (edge) => edge.type !== "CHARACTER_RELATION"
    );
    const totalEdges = nonRelEdges.length;
    const exactMatchCount = nonRelEdges.filter((edge) =>
      matchedNodeIds.has(edge.targetId)
    ).length;

    nodeStatsMap.set(nodeId, { totalEdges, exactMatchCount });
    if (totalEdges > maxTotalEdges) maxTotalEdges = totalEdges;
    if (exactMatchCount > maxExactMatchCount) {
      maxExactMatchCount = exactMatchCount;
    }
  }

  return {
    nodeStatsMap,
    bounds: { maxTotalEdges, maxExactMatchCount },
  };
}

/**
 * Compute a structural relevance score in [0,1] for a source node's edge list.
 *
 * The equal-weight signals are degree across scored nodes, the fraction of
 * edges that target story-present nodes, and a log-dampened exact-match count.
 */
export function computeRelevance(
  totalEdges: number,
  exactMatchCount: number,
  bounds: RelevanceBounds
): number {
  const degreeRatio =
    bounds.maxTotalEdges > 0 ? totalEdges / bounds.maxTotalEdges : 0;
  const exactRatio = totalEdges > 0 ? exactMatchCount / totalEdges : 0;
  const exactCountNorm =
    bounds.maxExactMatchCount > 0
      ? Math.log1p(exactMatchCount) / Math.log1p(bounds.maxExactMatchCount)
      : 0;

  return (degreeRatio + exactRatio + exactCountNorm) / 3;
}

export function createEdgeScorer(
  scenarioEmbedding: Float32Array,
  nodeStatsMap: Map<string, NodeStats>,
  bounds: RelevanceBounds
) {
  async function getEdgeSimilarity(edge: GraphEdge): Promise<number> {
    let edgeEmbedding: Float32Array | undefined;
    if (edge.id !== undefined) {
      const stored = await graphRAGStore.getEdgeWithEmbedding(edge.id);
      edgeEmbedding = stored?.embedding;
    }

    // Cached embeddings may use a different model than the active one.
    if (edgeEmbedding && edgeEmbedding.length !== scenarioEmbedding.length) {
      edgeEmbedding = undefined;
    }
    if (!edgeEmbedding) {
      edgeEmbedding = await embeddingService.embed(
        await graphRAGStore.buildEdgeEmbeddingText(edge)
      );
      await graphRAGStore.putEdge(edge, edgeEmbedding);
    }

    return embeddingService.cosineSimilarity(scenarioEmbedding, edgeEmbedding);
  }

  async function scoreEdge({
    edge,
    depth,
  }: RetrievalScoreInput): Promise<RetrievalScoreResult> {
    const sourceStats = nodeStatsMap.get(edge.sourceId);
    const relevance = sourceStats
      ? computeRelevance(
          sourceStats.totalEdges,
          sourceStats.exactMatchCount,
          bounds
        )
      : 0;
    const similarity = await getEdgeSimilarity(edge);
    const combinedScore = combineScores(similarity, relevance);

    return {
      depth,
      similarity,
      relevance,
      combinedScore,
      score: combinedScore - depth * 0.1,
    };
  }

  return { getEdgeSimilarity, scoreEdge };
}

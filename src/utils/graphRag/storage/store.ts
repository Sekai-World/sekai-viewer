/**
 * IndexedDB wrapper for Graph RAG storage
 */

import { IDBPDatabase } from "idb";
import {
  GraphNode,
  GraphEdge,
  CharacterNode,
  TermNode,
  EventNode,
  NodeType,
  EdgeType,
} from "../types";
import {
  DATA_VERSION_KEY,
  GRAPH_DATA_VERSION,
  GraphRAGDB,
  openGraphRAGDB,
} from "./db";
import {
  getAllEvents as readAllEvents,
  getAllTerms as readAllTerms,
  getCharacterByGameId as readCharacterByGameId,
  getCharacterByName as readCharacterByName,
  getNode as readNode,
  getNodesByType as readNodesByType,
  mergeNodes as mergeGraphNodes,
  putNode as writeNode,
} from "./nodes";
import {
  buildEdgeEmbeddingText as buildEdgeText,
  findEdge as findGraphEdge,
  getAllEdges as readAllEdges,
  getEdge as readEdge,
  getEdgeByIdentifier as readEdgeByIdentifier,
  getEdgesBySource as readEdgesBySource,
  getEdgesByTarget as readEdgesByTarget,
  getEdgesByType as readEdgesByType,
  getEdgeWithEmbedding as readEdgeWithEmbedding,
  putEdge as writeEdge,
  upsertEdge as upsertGraphEdge,
} from "./edges";
import type { MergeNodesResult } from "./nodes";
import {
  clear as clearGraph,
  clearEmbeddings as clearGraphEmbeddings,
  getVisualizationStats as readVisualizationStats,
  isStoryProcessed as readStoryProcessed,
  markStoryProcessed as writeStoryProcessed,
} from "./maintenance";
import {
  exportGraph as exportGraphArchive,
  importGraph as importGraphArchive,
} from "./archive";
import type { GraphRAGExport } from "./archive";

// Bump this whenever the extraction schema / node or edge shape changes in a
// way that makes previously indexed data incompatible (e.g. CharacterNode
// gaining originalTextVariants, edges moving from embedded to top-level
// arrays, etc). On mismatch, the store is wiped on init so stale data never
// gets mixed with the new shape.
class GraphRAGStore {
  private db: IDBPDatabase<GraphRAGDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openGraphRAGDB();

    // If the on-disk data was built with an older extraction/schema version,
    // wipe it so we never mix incompatible node/edge shapes.
    const storedVersion = await this.getDataVersion();
    if (storedVersion !== GRAPH_DATA_VERSION) {
      await this.clear();
      await this.setDataVersion(GRAPH_DATA_VERSION);
    }
  }

  // ===== VERSION / METADATA =====

  async getDataVersion(): Promise<number | null> {
    const db = this.ensureDB();
    const value = await db.get("metadata", DATA_VERSION_KEY);
    return typeof value === "number" ? value : null;
  }

  async setDataVersion(version: number): Promise<void> {
    const db = this.ensureDB();
    await db.put("metadata", version, DATA_VERSION_KEY);
  }

  private ensureDB(): IDBPDatabase<GraphRAGDB> {
    if (!this.db) {
      throw new Error("GraphRAGStore not initialized. Call init() first.");
    }
    return this.db;
  }

  // ===== NODE OPERATIONS =====

  async putNode(node: GraphNode): Promise<void> {
    await writeNode(this.ensureDB(), node);
  }

  async getNode(id: string): Promise<GraphNode | null> {
    return readNode(this.ensureDB(), id);
  }

  async getNodesByType(type: NodeType): Promise<GraphNode[]> {
    return readNodesByType(this.ensureDB(), type);
  }

  async getCharacterByGameId(
    characterId: number
  ): Promise<CharacterNode | null> {
    return readCharacterByGameId(this.ensureDB(), characterId);
  }

  async getCharacterByName(name: string): Promise<CharacterNode | null> {
    return readCharacterByName(this.ensureDB(), name);
  }

  /**
   * Merge a duplicate node into a retained node of the same type. The retained
   * node keeps its authoritative metadata, while its translated names and
   * original-name variants are merged from the duplicate. Every connection is
   * redirected in one IndexedDB transaction and duplicate edges combine tags.
   */
  async mergeNodes(
    retainedNodeId: string,
    duplicateNodeId: string
  ): Promise<MergeNodesResult> {
    return mergeGraphNodes(this.ensureDB(), retainedNodeId, duplicateNodeId);
  }

  async getAllEvents(): Promise<EventNode[]> {
    return readAllEvents(this.ensureDB());
  }

  async getAllTerms(): Promise<TermNode[]> {
    return readAllTerms(this.ensureDB());
  }

  /**
   * Return the graph visualization totals. Fact nodes and FACT edges are
   * intentionally omitted because the viewer shows facts in details only.
   */
  async getVisualizationStats(): Promise<{ nodes: number; edges: number }> {
    return readVisualizationStats(this.ensureDB());
  }

  /**
   * Export all graph data, including cached embeddings and processed-story
   * markers, as a portable JSON-safe archive.
   */
  async exportGraph(): Promise<GraphRAGExport> {
    return exportGraphArchive(this.ensureDB());
  }

  /**
   * Replace the current graph with a previously exported archive. The archive
   * must match the current graph schema so imported records remain compatible.
   */
  async importGraph(archive: unknown): Promise<void> {
    await importGraphArchive(this.ensureDB(), archive);
  }

  // ===== EDGE OPERATIONS =====

  /**
   * Build the rich text used to embed an edge for similarity ranking:
   * source entity name, edge type, target entity details (name/description/
   * gender as applicable), and the edge's free-text context.
   */
  async buildEdgeEmbeddingText(edge: GraphEdge): Promise<string> {
    return buildEdgeText(this.ensureDB(), edge);
  }

  /**
   * Store an edge. If no embedding is supplied, one is computed from the
   * edge's source/target/context at write time (story indexing, which
   * happens once) rather than on every retrieval call (which happens on
   * every translation request), so retrieval only ever reads a cached
   * vector instead of recomputing it.
   */
  async putEdge(edge: GraphEdge, embedding?: Float32Array): Promise<number> {
    return writeEdge(this.ensureDB(), edge, embedding);
  }

  async getEdge(id: number): Promise<GraphEdge | null> {
    return readEdge(this.ensureDB(), id);
  }

  async getEdgesBySource(sourceId: string): Promise<GraphEdge[]> {
    return readEdgesBySource(this.ensureDB(), sourceId);
  }

  async getEdgesByTarget(targetId: string): Promise<GraphEdge[]> {
    return readEdgesByTarget(this.ensureDB(), targetId);
  }

  async getEdgesByType(type: EdgeType): Promise<GraphEdge[]> {
    return readEdgesByType(this.ensureDB(), type);
  }

  async getAllEdges(): Promise<GraphEdge[]> {
    return readAllEdges(this.ensureDB());
  }

  async getEdgeByIdentifier(identifier: string): Promise<GraphEdge | null> {
    return readEdgeByIdentifier(this.ensureDB(), identifier);
  }

  /**
   * Get edge with its embedding for similarity ranking
   */
  async getEdgeWithEmbedding(
    id: number
  ): Promise<{ edge: GraphEdge; embedding?: Float32Array } | null> {
    return readEdgeWithEmbedding(this.ensureDB(), id);
  }

  /**
   * Find an edge matching source, target, and type
   */
  async findEdge(
    sourceId: string,
    targetId: string,
    type: EdgeType
  ): Promise<GraphEdge | null> {
    return findGraphEdge(this.ensureDB(), sourceId, targetId, type);
  }

  /**
   * Find or create an edge, appending the episode tag.
   *
   * The embedding is only recomputed when the edge's embeddable text
   * actually changes (new edge, or context/source/target changed on an
   * existing one). Appending an episode tag to an otherwise-unchanged edge
   * reuses the cached embedding instead of re-running the embedding model.
   */
  async upsertEdge(
    sourceId: string,
    targetId: string,
    type: EdgeType,
    episodeTag: string,
    context: string | undefined,
    identifier: string
  ): Promise<void> {
    await upsertGraphEdge(
      this.ensureDB(),
      sourceId,
      targetId,
      type,
      episodeTag,
      context,
      identifier
    );
  }

  /* private async upsertEdgeLegacy(
    sourceId: string,
    targetId: string,
    type: EdgeType,
    episodeTag: string,
    context: string | undefined,
    identifier: string
  ): Promise<void> {
    // Try to find by identifier
    const existing = await this.getEdgeByIdentifier(identifier);

    // If found by identifier but source/target/type don't match, it's a conflict
    if (
      existing &&
      (existing.sourceId !== sourceId ||
        existing.targetId !== targetId ||
        existing.type !== type)
    ) {
      console.warn(
        `⚠️  Edge identifier conflict: "${identifier}" exists but points to different nodes (${existing.sourceId} -> ${existing.targetId} [${existing.type}] vs ${sourceId} -> ${targetId} [${type}]). Updating to new nodes.`
      );
      // Update the existing edge to point to new nodes
      existing.sourceId = sourceId;
      existing.targetId = targetId;
      existing.type = type;
    }

    if (existing) {
      const contextChanged = Boolean(context) && context !== existing.context;

      // Append episode tag if not already present
      if (!existing.episodeTags.includes(episodeTag)) {
        existing.episodeTags.push(episodeTag);
      }
      // Update context if provided (latest context wins)
      if (context) {
        existing.context = context;
      }

      if (contextChanged) {
        // Text changed -> stale cached embedding, recompute at write time.
        await this.putEdge(existing);
      } else {
        // Nothing embedding-relevant changed; keep the cached vector as-is.
        await this.putEdgePreservingEmbedding(existing);
      }
    } else {
      // Create new edge (embedding computed inside putEdge)
      await this.putEdge({
        identifier,
        sourceId,
        targetId,
        type,
        episodeTags: [episodeTag],
        context: context || "",
      });
    }
  }

  // Update an edge's non-embedding fields without touching its embedding.
  private async putEdgePreservingEmbedding(edge: GraphEdge): Promise<void> {
    const db = this.ensureDB();
    const existingRecord =
      edge.id !== undefined ? await db.get("edges", edge.id) : undefined;

    const edgeRecord: GraphRAGDB["edges"]["value"] = {
      ...edge,
      embedding: existingRecord?.embedding,
    };

    await db.put("edges", edgeRecord);
  } */

  // ===== PROCESSED STORY TRACKING =====

  /**
   * Mark a story (identified by its storyTag) as fully indexed, so future
   * indexing runs can skip it outright instead of re-extracting.
   */
  async markStoryProcessed(storyTag: string): Promise<void> {
    await writeStoryProcessed(this.ensureDB(), storyTag);
  }

  /**
   * Whether a story has already been indexed in a prior run.
   */
  async isStoryProcessed(storyTag: string): Promise<boolean> {
    return readStoryProcessed(this.ensureDB(), storyTag);
  }

  // ===== UTILITY =====

  async clear(): Promise<void> {
    await clearGraph(this.ensureDB());
  }

  /**
   * Clear all embeddings from nodes and edges (when model changes)
   * Keeps the graph structure intact
   */
  async clearEmbeddings(): Promise<void> {
    await clearGraphEmbeddings(this.ensureDB());
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const graphRAGStore = new GraphRAGStore();

export type { GraphRAGExport } from "./archive";
export type { MergeNodesResult } from "./nodes";

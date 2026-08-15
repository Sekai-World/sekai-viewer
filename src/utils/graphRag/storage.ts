/**
 * IndexedDB wrapper for Graph RAG storage
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";
import {
  GraphNode,
  GraphEdge,
  CharacterNode,
  GroupNode,
  TermNode,
  EventNode,
  FactNode,
  NodeType,
  EdgeType,
} from "./types";
import { embeddingService } from "./embeddings";

interface GraphRAGDB extends DBSchema {
  nodes: {
    key: string;
    value: {
      id: string;
      type: NodeType;
      data: GraphNode;
      // Embeddings stored as ArrayBuffer
      embedding?: ArrayBuffer;
    };
    indexes: { "by-type": NodeType; "by-characterId": number };
  };
  edges: {
    key: number;
    value: GraphEdge & {
      // Store edge embedding for similarity ranking
      embedding?: ArrayBuffer;
    };
    indexes: {
      "by-source": string;
      "by-target": string;
      "by-type": EdgeType;
      "by-identifier": string;
    };
  };
  metadata: {
    key: string;
    value: unknown;
  };
  processedStories: {
    key: string;
    value: {
      storyTag: string;
      indexedAt: number;
    };
  };
}

const DB_NAME = "sekai-graph-rag";
const DB_VERSION = 1;

// Bump this whenever the extraction schema / node or edge shape changes in a
// way that makes previously indexed data incompatible (e.g. CharacterNode
// gaining originalTextVariants, edges moving from embedded to top-level
// arrays, etc). On mismatch, the store is wiped on init so stale data never
// gets mixed with the new shape.
const GRAPH_DATA_VERSION = 1;
const DATA_VERSION_KEY = "dataVersion";
const GRAPH_EXPORT_FORMAT = "sekai-graph-rag";
const GRAPH_EXPORT_VERSION = 1;

interface SerializedGraphNodeRecord {
  id: string;
  type: NodeType;
  data: GraphNode;
  embedding?: string;
}

interface SerializedGraphEdgeRecord extends Omit<GraphEdge, "embedding"> {
  embedding?: string;
}

export interface GraphRAGExport {
  format: typeof GRAPH_EXPORT_FORMAT;
  version: typeof GRAPH_EXPORT_VERSION;
  dataVersion: number;
  exportedAt: string;
  nodes: SerializedGraphNodeRecord[];
  edges: SerializedGraphEdgeRecord[];
  processedStories: Array<{ storyTag: string; indexedAt: number }>;
}

export interface MergeNodesResult {
  retainedNodeId: string;
  removedNodeId: string;
  rewiredEdges: number;
  removedEdges: number;
}

type TranslatableNode = Extract<
  GraphNode,
  {
    translatedNames: Record<string, Record<string, string>>;
    originalTextVariants: string[];
  }
>;

const isTranslatableNode = (node: GraphNode): node is TranslatableNode =>
  "translatedNames" in node && "originalTextVariants" in node;

const getNodeEmbeddingLabel = (node: GraphNode, fallback: string): string =>
  node.type === "fact"
    ? node.statement
    : node.name || node.identifier || fallback;

const mergeTranslatableNodeMetadata = (
  retained: TranslatableNode,
  duplicate: TranslatableNode
): TranslatableNode => {
  const translatedNames = Object.fromEntries(
    [
      ...new Set([
        ...Object.keys(retained.translatedNames ?? {}),
        ...Object.keys(duplicate.translatedNames ?? {}),
      ]),
    ].map((language) => [
      language,
      {
        ...(duplicate.translatedNames?.[language] ?? {}),
        ...(retained.translatedNames?.[language] ?? {}),
      },
    ])
  );

  return {
    ...retained,
    translatedNames,
    originalTextVariants: [
      ...new Set([
        ...(retained.originalTextVariants ?? []),
        ...(duplicate.originalTextVariants ?? []),
      ]),
    ],
  };
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize)
    );
  }

  return btoa(binary);
};

const base64ToArrayBuffer = (value: string): ArrayBuffer => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
};

class GraphRAGStore {
  private db: IDBPDatabase<GraphRAGDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<GraphRAGDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Nodes store
        if (!db.objectStoreNames.contains("nodes")) {
          const nodeStore = db.createObjectStore("nodes", { keyPath: "id" });
          nodeStore.createIndex("by-type", "type");
          nodeStore.createIndex("by-characterId", "data.characterId", {
            unique: false,
          });
        }

        // Edges store
        if (!db.objectStoreNames.contains("edges")) {
          const edgeStore = db.createObjectStore("edges", {
            keyPath: "id",
            autoIncrement: true,
          });
          edgeStore.createIndex("by-source", "sourceId");
          edgeStore.createIndex("by-target", "targetId");
          edgeStore.createIndex("by-type", "type");
          edgeStore.createIndex("by-identifier", "identifier", {
            unique: false,
          });
        }

        // Metadata store (schema/data version, etc.)
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata");
        }

        // Processed stories store (skip re-indexing on future runs)
        if (!db.objectStoreNames.contains("processedStories")) {
          db.createObjectStore("processedStories", { keyPath: "storyTag" });
        }
      },
    });

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
    const db = this.ensureDB();
    let embedding: ArrayBuffer | undefined;

    // Convert Float32Array to ArrayBuffer for storage
    if ("embedding" in node && node.embedding) {
      embedding = node.embedding.slice().buffer;
    }

    await db.put("nodes", {
      id: node.id,
      type: node.type,
      data: node,
      embedding,
    });
  }

  async getNode(id: string): Promise<GraphNode | null> {
    const db = this.ensureDB();
    const record = await db.get("nodes", id);
    if (!record) return null;

    // Convert ArrayBuffer back to Float32Array
    if (record.embedding) {
      const node = record.data as TermNode | EventNode;
      node.embedding = new Float32Array(record.embedding);
    }

    return record.data;
  }

  async getNodesByType(type: NodeType): Promise<GraphNode[]> {
    const db = this.ensureDB();
    const records = await db.getAllFromIndex("nodes", "by-type", type);
    return records.map((r) => {
      if (r.embedding) {
        const node = r.data as TermNode | EventNode;
        node.embedding = new Float32Array(r.embedding);
      }
      return r.data;
    });
  }

  async getCharacterByGameId(
    characterId: number
  ): Promise<CharacterNode | null> {
    const db = this.ensureDB();
    const records = await db.getAllFromIndex(
      "nodes",
      "by-characterId",
      characterId
    );
    if (records.length === 0) return null;
    return records[0].data as CharacterNode;
  }

  async getCharacterByName(name: string): Promise<CharacterNode | null> {
    const allCharacters = await this.getNodesByType("character");
    const charNode = allCharacters.find(
      (n) => (n as CharacterNode).name === name
    );
    return charNode ? (charNode as CharacterNode) : null;
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
    if (retainedNodeId === duplicateNodeId) {
      throw new Error("Choose two different nodes to merge.");
    }

    const db = this.ensureDB();
    const transaction = db.transaction(["nodes", "edges"], "readwrite");
    const nodeStore = transaction.objectStore("nodes");
    const edgeStore = transaction.objectStore("edges");
    const [retainedRecord, duplicateRecord, edgeRecords] = await Promise.all([
      nodeStore.get(retainedNodeId),
      nodeStore.get(duplicateNodeId),
      edgeStore.getAll(),
    ]);

    if (!retainedRecord || !duplicateRecord) {
      throw new Error("Both nodes must exist before they can be merged.");
    }
    if (retainedRecord.type !== duplicateRecord.type) {
      throw new Error("Only nodes of the same type can be merged.");
    }

    const retainedNode = retainedRecord.data;
    const duplicateNode = duplicateRecord.data;
    const mergedRetainedNode =
      isTranslatableNode(retainedNode) && isTranslatableNode(duplicateNode)
        ? mergeTranslatableNodeMetadata(retainedNode, duplicateNode)
        : retainedNode;

    const mergedEdges = new Map<number, GraphRAGDB["edges"]["value"]>();
    const edgeIdsByIdentity = new Map<string, number>();
    let rewiredEdges = 0;
    let removedEdges = 0;

    for (const edge of edgeRecords) {
      const sourceId =
        edge.sourceId === duplicateNodeId ? retainedNodeId : edge.sourceId;
      const targetId =
        edge.targetId === duplicateNodeId ? retainedNodeId : edge.targetId;
      const wasRewired =
        sourceId !== edge.sourceId || targetId !== edge.targetId;

      // The direct link between the merged records would become a self-edge.
      if (sourceId === targetId) {
        removedEdges++;
        continue;
      }

      const rewiredEdge = wasRewired ? { ...edge, sourceId, targetId } : edge;
      if (wasRewired) rewiredEdges++;

      const identity = `${sourceId}\u0000${targetId}\u0000${rewiredEdge.type}\u0000${rewiredEdge.identifier}`;
      const existingId = edgeIdsByIdentity.get(identity);
      if (existingId === undefined) {
        mergedEdges.set(rewiredEdge.id!, rewiredEdge);
        edgeIdsByIdentity.set(identity, rewiredEdge.id!);
        continue;
      }

      const existing = mergedEdges.get(existingId)!;
      existing.episodeTags = [
        ...new Set([...existing.episodeTags, ...rewiredEdge.episodeTags]),
      ];
      if (!existing.context && rewiredEdge.context) {
        existing.context = rewiredEdge.context;
      }
      removedEdges++;
    }

    await edgeStore.clear();
    for (const edge of mergedEdges.values()) {
      await edgeStore.put(edge);
    }
    await nodeStore.put({
      ...retainedRecord,
      data: mergedRetainedNode,
    });
    await nodeStore.delete(duplicateNodeId);
    await transaction.done;

    return {
      retainedNodeId,
      removedNodeId: duplicateNodeId,
      rewiredEdges,
      removedEdges,
    };
  }

  async getAllEvents(): Promise<EventNode[]> {
    const nodes = await this.getNodesByType("event");
    return nodes as EventNode[];
  }

  async getAllTerms(): Promise<TermNode[]> {
    const nodes = await this.getNodesByType("term");
    return nodes as TermNode[];
  }

  /**
   * Return the graph visualization totals. Fact nodes and FACT edges are
   * intentionally omitted because the viewer shows facts in details only.
   */
  async getVisualizationStats(): Promise<{ nodes: number; edges: number }> {
    const [characters, groups, events, terms, edges] = await Promise.all([
      this.getNodesByType("character"),
      this.getNodesByType("group"),
      this.getNodesByType("event"),
      this.getNodesByType("term"),
      this.getAllEdges(),
    ]);

    return {
      nodes: characters.length + groups.length + events.length + terms.length,
      edges: edges.filter((edge) => edge.type !== "FACT").length,
    };
  }

  /**
   * Export all graph data, including cached embeddings and processed-story
   * markers, as a portable JSON-safe archive.
   */
  async exportGraph(): Promise<GraphRAGExport> {
    const db = this.ensureDB();
    const [nodeRecords, edgeRecords, processedStories] = await Promise.all([
      db.getAll("nodes"),
      db.getAll("edges"),
      db.getAll("processedStories"),
    ]);

    return {
      format: GRAPH_EXPORT_FORMAT,
      version: GRAPH_EXPORT_VERSION,
      dataVersion: GRAPH_DATA_VERSION,
      exportedAt: new Date().toISOString(),
      nodes: nodeRecords.map(({ id, type, data, embedding }) => {
        const { embedding: _nodeEmbedding, ...nodeData } = data as GraphNode & {
          embedding?: Float32Array;
        };
        return {
          id,
          type,
          data: nodeData as GraphNode,
          ...(embedding ? { embedding: arrayBufferToBase64(embedding) } : {}),
        };
      }),
      edges: edgeRecords.map(({ embedding, ...edge }) => ({
        ...edge,
        ...(embedding ? { embedding: arrayBufferToBase64(embedding) } : {}),
      })),
      processedStories,
    };
  }

  /**
   * Replace the current graph with a previously exported archive. The archive
   * must match the current graph schema so imported records remain compatible.
   */
  async importGraph(archive: unknown): Promise<void> {
    if (!archive || typeof archive !== "object") {
      throw new Error("The selected file is not a graph archive.");
    }

    const data = archive as Partial<GraphRAGExport>;
    if (
      data.format !== GRAPH_EXPORT_FORMAT ||
      data.version !== GRAPH_EXPORT_VERSION ||
      data.dataVersion !== GRAPH_DATA_VERSION ||
      !Array.isArray(data.nodes) ||
      !Array.isArray(data.edges) ||
      !Array.isArray(data.processedStories)
    ) {
      throw new Error("The graph archive is incompatible with this version.");
    }

    for (const node of data.nodes) {
      if (!node || typeof node.id !== "string" || !node.data || !node.type) {
        throw new Error("The graph archive contains an invalid node.");
      }
    }
    for (const edge of data.edges) {
      if (
        !edge ||
        typeof edge.identifier !== "string" ||
        typeof edge.sourceId !== "string" ||
        typeof edge.targetId !== "string" ||
        !Array.isArray(edge.episodeTags)
      ) {
        throw new Error("The graph archive contains an invalid edge.");
      }
    }
    for (const story of data.processedStories) {
      if (
        !story ||
        typeof story.storyTag !== "string" ||
        typeof story.indexedAt !== "number"
      ) {
        throw new Error(
          "The graph archive contains an invalid processed story."
        );
      }
    }

    // Decode binary fields before clearing the current graph. Invalid base64
    // then fails validation without modifying IndexedDB.
    let nodeRecords: Array<GraphRAGDB["nodes"]["value"]>;
    let edgeRecords: Array<GraphRAGDB["edges"]["value"]>;
    try {
      nodeRecords = data.nodes.map(({ embedding, ...record }) => ({
        ...record,
        embedding: embedding ? base64ToArrayBuffer(embedding) : undefined,
      })) as Array<GraphRAGDB["nodes"]["value"]>;
      edgeRecords = data.edges.map(({ embedding, ...record }) => ({
        ...record,
        embedding: embedding ? base64ToArrayBuffer(embedding) : undefined,
      })) as Array<GraphRAGDB["edges"]["value"]>;
    } catch {
      throw new Error("The graph archive contains an invalid embedding.");
    }

    const db = this.ensureDB();
    const transaction = db.transaction(
      ["nodes", "edges", "processedStories", "metadata"],
      "readwrite"
    );
    const nodeStore = transaction.objectStore("nodes");
    const edgeStore = transaction.objectStore("edges");
    const processedStoryStore = transaction.objectStore("processedStories");

    await Promise.all([
      nodeStore.clear(),
      edgeStore.clear(),
      processedStoryStore.clear(),
    ]);

    for (const node of nodeRecords) {
      await nodeStore.put(node);
    }
    for (const edge of edgeRecords) {
      await edgeStore.put(edge);
    }
    for (const story of data.processedStories) {
      await processedStoryStore.put(story);
    }
    await transaction
      .objectStore("metadata")
      .put(GRAPH_DATA_VERSION, DATA_VERSION_KEY);
    await transaction.done;
  }

  // ===== EDGE OPERATIONS =====

  /**
   * Build the rich text used to embed an edge for similarity ranking:
   * source entity name, edge type, target entity details (name/description/
   * gender as applicable), and the edge's free-text context.
   */
  async buildEdgeEmbeddingText(edge: GraphEdge): Promise<string> {
    const sourceNode = await this.getNode(edge.sourceId);
    const sourceText = sourceNode
      ? getNodeEmbeddingLabel(sourceNode, edge.sourceId)
      : edge.sourceId;

    const targetNode = await this.getNode(edge.targetId);
    let targetText = "";
    if (targetNode) {
      if (targetNode.type === "character") {
        const char = targetNode as CharacterNode;
        targetText = `${char.name} (${char.gender})`;
      } else if (targetNode.type === "group") {
        const group = targetNode as GroupNode;
        targetText = group.name;
      } else if (targetNode.type === "event") {
        const event = targetNode as EventNode;
        targetText = `${event.name}: ${event.description}`;
      } else if (targetNode.type === "term") {
        const term = targetNode as TermNode;
        targetText = `${term.name}: ${term.description}`;
      } else if (targetNode.type === "fact") {
        const fact = targetNode as FactNode;
        targetText = `${fact.statement}`;
        if (fact.description) {
          targetText += ` - ${fact.description}`;
        }
      }
    } else {
      targetText = edge.targetId;
    }

    return `${sourceText} ${edge.type} ${targetText} ${edge.context || ""}`.trim();
  }

  /**
   * Store an edge. If no embedding is supplied, one is computed from the
   * edge's source/target/context at write time (story indexing, which
   * happens once) rather than on every retrieval call (which happens on
   * every translation request), so retrieval only ever reads a cached
   * vector instead of recomputing it.
   */
  async putEdge(edge: GraphEdge, embedding?: Float32Array): Promise<number> {
    const db = this.ensureDB();

    let embeddingToStore = embedding;
    if (!embeddingToStore) {
      try {
        const edgeText = await this.buildEdgeEmbeddingText(edge);
        embeddingToStore = await embeddingService.embed(edgeText);
      } catch (error) {
        console.warn("Failed to compute edge embedding:", error);
      }
    }

    let embeddingBuffer: ArrayBuffer | undefined;
    if (embeddingToStore) {
      embeddingBuffer = embeddingToStore.slice().buffer;
    }

    const edgeRecord: GraphRAGDB["edges"]["value"] = {
      ...edge,
      embedding: embeddingBuffer,
    };

    return (await db.put("edges", edgeRecord)) as number;
  }

  async getEdge(id: number): Promise<GraphEdge | null> {
    const db = this.ensureDB();
    const record = await db.get("edges", id);
    if (!record) return null;

    // Remove embedding from the returned edge (it's stored separately)
    const { embedding: _embedding, ...edge } = record;
    return edge as GraphEdge;
  }

  async getEdgesBySource(sourceId: string): Promise<GraphEdge[]> {
    const db = this.ensureDB();
    const records = await db.getAllFromIndex("edges", "by-source", sourceId);
    return records.map(
      ({ embedding: _embedding, ...edge }) => edge as GraphEdge
    );
  }

  async getEdgesByTarget(targetId: string): Promise<GraphEdge[]> {
    const db = this.ensureDB();
    const records = await db.getAllFromIndex("edges", "by-target", targetId);
    return records.map(
      ({ embedding: _embedding, ...edge }) => edge as GraphEdge
    );
  }

  async getEdgesByType(type: EdgeType): Promise<GraphEdge[]> {
    const db = this.ensureDB();
    const records = await db.getAllFromIndex("edges", "by-type", type);
    return records.map(
      ({ embedding: _embedding, ...edge }) => edge as GraphEdge
    );
  }

  async getAllEdges(): Promise<GraphEdge[]> {
    const db = this.ensureDB();
    const records = await db.getAll("edges");
    return records.map(
      ({ embedding: _embedding, ...edge }) => edge as GraphEdge
    );
  }

  async getEdgeByIdentifier(identifier: string): Promise<GraphEdge | null> {
    const db = this.ensureDB();
    const records = await db.getAllFromIndex(
      "edges",
      "by-identifier",
      identifier
    );
    if (records.length === 0) return null;
    const { embedding: _embedding, ...edge } = records[0];
    return edge as GraphEdge;
  }

  /**
   * Get edge with its embedding for similarity ranking
   */
  async getEdgeWithEmbedding(
    id: number
  ): Promise<{ edge: GraphEdge; embedding?: Float32Array } | null> {
    const db = this.ensureDB();
    const record = await db.get("edges", id);
    if (!record) return null;

    const { embedding: embeddingBuffer, ...edge } = record;
    return {
      edge: edge as GraphEdge,
      embedding: embeddingBuffer
        ? new Float32Array(embeddingBuffer)
        : undefined,
    };
  }

  /**
   * Find an edge matching source, target, and type
   */
  async findEdge(
    sourceId: string,
    targetId: string,
    type: EdgeType
  ): Promise<GraphEdge | null> {
    const edges = await this.getEdgesBySource(sourceId);
    return (
      edges.find((e) => e.targetId === targetId && e.type === type) || null
    );
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

  /**
   * Update an edge's non-embedding fields (e.g. appended episodeTags)
   * without recomputing or touching its stored embedding.
   */
  private async putEdgePreservingEmbedding(edge: GraphEdge): Promise<void> {
    const db = this.ensureDB();
    const existingRecord =
      edge.id !== undefined ? await db.get("edges", edge.id) : undefined;

    const edgeRecord: GraphRAGDB["edges"]["value"] = {
      ...edge,
      embedding: existingRecord?.embedding,
    };

    await db.put("edges", edgeRecord);
  }

  // ===== PROCESSED STORY TRACKING =====

  /**
   * Mark a story (identified by its storyTag) as fully indexed, so future
   * indexing runs can skip it outright instead of re-extracting.
   */
  async markStoryProcessed(storyTag: string): Promise<void> {
    const db = this.ensureDB();
    await db.put("processedStories", { storyTag, indexedAt: Date.now() });
  }

  /**
   * Whether a story has already been indexed in a prior run.
   */
  async isStoryProcessed(storyTag: string): Promise<boolean> {
    const db = this.ensureDB();
    const record = await db.get("processedStories", storyTag);
    return record !== undefined;
  }

  // ===== UTILITY =====

  async clear(): Promise<void> {
    const db = this.ensureDB();
    await db.clear("nodes");
    await db.clear("edges");
    await db.clear("processedStories");
  }

  /**
   * Clear all embeddings from nodes and edges (when model changes)
   * Keeps the graph structure intact
   */
  async clearEmbeddings(): Promise<void> {
    const db = this.ensureDB();

    // Clear node embeddings
    const tx1 = db.transaction("nodes", "readwrite");
    const nodeStore = tx1.objectStore("nodes");
    const allNodes = await nodeStore.getAll();

    for (const record of allNodes) {
      if (record.embedding) {
        record.embedding = undefined;
        await nodeStore.put(record);
      }
    }
    await tx1.done;

    // Clear edge embeddings
    const tx2 = db.transaction("edges", "readwrite");
    const edgeStore = tx2.objectStore("edges");
    const allEdges = await edgeStore.getAll();

    for (const record of allEdges) {
      if (record.embedding) {
        delete record.embedding;
        await edgeStore.put(record);
      }
    }
    await tx2.done;
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

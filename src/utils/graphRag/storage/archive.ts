import { IDBPDatabase } from "idb";
import { GraphEdge, GraphNode, NodeType } from "../types";
import { DATA_VERSION_KEY, GRAPH_DATA_VERSION, GraphRAGDB } from "./db";
import { arrayBufferToBase64, base64ToArrayBuffer } from "./codecs";

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

export async function exportGraph(
  db: IDBPDatabase<GraphRAGDB>
): Promise<GraphRAGExport> {
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

export async function importGraph(
  db: IDBPDatabase<GraphRAGDB>,
  archive: unknown
): Promise<void> {
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
      throw new Error("The graph archive contains an invalid processed story.");
    }
  }

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
  for (const node of nodeRecords) await nodeStore.put(node);
  for (const edge of edgeRecords) await edgeStore.put(edge);
  for (const story of data.processedStories)
    await processedStoryStore.put(story);
  await transaction
    .objectStore("metadata")
    .put(GRAPH_DATA_VERSION, DATA_VERSION_KEY);
  await transaction.done;
}

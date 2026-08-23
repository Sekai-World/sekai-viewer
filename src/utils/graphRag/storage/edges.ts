import { IDBPDatabase } from "idb";
import {
  CharacterNode,
  EdgeType,
  EventNode,
  FactNode,
  GraphEdge,
  GroupNode,
  TermNode,
} from "../types";
import { embeddingService } from "../embeddings";
import { GraphRAGDB } from "./db";
import { getNode, getNodeEmbeddingLabel } from "./nodes";

const withoutEmbedding = (record: GraphRAGDB["edges"]["value"]): GraphEdge => {
  const { embedding: _embedding, ...edge } = record;
  return edge as GraphEdge;
};

export async function buildEdgeEmbeddingText(
  db: IDBPDatabase<GraphRAGDB>,
  edge: GraphEdge
): Promise<string> {
  const sourceNode = await getNode(db, edge.sourceId);
  const sourceText = sourceNode
    ? getNodeEmbeddingLabel(sourceNode, edge.sourceId)
    : edge.sourceId;

  const targetNode = await getNode(db, edge.targetId);
  let targetText = "";
  if (targetNode) {
    if (targetNode.type === "character") {
      const char = targetNode as CharacterNode;
      targetText = `${char.name} (${char.gender})`;
    } else if (targetNode.type === "group") {
      targetText = (targetNode as GroupNode).name;
    } else if (targetNode.type === "event") {
      const event = targetNode as EventNode;
      targetText = `${event.name}: ${event.description}`;
    } else if (targetNode.type === "term") {
      const term = targetNode as TermNode;
      targetText = `${term.name}: ${term.description}`;
    } else if (targetNode.type === "fact") {
      const fact = targetNode as FactNode;
      targetText = fact.statement;
      if (fact.description) targetText += ` - ${fact.description}`;
    }
  } else {
    targetText = edge.targetId;
  }

  return `${sourceText} ${edge.type} ${targetText} ${edge.context || ""}`.trim();
}

export async function putEdge(
  db: IDBPDatabase<GraphRAGDB>,
  edge: GraphEdge,
  embedding?: Float32Array
): Promise<number> {
  let embeddingToStore = embedding;
  if (!embeddingToStore) {
    try {
      embeddingToStore = await embeddingService.embed(
        await buildEdgeEmbeddingText(db, edge)
      );
    } catch (error) {
      console.warn("Failed to compute edge embedding:", error);
    }
  }

  const embeddingBuffer = embeddingToStore
    ? embeddingToStore.slice().buffer
    : undefined;
  const { embedding: _edgeEmbedding, ...edgeData } = edge;
  const record = {
    ...edgeData,
    embedding: embeddingBuffer,
  } as GraphRAGDB["edges"]["value"];
  return (await db.put("edges", record)) as number;
}

export async function getEdge(
  db: IDBPDatabase<GraphRAGDB>,
  id: number
): Promise<GraphEdge | null> {
  const record = await db.get("edges", id);
  return record ? withoutEmbedding(record) : null;
}

export async function getEdgesBySource(
  db: IDBPDatabase<GraphRAGDB>,
  sourceId: string
) {
  const records = await db.getAllFromIndex("edges", "by-source", sourceId);
  return records.map(withoutEmbedding);
}

export async function getEdgesByTarget(
  db: IDBPDatabase<GraphRAGDB>,
  targetId: string
) {
  const records = await db.getAllFromIndex("edges", "by-target", targetId);
  return records.map(withoutEmbedding);
}

export async function getEdgesByType(
  db: IDBPDatabase<GraphRAGDB>,
  type: EdgeType
) {
  const records = await db.getAllFromIndex("edges", "by-type", type);
  return records.map(withoutEmbedding);
}

export async function getAllEdges(
  db: IDBPDatabase<GraphRAGDB>
): Promise<GraphEdge[]> {
  const records = await db.getAll("edges");
  return records.map(withoutEmbedding);
}

export async function getEdgeByIdentifier(
  db: IDBPDatabase<GraphRAGDB>,
  identifier: string
) {
  const records = await db.getAllFromIndex(
    "edges",
    "by-identifier",
    identifier
  );
  return records.length ? withoutEmbedding(records[0]) : null;
}

export async function getEdgeWithEmbedding(
  db: IDBPDatabase<GraphRAGDB>,
  id: number
): Promise<{ edge: GraphEdge; embedding?: Float32Array } | null> {
  const record = await db.get("edges", id);
  if (!record) return null;
  const { embedding, ...edge } = record;
  return {
    edge: edge as GraphEdge,
    embedding: embedding ? new Float32Array(embedding) : undefined,
  };
}

export async function findEdge(
  db: IDBPDatabase<GraphRAGDB>,
  sourceId: string,
  targetId: string,
  type: EdgeType
): Promise<GraphEdge | null> {
  const edges = await getEdgesBySource(db, sourceId);
  return (
    edges.find((edge) => edge.targetId === targetId && edge.type === type) ||
    null
  );
}

async function putEdgePreservingEmbedding(
  db: IDBPDatabase<GraphRAGDB>,
  edge: GraphEdge
): Promise<void> {
  const existingRecord =
    edge.id !== undefined ? await db.get("edges", edge.id) : undefined;
  const { embedding: _edgeEmbedding, ...edgeData } = edge;
  await db.put("edges", {
    ...edgeData,
    embedding: existingRecord?.embedding,
  } as GraphRAGDB["edges"]["value"]);
}

export async function upsertEdge(
  db: IDBPDatabase<GraphRAGDB>,
  sourceId: string,
  targetId: string,
  type: EdgeType,
  episodeTag: string,
  context: string | undefined,
  identifier: string
): Promise<void> {
  const existing = await getEdgeByIdentifier(db, identifier);

  if (
    existing &&
    (existing.sourceId !== sourceId ||
      existing.targetId !== targetId ||
      existing.type !== type)
  ) {
    console.warn(
      `⚠️  Edge identifier conflict: "${identifier}" exists but points to different nodes (${existing.sourceId} -> ${existing.targetId} [${existing.type}] vs ${sourceId} -> ${targetId} [${type}]). Updating to new nodes.`
    );
    existing.sourceId = sourceId;
    existing.targetId = targetId;
    existing.type = type;
  }

  if (!existing) {
    await putEdge(db, {
      identifier,
      sourceId,
      targetId,
      type,
      episodeTags: [episodeTag],
      context: context || "",
    });
    return;
  }

  const contextChanged = Boolean(context) && context !== existing.context;
  if (!existing.episodeTags.includes(episodeTag))
    existing.episodeTags.push(episodeTag);
  if (context) existing.context = context;

  if (contextChanged) await putEdge(db, existing);
  else await putEdgePreservingEmbedding(db, existing);
}

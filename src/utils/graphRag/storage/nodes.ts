import { IDBPDatabase } from "idb";
import {
  CharacterNode,
  EventNode,
  GraphNode,
  TermNode,
  GroupNode,
} from "../types";
import { GraphRAGDB } from "./db";

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

const hydrateNode = (record: GraphRAGDB["nodes"]["value"]): GraphNode => {
  if (record.embedding) {
    const node = record.data as TermNode | EventNode;
    node.embedding = new Float32Array(record.embedding);
  }
  return record.data;
};

export async function putNode(
  db: IDBPDatabase<GraphRAGDB>,
  node: GraphNode
): Promise<void> {
  let embedding: ArrayBuffer | undefined;
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

export async function getNode(
  db: IDBPDatabase<GraphRAGDB>,
  id: string
): Promise<GraphNode | null> {
  const record = await db.get("nodes", id);
  return record ? hydrateNode(record) : null;
}

export async function getNodesByType(
  db: IDBPDatabase<GraphRAGDB>,
  type: GraphNode["type"]
): Promise<GraphNode[]> {
  const records = await db.getAllFromIndex("nodes", "by-type", type);
  return records.map(hydrateNode);
}

export async function getCharacterByGameId(
  db: IDBPDatabase<GraphRAGDB>,
  characterId: number
): Promise<CharacterNode | null> {
  const records = await db.getAllFromIndex(
    "nodes",
    "by-characterId",
    characterId
  );
  return records.length ? (records[0].data as CharacterNode) : null;
}

export async function getCharacterByName(
  db: IDBPDatabase<GraphRAGDB>,
  name: string
): Promise<CharacterNode | null> {
  const characters = await getNodesByType(db, "character");
  const node = characters.find(
    (candidate) => (candidate as CharacterNode).name === name
  );
  return (node as CharacterNode | undefined) ?? null;
}

export async function mergeNodes(
  db: IDBPDatabase<GraphRAGDB>,
  retainedNodeId: string,
  duplicateNodeId: string
): Promise<MergeNodesResult> {
  if (retainedNodeId === duplicateNodeId) {
    throw new Error("Choose two different nodes to merge.");
  }

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
    "translatedNames" in retainedNode &&
    "originalTextVariants" in retainedNode &&
    "translatedNames" in duplicateNode &&
    "originalTextVariants" in duplicateNode
      ? mergeTranslatableNodeMetadata(
          retainedNode as TranslatableNode,
          duplicateNode as TranslatableNode
        )
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
    const wasRewired = sourceId !== edge.sourceId || targetId !== edge.targetId;
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
    if (!existing.context && rewiredEdge.context)
      existing.context = rewiredEdge.context;
    removedEdges++;
  }

  await edgeStore.clear();
  for (const edge of mergedEdges.values()) await edgeStore.put(edge);
  await nodeStore.put({ ...retainedRecord, data: mergedRetainedNode });
  await nodeStore.delete(duplicateNodeId);
  await transaction.done;

  return {
    retainedNodeId,
    removedNodeId: duplicateNodeId,
    rewiredEdges,
    removedEdges,
  };
}

export async function getAllEvents(
  db: IDBPDatabase<GraphRAGDB>
): Promise<EventNode[]> {
  return (await getNodesByType(db, "event")) as EventNode[];
}

export async function getAllTerms(
  db: IDBPDatabase<GraphRAGDB>
): Promise<TermNode[]> {
  return (await getNodesByType(db, "term")) as TermNode[];
}

export function getNodeEmbeddingLabel(
  node: GraphNode,
  fallback: string
): string {
  return node.type === "fact"
    ? node.statement
    : (node as CharacterNode | GroupNode | EventNode | TermNode).name ||
        (node as CharacterNode | GroupNode | EventNode | TermNode).identifier ||
        fallback;
}

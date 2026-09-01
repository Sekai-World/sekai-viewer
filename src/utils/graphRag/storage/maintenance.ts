import { IDBPDatabase } from "idb";
import { GraphRAGDB } from "./db";
import { getNodesByType } from "./nodes";
import { getAllEdges } from "./edges";

export async function getVisualizationStats(db: IDBPDatabase<GraphRAGDB>) {
  const [characters, groups, events, terms, edges] = await Promise.all([
    getNodesByType(db, "character"),
    getNodesByType(db, "group"),
    getNodesByType(db, "event"),
    getNodesByType(db, "term"),
    getAllEdges(db),
  ]);
  return {
    nodes: characters.length + groups.length + events.length + terms.length,
    edges: edges.filter((edge) => edge.type !== "FACT").length,
  };
}

export async function markStoryProcessed(
  db: IDBPDatabase<GraphRAGDB>,
  storyTag: string
): Promise<void> {
  await db.put("processedStories", { storyTag, indexedAt: Date.now() });
}

export async function isStoryProcessed(
  db: IDBPDatabase<GraphRAGDB>,
  storyTag: string
): Promise<boolean> {
  return (await db.get("processedStories", storyTag)) !== undefined;
}

export async function clear(db: IDBPDatabase<GraphRAGDB>): Promise<void> {
  await db.clear("nodes");
  await db.clear("edges");
  await db.clear("processedStories");
}

export async function clearEmbeddings(
  db: IDBPDatabase<GraphRAGDB>
): Promise<void> {
  const nodeTransaction = db.transaction("nodes", "readwrite");
  const nodeStore = nodeTransaction.objectStore("nodes");
  for (const record of await nodeStore.getAll()) {
    if (record.embedding) {
      record.embedding = undefined;
      await nodeStore.put(record);
    }
  }
  await nodeTransaction.done;

  const edgeTransaction = db.transaction("edges", "readwrite");
  const edgeStore = edgeTransaction.objectStore("edges");
  for (const record of await edgeStore.getAll()) {
    if (record.embedding) {
      delete record.embedding;
      await edgeStore.put(record);
    }
  }
  await edgeTransaction.done;
}

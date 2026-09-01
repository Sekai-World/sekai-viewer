import { DBSchema, IDBPDatabase, openDB } from "idb";
import { EdgeType, GraphEdge, GraphNode, NodeType } from "../types";

export interface GraphRAGDB extends DBSchema {
  nodes: {
    key: string;
    value: {
      id: string;
      type: NodeType;
      data: GraphNode;
      embedding?: ArrayBuffer;
    };
    indexes: { "by-type": NodeType; "by-characterId": number };
  };
  edges: {
    key: number;
    value: GraphEdge & { embedding?: ArrayBuffer };
    indexes: {
      "by-source": string;
      "by-target": string;
      "by-type": EdgeType;
      "by-identifier": string;
    };
  };
  metadata: { key: string; value: unknown };
  processedStories: {
    key: string;
    value: { storyTag: string; indexedAt: number };
  };
}

export const GRAPH_DATA_VERSION = 1;
export const DATA_VERSION_KEY = "dataVersion";

const DB_NAME = "sekai-graph-rag";
const DB_VERSION = 1;

export const openGraphRAGDB = (): Promise<IDBPDatabase<GraphRAGDB>> =>
  openDB<GraphRAGDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("nodes")) {
        const nodeStore = db.createObjectStore("nodes", { keyPath: "id" });
        nodeStore.createIndex("by-type", "type");
        nodeStore.createIndex("by-characterId", "data.characterId", {
          unique: false,
        });
      }

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

      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata");
      }

      if (!db.objectStoreNames.contains("processedStories")) {
        db.createObjectStore("processedStories", { keyPath: "storyTag" });
      }
    },
  });

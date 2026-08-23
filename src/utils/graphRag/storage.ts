/**
 * Public Graph RAG storage facade.
 *
 * Keep this module stable: feature code imports the singleton and archive
 * types from here, while the implementation lives under ./storage.
 */

export { graphRAGStore } from "./storage/store";

export type { GraphRAGExport, MergeNodesResult } from "./storage/store";

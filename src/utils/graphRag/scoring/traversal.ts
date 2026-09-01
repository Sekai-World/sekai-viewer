import type { MultiDirectedGraph } from "graphology";
import type { GraphEdge, GraphNode, NodeType } from "../types";

export interface TraversalNeighbor<Edge = undefined> {
  nodeId: string;
  edge?: Edge;
}

export interface TraversalResult<Edge = undefined> {
  nodeId: string;
  seedId: string;
  depth: number;
  parentId?: string;
  path: string[];
  edges: Edge[];
}

export interface TraversalPolicy {
  terminalTypes?: ReadonlySet<NodeType>;
}

const DEFAULT_TERMINAL_TYPES: ReadonlySet<NodeType> = new Set([
  "character",
  "group",
]);

const shouldExpand = (
  nodeId: string,
  seedIds: ReadonlySet<string>,
  getNodeType: (nodeId: string) => NodeType | undefined,
  terminalTypes: ReadonlySet<NodeType>
): boolean =>
  seedIds.has(nodeId) || !terminalTypes.has(getNodeType(nodeId) as NodeType);

const buildResult = <Edge>(
  seedId: string,
  nodeId: string,
  depth: number,
  parentId: string | undefined,
  parentResults: Map<string, TraversalResult<Edge>>,
  edge: Edge | undefined
): TraversalResult<Edge> => {
  const parent = parentId ? parentResults.get(parentId) : undefined;
  return {
    nodeId,
    seedId,
    depth,
    parentId,
    path: parent ? [...parent.path, nodeId] : [nodeId],
    edges: parent
      ? edge === undefined
        ? [...parent.edges]
        : [...parent.edges, edge]
      : edge === undefined
        ? []
        : [edge],
  };
};

export function traverseBfs<Edge>(
  roots: readonly string[],
  getNeighbors: (nodeId: string) => readonly TraversalNeighbor<Edge>[],
  getNodeType: (nodeId: string) => NodeType | undefined,
  policy: TraversalPolicy = {}
): TraversalResult<Edge>[] {
  const terminalTypes = policy.terminalTypes ?? DEFAULT_TERMINAL_TYPES;
  const results: TraversalResult<Edge>[] = [];
  const seedIds = new Set(roots);

  for (const seedId of roots) {
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; parentId?: string; edge?: Edge }> = [
      { nodeId: seedId },
    ];
    const seedResults = new Map<string, TraversalResult<Edge>>();

    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);
      const parent = current.parentId
        ? seedResults.get(current.parentId)
        : undefined;
      const result = buildResult(
        seedId,
        current.nodeId,
        parent ? parent.depth + 1 : 0,
        current.parentId,
        seedResults,
        current.edge
      );
      seedResults.set(current.nodeId, result);
      results.push(result);

      if (!shouldExpand(current.nodeId, seedIds, getNodeType, terminalTypes)) {
        continue;
      }
      for (const neighbor of getNeighbors(current.nodeId)) {
        if (!visited.has(neighbor.nodeId)) {
          queue.push({
            nodeId: neighbor.nodeId,
            parentId: current.nodeId,
            edge: neighbor.edge,
          });
        }
      }
    }
  }

  return results;
}

export async function traverseBfsAsync<Edge>(
  roots: readonly string[],
  getNeighbors: (nodeId: string) => Promise<readonly TraversalNeighbor<Edge>[]>,
  getNodeType: (nodeId: string) => NodeType | undefined,
  policy: TraversalPolicy = {}
): Promise<TraversalResult<Edge>[]> {
  const terminalTypes = policy.terminalTypes ?? DEFAULT_TERMINAL_TYPES;
  const results: TraversalResult<Edge>[] = [];
  const seedIds = new Set(roots);

  for (const seedId of roots) {
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; parentId?: string; edge?: Edge }> = [
      { nodeId: seedId },
    ];
    const seedResults = new Map<string, TraversalResult<Edge>>();

    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);
      const parent = current.parentId
        ? seedResults.get(current.parentId)
        : undefined;
      const result = buildResult(
        seedId,
        current.nodeId,
        parent ? parent.depth + 1 : 0,
        current.parentId,
        seedResults,
        current.edge
      );
      seedResults.set(current.nodeId, result);
      results.push(result);

      if (!shouldExpand(current.nodeId, seedIds, getNodeType, terminalTypes)) {
        continue;
      }
      for (const neighbor of await getNeighbors(current.nodeId)) {
        if (!visited.has(neighbor.nodeId)) {
          queue.push({
            nodeId: neighbor.nodeId,
            parentId: current.nodeId,
            edge: neighbor.edge,
          });
        }
      }
    }
  }
  return results;
}

export function traverseGraphology(
  graph: MultiDirectedGraph,
  roots: readonly string[],
  allNodes: Map<string, GraphNode>,
  policy?: TraversalPolicy
): TraversalResult<string>[] {
  const adjacency = new Map<string, TraversalNeighbor<string>[]>();
  graph.forEachNode((nodeId) => adjacency.set(nodeId, []));
  graph.forEachEdge((edge, _attributes, source, target) => {
    adjacency.get(source)?.push({ nodeId: target, edge });
    adjacency.get(target)?.push({ nodeId: source, edge });
  });

  return traverseBfs(
    roots.filter((root) => graph.hasNode(root)),
    (nodeId) => adjacency.get(nodeId) ?? [],
    (nodeId) => allNodes.get(nodeId)?.type,
    policy
  );
}

export interface IndexedDbTraversalStore {
  getNode(id: string): Promise<GraphNode | null>;
  getEdgesBySource(sourceId: string): Promise<GraphEdge[]>;
  getEdgesByTarget(targetId: string): Promise<GraphEdge[]>;
}

const edgeKey = (edge: GraphEdge): string =>
  edge.id === undefined
    ? `${edge.sourceId}:${edge.targetId}:${edge.type}:${edge.identifier}`
    : String(edge.id);

export async function traverseIndexedDb(
  store: IndexedDbTraversalStore,
  roots: readonly string[],
  policy?: TraversalPolicy
): Promise<TraversalResult<GraphEdge>[]> {
  const nodeTypes = new Map<string, NodeType>();
  const ensureNodeType = async (nodeId: string): Promise<void> => {
    if (nodeTypes.has(nodeId)) return;
    const node = await store.getNode(nodeId);
    if (node) nodeTypes.set(nodeId, node.type);
  };

  for (const root of roots) await ensureNodeType(root);

  const edgeCache = new Map<string, TraversalNeighbor<GraphEdge>[]>();
  const getNeighbors = async (
    nodeId: string
  ): Promise<TraversalNeighbor<GraphEdge>[]> => {
    const cached = edgeCache.get(nodeId);
    if (cached) return cached;
    const edges = [
      ...(await store.getEdgesBySource(nodeId)),
      ...(await store.getEdgesByTarget(nodeId)),
    ];
    const seen = new Set<string>();
    const neighbors: TraversalNeighbor<GraphEdge>[] = [];
    for (const edge of edges) {
      const key = edgeKey(edge);
      if (seen.has(key)) continue;
      seen.add(key);
      const neighborId =
        edge.sourceId === nodeId ? edge.targetId : edge.sourceId;
      await ensureNodeType(neighborId);
      if (nodeTypes.has(neighborId)) {
        neighbors.push({ nodeId: neighborId, edge });
      }
    }
    edgeCache.set(nodeId, neighbors);
    return neighbors;
  };

  const validRoots = roots.filter((root) => nodeTypes.has(root));
  return traverseBfsAsync(
    validRoots,
    getNeighbors,
    (nodeId) => nodeTypes.get(nodeId),
    policy
  );
}

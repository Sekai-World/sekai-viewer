// Component to load and render the graph
import React, { useEffect, useMemo } from "react";
import { useLoadGraph } from "@react-sigma/core";
import { MultiDirectedGraph } from "graphology";
import { graphRAGStore } from "../../../utils/graphRag/storage";
import { GraphEdge, GraphNode, NodeType } from "../../../utils/graphRag/types";
import { byEpisode, hexToRgb } from "../../../utils/graphRag/helpers";
import { useCachedData } from "../../../utils/index";
import { IGameChara } from "../../../types";
import { charaIcons } from "../../../utils/resources";

const edgePairKey = (edge: GraphEdge): string =>
  [edge.sourceId, edge.targetId]
    .sort((left, right) => left.localeCompare(right))
    .join("::");

const blendColors = (
  source: string,
  target: string,
  amount: number
): string => {
  const [sourceR, sourceG, sourceB] = hexToRgb(source);
  const [targetR, targetG, targetB] = hexToRgb(target);
  const mix = (from: number, to: number) =>
    Math.round(from + (to - from) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${mix(sourceR, targetR)}${mix(sourceG, targetG)}${mix(sourceB, targetB)}`;
};

let allNodesMap: Map<string, GraphNode> = new Map();
let allEdgesArray: GraphEdge[] = [];

const GraphLoader: React.FC<{
  searchQuery: string;
  darkMode: boolean;
  labelColor: string;
  suppressLowImportanceNodes: boolean;
  lowImportanceConnectionLimit: number;
  selectedNodeTypes: Array<Exclude<NodeType, "fact">>;
  graphRevision: number;
  onGraphDataLoaded: (
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[]
  ) => void;
}> = ({
  searchQuery,
  darkMode,
  labelColor,
  suppressLowImportanceNodes,
  lowImportanceConnectionLimit,
  selectedNodeTypes,
  graphRevision,
  onGraphDataLoaded,
}) => {
  const loadGraph = useLoadGraph();
  const [gameCharacters] = useCachedData<IGameChara>("gameCharacters");
  const charaIconsByIdentifier = useMemo(() => {
    const icons = new Map<string, string>();
    for (const chara of gameCharacters ?? []) {
      const identifier =
        chara.givenNameEnglish?.toLowerCase() ?? `character-${chara.id}`;
      const icon = charaIcons[`CharaIcon${chara.id}`];
      if (icon) icons.set(identifier, icon);
    }
    return icons;
  }, [gameCharacters]);

  useEffect(() => {
    const loadData = async () => {
      const graph = new MultiDirectedGraph();

      // Fetch all nodes and edges
      const [
        characterNodes,
        groupNodes,
        eventNodes,
        termNodes,
        factNodes,
        edges,
      ] = await Promise.all([
        graphRAGStore.getNodesByType("character"),
        graphRAGStore.getNodesByType("group"),
        graphRAGStore.getNodesByType("event"),
        graphRAGStore.getNodesByType("term"),
        graphRAGStore.getNodesByType("fact"),
        graphRAGStore.getAllEdges(),
      ]);

      const allNodes = [
        ...characterNodes,
        ...groupNodes,
        ...eventNodes,
        ...termNodes,
        ...factNodes,
      ];

      // Store globally for click handlers
      allNodesMap = new Map(allNodes.map((n) => [n.id, n]));
      const sortedEdges = [...edges].sort(byEpisode);
      allEdgesArray = sortedEdges;

      // Search is name-only. Keep a matching node's immediate neighborhood so
      // its relationships remain visible without rebuilding the full graph.
      const searchLower = searchQuery.trim().toLocaleLowerCase();
      const matchingNodeIds = new Set(
        searchLower
          ? allNodes
              .filter((node) => {
                if (node.type === "fact") return false;
                return node.name.toLocaleLowerCase().includes(searchLower);
              })
              .map((node) => node.id)
          : allNodes.map((node) => node.id)
      );
      const visibleNodeIds = new Set(matchingNodeIds);

      if (searchLower) {
        for (const edge of edges) {
          if (matchingNodeIds.has(edge.sourceId))
            visibleNodeIds.add(edge.targetId);
          if (matchingNodeIds.has(edge.targetId))
            visibleNodeIds.add(edge.sourceId);
        }
      }

      // Facts remain available in the details panel, but they are intentionally
      // omitted from the canvas to keep the relationship map readable.
      let filteredNodes = allNodes.filter(
        (node) =>
          visibleNodeIds.has(node.id) &&
          node.type !== "fact" &&
          (selectedNodeTypes.length === 0 ||
            selectedNodeTypes.includes(node.type))
      );
      const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
      let filteredEdges = sortedEdges.filter(
        (edge) =>
          filteredNodeIds.has(edge.sourceId) &&
          filteredNodeIds.has(edge.targetId) &&
          edge.type !== "FACT" &&
          (!searchLower ||
            matchingNodeIds.has(edge.sourceId) ||
            matchingNodeIds.has(edge.targetId))
      );

      if (suppressLowImportanceNodes) {
        const nodeDegrees = new Map<string, number>();
        for (const edge of filteredEdges) {
          nodeDegrees.set(
            edge.sourceId,
            (nodeDegrees.get(edge.sourceId) ?? 0) + 1
          );
          nodeDegrees.set(
            edge.targetId,
            (nodeDegrees.get(edge.targetId) ?? 0) + 1
          );
        }

        const suppressedNodeIds = new Set(
          filteredNodes
            .filter((node) => {
              const isCoreNode =
                node.type === "character" || node.type === "group";
              const isSearchMatch =
                Boolean(searchLower) && matchingNodeIds.has(node.id);
              return (
                (nodeDegrees.get(node.id) ?? 0) <=
                  lowImportanceConnectionLimit &&
                !isCoreNode &&
                !isSearchMatch
              );
            })
            .map((node) => node.id)
        );

        filteredNodes = filteredNodes.filter(
          (node) => !suppressedNodeIds.has(node.id)
        );
        filteredEdges = filteredEdges.filter(
          (edge) =>
            !suppressedNodeIds.has(edge.sourceId) &&
            !suppressedNodeIds.has(edge.targetId)
        );
      }

      // Add nodes to graphology ??each character is the center of its own cluster,
      // characters with more shared relations are placed closer together.
      // A deterministic force layout over every visible node. Relationship
      // springs preserve natural clusters; all-node repulsion and a collision
      // floor keep the result readable without putting it on a grid.
      const positions = new Map<string, { x: number; y: number }>();
      const velocities = new Map<string, { x: number; y: number }>();
      const layoutNodes = [...filteredNodes].sort((a, b) =>
        a.id.localeCompare(b.id)
      );
      const connectedNodeIds = new Set<string>();
      const nodeDegrees = new Map<string, number>();
      for (const edge of filteredEdges) {
        connectedNodeIds.add(edge.sourceId);
        connectedNodeIds.add(edge.targetId);
        nodeDegrees.set(
          edge.sourceId,
          (nodeDegrees.get(edge.sourceId) ?? 0) + 1
        );
        nodeDegrees.set(
          edge.targetId,
          (nodeDegrees.get(edge.targetId) ?? 0) + 1
        );
      }
      const layoutScale = Math.max(400, Math.sqrt(layoutNodes.length) * 95);
      const positionForIndex = (index: number): { x: number; y: number } => {
        const angle = index * 2.399963229728653;
        const node = layoutNodes[index];
        const isIsolated = !connectedNodeIds.has(node.id);
        const radius =
          Math.sqrt(index + 1) * layoutScale * (isIsolated ? 0.08 : 0.22);
        return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
      };

      layoutNodes.forEach((node, index) => {
        positions.set(node.id, positionForIndex(index));
        velocities.set(node.id, { x: 0, y: 0 });
      });

      const edgeWeight = (edge: GraphEdge): number => {
        if (edge.type === "CHARACTER_RELATION") return 8;
        if (edge.type === "MEMBER_OF") return 6;
        if (edge.type === "INVOLVE") return 5;
        if (edge.type === "RELATED") return 4;
        return 3;
      };
      const semanticTargets = new Map<string, string[]>();
      for (const edge of filteredEdges) {
        const source = allNodesMap.get(edge.sourceId);
        const target = allNodesMap.get(edge.targetId);
        if (!source || !target) continue;
        const isSemanticEdge =
          (source.type === "group" && edge.type === "MEMBER_OF") ||
          (source.type === "event" && edge.type === "INVOLVE") ||
          (source.type === "term" && edge.type === "RELATED");
        if (isSemanticEdge) {
          const targets = semanticTargets.get(source.id) ?? [];
          targets.push(target.id);
          semanticTargets.set(source.id, targets);
        }
        // Facts are centered on their owning entity, regardless of edge orientation.
        if (
          target.type === "fact" &&
          source.type !== "fact" &&
          edge.type === "FACT"
        ) {
          semanticTargets.set(target.id, [source.id]);
        }
        if (
          source.type === "fact" &&
          target.type !== "fact" &&
          edge.type === "FACT"
        ) {
          semanticTargets.set(source.id, [target.id]);
        }
        // Extraction can store group/event/term edges in either direction.
        const isReverseSemanticEdge =
          (target.type === "group" && edge.type === "MEMBER_OF") ||
          (target.type === "event" && edge.type === "INVOLVE") ||
          (target.type === "term" && edge.type === "RELATED");
        if (isReverseSemanticEdge) {
          const targets = semanticTargets.get(target.id) ?? [];
          targets.push(source.id);
          semanticTargets.set(target.id, targets);
        }
      }
      const edgeLength = (edge: GraphEdge): number => {
        if (edge.type === "CHARACTER_RELATION") return 150;
        if (edge.type === "MEMBER_OF") return 210;
        if (edge.type === "INVOLVE") return 230;
        if (edge.type === "RELATED") return 250;
        return 180;
      };
      const MINIMUM_DISTANCE = 68;
      const REPULSION = 21000;
      const DAMPING = 0.76;
      const MAX_STEP = 24;
      for (let iteration = 0; iteration < 260; iteration++) {
        const forces = new Map<string, { x: number; y: number }>();
        for (const node of layoutNodes) forces.set(node.id, { x: 0, y: 0 });

        for (let i = 0; i < layoutNodes.length; i++) {
          for (let j = i + 1; j < layoutNodes.length; j++) {
            const nodeA = layoutNodes[i];
            const nodeB = layoutNodes[j];
            const positionA = positions.get(nodeA.id)!;
            const positionB = positions.get(nodeB.id)!;
            let dx = positionB.x - positionA.x;
            let dy = positionB.y - positionA.y;
            let distance = Math.hypot(dx, dy);

            if (distance === 0) {
              const angle = (i * 97 + j * 53) * (Math.PI / 180);
              dx = Math.cos(angle);
              dy = Math.sin(angle);
              distance = 1;
            }

            const unitX = dx / distance;
            const unitY = dy / distance;
            const repulsion =
              REPULSION /
              Math.max(
                distance * distance,
                MINIMUM_DISTANCE * MINIMUM_DISTANCE
              );
            const overlap = Math.max(0, MINIMUM_DISTANCE - distance) * 1.6;
            const force = repulsion + overlap;
            forces.get(nodeA.id)!.x -= unitX * force;
            forces.get(nodeA.id)!.y -= unitY * force;
            forces.get(nodeB.id)!.x += unitX * force;
            forces.get(nodeB.id)!.y += unitY * force;
          }
        }

        // Real graph edges attract every node type. Multiple edges between the
        // same pair naturally increase the pull and shorten their distance.
        for (const edge of filteredEdges) {
          const positionA = positions.get(edge.sourceId);
          const positionB = positions.get(edge.targetId);
          if (!positionA || !positionB) continue;
          const dx = positionB.x - positionA.x;
          const dy = positionB.y - positionA.y;
          const distance = Math.max(Math.hypot(dx, dy), 1);
          const force =
            (distance - edgeLength(edge)) * (0.045 + edgeWeight(edge) * 0.008);
          const unitX = dx / distance;
          const unitY = dy / distance;
          forces.get(edge.sourceId)!.x += unitX * force;
          forces.get(edge.sourceId)!.y += unitY * force;
          forces.get(edge.targetId)!.x -= unitX * force;
          forces.get(edge.targetId)!.y -= unitY * force;
        }

        // Semantic centroid force: containers sit in the middle of the nodes
        // they describe, rather than merely somewhere along one edge.
        for (const [sourceId, targetIds] of semanticTargets) {
          const sourcePosition = positions.get(sourceId);
          const targetPositions = targetIds
            .map((id) => positions.get(id))
            .filter((position): position is { x: number; y: number } =>
              Boolean(position)
            );
          if (!sourcePosition || targetPositions.length === 0) continue;
          const centroidX =
            targetPositions.reduce((sum, position) => sum + position.x, 0) /
            targetPositions.length;
          const centroidY =
            targetPositions.reduce((sum, position) => sum + position.y, 0) /
            targetPositions.length;
          const semanticStrength = sourceId.startsWith("fact-") ? 0.42 : 0.24;
          forces.get(sourceId)!.x +=
            (centroidX - sourcePosition.x) * semanticStrength;
          forces.get(sourceId)!.y +=
            (centroidY - sourcePosition.y) * semanticStrength;
          const share = semanticStrength / targetPositions.length;
          for (const targetId of targetIds) {
            const targetForce = forces.get(targetId);
            if (targetForce) {
              targetForce.x +=
                (sourcePosition.x - positions.get(targetId)!.x) * share;
              targetForce.y +=
                (sourcePosition.y - positions.get(targetId)!.y) * share;
            }
          }
        }

        // Keep low-degree nodes near the graph's center instead of leaving them
        // at the ends of long radial spokes. Hubs get a lighter pull so their
        // relationship springs can organize the central structure.
        for (const node of layoutNodes) {
          const position = positions.get(node.id)!;
          const degree = nodeDegrees.get(node.id) ?? 0;
          const strength = connectedNodeIds.has(node.id)
            ? Math.max(0.018, 0.08 / Math.sqrt(Math.max(degree, 1)))
            : 0.5;
          const centerForce = forces.get(node.id)!;
          centerForce.x -= position.x * strength;
          centerForce.y -= position.y * strength;
        }

        const cooling = 1 - iteration / 340;
        for (const node of layoutNodes) {
          const position = positions.get(node.id)!;
          const velocity = velocities.get(node.id)!;
          const force = forces.get(node.id)!;
          velocity.x = (velocity.x + force.x * cooling) * DAMPING;
          velocity.y = (velocity.y + force.y * cooling) * DAMPING;
          const speed = Math.hypot(velocity.x, velocity.y);
          if (speed > MAX_STEP) {
            velocity.x = (velocity.x / speed) * MAX_STEP;
            velocity.y = (velocity.y / speed) * MAX_STEP;
          }
          position.x += velocity.x;
          position.y += velocity.y;
        }
      }

      const getDegreeScale = (degree: number): number =>
        Math.min(2, 0.1 + Math.log(Math.max(degree, 1) + 1) * 0.3);
      // Normalize label importance to this graph so its strongest node remains
      // fully legible even when the theoretical degree scale cap is unused.
      const maxDegreeScale = Math.max(
        0.1,
        ...layoutNodes.map((node) =>
          getDegreeScale(nodeDegrees.get(node.id) ?? 0)
        )
      );

      for (const node of layoutNodes) {
        const label = node.type === "fact" ? node.statement : node.name;
        // The layout uses graph-position units, so small values become tiny
        // when the complete graph is fitted into the viewport. Keep a
        // comfortable visual floor while preserving type hierarchy.
        const baseSize =
          node.type === "character"
            ? 36
            : node.type === "group"
              ? 30
              : node.type === "event"
                ? 24
                : node.type === "fact"
                  ? 16
                  : 20;
        // Connections drive most of the visual weight. The logarithmic curve
        // separates hubs clearly while keeping unusually dense nodes bounded.
        const degree = nodeDegrees.get(node.id) ?? 0;
        const degreeScale = getDegreeScale(degree);
        const relativeDegreeScale = degreeScale / maxDegreeScale;
        const size = baseSize * relativeDegreeScale;
        const baseColor =
          node.type === "character"
            ? "#3b82f6"
            : node.type === "group"
              ? "#8b5cf6"
              : node.type === "event"
                ? "#10b981"
                : node.type === "fact"
                  ? "#ec4899"
                  : "#f59e0b";
        const fadedColor = darkMode ? "#1e293b" : "#cbd5e1";
        const colorFade = 1 - degreeScale / 2;
        const labelFade = 1 - degreeScale / maxDegreeScale;
        const color = blendColors(baseColor, fadedColor, colorFade);
        const nodeLabelColor = blendColors(labelColor, fadedColor, labelFade);
        const position = positions.get(node.id)!;
        graph.addNode(node.id, {
          label: label.length > 50 ? label.substring(0, 47) + "..." : label,
          size,
          color,
          baseColor,
          importanceFade: labelFade,
          labelColor: nodeLabelColor,
          charaIcon:
            node.type === "character"
              ? charaIconsByIdentifier.get(node.identifier)
              : undefined,
          x: position.x,
          y: position.y,
        });
      }

      // All edge endpoints are in filteredNodes, so searches cannot re-add the
      // complete graph through an unfiltered edge endpoint.
      const edgeMultiplicity = new Map<string, number>();
      for (const edge of filteredEdges) {
        const key = edgePairKey(edge);
        edgeMultiplicity.set(key, (edgeMultiplicity.get(key) ?? 0) + 1);
      }
      filteredEdges.forEach((edge, index) => {
        // Create unique edge key for multi-graph using database ID or index
        const edgeKey = edge.id
          ? `edge-${edge.id}`
          : `${edge.sourceId}-${edge.targetId}-${edge.type}-${index}`;
        const multiplicity = edgeMultiplicity.get(edgePairKey(edge)) ?? 1;

        graph.addEdgeWithKey(edgeKey, edge.sourceId, edge.targetId, {
          label: "", // No label
          size: 1.25,
          color: "#cbd5e1",
          multiplicity,
          type: "arrow", // Show directionality
          weight: edgeWeight(edge),
        });
      });

      loadGraph(graph);
      onGraphDataLoaded(allNodesMap, allEdgesArray);
    };

    loadData();
  }, [
    loadGraph,
    searchQuery,
    darkMode,
    labelColor,
    suppressLowImportanceNodes,
    lowImportanceConnectionLimit,
    selectedNodeTypes,
    graphRevision,
    onGraphDataLoaded,
    charaIconsByIdentifier,
  ]);

  return null;
};

export { GraphLoader };

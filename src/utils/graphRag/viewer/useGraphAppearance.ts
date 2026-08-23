import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import type { GraphNode } from "../types";
import { hexToRgb } from "../helpers";
import { drawFocusedLabel } from "../../../pages/graph-rag/viewer/Label";
import { getGraphFocusState } from "./graphFocusState";

const FADED_NODE_COLOR_LIGHT = "#cbd5e1";
const FADED_NODE_COLOR_DARK = "#1e293b";

const blendColors = (
  source: string,
  target: string,
  amount: number
): string => {
  const [sourceR, sourceG, sourceB] = hexToRgb(source);
  const [targetR, targetG, targetB] = hexToRgb(target);
  const mix = (from: number, to: number) =>
    Math.round(from + (to - from) * amount);
  return `rgb(${mix(sourceR, targetR)}, ${mix(sourceG, targetG)}, ${mix(sourceB, targetB)})`;
};

const edgePairKey = (source: string, target: string): string =>
  [source, target].sort().join("::");

interface GraphAppearanceProps {
  allNodes: Map<string, GraphNode>;
  selectedNodes: string[];
  focusNodes?: Set<string>;
  hoveredNode: string | null;
  secondaryLabels: Set<string>;
  darkMode?: boolean;
  fullscreen?: boolean;
  nodeSizeMultiplier: number;
  labelColor: string;
  focusColor: string;
  surfaceColor: string;
  onVisibleStatsChange: (stats: { nodes: number; edges: number }) => void;
}

export const useGraphAppearance = ({
  allNodes,
  selectedNodes,
  focusNodes,
  hoveredNode,
  secondaryLabels,
  darkMode,
  fullscreen,
  nodeSizeMultiplier,
  labelColor,
  focusColor,
  surfaceColor,
  onVisibleStatsChange,
}: GraphAppearanceProps) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useEffect(() => {
    const { visible, relationFades, stats } = getGraphFocusState(
      graph,
      allNodes,
      selectedNodes,
      focusNodes
    );
    onVisibleStatsChange(stats);

    const fadedNode = darkMode ? FADED_NODE_COLOR_DARK : FADED_NODE_COLOR_LIGHT;
    const nodeSizeScale = (fullscreen ? 0.75 : 1) * nodeSizeMultiplier;
    const defaultDrawNodeLabel = sigma.getSetting("defaultDrawNodeLabel");
    const connectivity = new Map<string, number>();
    graph.forEachEdge((_edge, _data, source, target) => {
      const key = edgePairKey(source, target);
      connectivity.set(key, (connectivity.get(key) ?? 0) + 1);
    });
    const maxConnectivity = Math.max(...connectivity.values(), 1);

    sigma.setSetting("defaultDrawNodeLabel", (context, data, settings) => {
      if (data.focusLabel && data.label) {
        drawFocusedLabel(
          context,
          { ...data, label: data.label, focusColor, surfaceColor },
          settings
        );
        return;
      }
      if (data.highlighted) return;
      defaultDrawNodeLabel(context, data, settings);
    });
    sigma.setSetting("defaultDrawNodeHover", (context, data, settings) => {
      if (data.label) {
        drawFocusedLabel(
          context,
          { ...data, label: data.label, focusColor, surfaceColor },
          settings
        );
      }
    });

    sigma.setSetting("nodeReducer", (node, data) => {
      const storedBaseColor = (data as typeof data & { baseColor?: unknown })
        .baseColor;
      const nodeObj = allNodes.get(node);
      const isSecondary =
        nodeObj?.type === "event" ||
        nodeObj?.type === "term" ||
        nodeObj?.type === "fact";
      const isSelected = selectedNodes.includes(node);
      const isHovered = hoveredNode === node;
      const emphasized = isSelected || isHovered;
      const showSecondaryLabel = secondaryLabels.has(node);
      const fade = relationFades.get(node) ?? 0;
      const importanceFade = Number(
        (data as typeof data & { importanceFade?: number }).importanceFade
      );
      const size = data.size * nodeSizeScale;
      const isFocusMode = selectedNodes.length > 0 || Boolean(focusNodes);
      const baseColor =
        isFocusMode && typeof storedBaseColor === "string"
          ? storedBaseColor
          : data.color;
      const color =
        visible?.has(node) === false
          ? baseColor
          : blendColors(baseColor, fadedNode, fade);
      const baseLabelColor = isFocusMode ? labelColor : labelColor;
      const labelFade = isFocusMode
        ? fade
        : Number.isFinite(importanceFade)
          ? importanceFade
          : 0;
      const nodeLabelColor =
        visible?.has(node) === false
          ? baseLabelColor
          : blendColors(baseLabelColor, fadedNode, labelFade);
      const getFocusedNodeDisplay = () => ({
        ...data,
        label: data.label || (nodeObj && "name" in nodeObj ? nodeObj.name : ""),
        color: baseColor,
        labelColor: nodeLabelColor,
        iconOpacity: 1,
        size: size * (isSelected ? 1.5 : 1.28),
        focusLabel: isSelected,
        forceLabel: true,
        zIndex: 20,
      });

      if (emphasized) return getFocusedNodeDisplay();
      if (!visible || visible.has(node)) {
        if (isSecondary) {
          return {
            ...data,
            color,
            labelColor: nodeLabelColor,
            iconOpacity: Math.max(0, 1 - fade),
            size,
            label: showSecondaryLabel ? data.label : "",
            forceLabel: showSecondaryLabel,
          };
        }
        return {
          ...data,
          color,
          labelColor: nodeLabelColor,
          iconOpacity: Math.max(0, 1 - fade),
          size,
        };
      }
      return { ...data, hidden: true, label: "" };
    });

    sigma.setSetting("edgeReducer", (edge, data) => {
      const [source, target] = graph.extremities(edge);
      if (visible && (!visible.has(source) || !visible.has(target)))
        return { ...data, hidden: true, label: "" };
      const pairCount = connectivity.get(edgePairKey(source, target)) ?? 1;
      const attributeCount = Number(
        (data as typeof data & { multiplicity?: number }).multiplicity
      );
      const multiplicity = Number.isFinite(attributeCount)
        ? Math.max(pairCount, attributeCount)
        : pairCount;
      const strength =
        maxConnectivity > 1 ? (multiplicity - 1) / (maxConnectivity - 1) : 0;
      const edgeSize = 1.25 + Math.min(1, strength) * 3;
      const weakColor = darkMode ? "#64748b" : "#94a3b8";
      const strongColor = darkMode ? "#f8fafc" : "#111827";
      return {
        ...data,
        color: blendColors(
          weakColor,
          strongColor,
          Math.min(1, Math.max(0, strength))
        ),
        size: edgeSize,
      };
    });

    sigma.refresh();
  }, [
    selectedNodes,
    allNodes,
    focusNodes,
    hoveredNode,
    darkMode,
    fullscreen,
    nodeSizeMultiplier,
    labelColor,
    focusColor,
    surfaceColor,
    sigma,
    graph,
    secondaryLabels,
    onVisibleStatsChange,
  ]);
};

import React, { useEffect } from "react";
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { GraphEdge, GraphNode } from "../types";
import { hexToRgb } from "../helpers";
import { rankFocus } from "../scoring/focus";
import {
  drawFocusedLabel,
  getFocusedNodeLabel,
  getLabelBounds,
  getNodeLabel,
  labelsOverlap,
  type LabelBounds,
} from "./Label";

const FADED_NODE_COLOR_LIGHT = "#cbd5e1";
const FADED_NODE_COLOR_DARK = "#1e293b";
const characterImageCache = new Map<string, HTMLImageElement>();

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

export interface VisibleGraphStats {
  nodes: number;
  edges: number;
}

// Component to handle click events and neighbor highlighting
const GraphEventHandler: React.FC<{
  onNodeClick: (nodeId: string) => void;
  allNodes: Map<string, GraphNode>;
  allEdges: GraphEdge[];
  selectedNodes: string[];
  focusNodes?: Set<string>; // Pair-mode visibility set
  darkMode?: boolean;
  fullscreen?: boolean;
  nodeSizeMultiplier: number;
  labelColor: string;
  focusColor: string;
  surfaceColor: string;
  onVisibleStatsChange: (stats: VisibleGraphStats) => void;
}> = ({
  onNodeClick,
  allNodes,
  allEdges: _allEdges,
  selectedNodes,
  focusNodes,
  darkMode,
  fullscreen,
  nodeSizeMultiplier,
  labelColor,
  focusColor,
  surfaceColor,
  onVisibleStatsChange,
}) => {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);

  useEffect(() => {
    const existingCanvas = sigma.getCanvases()["node-overlays"];
    const canvas =
      existingCanvas ??
      sigma.createCanvas("node-overlays", {
        afterLayer: "hoverNodes",
        style: { inset: "0", pointerEvents: "none" },
      });
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    sigma.getCanvases().hoverNodes?.after(canvas);
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let redrawFrame: number | null = null;
    const pendingImages = new Set<HTMLImageElement>();
    function scheduleDraw() {
      if (redrawFrame !== null) return;
      redrawFrame = requestAnimationFrame(() => {
        redrawFrame = null;
        drawOverlays();
      });
    }

    const drawOverlays = () => {
      const { width, height } = sigma.getDimensions();
      const pixelRatio = window.devicePixelRatio || 1;
      const targetWidth = Math.max(1, Math.round(width * pixelRatio));
      const targetHeight = Math.max(1, Math.round(height * pixelRatio));
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      const labelSettings = {
        labelSize: Number(sigma.getSetting("labelSize")) || 10,
        labelFont: String(sigma.getSetting("labelFont")),
        labelWeight: String(sigma.getSetting("labelWeight")),
      };
      graph.forEachNode((node) => {
        const nodeObject = allNodes.get(node);
        const data = sigma.getNodeDisplayData(node);
        if (!nodeObject || !data || data.hidden) return;

        const iconUrl = (
          data as (typeof data & { charaIcon?: string }) | undefined
        )?.charaIcon;

        const position = sigma.framedGraphToViewport(data);
        const radius = Math.max(7, sigma.scaleSize(data.size));
        if (nodeObject.type === "character" && iconUrl) {
          let image = characterImageCache.get(iconUrl);
          if (!image) {
            image = new Image();
            image.decoding = "async";
            image.src = iconUrl;
            characterImageCache.set(iconUrl, image);
          }
          if (!image.complete && !pendingImages.has(image)) {
            pendingImages.add(image);
            image.addEventListener("load", scheduleDraw, { once: true });
          }
          if (image.complete && image.naturalWidth > 0) {
            context.save();
            context.globalAlpha = Math.max(
              0,
              Math.min(
                1,
                (data as typeof data & { iconOpacity?: number }).iconOpacity ??
                  1
              )
            );
            context.beginPath();
            context.arc(position.x, position.y, radius, 0, Math.PI * 2);
            context.clip();
            context.drawImage(
              image,
              position.x - radius,
              position.y - radius,
              radius * 2,
              radius * 2
            );
            context.restore();
          }
        }

        const focusedLabel = getFocusedNodeLabel(
          node,
          nodeObject,
          data.label,
          selectedNodes,
          hoveredNode
        );
        if (focusedLabel) {
          drawFocusedLabel(
            context,
            {
              ...data,
              x: position.x,
              y: position.y,
              size: radius,
              label: focusedLabel,
              labelColor: labelColor,
              focusColor,
              surfaceColor,
              charaIcon: iconUrl,
            },
            labelSettings
          );
        }
      });
    };

    drawOverlays();
    sigma.on("afterRender", drawOverlays);
    sigma.on("resize", drawOverlays);
    return () => {
      if (redrawFrame !== null) cancelAnimationFrame(redrawFrame);
      pendingImages.forEach((image) =>
        image.removeEventListener("load", scheduleDraw)
      );
      sigma.off("afterRender", drawOverlays);
      sigma.off("resize", drawOverlays);
    };
  }, [
    allNodes,
    graph,
    hoveredNode,
    labelColor,
    focusColor,
    selectedNodes,
    sigma,
    surfaceColor,
  ]);
  const [secondaryLabels, setSecondaryLabels] = React.useState<Set<string>>(
    new Set()
  );

  // Events have more useful context than terms, so accept them first. Selected
  // and hovered nodes are always accepted and reserve their label area.
  useEffect(() => {
    let updateFrame: number | null = null;
    const updateSecondaryLabels = () => {
      const labelSize = Number(sigma.getSetting("labelSize")) || 10;
      const metrics =
        selectedNodes.length > 0
          ? rankFocus(graph, selectedNodes, allNodes, focusNodes)
          : null;
      const visible: Set<string> | null = focusNodes
        ? focusNodes
        : metrics
          ? new Set(metrics.depths.keys())
          : null;
      const reserved: LabelBounds[] = [];
      const accepted = new Set<string>();
      const candidates = graph
        .nodes()
        .map((id) => ({
          id,
          node: allNodes.get(id),
          data: sigma.getNodeDisplayData(id),
        }))
        .filter(
          (
            entry
          ): entry is {
            id: string;
            node: GraphNode;
            data: NonNullable<ReturnType<typeof sigma.getNodeDisplayData>>;
          } =>
            Boolean(
              entry.node && entry.data && (!visible || visible.has(entry.id))
            )
        );

      // Primary labels are reserved first because they are the graph's main
      // reading layer. Sigma may hide some of these at a given zoom, but the
      // conservative reservation prevents secondary text from becoming noisy.
      for (const entry of candidates) {
        if (entry.node.type !== "event" && entry.node.type !== "term") {
          reserved.push(
            getLabelBounds(
              sigma,
              entry.data,
              getNodeLabel(entry.node, entry.data.label),
              labelSize
            )
          );
        }
      }

      const secondary = candidates
        .filter(
          (entry) => entry.node.type === "event" || entry.node.type === "term"
        )
        .sort((a, b) => {
          const aFocused = selectedNodes.includes(a.id) || hoveredNode === a.id;
          const bFocused = selectedNodes.includes(b.id) || hoveredNode === b.id;
          if (aFocused !== bFocused) return aFocused ? -1 : 1;
          if (a.node.type !== b.node.type)
            return a.node.type === "event" ? -1 : 1;
          return a.id.localeCompare(b.id);
        });

      for (const entry of secondary) {
        const bounds = getLabelBounds(
          sigma,
          entry.data,
          getNodeLabel(entry.node, entry.data.label),
          labelSize
        );
        const focused =
          selectedNodes.includes(entry.id) || hoveredNode === entry.id;
        if (
          focused ||
          !reserved.some((other) => labelsOverlap(bounds, other))
        ) {
          accepted.add(entry.id);
          reserved.push(bounds);
        }
      }

      setSecondaryLabels((previous) => {
        if (
          previous.size === accepted.size &&
          [...previous].every((id) => accepted.has(id))
        )
          return previous;
        return accepted;
      });
    };
    const scheduleLabelUpdate = () => {
      if (updateFrame !== null) return;
      updateFrame = requestAnimationFrame(() => {
        updateFrame = null;
        updateSecondaryLabels();
      });
    };

    updateSecondaryLabels();
    sigma.getCamera().on("updated", scheduleLabelUpdate);
    sigma.on("resize", scheduleLabelUpdate);
    sigma.on("afterRender", scheduleLabelUpdate);
    return () => {
      if (updateFrame !== null) cancelAnimationFrame(updateFrame);
      sigma.getCamera().off("updated", scheduleLabelUpdate);
      sigma.off("resize", scheduleLabelUpdate);
      sigma.off("afterRender", scheduleLabelUpdate);
    };
  }, [allNodes, focusNodes, graph, hoveredNode, selectedNodes, sigma]);

  // Frame the selected node and its direct neighborhood. The bounds-based
  // ratio keeps a large neighborhood zoomed out and a small neighborhood
  // close enough to inspect without manually zooming every selection.
  useEffect(() => {
    const last = selectedNodes[selectedNodes.length - 1];
    if (last && graph.hasNode(last)) {
      const neighborhood = new Set<string>([last, ...graph.neighbors(last)]);
      const positions = [...neighborhood]
        .map((node) => sigma.getNodeDisplayData(node))
        .filter((data): data is NonNullable<typeof data> => Boolean(data));
      if (positions.length > 0) {
        const viewport = sigma.getDimensions();
        // getNodeDisplayData already contains Sigma's normalized/framed
        // coordinates. Applying graphToViewport here would normalize them a
        // second time and move the focus away from the selected node.
        const viewportPositions = positions.map((data) =>
          sigma.framedGraphToViewport(data)
        );
        const minX = Math.min(...viewportPositions.map((data) => data.x));
        const maxX = Math.max(...viewportPositions.map((data) => data.x));
        const minY = Math.min(...viewportPositions.map((data) => data.y));
        const maxY = Math.max(...viewportPositions.map((data) => data.y));
        const targetWidth = Math.max(maxX - minX, 80);
        const targetHeight = Math.max(maxY - minY, 80);
        // Fit the neighborhood to roughly 78% of the viewport. Sigma camera
        // coordinates are framed/normalized, so derive the new ratio from
        // current pixel bounds and convert the pixel center back to framed
        // coordinates instead of passing raw graph coordinates to the camera.
        const currentRatio = sigma.getCamera().getState().ratio;
        const ratio = Math.min(
          1,
          Math.max(
            0.02,
            currentRatio *
              Math.max(
                (targetWidth * 1.1) / Math.max(viewport.width * 0.78, 1),
                (targetHeight * 1.1) / Math.max(viewport.height * 0.78, 1)
              )
          )
        );
        const framedCenter = {
          x:
            (Math.min(...positions.map((data) => data.x)) +
              Math.max(...positions.map((data) => data.x))) /
            2,
          y:
            (Math.min(...positions.map((data) => data.y)) +
              Math.max(...positions.map((data) => data.y))) /
            2,
        };
        sigma
          .getCamera()
          .animate(
            { x: framedCenter.x, y: framedCenter.y, ratio },
            { duration: 500, easing: "quadraticInOut" }
          );
      }
    }
  }, [selectedNodes, sigma, graph]);

  // Single focus shows the complete undirected component. Character-pair focus
  // is deliberately limited to the two characters and their shared semantic nodes.
  useEffect(() => {
    const metrics =
      selectedNodes.length > 0
        ? rankFocus(graph, selectedNodes, allNodes, focusNodes)
        : null;
    const relationFades = metrics?.relationFades ?? new Map<string, number>();
    const visible: Set<string> | null = focusNodes
      ? focusNodes
      : metrics
        ? new Set(metrics.depths.keys())
        : null;

    const visibleNodes = visible
      ? graph.nodes().filter((node) => visible.has(node)).length
      : graph.order;
    let visibleEdges = 0;
    graph.forEachEdge((_edge, _attributes, source, target) => {
      if (!visible || (visible.has(source) && visible.has(target))) {
        visibleEdges += 1;
      }
    });
    onVisibleStatsChange({ nodes: visibleNodes, edges: visibleEdges });

    const fadedNode = darkMode ? FADED_NODE_COLOR_DARK : FADED_NODE_COLOR_LIGHT;
    const nodeSizeScale = (fullscreen ? 0.75 : 1) * nodeSizeMultiplier;
    const defaultDrawNodeLabel = sigma.getSetting("defaultDrawNodeLabel");

    // Count all relationships between the same undirected pair once. Keeping
    // this derived from Sigma's live graph makes the style reliable even when
    // an edge attribute is omitted or has been normalized by Graphology.
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
      const size = data.size * nodeSizeScale;
      const color =
        visible?.has(node) === false
          ? data.color
          : blendColors(data.color, fadedNode, fade);
      const nodeLabelColor =
        visible?.has(node) === false
          ? labelColor
          : blendColors(labelColor, fadedNode, fade);

      const getFocusedNodeDisplay = () => ({
        ...data,
        label: data.label || (nodeObj && "name" in nodeObj ? nodeObj.name : ""),
        color: data.color,
        labelColor: nodeLabelColor,
        iconOpacity: 1,
        size: size * (isSelected ? 1.5 : 1.28),
        focusLabel: isSelected,
        forceLabel: true,
        zIndex: 20,
      });

      // Keep focus styling in the reducer so it follows the active theme.
      if (emphasized) {
        return getFocusedNodeDisplay();
      }

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
      if (visible && (!visible.has(source) || !visible.has(target))) {
        return { ...data, hidden: true, label: "" };
      }
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
      const edgeColor = blendColors(
        weakColor,
        strongColor,
        Math.min(1, Math.max(0, strength))
      );
      return {
        ...data,
        color: edgeColor,
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

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        onNodeClick(event.node);
      },
      clickStage: () => {
        onNodeClick("");
      },
      enterNode: (event) => {
        setHoveredNode(event.node);
      },
      leaveNode: () => {
        setHoveredNode(null);
      },
    });
  }, [registerEvents, onNodeClick]);

  return null;
};

export { GraphEventHandler };

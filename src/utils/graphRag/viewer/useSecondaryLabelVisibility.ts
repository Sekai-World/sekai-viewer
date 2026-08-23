import { useEffect, useState } from "react";
import { useSigma } from "@react-sigma/core";
import type { GraphNode } from "../types";
import { rankFocus } from "../scoring/focus";
import {
  getLabelBounds,
  getNodeLabel,
  labelsOverlap,
  type LabelBounds,
} from "../../../pages/graph-rag/viewer/Label";

export const useSecondaryLabelVisibility = (
  allNodes: Map<string, GraphNode>,
  selectedNodes: string[],
  hoveredNode: string | null,
  focusNodes?: Set<string>
): Set<string> => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [secondaryLabels, setSecondaryLabels] = useState<Set<string>>(
    new Set()
  );

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

  return secondaryLabels;
};

import React, { useEffect, useState } from "react";
import { useRegisterEvents } from "@react-sigma/core";
import type { GraphNode } from "../../../utils/graphRag/types";
import { useGraphOverlayCanvas } from "../../../utils/graphRag/viewer/useGraphOverlayCanvas";
import { useSecondaryLabelVisibility } from "../../../utils/graphRag/viewer/useSecondaryLabelVisibility";
import { useGraphCameraFocus } from "../../../utils/graphRag/viewer/useGraphCameraFocus";
import { useGraphAppearance } from "../../../utils/graphRag/viewer/useGraphAppearance";
import type { VisibleGraphStats } from "../../../utils/graphRag/viewer/graphFocusState";

export type { VisibleGraphStats } from "../../../utils/graphRag/viewer/graphFocusState";

export interface GraphEventHandlerProps {
  allNodes: Map<string, GraphNode>;
  selectedNodes: string[];
  focusNodes?: Set<string>;
  darkMode?: boolean;
  fullscreen?: boolean;
  nodeSizeMultiplier: number;
  labelColor: string;
  focusColor: string;
  surfaceColor: string;
  onVisibleStatsChange: (stats: VisibleGraphStats) => void;
}

const GraphEventHandler: React.FC<GraphEventHandlerProps> = ({
  allNodes,
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
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const secondaryLabels = useSecondaryLabelVisibility(
    allNodes,
    selectedNodes,
    hoveredNode,
    focusNodes
  );

  useGraphOverlayCanvas({
    allNodes,
    selectedNodes,
    hoveredNode,
    labelColor,
    focusColor,
    surfaceColor,
  });
  useGraphCameraFocus(selectedNodes);
  useGraphAppearance({
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
  });

  useEffect(() => {
    registerEvents({
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents]);

  return null;
};

export { GraphEventHandler };

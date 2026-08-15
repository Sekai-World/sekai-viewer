import { useEffect, type FC } from "react";
import { useSigma } from "@react-sigma/core";
import type { GraphNode } from "../types";

interface FocusLabelData {
  x: number;
  y: number;
  size: number;
  label: string;
  color: string;
  labelColor?: string;
  focusColor: string;
  surfaceColor: string;
  focusLabel?: boolean;
  highlighted?: boolean;
  charaIcon?: string;
}

export interface LabelBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface LabelPositioning {
  framedGraphToViewport: (data: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  scaleSize: (size: number) => number;
}

export const drawFocusedLabel = (
  context: CanvasRenderingContext2D,
  data: FocusLabelData,
  settings: { labelSize: number; labelFont: string; labelWeight: string }
) => {
  if (!data.label) return;

  const labelSize = settings.labelSize;
  const font = `${settings.labelWeight} ${labelSize}px ${settings.labelFont}`;
  context.font = font;
  const textWidth = context.measureText(data.label).width;
  const paddingX = labelSize * 0.65;
  const paddingY = labelSize * 0.45;
  const panelWidth = textWidth + paddingX * 2;
  const panelHeight = labelSize + paddingY * 2;
  const radius = panelHeight / 2;
  const rightPanelLeft = data.x + data.size;
  const leftPanelLeft = data.x - data.size - panelWidth;
  const viewportWidth = context.canvas.clientWidth || context.canvas.width;
  const viewportHeight = context.canvas.clientHeight || context.canvas.height;
  const panelLeft =
    rightPanelLeft + panelWidth <= viewportWidth
      ? rightPanelLeft
      : Math.max(4, leftPanelLeft);
  const panelTop = Math.max(
    4,
    Math.min(viewportHeight - panelHeight - 4, data.y - panelHeight / 2)
  );

  context.save();
  context.shadowColor = data.color;
  context.shadowBlur = labelSize * 0.65;
  context.shadowOffsetY = 1;
  if (!data.charaIcon) {
    context.fillStyle = data.color;
    context.beginPath();
    context.arc(data.x, data.y, data.size, 0, Math.PI * 2);
    context.fill();
  }
  context.strokeStyle = data.focusColor;
  context.lineWidth = Math.max(1, labelSize * 0.12);
  context.stroke();
  context.fillStyle = data.surfaceColor;
  context.beginPath();
  context.roundRect(panelLeft, panelTop, panelWidth, panelHeight, radius);
  context.fill();
  context.strokeStyle = data.focusColor;
  context.stroke();
  context.shadowColor = "transparent";
  context.fillStyle = data.labelColor || "#ffffff";
  context.textBaseline = "middle";
  context.fillText(
    data.label,
    panelLeft + paddingX,
    panelTop + panelHeight / 2
  );
  context.restore();
};

export const labelsOverlap = (a: LabelBounds, b: LabelBounds): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

// Match Sigma's default right-aligned node-label geometry.
export const getLabelBounds = (
  sigma: LabelPositioning,
  data: { x: number; y: number; size: number },
  label: string,
  labelSize: number
): LabelBounds => {
  const position = sigma.framedGraphToViewport(data);
  const nodeRadius = sigma.scaleSize(data.size);
  const width = Math.max(12, label.length * labelSize * 0.58);
  const left = position.x + nodeRadius + 3;
  const top = position.y - labelSize * 0.72;
  return { left, right: left + width, top, bottom: top + labelSize * 1.15 };
};

export const getNodeLabel = (
  node: GraphNode,
  dataLabel?: string | null
): string => dataLabel || (node.type === "fact" ? node.statement : node.name);

export const getFocusedNodeLabel = (
  nodeId: string,
  node: GraphNode,
  dataLabel: string | null,
  selectedNodes: string[],
  hoveredNode: string | null
): string | null =>
  selectedNodes.includes(nodeId) || hoveredNode === nodeId
    ? getNodeLabel(node, dataLabel)
    : null;

export const ZoomResponsiveLabels: FC = () => {
  const sigma = useSigma();

  useEffect(() => {
    const updateLabelSize = () => {
      const ratio = sigma.getCamera().getState().ratio;
      // Keep the zoom response legible without overwhelming the graph.
      sigma.setSetting(
        "labelSize",
        Math.max(7, Math.min(15, 10 / Math.sqrt(ratio)))
      );
    };

    updateLabelSize();
    sigma.getCamera().on("updated", updateLabelSize);
    return () => {
      sigma.getCamera().off("updated", updateLabelSize);
    };
  }, [sigma]);

  return null;
};

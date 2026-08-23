import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import type { GraphNode } from "../types";
import {
  drawFocusedLabel,
  getFocusedNodeLabel,
} from "../../../pages/graph-rag/viewer/Label";

const characterImageCache = new Map<string, HTMLImageElement>();

interface GraphOverlayProps {
  allNodes: Map<string, GraphNode>;
  selectedNodes: string[];
  hoveredNode: string | null;
  labelColor: string;
  focusColor: string;
  surfaceColor: string;
}

export const useGraphOverlayCanvas = ({
  allNodes,
  selectedNodes,
  hoveredNode,
  labelColor,
  focusColor,
  surfaceColor,
}: GraphOverlayProps) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

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
    if (!context) return;

    let redrawFrame: number | null = null;
    const pendingImages = new Set<HTMLImageElement>();
    const scheduleDraw = () => {
      if (redrawFrame !== null) return;
      redrawFrame = requestAnimationFrame(() => {
        redrawFrame = null;
        drawOverlays();
      });
    };

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

        const iconUrl = (data as typeof data & { charaIcon?: string })
          .charaIcon;
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
              labelColor,
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
};

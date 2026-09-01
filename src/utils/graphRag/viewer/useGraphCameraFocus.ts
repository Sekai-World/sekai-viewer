import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";

export const useGraphCameraFocus = (selectedNodes: string[]) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useEffect(() => {
    const last = selectedNodes[selectedNodes.length - 1];
    if (!last || !graph.hasNode(last)) return;

    const neighborhood = new Set<string>([last, ...graph.neighbors(last)]);
    const positions = [...neighborhood]
      .map((node) => sigma.getNodeDisplayData(node))
      .filter((data): data is NonNullable<typeof data> => Boolean(data));
    if (positions.length === 0) return;

    const viewport = sigma.getDimensions();
    const viewportPositions = positions.map((data) =>
      sigma.framedGraphToViewport(data)
    );
    const minX = Math.min(...viewportPositions.map((data) => data.x));
    const maxX = Math.max(...viewportPositions.map((data) => data.x));
    const minY = Math.min(...viewportPositions.map((data) => data.y));
    const maxY = Math.max(...viewportPositions.map((data) => data.y));
    const targetWidth = Math.max(maxX - minX, 80);
    const targetHeight = Math.max(maxY - minY, 80);
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
  }, [selectedNodes, sigma, graph]);
};

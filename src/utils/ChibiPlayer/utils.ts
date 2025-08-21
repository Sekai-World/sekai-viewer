import { Application, DisplayObject, utils, Rectangle } from "pixi.js";

export const getTransparentBound = (app: Application, obj: DisplayObject) => {
  // get object native bound
  const boundaryRect = obj.getBounds();
  const renderTexture = app.renderer.generateTexture(obj, {
    region: boundaryRect,
    resolution: 1,
  });
  const canvas = app.renderer.extract.canvas(renderTexture);
  const transparentBoundary = utils.getCanvasBoundingBox(canvas);
  renderTexture.destroy();
  return new Rectangle(
    boundaryRect.x + transparentBoundary.left, // x
    boundaryRect.y + transparentBoundary.top, // y
    transparentBoundary.width, // width
    transparentBoundary.height // height
  );
};

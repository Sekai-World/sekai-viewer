import { Texture, Rectangle, BaseTexture } from "pixi.js";

/**
 * Slice texture into small parts
 * @param base_texture PIXI.BaseTexture
 * @param parts slice grid size
 * @param total maximum parts number
 * @returns sliced texture list
 */
export function texture_slice(
  base_texture: BaseTexture,
  parts: [number, number],
  total?: number
) {
  const width = base_texture.realWidth / parts[0];
  const height = base_texture.realHeight / parts[1];
  let count = 0;
  const ret: Texture[] = [];
  for (let h = 0; h < parts[1]; h++) {
    for (let w = 0; w < parts[0]; w++) {
      ret.push(
        new Texture(
          base_texture,
          new Rectangle(w * width, h * height, width, height)
        )
      );
      count++;
      if (total && count >= total) return ret;
    }
  }
  return ret;
}

export function linear_gradient(gradient: { stop: number; color: string }[]) {
  const quality = 256;
  const canvas = document.createElement("canvas");
  canvas.width = quality;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  // use canvas2d API to create gradient
  const grd = ctx.createLinearGradient(0, 0, quality, 0);
  gradient.forEach((g) => {
    grd.addColorStop(g.stop, g.color);
  });
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, quality, 1);
  return Texture.from(canvas);
}

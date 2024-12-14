import {
  Container,
  DisplayObject,
  Texture,
  Rectangle,
  BaseTexture,
  Ticker,
} from "pixi.js";

/**
 * Slice texture into small parts
 * @param base_texture PIXI.BaseTexture
 * @param parts slice grid size
 * @param total maximum parts number
 * @returns sliced texture data (altas)
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

export const curve = {
  map_range(
    n: number,
    to_min: number,
    to_max: number,
    from_min = 0,
    from_max = 1
  ) {
    return (
      ((n - from_min) / (from_max - from_min)) * (to_max - to_min) + to_min
    );
  },
  loop(progress: number, period: number) {
    return (progress * period) % 1;
  },
  offset(progress: number, offset: number) {
    return (progress + offset) % 1;
  },
  bounce(progress: number) {
    return 1 - Math.abs(progress - 0.5) * 2;
  },
  ease(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  shrink_and_clamp(progress: number, start: number, end: number) {
    return progress < start || progress > end
      ? 0
      : (progress - start) / (end - start);
  },
};

export abstract class Animation {
  public abstract root: Container;
  public controller: AbortController;
  protected abstract structure: Record<
    string,
    Container | DisplayObject | DisplayObject[]
  >;
  protected stage_size: [number, number];

  constructor() {
    this.stage_size = [1, 1];
    this.controller = new AbortController();
  }

  public abstract set_style: (stage_size: [number, number]) => void;
  public abstract animation: (p: number) => void;

  /**
   * @param h 400: stage_hight
   */
  protected em(h: number) {
    return (this.stage_size[1] * h) / 400;
  }

  protected random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  public start(period: number) {
    let progress = 0;
    const ani_ticker = new Ticker();
    ani_ticker.add(() => {
      if (this.controller.signal.aborted) {
        ani_ticker.destroy();
      } else {
        progress = progress + ani_ticker.elapsedMS / period;
        progress = progress % 1;
        this.animation(progress);
      }
    });
    ani_ticker.start();
  }

  public destroy() {
    this.controller.abort();
    this.root.destroy();
  }
}

import { Container, DisplayObject, Ticker } from "pixi.js";

export abstract class BaseAnimation {
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

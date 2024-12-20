import { Ticker } from "pixi.js";
import BaseLayer from "../layer/BaseLayer";
import type { ILayerData } from "../types.d";

export default abstract class BaseAnimation extends BaseLayer {
  public controller: AbortController;
  protected period_ms: number;

  constructor(data: ILayerData) {
    super(data);
    this.controller = new AbortController();
    this.period_ms = 1000;
  }
  draw() {}
  public abstract animation(p: number): void;

  public start(loop = true) {
    let progress = 0;
    const ani_ticker = new Ticker();
    if (loop) {
      ani_ticker.add(() => {
        if (this.controller.signal.aborted) {
          ani_ticker.destroy();
        } else {
          progress = progress + ani_ticker.elapsedMS / this.period_ms;
          progress = progress % 1;
          this.animation(progress);
        }
      });
    } else {
      ani_ticker.add(() => {
        if (this.controller.signal.aborted) {
          ani_ticker.destroy();
        } else {
          progress = progress + ani_ticker.elapsedMS / this.period_ms;
          if (progress > 1) {
            progress = 1;
            ani_ticker.destroy();
          }
          this.animation(progress);
        }
      });
    }
    ani_ticker.start();
  }

  public destroy() {
    this.controller.abort();
    this.root.destroy();
  }
}

import { Ticker } from "pixi.js";
import BaseLayer from "../layer/BaseLayer";
import type { ILayerData, AnimationObj } from "../types.d";

export default class BaseAnimation extends BaseLayer {
  protected structure: Record<string, never>;
  public controller: AbortController;
  protected period_ms: number;
  protected settings: AnimationObj[];

  constructor(data: ILayerData) {
    super(data);
    this.structure = {};
    this.controller = new AbortController();
    this.period_ms = 1000;
    this.settings = [];
  }
  draw() {}

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
          this.progress(progress);
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
          this.progress(progress);
        }
      });
    }
    ani_ticker.start();
  }

  protected _set_style() {}

  public set_style(stage_size: [number, number]): void {
    this.stage_size = stage_size;
    this._set_style();
    this.settings.forEach((a) => {
      if (a.x) a.obj.position.x = a.x();
      if (a.y) a.obj.position.y = a.y();
      if (a.scale) a.obj.scale.set(a.scale());
      if (a.scale_x) a.obj.scale.x = a.scale_x();
      if (a.scale_y) a.obj.scale.y = a.scale_y();
      if (a.angle) a.obj.angle = a.angle();
      if (a.alpha) a.obj.alpha = a.alpha();
    });
  }

  private progress(t: number) {
    this.settings.forEach((a) => {
      if (a.x_curve) a.obj.position.x = a.x_curve.p(t) * this.stage_size[0];
      if (a.y_curve) a.obj.position.y = a.y_curve.p(t) * this.stage_size[1];
      if (a.scale_curve) a.obj.scale.set(a.scale_curve.p(t));
      if (a.scale_x_curve) a.obj.scale.x = a.scale_x_curve.p(t);
      if (a.scale_y_curve) a.obj.scale.y = a.scale_y_curve.p(t);
      if (a.angle_curve) a.obj.angle = a.angle_curve.p(t);
      if (a.alpha_curve) a.obj.alpha = a.alpha_curve.p(t);
      if (a.x_func) a.obj.position.x = a.x_func(t);
      if (a.y_func) a.obj.position.y = a.y_func(t);
      if (a.scale_func) a.obj.scale.set(a.scale_func(t));
      if (a.scale_x_func) a.obj.scale.x = a.scale_x_func(t);
      if (a.scale_y_func) a.obj.scale.y = a.scale_y_func(t);
      if (a.angle_func) a.obj.angle = a.angle_func(t);
      if (a.alpha_func) a.obj.alpha = a.alpha_func(t);
    });
  }

  public destroy() {
    this.controller.abort();
    this.root.destroy();
  }
}

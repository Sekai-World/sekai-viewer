import { Container, DisplayObject } from "pixi.js";
import type { ILayerData, ILive2DTexture } from "../types.d";
import AnimationController from "../animation/AnimationController";

export default abstract class BaseLayer {
  public root: Container;
  protected abstract structure: Record<string, DisplayObject | DisplayObject[]>;
  protected stage_size: [number, number];
  protected screen_length: number;
  protected animation_controller: AnimationController;
  protected textures: ILive2DTexture[];
  protected init: boolean;

  constructor(data: ILayerData) {
    this.stage_size = data.stage_size ? data.stage_size : [1, 1];
    this.screen_length = data.screen_length ? data.screen_length : 2000;
    this.animation_controller = data.animation_controller
      ? data.animation_controller
      : new AnimationController();
    this.textures = data.textures ? data.textures : [];
    this.init = false;
    this.root = new Container();
  }

  public abstract draw(...args: any[]): void;
  public abstract set_style(stage_size?: [number, number]): void;

  /**
   * @param h 400: stage_height
   */
  protected em(h: number) {
    return (this.stage_size[1] * h) / 400;
  }

  protected random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  public destroy() {
    this.root.children.forEach((c) => c.destroy({ children: true }));
  }
}

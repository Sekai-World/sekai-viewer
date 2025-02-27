import {
  ColorMatrix,
  ColorMatrixFilter,
  Container,
  DisplayObject,
} from "pixi.js";
import type { ILive2DLayerData, ILive2DTexture } from "../types.d";
import AnimationController from "../animation/AnimationController";
import { Curve } from "../animation/Curve";

export default abstract class BaseLayer {
  public root: Container;
  protected abstract structure: Record<string, DisplayObject | DisplayObject[]>;
  protected stage_size: [number, number];
  protected screen_length: number;
  protected animation_controller: AnimationController;
  protected shake_animation_controller: AnimationController;
  protected textures: ILive2DTexture[];
  protected init: boolean;

  constructor(data: ILive2DLayerData) {
    this.stage_size = data.stage_size ? data.stage_size : [1, 1];
    this.screen_length = data.screen_length ? data.screen_length : 2000;
    this.animation_controller = data.animation_controller
      ? data.animation_controller
      : new AnimationController();
    this.shake_animation_controller = new AnimationController();
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
    return this.stage_size[0] > this.stage_size[1]
      ? (this.stage_size[1] * h) / 400
      : (this.stage_size[0] * h) / 400;
  }

  protected random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  public show = async (time: number, force = false) => {
    if (this.root.alpha !== 1 || force) {
      await this.animation_controller.progress_wrapper((progress) => {
        this.root.alpha = progress;
      }, time);
    }
  };

  public hide = async (time: number, force = false) => {
    if (this.root.alpha !== 0 || force) {
      await this.animation_controller.progress_wrapper((progress) => {
        this.root.alpha = 1 - progress;
      }, time);
    }
  };

  public shake = async (curve_x: Curve, curve_y: Curve, time_ms: number) => {
    await this.shake_animation_controller.progress_wrapper((t) => {
      this.root.position.x = curve_x.p(t);
      this.root.position.y = curve_y.p(t);
    }, time_ms);
    this.root.position.set(0);
  };

  public stop_shake = () => {
    this.shake_animation_controller.abort();
  };

  public add_color_filter = (
    R: number[],
    G: number[],
    B: number[],
    A: number[]
  ) => {
    // add filter
    const filter = new ColorMatrixFilter();
    /*
    R = a*R + b*G + c*B + d*A + e
    G = f*R + g*G + h*B + i*A + j
    B = k*R + l*G + m*B + n*A + o
    A = p*R + q*G + r*B + s*A + t
    */
    filter.matrix = R.concat(G, B, A) as ColorMatrix;
    this.add_filter(filter);
  };

  public add_filter = (filter: ColorMatrixFilter) => {
    // add filter
    filter.resolution = 2;
    if (this.root.filters) {
      this.root.filters.push(filter);
    } else {
      this.root.filters = [filter];
    }
  };

  public remove_filter = () => {
    // remove all ColorMatrixFilter
    if (this.root.filters) {
      let idx = -1;
      do {
        idx = this.root.filters.findIndex(
          (f) => f instanceof ColorMatrixFilter
        );
        if (idx !== -1) {
          this.root.filters?.splice(idx, 1);
        }
      } while (idx !== -1);
    }
  };

  public destroy() {
    this.shake_animation_controller.abort();
    this.root.children.forEach((c) => c.destroy({ children: true }));
  }
}

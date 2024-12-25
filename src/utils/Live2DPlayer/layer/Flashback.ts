import { Graphics } from "pixi.js";
import BaseLayer from "./BaseLayer";
import type { ILive2DLayerData } from "../types.d";

export default class Flashback extends BaseLayer {
  structure: {
    bg_graphic?: Graphics;
  };
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
  }

  draw() {
    const container = this.root;
    container.removeChildren();
    const bg_graphic = new Graphics();
    bg_graphic
      .beginFill(0x000000, 0.3)
      .drawRect(0, 0, this.screen_length, this.screen_length)
      .endFill();
    container.addChild(bg_graphic);
    this.structure = {
      bg_graphic,
    };
    this.init = true;
    this.set_style();
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init) {
      const bg = this.structure.bg_graphic!;
      bg.scale.set(
        this.stage_size[0] / this.screen_length,
        this.stage_size[1] / this.screen_length
      );
    }
  }
}

import { Graphics } from "pixi.js";
import BaseLayer from "./BaseLayer";
import type { ILayerData } from "../types.d";

export default class Fullcolor extends BaseLayer {
  structure: {
    color?: Graphics;
  };
  constructor(data: ILayerData) {
    super(data);
    this.structure = {};
  }

  draw(color: number) {
    const container = this.root;
    container.removeChildren();
    const bg_graphic = new Graphics();
    this.structure.color = bg_graphic;
    bg_graphic
      .beginFill(color, 1)
      .drawRect(0, 0, this.screen_length, this.screen_length)
      .endFill();
    container.addChild(bg_graphic);
    this.init = true;
    this.set_style();
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init) {
      const bg = this.structure.color!;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(
        this.stage_size[0] / this.screen_length,
        this.stage_size[1] / this.screen_length
      );
    }
  }
}

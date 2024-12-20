import { Texture, Sprite } from "pixi.js";
import type { ILayerData } from "../types.d";
import BaseLayer from "./BaseLayer";

export default class Background extends BaseLayer {
  structure: {
    background?: Sprite;
  };
  constructor(data: ILayerData) {
    super(data);
    this.structure = {};
  }

  draw(data: HTMLImageElement) {
    const container = this.root;
    container.removeChildren();
    const texture = Texture.from(data);
    const bg = new Sprite(texture);
    this.structure.background = bg;
    container.addChild(bg);
    this.init = true;
    this.set_style();
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init) {
      const bg = this.structure.background!;
      let scale = 1;
      const texture = bg.texture;
      if (
        texture.width / texture.height >
        this.stage_size[0] / this.stage_size[1]
      )
        scale = this.stage_size[1] / texture.height;
      else scale = this.stage_size[0] / texture.width;
      bg.x = this.stage_size[0] / 2;
      bg.y = this.stage_size[1] / 2;
      bg.anchor.set(0.5);
      bg.scale.set(scale);
    }
  }
}

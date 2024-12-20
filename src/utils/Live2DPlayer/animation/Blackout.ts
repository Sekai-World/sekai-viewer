import BaseAnimation from "./BaseAnimation";
import { Graphics } from "pixi.js";

export default class Blackout extends BaseAnimation {
  structure: {
    bg_graphic: Graphics;
  };
  constructor(opacity: number) {
    super({});

    const bg_graphic = new Graphics();
    bg_graphic
      .beginFill(0x000000, opacity)
      .drawRect(0, 0, this.screen_length, this.screen_length)
      .endFill();
    this.root.addChild(bg_graphic);
    this.structure = {
      bg_graphic,
    };
  }

  set_style(stage_size: [number, number]) {
    this.stage_size = stage_size;
    this.structure.bg_graphic.scale.set(
      this.stage_size[0] / this.screen_length,
      this.stage_size[1] / this.screen_length
    );
  }
  animation() {}
}

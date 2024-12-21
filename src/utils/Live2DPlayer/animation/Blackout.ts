import BaseAnimation from "./BaseAnimation";
import { Graphics } from "pixi.js";

export default class Blackout extends BaseAnimation {
  constructor(opacity: number) {
    super({});

    const bg_graphic = new Graphics();
    bg_graphic
      .beginFill(0x000000, opacity)
      .drawRect(0, 0, this.screen_length, this.screen_length)
      .endFill();
    this.root.addChild(bg_graphic);
    this.settings.push({
      obj: bg_graphic,
      scale_x: () => (1 / this.screen_length) * this.stage_size[0],
      scale_y: () => (1 / this.screen_length) * this.stage_size[1],
    });
  }
}

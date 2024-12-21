import BaseAnimation from "./BaseAnimation";
import { linear_gradient } from "./utils";
import { Curve } from "./Curve";
import { Sprite } from "pixi.js";
import type { AnimationObj } from "../types.d";

export default class Lightup extends BaseAnimation {
  constructor(color: string, light_type: string) {
    super({});
    this.period_ms = 600;

    const light = new Sprite(
      linear_gradient([
        { stop: 0, color: `rgba(${color}, 0)` },
        { stop: 1, color: `rgba(${color}, 0.5)` },
      ])
    );
    light.angle = 90;
    light.position.x = 0;
    const setting: AnimationObj = {
      obj: light,
      x: () => 1 * this.stage_size[0],
      y: () => 0.5 * this.stage_size[1],
      scale_x: () => (this.stage_size[1] / 256) * 0.5,
      scale_y: () => this.stage_size[0] / 1,
    };
    if (light_type === "firework") {
      setting.alpha_curve = new Curve().bounce().map_range(0.85, 1);
    }
    this.settings.push(setting);
    this.root.addChild(light);
    console.log(this.root);
  }
}

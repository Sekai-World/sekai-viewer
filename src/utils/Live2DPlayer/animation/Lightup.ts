import BaseAnimation from "./BaseAnimation";
import { linear_gradient } from "./utils";
import { Curve } from "./Curve";
import { Sprite, NoiseFilter } from "pixi.js";

export default class Lightup extends BaseAnimation {
  structure: {
    light: Sprite;
  };
  private light_type: string;
  constructor(color: string, light_type: string) {
    super({});
    this.period_ms = 600;
    this.light_type = light_type;

    const light = new Sprite(
      linear_gradient([
        { stop: 0, color: `rgba(${color}, 0)` },
        { stop: 1, color: `rgba(${color}, 0.5)` },
      ])
    );

    const filter = new NoiseFilter(0.5, 0.5);
    light.filters = [filter];
    this.root.addChild(light);
    this.structure = {
      light,
    };
  }

  set_style(stage_size: [number, number]) {
    this.stage_size = stage_size;
    this.structure.light.angle = 90;
    this.structure.light.position.x = this.stage_size[0];
    this.structure.light.position.y = this.stage_size[1] * 0.5;
    this.structure.light.scale.set(
      (this.stage_size[1] / 256) * 0.5,
      this.stage_size[0] / 1
    );
  }

  animation(t: number) {
    if (this.light_type === "firework") {
      this.structure.light.alpha = new Curve().bounce().map_range(0.85, 1).p(t);
    }
  }
}

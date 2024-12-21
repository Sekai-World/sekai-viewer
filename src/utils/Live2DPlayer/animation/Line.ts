import BaseAnimation from "./BaseAnimation";
import { BlurFilter, Graphics } from "pixi.js";
import { Curve } from "./Curve";

export default class Line extends BaseAnimation {
  private color: number;
  constructor(color: number) {
    super({});
    this.color = color;

    const blur = new BlurFilter();
    blur.blur = 2;
    blur.resolution = 2;
    this.root.filters = [blur];

    this.settings = [];
    for (let i = 0; i < 30; i++) {
      const obj = new Graphics();
      obj.alpha = 0;
      this.settings.push({
        obj,
        alpha_curve: new Curve()
          .bounce(0.1, 0.1)
          .shrink(0.9)
          .offset(this.random(0, 1))
          .map_range(0, 0.8),
      });
      this.root.addChild(obj);
    }
  }

  _set_style() {
    const width = this.random(this.em(8), this.em(20));
    const height = this.em(300);
    this.settings.forEach((g) => {
      (g.obj as Graphics)
        .clear()
        .beginFill(this.color)
        .moveTo(0, 0)
        .lineTo(-width / 2, height)
        .lineTo(width / 2, height)
        .lineTo(0, 0)
        .closePath()
        .endFill();
      const rotation = this.random(0, 2 * Math.PI);
      const distance = this.random(0.3, 0.45);
      g.obj.rotation = rotation;
      g.obj.position.x =
        Math.sin(-rotation) * this.stage_size[0] * distance +
        0.5 * this.stage_size[0];
      g.obj.position.y =
        Math.cos(-rotation) * this.stage_size[1] * distance +
        0.5 * this.stage_size[1];
    });
  }
}

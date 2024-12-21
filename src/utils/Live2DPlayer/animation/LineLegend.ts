import BaseAnimation from "./BaseAnimation";
import { BlurFilter, Graphics } from "pixi.js";
import { Curve } from "./Curve";
import type { AnimationObj } from "../types.d";

export default class LineLegend extends BaseAnimation {
  private color: number;
  private color2: number;
  constructor(direction: string, color: number, color2?: number) {
    super({});
    this.period_ms = 400;
    this.color = color;
    this.color2 = color2 ? color2 : color;
    const blur = new BlurFilter();
    blur.blur = 0.5;
    blur.resolution = 2;
    this.root.filters = [blur];
    this.settings = [];
    for (let i = 0; i < 40; i++) {
      const obj = new Graphics();
      const start_time = this.random(0, 1);
      const distance = this.random(1, 2);
      const position = this.random(0, 1);

      const line: AnimationObj = {
        obj,
      };
      switch (direction) {
        case "up":
          {
            obj.angle = 0;
            line.x = () => this.stage_size[0] * position;
            line.y_curve = new Curve()
              .offset(start_time)
              .map_range(1, 1 - distance);
          }
          break;
        case "down":
          {
            obj.angle = 180;
            line.x = () => this.stage_size[0] * position;
            line.y_curve = new Curve()
              .offset(start_time)
              .map_range(0, distance);
          }
          break;
        case "left":
          {
            obj.angle = 270;
            line.y = () => this.stage_size[1] * position;
            line.x_curve = new Curve()
              .offset(start_time)
              .map_range(1, 1 - distance);
          }
          break;
        case "right":
          {
            obj.angle = 90;
            line.y = () => this.stage_size[1] * position;
            line.x_curve = new Curve()
              .offset(start_time)
              .map_range(0, distance);
          }
          break;
      }
      this.settings.push(line);
      this.root.addChild(obj);
    }
    console.log(this.root);
  }

  _set_style() {
    const width = this.random(this.em(0.5), this.em(1.5));
    const height = this.random(this.em(200), this.em(400));
    this.settings.forEach((g) => {
      (g.obj as Graphics)
        .clear()
        .beginFill(this.random(0, 1) > 0.3 ? this.color : this.color2)
        .drawRect(0, 0, width, height)
        .endFill();
    });
  }
}

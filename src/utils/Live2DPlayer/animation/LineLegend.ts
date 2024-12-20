import BaseAnimation from "./BaseAnimation";
import { BlurFilter, Graphics } from "pixi.js";
import { Curve } from "./Curve";

export default class LineLegend extends BaseAnimation {
  structure: {
    line: Graphics[];
  };
  private settings: {
    obj: Graphics;
    start_time: number;
    position: number;
    distance: number;
    direction: string;
  }[];
  private color: number;
  private color2: number;
  constructor(direction: string, color: number, color2?: number) {
    super({});
    this.period_ms = 500;
    this.color = color;
    this.color2 = color2 ? color2 : color;
    const blur = new BlurFilter();
    blur.blur = 0.5;
    blur.resolution = 2;
    this.root.filters = [blur];

    this.structure = {
      line: [],
    };

    this.settings = [];
    for (let i = 0; i < 40; i++) {
      const obj = new Graphics();
      obj.alpha = 0;
      this.settings.push({
        obj,
        start_time: this.random(0, 1),
        position: this.random(0, 1),
        distance: this.random(1, 2),
        direction,
      });
      this.root.addChild(obj);
      this.structure.line.push(obj);
    }
  }

  set_style(stage_size: [number, number]) {
    this.stage_size = stage_size;
    const width = this.random(this.em(0.5), this.em(1.5));
    const height = this.random(this.em(200), this.em(400));
    this.settings.forEach((g) => {
      g.obj
        .clear()
        .beginFill(this.random(0, 1) > 0.3 ? this.color : this.color2)
        .drawRect(0, 0, width, height)
        .endFill();
      switch (g.direction) {
        case "up":
          {
            g.obj.position.x = this.stage_size[0] * g.position;
            g.obj.angle = 0;
          }
          break;
        case "down":
          {
            g.obj.position.x = this.stage_size[0] * g.position;
            g.obj.angle = 180;
          }
          break;
        case "left":
          {
            g.obj.position.y = this.stage_size[1] * g.position;
            g.obj.angle = 270;
          }
          break;
        case "right":
          {
            g.obj.position.y = this.stage_size[1] * g.position;
            g.obj.angle = 90;
          }
          break;
      }
    });
  }
  animation(t: number) {
    this.settings.forEach((g) => {
      g.obj.alpha = 1;
      switch (g.direction) {
        case "up":
          {
            g.obj.position.y = new Curve()
              .offset(g.start_time)
              .map_range(
                this.stage_size[1],
                this.stage_size[1] * (1 - g.distance)
              )
              .p(t);
          }
          break;
        case "down":
          {
            g.obj.position.y = new Curve()
              .offset(g.start_time)
              .map_range(0, this.stage_size[1] * g.distance)
              .p(t);
          }
          break;
        case "left":
          {
            g.obj.position.x = new Curve()
              .offset(g.start_time)
              .map_range(
                this.stage_size[0],
                this.stage_size[0] * (1 - g.distance)
              )
              .p(t);
          }
          break;
        case "right":
          {
            g.obj.position.x = new Curve()
              .offset(g.start_time)
              .map_range(0, this.stage_size[0] * g.distance)
              .p(t);
          }
          break;
      }
    });
  }
}

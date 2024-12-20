import BaseAnimation from "./BaseAnimation";
import { BlurFilter, Graphics } from "pixi.js";
import { Curve, CurveFunction } from "./Curve";

export default class Line extends BaseAnimation {
  structure: {
    line: Graphics[];
  };
  private settings: {
    obj: Graphics;
    start_time: number;
  }[];
  private curve: Curve;
  private color: number;
  constructor(color: number) {
    super({});
    this.color = color;

    const blur = new BlurFilter();
    blur.blur = 2;
    blur.resolution = 2;
    this.root.filters = [blur];

    this.structure = {
      line: [],
    };

    this.settings = [];
    for (let i = 0; i < 30; i++) {
      const obj = new Graphics();
      obj.alpha = 0;
      this.settings.push({
        obj,
        start_time: Math.random(),
      });
      this.root.addChild(obj);
      this.structure.line.push(obj);
    }

    const base_curve: CurveFunction = (t) => (t < 0.8 ? t / 0.8 : 1);
    this.curve = new Curve(base_curve);
    this.curve = this.curve.bounce().shrink(0.9);
  }

  set_style(stage_size: [number, number]) {
    this.stage_size = stage_size;
    const width = this.random(this.em(8), this.em(20));
    const height = this.em(300);
    this.settings.forEach((g) => {
      g.obj
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
        Math.sin(-rotation) * stage_size[0] * distance + 0.5 * stage_size[0];
      g.obj.position.y =
        Math.cos(-rotation) * stage_size[1] * distance + 0.5 * stage_size[1];
    });
  }
  animation(t: number) {
    this.settings.forEach((g) => {
      g.obj.alpha = this.curve.offset(g.start_time).map_range(0, 0.8).p(t);
    });
  }
}

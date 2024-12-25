import BaseAnimation from "./BaseAnimation";
import { Curve } from "./Curve";
import { ColorMatrix, ColorMatrixFilter, Sprite } from "pixi.js";
import type { ILive2DTexture } from "../types.d";
import { texture_slice } from "./utils";

function circle_random(min: number, max: number) {
  return Math.sqrt(Math.random()) * (max - min) + min;
}

export default class Sekai extends BaseAnimation {
  constructor(textures: ILive2DTexture[], out = true, period_ms: number) {
    super({ textures });
    this.loop = false;
    this.period_ms = period_ms;

    // triangle
    const tri_textures = texture_slice(
      this.textures.find((a) => a.identifer === "ui/tex_scenario_tri_01")!
        .texture.baseTexture,
      [4, 4],
      10
    );
    let tri_s_yellow = Array.from({ length: 5 }).map(
      (_) => new Sprite(tri_textures[0])
    );
    tri_s_yellow = tri_s_yellow.concat(
      Array.from({ length: 5 }).map((_) => new Sprite(tri_textures[4]))
    );
    tri_s_yellow.forEach((t) => {
      const filter = new ColorMatrixFilter();
      const R = [1, 0, 0, 0, 0];
      const G = [0, 1, 0, 0, 0];
      const B = [0, 0, 0.6, 0, 0];
      const A = [0, 0, 0, 1, 0];
      filter.matrix = R.concat(G, B, A) as ColorMatrix;
      t.filters = [filter];
    });
    let tri_s = Array.from({ length: 50 }).map(
      (_) =>
        new Sprite(
          tri_textures[Math.floor(this.random(0, tri_textures.length))]
        )
    );
    tri_s = tri_s.concat(tri_s_yellow);
    tri_s.forEach((t) => {
      t.alpha = 1;
      t.anchor.set(0.5, 0.5);
      this.root.addChild(t);
    });

    // animation
    const alpha_curve = new Curve().shrink(0.2, 1).reverse();
    if (out) {
      tri_s.forEach((tri) => {
        const scale = this.random(35, 80);
        const ratio = this.random(0.4, 1.6);
        const angle_from = this.random(0, 180);
        const angle_to = this.random(180, 270);
        const radian = this.random(0, Math.PI / 2);
        const radius = circle_random(0.4, 1.4);
        const curve = new Curve().easeOutExpo();
        this.settings.push({
          obj: tri,
          x_func: (t) =>
            curve
              .map_range(
                this.stage_size[0] + this.em(scale),
                this.stage_size[0] -
                  this.stage_size[0] * radius * Math.cos(radian)
              )
              .p(t),
          y_func: (t) =>
            curve
              .map_range(
                this.stage_size[1] + this.em(scale),
                this.stage_size[1] -
                  this.stage_size[1] * radius * Math.sin(radian)
              )
              .p(t),
          scale_x: () => this.em(scale) / 128, // 128: size of the texture
          scale_y: () => (this.em(scale) * ratio) / 128, // 128: size of the texture
          angle_curve: new Curve().map_range(angle_from, angle_to),
          alpha_curve,
        });
      });
    } else {
      tri_s.forEach((tri) => {
        const scale = this.random(35, 80);
        const ratio = this.random(0.4, 1.6);
        const init_angle = this.random(0, 180);
        const radian = this.random(0, Math.PI / 2);
        const radius = circle_random(0.2, 1.4);
        const radius_increase = circle_random(0.2, 0.5);
        const curve = new Curve();
        this.settings.push({
          obj: tri,
          x_func: (t) =>
            curve
              .map_range(
                this.stage_size[0] -
                  this.stage_size[0] * radius * Math.cos(radian),
                this.stage_size[0] -
                  this.stage_size[0] *
                    (radius + radius_increase) *
                    Math.cos(radian)
              )
              .p(t),
          y_func: (t) =>
            curve
              .map_range(
                this.stage_size[1] -
                  this.stage_size[1] * radius * Math.sin(radian),
                this.stage_size[1] -
                  this.stage_size[1] *
                    (radius + radius_increase) *
                    Math.sin(radian)
              )
              .p(t),
          scale_x: () => this.em(scale) / 128, // 128: size of the texture
          scale_y: () => (this.em(scale) * ratio) / 128, // 128: size of the texture
          angle_curve: curve.map_range(init_angle, init_angle + 360),
          alpha_curve,
        });
      });
    }
  }
}

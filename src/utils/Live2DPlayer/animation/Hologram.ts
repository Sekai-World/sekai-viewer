import {
  Container,
  Sprite,
  BlurFilter,
  ColorMatrix,
  ColorMatrixFilter,
} from "pixi.js";
import BaseAnimation from "./BaseAnimation";
import { Curve } from "./Curve";
import { texture_slice } from "./utils";
import type { ILive2DTexture } from "../types.d";

/**
 * - hologram: Container
 *   - light1: Container
 *     - light1_s: Sprite
 *   - light2: Container
 *     - light2_s: Sprite
 *   - tri: Container
 *     - tri_s[0]: Sprite
 *     - tri_s[1]: Sprite
 *     - tri_s[2]: Sprite
 *     - tri_s[3]: Sprite
 *     - tri_s[4]: Sprite
 *     - tri_s[5]: Sprite
 *     - tri_s[6]: Sprite
 *     - tri_s[7]: Sprite
 *   - sparkle: Container
 *     - sp_s[0]: Sprite
 *     - sp_s[1]: Sprite
 *     - sp_s[2]: Sprite
 */
export default class Hologram extends BaseAnimation {
  constructor(textures: ILive2DTexture[]) {
    super({ textures });
    this.period_ms = 4000;
    const blur = new BlurFilter(1);
    blur.resolution = 2;
    // layer light1
    const light1_container = new Container();
    const light1_s = new Sprite(
      this.textures.find(
        (a) => a.identifer === "ui/tex_scenario_light"
      )!.texture
    );
    light1_s.anchor.set(0.5, 1);
    light1_container.addChild(light1_s);
    // light1 animation
    this.settings.push({
      obj: light1_s,
      y: () => this.stage_size[1] * 0.25,
      scale: () => this.em(600) / 256, // 256: size of the texture
    });
    this.settings.push({
      obj: light1_container,
      scale_x_curve: new Curve().map_range(0.9, 1.2),
      scale_y_curve: new Curve().map_range(1, 1.1),
      alpha_curve: new Curve().bounce().map_range(0, 0.8),
    });

    // layer light2
    const light2_container = new Container();
    const light2_s = new Sprite(
      this.textures.find(
        (a) => a.identifer === "ui/tex_scenario_light"
      )!.texture
    );
    light2_s.anchor.set(0.5, 1);
    light2_container.addChild(light2_s);
    // light2 animation
    this.settings.push({
      obj: light2_s,
      y: () => this.stage_size[1] * 0.25,
      scale: () => this.em(600) / 256, // 256: size of the texture
    });
    this.settings.push({
      obj: light2_container,
      scale_x_curve: new Curve().offset(0.5).map_range(0.9, 1.2),
      scale_y_curve: new Curve().offset(0.5).map_range(1, 1.1),
      alpha_curve: new Curve().bounce().offset(0.5).map_range(0, 0.8),
    });

    // layer tri
    const tri_container = new Container();
    const tri_s = texture_slice(
      this.textures.find((a) => a.identifer === "ui/tex_scenario_tri_01")!
        .texture.baseTexture,
      [4, 4],
      10
    )
      .filter((_, idx) => [1, 2, 3, 5, 6, 7, 8, 9].includes(idx))
      .map((t) => new Sprite(t));
    tri_s.forEach((t) => {
      t.alpha = 0;
      t.anchor.set(0.5, 0.5);
      tri_container.addChild(t);
    });
    // tri animation
    let scale = 0;
    scale = this.random(35, 60);
    this.settings.push({
      obj: tri_s[0],
      x_func: (t) => new Curve().map_range(-this.em(50), -this.em(170)).p(t),
      y_func: (t) => new Curve().map_range(0, -this.em(200)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().map_range(0, 180),
      alpha_curve: new Curve().bounce(0.2, 0.2).map_range(0, 0.4),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: tri_s[1],
      x_func: (t) =>
        new Curve().offset(0.6).map_range(-this.em(50), -this.em(200)).p(t),
      y_func: (t) => new Curve().offset(0.6).map_range(0, -this.em(180)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.6).map_range(43, 210),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.6).map_range(0, 0.4),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: tri_s[2],
      x_func: (t) =>
        new Curve().offset(0.4).map_range(-this.em(50), -this.em(230)).p(t),
      y_func: (t) => new Curve().offset(0.4).map_range(0, -this.em(160)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.4).map_range(0, 250),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.4).map_range(0, 0.4),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: tri_s[3],
      x_func: (t) =>
        new Curve().offset(0.2).map_range(this.em(50), this.em(170)).p(t),
      y_func: (t) => new Curve().offset(0.2).map_range(0, -this.em(200)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.2).map_range(100, 280),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.2).map_range(0, 0.4),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: tri_s[4],
      x_func: (t) =>
        new Curve().offset(0.8).map_range(this.em(50), this.em(200)).p(t),
      y_func: (t) => new Curve().offset(0.8).map_range(0, -this.em(180)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.8).map_range(50, 290),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.8).map_range(0, 0.4),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: tri_s[5],
      x_func: (t) =>
        new Curve().offset(0.3).map_range(this.em(50), this.em(230)).p(t),
      y_func: (t) => new Curve().offset(0.3).map_range(0, -this.em(160)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.3).map_range(200, 300),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.3).map_range(0, 0.4),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: tri_s[6],
      x_func: (t) =>
        new Curve().offset(0.3).map_range(-this.em(50), -this.em(150)).p(t),
      y_func: (t) => new Curve().offset(0.3).map_range(0, -this.em(140)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.3).map_range(170, 290),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.3).map_range(0, 0.4),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: tri_s[7],
      x_func: (t) =>
        new Curve().offset(0.7).map_range(this.em(50), this.em(150)).p(t),
      y_func: (t) => new Curve().offset(0.7).map_range(0, -this.em(140)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.7).map_range(0, 120),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.7).map_range(0, 0.4),
    });

    // layer sparkle
    const sparkle_container = new Container();
    const sparkle_texture = this.textures.find(
      (a) => a.identifer === "ui/tex_scenario_kira"
    )!.texture;
    const sp_s = Array.from({ length: 3 }, () => new Sprite(sparkle_texture));
    sp_s.forEach((t) => {
      t.alpha = 1;
      t.anchor.set(0.5, 0.5);
      sparkle_container.addChild(t);
    });
    // sparkle animation
    scale = this.random(35, 60);
    this.settings.push({
      obj: sp_s[0],
      x_func: (t) => new Curve().offset(0).map_range(0, this.em(80)).p(t),
      y_func: (t) => new Curve().offset(0).map_range(0, -this.em(140)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0).map_range(0, 120),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0).map_range(0, 1),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: sp_s[1],
      x_func: (t) => new Curve().offset(0.3).map_range(0, -this.em(80)).p(t),
      y_func: (t) => new Curve().offset(0.3).map_range(0, -this.em(140)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.3).map_range(120, 240),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.3).map_range(0, 1),
    });
    scale = this.random(35, 60);
    this.settings.push({
      obj: sp_s[2],
      x_func: (t) => new Curve().offset(0.7).map_range(0, this.em(20)).p(t),
      y_func: (t) => new Curve().offset(0.7).map_range(0, -this.em(140)).p(t),
      scale: () => this.em(scale) / 128, // 128: size of the texture
      angle_curve: new Curve().offset(0.7).map_range(240, 360),
      alpha_curve: new Curve().bounce(0.2, 0.2).offset(0.7).map_range(0, 1),
    });

    // layer root
    const filter = new ColorMatrixFilter();
    this.root.filters = [filter];
    /*
    R = a*R + b*G + c*B + d*A + e
    G = f*R + g*G + h*B + i*A + j
    B = k*R + l*G + m*B + n*A + o
    A = p*R + q*G + r*B + s*A + t
    */
    const R = [0.9, 0, 0, 0, 0];
    const G = [0, 0.9, 0, 0, 0];
    const B = [0, 0, 1, 0, 0];
    const A = [0, 0, 0, 1, 0];
    filter.matrix = R.concat(G, B, A) as ColorMatrix;
    filter.resolution = 2;
    this.root.addChild(sparkle_container);
    this.root.addChild(tri_container);
    this.root.addChild(light1_container);
    this.root.addChild(light2_container);
  }
}

import BaseAnimation from "./BaseAnimation";
import { Sprite, Texture, Rectangle } from "pixi.js";
import { Curve } from "./Curve";
import type { ILive2DTexture } from "../types.d";

export default class LightupLegend extends BaseAnimation {
  constructor(textures: ILive2DTexture[], fog_type: string) {
    super({ textures });
    this.period_ms = 10000;

    const base_texture = this.textures.find(
      (a) => a.identifer === "ui/tex_light_up_legend"
    )!.texture.baseTexture;
    const fog_t = new Texture(base_texture, new Rectangle(0, 0, 256, 256));
    const camera_light_t = new Texture(
      base_texture,
      new Rectangle(256, 0, 256, 256)
    );
    const camera_light2_t = new Texture(
      base_texture,
      new Rectangle(0, 256, 256, 256)
    );

    const camera_light = new Sprite(camera_light_t);
    this.settings.push({
      obj: camera_light,
      scale: () => (this.stage_size[1] / 256) * 0.7,
    });
    const camera_light2 = new Sprite(camera_light2_t);
    this.settings.push({
      obj: camera_light2,
      scale: () => (this.stage_size[1] / 256) * 0.7,
      x: () => this.stage_size[0] * 0.6,
      y: () => this.stage_size[1] * 0.2,
      alpha_curve: new Curve().bounce().loop(4).map_range(0.7, 1),
    });

    const fog_l = [];

    fog_l.push({
      obj: new Sprite(fog_t),
      scale: 1,
      position: [0.1, 1],
      position_to: [0.2, 1],
      start_time: 0,
    });
    fog_l.push({
      obj: new Sprite(fog_t),
      scale: 0.9,
      position: [0.3, 1.1],
      position_to: [0.35, 0.9],
      start_time: 0.25,
    });
    fog_l.push({
      obj: new Sprite(fog_t),
      scale: 1,
      position: [0.4, 1],
      position_to: [0.49, 0.9],
      start_time: 0.5,
    });
    fog_l.push({
      obj: new Sprite(fog_t),
      scale: 0.9,
      position: [0.7, 1.2],
      position_to: [0.75, 1.15],
      start_time: 0.65,
    });
    fog_l.push({
      obj: new Sprite(fog_t),
      scale: 1,
      position: [0.9, 0.9],
      position_to: [0.82, 1],
      start_time: 0.85,
    });
    if (fog_type === "corner") {
      fog_l.forEach((s) => {
        const factor = 0.5;
        s.position[0] =
          s.position[0] < 0.5
            ? s.position[0] * factor
            : 1 - (1 - s.position[0]) * factor;
        s.position_to[0] =
          s.position_to[0] < 0.5
            ? s.position_to[0] * factor
            : 1 - (1 - s.position_to[0]) * factor;
      });
    }
    fog_l.forEach((s) => {
      this.root.addChild(s.obj);
      s.obj.anchor.set(0.5);
      const curve = new Curve().shrink(0.99, 1).offset(s.start_time);
      this.settings.push({
        obj: s.obj,
        scale: () => (this.stage_size[1] / 256) * 1.2 * s.scale,
        x_curve: curve.map_range(s.position[0], s.position_to[0]),
        y_curve: curve.map_range(s.position[1], s.position_to[1]),
        alpha_curve: new Curve()
          .bounce(0.1, 0.1)
          .shrink(0.99, 0)
          .offset(s.start_time)
          .map_range(0, 0.6),
      });
    });

    this.root.addChild(camera_light);
    this.root.addChild(camera_light2);
  }
}

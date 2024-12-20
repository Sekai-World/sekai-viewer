import BaseAnimation from "./BaseAnimation";
import { Sprite, Texture, Rectangle } from "pixi.js";
import { Curve } from "./Curve";
import type { ILive2DTexture } from "../types.d";

export default class LightupLegend extends BaseAnimation {
  structure: {
    camera_light: Sprite;
    camera_light2: Sprite;
  };
  private settings: {
    obj: Sprite;
    scale: number;
    position: [number, number];
    position_to: [number, number];
    start_time: number;
  }[];
  constructor(textures: ILive2DTexture[], fog_type: string) {
    super({ textures });
    this.period_ms = 10000;

    const base_texture = this.textures.find(
      (a) => a.identifer === "ui/light_up_legend"
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
    const camera_light2 = new Sprite(camera_light2_t);
    this.structure = { camera_light, camera_light2 };
    this.settings = [];
    this.settings.push({
      obj: new Sprite(fog_t),
      scale: 1,
      position: [0.1, 1],
      position_to: [0.2, 1],
      start_time: 0,
    });
    this.settings.push({
      obj: new Sprite(fog_t),
      scale: 0.9,
      position: [0.3, 1.1],
      position_to: [0.35, 0.9],
      start_time: 0.25,
    });
    this.settings.push({
      obj: new Sprite(fog_t),
      scale: 1,
      position: [0.4, 1],
      position_to: [0.49, 0.9],
      start_time: 0.5,
    });
    this.settings.push({
      obj: new Sprite(fog_t),
      scale: 0.9,
      position: [0.7, 1.2],
      position_to: [0.75, 1.15],
      start_time: 0.65,
    });
    this.settings.push({
      obj: new Sprite(fog_t),
      scale: 1,
      position: [0.9, 0.9],
      position_to: [0.82, 1],
      start_time: 0.85,
    });
    if (fog_type === "corner") {
      this.settings.forEach((s) => {
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
    this.settings.forEach((s) => {
      this.root.addChild(s.obj);
      s.obj.anchor.set(0.5);
    });
    this.root.addChild(camera_light);
    this.root.addChild(camera_light2);
  }

  set_style(stage_size: [number, number]) {
    this.stage_size = stage_size;
    this.structure.camera_light.scale.set((this.stage_size[1] / 256) * 0.7);
    this.structure.camera_light2.scale.set((this.stage_size[1] / 256) * 0.7);
    this.structure.camera_light2.position.x = this.stage_size[0] * 0.6;
    this.structure.camera_light2.position.y = this.stage_size[1] * 0.2;
    this.settings.forEach((s) => {
      s.obj.scale.set((this.stage_size[1] / 256) * 1.2 * s.scale);
    });
  }

  animation(t: number) {
    this.settings.forEach((s) => {
      const curve = new Curve().shrink(0.99, 1).offset(s.start_time);
      s.obj.position.x =
        this.stage_size[0] *
        curve.map_range(s.position[0], s.position_to[0]).p(t);
      s.obj.position.y =
        this.stage_size[1] *
        curve.map_range(s.position[1], s.position_to[1]).p(t);
      const alpha_curve = new Curve()
        .bounce(0.1, 0.1)
        .shrink(0.99, 0)
        .offset(s.start_time)
        .map_range(0, 0.6);
      s.obj.alpha = alpha_curve.p(t);
    });
    const alpha_curve = new Curve().bounce().loop(4).map_range(0.7, 1);
    this.structure.camera_light2.alpha = alpha_curve.p(t);
  }
}

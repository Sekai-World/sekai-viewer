import BaseAnimation from "./BaseAnimation";
import { Sprite, Texture, Rectangle } from "pixi.js";
import { Curve } from "./Curve";
import type { ILive2DTexture } from "../types.d";

export default class Kirakira extends BaseAnimation {
  structure: Record<string, never>;
  private settings: {
    obj: Sprite;
    type: "shine" | "not shine" | "show";
    scale: number;
    scale_to: number;
    position: [number, number];
    position_to: [number, number];
    start_time: number;
  }[];
  private moving_type: string;
  constructor(textures: ILive2DTexture[], moving_type: string) {
    super({ textures });
    this.period_ms = 10000;
    this.moving_type = moving_type;

    const base_texture = this.textures.find(
      (a) => a.identifer === "ui/kirakira_01"
    )!.texture.baseTexture;
    const texture_big_circle = new Texture(
      base_texture,
      new Rectangle(0, 256, 256, 256)
    );
    const texture_big_sparkle = new Texture(
      base_texture,
      new Rectangle(256, 0, 256, 256)
    );
    const texture_small_circle = new Texture(
      base_texture,
      new Rectangle(128, 0, 128, 128)
    );
    const texture_small_sparkle = new Texture(
      base_texture,
      new Rectangle(0, 0, 128, 128)
    );

    this.structure = {};
    this.settings = [];
    // background not move sparkle
    for (let i = 0; i < 15; i++) {
      const obj = new Sprite(texture_small_sparkle);
      obj.alpha = 0;
      obj.anchor.set(0.5);
      const scale = this.random(0.5, 1);
      const position: [number, number] = [this.random(0, 1), this.random(0, 1)];
      const distance = this.random(0.05, 0.1);
      const rotation = this.random(0, 2 * Math.PI);
      const position_to: [number, number] = [
        position[0] + Math.cos(rotation) * distance,
        position[1] + Math.sin(rotation) * distance,
      ];
      this.settings.push({
        obj,
        type: "not shine",
        scale: scale,
        scale_to: scale,
        position: position,
        position_to: position_to,
        start_time: this.random(0, 1),
      });
      this.root.addChild(obj);
    }
    // background not move small circle
    for (let i = 0; i < 15; i++) {
      const obj = new Sprite(texture_small_circle);
      obj.alpha = 0;
      obj.anchor.set(0.5);
      const scale = this.random(0.5, 1);
      const position: [number, number] = [this.random(0, 1), this.random(0, 1)];
      const distance = this.random(0.05, 0.1);
      const rotation = this.random(0, 2 * Math.PI);
      const position_to: [number, number] = [
        position[0] + Math.cos(rotation) * distance,
        position[1] + Math.sin(rotation) * distance,
      ];
      this.settings.push({
        obj,
        type: "not shine",
        scale: scale,
        scale_to: scale,
        position: position,
        position_to: position_to,
        start_time: this.random(0, 1),
      });
      this.root.addChild(obj);
    }
    // background not move big circle
    for (let i = 0; i < 10; i++) {
      const obj = new Sprite(texture_big_circle);
      obj.alpha = 0;
      obj.anchor.set(0.5);
      const scale = this.random(0.4, 1.2);
      const position: [number, number] = [this.random(0, 1), this.random(0, 1)];
      const distance = this.random(0.05, 0.1);
      const rotation = this.random(0, 2 * Math.PI);
      const position_to: [number, number] = [
        position[0] + Math.cos(rotation) * distance,
        position[1] + Math.sin(rotation) * distance,
      ];
      this.settings.push({
        obj,
        type: "not shine",
        scale: scale,
        scale_to: scale,
        position: position,
        position_to: position_to,
        start_time: this.random(0, 1),
      });
      this.root.addChild(obj);
    }
    // background moving sparkle
    for (let i = 0; i < 20; i++) {
      const obj = new Sprite(texture_big_sparkle);
      obj.alpha = 0;
      obj.anchor.set(0.5);
      const scale = this.random(0.6, 1);
      const position: [number, number] = [this.random(0, 1), this.random(0, 1)];
      const distance = this.random(0.05, 0.2);
      const rotation = this.random(0, 2 * Math.PI);
      const position_to: [number, number] = [
        position[0] + Math.cos(rotation) * distance,
        position[1] + Math.sin(rotation) * distance,
      ];
      this.settings.push({
        obj,
        type: "shine",
        scale: scale,
        scale_to: scale,
        position: position,
        position_to: position_to,
        start_time: this.random(0, 1),
      });
      this.root.addChild(obj);
    }
    if (this.moving_type !== "still") {
      // show big circle
      for (let i = 0; i < 15; i++) {
        const obj = new Sprite(texture_big_circle);
        obj.alpha = 0;
        obj.anchor.set(0.5);
        const scale = this.random(0.6, 1);
        const distance = this.random(0.3, 0.5);
        const rotation = this.random(0, 2 * Math.PI);
        let position: [number, number] = [0.5, 0.5];
        let position_to: [number, number] = [
          0.5 + Math.cos(rotation) * distance,
          0.5 + Math.sin(rotation) * distance,
        ];
        if (this.moving_type === "inward") {
          const t = position;
          position = position_to;
          position_to = t;
        }
        this.settings.push({
          obj,
          type: "show",
          scale: 0.1,
          scale_to: scale,
          position: position,
          position_to: position_to,
          start_time: 0,
        });
        this.root.addChild(obj);
      }
      // show sparkle
      for (let i = 0; i < 15; i++) {
        const obj = new Sprite(texture_big_sparkle);
        obj.alpha = 0;
        obj.anchor.set(0.5);
        const scale = this.random(0.6, 1);
        const distance = this.random(0.3, 0.5);
        const rotation = this.random(0, 2 * Math.PI);
        let position: [number, number] = [0.5, 0.5];
        let position_to: [number, number] = [
          0.5 + Math.cos(rotation) * distance,
          0.5 + Math.sin(rotation) * distance,
        ];
        if (this.moving_type === "inward") {
          const t = position;
          position = position_to;
          position_to = t;
        }
        this.settings.push({
          obj,
          type: "show",
          scale: 0.1,
          scale_to: scale,
          position: position,
          position_to: position_to,
          start_time: 0,
        });
        this.root.addChild(obj);
      }
    }
  }

  set_style(stage_size: [number, number]) {
    this.stage_size = stage_size;
  }

  animation(t: number) {
    this.settings.forEach((s) => {
      let curve = new Curve();
      if (s.type === "show") {
        if (this.moving_type === "outward") {
          curve = curve.easeOutExpo().shrink(0.1, 1);
        } else {
          curve = curve.easeOutExpo().shrink(0.1, 1).shrink(0.95).offset(0.05);
        }
      }
      s.obj.position.x = curve
        .map_range(
          this.stage_size[0] * s.position[0],
          this.stage_size[0] * s.position_to[0]
        )
        .p(t);
      s.obj.position.y = curve
        .map_range(
          this.stage_size[1] * s.position[1],
          this.stage_size[1] * s.position_to[1]
        )
        .p(t);
      s.obj.scale.set(
        curve
          .map_range(
            (this.em(150) * s.scale) / 256,
            (this.em(150) * s.scale_to) / 256
          )
          .p(t)
      );

      // alpha
      let curve_alpha = new Curve(() => 1);
      if (s.type === "shine") {
        curve_alpha = new Curve().bounce().loop(5).map_range(0.2, 0.9);
      } else if (s.type === "show" && this.moving_type === "inward") {
        curve_alpha = new Curve()
          .easeOutExpo()
          .shrink(0.1, 1)
          .shrink(0.95)
          .offset(0.05)
          .map_range(1, 0);
      }
      const mask_curve = new Curve().bounce(0.05, 0.05);
      s.obj.alpha = curve_alpha.map_range(0, 0.9).p(t) * mask_curve.p(t);
    });
  }
}

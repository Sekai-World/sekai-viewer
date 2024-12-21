import BaseAnimation from "./BaseAnimation";
import { Sprite, Texture, Rectangle } from "pixi.js";
import { Curve } from "./Curve";
import type { ILive2DTexture } from "../types.d";

export default class Kirakira extends BaseAnimation {
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

    // background not move sparkle
    for (let i = 0; i < 15; i++) {
      const obj = new Sprite(texture_small_sparkle);
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
        scale: () => (scale * this.em(150)) / 256,
        x_curve: new Curve().map_range(position[0], position_to[0]),
        y_curve: new Curve().map_range(position[1], position_to[1]),
      });
      this.root.addChild(obj);
    }
    // background not move small circle
    for (let i = 0; i < 15; i++) {
      const obj = new Sprite(texture_small_circle);
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
        scale: () => (scale * this.em(150)) / 256,
        x_curve: new Curve().map_range(position[0], position_to[0]),
        y_curve: new Curve().map_range(position[1], position_to[1]),
      });
      this.root.addChild(obj);
    }
    // background not move big circle
    for (let i = 0; i < 10; i++) {
      const obj = new Sprite(texture_big_circle);
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
        scale: () => (scale * this.em(150)) / 256,
        x_curve: new Curve().map_range(position[0], position_to[0]),
        y_curve: new Curve().map_range(position[1], position_to[1]),
      });
      this.root.addChild(obj);
    }
    // background moving sparkle
    for (let i = 0; i < 20; i++) {
      const obj = new Sprite(texture_big_sparkle);
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
        scale: () => (scale * this.em(150)) / 256,
        x_curve: new Curve().map_range(position[0], position_to[0]),
        y_curve: new Curve().map_range(position[1], position_to[1]),
        alpha_curve: new Curve().bounce().loop(5).map_range(0.2, 0.9),
      });
      this.root.addChild(obj);
    }
    if (this.moving_type !== "still") {
      let curve = new Curve();
      if (this.moving_type === "outward") {
        curve = curve.easeOutExpo().shrink(0.1, 1);
      } else {
        curve = curve.easeOutExpo().shrink(0.1, 1).shrink(0.95).offset(0.05);
      }
      // show big circle
      for (let i = 0; i < 15; i++) {
        const obj = new Sprite(texture_big_circle);
        obj.anchor.set(0.5);
        const scale = this.random(0.6, 1);
        const distance = this.random(0.3, 0.5);
        const rotation = this.random(0, 2 * Math.PI);
        let position: [number, number] = [0.5, 0.5];
        let position_to: [number, number] = [
          0.5 + Math.cos(rotation) * distance,
          0.5 + Math.sin(rotation) * distance,
        ];
        let curve_alpha = new Curve(() => 1);
        if (this.moving_type === "inward") {
          const t = position;
          position = position_to;
          position_to = t;
          curve_alpha = new Curve()
            .easeOutExpo()
            .shrink(0.1, 1)
            .shrink(0.95)
            .offset(0.05)
            .map_range(1, 0);
        }
        this.settings.push({
          obj,
          scale_func: (t) =>
            curve
              .map_range(
                (this.em(150) * 0.1) / 256,
                (this.em(150) * scale) / 256
              )
              .p(t),
          x_curve: curve.map_range(position[0], position_to[0]),
          y_curve: curve.map_range(position[1], position_to[1]),
          alpha_curve: curve_alpha,
        });
        this.root.addChild(obj);
      }
      // show sparkle
      for (let i = 0; i < 15; i++) {
        const obj = new Sprite(texture_big_sparkle);

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
          scale_func: (t) =>
            curve
              .map_range(
                (this.em(150) * 0.1) / 256,
                (this.em(150) * scale) / 256
              )
              .p(t),
          x_curve: curve.map_range(position[0], position_to[0]),
          y_curve: curve.map_range(position[1], position_to[1]),
        });
        this.root.addChild(obj);
      }
    }

    // add alpha mask
    const mask_curve = new Curve().bounce(0.05, 0.05);
    this.settings.forEach((s) => {
      if (s.alpha_curve) {
        s.alpha_curve = s.alpha_curve.multiply(mask_curve);
      } else {
        s.alpha_curve = mask_curve;
      }
    });
  }
}

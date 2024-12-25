import { Sprite, Graphics, Container } from "pixi.js";
import BaseLayer from "./BaseLayer";
import type { ILive2DLayerData } from "../types.d";
import { Curve } from "../animation/Curve";

export default class Wipe extends BaseLayer {
  structure: {
    container?: Container;
    wipe?: Sprite;
    bulk?: Graphics;
  };
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
  }

  draw() {
    this.root.removeChildren();
    const wipe = new Sprite(
      this.textures.find((a) => a.identifer === "ui/black_wipe")!.texture
    );
    this.structure.wipe = wipe;

    const bulk = new Graphics();
    this.structure.bulk = bulk;

    const container = new Container();
    container.alpha = 0;
    this.structure.container = container;
    container.addChild(wipe);
    container.addChild(bulk);
    this.root.addChild(container);

    this.init = true;
    this.set_style();
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init) {
      const bg = this.structure.wipe!;
      bg.scale.set(this.stage_size[1] / 2000);

      const bulk = this.structure.bulk!;
      bulk
        .clear()
        .beginFill(0x000000)
        .drawRect(0, 0, this.stage_size[0], this.stage_size[1])
        .endFill();
    }
  }
  async animate(
    show: boolean,
    black_direction: "left" | "right" | "top" | "bottom",
    time_ms: number
  ) {
    const bg = this.structure.wipe!;
    const container = this.structure.container!;
    container.position.set(0);
    // set move distance and scale
    let length = 0;
    if (black_direction === "left" || black_direction === "right") {
      bg.scale.set(this.stage_size[1] / 2000);
      length = this.stage_size[0] + bg.width;
    } else {
      bg.scale.set(this.stage_size[0] / 2000);
      length = this.stage_size[1] + bg.height;
    }
    // set asset direction and position
    if (black_direction === "left") {
      bg.angle = 0;
      bg.position.set(this.stage_size[0], 0);
    } else if (black_direction === "right") {
      bg.angle = 180;
      bg.position.set(0, this.stage_size[1]);
    } else if (black_direction === "top") {
      bg.angle = 90;
      bg.position.set(this.stage_size[0], this.stage_size[1]);
    } else if (black_direction === "bottom") {
      bg.angle = 270;
      bg.position.set(0, 0);
    }

    // set curve
    let curve: Curve;
    if (black_direction === "left" || black_direction === "top")
      curve = new Curve().map_range(-length, 0);
    else curve = new Curve().map_range(length, 0);
    if (!show) curve = curve.reverse();

    if (show) container.alpha = 1;
    // set position
    if (black_direction === "left" || black_direction === "right") {
      await this.animation_controller.progress_wrapper((t) => {
        container.position.x = curve.p(t);
      }, time_ms);
    } else {
      await this.animation_controller.progress_wrapper((t) => {
        container.position.y = curve.p(t);
      }, time_ms);
    }
    if (!show) container.alpha = 0;
  }
}

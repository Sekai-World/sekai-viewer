import { Graphics, Text, TextStyle } from "pixi.js";
import type { ILive2DLayerData } from "../types.d";
import BaseLayer from "./BaseLayer";

export default class Telop extends BaseLayer {
  structure: {
    bg_graphic?: Graphics;
    text?: Text;
  };
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
  }

  draw(data: string) {
    const container = this.root;
    container.removeChildren();
    const bg_graphic = new Graphics();
    bg_graphic
      .beginFill(0x000000, 0.3)
      .drawRect(0, 0, this.screen_length, this.screen_length)
      .endFill();
    const text = new Text(data);

    container.addChild(bg_graphic);
    container.addChild(text);
    this.structure = {
      bg_graphic,
      text,
    };
    this.init = true;
    this.set_style();
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init) {
      const text = this.structure.text!;
      text.anchor.set(0.5);
      text.x = this.stage_size[0] / 2;
      text.y = this.stage_size[1] / 2;
      text.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(25),
        breakWords: true,
        wordWrap: true,
        wordWrapWidth: this.stage_size[0] * 0.7,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: this.em(2),
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: this.em(2),
      });
      const bg = this.structure.bg_graphic!;
      bg.x = 0;
      bg.y = this.stage_size[1] / 2 - this.em(30);
      bg.scale.set(
        this.stage_size[0] / this.screen_length,
        this.em(60) / this.screen_length
      );
    }
  }
}

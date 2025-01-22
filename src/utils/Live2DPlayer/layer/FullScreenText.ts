import { Container, Text, TextStyle, Graphics } from "pixi.js";
import type { ILive2DLayerData } from "../types.d";
import BaseLayer from "./BaseLayer";

export default class FullScreenText extends BaseLayer {
  structure: {
    text_container?: Container;
    text_c?: Text;
    bg_graphic?: Graphics;
  };
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
  }

  draw(text: string) {
    this.root.removeChildren();

    const bg_graphic = new Graphics();
    this.root.addChild(bg_graphic);
    bg_graphic
      .beginFill(0x000000, 1)
      .drawRect(0, 0, this.screen_length, this.screen_length)
      .endFill();

    const text_container = new Container();
    this.root.addChild(text_container);
    const text_c = new Text(text);
    text_container.addChild(text_c);

    this.structure = {
      text_container,
      text_c,
      bg_graphic,
    };
    this.init = true;
    this.set_style();
  }
  draw_new_text(text: string) {
    if (this.init) {
      const new_text = new Text(text);
      this.structure.text_container?.addChild(new_text);
      this.structure.text_c?.destroy();
      this.structure.text_c = new_text;
      this.set_style_text();
    }
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init) {
      const bg = this.structure.bg_graphic!;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(
        this.stage_size[0] / this.screen_length,
        this.stage_size[1] / this.screen_length
      );
      this.set_style_text();
    }
  }
  set_style_text() {
    const text = this.structure.text_c!;
    text.anchor.set(0.5);
    text.x = this.stage_size[0] * 0.5;
    text.y = this.stage_size[1] * 0.5;
    text.style = new TextStyle({
      fill: ["#ffffff"],
      fontSize: this.em(28),
      lineHeight: this.em(28) * 1.3,
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.stage_size[0],
    });
  }

  async animate(text: string) {
    this.draw("");
    for (let i = 1; i <= text.length; i++) {
      // if aborted, jump to full text
      if (this.animation_controller.abort_controller.signal.aborted) {
        i = text.length;
      }
      // new text
      this.draw_new_text(text.slice(0, i));
      await this.animation_controller.delay(50);
    }
  }
}

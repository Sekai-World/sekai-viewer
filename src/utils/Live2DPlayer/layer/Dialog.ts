import { Sprite, Container, Text, TextStyle } from "pixi.js";
import type { ILayerData } from "../types.d";
import BaseLayer from "./BaseLayer";

export default class Dialog extends BaseLayer {
  structure: {
    dialog_container?: Container;
    background?: Sprite;
    underline?: Sprite;
    cn_c?: Text;
    text_container?: Container;
    text_c?: Text;
  };
  constructor(data: ILayerData) {
    super(data);
    this.structure = {};
  }

  draw(cn: string, text: string) {
    const container = this.root;
    container.removeChildren();
    const dialog_container = new Container();
    container.addChild(dialog_container);

    const background_texture = this.textures.find(
      (a) => a.identifer === "ui/text_background"
    )!.texture;
    const background = new Sprite(background_texture);
    const underline_texture = this.textures.find(
      (a) => a.identifer === "ui/text_underline"
    )!.texture;
    const underline = new Sprite(underline_texture);
    const cn_c = new Text(cn);
    const text_container = new Container();
    const text_c = new Text(text);
    text_container.addChild(text_c);
    dialog_container.addChild(background);
    dialog_container.addChild(underline);
    dialog_container.addChild(cn_c);
    dialog_container.addChild(text_container);
    this.structure = {
      dialog_container,
      background,
      underline,
      cn_c,
      text_container,
      text_c,
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
      this.set_style_dialog_text();
    }
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init) {
      const container = this.structure.dialog_container!;
      container.x = 0;
      container.y = this.stage_size[1] * 0.7;
      const bg = this.structure.background!;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(
        this.stage_size[0] / 2000, // 2000 -> ui/text_background width
        (this.stage_size[1] * 0.3) / 2000 // 2000 -> ui/text_background height
      );
      const underline = this.structure.underline!;
      underline.x = this.stage_size[0] * 0.15 - this.em(3);
      underline.y = this.em(24);
      underline.scale.set(
        (this.stage_size[0] * 0.7) / 2000 // 2000 -> ui/text_underline width
      );
      const cn = this.structure.cn_c!;
      cn.x = this.stage_size[0] * 0.15;
      cn.y = this.em(6);
      cn.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(16),
        wordWrap: true,
        wordWrapWidth: this.stage_size[0] * 0.7,
        stroke: "#4a496899",
        strokeThickness: this.em(4),
      });
      this.set_style_dialog_text();
    }
  }
  set_style_dialog_text() {
    const text = this.structure.text_c!;
    text.x = this.stage_size[0] * 0.15 + this.em(3);
    text.y = this.em(35);
    text.style = new TextStyle({
      fill: ["#ffffff"],
      fontSize: this.em(16),
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.stage_size[0] * 0.7,
      stroke: "#4a4968aa",
      strokeThickness: this.em(4),
    });
  }

  async animate(cn: string, text: string) {
    this.draw(cn, "");
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

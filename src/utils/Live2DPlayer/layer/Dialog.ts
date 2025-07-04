import { Sprite, Container, Text, TextStyle } from "pixi.js";
import type { ILive2DLayerData } from "../types.d";
import BaseLayer from "./BaseLayer";

export default class Dialog extends BaseLayer {
  structure: {
    dialog_container?: Container;
    background?: Sprite;
    underline?: Sprite;
    cn_c?: Text;
    text_container?: Container;
    text_c?: Text;
    translated_text_c?: Text;
  };
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
  }

  /**
   * Draw dialog with original text and optional translated text
   * @param cn Character name
   * @param text Original text
   * @param translatedText Optional translated text
   */
  draw(cn: string, text: string, translatedText?: string | null) {
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

    // Create translated text element if translation is provided
    let translated_text_c: Text | undefined;
    if (translatedText) {
      translated_text_c = new Text(translatedText);
      text_container.addChild(translated_text_c);
    }

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
      translated_text_c,
    };
    this.init = true;
    this.set_style();
  }
  draw_new_text(text: string, translatedText?: string | null) {
    if (this.init) {
      const new_text = new Text(text);
      this.structure.text_container?.addChild(new_text);
      this.structure.text_c?.destroy();
      this.structure.text_c = new_text;

      this.structure.translated_text_c?.destroy();
      // Update translated text if provided
      if (translatedText) {
        const new_translated_text = new Text(translatedText);
        this.structure.text_container?.addChild(new_translated_text);
        this.structure.translated_text_c = new_translated_text;
      } else {
        this.structure.translated_text_c = undefined;
      }

      this.set_style_dialog_text();
    }
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    const margin_top =
      this.stage_size[0] > this.stage_size[1]
        ? this.stage_size[1] * 0.7
        : this.stage_size[1] * 0.8;
    const margin_left =
      this.stage_size[0] > this.stage_size[1]
        ? this.stage_size[0] * 0.15
        : this.stage_size[0] * 0.05;
    if (this.init) {
      const container = this.structure.dialog_container!;
      container.x = 0;
      container.y = margin_top;
      const bg = this.structure.background!;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(
        this.stage_size[0] / 2000, // 2000 -> ui/text_background width
        (this.stage_size[1] - margin_top) / 2000 // 2000 -> ui/text_background height
      );
      const underline = this.structure.underline!;
      underline.x = margin_left - this.em(3);
      underline.y = this.em(24);
      underline.scale.set(
        (this.stage_size[0] - margin_left * 2) / 2000 // 2000 -> ui/text_underline width
      );
      const cn = this.structure.cn_c!;
      cn.x = margin_left;
      cn.y = this.em(6);
      cn.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(16),
        wordWrap: true,
        wordWrapWidth: this.stage_size[0] - margin_left * 2,
        stroke: "#4a496899",
        strokeThickness: this.em(4),
        lineJoin: "round",
      });
      this.set_style_dialog_text();
    }
  }
  set_style_dialog_text() {
    const margin_left =
      this.stage_size[0] > this.stage_size[1]
        ? this.stage_size[0] * 0.15
        : this.stage_size[0] * 0.05;

    // Calculate starting position for text
    let originalTextYPosition = this.em(35);

    // Count lines directly from text strings
    let translatedLineCount = 0;
    let originalLineCount = 0;

    // Count lines for translated text
    if (
      this.structure.translated_text_c &&
      this.structure.translated_text_c.text
    ) {
      translatedLineCount =
        this.structure.translated_text_c.text.split("\n").length;
    }

    // Count lines for original text
    if (this.structure.text_c && this.structure.text_c.text) {
      originalLineCount = this.structure.text_c.text.split("\n").length;
    }

    // Style translated text (displayed above original text)
    if (this.structure.translated_text_c) {
      const translated_text = this.structure.translated_text_c;
      translated_text.x = margin_left + this.em(3);
      translated_text.y = this.em(35);
      translated_text.alpha = 0.7;
      translated_text.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(10),
        lineHeight: this.em(12),
        breakWords: true,
        wordWrap: true,
        wordWrapWidth: this.stage_size[0] - margin_left * 2,
        stroke: "#4a4968aa",
        strokeThickness: this.em(2),
        lineJoin: "round",
      });

      // Dynamically calculate position for original text based on translated text height
      originalTextYPosition = this.em(35) + translated_text.height;
    }

    // Style original text (positioned below translated text if it exists)
    const text = this.structure.text_c!;
    text.x = margin_left + this.em(3);
    text.y = originalTextYPosition;
    text.style = new TextStyle({
      fill: ["#ffffff"],
      fontSize: this.structure.translated_text_c ? this.em(13) : this.em(16),
      lineHeight: this.structure.translated_text_c ? this.em(16) : this.em(22),
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.stage_size[0] - margin_left * 2,
      stroke: "#4a4968aa",
      strokeThickness: this.structure.translated_text_c
        ? this.em(3)
        : this.em(4),
      lineJoin: "round",
    });
    // If total lines >= 6, make text smaller
    if (translatedLineCount + originalLineCount >= 6) {
      // Reduce original text size
      text.y = originalTextYPosition;
      text.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(11), // Reduced sizes
        lineHeight: this.em(13), // Reduced line heights
        breakWords: true,
        wordWrap: true,
        wordWrapWidth: this.stage_size[0] - margin_left * 2,
        stroke: "#4a4968aa",
        strokeThickness: this.em(2.5), // Reduced stroke
        lineJoin: "round",
      });
    }
  }

  async animate(cn: string, text: string, translatedText?: string | null) {
    this.draw(cn, "");
    for (let i = 1; i <= text.length; i++) {
      // if aborted, jump to full text
      if (this.animation_controller.abort_controller.signal.aborted) {
        i = text.length;
      }
      // new text
      this.draw_new_text(text.slice(0, i), translatedText);
      await this.animation_controller.delay(50);
    }
  }
}

import { Graphics, Text, TextStyle } from "pixi.js";
import type { ILive2DLayerData } from "../types.d";
import BaseLayer from "./BaseLayer";

export default class PlaceInfo extends BaseLayer {
  structure: {
    bg_graphic?: Graphics;
    text?: Text;
  };
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
    this.root.alpha = 0; // Start hidden
  }

  draw(text: string) {
    const container = this.root;
    container.removeChildren();

    const bg_graphic = new Graphics();

    const text_c = new Text(text);
    container.addChild(bg_graphic);
    container.addChild(text_c);

    this.structure = {
      bg_graphic,
      text: text_c,
    };
    this.init = true;
    this.set_style();
  }

  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init) {
      // Style text
      const text = this.structure.text!;
      text.anchor.set(0, 0); // Top-left anchor
      text.x = this.em(8); // Text margin from background left
      text.y = this.em(12); // Text margin from background top
      text.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(16),
        breakWords: true,
        wordWrap: true,
        wordWrapWidth: this.stage_size[0] * 0.5, // Max 50% of screen width for longer layout
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: this.em(1),
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: this.em(1),
        lineJoin: "round",
      });

      // Style background to fit text
      const bg = this.structure.bg_graphic!;
      bg.x = 0;
      bg.y = this.em(8); // Background margin from top of screen

      // Calculate background size based on text size
      const textWidth = Math.min(
        text.width + this.em(24),
        this.stage_size[0] * 0.4
      ); // At max 40% of screen width
      const textHeight = text.height + this.em(8); // Text height + padding

      bg.clear();
      // Create continuous gradient from dark grey to transparent (left to right)
      const gradientSteps = 20; // Number of steps for smooth gradient
      const stepWidth = textWidth / gradientSteps;

      for (let i = 0; i < gradientSteps; i++) {
        const opacity = 0.8 * (1 - i / gradientSteps); // Fade from 0.8 to 0
        bg.beginFill(0x333333, opacity)
          .drawRect(i * stepWidth, 0, stepWidth, textHeight)
          .endFill();
      }
    }
  }
}

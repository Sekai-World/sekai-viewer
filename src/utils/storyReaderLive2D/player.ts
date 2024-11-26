import type { ILive2DModelDataCollection, Ilive2DModelInfo } from "./types";
import {
  Container,
  Texture,
  Sprite,
  Graphics,
  Text,
  TextStyle,
  Ticker,
  filters,
} from "pixi.js";
import type { Application, DisplayObject } from "pixi.js";
import { Live2DModel, MotionPriority } from "pixi-live2d-display";
import type { Live2DModelOptions } from "pixi-live2d-display";

//import {  config } from "pixi-live2d-display"
//config.logLevel = config.LOG_LEVEL_VERBOSE;

Live2DModel.registerTicker(Ticker);

const StageLayerIndex = [
  "fullcolor",
  "flashback",
  "telop",
  "dialog",
  "live2d",
  "background",
] as const;

type StageLayerType = (typeof StageLayerIndex)[number];
const t = new filters.AlphaFilter();
type AlphaFilterType = typeof t;

class CustomLive2DModel extends Live2DModel {
  public live2DInfo: Ilive2DModelInfo;
  constructor(options?: Live2DModelOptions) {
    super(options);
    this.live2DInfo = {
      cid: -1,
      costume: "",
      position: [0.5, 0.5],
      init_pose: false,
      hidden: true,
    };
  }
}

export class Live2DPlayer {
  app: Application;
  private stageSize: number[];

  constructor(app: Application, stageSize: number[]) {
    this.app = app;
    this.stageSize = stageSize;

    //initilize stage
    if (app.stage.children.length !== StageLayerIndex.length) {
      app.stage.removeChildren();
      StageLayerIndex.slice()
        .reverse()
        .forEach((n) => {
          const child = new Container();
          child.name = n;
          child.alpha = 1;
          app.stage.addChild(child);
        });
    }
  }

  em = (height: number) => {
    return (this.stageSize[0] * height) / 700;
  };

  setStageSize = (stageSize: number[]) => {
    this.stageSize = stageSize;
    this.update_style();
  };

  update_style = () => {
    if (this.app.stage.children.length === 0) return;
    StageLayerIndex.forEach((n) => {
      const child: Container = this.app.stage.getChildByName(n);
      if (child.children.length > 0) {
        if (n in this.set_style)
          this.set_style[n as keyof typeof this.set_style]();
      }
    });
  };

  set_style = {
    background: () => {
      const container: Container = this.app.stage.getChildByName("background");
      const bg: Sprite = container.getChildAt(0) as Sprite;
      let scale = 1;
      const texture = bg.texture;
      if (
        texture.width / texture.height >
        this.stageSize[0] / this.stageSize[1]
      )
        scale = this.stageSize[1] / texture.height;
      else scale = this.stageSize[0] / texture.width;
      bg.x = this.stageSize[0] / 2;
      bg.y = this.stageSize[1] / 2;
      bg.anchor.set(0.5);
      bg.scale.set(scale);
    },
    dialog: () => {
      const containerP: Container = this.app.stage.getChildByName("dialog");
      const container: Container = containerP.getChildAt(0) as Container;
      container.x = 0;
      container.y = this.stageSize[1] * 0.7;
      const bg: Container = container.getChildByName("dialog_bg");
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(this.stageSize[0] / 2000, (this.stageSize[1] * 0.3) / 2000);
      const cn: Text = container.getChildByName("dialog_text_cn");
      cn.x = this.stageSize[0] * 0.15;
      cn.y = this.em(10);
      cn.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(16),
        wordWrap: true,
        wordWrapWidth: this.stageSize[0] * 0.7,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: this.em(2),
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: this.em(2),
      });
      const text: Text = container.getChildByName("dialog_text_text");
      text.x = this.stageSize[0] * 0.15;
      text.y = this.em(35);
      text.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(16),
        breakWords: true,
        wordWrap: true,
        wordWrapWidth: this.stageSize[0] * 0.7,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: this.em(2),
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: this.em(2),
      });
    },
    live2d: () => {
      const container: Container = this.app.stage.getChildByName("live2d");
      (container.children as CustomLive2DModel[]).forEach((model) => {
        const live2dTrueWidth = model.internalModel.originalWidth;
        const live2dTrueHeight = model.internalModel.originalHeight;
        const scale = Math.min(
          this.stageSize[0] / live2dTrueWidth / 2,
          this.stageSize[1] / live2dTrueHeight
        );
        model.x = this.stageSize[0] * model.live2DInfo.position[0];
        model.y = this.stageSize[1] * (model.live2DInfo.position[1] + 0.3);
        model.anchor.set(0.5);
        model.scale.set(scale * 2.1);
      });
    },
    telop: () => {
      const container: Container = this.app.stage.getChildByName("telop");
      const text: Text = container.getChildByName("telop_text");
      text.anchor.set(0.5);
      text.x = this.stageSize[0] / 2;
      text.y = this.stageSize[1] / 2;
      text.style = new TextStyle({
        fill: ["#ffffff"],
        fontSize: this.em(25),
        breakWords: true,
        wordWrap: true,
        wordWrapWidth: this.stageSize[0] * 0.7,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: this.em(2),
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: this.em(2),
      });
      const bg: Container = container.getChildByName("telop_bg");
      bg.x = 0;
      bg.y = this.stageSize[1] / 2 - this.em(30);
      bg.scale.set(this.stageSize[0] / 2000, this.em(60) / 2000);
    },
    fullcolor: () => {
      const container: Container = this.app.stage.getChildByName("fullcolor");
      const bg: Graphics = container.getChildAt(0) as Graphics;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(this.stageSize[0] / 2000, this.stageSize[1] / 2000);
    },
    flashback: () => {
      const container: Container = this.app.stage.getChildByName("flashback");
      const bg: Graphics = container.getChildAt(0) as Graphics;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(this.stageSize[0] / 2000, this.stageSize[1] / 2000);
    },
  };

  draw = {
    background: (data: HTMLImageElement) => {
      const container: Container = this.app.stage.getChildByName("background");
      container.removeChildren();
      const texture = Texture.from(data);
      const bg = new Sprite(texture);
      container.addChild(bg);
      this.set_style.background();
    },
    dialog: (data: { cn: string; text: string }) => {
      const container: Container = this.app.stage.getChildByName("dialog");
      container.removeChildren();
      const text_container = new Container();
      container.addChild(text_container);

      const bg = new Container();
      bg.name = "dialog_bg";
      const bg_graphic = new Graphics();
      bg_graphic.beginFill(0x000000, 0.3);
      bg_graphic.drawRect(0, 0, 2000, 2000);
      bg_graphic.endFill();
      bg.addChild(bg_graphic);
      const cn = new Text(data.cn);
      cn.name = "dialog_text_cn";
      const text = new Text(data.text);
      text.name = "dialog_text_text";
      text_container.addChild(bg);
      text_container.addChild(cn);
      text_container.addChild(text);
      this.set_style.dialog();
    },
    telop: (data: string) => {
      const container: Container = this.app.stage.getChildByName("telop");
      container.removeChildren();
      const bg = new Container();
      bg.name = "telop_bg";
      const bg_graphic = new Graphics();
      bg_graphic.beginFill(0x000000, 0.3);
      bg_graphic.drawRect(0, 0, 2000, 2000);
      bg_graphic.endFill();
      bg.addChild(bg_graphic);
      const text = new Text(data);
      text.name = "telop_text";
      container.addChild(bg);
      container.addChild(text);
      this.set_style.telop();
    },
    fullcolor: (color: number) => {
      const container: Container = this.app.stage.getChildByName("fullcolor");
      container.removeChildren();
      const bg_graphic = new Graphics();
      bg_graphic.beginFill(color, 1);
      bg_graphic.drawRect(0, 0, 2000, 2000);
      bg_graphic.endFill();
      container.addChild(bg_graphic);
      this.set_style.fullcolor();
    },
    flashback: () => {
      const container: Container = this.app.stage.getChildByName("flashback");
      container.removeChildren();
      const bg_graphic = new Graphics();
      bg_graphic.beginFill(0x000000, 0.3);
      bg_graphic.drawRect(0, 0, 2000, 2000);
      bg_graphic.endFill();
      container.addChild(bg_graphic);
      this.set_style.flashback();
    },
  };

  animate = {
    wrapper: (
      step: (ani_ticker: Ticker) => void,
      finish: (ani_ticker: Ticker) => boolean
    ) => {
      const wait_finish = new Promise<void>((resolve) => {
        const ani_ticker = new Ticker();
        ani_ticker.add(() => {
          step(ani_ticker);
          if (finish(ani_ticker)) {
            ani_ticker.destroy();
            resolve();
          }
        });
        ani_ticker.start();
      });
      return wait_finish;
    },
    show_layer: async (layer: StageLayerType, time: number) => {
      const container: DisplayObject = this.app.stage.getChildByName(layer);
      if (container.alpha !== 1) await await this.animate.show(container, time);
    },
    hide_layer: async (layer: StageLayerType, time: number) => {
      const container: DisplayObject = this.app.stage.getChildByName(layer);
      if (container.alpha !== 0) await this.animate.hide(container, time);
    },
    show: async (container: DisplayObject, time: number) => {
      container.alpha = 0;
      await this.animate.wrapper(
        (ani_ticker) => {
          const alpha = container.alpha + ani_ticker.elapsedMS / time;
          container.alpha = Math.min(alpha, 1);
        },
        () => container.alpha >= 1
      );
    },
    hide: async (container: DisplayObject, time: number) => {
      container.alpha = 1;
      await this.animate.wrapper(
        (ani_ticker) => {
          const alpha = container.alpha - ani_ticker.elapsedMS / time;
          container.alpha = Math.max(alpha, 0);
        },
        () => container.alpha <= 0
      );
    },
    show_by_filter: async (container: DisplayObject, time: number) => {
      if (container.filters && container.filters.length > 0) {
        const filter = container.filters[0] as AlphaFilterType;
        filter.alpha = 0;
        await this.animate.wrapper(
          (ani_ticker) => {
            const alpha = filter.alpha + ani_ticker.elapsedMS / time;
            filter.alpha = Math.min(alpha, 1);
          },
          () => filter.alpha >= 1
        );
      }
    },
    hide_by_filter: async (container: DisplayObject, time: number) => {
      if (container.filters && container.filters.length > 0) {
        const filter = container.filters[0] as AlphaFilterType;
        filter.alpha = 1;
        await this.animate.wrapper(
          (ani_ticker) => {
            const alpha = filter.alpha - ani_ticker.elapsedMS / time;
            filter.alpha = Math.max(alpha, 0);
          },
          () => filter.alpha <= 0
        );
      }
    },
  };

  live2d = {
    init: async (model: ILive2DModelDataCollection) => {
      const container: Container = this.app.stage.getChildByName("live2d");
      const model_name = model.cid + "/" + model.costume;
      // remove duplicate cid but not same costume
      (container.children as CustomLive2DModel[])
        .filter(
          (m) =>
            m.live2DInfo.cid === model.cid &&
            m.live2DInfo.costume !== model.costume
        )
        .forEach((m) => {
          m.destroy();
        });

      if (
        (container.children as CustomLive2DModel[]).findIndex(
          (m) =>
            m.live2DInfo.cid === model.cid &&
            m.live2DInfo.costume === model.costume
        ) === -1
      ) {
        const modelC = await CustomLive2DModel.from(model.data, {
          autoInteract: false,
        });
        modelC.name = model_name;
        modelC.filters = [new filters.AlphaFilter(0)];
        container.addChild(modelC);
        modelC.live2DInfo = {
          cid: model.cid,
          costume: model.costume,
          position: [0.5, 0.5],
          init_pose: false,
          hidden: true,
        };
        this.set_style.live2d();
      }
    },
    find: (cid: number) => {
      const container: Container = this.app.stage.getChildByName("live2d");
      return (container.children as CustomLive2DModel[]).find(
        (l) => l.live2DInfo.cid === cid
      );
    },
    is_empty: () => {
      const container: Container = this.app.stage.getChildByName("live2d");
      return (container.children as CustomLive2DModel[])
        .map((l) => l.live2DInfo.hidden)
        .reduce((accumulator, current) => {
          return accumulator && current;
        }, true);
    },
    clear: (cid: number) => {
      const model = this.live2d.find(cid);
      if (model) model.destroy();
    },
    show: async (cid: number, time: number) => {
      const model = this.live2d.find(cid);
      if (
        model &&
        model.live2DInfo.hidden === true &&
        model.live2DInfo.init_pose === true
      ) {
        await this.animate.show_by_filter(model, time);
        model.live2DInfo.hidden = false;
      }
    },
    hide: async (cid: number, time: number) => {
      const model = this.live2d.find(cid);
      if (model && model.live2DInfo.hidden === false) {
        await this.animate.hide_by_filter(model, time);
        model.live2DInfo.hidden = true;
      }
    },
    update_motion: async (
      motion_type: "Motion" | "Expression",
      cid: number,
      motion_index: number
    ) => {
      const model = this.live2d.find(cid);
      if (model) {
        await model.motion(motion_type, motion_index, MotionPriority.FORCE);
        await this.animate.wrapper(
          () => {},
          () => model.internalModel.motionManager.isFinished()
        );
        model.live2DInfo.init_pose = true;
      }
      return false;
    },
    set_position: (cid: number, position: number[]) => {
      const model = this.live2d.find(cid);
      if (model) {
        model.live2DInfo.position = position;
        this.set_style.live2d();
      }
    },
  };

  clear_layers = (layers: StageLayerType[]) => {
    layers.forEach((n) => {
      const container: Container = this.app.stage.getChildByName(n);
      container.removeChildren();
    });
  };
}

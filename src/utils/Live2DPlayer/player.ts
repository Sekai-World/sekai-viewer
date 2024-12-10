import type {
  ILive2DModelDataCollection,
  Ilive2DModelInfo,
  ILive2DCachedAsset,
} from "./types.d";
import {
  Container,
  Texture,
  Sprite,
  Graphics,
  Text,
  TextStyle,
  Ticker,
  AlphaFilter,
} from "pixi.js";
import type { Application, DisplayObject } from "pixi.js";
import {
  Live2DModel,
  MotionPriority,
  MotionPreloadStrategy,
  config,
} from "pixi-live2d-display-mulmotion";
import type { Live2DModelOptions } from "pixi-live2d-display-mulmotion";
import { log } from "./log";

config.fftSize = 8192;
//DEBUG
//config.logLevel = config.LOG_LEVEL_VERBOSE;
//DEBUG/

const StageLayerIndex = [
  "fullcolor",
  "flashback",
  "telop",
  "dialog",
  "live2d",
  "background",
] as const;

type StageLayerType = (typeof StageLayerIndex)[number];

export class Live2DModelWithInfo extends Live2DModel {
  public live2DInfo: Ilive2DModelInfo;
  constructor(options?: Live2DModelOptions) {
    super(options);
    this.live2DInfo = {
      cid: -1,
      costume: "",
      position: [0.5, 0.5],
      init_pose: false,
      hidden: true,
      speaking: false,
    };
  }
}

export class Live2DPlayer {
  app: Application;
  private stage_size: number[];
  private screen_length: number;
  private ui_assets: ILive2DCachedAsset[];
  protected abort_controller: AbortController;

  constructor(
    app: Application,
    stage_size: number[],
    ui_assets: ILive2DCachedAsset[],
    screen_length = 2000
  ) {
    this.app = app;
    this.stage_size = stage_size;
    this.ui_assets = ui_assets;
    this.screen_length = screen_length;
    this.abort_controller = new AbortController();

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
    return (this.stage_size[1] * height) / 400;
  };

  set_stage_size = (stage_size: number[]) => {
    this.stage_size = stage_size;
    this.update_style();
  };

  update_style = () => {
    if (this.app.stage.children.length === 0) return;
    StageLayerIndex.forEach((n) => {
      const child: Container = this.app.stage.getChildByName(n)!;
      if (child.children.length > 0) {
        if (n in this.set_style) this.set_style[n]();
      }
    });
  };

  set_style = {
    background: () => {
      const container: Container = this.app.stage.getChildByName("background")!;
      const bg: Sprite = container.getChildAt(0) as Sprite;
      let scale = 1;
      const texture = bg.texture;
      if (
        texture.width / texture.height >
        this.stage_size[0] / this.stage_size[1]
      )
        scale = this.stage_size[1] / texture.height;
      else scale = this.stage_size[0] / texture.width;
      bg.x = this.stage_size[0] / 2;
      bg.y = this.stage_size[1] / 2;
      bg.anchor.set(0.5);
      bg.scale.set(scale);
    },
    dialog: () => {
      const containerP: Container = this.app.stage.getChildByName("dialog")!;
      const container: Container = containerP.getChildAt(0) as Container;
      container.x = 0;
      container.y = this.stage_size[1] * 0.7;
      const bg: Graphics = container.getChildByName("dialog_bg")!;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(
        this.stage_size[0] / 2000, // 2000 -> ui/text_background width
        (this.stage_size[1] * 0.3) / 2000 // 2000 -> ui/text_background height
      );
      const underline: Graphics = container.getChildByName("dialog_underline")!;
      underline.x = this.stage_size[0] * 0.15 - this.em(3);
      underline.y = this.em(24);
      underline.scale.set(
        (this.stage_size[0] * 0.7) / 2000 // 2000 -> ui/text_underline width
      );
      const cn: Text = container.getChildByName("dialog_text_cn")!;
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
      const text_container: Container = container.getChildByName(
        "dialog_text_container"
      )!;
      this.set_style.dialog_text(text_container.children[0] as Text);
    },
    dialog_text: (text: Text) => {
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
    },
    live2d: () => {
      const container: Container = this.app.stage.getChildByName("live2d")!;
      (container.children as Live2DModelWithInfo[]).forEach((model) => {
        const live2dTrueWidth = model.internalModel.originalWidth;
        const live2dTrueHeight = model.internalModel.originalHeight;
        const scale = Math.min(
          this.stage_size[0] / live2dTrueWidth / 2,
          this.stage_size[1] / live2dTrueHeight
        );
        model.x = this.stage_size[0] * model.live2DInfo.position[0];
        model.y = this.stage_size[1] * (model.live2DInfo.position[1] + 0.3);
        model.anchor.set(0.5);
        model.scale.set(scale * 2.1);
      });
    },
    telop: () => {
      const container: Container = this.app.stage.getChildByName("telop")!;
      const text: Text = container.getChildByName("telop_text")!;
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
      const bg: Container = container.getChildByName("telop_bg")!;
      bg.x = 0;
      bg.y = this.stage_size[1] / 2 - this.em(30);
      bg.scale.set(
        this.stage_size[0] / this.screen_length,
        this.em(60) / this.screen_length
      );
    },
    fullcolor: () => {
      const container: Container = this.app.stage.getChildByName("fullcolor")!;
      const bg: Graphics = container.getChildAt(0) as Graphics;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(
        this.stage_size[0] / this.screen_length,
        this.stage_size[1] / this.screen_length
      );
    },
    flashback: () => {
      const container: Container = this.app.stage.getChildByName("flashback")!;
      const bg: Graphics = container.getChildAt(0) as Graphics;
      bg.x = 0;
      bg.y = 0;
      bg.scale.set(
        this.stage_size[0] / this.screen_length,
        this.stage_size[1] / this.screen_length
      );
    },
  };

  draw = {
    background: (data: HTMLImageElement) => {
      const container: Container = this.app.stage.getChildByName("background")!;
      container.removeChildren();
      const texture = Texture.from(data);
      const bg = new Sprite(texture);
      container.addChild(bg);
      this.set_style.background();
    },
    dialog: (cn: string, text: string) => {
      const container: Container = this.app.stage.getChildByName("dialog")!;
      container.removeChildren();
      const dialog_container = new Container();
      container.addChild(dialog_container);

      const background_texture = Texture.from(
        this.ui_assets.find((a) => a.identifer === "ui/text_background")!
          .data as HTMLImageElement
      );
      const background = new Sprite(background_texture);
      background.name = "dialog_bg";
      const underline_texture = Texture.from(
        this.ui_assets.find((a) => a.identifer === "ui/text_underline")!
          .data as HTMLImageElement
      );
      const underline = new Sprite(underline_texture);
      underline.name = "dialog_underline";
      const cn_c = new Text(cn);
      cn_c.name = "dialog_text_cn";
      const text_container = new Container();
      text_container.name = "dialog_text_container";
      const text_c = new Text(text);
      text_container.addChild(text_c);
      dialog_container.addChild(background);
      dialog_container.addChild(underline);
      dialog_container.addChild(cn_c);
      dialog_container.addChild(text_container);
      this.set_style.dialog();
    },
    telop: (data: string) => {
      const container: Container = this.app.stage.getChildByName("telop")!;
      container.removeChildren();
      const bg = new Container();
      bg.name = "telop_bg";
      const bg_graphic = new Graphics();
      bg_graphic.beginFill(0x000000, 0.3);
      bg_graphic.drawRect(0, 0, this.screen_length, this.screen_length);
      bg_graphic.endFill();
      bg.addChild(bg_graphic);
      const text = new Text(data);
      text.name = "telop_text";
      container.addChild(bg);
      container.addChild(text);
      this.set_style.telop();
    },
    fullcolor: (color: number) => {
      const container: Container = this.app.stage.getChildByName("fullcolor")!;
      container.removeChildren();
      const bg_graphic = new Graphics();
      bg_graphic.beginFill(color, 1);
      bg_graphic.drawRect(0, 0, this.screen_length, this.screen_length);
      bg_graphic.endFill();
      container.addChild(bg_graphic);
      this.set_style.fullcolor();
    },
    flashback: () => {
      const container: Container = this.app.stage.getChildByName("flashback")!;
      container.removeChildren();
      const bg_graphic = new Graphics();
      bg_graphic.beginFill(0x000000, 0.3);
      bg_graphic.drawRect(0, 0, this.screen_length, this.screen_length);
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
        let destroyed = false;
        if (this.abort_controller.signal.aborted) {
          resolve();
          return;
        }
        const ani_ticker = new Ticker();
        ani_ticker.add(() => {
          step(ani_ticker);
          if (finish(ani_ticker)) {
            if (!destroyed) {
              ani_ticker.destroy();
              destroyed = true;
            }
            resolve();
          }
        });
        ani_ticker.start();
        this.abort_controller.signal.addEventListener("abort", () => {
          if (!destroyed) {
            ani_ticker.destroy();
            destroyed = true;
          }
          resolve();
        });
      });
      return wait_finish;
    },
    delay: (ms: number) => {
      return new Promise<void>((resolve) => {
        let destroyed = false;
        if (this.abort_controller.signal.aborted) {
          resolve();
          return;
        }
        const timeout_id = setTimeout(() => {
          if (!destroyed) {
            destroyed = true;
          }
          resolve();
        }, ms);
        this.abort_controller.signal.addEventListener("abort", () => {
          if (!destroyed) {
            clearTimeout(timeout_id);
            destroyed = true;
          }
          resolve();
        });
      });
    },
    abort: () => {
      this.abort_controller.abort();
    },
    reset_abort: () => {
      if (this.abort_controller.signal.aborted)
        this.abort_controller = new AbortController();
    },
    show_layer: async (layer: StageLayerType, time: number) => {
      const container: DisplayObject = this.app.stage.getChildByName(layer)!;
      if (container.alpha !== 1) await this.animate.show(container, time);
    },
    hide_layer: async (layer: StageLayerType, time: number) => {
      const container: DisplayObject = this.app.stage.getChildByName(layer)!;
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
      container.alpha = 1;
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
      container.alpha = 0;
    },
    show_by_filter: async (container: DisplayObject, time: number) => {
      if (container.filters && container.filters.length > 0) {
        const filter = container.filters[0] as AlphaFilter;
        filter.alpha = 0;
        await this.animate.wrapper(
          (ani_ticker) => {
            const alpha = filter.alpha + ani_ticker.elapsedMS / time;
            filter.alpha = Math.min(alpha, 1);
          },
          () => filter.alpha >= 1
        );
        filter.alpha = 1;
      }
    },
    hide_by_filter: async (container: DisplayObject, time: number) => {
      if (container.filters && container.filters.length > 0) {
        const filter = container.filters[0] as AlphaFilter;
        filter.alpha = 1;
        await this.animate.wrapper(
          (ani_ticker) => {
            const alpha = filter.alpha - ani_ticker.elapsedMS / time;
            filter.alpha = Math.max(alpha, 0);
          },
          () => filter.alpha <= 0
        );
        filter.alpha = 0;
      }
    },
    dialog: async (cn: string, text: string) => {
      this.draw.dialog(cn, "");
      this.set_style.dialog();
      const container0: Container = this.app.stage.getChildByName("dialog")!;
      const container1: Container = container0.getChildAt(0) as Container;
      const container: Container = container1.getChildByName(
        "dialog_text_container"
      )!;
      for (let i = 1; i <= text.length; i++) {
        container.removeChildren();
        const text_c = new Text(text.slice(0, i));
        //text_c.text = ""
        container.addChild(text_c);
        this.set_style.dialog_text(text_c);
        await this.animate.delay(50);
        // if aborted, jump to full text
        if (this.abort_controller.signal.aborted) {
          i = text.length - 1;
        }
      }
    },
  };

  // load all live2d models and motions
  // display by show/hide
  live2d = {
    init: async (model_data: ILive2DModelDataCollection) => {
      const container: Container = this.app.stage.getChildByName("live2d")!;
      const model = await Live2DModelWithInfo.from(model_data.data, {
        autoFocus: false,
        autoHitTest: false,
        breathDepth: 0.2,
        ticker: Ticker.shared,
        motionPreload: MotionPreloadStrategy.ALL,
      });
      model.internalModel.extendParallelMotionManager(2);
      model.filters = [new AlphaFilter(0)];
      model.live2DInfo.cid = model_data.cid;
      model.live2DInfo.costume = model_data.costume;
      //model.visible = false;
      container.addChild(model);
      this.set_style.live2d();
      log.log("Live2DPlayer", `${model_data.costume} init.`);
    },
    load_status: (): "loaded" | "ready" => {
      const container: Container = this.app.stage.getChildByName("live2d")!;
      return container.children.length > 0 ? "loaded" : "ready";
    },
    find: (costume: string) => {
      const container: Container = this.app.stage.getChildByName("live2d")!;
      return (container.children as Live2DModelWithInfo[]).find(
        (l) => l.live2DInfo.costume === costume
      );
    },
    is_empty: () => {
      const container: Container = this.app.stage.getChildByName("live2d")!;
      return (container.children as Live2DModelWithInfo[])
        .map((l) => l.live2DInfo.hidden)
        .reduce((accumulator, current) => {
          return accumulator && current;
        }, true);
    },
    clear: () => {
      const container: Container = this.app.stage.getChildByName("live2d")!;
      container.removeChildren();
      log.log("Live2DPlayer", "live2d stage clear.");
    },
    show: async (costume: string, time: number) => {
      const model = this.live2d.find(costume);
      if (
        model &&
        model.live2DInfo.hidden === true &&
        model.live2DInfo.init_pose === true
      ) {
        await this.animate.show_by_filter(model, time);
        model.live2DInfo.hidden = false;
      }
    },
    hide: async (costume: string, time: number) => {
      const model = this.live2d.find(costume);
      if (model && model.live2DInfo.hidden === false) {
        await this.animate.hide_by_filter(model, time);
        model.live2DInfo.hidden = true;
      }
    },
    update_motion: async (
      motion_type: "Motion" | "Expression",
      costume: string,
      motion_index: number
    ) => {
      const model = this.live2d.find(costume);
      if (model) {
        let manager = model.internalModel.parallelMotionManager[0];
        if (motion_type === "Expression") {
          manager = model.internalModel.parallelMotionManager[1];
        }
        await manager.startMotion(
          motion_type,
          motion_index,
          MotionPriority.FORCE
        );
        await this.animate.wrapper(
          () => {},
          () => manager.isFinished()
        );
        model.live2DInfo.init_pose = true;
      }
    },
    set_position: (costume: string, position: number[]) => {
      const model = this.live2d.find(costume);
      if (model) {
        model.live2DInfo.position = position;
        this.set_style.live2d();
      }
    },
    speak: (costume: string, url: string) => {
      const model = this.live2d.find(costume);
      if (model) {
        model.speak(url, {
          resetExpression: false,
          onFinish: () => {
            model.live2DInfo.speaking = false;
          },
        });
        model.live2DInfo.speaking = true;
      }
    },
    stop_speaking: () => {
      const container: Container = this.app.stage.getChildByName("live2d")!;
      (container.children as Live2DModelWithInfo[]).forEach((m) => {
        if (m.live2DInfo.speaking) {
          m.stopSpeaking();
          m.live2DInfo.speaking = false;
        }
      });
    },
    all_speak_finish: () => {
      return this.animate.wrapper(
        () => {},
        () =>
          !(
            this.app.stage.getChildByName("live2d")!
              .children as Live2DModelWithInfo[]
          ).reduce((accu, curr) => accu || curr.live2DInfo.speaking, false)
      );
    },
  };

  clear_layers = (layers: StageLayerType[]) => {
    layers.forEach((n) => {
      const container: Container = this.app.stage.getChildByName(n)!;
      container.removeChildren();
    });
  };
}

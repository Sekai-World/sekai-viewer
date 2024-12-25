import {
  Container,
  Ticker,
  AlphaFilter,
  ColorMatrix,
  ColorMatrixFilter,
} from "pixi.js";
import BaseLayer from "./BaseLayer";

import { log } from "../log";

import type {
  ILive2DLayerData,
  ILive2DModelDataCollection,
  Ilive2DModelInfo,
} from "../types.d";

import {
  Live2DModel,
  MotionPriority,
  MotionPreloadStrategy,
  config,
} from "pixi-live2d-display-mulmotion";
config.fftSize = 8192;
import type { Live2DModelOptions } from "pixi-live2d-display-mulmotion";

// effects
import Hologram from "../animation/Hologram";

export default class Live2D extends BaseLayer {
  structure: {
    live2d: Container;
    effect: Container;
  };
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {
      live2d: new Container(),
      effect: new Container(),
    };
    this.root.addChild(this.structure.live2d);
    this.root.addChild(this.structure.effect);
  }

  draw() {}
  set_style(
    stage_size?: [number, number],
    model_list: Live2DModelWithInfo[] = []
  ): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    let models = model_list;
    if (model_list.length === 0) {
      models = this.get_model_list();
    }
    models
      .filter((m) => m.visible)
      .forEach((model) => {
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
        model.live2DInfo.animations.forEach((a) => {
          a.root.position.set(
            this.stage_size[0] * model.live2DInfo.position[0],
            this.stage_size[1]
          );
          a.set_style(this.stage_size);
        });
      });
  }

  load = async (
    model_data: ILive2DModelDataCollection,
    motionPreload = MotionPreloadStrategy.ALL
  ) => {
    const model = await Live2DModelWithInfo.from(model_data.data, {
      autoFocus: false,
      autoHitTest: false,
      breathDepth: 0.2,
      ticker: Ticker.shared,
      motionPreload: motionPreload,
    });
    model.visible = false;
    model.internalModel.extendParallelMotionManager(2);
    const alpha = new AlphaFilter(0);
    alpha.resolution = 2;
    model.filters = [alpha];
    model.live2DInfo.cid = model_data.cid;
    model.live2DInfo.costume = model_data.costume;
    this.structure.live2d.addChild(model);
    log.log("Live2DPlayer", `${model_data.costume} init.`);
  };

  get_model_list = () => {
    return this.structure.live2d.children as Live2DModelWithInfo[];
  };

  load_status = (): "loaded" | "ready" => {
    return this.structure.live2d.children.length > 0 ? "loaded" : "ready";
  };

  find = (costume: string) => {
    return this.get_model_list().find((l) => l.live2DInfo.costume === costume);
  };

  clear = () => {
    this.get_model_list().forEach((o) => o.destroy());
    log.log("Live2DPlayer", "live2d stage clear.");
  };

  update_motion = async (
    motion_type: "Motion" | "Expression",
    costume: string,
    motion_index: number
  ) => {
    const model = this.find(costume);
    if (model) {
      model.visible = true;
      let manager = model.internalModel.parallelMotionManager[0];
      if (motion_type === "Expression") {
        manager = model.internalModel.parallelMotionManager[1];
      }
      await manager.startMotion(
        motion_type,
        motion_index,
        MotionPriority.FORCE
      );
      model.live2DInfo.wait_motion = this.animation_controller.wrapper(
        () => {},
        () => manager.destroyed || manager.isFinished()
      );
      await model.live2DInfo.wait_motion;
      model.live2DInfo.init_pose = true;
    }
  };

  show_model = async (costume: string, time: number) => {
    const model = this.find(costume);
    if (model && model.live2DInfo.hidden === true) {
      model.visible = true;
      model.live2DInfo.hidden = false;
      await this.animation_controller.progress_wrapper((p) => {
        (model.filters![0] as AlphaFilter).alpha = p;
        model.live2DInfo.animations.forEach((a) => {
          a.root.alpha = p;
        });
      }, time);
    }
  };

  hide_model = async (costume: string, time: number) => {
    const model = this.find(costume);
    if (model && model.live2DInfo.hidden === false) {
      model.live2DInfo.hidden = true;
      await this.animation_controller.progress_wrapper((p) => {
        (model.filters![0] as AlphaFilter).alpha = 1 - p;
        model.live2DInfo.animations.forEach((a) => {
          a.root.alpha = 1 - p;
        });
      }, time);
      model.visible = false;
    }
  };

  set_position = (costume: string, position: [number, number]) => {
    const model = this.find(costume);
    if (model) {
      model.visible = true;
      model.live2DInfo.position = position;
      this.set_style(this.stage_size, [model]);
    }
  };

  move = async (
    costume: string,
    from: [number, number] | undefined,
    to: [number, number],
    time: number
  ) => {
    const model = this.find(costume);
    if (model) {
      model.visible = true;
      let n_from = model.live2DInfo.position;
      if (from) {
        n_from = from;
      }
      if (n_from[0] === to[0] && n_from[1] === to[1]) return;
      await this.animation_controller.progress_wrapper((progress) => {
        model.live2DInfo.position[0] =
          (to[0] - n_from[0]) * progress + n_from[0];
        model.live2DInfo.position[1] =
          (to[1] - n_from[1]) * progress + n_from[1];
        this.set_style(this.stage_size, [model]);
      }, time);
    }
  };

  speak = (costume: string, url: string) => {
    const model = this.find(costume);
    if (model) {
      model.speak(url, {
        resetExpression: false,
        onFinish: () => {
          model.live2DInfo.speaking = false;
        },
      });
      model.live2DInfo.speaking = true;
    }
  };
  stop_speaking = () => {
    this.get_model_list().forEach((m) => {
      if (m.live2DInfo.speaking) {
        m.stopSpeaking();
        m.live2DInfo.speaking = false;
      }
    });
  };
  all_speak_finish = () => {
    return this.animation_controller.wrapper(
      () => {},
      () =>
        !this.get_model_list().reduce(
          (accu, curr) => accu || curr.live2DInfo.speaking,
          false
        )
    );
  };

  add_effect = (costume: string, ani_type: "hologram" = "hologram") => {
    const model = this.find(costume);
    if (model) {
      if (ani_type === "hologram") {
        // add hologram animation
        const hologram = new Hologram(this.textures);
        this.structure.effect.addChild(hologram.root);
        console.log(hologram);
        model.live2DInfo.animations.push(hologram);
        hologram.start();
        // set alpha equals model alpha
        hologram.root.alpha = (model.filters![0] as AlphaFilter).alpha;
        // add filter
        const filter = new ColorMatrixFilter();
        filter.resolution = 2;
        /*
        R = a*R + b*G + c*B + d*A + e
        G = f*R + g*G + h*B + i*A + j
        B = k*R + l*G + m*B + n*A + o
        A = p*R + q*G + r*B + s*A + t
        */
        const R = [1.2, 0, 0, 0, 0];
        const G = [0, 1.2, 0, 0, 0];
        const B = [0, 0, 1.2, 0, 0];
        const A = [0, 0, 0, 0.8, 0];
        filter.matrix = R.concat(G, B, A) as ColorMatrix;
        model.filters?.push(filter);
      }
      this.set_style(this.stage_size, [model]);
    }
  };
  remove_effect = (costume: string, ani_type: "hologram" = "hologram") => {
    const model = this.find(costume);
    if (model) {
      if (ani_type === "hologram") {
        // remove filter
        let idx = model.filters!.findIndex(
          (f) => f instanceof ColorMatrixFilter
        );
        if (idx !== -1) {
          model.filters?.splice(idx, 1);
        }
        // remove animation
        idx = model.live2DInfo.animations.findIndex(
          (a) => a instanceof Hologram
        );
        if (idx !== -1) {
          model.live2DInfo.animations[idx].destroy();
          model.live2DInfo.animations.splice(idx, 1);
        }
      }
    }
  };

  add_color_filter = (R: number[], G: number[], B: number[], A: number[]) => {
    // add filter
    const filter = new ColorMatrixFilter();
    /*
    R = a*R + b*G + c*B + d*A + e
    G = f*R + g*G + h*B + i*A + j
    B = k*R + l*G + m*B + n*A + o
    A = p*R + q*G + r*B + s*A + t
    */
    filter.matrix = R.concat(G, B, A) as ColorMatrix;
    this.add_filter(filter);
  };
  add_filter = (filter: ColorMatrixFilter) => {
    // add filter
    filter.resolution = 2;
    if (this.root.filters) {
      this.root.filters.push(filter);
    } else {
      this.root.filters = [filter];
    }
  };
  remove_filter = () => {
    // remove filter
    let idx = -1;
    do {
      idx = this.root.filters!.findIndex((f) => f instanceof ColorMatrixFilter);
      if (idx !== -1) {
        this.root.filters?.splice(idx, 1);
      }
    } while (idx !== -1);
  };

  destroy() {
    this.structure.live2d.children.forEach((m) => m.destroy());
  }
}

class Live2DModelWithInfo extends Live2DModel {
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
      wait_motion: Promise.resolve(),
      animations: [],
    };
  }
  destroy(options?: {
    children?: boolean;
    texture?: boolean;
    baseTexture?: boolean;
  }): void {
    super.destroy(options);
    this.live2DInfo.animations.forEach((a) => a.destroy());
  }
}

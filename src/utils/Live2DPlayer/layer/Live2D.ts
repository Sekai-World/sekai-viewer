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
  Cubism4InternalModel,
} from "@sekai-world/pixi-live2d-display-mulmotion";
config.logLevel = config.LOG_LEVEL_ERROR;
import type { Live2DModelOptions } from "@sekai-world/pixi-live2d-display-mulmotion";

import { Howler, Howl } from "howler";

// effects
import Hologram from "../animation/Hologram";

export default class Live2D extends BaseLayer {
  structure: {
    live2d: Container<Live2DModelWithInfo>;
    effect: Container;
  };
  layout_mode: "normal" | "three_models" = "normal";
  audio_analyzer?: AnalyserNode;
  current_sound?: Howl;
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {
      live2d: new Container<Live2DModelWithInfo>(),
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
        const live2dTrueHeight = model.internalModel.originalHeight;
        const scale = this.stage_size[1] / live2dTrueHeight;
        model.x = this.stage_size[0] * model.live2DInfo.position[0];
        model.y = this.stage_size[1] * (model.live2DInfo.position[1] + 0.3);
        model.anchor.set(0.5);
        model.scale.set(scale * (this.layout_mode === "normal" ? 2.1 : 1.8)); // 2.1, 1.8: magic number
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
    const internalModel = model.internalModel;
    if (internalModel instanceof Cubism4InternalModel) {
      internalModel.coreModel.setOverwriteFlagForModelCullings(true);
    }
    internalModel.extendParallelMotionManager(2);
    const alpha = new AlphaFilter(0);
    alpha.resolution = 2;
    model.filters = [alpha];
    model.live2DInfo.cid = model_data.cid;
    model.live2DInfo.costume = model_data.costume;
    this.structure.live2d.addChild(model);
    log.log("Live2DPlayer", `${model_data.costume} init.`);
  };

  get_model_list = () => {
    return this.structure.live2d.children;
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
    motion_index: number,
    to_last_frame: boolean = false
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
        MotionPriority.FORCE,
        to_last_frame
      );
      model.live2DInfo.wait_motion = this.animation_controller.wrapper(
        () => {},
        () => manager.destroyed || manager.isFinished()
      );
      await model.live2DInfo.wait_motion;
      model.live2DInfo.t_pose = false;
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

  init_analyzer = () => {
    if (Howler.ctx && !this.audio_analyzer) {
      this.audio_analyzer = Howler.ctx.createAnalyser();
      this.audio_analyzer.fftSize = 2048;
      this.audio_analyzer.minDecibels = -100;
      this.audio_analyzer.maxDecibels = -10;
      this.audio_analyzer.smoothingTimeConstant = 0.85;
    }
  };

  speak = (costumes: string[], sound: Howl, volume: number) => {
    if (this.current_sound) this.stop_speaking();
    const models = costumes.map((c) => this.find(c)).filter((m) => !!m);
    this.init_analyzer();
    if (models.length > 0 && this.audio_analyzer) {
      // get sound gain node by Howler internal method
      const gain = (sound as any)._sounds[0]._node as GainNode;
      gain.disconnect();
      this.audio_analyzer.disconnect();
      gain.connect(this.audio_analyzer);
      // connect analyzer to output
      this.audio_analyzer.connect(Howler.masterGain);
      sound.volume(volume);
      sound.play();
      sound.once("stop", () => {
        models.forEach((m) => (m.live2DInfo.speaking = false));
        gain.disconnect();
      });
      this.current_sound = sound;
      models.forEach((model) => {
        if (this.audio_analyzer)
          model.internalModel.motionManager.attachAnalyzer(this.audio_analyzer);
        model.live2DInfo.speaking = true;
        this.structure.live2d.removeChild(model);
        this.structure.live2d.addChild(model);
      });
    }
  };
  stop_speaking = () => {
    // disconnect analyzer node from master gain node
    if (this.audio_analyzer) this.audio_analyzer.disconnect();
    if (this.current_sound) {
      // clear all listeners or will fire stop event
      this.current_sound.off();
      // disconnect from analyzer
      const gain = (this.current_sound as any)._sounds[0]._node as GainNode;
      gain.disconnect();
      // stop current talk
      this.current_sound.stop();
    }
    this.current_sound = undefined;
    // disconnect from models
    this.get_model_list().forEach((m) => {
      if (m.live2DInfo.speaking) {
        m.stopSpeaking();
        m.live2DInfo.speaking = false;
      }
    });
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

  destroy() {
    this.stop_speaking();
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
      t_pose: true,
      hidden: true,
      speaking: false,
      wait_motion: Promise.resolve(),
      animations: [],
    };
  }
  destroy() {
    this.live2DInfo.animations.forEach((a) => a.destroy());
    // disconnect analyzer
    this.stopSpeaking();
    super.destroy();
  }
}

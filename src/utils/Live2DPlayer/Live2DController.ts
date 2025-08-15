import { Live2DPlayer } from "./Live2DPlayer";
import type { Application } from "pixi.js";
import { log } from "./log";
import {
  IScenarioData,
  SnippetAction,
  SpecialEffectType,
  SnippetProgressBehavior,
} from "../../types.d";

import {
  Live2DAssetType,
  ILive2DScenarioResource,
  ILive2DModelDataCollection,
  ILive2DControllerData,
  ILive2DLoadProgressHandler,
  Live2DLoadProgressType,
} from "./types.d";

import single_action from "./action";

export class Live2DController extends Live2DPlayer {
  scenarioData: IScenarioData;
  scenarioResource: ILive2DScenarioResource;
  modelData: ILive2DModelDataCollection[];
  model_queue: string[][];
  current_costume: {
    cid: number;
    costume: string;
    motion: string;
    expression: string;
    appear_time: number;
    animations: string[];
  }[] = [];

  step = 0;
  settings = {
    bgm_volume: 0.3,
    voice_volume: 0.8,
    se_volume: 0.8,
    text_animation: true,
  };

  constructor(
    app: Application,
    stageSize: [number, number],
    data: ILive2DControllerData
  ) {
    const ui_assets = {
      image: data.scenarioResource.image.filter(
        (a) =>
          a.type === Live2DAssetType.UI || a.type === Live2DAssetType.UISheet
      ),
      audio: [],
      video: data.scenarioResource.video.filter(
        (a) => a.type === Live2DAssetType.UIVideo
      ),
    };
    super(app, stageSize, ui_assets);
    this.scenarioData = data.scenarioData;
    this.scenarioResource = data.scenarioResource;
    this.modelData = data.modelData;

    this.model_queue = this.create_model_queue();
    log.log("Live2DController", "init.");
    log.log("Live2DController", this.scenarioData);
    log.log("Live2DController", this.scenarioResource);
    log.log("Live2DController", this.modelData);
  }

  /**
   * Create a model list used in an action.
   * New models will replace the oldest model and minimize model list change.
   * @param queue_max max queue length, range: 3+.
   * Load more than [x] models in the same scene will cause live2d sdk not update the models.
   * The number [x] is depends on the device memory...? So I chose 6 here, need more test.
   */
  create_model_queue = (queue_max = 6) => {
    const current_costume: {
      cid: number;
      costume: string;
    }[] = [];
    // collect costumes need in each action
    const costumes_in_action = this.scenarioData.Snippets.map((action) => {
      const costume_list: string[] = [];
      switch (action.Action) {
        case SnippetAction.CharacterLayout:
        case SnippetAction.CharacterMotion:
          {
            const detail = this.scenarioData.LayoutData[action.ReferenceIndex];
            let costume = null;
            if (detail.CostumeType !== "") {
              const costume_idx = current_costume.findIndex(
                (m) => m.cid === detail.Character2dId
              );
              if (costume_idx === -1) {
                current_costume.push({
                  cid: detail.Character2dId,
                  costume: detail.CostumeType,
                });
              } else {
                current_costume[costume_idx].costume = detail.CostumeType;
              }
              costume = detail.CostumeType;
            } else {
              costume = current_costume.find(
                (m) => m.cid === detail.Character2dId
              )!.costume;
            }
            costume_list.push(costume);
          }
          break;
        case SnippetAction.Talk:
          {
            const detail = this.scenarioData.TalkData[action.ReferenceIndex];

            costume_list.push(
              ...detail.Motions.map(
                (mo) =>
                  current_costume.find((m) => m.cid === mo.Character2dId)!
                    .costume
              )
            );
          }
          break;
      }
      return costume_list;
    });
    // reduce a queue
    const model_queue: string[][] = [];
    costumes_in_action.reduce((prev, costumes) => {
      const queue = [...prev];
      costumes.forEach((m) => {
        const q_idx = queue.findIndex((q) => q === m);
        if (q_idx !== -1) queue.splice(q_idx, 1);
        if (queue.length >= queue_max) queue.splice(0, 1);
        queue.push(m);
      });
      model_queue.push(queue);
      return queue;
    }, []);

    // find first queue at max queue length
    let first_max_idx = model_queue.findIndex((q) => q.length === queue_max);
    if (first_max_idx === -1) first_max_idx = model_queue.length - 1;
    // set all queues before the max index to the first queue at max queue length
    for (let i = 0; i < first_max_idx; i++) {
      model_queue[i] = model_queue[first_max_idx];
    }
    return model_queue;
  };
  step_until_checkpoint = async (step: number) => {
    // is end of the story
    const is_end = (step: number) => {
      return step >= this.scenarioData.Snippets.length - 1;
    };
    // find where to stop
    const is_stop = (step: number) => {
      if (is_end(step)) return true;
      const action = this.scenarioData.Snippets[step];
      if (action.ProgressBehavior === SnippetProgressBehavior.Now) {
        return false;
      } else if (action.Action === SnippetAction.Talk) {
        return true;
      } else if (action.Action === SnippetAction.SpecialEffect) {
        const action_detail =
          this.scenarioData.SpecialEffectData[action.ReferenceIndex];
        if (action_detail.EffectType === SpecialEffectType.Telop) {
          return true;
        } else if (
          action_detail.EffectType === SpecialEffectType.FullScreenText
        ) {
          return true;
        }
      }
      return false;
    };

    // create action list
    const action_list: number[][] = [];
    let current = step;
    let total_delay = 0;
    if (current === 0) action_list.push([0]);
    do {
      current++;
      // check if SnippetProgressBehavior = Now
      if (
        this.scenarioData.Snippets[current].ProgressBehavior ===
        SnippetProgressBehavior.Now
      ) {
        // SnippetProgressBehavior = Now, push in the last list
        action_list[action_list.length - 1].push(current);
      } else {
        // SnippetProgressBehavior != Now, push a new list
        action_list.push([current]);
      }
      // sum delay time
      total_delay += this.scenarioData.Snippets[current].Delay;
    } while (!is_stop(current));
    // continue if the next steps SnippetProgressBehavior = Now
    while (
      !is_end(current) &&
      this.scenarioData.Snippets[current + 1].ProgressBehavior ===
        SnippetProgressBehavior.Now
    ) {
      current++;
      action_list[action_list.length - 1].push(current);
    }
    log.log("Live2DController", action_list);

    // clear signal
    this.animate.reset_abort();
    // if total delay time before stop > 1 seconds, clear dialog box
    if (total_delay > 1) this.layers.dialog.hide(200);
    // apply all actions
    let offset_ms = 0;
    for (const action_in_parallel of action_list) {
      const start_time = Date.now();
      await this.live2d_load_model(Math.max(...action_in_parallel));
      await Promise.all(
        action_in_parallel.map((a) =>
          this.apply_action(a, Math.min(-offset_ms + 1000, 0))
        )
      );
      offset_ms = Date.now() - start_time;
    }

    // wait all talk sounds finished
    for (const s of this.scenarioResource.audio.filter(
      (sound) => sound.type === Live2DAssetType.Talk
    )) {
      const sound = s.data;
      if (sound.playing()) {
        await new Promise<void>((resolve) => {
          if (this.animate.abort_controller.signal.aborted) {
            resolve();
            return;
          }
          sound.once("stop", () => {
            resolve();
          });
          const abort_handler = () => {
            resolve();
            this.animate.abort_controller.signal.removeEventListener(
              "abort",
              abort_handler
            );
          };
          this.animate.abort_controller.signal.addEventListener(
            "abort",
            abort_handler
          );
        });
      }
    }

    // if reach end, return -1
    return is_end(current) ? -1 : current;
  };
  apply_action = async (step: number, delay_offset_ms = 0) => {
    const action = this.scenarioData.Snippets[step];
    if (action.Delay > 0)
      await this.animate.delay(
        Math.max(action.Delay * 1000 + delay_offset_ms, 0)
      );
    await single_action(this, action);
  };
  /**
   * apply motions. If model is T-pose,
   * and motion name or facial name is empty,
   * apply last motion/expression.
   * @param costume
   * @param motion
   * @param expression
   */
  apply_live2d_motion = async (
    costume: string,
    motion: string,
    expression: string,
    to_last_frame: boolean = false
  ) => {
    log.log(
      "Live2DController",
      `apply motion${to_last_frame ? " last frame" : ""}: ${costume}|${motion}|${expression}`
    );
    const model_data = this.modelData.find((n) => n.costume === costume);
    const current_model = this.current_costume.find(
      (p) => p.costume === costume
    );
    const model_obj = this.layers.live2d.find(costume);
    const wait_list = [];
    if (model_data && current_model && model_obj) {
      // if model is T-pose, update motion and expression
      if (model_obj.live2DInfo.t_pose) {
        motion = motion === "" ? current_model.motion : motion;
        expression = expression === "" ? current_model.expression : expression;
        log.log(
          "Live2DController",
          `actual applied motion: ${costume}|${motion}|${expression}`
        );
      }
      if (expression !== "") {
        const index = model_data.data.FileReferences.Motions.Expression.map(
          (m) => m.Name
        ).indexOf(expression);
        if (index === -1) {
          log.warn("Live2DController", `${expression} not found.`);
          this.events.emit("warn", `${expression} not found.`);
        }
        wait_list.push(
          this.layers.live2d
            .update_motion("Expression", costume, index, to_last_frame)
            .then((_) => (current_model.expression = expression))
        );
      }
      if (motion !== "") {
        const index = model_data.data.FileReferences.Motions.Motion.map(
          (m) => m.Name
        ).indexOf(motion);
        if (index === -1) {
          log.warn("Live2DController", `${motion} not found.`);
          this.events.emit("warn", `${motion} not found.`);
        }
        wait_list.push(
          this.layers.live2d
            .update_motion("Motion", costume, index, to_last_frame)
            .then((_) => (current_model.motion = motion))
        );
      }
    }
    await Promise.all(wait_list);
  };
  live2d_load_model = async (
    step: number,
    onLoading?: ILive2DLoadProgressHandler
  ) => {
    const queue = this.model_queue[step];
    const current_queue = this.layers.live2d
      .get_model_list()
      .map((m) => m.live2DInfo.costume);
    // destory
    current_queue
      .filter((m) => !queue.includes(m))
      .forEach((m) => this.layers.live2d.find(m)!.destroy());
    // create and load model one by one
    const queue_to_load = queue
      .filter((m) => !current_queue.includes(m))
      .map((m) => this.modelData.find((md) => md.costume === m)!);
    let count = 0;
    for (const m of queue_to_load) {
      if (onLoading)
        onLoading(
          Live2DLoadProgressType.RenderModel,
          count,
          queue_to_load.length,
          m.costume
        );
      await this.layers.live2d.load(m);
      count++;
    }
    // add effects
    this.current_costume
      .filter((c) => {
        if (c.animations.length > 0) {
          const m = this.layers.live2d.find(c.costume);
          return m && m.live2DInfo.animations.length === 0;
        }
        return false;
      })
      .forEach((c) => {
        c.animations.forEach((a) => {
          this.layers.live2d.add_effect(c.costume, a as "hologram");
        });
      });
  };
  live2d_set_costume = (cid: number, costume: string) => {
    const costume_idx = this.current_costume.findIndex((p) => p.cid === cid);
    if (costume_idx === -1) {
      this.current_costume.push({
        cid: cid,
        costume: costume,
        motion: "",
        expression: "",
        appear_time: Date.now(),
        animations: [],
      });
    } else {
      this.current_costume[costume_idx].costume = costume;
    }
    return costume;
  };
  live2d_get_costume = (cid: number) => {
    const costume_idx = this.current_costume.findIndex((p) => p.cid === cid);
    return costume_idx !== -1
      ? this.current_costume[costume_idx].costume
      : undefined;
  };
  live2d_set_appear = (cid: number) => {
    const model = this.current_costume.find((p) => p.cid === cid);
    if (model) model.appear_time = Date.now();
  };
  live2d_stay = async (cid: number, min_time_ms: number) => {
    const model = this.current_costume.find((p) => p.cid === cid);
    if (model) {
      const duration = Date.now() - model.appear_time;
      if (duration < min_time_ms)
        await this.animate.delay(min_time_ms - duration);
    }
  };
  set_volume = (volume: {
    voice_volume?: number;
    bgm_volume?: number;
    se_volume?: number;
  }) => {
    Object.assign(this.settings, volume);
    if (volume.bgm_volume) this.settings.bgm_volume *= 0.5; // bgm too load
    const s_list = this.scenarioResource.audio.filter((sound) =>
      sound.data.playing()
    );
    if (volume.voice_volume)
      s_list
        .filter((sound) => sound.type === Live2DAssetType.Talk)
        .forEach((sound) => {
          sound.data.volume(this.settings.voice_volume);
        });
    if (volume.bgm_volume)
      s_list
        .filter((sound) => sound.type === Live2DAssetType.BackgroundMusic)
        .forEach((sound) => {
          sound.data.volume(this.settings.bgm_volume);
        });
    if (volume.se_volume)
      s_list
        .filter((sound) => sound.type === Live2DAssetType.SoundEffect)
        .forEach((sound) => {
          sound.data.volume(this.settings.se_volume);
        });
  };
  stop_sounds = (sound_types: Live2DAssetType[], unload = false) => {
    this.scenarioResource.audio
      .filter((resource) => sound_types.includes(resource.type))
      .forEach((resource) => {
        const sound = resource.data;
        if (sound.playing()) sound.stop();
        if (unload) sound.unload();
      });
    if (sound_types.includes(Live2DAssetType.Talk)) {
      this.layers.live2d.stop_speaking();
    }
  };
  public destroy() {
    // unload all sounds
    this.stop_sounds(
      [
        Live2DAssetType.Talk,
        Live2DAssetType.BackgroundMusic,
        Live2DAssetType.SoundEffect,
      ],
      true
    );
    // unload all images
    this.scenarioResource.image.forEach((resource) => {
      const image = resource.data;
      image.src = "";
      image.remove();
    });
    // destroy player
    super.destroy();
  }
}

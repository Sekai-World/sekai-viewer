import { Live2DPlayer } from "./player";
import type { Application } from "pixi.js";
import { Howl, Howler } from "howler";
import { log } from "./log";
import {
  IScenarioData,
  SnippetAction,
  SpecialEffectType,
  SnippetProgressBehavior,
  SoundPlayMode,
  CharacterLayoutType,
  CharacterLayoutPosition,
  CharacterLayoutMoveSpeedType,
  SeAttachCharacterShaderType,
} from "../../types.d";

import {
  Live2DAssetType,
  Live2DAssetTypeUI,
  ILive2DCachedAsset,
  ILive2DModelDataCollection,
  ILive2DControllerData,
} from "./types.d";

function side_to_position(side: number, offset: number) {
  let position: [number, number] = [0.5, 0.5];
  switch (side) {
    case CharacterLayoutPosition.Center:
      position = [0.5, 0.5];
      break;
    case CharacterLayoutPosition.Left:
      position = [0.3, 0.5];
      break;
    case CharacterLayoutPosition.Right:
      position = [0.7, 0.5];
      break;
    case CharacterLayoutPosition.LeftEdge:
      position = [-0.5, 0.5];
      break;
    case CharacterLayoutPosition.RightEdge:
      position = [1.5, 0.5];
      break;
    case CharacterLayoutPosition.BottomEdge:
      position = [0.5, 1.5];
      break;
    case CharacterLayoutPosition.BottomLeftEdge:
      position = [0.3, 1.5];
      break;
    case CharacterLayoutPosition.BottomRightEdge:
      position = [0.7, 1.5];
      break;
    default:
      position = [0.5, 0.5];
  }
  position[0] += offset / 2000;
  return position;
}

function move_speed(t: CharacterLayoutMoveSpeedType) {
  switch (t) {
    case CharacterLayoutMoveSpeedType.Fast:
      return 300;
    case CharacterLayoutMoveSpeedType.Normal:
      return 500;
    case CharacterLayoutMoveSpeedType.Slow:
      return 700;
    default:
      return 300;
  }
}

export class Live2DController extends Live2DPlayer {
  private scenarioData: IScenarioData;
  private scenarioResource: ILive2DCachedAsset[];
  private modelData: ILive2DModelDataCollection[];
  private model_queue: string[][];
  current_costume: {
    cid: number;
    costume: string;
    appear_time: number;
    animations: string[];
  }[];

  public step: number;

  constructor(
    app: Application,
    stageSize: [number, number],
    data: ILive2DControllerData
  ) {
    super(
      app,
      stageSize,
      data.scenarioResource.filter((a) =>
        Live2DAssetTypeUI.includes(a.type as any)
      )
    );
    this.scenarioData = data.scenarioData;
    this.scenarioResource = data.scenarioResource;
    this.modelData = data.modelData;
    this.current_costume = [];
    this.step = 0;

    this.model_queue = this.create_model_queue();
    log.log("Live2DController", "init.");
  }

  /**
   * Create a model list used in an action.
   * New models will replace the oldest model and minimize model list change.
   * @param queue_max max queue length, range: 2-8.
   * Load more than 8 models in the same scene will cause live2d sdk not update the models.
   */
  create_model_queue = (queue_max = 7) => {
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
    if (total_delay > 1) this.animate.hide_layer("dialog", 200);
    // apply all actions
    let offset_ms = 0;
    for (const action_in_parallel of action_list) {
      const start_time = Date.now();
      await this.live2d_load_model(Math.max(...action_in_parallel));
      await Promise.all(
        action_in_parallel.map((a) => this.apply_action(a, -offset_ms))
      );
      offset_ms = Date.now() - start_time;
    }

    // wait all talk sounds finished
    await this.live2d.all_speak_finish();
    for (const s of this.scenarioResource.filter(
      (sound) => sound.type === Live2DAssetType.Talk
    )) {
      const sound = s.data as Howl;
      if (sound.playing()) {
        await new Promise<void>((resolve) => {
          if (this.abort_controller.signal.aborted) {
            resolve();
            return;
          }
          sound.on("end", () => {
            resolve();
          });
          this.abort_controller.signal.addEventListener("abort", () => {
            resolve();
          });
        });
      }
    }

    log.log("Live2DController", this.app.stage.getChildByName("live2d"));
    return current;
  };
  apply_action = async (step: number, delay_offset_ms = 0) => {
    const action = this.scenarioData.Snippets[step];
    if (action.Delay > 0)
      await this.animate.delay(
        Math.max(action.Delay * 1000 + delay_offset_ms, 0)
      );
    switch (action.Action) {
      case SnippetAction.SpecialEffect:
        {
          const action_detail =
            this.scenarioData.SpecialEffectData[action.ReferenceIndex];
          switch (action_detail.EffectType) {
            case SpecialEffectType.ChangeBackground:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/ChangeBackground",
                  action,
                  action_detail
                );
                const data = this.scenarioResource.find(
                  (s) =>
                    s.identifer === action_detail.StringValSub &&
                    s.type === Live2DAssetType.BackgroundImage
                )?.data as HTMLImageElement;
                this.draw.background(data);
              }
              break;
            case SpecialEffectType.Telop:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/Telop",
                  action,
                  action_detail
                );
                const data = action_detail.StringVal;
                this.draw.telop(data);
                await this.animate.show_layer("telop", 300);
              }
              break;
            case SpecialEffectType.WhiteIn:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/WhiteIn",
                  action,
                  action_detail
                );
                await this.animate.hide_layer("fullcolor", 1000);
              }
              break;
            case SpecialEffectType.WhiteOut:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/WhiteOut",
                  action,
                  action_detail
                );
                this.animate.hide_layer("dialog", 100);
                this.draw.fullcolor(0xffffff);
                await this.animate.show_layer("fullcolor", 1000);
              }
              break;
            case SpecialEffectType.BlackIn:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/BlackIn",
                  action,
                  action_detail
                );
                await this.animate.hide_layer("fullcolor", 1000);
              }
              break;
            case SpecialEffectType.BlackOut:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/BlackOut",
                  action,
                  action_detail
                );
                this.animate.hide_layer("dialog", 100);
                this.draw.fullcolor(0x000000);
                await this.animate.show_layer("fullcolor", 1000);
              }
              break;
            case SpecialEffectType.FlashbackIn:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/FlashbackIn",
                  action,
                  action_detail
                );
                this.draw.flashback();
                await this.animate.show_layer("flashback", 100);
              }
              break;
            case SpecialEffectType.FlashbackOut:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/FlashbackOut",
                  action,
                  action_detail
                );
                await this.animate.hide_layer("flashback", 100);
              }
              break;
            case SpecialEffectType.AttachCharacterShader:
              {
                log.log(
                  "Live2DController",
                  "SpecialEffect/AttachCharacterShader",
                  action,
                  action_detail
                );
                switch (action_detail.StringVal) {
                  case SeAttachCharacterShaderType.Hologram:
                    {
                      this.live2d.add_effect(
                        this.live2d_get_costume(action_detail.IntVal)!,
                        "hologram"
                      );
                      this.current_costume
                        .find((c) => c.cid === action_detail.IntVal)!
                        .animations.push("hologram");
                    }
                    break;
                  case SeAttachCharacterShaderType.None:
                  case SeAttachCharacterShaderType.Empty:
                    {
                      this.live2d.remove_effect(
                        this.live2d_get_costume(action_detail.IntVal)!,
                        "hologram"
                      );
                      this.current_costume.find(
                        (c) => c.cid === action_detail.IntVal
                      )!.animations = [];
                    }
                    break;
                  default:
                    log.warn(
                      "Live2DController",
                      `${SnippetAction[action.Action]}/${SpecialEffectType[action_detail.EffectType]}/${(SeAttachCharacterShaderType as any)[action_detail.StringVal]} not implemented!`,
                      action,
                      action_detail
                    );
                }
              }
              break;
            default:
              log.warn(
                "Live2DController",
                `${SnippetAction[action.Action]}/${SpecialEffectType[action_detail.EffectType]} not implemented!`,
                action,
                action_detail
              );
          }
        }
        break;
      case SnippetAction.CharacterLayout:
        {
          const action_detail =
            this.scenarioData.LayoutData[action.ReferenceIndex];
          this.animate.hide_layer("telop", 500);
          switch (action_detail.Type) {
            case CharacterLayoutType.Motion:
              {
                log.log(
                  "Live2DController",
                  "CharacterLayout/Motion",
                  action,
                  action_detail
                );
                const costume = this.live2d_get_costume(
                  action_detail.Character2dId
                )!;
                // Step 1: Apply motions and expressions.
                const motion = this.apply_live2d_motion(
                  costume,
                  action_detail.MotionName,
                  action_detail.FacialName
                );
                // (Same time) Move from current position to SideTo position or not move.
                const to = side_to_position(
                  action_detail.SideTo,
                  action_detail.SideToOffsetX
                );
                const move = this.live2d.move(
                  costume,
                  undefined,
                  to,
                  move_speed(action_detail.MoveSpeedType)
                );

                await move;
                await motion;
              }
              break;
            case CharacterLayoutType.Appear:
              {
                log.log(
                  "Live2DController",
                  "CharacterLayout/Appear",
                  action,
                  action_detail
                );
                // update CostumeType
                let costume = "";
                if (action_detail.CostumeType !== "") {
                  costume = this.live2d_set_costume(
                    action_detail.Character2dId,
                    action_detail.CostumeType
                  );
                } else {
                  costume = this.live2d_get_costume(
                    action_detail.Character2dId
                  )!;
                }
                // Step 1: Apply motions and expressions. (To get the finish pose.)
                await this.apply_live2d_motion(
                  costume,
                  action_detail.MotionName,
                  action_detail.FacialName
                );
                // Step 2: Show. (after motion finished)
                const show = this.live2d.show(costume, 200);
                this.live2d_set_appear(action_detail.Character2dId);
                // (Same time) Move from SideFrom position to SideTo position or at SideFrom position.
                const from = side_to_position(
                  action_detail.SideFrom,
                  action_detail.SideFromOffsetX
                );
                const to = side_to_position(
                  action_detail.SideTo,
                  action_detail.SideToOffsetX
                );
                let move;
                if (from[0] === to[0] && from[1] === to[1]) {
                  this.live2d.set_position(costume, from);
                } else {
                  move = this.live2d.move(
                    costume,
                    from,
                    to,
                    move_speed(action_detail.MoveSpeedType)
                  );
                }
                // (Same time) Apply the same motions and expressions again.
                this.animate
                  .delay(10)
                  .then(() =>
                    this.apply_live2d_motion(
                      costume,
                      action_detail.MotionName,
                      action_detail.FacialName
                    )
                  );

                await show;
                await move;
                //await motion;
              }
              break;
            case CharacterLayoutType.Clear:
              {
                log.log(
                  "Live2DController",
                  "CharacterLayout/Clear",
                  action,
                  action_detail
                );
                const costume = this.live2d_get_costume(
                  action_detail.Character2dId
                )!;
                // Step 1: Move from SideFrom position to SideTo position or not move.
                const from = side_to_position(
                  action_detail.SideFrom,
                  action_detail.SideFromOffsetX
                );
                const to = side_to_position(
                  action_detail.SideTo,
                  action_detail.SideToOffsetX
                );
                if (!(from[0] === to[0] && from[1] === to[1])) {
                  await this.live2d.move(
                    costume,
                    from,
                    to,
                    move_speed(action_detail.MoveSpeedType)
                  );
                }
                // Step 2: Wait for the model exist at least 2 seconds.
                await this.live2d_stay(action_detail.Character2dId, 2000);
                // Step 3: Hide.
                await this.live2d.hide(costume, 200);
              }
              break;
            default:
              log.warn(
                "Live2DController",
                `${SnippetAction[action.Action]}/${CharacterLayoutType[action_detail.Type]} not implemented!`,
                action,
                action_detail
              );
          }
        }
        break;
      case SnippetAction.CharacterMotion:
        {
          const action_detail =
            this.scenarioData.LayoutData[action.ReferenceIndex];
          switch (action_detail.Type) {
            case CharacterLayoutType.CharacterMotion:
              {
                log.log(
                  "Live2DController",
                  "CharacterMotion/CharacterMotion",
                  action,
                  action_detail
                );
                // Step 1: Apply motions and expressions.
                await this.apply_live2d_motion(
                  this.live2d_get_costume(action_detail.Character2dId)!,
                  action_detail.MotionName,
                  action_detail.FacialName
                );
              }
              break;
            default:
              log.warn(
                "Live2DController",
                `${SnippetAction[action.Action]}/${CharacterLayoutType[action_detail.Type]} not implemented!`,
                action,
                action_detail
              );
          }
        }
        break;
      case SnippetAction.Talk:
        {
          const action_detail =
            this.scenarioData.TalkData[action.ReferenceIndex];
          log.log("Live2DController", "Talk", action, action_detail);
          //clear
          await this.animate.hide_layer("telop", 200);
          // show dialog
          const dialog = this.animate.dialog(
            action_detail.WindowDisplayName,
            action_detail.Body
          );
          await this.animate.show_layer("dialog", 200);
          // motion
          const motion = action_detail.Motions.map((m) => {
            this.apply_live2d_motion(
              this.live2d_get_costume(m.Character2dId)!,
              m.MotionName,
              m.FacialName
            );
          });
          // sound
          if (action_detail.Voices.length > 0) {
            this.stop_sounds([Live2DAssetType.Talk]);
            const sound = this.scenarioResource.find(
              (s) =>
                s.identifer === action_detail.Voices[0].VoiceId &&
                s.type === Live2DAssetType.Talk
            )!;
            if (sound) {
              const costume = this.live2d_get_costume(
                action_detail.TalkCharacters[0].Character2dId
              );
              if (costume) {
                this.live2d.speak(costume, sound.url);
              } else {
                (sound.data as Howl).play();
              }
            } else
              log.warn(
                "Live2DController",
                `${action_detail.Voices[0].VoiceId} not loaded, skip.`
              );
          }
          // wait motion and  text animation
          await Promise.all(motion);
          await dialog;
        }
        break;
      case SnippetAction.Sound:
        {
          const action_detail =
            this.scenarioData.SoundData[action.ReferenceIndex];
          log.log("Live2DController", "Sound", action, action_detail);
          if (action_detail.Bgm) {
            if (action_detail.Bgm === "bgm00000") {
              Howler.stop();
            } else {
              const sound = this.scenarioResource.find(
                (s) =>
                  s.identifer === action_detail.Bgm &&
                  s.type === Live2DAssetType.BackgroundMusic
              )?.data as Howl;
              sound.loop(true);
              this.stop_sounds([Live2DAssetType.BackgroundMusic]);
              sound.volume(0.8);
              sound.play();
            }
          } else if (action_detail.Se) {
            const sound = this.scenarioResource.find(
              (s) =>
                s.identifer === action_detail.Se &&
                s.type === Live2DAssetType.SoundEffect
            )?.data;
            if (sound) {
              switch (action_detail.PlayMode) {
                case SoundPlayMode.Stop:
                  {
                    (sound as Howl).stop();
                  }
                  break;
                case SoundPlayMode.SpecialSePlay:
                  {
                    (sound as Howl).loop(true);
                    (sound as Howl).play();
                  }
                  break;
                case SoundPlayMode.CrossFade:
                  {
                    (sound as Howl).loop(false);
                    (sound as Howl).play();
                  }
                  break;
                case SoundPlayMode.Stack:
                  {
                    (sound as Howl).loop(false);
                    (sound as Howl).play();
                  }
                  break;
                default:
                  log.warn(
                    "Live2DController",
                    `Sound/SoundPlayMode:${action_detail.PlayMode} not implemented!`,
                    action
                  );
              }
            } else
              log.warn(
                "Live2DController",
                `${action_detail.Se} not loaded, skip.`
              );
          }
        }
        break;
      default:
        log.warn(
          "Live2DController",
          `${SnippetAction[action.Action]} not implemented!`,
          action
        );
    }
  };
  apply_live2d_motion = async (
    costume: string,
    motion: string,
    expression: string
  ) => {
    log.log(
      "Live2DController",
      `apply motion: ${costume}|${motion}|${expression}`
    );
    const model = this.modelData.find((n) => n.costume === costume);
    const wait_list = [];
    if (model) {
      if (expression !== "") {
        wait_list.push(
          this.live2d.update_motion(
            "Expression",
            costume,
            model.expressions.indexOf(expression)
          )
        );
      }
      if (motion !== "") {
        wait_list.push(
          this.live2d.update_motion(
            "Motion",
            costume,
            model.motions.indexOf(motion)
          )
        );
      }
    }
    await Promise.all(wait_list);
  };
  live2d_load_model = async (step: number) => {
    const queue = this.model_queue[step];
    const current_queue = this.live2d
      .get_model_list()
      .map((m) => m.live2DInfo.costume);
    // destory
    current_queue
      .filter((m) => !queue.includes(m))
      .forEach((m) => this.live2d.find(m)!.destroy());
    // create
    await Promise.all(
      queue
        .filter((m) => !current_queue.includes(m))
        .map((m) =>
          this.live2d.init(this.modelData.find((md) => md.costume === m)!)
        )
    );
    // add effects
    this.current_costume
      .filter((c) => {
        if (c.animations.length > 0) {
          const m = this.live2d.find(c.costume);
          return m && m.live2DInfo.animations.length === 0;
        }
        return false;
      })
      .forEach((c) => {
        c.animations.forEach((a) => {
          this.live2d.add_effect(c.costume, a as "hologram");
        });
      });
  };
  live2d_set_costume = (cid: number, costume: string) => {
    const costume_idx = this.current_costume.findIndex((p) => p.cid === cid);
    if (costume_idx === -1) {
      this.current_costume.push({
        cid: cid,
        costume: costume,
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
  stop_sounds = (sound_types: Live2DAssetType[]) => {
    this.scenarioResource
      .filter(
        (resource) => sound_types.findIndex((t) => t === resource.type) !== -1
      )
      .forEach((resource) => {
        const sound = resource.data as Howl;
        if (sound.playing()) sound.stop();
      });
    if (sound_types.findIndex((t) => t === Live2DAssetType.Talk) !== -1) {
      this.live2d.stop_speaking();
    }
  };
  unload = () => {
    this.stop_sounds([
      Live2DAssetType.BackgroundMusic,
      Live2DAssetType.SoundEffect,
    ]);
    this.destroy();
  };
}

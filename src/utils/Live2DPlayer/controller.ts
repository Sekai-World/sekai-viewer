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
} from "../../types.d";

import {
  Live2DImageAssetType,
  Live2DSoundAssetType,
  ILive2DCachedAsset,
  ILive2DModelDataCollection,
  ILive2DControllerData,
  CharacterLayoutType,
  CharacterMotionType,
} from "./types.d";

function side_to_position(sidefrom: number) {
  if (sidefrom === 4) return [0.5, 0.5];
  if (sidefrom === 3) return [0.3, 0.5];
  if (sidefrom === 7) return [0.7, 0.5];
  return [0.5, 0.5];
}

export class Live2DController extends Live2DPlayer {
  private scenarioData: IScenarioData;
  private scenarioResource: ILive2DCachedAsset[];
  private modelData: ILive2DModelDataCollection[];
  current_costume: {
    cid: number;
    costume: string;
  }[];

  public step: number;

  constructor(
    app: Application,
    stageSize: number[],
    data: ILive2DControllerData
  ) {
    super(
      app,
      stageSize,
      data.scenarioResource.filter((a) => a.type === Live2DImageAssetType.UI)
    );
    this.scenarioData = data.scenarioData;
    this.scenarioResource = data.scenarioResource;
    this.modelData = data.modelData;
    this.step = 0;
    this.current_costume = [];
    log.log("Live2DController", "init.");
  }

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
    // apply all actions
    // offset_m
    let offset_ms = 0;
    for (const action_in_parallel of action_list) {
      const start_time = Date.now();
      await Promise.all(
        action_in_parallel.map((a) => this.apply_action(a, -offset_ms))
      );
      offset_ms = Date.now() - start_time;
    }

    // wait all talk sounds finished
    await this.live2d.all_speak_finish();

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
                    s.type === Live2DImageAssetType.BackgroundImage
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
                await this.animate.show_layer("telop", 500);
                await this.animate.delay(1000);
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
      case SnippetAction.CharacerLayout:
        {
          const action_detail =
            this.scenarioData.LayoutData[action.ReferenceIndex];
          this.animate.hide_layer("telop", 500);
          switch (action_detail.Type) {
            case CharacterLayoutType.Move:
            case CharacterLayoutType.Appear:
              {
                log.log(
                  "Live2DController",
                  "CharacerLayout/Move,Appear",
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
                  );
                }
                this.live2d.set_position(
                  costume,
                  side_to_position(action_detail.SideFrom)
                );
                await this.apply_live2d_motion(
                  costume,
                  action_detail.MotionName,
                  action_detail.FacialName
                );
                await this.live2d.show(costume, 200);
              }
              break;
            case CharacterLayoutType.Clear:
              {
                log.log(
                  "Live2DController",
                  "CharacerLayout/Clear",
                  action,
                  action_detail
                );
                if (this.live2d.is_empty()) {
                  await this.animate.hide_layer("dialog", 200);
                } else {
                  await this.live2d.hide(
                    this.live2d_get_costume(action_detail.Character2dId),
                    200
                  );
                }
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
            case CharacterMotionType.Change:
              {
                log.log(
                  "Live2DController",
                  "CharacterMotion/Change",
                  action,
                  action_detail
                );
                await this.apply_live2d_motion(
                  this.live2d_get_costume(action_detail.Character2dId),
                  action_detail.MotionName,
                  action_detail.FacialName
                );
                await this.live2d.show(
                  this.live2d_get_costume(action_detail.Character2dId),
                  200
                );
              }
              break;
            default:
              log.warn(
                "Live2DController",
                `${SnippetAction[action.Action]}/${CharacterMotionType[action_detail.Type]} not implemented!`,
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
          for (const m of action_detail.Motions) {
            this.apply_live2d_motion(
              this.live2d_get_costume(m.Character2dId),
              m.MotionName,
              m.FacialName
            );
          }
          // sound
          if (action_detail.Voices.length > 0) {
            this.stop_sounds(["talk"]);
            const sound = this.scenarioResource.find(
              (s) =>
                s.identifer === action_detail.Voices[0].VoiceId &&
                s.type === Live2DSoundAssetType.Talk
            )!;
            if (sound)
              this.live2d.speak(
                this.live2d_get_costume(
                  action_detail.TalkCharacters[0].Character2dId
                ),
                sound.url
              );
            else
              log.warn(
                "Live2DController",
                `${action_detail.Voices[0].VoiceId} not loaded, skip.`
              );
          }
          // wait text animation
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
                  s.type === Live2DSoundAssetType.BackgroundMusic
              )?.data as Howl;
              sound.loop(true);
              this.stop_sounds(["backgroundmusic"]);
              sound.volume(0.8);
              sound.play();
            }
          } else if (action_detail.Se) {
            const sound = this.scenarioResource.find(
              (s) =>
                s.identifer === action_detail.Se &&
                s.type === Live2DSoundAssetType.SoundEffect
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
  live2d_model_init = async () => {
    this.live2d.clear();
    for (const m of this.modelData) {
      await this.live2d.init(m);
    }
  };
  live2d_set_costume = (cid: number, costume: string) => {
    const costume_idx = this.current_costume.findIndex((p) => p.cid === cid);
    if (costume_idx === -1) {
      this.current_costume.push({
        cid: cid,
        costume: costume,
      });
    } else {
      this.current_costume[costume_idx].costume = costume;
    }
    return costume;
  };
  live2d_get_costume = (cid: number) => {
    const costume_idx = this.current_costume.findIndex((p) => p.cid === cid);
    return this.current_costume[costume_idx].costume;
  };
  stop_sounds = (
    sound_types: ("backgroundmusic" | "soundeffect" | "talk")[]
  ) => {
    this.scenarioResource
      .filter(
        (resource) => sound_types.findIndex((t) => t === resource.type) !== -1
      )
      .forEach((resource) => {
        const sound = resource.data as Howl;
        if (sound.playing()) sound.stop();
      });
    if (sound_types.findIndex((t) => t === "talk") !== -1) {
      this.live2d.stop_speaking();
    }
  };
  unload = () => {
    this.stop_sounds(["backgroundmusic", "soundeffect", "talk"]);
  };
}

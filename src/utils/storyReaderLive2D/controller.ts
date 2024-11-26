import { Live2DPlayer } from "./player";
import type { Application } from "pixi.js";
import { Howl, Howler } from "howler";
import {
  IScenarioData,
  SnippetAction,
  SpecialEffectType,
  SnippetProgressBehavior,
} from "../../types.d";

import {
  ILive2DCachedData,
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

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export class Live2DController extends Live2DPlayer {
  private scenarioData: IScenarioData;
  private scenarioResource: ILive2DCachedData[];
  private modelData: ILive2DModelDataCollection[];
  public step: number;

  constructor(
    app: Application,
    stageSize: number[],
    data: ILive2DControllerData
  ) {
    super(app, stageSize);
    this.scenarioData = data.scenarioData;
    this.scenarioResource = data.scenarioResource;
    this.modelData = data.modelData;
    this.step = 0;
  }

  step_until_checkpoint = async (step: number) => {
    let current = step;
    const is_end = (step: number) => {
      return step >= this.scenarioData.Snippets.length - 1;
    };
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

    if (current === 0) await this.apply_action(current);
    if (is_end(current)) return current;
    do {
      current++;
      await this.apply_action(current);
    } while (!is_stop(current));

    while (
      !is_end(current) &&
      this.scenarioData.Snippets[current + 1].ProgressBehavior ===
        SnippetProgressBehavior.Now
    ) {
      current++;
      await this.apply_action(current);
    }
    console.log(this.app.stage.getChildByName("live2d"));
    return current;
  };
  apply_action = async (step: number) => {
    const action = this.scenarioData.Snippets[step];
    if (action.Delay > 0) await delay(action.Delay * 1000);
    switch (action.Action) {
      case SnippetAction.SpecialEffect:
        {
          const action_detail =
            this.scenarioData.SpecialEffectData[action.ReferenceIndex];
          switch (action_detail.EffectType) {
            case SpecialEffectType.ChangeBackground:
              {
                const data = this.scenarioResource.find(
                  (s) =>
                    s.identifer === action_detail.StringValSub &&
                    s.type === "background"
                )?.data as HTMLImageElement;
                this.draw.background(data);
              }
              break;
            case SpecialEffectType.Telop:
              {
                const data = action_detail.StringVal;
                this.draw.telop(data);
                await this.animate.show_layer("telop", 500);
              }
              break;
            case SpecialEffectType.WhiteIn:
              {
                await this.animate.hide_layer("fullcolor", 1000);
              }
              break;
            case SpecialEffectType.WhiteOut:
              {
                this.animate.hide_layer("dialog", 100);
                this.draw.fullcolor(0xffffff);
                await this.animate.show_layer("fullcolor", 1000);
              }
              break;
            case SpecialEffectType.BlackIn:
              {
                await this.animate.hide_layer("fullcolor", 1000);
              }
              break;
            case SpecialEffectType.BlackOut:
              {
                this.animate.hide_layer("dialog", 100);
                this.draw.fullcolor(0x000000);
                await this.animate.show_layer("fullcolor", 1000);
              }
              break;
            case SpecialEffectType.FlashbackIn:
              {
                this.draw.flashback();
                await this.animate.show_layer("flashback", 100);
              }
              break;
            case SpecialEffectType.FlashbackOut:
              {
                await this.animate.hide_layer("flashback", 100);
              }
              break;
            default:
              console.log(
                `${SnippetAction[action.Action]}/${SpecialEffectType[action_detail.EffectType]} not implemented!`
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
                // update CostumeType
                if (action_detail.CostumeType !== "") {
                  const model = this.modelData.find(
                    (n) => n.costume === action_detail.CostumeType
                  );
                  if (model) {
                    await this.live2d.init(model);
                  }
                }
                this.live2d.set_position(
                  action_detail.Character2dId,
                  side_to_position(action_detail.SideFrom)
                );
                await this.apply_live2d_motion(
                  action_detail.Character2dId,
                  action_detail.MotionName,
                  action_detail.FacialName
                );
                await this.live2d.show(action_detail.Character2dId, 200);
              }
              break;
            case CharacterLayoutType.Clear:
              {
                if (this.live2d.is_empty()) {
                  await this.animate.hide_layer("dialog", 200);
                } else {
                  await this.live2d.hide(action_detail.Character2dId, 200);
                }
              }
              break;
            default:
              console.log(
                `${SnippetAction[action.Action]}/${CharacterLayoutType[action_detail.Type]} not implemented!`
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
                //this.live2d.set_position(action_detail.Character2dId, side_to_position(action_detail.SideFrom, action_detail.SideTo));
                await this.apply_live2d_motion(
                  action_detail.Character2dId,
                  action_detail.MotionName,
                  action_detail.FacialName
                );
                await this.live2d.show(action_detail.Character2dId, 200);
              }
              break;
            default:
              console.log(
                `${SnippetAction[action.Action]}/${CharacterMotionType[action_detail.Type]} not implemented!`
              );
          }
        }
        break;
      case SnippetAction.Talk:
        {
          //clear
          await this.animate.hide_layer("telop", 200);
          // motion
          const action_detail =
            this.scenarioData.TalkData[action.ReferenceIndex];
          for (const m of action_detail.Motions) {
            await this.apply_live2d_motion(
              m.Character2dId,
              m.MotionName,
              m.FacialName
            );
          }
          // show dialog
          this.draw.dialog({
            cn: action_detail.WindowDisplayName,
            text: action_detail.Body,
          });
          await this.animate.show_layer("dialog", 200);
          // sound
          if (action_detail.Voices.length > 0) {
            const sound = this.scenarioResource.find(
              (s) =>
                s.identifer === action_detail.Voices[0].VoiceId &&
                s.type === "talk"
            )?.data as Howl;
            sound.play();
          }
        }
        break;
      case SnippetAction.Sound:
        {
          const action_detail =
            this.scenarioData.SoundData[action.ReferenceIndex];
          if (action_detail.Bgm) {
            if (action_detail.Bgm === "bgm00000") {
              Howler.stop();
            } else {
              const sound = this.scenarioResource.find(
                (s) =>
                  s.identifer === action_detail.Bgm &&
                  s.type === "backgroundmusic"
              )?.data as Howl;
              sound.loop(true);
              Howler.stop();
              sound.play();
            }
          } else if (action_detail.Se) {
            const sound = this.scenarioResource.find(
              (s) =>
                s.identifer === action_detail.Se && s.type === "soundeffect"
            )?.data as Howl;
            sound.play();
          }
        }
        break;
      default:
        console.log(`${SnippetAction[action.Action]} not implemented!`);
    }
  };
  apply_live2d_motion = async (
    cid: number,
    motion: string,
    expression: string
  ) => {
    //console.log(`apply motion: ${cid}|${motion}|${expression}`)
    const model = this.modelData.find((n) => n.cid === cid);
    if (model) {
      if (expression !== "") {
        await this.live2d.update_motion(
          "Expression",
          cid,
          model.expressions.indexOf(expression)
        );
      }
      if (motion !== "") {
        await this.live2d.update_motion(
          "Motion",
          cid,
          model.motions.indexOf(motion)
        );
      }
    }
  };
}

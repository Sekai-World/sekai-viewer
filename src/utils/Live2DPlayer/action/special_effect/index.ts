import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { SpecialEffectType, SnippetAction } from "../../../../types.d";
import { log } from "../../log";

import ChangeBackground from "./ChangeBackground";
import Telop from "./Telop";
import WhiteIn from "./WhiteIn";
import WhiteOut from "./WhiteOut";
import BlackIn from "./BlackIn";
import BlackOut from "./BlackOut";
import FlashbackIn from "./FlashbackIn";
import FlashbackOut from "./FlashbackOut";
import AttachCharacterShader from "./AttachCharacterShader";
import PlayScenarioEffect from "./PlayScenarioEffect";
import StopScenarioEffect from "./StopScenarioEffect";
import ShakeScreen from "./ShakeScreen";
import ShakeWindow from "./ShakeWindow";
import StopShakeScreen from "./StopShakeScreen";
import StopShakeWindow from "./StopShakeWindow";
import AmbientColorNormal from "./AmbientColorNormal";
import AmbientColorEvening from "./AmbientColorEvening";
import AmbientColorNight from "./AmbientColorNight";
import BlackWipeInLeft from "./BlackWipeInLeft";
import BlackWipeOutLeft from "./BlackWipeOutLeft";
import BlackWipeInRight from "./BlackWipeInRight";
import BlackWipeOutRight from "./BlackWipeOutRight";
import BlackWipeInTop from "./BlackWipeInTop";
import BlackWipeOutTop from "./BlackWipeOutTop";
import BlackWipeInBottom from "./BlackWipeInBottom";
import BlackWipeOutBottom from "./BlackWipeOutBottom";
import SekaiIn from "./SekaiIn";
import SekaiOut from "./SekaiOut";
import FullScreenText from "./FullScreenText";
import FullScreenTextShow from "./FullScreenTextShow";
import FullScreenTextHide from "./FullScreenTextHide";

export default async function action_se(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  switch (action_detail.EffectType) {
    case SpecialEffectType.ChangeBackground:
      await ChangeBackground(controller, action);
      break;
    case SpecialEffectType.Telop:
      await Telop(controller, action);
      break;
    case SpecialEffectType.WhiteIn:
      await WhiteIn(controller, action);
      break;
    case SpecialEffectType.WhiteOut:
      await WhiteOut(controller, action);
      break;
    case SpecialEffectType.BlackIn:
      await BlackIn(controller, action);
      break;
    case SpecialEffectType.BlackOut:
      await BlackOut(controller, action);
      break;
    case SpecialEffectType.FlashbackIn:
      await FlashbackIn(controller, action);
      break;
    case SpecialEffectType.FlashbackOut:
      await FlashbackOut(controller, action);
      break;
    case SpecialEffectType.AttachCharacterShader:
      await AttachCharacterShader(controller, action);
      break;
    case SpecialEffectType.PlayScenarioEffect:
      await PlayScenarioEffect(controller, action);
      break;
    case SpecialEffectType.StopScenarioEffect:
      await StopScenarioEffect(controller, action);
      break;
    case SpecialEffectType.ShakeScreen:
      await ShakeScreen(controller, action);
      break;
    case SpecialEffectType.ShakeWindow:
      await ShakeWindow(controller, action);
      break;
    case SpecialEffectType.StopShakeScreen:
      await StopShakeScreen(controller, action);
      break;
    case SpecialEffectType.StopShakeWindow:
      await StopShakeWindow(controller, action);
      break;
    case SpecialEffectType.AmbientColorNormal:
      await AmbientColorNormal(controller, action);
      break;
    case SpecialEffectType.AmbientColorEvening:
      await AmbientColorEvening(controller, action);
      break;
    case SpecialEffectType.AmbientColorNight:
      await AmbientColorNight(controller, action);
      break;
    case SpecialEffectType.BlackWipeInLeft:
      await BlackWipeInLeft(controller, action);
      break;
    case SpecialEffectType.BlackWipeOutLeft:
      await BlackWipeOutLeft(controller, action);
      break;
    case SpecialEffectType.BlackWipeInRight:
      await BlackWipeInRight(controller, action);
      break;
    case SpecialEffectType.BlackWipeOutRight:
      await BlackWipeOutRight(controller, action);
      break;
    case SpecialEffectType.BlackWipeInTop:
      await BlackWipeInTop(controller, action);
      break;
    case SpecialEffectType.BlackWipeOutTop:
      await BlackWipeOutTop(controller, action);
      break;
    case SpecialEffectType.BlackWipeInBottom:
      await BlackWipeInBottom(controller, action);
      break;
    case SpecialEffectType.BlackWipeOutBottom:
      await BlackWipeOutBottom(controller, action);
      break;
    case SpecialEffectType.SekaiIn:
      await SekaiIn(controller, action);
      break;
    case SpecialEffectType.SekaiOut:
      await SekaiOut(controller, action);
      break;
    case SpecialEffectType.FullScreenText:
      await FullScreenText(controller, action);
      break;
    case SpecialEffectType.FullScreenTextShow:
      await FullScreenTextShow(controller, action);
      break;
    case SpecialEffectType.FullScreenTextHide:
      await FullScreenTextHide(controller, action);
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

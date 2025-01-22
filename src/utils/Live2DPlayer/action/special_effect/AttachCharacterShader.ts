import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import {
  SpecialEffectType,
  SeAttachCharacterShaderType,
  SnippetAction,
} from "../../../../types.d";
import { log } from "../../log";

export default async function AttachCharacterShader(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/AttachCharacterShader",
    action,
    action_detail
  );
  switch (action_detail.StringVal) {
    case SeAttachCharacterShaderType.Hologram:
      {
        controller.layers.live2d.add_effect(
          controller.live2d_get_costume(action_detail.IntVal)!,
          "hologram"
        );
        controller.current_costume
          .find((c) => c.cid === action_detail.IntVal)!
          .animations.push("hologram");
      }
      break;
    case SeAttachCharacterShaderType.None:
    case SeAttachCharacterShaderType.Empty:
      {
        controller.layers.live2d.remove_effect(
          controller.live2d_get_costume(action_detail.IntVal)!,
          "hologram"
        );
        controller.current_costume.find(
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

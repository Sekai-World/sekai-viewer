import type { Live2DController } from "../Live2DController";
import type { Snippet } from "../../../types.d";
import { SnippetAction } from "../../../types.d";
import { CharacterLayoutType } from "../../../types.d";
import { log } from "../log";

export default async function action_motion(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.LayoutData[action.ReferenceIndex];
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
        await controller.apply_live2d_motion(
          controller.live2d_get_costume(action_detail.Character2dId)!,
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

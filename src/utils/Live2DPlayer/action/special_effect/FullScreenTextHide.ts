import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function FullScreenTextHide(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/FullScreenTextHide",
    action,
    action_detail
  );
  controller.layers.background.remove_blur();
  controller.layers.background.remove_filter();
  await controller.layers.fullscreen_text.hide(
    action_detail.Duration * 1000,
    true
  );
}

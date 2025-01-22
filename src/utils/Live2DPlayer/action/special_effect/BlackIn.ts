import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function BlackIn(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log("Live2DController", "SpecialEffect/BlackIn", action, action_detail);
  controller.layers.fullcolor.draw(0x000000);
  controller.layers.fullscreen_text.hide(100);
  await controller.layers.fullcolor.hide(action_detail.Duration * 1000, false);
}

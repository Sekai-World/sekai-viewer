import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function WhiteIn(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log("Live2DController", "SpecialEffect/WhiteIn", action, action_detail);
  controller.layers.fullcolor.draw(0xffffff);
  await controller.layers.fullcolor.hide(action_detail.Duration * 1000, true);
}

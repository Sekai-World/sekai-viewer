import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function SekaiOut(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log("Live2DController", "SpecialEffect/SekaiOut", action, action_detail);
  controller.layers.fullcolor.draw(0xffffff);
  controller.layers.fullcolor.show(action_detail.Duration * 1000, true);
  await controller.layers.sekai.draw(true, action_detail.Duration * 1000);
}

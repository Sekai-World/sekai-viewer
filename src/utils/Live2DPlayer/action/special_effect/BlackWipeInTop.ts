import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function BlackWipeInTop(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/BlackWipeInTop",
    action,
    action_detail
  );
  controller.layers.wipe.draw();
  await controller.layers.wipe.animate(
    false,
    "bottom",
    action_detail.Duration * 1000
  );
}

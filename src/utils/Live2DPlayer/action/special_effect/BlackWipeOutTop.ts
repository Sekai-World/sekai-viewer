import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function BlackWipeOutTop(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/BlackWipeOutTop",
    action,
    action_detail
  );
  controller.layers.wipe.draw();
  await controller.layers.wipe.animate(
    true,
    "top",
    action_detail.Duration * 1000
  );
}

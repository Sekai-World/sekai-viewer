import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function FlashbackIn(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/FlashbackIn",
    action,
    action_detail
  );
  controller.layers.flashback.draw();
  await controller.layers.flashback.show(100, true);
}

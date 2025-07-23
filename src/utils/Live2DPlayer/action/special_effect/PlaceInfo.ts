import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function PlaceInfo(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log("Live2DController", "SpecialEffect/PlaceInfo", action, action_detail);

  controller.layers.place_info.draw(action_detail.StringVal);
  await controller.layers.place_info.show(300);

  // Hide after 5 seconds
  setTimeout(() => {
    controller.layers.place_info.hide(200);
  }, 5000);
}

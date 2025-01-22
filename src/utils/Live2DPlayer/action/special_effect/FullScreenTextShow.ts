import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function FullScreenTextShow(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/FullScreenTextShow",
    action,
    action_detail
  );
  controller.layers.fullscreen_text_bg.draw(0x000000);
  await controller.layers.fullscreen_text_bg.show(
    action_detail.Duration * 1000,
    true
  );
}

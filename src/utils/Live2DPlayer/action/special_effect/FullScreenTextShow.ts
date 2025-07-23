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
  controller.layers.background.add_blur(6);

  // Add dark color filter to darken the background
  // This reduces brightness by 40% while maintaining color balance
  controller.layers.background.add_color_filter(
    [0.6, 0, 0, 0, 0], // Red channel: 60% of original
    [0, 0.6, 0, 0, 0], // Green channel: 60% of original
    [0, 0, 0.6, 0, 0], // Blue channel: 60% of original
    [0, 0, 0, 1, 0] // Alpha channel: unchanged
  );
}

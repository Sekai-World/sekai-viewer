import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function Blur(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log("Live2DController", "SpecialEffect/Blur", action, action_detail);

  // Check StringVal to determine blur or unblur
  const shouldBlur = action_detail.StringVal === "true";

  if (shouldBlur) {
    // Apply blur effect to the background
    controller.layers.background.add_blur(1.5);
  } else {
    // Remove blur effect from the background
    controller.layers.background.remove_blur();
  }
}

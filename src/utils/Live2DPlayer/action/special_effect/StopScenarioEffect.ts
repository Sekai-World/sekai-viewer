import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function StopScenarioEffect(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/StopScenarioEffect",
    action,
    action_detail
  );
  controller.layers.scene_effect.remove(action_detail.StringVal);
}

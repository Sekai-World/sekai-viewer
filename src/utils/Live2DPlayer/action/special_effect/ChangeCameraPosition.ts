import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function ChangeCameraPosition(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/ChangeCameraPosition",
    action,
    action_detail
  );
  const from = [...controller.camera.position];
  const to = [
    parseFloat(action_detail.StringVal.split(",")[0]) / 1920,
    parseFloat(action_detail.StringVal.split(",")[1]) / 1080,
  ];

  await controller.animate.progress_wrapper((progress) => {
    controller.camera.position[0] = from[0] + (to[0] - from[0]) * progress;
    controller.camera.position[1] = from[1] + (to[1] - from[1]) * progress;
    controller.set_style();
  }, action_detail.Duration * 1000);
}

import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function ChangeCameraZoomLevel(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/ChangeCameraZoomLevel",
    action,
    action_detail
  );
  const from = [...controller.camera.scale];
  const to = [
    parseFloat(action_detail.StringVal),
    parseFloat(action_detail.StringVal),
  ];
  controller.animate.progress_wrapper((progress) => {
    controller.camera.scale[0] = from[0] + (to[0] - from[0]) * progress;
    controller.camera.scale[1] = from[1] + (to[1] - from[1]) * progress;
    controller.set_style();
  }, action_detail.Duration * 1000);
}

import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";
import { ColorMatrixFilter } from "pixi.js";

export default async function AmbientColorEvening(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/AmbientColorEvening",
    action,
    action_detail
  );
  controller.layers.live2d.remove_filter();
  controller.layers.live2d.add_color_filter(
    [0.9, 0, 0, 0, 0],
    [0, 0.9, 0, 0, 0],
    [0, 0, 0.8, 0, 0],
    [0, 0, 0, 1, 0]
  );
  const filter = new ColorMatrixFilter();
  filter.saturate(-0.1);
  controller.layers.live2d.add_filter(filter);
}

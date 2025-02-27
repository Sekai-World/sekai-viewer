import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";
import { ColorMatrixFilter } from "pixi.js";

export default async function MemoryIn(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log("Live2DController", "SpecialEffect/MemoryIn", action, action_detail);
  const filter = new ColorMatrixFilter();
  filter.saturate(-0.5);
  const R = [0.8, 0, 0, 0, 0];
  const G = [0, 0.8, 0, 0, 0];
  const B = [0, 0, 0.5, 0, 0];
  const A = [0, 0, 0, 1, 0];
  controller.layers.live2d.remove_filter();
  controller.layers.live2d.add_filter(filter);
  controller.layers.live2d.add_color_filter(R, G, B, A);
  controller.layers.background.remove_filter();
  controller.layers.background.add_filter(filter);
  controller.layers.background.add_color_filter(R, G, B, A);
}

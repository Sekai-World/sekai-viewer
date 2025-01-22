import type { Live2DController } from "../../Live2DController";
import { Curve } from "../../animation/Curve";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";

export default async function ShakeWindow(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/ShakeWindow",
    action,
    action_detail
  );
  const time_ms = action_detail.Duration * 1000;
  const freq = 30;
  const amp = 0.01 * controller.stage_size[1];
  const curve_x = new Curve()
    .wiggle(Math.floor((time_ms / 1000) * freq))
    .map_range(-amp, amp);
  const curve_y = new Curve()
    .wiggle(Math.floor((time_ms / 1000) * freq))
    .map_range(-amp, amp);
  controller.layers.dialog.shake(curve_x, curve_y, time_ms);
}

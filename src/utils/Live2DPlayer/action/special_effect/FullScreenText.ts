import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { Live2DAssetType } from "../../types.d";
import { log } from "../../log";

export default async function FlashbackIn(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/FullScreenText",
    action,
    action_detail
  );
  const sound = controller.scenarioResource.find(
    (s) =>
      s.identifer === action_detail.StringValSub &&
      s.type === Live2DAssetType.Talk
  );
  if (sound) {
    controller.stop_sounds([Live2DAssetType.Talk]);
    const inst = sound.data as Howl;
    inst.volume(controller.settings.voice_volume);
    inst.play();
  } else
    log.warn(
      "Live2DController",
      `${action_detail.StringValSub} not loaded, skip.`
    );
  controller.layers.fullscreen_text.show(500);
  if (controller.settings.text_animation) {
    await controller.layers.fullscreen_text.animate(action_detail.StringVal);
  } else {
    await controller.layers.fullscreen_text.draw(action_detail.StringVal);
  }
}

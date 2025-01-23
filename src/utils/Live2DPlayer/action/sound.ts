import type { Live2DController } from "../Live2DController";
import type { Snippet } from "../../../types.d";
import { SoundPlayMode } from "../../../types.d";
import { Live2DAssetType } from "../types.d";
import { log } from "../log";

export default async function action_sound(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SoundData[action.ReferenceIndex];
  log.log("Live2DController", "Sound", action, action_detail);
  if (action_detail.Bgm) {
    if (action_detail.Bgm === "bgm00000") {
      Howler.stop();
    } else {
      const sound = controller.scenarioResource.find(
        (s) =>
          s.identifer === action_detail.Bgm &&
          s.type === Live2DAssetType.BackgroundMusic
      )?.data as Howl;
      sound.loop(true);
      controller.stop_sounds([Live2DAssetType.BackgroundMusic]);
      sound.volume(controller.settings.bgm_volume * action_detail.Volume);
      sound.play();
    }
  } else if (action_detail.Se) {
    const sound = controller.scenarioResource.find(
      (s) =>
        s.identifer === action_detail.Se &&
        s.type === Live2DAssetType.SoundEffect
    )?.data as Howl;
    const volume = controller.settings.se_volume * action_detail.Volume;
    if (sound) {
      switch (action_detail.PlayMode) {
        case SoundPlayMode.Stop:
          {
            sound.stop();
          }
          break;
        case SoundPlayMode.SpecialSePlay:
          {
            sound.loop(true);
            sound.volume(volume);
            sound.play();
          }
          break;
        case SoundPlayMode.CrossFade:
          {
            sound.loop(false);
            sound.volume(volume);
            sound.play();
          }
          break;
        case SoundPlayMode.Stack:
          {
            sound.loop(false);
            sound.volume(volume);
            sound.play();
          }
          break;
        default:
          log.warn(
            "Live2DController",
            `Sound/SoundPlayMode:${action_detail.PlayMode} not implemented!`,
            action
          );
      }
    } else
      log.warn("Live2DController", `${action_detail.Se} not loaded, skip.`);
  }
}

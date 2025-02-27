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
  // find sound asset
  let sound: Howl | null = null;
  let sound_type: "bgm" | "se" | null = null;
  if (action_detail.Bgm) {
    // find bgm asset
    if (action_detail.Bgm === "bgm00000") {
      // if bgm name is bgm00000, stop all bgm
      controller.scenarioResource
        .filter(
          (sound) =>
            sound.type === Live2DAssetType.BackgroundMusic &&
            (sound.data as Howl).playing()
        )
        .forEach((sound) => {
          const sound_instance = sound.data as Howl;
          sound_instance.fade(
            sound_instance.volume(),
            0,
            action_detail.Duration * 1000
          );
          sound_instance.once("fade", () => {
            sound_instance.stop();
          });
        });
    } else {
      // find bgm asset
      const sound_asset = controller.scenarioResource.find(
        (s) =>
          s.identifer === action_detail.Bgm &&
          s.type === Live2DAssetType.BackgroundMusic
      );
      if (sound_asset) {
        sound = sound_asset.data as Howl;
        sound_type = "bgm";
      } else {
        log.warn("Live2DController", `${action_detail.Bgm} not loaded, skip.`);
        return;
      }
    }
  } else if (action_detail.Se) {
    // find se asset
    const sound_asset = controller.scenarioResource.find(
      (s) =>
        s.identifer === action_detail.Se &&
        s.type === Live2DAssetType.SoundEffect
    );
    if (sound_asset) {
      sound = sound_asset.data as Howl;
      sound_type = "se";
    } else {
      log.warn("Live2DController", `${action_detail.Se} not loaded, skip.`);
      return;
    }
  }
  // different play mode
  const bgm_volume = controller.settings.bgm_volume * action_detail.Volume;
  const se_volume = controller.settings.se_volume * action_detail.Volume;
  switch (action_detail.PlayMode) {
    case SoundPlayMode.CrossFade:
      {
        if (sound) {
          if (sound_type === "bgm") {
            // bgm always loop
            controller.stop_sounds([Live2DAssetType.BackgroundMusic]);
            sound.loop(true);
            sound.fade(0, bgm_volume, action_detail.Duration * 1000);
            sound.play();
          } else if (sound_type === "se") {
            sound.loop(false);
            sound.fade(0, se_volume, action_detail.Duration * 1000);
            sound.play();
          }
        }
      }
      break;
    case SoundPlayMode.Stack:
      {
        if (sound) {
          sound.loop(false);
          sound.volume(bgm_volume);
          sound.play();
        }
      }
      break;
    case SoundPlayMode.LoopSe:
      {
        if (sound) {
          sound.loop(true);
          sound.fade(0, se_volume, action_detail.Duration * 1000);
          sound.play();
        }
      }
      break;
    case SoundPlayMode.StopSe:
      {
        if (sound) {
          sound.fade(sound.volume(), 0, action_detail.Duration * 1000);
          sound.once("fade", () => {
            sound.stop();
          });
        }
      }
      break;
    case SoundPlayMode.SetBgmVolume:
      {
        if (sound) {
          // fade to new volume
          sound.fade(sound.volume(), bgm_volume, action_detail.Duration * 1000);
        } else {
          // if no bgm asset, fade to new volume for all playing bgm
          controller.scenarioResource
            .filter(
              (sound) =>
                sound.type === Live2DAssetType.BackgroundMusic &&
                (sound.data as Howl).playing()
            )
            .forEach((sound) => {
              const sound_instance = sound.data as Howl;
              sound_instance.fade(
                sound_instance.volume(),
                bgm_volume,
                action_detail.Duration * 1000
              );
            });
        }
      }
      break;
    default:
      log.warn(
        "Live2DController",
        `Sound/SoundPlayMode:${action_detail.PlayMode} not implemented!`,
        action
      );
  }
}

import type { Live2DController } from "../Live2DController";
import type { Snippet } from "../../../types.d";
import { Live2DAssetType } from "../types.d";
import { log } from "../log";

export default async function action_talk(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail = controller.scenarioData.TalkData[action.ReferenceIndex];
  log.log("Live2DController", "Talk", action, action_detail);
  //clear
  await controller.layers.telop.hide(200);
  // show dialog
  let dialog;
  if (controller.settings.text_animation) {
    dialog = controller.layers.dialog.animate(
      action_detail.WindowDisplayName,
      action_detail.Body
    );
  } else {
    controller.layers.dialog.draw(
      action_detail.WindowDisplayName,
      action_detail.Body
    );
  }

  await controller.layers.dialog.show(200);
  // motion
  const motion = action_detail.Motions.map((m) => {
    controller.apply_live2d_motion(
      controller.live2d_get_costume(m.Character2dId)!,
      m.MotionName,
      m.FacialName
    );
  });
  // sound
  if (action_detail.Voices.length > 0) {
    controller.stop_sounds([Live2DAssetType.Talk]);
    const sound = controller.scenarioResource.find(
      (s) =>
        s.identifer === action_detail.Voices[0].VoiceId &&
        s.type === Live2DAssetType.Talk
    );
    if (sound) {
      const costume = controller.live2d_get_costume(
        action_detail.TalkCharacters[0].Character2dId
      );
      const volume =
        action_detail.Voices[0].Volume * controller.settings.voice_volume;
      if (costume) {
        controller.layers.live2d.speak(costume, sound.url, volume);
      } else {
        const inst = sound.data as Howl;
        inst.volume(volume);
        inst.play();
      }
    } else
      log.warn(
        "Live2DController",
        `${action_detail.Voices[0].VoiceId} not loaded, skip.`
      );
  }
  // wait motion and  text animation
  await Promise.all(motion);
  await dialog;
}

import type { Live2DController } from "../Live2DController";
import type { Snippet } from "../../../types.d";
import { Live2DAssetType } from "../types.d";
import { log } from "../log";
import { TranslationCache } from "../translation/TranslationCache";
import { rootStore } from "../../../stores/root";

export default async function action_talk(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail = controller.scenarioData.TalkData[action.ReferenceIndex];
  log.log("Live2DController", "Talk", action, action_detail);

  // Get translation settings directly from root store
  const translationSettings = {
    enableLlmTranslation: rootStore.settings.enableLlmTranslation,
    showOriginalText: rootStore.settings.showOriginalText,
  };

  // Prepare the text to display
  const originalText = action_detail.Body;
  let translatedText: string | null = null;

  // Get translation from cache if enabled
  if (translationSettings.enableLlmTranslation) {
    translatedText = TranslationCache.getTranslationByKey(
      `talk_${action.ReferenceIndex}`
    );
  }

  // Determine what to display based on settings
  let displayText = originalText;
  if (translatedText && !translationSettings.showOriginalText) {
    // Show only translated text if we have translation and don't want original
    displayText = translatedText;
    translatedText = null; // Don't show separate translation
  }
  // When showOriginalText is true and we have translation:
  // - displayText = original text (bottom, normal size)
  // - translatedText = translated text (above original, smaller, more transparent)

  //clear
  await controller.layers.telop.hide(200);
  // show dialog
  let dialog;
  if (controller.settings.text_animation) {
    dialog = controller.layers.dialog.animate(
      action_detail.WindowDisplayName,
      displayText,
      translatedText
    );
  } else {
    controller.layers.dialog.draw(
      action_detail.WindowDisplayName,
      displayText,
      translatedText
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
    } else {
      log.warn(
        "Live2DController",
        `${action_detail.Voices[0].VoiceId} not loaded, skip.`
      );
      controller.events.emit(
        "warn",
        `${action_detail.Voices[0].VoiceId} not loaded, skip.`
      );
    }
  }
  // wait motion and  text animation
  await Promise.all(motion);
  await dialog;
}

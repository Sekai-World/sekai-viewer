import type { Live2DController } from "../Live2DController";
import type { Snippet } from "../../../types.d";
import { Live2DAssetType } from "../types.d";
import { log } from "../log";
import { TranslationCache } from "../translation/translationCache";
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
    controller.layers.live2d.stop_speaking();
    controller.stop_sounds([Live2DAssetType.Talk]);
    const sound = controller.scenarioResource.audio.find(
      (s) =>
        s.identifier === action_detail.Voices[0].VoiceId &&
        s.type === Live2DAssetType.Talk
    );
    if (sound) {
      const costumes = action_detail.TalkCharacters.map((c) =>
        controller.live2d_get_costume(c.Character2dId)
      ).filter((i) => i !== undefined);
      const volume =
        action_detail.Voices[0].Volume * controller.settings.voice_volume;
      if (costumes.length > 0 && action_detail.LipSync == 1) {
        controller.layers.live2d.speak(costumes, sound.data, volume);
        log.log("Live2DController", "Talk/speak", costumes, sound.data);
      } else {
        const inst = sound.data;
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
  // wait motion and text animation
  await Promise.all(motion);
  await dialog;
}

import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { Live2DAssetType } from "../../types.d";
import { log } from "../../log";
import { TranslationCache } from "../../translation/translationCache";
import { rootStore } from "../../../../stores/root";

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
  const sound = controller.scenarioResource.audio.find(
    (s) =>
      s.identifier === action_detail.StringValSub &&
      s.type === Live2DAssetType.Talk
  );
  if (sound) {
    controller.stop_sounds([Live2DAssetType.Talk]);
    const inst = sound.data;
    inst.volume(controller.settings.voice_volume);
    inst.play();
  } else {
    log.warn(
      "Live2DController",
      `${action_detail.StringValSub} not loaded, skip.`
    );
    controller.events.emit(
      "warn",
      `${action_detail.StringValSub} not loaded, skip.`
    );
  }
  // Get translation settings and check for cached translation
  const translationSettings = {
    enableLlmTranslation: rootStore.settings.enableLlmTranslation,
    showOriginalText: rootStore.settings.showOriginalText,
  };

  // Prepare the text to display
  const originalText = action_detail.StringVal;
  let translatedText: string | null = null;

  // Get translation from cache if enabled
  if (translationSettings.enableLlmTranslation) {
    translatedText = TranslationCache.getTranslationByKey(
      `fullscreen_texts_${action.ReferenceIndex}`
    );
  }

  // Determine what to display based on settings
  let displayText = originalText;
  let translatedDisplayText: string | null = null;

  if (translatedText && !translationSettings.showOriginalText) {
    // Show only translated text if we have translation and don't want original
    displayText = translatedText;
    translatedDisplayText = null;
  } else if (translatedText && translationSettings.showOriginalText) {
    // Show both: translated text on top, original text below
    displayText = originalText; // Bottom text (original)
    translatedDisplayText = translatedText; // Top text (translated)
  }
  // When no translation or translation disabled: show only original text

  controller.layers.fullscreen_text.show(500);
  if (controller.settings.text_animation) {
    await controller.layers.fullscreen_text.animate(
      displayText,
      translatedDisplayText
    );
  } else {
    controller.layers.fullscreen_text.draw(displayText, translatedDisplayText);
  }
}

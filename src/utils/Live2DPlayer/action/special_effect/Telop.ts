import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { log } from "../../log";
import { TranslationCache } from "../../translation/TranslationCache";
import { rootStore } from "../../../../stores/root";

export default async function Telop(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log("Live2DController", "SpecialEffect/Telop", action, action_detail);

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
      `telop_${action.ReferenceIndex}`
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

  controller.layers.telop.draw(displayText, translatedDisplayText);

  //clear
  controller.layers.dialog.hide(200);

  await controller.layers.telop.show(300, true);
}

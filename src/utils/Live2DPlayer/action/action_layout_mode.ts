import type { Live2DController } from "../Live2DController";
import type { Snippet } from "../../../types.d";
import { CharacterLayoutMode } from "../../../types.d";
import { log } from "../log";

export default async function action_layout_mode(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.ScenarioSnippetCharacterLayoutModes[
      action.ReferenceIndex
    ];
  log.log("Live2DController", "CharacterLayoutMode", action, action_detail);
  switch (action_detail.CharacterLayoutMode) {
    case CharacterLayoutMode.Normal:
      controller.layers.live2d.layout_mode = "normal";
      break;
    case CharacterLayoutMode.ThreeModels:
      controller.layers.live2d.layout_mode = "three_models";
      break;
  }
}

import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { Live2DAssetType } from "../../types.d";
import { log } from "../../log";

export default async function ChangeBackground(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];
  log.log(
    "Live2DController",
    "SpecialEffect/ChangeBackground",
    action,
    action_detail
  );
  const bg = controller.scenarioResource.image.find(
    (s) =>
      s.identifier === action_detail.StringValSub &&
      s.type === Live2DAssetType.BackgroundImage
  );
  //clear
  controller.layers.dialog.hide(200);
  if (bg) controller.layers.background.draw(bg.data);
}

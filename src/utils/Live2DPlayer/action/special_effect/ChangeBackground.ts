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
  const data = controller.scenarioResource.find(
    (s) =>
      s.identifer === action_detail.StringValSub &&
      s.type === Live2DAssetType.BackgroundImage
  )?.data as HTMLImageElement;
  controller.layers.background.draw(data);
}

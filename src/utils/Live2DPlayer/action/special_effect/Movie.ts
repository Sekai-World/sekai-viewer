import type { Live2DController } from "../../Live2DController";
import type { Snippet } from "../../../../types.d";
import { Live2DAssetType } from "../../types.d";

export default async function Movie(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.SpecialEffectData[action.ReferenceIndex];

  // Get the movie resource from loaded assets
  const movieResource = controller.scenarioResource.find(
    (s) =>
      s.identifer === action_detail.StringVal &&
      s.type === Live2DAssetType.Video
  );

  if (movieResource && movieResource.data) {
    const videoElement = movieResource.data as HTMLVideoElement;

    try {
      await controller.layers.movie.draw(videoElement);

      // Wait for specified duration or video to end, whichever comes first
      const duration =
        action_detail.Duration > 0 ? action_detail.Duration * 1000 : undefined;
      await controller.layers.movie.waitForCompletion(duration);
    } catch (error) {
      controller.events.emit(
        "warn",
        `Failed to play movie ${action_detail.StringVal}: ${String(error)}`
      );
    } finally {
      // Always clear the movie layer, regardless of success or failure
      controller.layers.movie.clear();
    }
  } else {
    controller.events.emit(
      "warn",
      `${action_detail.StringVal} not loaded, skip.`
    );
  }
}

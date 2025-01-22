import type { Live2DController } from "../Live2DController";
import type { Snippet } from "../../../types.d";
import { SnippetAction } from "../../../types.d";
import { log } from "../log";

import action_talk from "./talk";
import action_sound from "./sound";
import action_motion from "./character_motion";
import action_layout from "./character_layout";
import action_se from "./special_effect";

export default async function single_action(
  controller: Live2DController,
  action: Snippet
) {
  switch (action.Action) {
    case SnippetAction.SpecialEffect:
      await action_se(controller, action);
      break;
    case SnippetAction.CharacterLayout:
      await action_layout(controller, action);
      break;
    case SnippetAction.CharacterMotion:
      await action_motion(controller, action);
      break;
    case SnippetAction.Talk:
      await action_talk(controller, action);
      break;
    case SnippetAction.Sound:
      await action_sound(controller, action);
      break;
    default:
      log.warn(
        "Live2DController",
        `${SnippetAction[action.Action]} not implemented!`,
        action
      );
  }
}

import type { Live2DController } from "../Live2DController";
import type { Snippet } from "../../../types.d";
import { SnippetAction } from "../../../types.d";
import {
  CharacterLayoutType,
  CharacterLayoutPosition,
  CharacterLayoutMoveSpeedType,
} from "../../../types.d";
import { log } from "../log";

function side_to_position(side: number, offset: number) {
  let position: [number, number] = [0.5, 0.5];
  switch (side) {
    case CharacterLayoutPosition.Center:
      position = [0.5, 0.5];
      break;
    case CharacterLayoutPosition.Left:
      position = [0.3, 0.5];
      break;
    case CharacterLayoutPosition.Right:
      position = [0.7, 0.5];
      break;
    case CharacterLayoutPosition.LeftEdge:
      position = [-0.5, 0.5];
      break;
    case CharacterLayoutPosition.RightEdge:
      position = [1.5, 0.5];
      break;
    case CharacterLayoutPosition.BottomEdge:
      position = [0.5, 1.5];
      break;
    case CharacterLayoutPosition.BottomLeftEdge:
      position = [0.3, 1.5];
      break;
    case CharacterLayoutPosition.BottomRightEdge:
      position = [0.7, 1.5];
      break;
    default:
      position = [0.5, 0.5];
  }
  position[0] += offset / 2000;
  return position;
}

function move_speed(t: CharacterLayoutMoveSpeedType) {
  switch (t) {
    case CharacterLayoutMoveSpeedType.Fast:
      return 300;
    case CharacterLayoutMoveSpeedType.Normal:
      return 500;
    case CharacterLayoutMoveSpeedType.Slow:
      return 700;
    default:
      return 300;
  }
}

export default async function action_layout(
  controller: Live2DController,
  action: Snippet
) {
  const action_detail =
    controller.scenarioData.LayoutData[action.ReferenceIndex];
  controller.layers.telop.hide(500);
  switch (action_detail.Type) {
    case CharacterLayoutType.Motion:
      {
        log.log(
          "Live2DController",
          "CharacterLayout/Motion",
          action,
          action_detail
        );
        const costume = controller.live2d_get_costume(
          action_detail.Character2dId
        )!;
        // Step 1: Apply motions and expressions.
        const motion = controller.apply_live2d_motion(
          costume,
          action_detail.MotionName,
          action_detail.FacialName
        );
        // (Same time) Move from current position to SideTo position or not move.
        const to = side_to_position(
          action_detail.SideTo,
          action_detail.SideToOffsetX
        );
        const move = controller.layers.live2d.move(
          costume,
          undefined,
          to,
          move_speed(action_detail.MoveSpeedType)
        );

        await move;
        await motion;
      }
      break;
    case CharacterLayoutType.Appear:
      {
        log.log(
          "Live2DController",
          "CharacterLayout/Appear",
          action,
          action_detail
        );
        // update CostumeType
        let costume = "";
        if (action_detail.CostumeType !== "") {
          costume = controller.live2d_set_costume(
            action_detail.Character2dId,
            action_detail.CostumeType
          );
        } else {
          costume = controller.live2d_get_costume(action_detail.Character2dId)!;
        }
        // Step 1: Apply motions and expressions. (To get the finish pose.)
        await controller.apply_live2d_motion(
          costume,
          action_detail.MotionName,
          action_detail.FacialName
        );
        // Step 2: Show. (after motion finished)
        const show = controller.layers.live2d.show_model(costume, 200);
        controller.live2d_set_appear(action_detail.Character2dId);
        // (Same time) Move from SideFrom position to SideTo position or at SideFrom position.
        const from = side_to_position(
          action_detail.SideFrom,
          action_detail.SideFromOffsetX
        );
        const to = side_to_position(
          action_detail.SideTo,
          action_detail.SideToOffsetX
        );
        let move;
        if (from[0] === to[0] && from[1] === to[1]) {
          controller.layers.live2d.set_position(costume, from);
        } else {
          move = controller.layers.live2d.move(
            costume,
            from,
            to,
            move_speed(action_detail.MoveSpeedType)
          );
        }
        // (Same time) Apply the same motions and expressions again.
        controller.animate
          .delay(10)
          .then(() =>
            controller.apply_live2d_motion(
              costume,
              action_detail.MotionName,
              action_detail.FacialName
            )
          );

        await show;
        await move;
        //await motion;
      }
      break;
    case CharacterLayoutType.Clear:
      {
        log.log(
          "Live2DController",
          "CharacterLayout/Clear",
          action,
          action_detail
        );
        const costume = controller.live2d_get_costume(
          action_detail.Character2dId
        )!;
        // Step 1: Move from SideFrom position to SideTo position or not move.
        const from = side_to_position(
          action_detail.SideFrom,
          action_detail.SideFromOffsetX
        );
        const to = side_to_position(
          action_detail.SideTo,
          action_detail.SideToOffsetX
        );
        if (!(from[0] === to[0] && from[1] === to[1])) {
          await controller.layers.live2d.move(
            costume,
            from,
            to,
            move_speed(action_detail.MoveSpeedType)
          );
        }
        // Step 2: Wait for the model exist at least 2 seconds.
        await controller.live2d_stay(action_detail.Character2dId, 2000);
        // Step 3: Hide.
        await controller.layers.live2d.hide_model(costume, 200);
      }
      break;
    default:
      log.warn(
        "Live2DController",
        `${SnippetAction[action.Action]}/${CharacterLayoutType[action_detail.Type]} not implemented!`,
        action,
        action_detail
      );
  }
}

import { SnippetAction } from "../../types.d";
import type { IScenarioData } from "../../types.d";

export interface ILive2DStoryMotion {
  costume: string;
  motion: string;
  type: "motion" | "expression";
}

export function gatherStoryMotion(
  scenarioData: IScenarioData
): ILive2DStoryMotion[] {
  const motionList: ILive2DStoryMotion[] = [];

  scenarioData.Snippets.forEach((snippet) => {
    switch (snippet.Action) {
      case SnippetAction.CharacterLayout:
      case SnippetAction.CharacterMotion: {
        const action = scenarioData.LayoutData[snippet.ReferenceIndex];
        if (action.CostumeType !== "") {
          if (action.MotionName !== "") {
            motionList.push({
              costume: action.CostumeType,
              motion: action.MotionName,
              type: "motion",
            });
          }
          if (action.FacialName !== "") {
            motionList.push({
              costume: action.CostumeType,
              motion: action.FacialName,
              type: "expression",
            });
          }
        } else {
          scenarioData.AppearCharacters.filter(
            (c) => c.Character2dId === action.Character2dId
          ).forEach((a) => {
            if (action.MotionName !== "") {
              motionList.push({
                costume: a.CostumeType,
                motion: action.MotionName,
                type: "motion",
              });
            }
            if (action.FacialName !== "") {
              motionList.push({
                costume: a.CostumeType,
                motion: action.FacialName,
                type: "expression",
              });
            }
          });
        }
        break;
      }
      case SnippetAction.Talk: {
        const action = scenarioData.TalkData[snippet.ReferenceIndex];
        action.Motions.forEach((motion) => {
          scenarioData.AppearCharacters.filter(
            (c) => c.Character2dId === motion.Character2dId
          ).forEach((a) => {
            if (motion.MotionName !== "") {
              motionList.push({
                costume: a.CostumeType,
                motion: motion.MotionName.replace(" ", ""),
                type: "motion",
              });
            }
            if (motion.FacialName !== "") {
              motionList.push({
                costume: a.CostumeType,
                motion: motion.FacialName.replace(" ", ""),
                type: "expression",
              });
            }
          });
        });
        break;
      }
    }
  });

  return motionList;
}

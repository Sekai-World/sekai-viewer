import type { IScenarioData } from "../../../types";
import { graphRAGStore } from "../storage";
import type { CharacterNode, GroupNode, TermNode } from "../types";

export async function extractCharacterNodes(
  scenariosData: IScenarioData[]
): Promise<CharacterNode[]> {
  await graphRAGStore.init();

  const dialogueTexts: string[] = [];
  for (const scenario of scenariosData) {
    for (const snippet of scenario.Snippets) {
      if (snippet.Action === 1 && snippet.ReferenceIndex >= 0) {
        const talkData = scenario.TalkData?.[snippet.ReferenceIndex];
        if (talkData) {
          dialogueTexts.push(
            `${talkData.WindowDisplayName || ""} ${talkData.Body || ""}`
          );
        }
      }
    }
  }
  const combinedDialogue = dialogueTexts.join(" ");

  const allCharacters = (await graphRAGStore.getNodesByType(
    "character"
  )) as CharacterNode[];
  return allCharacters.filter((character) =>
    character.originalTextVariants?.some(
      (variant) => variant && combinedDialogue.includes(variant)
    )
  );
}

export async function extractTermNodes(
  scenariosData: IScenarioData[]
): Promise<TermNode[]> {
  await graphRAGStore.init();

  const dialogueTexts: string[] = [];
  for (const scenario of scenariosData) {
    for (const snippet of scenario.Snippets) {
      if (snippet.Action === 1 && snippet.ReferenceIndex >= 0) {
        const talkData = scenario.TalkData?.[snippet.ReferenceIndex];
        if (talkData) dialogueTexts.push(talkData.Body || "");
      }
    }
  }
  const combinedDialogue = dialogueTexts.join(" ");

  const allTerms = (await graphRAGStore.getNodesByType("term")) as TermNode[];
  return allTerms.filter(
    (term) =>
      (term.originalName && combinedDialogue.includes(term.originalName)) ||
      term.originalTextVariants?.some(
        (variant) => variant && combinedDialogue.includes(variant)
      )
  );
}

export async function extractGroupNodes(
  scenariosData: IScenarioData[]
): Promise<GroupNode[]> {
  await graphRAGStore.init();

  const dialogueTexts: string[] = [];
  for (const scenario of scenariosData) {
    for (const snippet of scenario.Snippets) {
      if (snippet.Action === 1 && snippet.ReferenceIndex >= 0) {
        const talkData = scenario.TalkData?.[snippet.ReferenceIndex];
        if (talkData) dialogueTexts.push(talkData.Body || "");
      }
    }
  }
  const combinedDialogue = dialogueTexts.join(" ");

  const allGroups = (await graphRAGStore.getNodesByType(
    "group"
  )) as GroupNode[];
  return allGroups.filter(
    (group) =>
      (group.originalName && combinedDialogue.includes(group.originalName)) ||
      group.originalTextVariants?.some(
        (variant) => variant && combinedDialogue.includes(variant)
      )
  );
}

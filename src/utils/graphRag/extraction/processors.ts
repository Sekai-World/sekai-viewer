import { embeddingService } from "../embeddings";
import { graphRAGStore } from "../storage";
import {
  CharacterNode,
  EventNode,
  ExtractionOutput,
  FactNode,
  GroupNode,
  TermNode,
} from "../types";

export const mergeVariantTranslations = (
  existingTranslations: Record<string, string>,
  variants: string[],
  translatedNames: Record<string, string>,
  fallback: string
) => {
  for (const variant of variants) {
    const translation = translatedNames[variant];
    if (translation !== undefined) {
      existingTranslations[variant] = translation;
    } else if (
      !Object.prototype.hasOwnProperty.call(existingTranslations, variant)
    ) {
      existingTranslations[variant] = fallback;
    }
  }
};

export class ExtractionProcessor {
  constructor(
    private readonly targetLanguage: string,
    private readonly similarityThreshold: number
  ) {}

  async processCharacter(
    charData: ExtractionOutput["characters"][0]
  ): Promise<string> {
    let charNode = (await graphRAGStore.getNode(
      `char-${charData.identifier}`
    )) as CharacterNode | null;

    if (!charNode) {
      const originalTextVariants = charData.originalTextVariants || [];
      const originalName = originalTextVariants[0] || charData.name;
      charNode = {
        id: `char-${charData.identifier}`,
        type: "character",
        name: charData.name,
        identifier: charData.identifier,
        originalName,
        gender: charData.gender,
        group: charData.group,
        translatedNames: {},
        originalTextVariants,
      };
    } else {
      charNode.name = charData.name;
      charNode.gender = charData.gender;
      if (charData.group) charNode.group = charData.group;
      if (charData.originalTextVariants?.[0]) {
        charNode.originalName = charData.originalTextVariants[0];
      }
      if (charData.originalTextVariants?.length) {
        charNode.originalTextVariants = Array.from(
          new Set([
            ...(charNode.originalTextVariants || []),
            ...charData.originalTextVariants,
          ])
        );
      }
    }

    if (!charNode.translatedNames[this.targetLanguage]) {
      charNode.translatedNames[this.targetLanguage] = {};
    }
    mergeVariantTranslations(
      charNode.translatedNames[this.targetLanguage],
      charData.originalTextVariants,
      charData.translatedName,
      charData.name
    );
    await graphRAGStore.putNode(charNode);
    return charNode.id;
  }

  async processGroup(
    identifier: string,
    groupName: string,
    translatedName: Record<string, string>,
    originalTextVariants: string[]
  ): Promise<void> {
    let groupNode = (await graphRAGStore.getNode(
      `group-${identifier}`
    )) as GroupNode;
    if (!groupNode) {
      groupNode = {
        id: `group-${identifier}`,
        type: "group",
        name: groupName,
        identifier,
        originalName: originalTextVariants[0] || groupName,
        translatedNames: {},
        originalTextVariants: originalTextVariants || [],
      };
    } else if (originalTextVariants?.length) {
      groupNode.originalTextVariants = Array.from(
        new Set([
          ...(groupNode.originalTextVariants || []),
          ...originalTextVariants,
        ])
      );
      if (!groupNode.originalName) {
        groupNode.originalName = groupNode.originalTextVariants[0] || groupName;
      }
    }

    if (!groupNode.translatedNames[this.targetLanguage]) {
      groupNode.translatedNames[this.targetLanguage] = {};
    }
    mergeVariantTranslations(
      groupNode.translatedNames[this.targetLanguage],
      originalTextVariants,
      translatedName,
      groupName
    );
    await graphRAGStore.putNode(groupNode);
  }

  async processEvent(
    eventData: ExtractionOutput["events"][0],
    storyId: string
  ): Promise<string> {
    const embedding = await embeddingService.embed(eventData.description);
    let eventNode = (await graphRAGStore.getNode(
      `event-${eventData.identifier}`
    )) as EventNode | null;
    const episodeTag = `${storyId}_${(eventData.episodeId ?? 0).toString()}`;

    if (eventNode) {
      const similarity = embeddingService.cosineSimilarity(
        embedding,
        eventNode.embedding
      );
      if (similarity < this.similarityThreshold) {
        console.log(
          `⚠️  Event identifier conflict: "${eventData.identifier}" exists but low similarity (${similarity.toFixed(2)}). Creating numbered variant.`
        );
        let counter = 2;
        let numberedId = `event-${eventData.identifier}_${counter}`;
        while (await graphRAGStore.getNode(numberedId)) {
          counter++;
          numberedId = `event-${eventData.identifier}_${counter}`;
        }
        eventNode = null;
        eventData.identifier = `${eventData.identifier}_${counter}`;
      }
    }

    if (!eventNode) {
      eventNode = {
        id: `event-${eventData.identifier}`,
        type: "event",
        name: eventData.name,
        identifier: eventData.identifier,
        description: eventData.description,
        embedding,
        episodeTags: [episodeTag],
      };
    } else {
      eventNode.name = eventData.name;
      eventNode.description = eventData.description;
      eventNode.embedding = embedding;
      if (!eventNode.episodeTags.includes(episodeTag)) {
        eventNode.episodeTags = [...eventNode.episodeTags, episodeTag];
      }
    }
    await graphRAGStore.putNode(eventNode);
    return eventNode.id;
  }

  async processTerm(
    termData: ExtractionOutput["terms"][0],
    storyId: string
  ): Promise<string> {
    const embedding = await embeddingService.embed(termData.description);
    let termNode = (await graphRAGStore.getNode(
      `term-${termData.identifier}`
    )) as TermNode | null;
    const episodeTag = `${storyId}_${termData.episodeId.toString()}`;

    if (termNode) {
      const similarity = embeddingService.cosineSimilarity(
        embedding,
        termNode.embedding
      );
      if (similarity < this.similarityThreshold) {
        console.log(
          `⚠️  Term identifier conflict: "${termData.identifier}" exists but low similarity (${similarity.toFixed(2)}). Creating numbered variant.`
        );
        let counter = 2;
        let numberedId = `term-${termData.identifier}_${counter}`;
        while (await graphRAGStore.getNode(numberedId)) {
          counter++;
          numberedId = `term-${termData.identifier}_${counter}`;
        }
        termNode = null;
        termData.identifier = `${termData.identifier}_${counter}`;
      }
    }

    if (!termNode) {
      termNode = {
        id: `term-${termData.identifier}`,
        type: "term",
        name: termData.name,
        identifier: termData.identifier,
        originalName: termData.originalName,
        description: termData.description,
        translatedNames: {},
        originalTextVariants: termData.originalTextVariants || [],
        embedding,
        episodeTags: [episodeTag],
      };
    } else {
      termNode.name = termData.name;
      termNode.originalName = termData.originalName;
      termNode.description = termData.description;
      termNode.embedding = embedding;
      if (!termNode.episodeTags.includes(episodeTag)) {
        termNode.episodeTags = [...termNode.episodeTags, episodeTag];
      }
      if (termData.originalTextVariants?.length) {
        termNode.originalTextVariants = Array.from(
          new Set([
            ...(termNode.originalTextVariants || []),
            ...termData.originalTextVariants,
          ])
        );
      }
    }

    if (!termNode.translatedNames[this.targetLanguage]) {
      termNode.translatedNames[this.targetLanguage] = {};
    }
    mergeVariantTranslations(
      termNode.translatedNames[this.targetLanguage],
      termData.originalTextVariants,
      termData.translatedName,
      termData.name
    );
    await graphRAGStore.putNode(termNode);
    return termNode.id;
  }

  async processFact(
    factData: {
      identifier: string;
      statement: string;
      description: string;
      episodeId: number;
    },
    parentId: string,
    storyId: string
  ): Promise<string> {
    const embedding = await embeddingService.embed(
      `${factData.statement} ${factData.description}`
    );
    let factNode = (await graphRAGStore.getNode(
      `fact-${factData.identifier}`
    )) as FactNode | null;
    const episodeTag = `${storyId}_${factData.episodeId.toString()}`;

    if (factNode) {
      const similarity = embeddingService.cosineSimilarity(
        embedding,
        factNode.embedding
      );
      if (similarity < this.similarityThreshold) {
        console.log(
          `⚠️  Fact identifier conflict: "${factData.identifier}" exists but low similarity (${similarity.toFixed(2)}). Creating numbered variant.`
        );
        let counter = 2;
        let numberedId = `fact-${factData.identifier}_${counter}`;
        while (await graphRAGStore.getNode(numberedId)) {
          counter++;
          numberedId = `fact-${factData.identifier}_${counter}`;
        }
        factNode = null;
        factData.identifier = `${factData.identifier}_${counter}`;
      }
    }

    if (!factNode) {
      factNode = {
        id: `fact-${factData.identifier}`,
        type: "fact",
        statement: factData.statement,
        identifier: factData.identifier,
        description: factData.description,
        embedding,
        episodeTags: [episodeTag],
      };
    } else {
      factNode.statement = factData.statement;
      factNode.description = factData.description;
      factNode.embedding = embedding;
      if (!factNode.episodeTags.includes(episodeTag)) {
        factNode.episodeTags = [...factNode.episodeTags, episodeTag];
      }
    }
    await graphRAGStore.putNode(factNode);

    await graphRAGStore.upsertEdge(
      parentId,
      factNode.id,
      "FACT",
      episodeTag,
      "Fact about the entity",
      `${parentId}_fact_${factData.identifier}`
    );
    return factNode.id;
  }

  async processRelation(
    sourceId: string,
    relation: {
      identifier: string;
      target: { type: "character"; identifier: string };
      episodeId: number;
      context: string;
    },
    identifierToNodeId: Map<string, string>,
    storyId: string
  ): Promise<void> {
    const targetKey = `${relation.target.type}:${relation.target.identifier}`;
    const targetId = identifierToNodeId.get(targetKey);
    if (!targetId) {
      console.warn(
        `✗ Skipping relation: target not found - ${relation.target.type}:${relation.target.identifier}`
      );
      return;
    }
    await graphRAGStore.upsertEdge(
      sourceId,
      targetId,
      "CHARACTER_RELATION",
      `${storyId}_${relation.episodeId.toString()}`,
      relation.context,
      relation.identifier
    );
  }

  async processInvolvement(
    sourceId: string,
    involvement: {
      identifier: string;
      target: { type: "character" | "term" | "group"; identifier: string };
      episodeId: number;
      context: string;
    },
    identifierToNodeId: Map<string, string>,
    storyId: string
  ): Promise<void> {
    const targetKey = `${involvement.target.type}:${involvement.target.identifier}`;
    const targetId = identifierToNodeId.get(targetKey);
    if (!targetId) {
      console.warn(
        `✗ Skipping involvement: target not found - ${involvement.target.type}:${involvement.target.identifier}`
      );
      return;
    }
    await graphRAGStore.upsertEdge(
      sourceId,
      targetId,
      "INVOLVE",
      `${storyId}_${involvement.episodeId.toString()}`,
      involvement.context,
      involvement.identifier
    );
  }

  async processMembership(
    sourceId: string,
    member: {
      identifier: string;
      target: { type: "character"; identifier: string };
      episodeId: number;
      context: string;
    },
    identifierToNodeId: Map<string, string>,
    storyId: string
  ): Promise<void> {
    const targetKey = `${member.target.type}:${member.target.identifier}`;
    const targetId = identifierToNodeId.get(targetKey);
    if (!targetId) {
      console.warn(
        `✗ Skipping membership: target not found - ${member.target.type}:${member.target.identifier}`
      );
      return;
    }
    await graphRAGStore.upsertEdge(
      targetId,
      sourceId,
      "MEMBER_OF",
      `${storyId}_${member.episodeId.toString()}`,
      member.context,
      member.identifier
    );
  }

  async processRelated(
    sourceId: string,
    related: {
      identifier: string;
      target: { type: "character" | "group" | "term"; identifier: string };
      episodeId: number;
      context: string;
    },
    identifierToNodeId: Map<string, string>,
    storyId: string
  ): Promise<void> {
    const targetKey = `${related.target.type}:${related.target.identifier}`;
    const targetId = identifierToNodeId.get(targetKey);
    if (!targetId) {
      console.warn(
        `✗ Skipping related: target not found - ${related.target.type}:${related.target.identifier}`
      );
      return;
    }
    await graphRAGStore.upsertEdge(
      sourceId,
      targetId,
      "RELATED",
      `${storyId}_${related.episodeId.toString()}`,
      related.context,
      related.identifier
    );
  }
}

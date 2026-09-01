/**
 * Graph traversal and retrieval operations
 */

import { graphRAGStore } from "./storage";
import {
  GraphEdge,
  GraphNode,
  CharacterNode,
  GroupNode,
  EventNode,
  FactNode,
  RetrievedContext,
  EpisodeTag,
} from "./types";
import { IScenarioData } from "../../types";
import { embeddingService } from "./embeddings";
import { compareEpisodeTags } from "./helpers";
import {
  extractCharacterNodes,
  extractGroupNodes,
  extractTermNodes,
} from "./retrieval/exactMatch";
import {
  collectDirectCharacterRelations,
  collectTraversalEdges,
  edgeKeyFor,
} from "./retrieval/edges";
import { collectNodeStats, createEdgeScorer } from "./scoring/contextual";

/**
 * Retrieve graph context for characters in scenario data
 *
 * Returns:
 * - All characters that appear in the story
 * - All terms that appear in the story
 * - All groups whose members appear in the story
 * - Top edgesPerChar edges for each character, group, and term (INVOLVE and FACT edges)
 * - Top directCharacterRelations CHARACTER_RELATION edges where both characters
 *   appear in the story, ranked by scenario similarity
 * - All events that are referenced
 */
export async function retrieveContext(
  scenariosData: IScenarioData[],
  edgesPerChar: number = 10,
  embeddingModel?: string,
  maxDirectCharacterRelations: number = 10
): Promise<RetrievedContext> {
  await graphRAGStore.init();

  // Initialize embedding service with user's selected model
  if (embeddingModel) {
    await embeddingService.init({
      provider: "transformers",
      model: embeddingModel,
    });
  } else {
    await embeddingService.init();
  }

  const context: RetrievedContext = {
    characters: [],
    groups: [],
    events: [],
    terms: [],
    facts: [],
    edges: [],
  };

  // 1. Build scenario text and embedding for similarity ranking
  const scenarioTexts: string[] = [];
  for (const scenario of scenariosData) {
    for (const snippet of scenario.Snippets) {
      if (snippet.Action === 1 && snippet.ReferenceIndex >= 0) {
        const talkData = scenario.TalkData?.[snippet.ReferenceIndex];
        if (talkData && talkData.Body) {
          scenarioTexts.push(talkData.Body);
        }
      }
    }
  }
  const combinedScenarioText = scenarioTexts.join(" ");
  const scenarioEmbedding = await embeddingService.embed(combinedScenarioText);

  // 2. Extract character nodes from scenarios by matching text
  const characterNodes = await extractCharacterNodes(scenariosData);

  // Always return all matched characters
  context.characters = characterNodes;

  if (characterNodes.length === 0) {
    return context;
  }

  const characterIds = new Set(characterNodes.map((c) => c.id));

  // 3. Find exact term name matches in scenario text using extractTermNodes
  const matchedTerms = await extractTermNodes(scenariosData);
  context.terms = matchedTerms;
  const termIds = new Set(matchedTerms.map((t) => t.id));

  // 4. Find exact group name matches and groups whose members are in the story
  const matchedGroups = await extractGroupNodes(scenariosData);
  const allGroups = (await graphRAGStore.getNodesByType(
    "group"
  )) as GroupNode[];
  const groupIds = new Set(matchedGroups.map((group) => group.id));

  // Add groups whose members appear in the story
  for (const group of allGroups) {
    if (groupIds.has(group.id)) continue; // Already added

    // Check if any MEMBER_OF edge points to this group from our characters
    const memberEdges = await graphRAGStore.getEdgesByTarget(group.id);
    const hasMemberInStory = memberEdges.some(
      (edge) => edge.type === "MEMBER_OF" && characterIds.has(edge.sourceId)
    );

    if (hasMemberInStory) {
      matchedGroups.push(group);
      groupIds.add(group.id);
    }
  }
  context.groups = matchedGroups;

  // 5. Collect edges
  const collectedEdges: GraphEdge[] = [];
  const seenEdgeKeys = new Set<string>();
  const referencedEventIds = new Set<string>();
  const referencedFactIds = new Set<string>();

  // All matched node IDs for relevance scoring
  const matchedNodeIds = new Set<string>([
    ...characterIds,
    ...termIds,
    ...groupIds,
  ]);

  // --- First pass: gather per-node stats for cross-node normalisation ---
  // Exact-match seed nodes for relevance scoring and graph traversal.
  const allScoredNodeIds = [
    ...characterNodes.map((c) => c.id),
    ...matchedGroups.map((g) => g.id),
    ...matchedTerms.map((t) => t.id),
  ];

  const { nodeStatsMap, bounds } = await collectNodeStats(
    allScoredNodeIds,
    matchedNodeIds
  );

  const contextNodeIds = new Set(allScoredNodeIds);

  function addNodeToContext(node: GraphNode): void {
    if (contextNodeIds.has(node.id)) return;
    contextNodeIds.add(node.id);

    if (node.type === "character") {
      context.characters.push(node);
    } else if (node.type === "group") {
      context.groups.push(node);
    } else if (node.type === "term") {
      context.terms.push(node);
    } else if (node.type === "event") {
      referencedEventIds.add(node.id);
    } else if (node.type === "fact") {
      referencedFactIds.add(node.id);
    }
  }

  const { getEdgeSimilarity, scoreEdge } = createEdgeScorer(
    scenarioEmbedding,
    nodeStatsMap,
    bounds
  );

  // Traverse reachable paths, then retain the top-scored edges per seed node.
  await collectTraversalEdges(
    graphRAGStore,
    allScoredNodeIds,
    scoreEdge,
    edgesPerChar,
    addNodeToContext,
    seenEdgeKeys,
    collectedEdges
  );

  // 6. Keep the most scenario-relevant direct relationships between characters
  // present in the story. This cap is separate from graph traversal limits.
  await collectDirectCharacterRelations(
    graphRAGStore,
    characterIds,
    getEdgeSimilarity,
    maxDirectCharacterRelations,
    seenEdgeKeys,
    collectedEdges
  );

  // 7. Collect all MEMBER_OF edges for groups
  for (const group of matchedGroups) {
    const edges = await graphRAGStore.getEdgesByTarget(group.id);

    for (const edge of edges) {
      if (edge.type !== "MEMBER_OF") continue;
      if (!characterIds.has(edge.sourceId)) continue;

      const edgeKey = edgeKeyFor(edge);
      if (seenEdgeKeys.has(edgeKey)) continue;

      seenEdgeKeys.add(edgeKey);
      collectedEdges.push(edge);
    }
  }

  context.edges = collectedEdges;

  // 8. Collect all referenced events
  const events: EventNode[] = [];
  for (const eventId of referencedEventIds) {
    const event = (await graphRAGStore.getNode(eventId)) as EventNode;
    if (event) {
      events.push(event);
    }
  }
  context.events = events;

  // 9. Collect all referenced facts
  const facts: FactNode[] = [];
  for (const factId of referencedFactIds) {
    const fact = (await graphRAGStore.getNode(factId)) as FactNode;
    if (fact) {
      facts.push(fact);
    }
  }
  context.facts = facts;

  return context;
}

/**
 * Format retrieved context as markdown for injection into system prompt
 */
export function formatContextAsMarkdown(
  context: RetrievedContext,
  currentEpisodeTag?: EpisodeTag
): string {
  const getNodeDisplayName = (node: GraphNode, fallback: string): string =>
    node.type === "fact" ? node.statement : node.name || fallback;

  const formatTranslatedNames = (
    translatedNames: Record<string, Record<string, string>> | undefined
  ): string =>
    Object.entries(translatedNames || {})
      .map(([lang, variants]) => {
        const values = Object.entries(variants || {})
          .map(([variant, translation]) => `${variant} -> ${translation}`)
          .join("; ");
        return `${lang}: ${values}`;
      })
      .join(", ");

  const lines: string[] = [
    "STORY CONTEXT (derived from indexed past episodes):",
    "Important: Story tags beginning with `wl_` may depict imaginary, dream, or otherwise non-literal content. Do not treat them as confirmed main-timeline facts without supporting context.",
    "",
  ];

  // Build node ID to node lookup map
  const nodeMap = new Map<string, GraphNode>();
  for (const char of context.characters) {
    nodeMap.set(char.id, char);
  }
  for (const group of context.groups) {
    nodeMap.set(group.id, group);
  }
  for (const event of context.events) {
    nodeMap.set(event.id, event);
  }
  for (const term of context.terms) {
    nodeMap.set(term.id, term);
  }
  if (context.facts) {
    for (const fact of context.facts) {
      nodeMap.set(fact.id, fact);
    }
  }

  // Helper to classify fact edges as past/future
  const classifyFact = (factId: string): "past" | "future" | "unknown" => {
    if (!currentEpisodeTag) return "past"; // Default to past if no current episode

    const factNode = nodeMap.get(factId) as FactNode;
    if (
      !factNode ||
      !factNode.episodeTags ||
      factNode.episodeTags.length === 0
    ) {
      return "unknown";
    }

    const cmp = compareEpisodeTags(factNode.episodeTags[0], currentEpisodeTag);
    if (cmp < 0) return "past";
    if (cmp > 0) return "future";
    return "past"; // Current counts as past
  };

  // 1. CHARACTERS with their facts
  if (context.characters.length > 0) {
    lines.push("## CHARACTERS:");
    for (const char of context.characters) {
      lines.push(`\n### ${char.name}`);
      if (char.identifier) {
        lines.push(`- **Identifier**: ${char.identifier}`);
      }
      lines.push(`- **English Name**: ${char.name}`);

      // Translated names
      const translatedNamesStr = formatTranslatedNames(char.translatedNames);
      if (translatedNamesStr) {
        lines.push(`- **Translated Names**: ${translatedNamesStr}`);
      }

      lines.push(`- **Gender**: ${char.gender}`);

      if (char.group) {
        lines.push(`- **Group**: ${char.group}`);
      }

      // Original text variants
      if (char.originalTextVariants && char.originalTextVariants.length > 0) {
        lines.push(
          `- **Original Text Variants**: ${char.originalTextVariants.join(", ")}`
        );
      }

      // Character facts (past and future)
      const factEdges = context.edges.filter(
        (e) => e.sourceId === char.id && e.type === "FACT"
      );

      const pastFacts = factEdges.filter(
        (e) => classifyFact(e.targetId) === "past"
      );
      const futureFacts = factEdges.filter(
        (e) => classifyFact(e.targetId) === "future"
      );

      if (pastFacts.length > 0) {
        lines.push("- **Past Facts:**");
        for (const edge of pastFacts) {
          const fact = nodeMap.get(edge.targetId) as FactNode;
          if (fact) {
            lines.push(`  - ${fact.statement}`);
            if (fact.description) {
              lines.push(`    ${fact.description}`);
            }
          }
        }
      }

      if (futureFacts.length > 0) {
        lines.push("- **Future Facts:**");
        for (const edge of futureFacts) {
          const fact = nodeMap.get(edge.targetId) as FactNode;
          if (fact) {
            lines.push(`  - ${fact.statement}`);
            if (fact.description) {
              lines.push(`    ${fact.description}`);
            }
          }
        }
      }
    }
    lines.push("");
  }

  // 2. GROUPS
  if (context.groups.length > 0) {
    lines.push("## GROUPS:");
    for (const group of context.groups) {
      lines.push(`\n### ${group.name}`);
      lines.push(`- **English Name**: ${group.name}`);

      // Translated names
      const translatedNamesStr = formatTranslatedNames(group.translatedNames);
      if (translatedNamesStr) {
        lines.push(`- **Translated Names**: ${translatedNamesStr}`);
      }

      // Find members
      const memberEdges = context.edges.filter(
        (e) => e.targetId === group.id && e.type === "MEMBER_OF"
      );

      if (memberEdges.length > 0) {
        lines.push("- **Members:**");
        for (const edge of memberEdges) {
          const member = nodeMap.get(edge.sourceId) as CharacterNode;
          if (member) {
            lines.push(`  - ${member.name}`);
            if (edge.context) {
              lines.push(`    Role: ${edge.context}`);
            }
          }
        }
      }

      const factEdges = context.edges.filter(
        (e) => e.sourceId === group.id && e.type === "FACT"
      );
      if (factEdges.length > 0) {
        lines.push("- **Facts:**");
        for (const edge of factEdges) {
          const fact = nodeMap.get(edge.targetId) as FactNode;
          if (fact) {
            lines.push("  - " + fact.statement);
            if (fact.description) {
              lines.push("    " + fact.description);
            }
          }
        }
      }
    }
    lines.push("");
  }

  // 3. TERMS with their facts
  if (context.terms.length > 0) {
    lines.push("## TERMS:");
    for (const term of context.terms) {
      lines.push(`\n### ${term.name}`);
      if (term.identifier) {
        lines.push(`- **Identifier**: ${term.identifier}`);
      }
      lines.push(`- **English Name**: ${term.name}`);

      if (term.originalName) {
        lines.push(`- **Original Name**: ${term.originalName}`);
      }

      // Translated names
      const translatedNamesStr = formatTranslatedNames(term.translatedNames);
      if (translatedNamesStr) {
        lines.push(`- **Translated Names**: ${translatedNamesStr}`);
      }

      lines.push(`- **Description**: ${term.description}`);

      // Term related edges (to characters/groups/terms)
      const relatedEdges = context.edges.filter(
        (e) => e.sourceId === term.id && e.type === "RELATED"
      );

      if (relatedEdges.length > 0) {
        lines.push("- **Related:**");
        for (const edge of relatedEdges) {
          const target = nodeMap.get(edge.targetId);
          if (target) {
            const targetName = getNodeDisplayName(target, edge.targetId);
            lines.push(`  - ${targetName} (${target.type}): ${edge.context}`);
          }
        }
      }

      // Term facts (past and future)
      const factEdges = context.edges.filter(
        (e) => e.sourceId === term.id && e.type === "FACT"
      );

      const pastFacts = factEdges.filter(
        (e) => classifyFact(e.targetId) === "past"
      );
      const futureFacts = factEdges.filter(
        (e) => classifyFact(e.targetId) === "future"
      );

      if (pastFacts.length > 0) {
        lines.push("- **Past Facts:**");
        for (const edge of pastFacts) {
          const fact = nodeMap.get(edge.targetId) as FactNode;
          if (fact) {
            lines.push(`  - ${fact.statement}`);
            if (fact.description) {
              lines.push(`    ${fact.description}`);
            }
          }
        }
      }

      if (futureFacts.length > 0) {
        lines.push("- **Future Facts:**");
        for (const edge of futureFacts) {
          const fact = nodeMap.get(edge.targetId) as FactNode;
          if (fact) {
            lines.push(`  - ${fact.statement}`);
            if (fact.description) {
              lines.push(`    ${fact.description}`);
            }
          }
        }
      }
    }
    lines.push("");
  }

  // 4. EVENTS with their facts
  if (context.events.length > 0) {
    lines.push("## EVENTS:");
    for (const event of context.events) {
      lines.push(`\n### ${event.name}`);
      if (event.identifier) {
        lines.push(`- **Identifier**: ${event.identifier}`);
      }
      lines.push(`- **Name**: ${event.name}`);
      lines.push(`- **Description**: ${event.description}`);

      // Episode tags
      if (event.episodeTags && event.episodeTags.length > 0) {
        lines.push(`- **Episodes**: ${event.episodeTags.join(", ")}`);
      }

      // Event facts (past and future)
      const factEdges = context.edges.filter(
        (e) => e.sourceId === event.id && e.type === "FACT"
      );

      const pastFacts = factEdges.filter(
        (e) => classifyFact(e.targetId) === "past"
      );
      const futureFacts = factEdges.filter(
        (e) => classifyFact(e.targetId) === "future"
      );

      if (pastFacts.length > 0) {
        lines.push("- **Past Facts:**");
        for (const edge of pastFacts) {
          const fact = nodeMap.get(edge.targetId) as FactNode;
          if (fact) {
            lines.push(`  - ${fact.statement}`);
            if (fact.description) {
              lines.push(`    ${fact.description}`);
            }
          }
        }
      }

      if (futureFacts.length > 0) {
        lines.push("- **Future Facts:**");
        for (const edge of futureFacts) {
          const fact = nodeMap.get(edge.targetId) as FactNode;
          if (fact) {
            lines.push(`  - ${fact.statement}`);
            if (fact.description) {
              lines.push(`    ${fact.description}`);
            }
          }
        }
      }
    }
    lines.push("");
  }

  // 5. RELATIONS AND INVOLVEMENTS (chronologically mixed)
  // Collect CHARACTER_RELATION and INVOLVE edges
  const relationEdges = context.edges.filter(
    (e) => e.type === "CHARACTER_RELATION" || e.type === "INVOLVE"
  );

  if (relationEdges.length > 0) {
    // Classify as past/future
    type ClassifiedEdge = {
      edge: GraphEdge;
      time: "past" | "future";
      episodeTag: EpisodeTag;
    };

    const classifiedEdges: ClassifiedEdge[] = [];

    for (const edge of relationEdges) {
      if (!edge.episodeTags || edge.episodeTags.length === 0) continue;

      const episodeTag = edge.episodeTags[0];
      let time: "past" | "future" = "past";

      if (currentEpisodeTag) {
        const cmp = compareEpisodeTags(episodeTag, currentEpisodeTag);
        time = cmp <= 0 ? "past" : "future";
      }

      classifiedEdges.push({ edge, time, episodeTag });
    }

    // Sort chronologically
    classifiedEdges.sort((a, b) =>
      compareEpisodeTags(a.episodeTag, b.episodeTag)
    );

    const pastEdges = classifiedEdges.filter((e) => e.time === "past");
    const futureEdges = classifiedEdges.filter((e) => e.time === "future");

    // Format past relations/involvements
    if (pastEdges.length > 0) {
      lines.push("## PAST RELATIONS & INVOLVEMENTS:");
      lines.push("(In chronological order)");
      lines.push("");

      for (const { edge, episodeTag } of pastEdges) {
        const source = nodeMap.get(edge.sourceId);
        const target = nodeMap.get(edge.targetId);

        if (!source || !target) continue;

        const sourceName = getNodeDisplayName(source, edge.sourceId);
        const targetName = getNodeDisplayName(target, edge.targetId);

        lines.push(`- **[${edge.type}]** ${sourceName} → ${targetName}`);
        if (edge.context) {
          lines.push(`  ${edge.context}`);
        }
        lines.push(`  Episode: ${episodeTag}`);
        lines.push("");
      }
    }

    // Format future relations/involvements
    if (futureEdges.length > 0) {
      lines.push("## FUTURE RELATIONS & INVOLVEMENTS:");
      lines.push("(In chronological order)");
      lines.push("");

      for (const { edge, episodeTag } of futureEdges) {
        const source = nodeMap.get(edge.sourceId);
        const target = nodeMap.get(edge.targetId);

        if (!source || !target) continue;

        const sourceName = getNodeDisplayName(source, edge.sourceId);
        const targetName = getNodeDisplayName(target, edge.targetId);

        lines.push(`- **[${edge.type}]** ${sourceName} → ${targetName}`);
        if (edge.context) {
          lines.push(`  ${edge.context}`);
        }
        lines.push(`  Episode: ${episodeTag}`);
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

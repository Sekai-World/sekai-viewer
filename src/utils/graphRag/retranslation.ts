import { LlmProviderClient, ILlmApiConfig } from "../llmClient";
import { graphRAGStore } from "./storage";
import { CharacterNode, GroupNode, TermNode } from "./types";

const RETRANSLATION_BATCH_SIZE = 50;

type RetranslatableNode = CharacterNode | GroupNode | TermNode;

export interface GraphRAGRetranslationProgress {
  current: number;
  total: number;
}

export interface GraphRAGRetranslationResult {
  totalNodes: number;
  translatedNodes: number;
  translatedVariants: number;
}

interface TranslationResult {
  nodeId: string;
  translations: Array<{
    variant: string;
    translation: string;
  }>;
}

interface TranslationResponse {
  translations: TranslationResult[];
}

type TranslationMap = Record<string, Record<string, string>>;

const translationSchema = {
  type: "object",
  properties: {
    translations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nodeId: { type: "string" },
          translations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                variant: { type: "string" },
                translation: { type: "string" },
              },
              required: ["variant", "translation"],
              additionalProperties: false,
            },
          },
        },
        required: ["nodeId", "translations"],
        additionalProperties: false,
      },
    },
  },
  required: ["translations"],
  additionalProperties: false,
};

const getVariants = (node: RetranslatableNode): string[] =>
  Array.from(
    new Set(
      [node.originalName, ...node.originalTextVariants]
        .map((variant) => variant?.trim())
        .filter((variant): variant is string => Boolean(variant))
    )
  );

const parseResponse = (raw: string): TranslationResponse => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) {
      throw new Error("The translation provider returned invalid JSON.");
    }
    parsed = JSON.parse(raw.slice(start, end + 1));
  }

  const responseObject = parsed as {
    translations?: unknown;
    entities?: unknown;
  };
  const translations = responseObject?.translations;
  if (!translations || typeof translations !== "object") {
    if (Array.isArray(responseObject?.entities)) {
      throw new Error(
        "The translation provider returned the input entities instead of translations. " +
          "This model or endpoint may not support the requested structured output."
      );
    }
    throw new Error("The translation provider returned no translations.");
  }

  if (Array.isArray(translations)) {
    return { translations: translations as TranslationResult[] };
  }

  // Some providers return a compact map:
  // { translations: { nodeId: { originalVariant: translatedVariant } } }
  const normalized = Object.entries(translations as TranslationMap).map(
    ([nodeId, variants]) => ({
      nodeId,
      translations: Object.entries(variants ?? {}).map(
        ([variant, translation]) => ({ variant, translation })
      ),
    })
  );
  return { translations: normalized };
};

const buildSystemPrompt = (targetLanguage: string): string =>
  `You translate Project Sekai: Colorful Stage entity names into ${targetLanguage}.
Translate every supplied original-language variant for the same entity consistently.
Use the entity's pivot name as context, preserve official names where known, and do not translate identifiers.
Return only JSON matching the requested schema. Do not echo the input entities and do not return an entities array.
The only top-level key is \"translations\", whose value is an array of objects with this shape:
{\"nodeId\":\"...\",\"translations\":[{\"variant\":\"exact input variant\",\"translation\":\"translated text\"}]}.
Every supplied variant should have one translation using the exact variant string from the input.

Example input entity:
{\"nodeId\":\"char-ichika\",\"type\":\"character\",\"name\":\"Ichika Hoshino\",\"variants\":[\"星乃一歌\",\"いちか\"]}

Example valid response:
{\"translations\":[{\"nodeId\":\"char-ichika\",\"translations\":[{\"variant\":\"星乃一歌\",\"translation\":\"星乃一歌\"},{\"variant\":\"いちか\",\"translation\":\"一歌\"}]}]}

Invalid response (do not return this):
{\"entities\":[{\"nodeId\":\"char-ichika\",\"type\":\"character\",\"name\":\"...\",\"variants\":[\"...\"]}]}`;

const buildUserPrompt = (nodes: RetranslatableNode[]): string =>
  JSON.stringify(
    {
      entities: nodes.map((node) => ({
        nodeId: node.id,
        type: node.type,
        name: node.name,
        variants: getVariants(node),
      })),
    },
    null,
    2
  );

/** Re-translate all character, group, and terminology variants in the graph. */
export async function retranslateGraphNames(
  config: ILlmApiConfig,
  targetLanguage: string,
  onProgress?: (progress: GraphRAGRetranslationProgress) => void
): Promise<GraphRAGRetranslationResult> {
  await graphRAGStore.init();
  const [characters, groups, terms] = await Promise.all([
    graphRAGStore.getNodesByType("character"),
    graphRAGStore.getNodesByType("group"),
    graphRAGStore.getNodesByType("term"),
  ]);
  const nodes = [...characters, ...groups, ...terms] as RetranslatableNode[];
  const total = nodes.length;
  let translatedNodes = 0;
  let translatedVariants = 0;
  const client = new LlmProviderClient(config);

  onProgress?.({ current: 0, total });
  for (let start = 0; start < nodes.length; start += RETRANSLATION_BATCH_SIZE) {
    const batch = nodes.slice(start, start + RETRANSLATION_BATCH_SIZE);
    const response = parseResponse(
      await client.callWithStructuredOutput(
        buildSystemPrompt(targetLanguage),
        buildUserPrompt(batch),
        translationSchema,
        "translate_graph_names"
      )
    );
    const nodesById = new Map(batch.map((node) => [node.id, node]));

    for (const result of response.translations) {
      if (!result || typeof result !== "object") continue;
      const node = nodesById.get(result.nodeId);
      if (!node || !Array.isArray(result.translations)) continue;

      const allowedVariants = new Set(getVariants(node));
      const nextTranslations = {
        ...(node.translatedNames[targetLanguage] ?? {}),
      };
      let nodeTranslatedVariants = 0;
      for (const item of result.translations) {
        const variant = item?.variant?.trim();
        const translation = item?.translation?.trim();
        if (!variant || !translation || !allowedVariants.has(variant)) continue;
        nextTranslations[variant] = translation;
        nodeTranslatedVariants++;
      }

      if (nodeTranslatedVariants > 0) {
        node.translatedNames = {
          ...node.translatedNames,
          [targetLanguage]: nextTranslations,
        };
        await graphRAGStore.putNode(node);
        translatedNodes++;
        translatedVariants += nodeTranslatedVariants;
      }
    }

    onProgress?.({
      current: Math.min(start + batch.length, total),
      total,
    });
  }

  return { totalNodes: total, translatedNodes, translatedVariants };
}

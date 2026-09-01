import type { GraphNode } from "./types";

export interface TranslatedNameDraft {
  language: string;
  originalText: string;
  translation: string;
}

export interface NodeEditDraft {
  name?: string;
  originalName?: string;
  description?: string;
  statement?: string;
  gender?: string;
  group?: string;
  originalTextVariants?: string[];
  translatedNames?: TranslatedNameDraft[];
}

const requiredText = (value: string | undefined, label: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(label + " is required.");
  return trimmed;
};

const createTranslatedNameDrafts = (
  translatedNames: Record<string, Record<string, string>>
): TranslatedNameDraft[] =>
  Object.entries(translatedNames).flatMap(([language, variants]) =>
    Object.entries(variants).map(([originalText, translation]) => ({
      language,
      originalText,
      translation,
    }))
  );

const normalizeOriginalTextVariants = (
  variants: string[] | undefined
): string[] => [
  ...new Set((variants ?? []).map((variant) => variant.trim()).filter(Boolean)),
];

const normalizeTranslatedNames = (
  entries: TranslatedNameDraft[] | undefined
): Record<string, Record<string, string>> => {
  const translatedNames: Record<string, Record<string, string>> = {};

  for (const entry of entries ?? []) {
    const language = entry.language.trim();
    const originalText = entry.originalText.trim();
    const translation = entry.translation.trim();
    const isCompletelyEmpty = !language && !originalText && !translation;
    if (isCompletelyEmpty) continue;
    if (!language || !originalText || !translation) {
      throw new Error(
        "Each translated name needs a language, original text, and translation."
      );
    }
    translatedNames[language] ??= {};
    translatedNames[language][originalText] = translation;
  }

  return translatedNames;
};

export const createNodeEditDraft = (node: GraphNode): NodeEditDraft => {
  switch (node.type) {
    case "character":
      return {
        name: node.name,
        originalName: node.originalName,
        gender: node.gender,
        group: node.group ?? "",
        originalTextVariants: [...node.originalTextVariants],
        translatedNames: createTranslatedNameDrafts(node.translatedNames),
      };
    case "group":
      return {
        name: node.name,
        originalName: node.originalName,
        originalTextVariants: [...node.originalTextVariants],
        translatedNames: createTranslatedNameDrafts(node.translatedNames),
      };
    case "event":
      return { name: node.name, description: node.description };
    case "term":
      return {
        name: node.name,
        originalName: node.originalName,
        description: node.description,
        originalTextVariants: [...node.originalTextVariants],
        translatedNames: createTranslatedNameDrafts(node.translatedNames),
      };
    case "fact":
      return { statement: node.statement, description: node.description };
  }
};

/** Apply editable fields while preserving a node's identity and graph metadata. */
export const applyNodeEdit = (
  node: GraphNode,
  draft: NodeEditDraft
): GraphNode => {
  switch (node.type) {
    case "character": {
      const group = draft.group?.trim();
      return {
        ...node,
        name: requiredText(draft.name, "Name"),
        originalName: requiredText(draft.originalName, "Original name"),
        gender: requiredText(draft.gender, "Gender"),
        ...(group ? { group } : { group: undefined }),
        originalTextVariants: normalizeOriginalTextVariants(
          draft.originalTextVariants
        ),
        translatedNames: normalizeTranslatedNames(draft.translatedNames),
      };
    }
    case "group":
      return {
        ...node,
        name: requiredText(draft.name, "Name"),
        originalName: requiredText(draft.originalName, "Original name"),
        originalTextVariants: normalizeOriginalTextVariants(
          draft.originalTextVariants
        ),
        translatedNames: normalizeTranslatedNames(draft.translatedNames),
      };
    case "event":
      return {
        ...node,
        name: requiredText(draft.name, "Name"),
        description: requiredText(draft.description, "Description"),
      };
    case "term":
      return {
        ...node,
        name: requiredText(draft.name, "Name"),
        originalName: requiredText(draft.originalName, "Original name"),
        description: requiredText(draft.description, "Description"),
      };
    case "fact":
      return {
        ...node,
        statement: requiredText(draft.statement, "Statement"),
        description: requiredText(draft.description, "Description"),
      };
  }
};

/** Returns the text whose vector must be refreshed after an editable change. */
export const getNodeEditEmbeddingText = (node: GraphNode): string | null => {
  switch (node.type) {
    case "event":
    case "term":
      return node.description;
    case "fact":
      return node.statement + " " + node.description;
    default:
      return null;
  }
};
